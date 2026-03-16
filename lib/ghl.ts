// ============================================================
// GoHighLevel API Client
// Creates contacts with tags — GHL workflows handle the rest
// ============================================================

const GHL_API_URL = 'https://services.leadconnectorhq.com';

interface GHLContactPayload {
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  locationId: string;
  source: string;
  tags: string[];
  customFields: { key: string; field_value: string }[];
}

interface GHLResponse {
  success: boolean;
  contactId?: string;
  error?: string;
}

/**
 * Cria ou atualiza um contato no GoHighLevel.
 * Usa a API v2 com Location API Key.
 */
async function createOrUpdateContact(
  payload: GHLContactPayload
): Promise<GHLResponse> {
  const apiKey = process.env.GHL_API_KEY;

  if (!apiKey) {
    console.warn('GHL_API_KEY not configured — skipping GHL sync');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const response = await fetch(`${GHL_API_URL}/contacts/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL API error:', response.status, errorText);
      return { success: false, error: `GHL API ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      contactId: data.contact?.id || data.id,
    };
  } catch (error) {
    console.error('GHL connection error:', error);
    return { success: false, error: 'Connection failed' };
  }
}

/**
 * Cria contato no GHL a partir de um lead do site (formulário de contato no imóvel).
 * Tag: lead-imovel
 * GHL Workflow: detecta tag → cria oportunidade no pipeline Atendimento → estágio Novo
 */
export async function syncLeadToGHL(lead: {
  name: string;
  email?: string;
  phone: string;
  propertyCode?: string;
  pageUrl?: string;
}): Promise<GHLResponse> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) return { success: false, error: 'Location ID not configured' };

  const nameParts = lead.name.trim().split(' ');
  const firstName = nameParts[0] || lead.name;
  const lastName = nameParts.slice(1).join(' ') || '';

  const customFields: { key: string; field_value: string }[] = [];

  if (lead.propertyCode) {
    customFields.push({
      key: 'contact.codigo_do_imovel',
      field_value: lead.propertyCode,
    });
  }

  if (lead.pageUrl) {
    customFields.push({
      key: 'contact.origem',
      field_value: lead.pageUrl,
    });
  }

  return createOrUpdateContact({
    firstName,
    lastName,
    email: lead.email,
    phone: lead.phone,
    locationId,
    source: 'Website - Imóvel',
    tags: ['lead-imovel'],
    customFields,
  });
}

/**
 * Cria contato no GHL a partir do formulário Anunciar.
 * Tag: lead-anunciar
 * GHL Workflow: detecta tag → cria oportunidade no pipeline Captação → estágio Pendente
 */
export async function syncSubmissionToGHL(submission: {
  ownerName: string;
  ownerEmail?: string;
  ownerPhone: string;
  propertyType?: string;
  neighborhood?: string;
  city?: string;
  priceEstimate?: string;
}): Promise<GHLResponse> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) return { success: false, error: 'Location ID not configured' };

  const nameParts = submission.ownerName.trim().split(' ');
  const firstName = nameParts[0] || submission.ownerName;
  const lastName = nameParts.slice(1).join(' ') || '';

  // Monta resumo para o campo origem
  const resumo = [
    submission.propertyType,
    submission.neighborhood,
    submission.city,
    submission.priceEstimate ? `R$ ${submission.priceEstimate}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const customFields: { key: string; field_value: string }[] = [];

  if (resumo) {
    customFields.push({
      key: 'contact.origem',
      field_value: `Anunciar: ${resumo}`,
    });
  }

  return createOrUpdateContact({
    firstName,
    lastName,
    email: submission.ownerEmail,
    phone: submission.ownerPhone,
    locationId,
    source: 'Website - Anunciar',
    tags: ['lead-anunciar'],
    customFields,
  });
}
