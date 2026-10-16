import { decidirUnificacao, type ContatoGhl, type DecisaoContato } from '@/lib/contato-unificado';

const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

// Pipeline IDs
// FIX (10/ago/2026): o pipeline antigo 'd232xPcFo2xoOVEH79C1' foi APAGADO no
// GHL — opportunities do /anunciar falhavam com "Pipeline not found". O funil
// vivo é "Recebidos para Anuncio" (mesmos IDs usados pelo painel).
const PIPELINE_PRE_VENDA = 'Vsw7I2qUOYB2B98CpEmq';
const STAGE_ENTRADA = '05d65a3d-4215-400b-b2f3-339985b408a6';

// Custom Objects
const CUSTOM_OBJECT_KEY = 'custom_objects.imoveis';
interface GHLHeaders {
  [key: string]: string;
}

function getHeaders(): GHLHeaders {
  return {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

/**
 * Telefone brasileiro em E.164 (mesma regra do painel): "12981031077" →
 * "+5512981031077". Sem isso a busca por telefone do GHL não acha o
 * contato que o painel gravou já em E.164.
 */
function toE164BR(phone: string | undefined): string | undefined {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return phone;
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  if (digits.length > 11) return `+${digits}`;
  return digits;
}

function nomeParaGhl(name: string): { firstName: string; lastName: string; name: string } {
  const nameParts = name.trim().split(/\s+/);
  return { firstName: nameParts[0] ?? '', lastName: nameParts.slice(1).join(' ') || '', name };
}

function customFieldsParaGhl(cfs?: { key: string; value: string }[]) {
  return (cfs ?? []).map(cf => ({ id: cf.key, field_value: cf.value }));
}

/** Contato existente por e-mail ou telefone; ok=false se a busca falhou. */
async function buscarContatoDuplicado(
  campo: 'email' | 'number',
  valor: string
): Promise<{ ok: boolean; contato: ContatoGhl | null }> {
  try {
    const qs = new URLSearchParams({ locationId: GHL_LOCATION_ID, [campo]: valor });
    const response = await fetch(`${GHL_BASE_URL}/contacts/search/duplicate?${qs}`, { headers: getHeaders() });
    if (!response.ok) {
      console.error(`GHL buscarContatoDuplicado(${campo}) error:`, response.status, (await response.text()).slice(0, 300));
      return { ok: false, contato: null };
    }
    const c = (await response.json())?.contact;
    if (!c?.id) return { ok: true, contato: null };
    const nome = c.contactName ?? c.name ?? [c.firstName, c.lastName].filter(Boolean).join(' ');
    return { ok: true, contato: { id: c.id, name: nome || null, email: c.email ?? null, phone: c.phone ?? null } };
  } catch (error) {
    console.error(`GHL buscarContatoDuplicado(${campo}) exception:`, error);
    return { ok: false, contato: null };
  }
}

/**
 * Cria ou atualiza contato no GHL.
 *
 * Procura antes pelo e-mail e pelo telefone (lib/contato-unificado.ts, mesma
 * regra do painel): mesma pessoa com dado novo atualiza o contato existente,
 * com nota do dado anterior; e-mail de um contato e telefone de outro ficam
 * no do e-mail, com nota de possível duplicado nos dois. Sem contato
 * existente, ou se a busca falhar, segue no /contacts/upsert de sempre.
 */
export async function createOrUpdateContact(data: {
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: { key: string; value: string }[];
}): Promise<{ id: string } | null> {
  const email = data.email?.trim() || undefined;
  const phone = toE164BR(data.phone?.trim() || undefined);

  if (email || phone) {
    const [porEmail, porTelefone] = await Promise.all([
      email ? buscarContatoDuplicado('email', email) : Promise.resolve({ ok: true, contato: null }),
      phone ? buscarContatoDuplicado('number', phone) : Promise.resolve({ ok: true, contato: null }),
    ]);
    if (porEmail.ok && porTelefone.ok) {
      const decisao = decidirUnificacao({ name: data.name, email, phone }, porEmail.contato, porTelefone.contato);
      if (decisao.tipo !== 'upsert') {
        return atualizarContatoExistente(decisao, data);
      }
    }
  }
  return upsertContato({ ...data, email, phone });
}

/** Aplica a decisão de unificação num contato que já existe. Nunca perde o lead. */
async function atualizarContatoExistente(
  decisao: Exclude<DecisaoContato, { tipo: 'upsert' }>,
  data: { tags?: string[]; customFields?: { key: string; value: string }[] }
): Promise<{ id: string }> {
  const id = decisao.contatoId;
  const body: Record<string, unknown> = {};
  if (decisao.patch.name) Object.assign(body, nomeParaGhl(decisao.patch.name));
  if (decisao.tipo === 'atualizar') {
    if (decisao.patch.email) body.email = decisao.patch.email;
    if (decisao.patch.phone) body.phone = decisao.patch.phone;
  }
  const cfs = customFieldsParaGhl(data.customFields);
  if (cfs.length > 0) body.customFields = cfs;

  let nota = decisao.nota;
  if (Object.keys(body).length > 0) {
    try {
      const response = await fetch(`${GHL_BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error('GHL atualizarContatoExistente error:', response.status, (await response.text()).slice(0, 300));
        // O dado novo não entrou no cadastro — pelo menos fica na timeline.
        if (decisao.tipo === 'atualizar' && (decisao.patch.email || decisao.patch.phone)) {
          const novos = [decisao.patch.email && `e-mail ${decisao.patch.email}`, decisao.patch.phone && `telefone ${decisao.patch.phone}`]
            .filter(Boolean)
            .join(' e ');
          nota = `Um novo lead informou ${novos}, mas o CRM recusou atualizar o cadastro. Confira os dados de contato.`;
        }
      }
    } catch (error) {
      console.error('GHL atualizarContatoExistente exception:', error);
    }
  }

  if (data.tags && data.tags.length > 0) {
    try {
      const response = await fetch(`${GHL_BASE_URL}/contacts/${id}/tags`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ tags: data.tags }),
      });
      if (!response.ok) console.error('GHL addTags error:', response.status, (await response.text()).slice(0, 300));
    } catch (error) {
      console.error('GHL addTags exception:', error);
    }
  }

  if (nota) await addContactNote(id, nota);
  if (decisao.tipo === 'conflito') await addContactNote(decisao.outroContatoId, decisao.notaOutro);
  return { id };
}

/** O caminho antigo: /contacts/upsert, o GHL decide pela configuração de duplicados. */
async function upsertContato(data: {
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: { key: string; value: string }[];
}): Promise<{ id: string } | null> {
  try {
    const body: Record<string, unknown> = {
      locationId: GHL_LOCATION_ID,
      ...nomeParaGhl(data.name),
    };

    if (data.email) body.email = data.email;
    if (data.phone) body.phone = data.phone;
    if (data.tags) body.tags = data.tags;
    const cfs = customFieldsParaGhl(data.customFields);
    if (cfs.length > 0) body.customFields = cfs;

    const response = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL createContact error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return { id: result.contact?.id || result.id };
  } catch (error) {
    console.error('GHL createContact exception:', error);
    return null;
  }
}

/**
 * Cria opportunity no pipeline de Pré-venda
 */
/**
 * Cria uma nota no timeline do contato — aparece prominente na aba de atividades.
 */
export async function addContactNote(contactId: string, body: string): Promise<boolean> {
  try {
    const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ body }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL addContactNote error:', response.status, errorText);
      return false;
    }
    return true;
  } catch (error) {
    console.error('GHL addContactNote exception:', error);
    return false;
  }
}

export async function createOpportunity(data: {
  contactId: string;
  name: string;
  pipelineId?: string;
  stageId?: string;
  /** Preço do imóvel (G1): venda→price_sale, locação→price_rent. */
  monetaryValue?: number;
}): Promise<{ id: string } | null> {
  try {
    const body: Record<string, any> = {
      locationId: GHL_LOCATION_ID,
      pipelineId: data.pipelineId || PIPELINE_PRE_VENDA,
      pipelineStageId: data.stageId || STAGE_ENTRADA,
      contactId: data.contactId,
      name: data.name,
      status: 'open',
    };
    if (data.monetaryValue && data.monetaryValue > 0) {
      body.monetaryValue = data.monetaryValue;
    }
    const response = await fetch(`${GHL_BASE_URL}/opportunities/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL createOpportunity error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return { id: result.opportunity?.id || result.id };
  } catch (error) {
    console.error('GHL createOpportunity exception:', error);
    return null;
  }
}

/**
 * Busca uma opportunity ABERTA do contato cujo nome termina com o código
 * do imóvel ("Fulana - AP0084_INDEP" — convenção de todos os fluxos).
 *
 * Guard anti-duplicata pré-criação: o GHL parou de bloquear opportunities
 * duplicadas (config da location, ~mai/2026) e o mesmo interessado passou a
 * ganhar uma opportunity nova a cada formulário enviado. Interesse em
 * imóvel DIFERENTE não casa aqui de propósito — aí a nova é legítima.
 * (Mesma lógica existe no painel, lib/ghl.ts.)
 */
export async function findOpenOpportunityByContactAndCode(
  contactId: string,
  propertyCode: string
): Promise<{ id: string } | null> {
  try {
    const params = new URLSearchParams({
      location_id: GHL_LOCATION_ID,
      contact_id: contactId,
      status: 'open',
      limit: '20',
    });
    const response = await fetch(
      `${GHL_BASE_URL}/opportunities/search?${params.toString()}`,
      { method: 'GET', headers: getHeaders() }
    );
    if (!response.ok) {
      console.error('GHL findOpenOpportunityByContactAndCode error:', response.status, await response.text());
      return null;
    }
    const result = await response.json();
    const opps: Array<{ id?: string; _id?: string; name?: string }> =
      result?.opportunities || result?.data || [];
    const target = propertyCode.trim().toUpperCase();
    for (const o of opps) {
      const m = (o.name ?? '').match(/-\s*([a-z]{2,6}\d{2,}(?:_indep)?)\s*$/i);
      if (m && m[1].toUpperCase() === target) {
        const id = o.id || o._id;
        if (id) return { id };
      }
    }
    return null;
  } catch (error) {
    console.error('GHL findOpenOpportunityByContactAndCode exception:', error);
    return null;
  }
}

/**
 * Busca Custom Object (Imóvel) pelo código
 */
export async function findPropertyObject(codigo: string): Promise<{ id: string } | null> {
  try {
    const response = await fetch(
      `${GHL_BASE_URL}/objects/${CUSTOM_OBJECT_KEY}/records/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        page: 1,
        pageLimit: 1,
        query: codigo,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL findPropertyObject error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    const records = result.records || result.data || result.customObjectRecords || [];
    if (records.length > 0) {
      return { id: records[0].id };
    }
    return null;
  } catch (error) {
    console.error('GHL findPropertyObject exception:', error);
    return null;
  }
}

/**
 * Cria association entre contato e imóvel (Custom Object)
 */
export async function associateContactToProperty(contactId: string, propertyObjectId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GHL_BASE_URL}/associations/relations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        associationId: '69c9744f9066949419d6abca',
        firstRecordId: contactId,
        secondRecordId: propertyObjectId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL associate error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('GHL associate exception:', error);
    return false;
  }
}

/**
 * Fluxo completo: cria contato + opportunity + vincula imóvel
 */
export async function processLeadFromSite(data: {
  name: string;
  email?: string;
  phone?: string;
  propertyCode?: string;
  source: 'lead-imovel' | 'lead-anunciar';
  pageUrl?: string;
  /** URL da ficha do recebido no painel admin (só faz sentido quando source='lead-anunciar') */
  submissionUrl?: string;
  pipelineId?: string;
  stageId?: string;
  /** Preço do imóvel (G1) — vira o campo "valor" do card no CRM. */
  monetaryValue?: number;
  /** Nota extra no timeline (G2: links do imóvel no site/painel — URLs em nota são clicáveis). */
  noteBody?: string;
  /** Tags adicionais (ex: tag de roleta calculada pelo caller). */
  extraTags?: string[];
}): Promise<{ contactId: string | null; opportunityId: string | null; associated: boolean }> {
  const result = { contactId: null as string | null, opportunityId: null as string | null, associated: false };

  // Lead de envio de imóvel (anunciar) ganha a tag 'proprietario' pra cair
  // na lista de owners no CRM. Mantemos 'lead-anunciar' pra segmentação fina.
  const baseTags = data.source === 'lead-anunciar'
    ? ['proprietario', 'lead-anunciar', 'site']
    : [data.source, 'site'];
  const tags = [...baseTags, ...(data.extraTags ?? [])].filter(
    (t, i, arr) => t && arr.indexOf(t) === i
  );

  // No fluxo de anunciar, o CF 'origem' recebe a URL da ficha no painel
  // admin (corretor clica e abre diretamente). Em lead-imovel, mantém o
  // pageUrl da página onde veio o lead.
  const origemValue = data.source === 'lead-anunciar' && data.submissionUrl
    ? data.submissionUrl
    : (data.pageUrl || 'site');

  // 1. Criar/atualizar contato
  const contact = await createOrUpdateContact({
    name: data.name,
    email: data.email,
    phone: data.phone,
    tags,
    customFields: [
      ...(data.propertyCode ? [{ key: 'prN78aSY5MNiwm2pdOFl', value: data.propertyCode }] : []),
      { key: 'fRs2gChyO0PfLfsTZopl', value: origemValue },
    ],
  });

  if (!contact) return result;
  result.contactId = contact.id;

  // 2. Criar opportunity no pipeline — com guard anti-duplicata no fluxo
  // de interesse em imóvel: se o contato JÁ tem opportunity aberta pra esse
  // código, reaproveita em vez de criar outra. (Caso real: mesma pessoa
  // preencheu o form do site depois de já ter lead da OLX e acumulou
  // opportunities duplicadas no CRM.) 'lead-anunciar' fica de fora — vai
  // pra outro pipeline e o nome não carrega código.
  const oppName = data.source === 'lead-anunciar'
    ? `${data.name} — Imóvel para anunciar`
    : data.propertyCode
      ? `${data.name} - ${data.propertyCode}`
      : `${data.name} - ${data.source}`;

  const existing = data.source === 'lead-imovel' && data.propertyCode
    ? await findOpenOpportunityByContactAndCode(contact.id, data.propertyCode)
    : null;

  const opportunity = existing ?? await createOpportunity({
    contactId: contact.id,
    name: oppName,
    pipelineId: data.pipelineId,
    stageId: data.stageId,
    monetaryValue: data.monetaryValue,
  });

  if (opportunity) {
    result.opportunityId = opportunity.id;
  }

  // 3. Vincular ao imóvel se tiver código
  if (data.propertyCode) {
    const propertyObject = await findPropertyObject(data.propertyCode);
    if (propertyObject) {
      result.associated = await associateContactToProperty(contact.id, propertyObject.id);
    }
  }

  // 4. Em 'lead-anunciar', adiciona nota visível no timeline com o link do admin
  if (data.source === 'lead-anunciar' && data.submissionUrl) {
    const noteBody = `Imóvel enviado para anúncio via site.\n\nFicha no painel admin:\n${data.submissionUrl}`;
    await addContactNote(contact.id, noteBody);
  }

  // 5. Nota extra do caller (links do imóvel etc.)
  if (data.noteBody) {
    await addContactNote(contact.id, data.noteBody);
  }

  return result;
}
