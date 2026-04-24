const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

// Pipeline IDs
const PIPELINE_PRE_VENDA = 'd232xPcFo2xoOVEH79C1';
const STAGE_ENTRADA = 'c359cbe6-35c6-41ff-afef-04c967b6705a';

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
 * Cria ou atualiza contato no GHL
 */
export async function createOrUpdateContact(data: {
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: { key: string; value: string }[];
}): Promise<{ id: string } | null> {
  try {
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const body: any = {
      locationId: GHL_LOCATION_ID,
      firstName,
      lastName,
      name: data.name,
    };

    if (data.email) body.email = data.email;
    if (data.phone) body.phone = data.phone;
    if (data.tags) body.tags = data.tags;

    if (data.customFields && data.customFields.length > 0) {
      body.customFields = data.customFields.map(cf => ({
        id: cf.key,
        field_value: cf.value,
      }));
    }

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
export async function createOpportunity(data: {
  contactId: string;
  name: string;
  pipelineId?: string;
  stageId?: string;
}): Promise<{ id: string } | null> {
  try {
    const response = await fetch(`${GHL_BASE_URL}/opportunities/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        pipelineId: data.pipelineId || PIPELINE_PRE_VENDA,
        pipelineStageId: data.stageId || STAGE_ENTRADA,
        contactId: data.contactId,
        name: data.name,
        status: 'open',
      }),
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
}): Promise<{ contactId: string | null; opportunityId: string | null; associated: boolean }> {
  const result = { contactId: null as string | null, opportunityId: null as string | null, associated: false };

  // Lead de envio de imóvel (anunciar) ganha a tag 'proprietario' pra cair
  // na lista de owners no CRM. Mantemos 'lead-anunciar' pra segmentação fina.
  const tags = data.source === 'lead-anunciar'
    ? ['proprietario', 'lead-anunciar', 'site']
    : [data.source, 'site'];

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

  // 2. Criar opportunity no pipeline
  const oppName = data.source === 'lead-anunciar'
    ? `${data.name} — Imóvel para anunciar`
    : data.propertyCode
      ? `${data.name} - ${data.propertyCode}`
      : `${data.name} - ${data.source}`;

  const opportunity = await createOpportunity({
    contactId: contact.id,
    name: oppName,
    pipelineId: data.pipelineId,
    stageId: data.stageId,
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

  return result;
}
