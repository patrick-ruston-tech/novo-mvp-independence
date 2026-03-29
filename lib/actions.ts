'use server';

import { createLead, createPropertySubmission } from '@/lib/queries';
import { processLeadFromSite } from '@/lib/ghl';
import type { Lead, PropertySubmission } from '@/types/property';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Server Action: enviar lead (formulário de contato no detalhe do imóvel)
 * 1. Salva no Supabase
 * 2. Cria contato no GHL com tag "lead-imovel"
 * 3. Atualiza o lead no Supabase com o ghl_contact_id
 */
export async function submitLeadAction(formData: FormData) {
  const lead: Lead = {
    name: formData.get('name') as string,
    email: (formData.get('email') as string) || undefined,
    phone: formData.get('phone') as string,
    message: (formData.get('message') as string) || undefined,
    source: 'website',
    property_id: (formData.get('property_id') as string) || undefined,
    page_url: (formData.get('page_url') as string) || undefined,
  };

  // Validação básica
  if (!lead.name || !lead.phone) {
    return { success: false, error: 'Nome e telefone são obrigatórios.' };
  }

  // 1. Salva no Supabase
  const result = await createLead(lead);
  if (!result.success) return result;

  // 2. Busca o external_id do imóvel (se tiver property_id)
  let propertyCode: string | undefined;
  if (lead.property_id) {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from('properties')
        .select('external_id')
        .eq('id', lead.property_id)
        .single();
      propertyCode = data?.external_id;
    } catch (e) {
      // Não bloqueia o fluxo se falhar
    }
  }

  // 3. GHL sync completo: contato + opportunity + association
  try {
    const ghlResult = await processLeadFromSite({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      propertyCode,
      source: 'lead-imovel',
      pageUrl: lead.page_url || '',
    });

    if (ghlResult.contactId) {
      const supabase = createServerClient();

      // Busca o lead mais recente com esse telefone
      const { data: recentLead } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', lead.phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentLead) {
        await supabase
          .from('leads')
          .update({ ghl_contact_id: ghlResult.contactId })
          .eq('id', recentLead.id);
      }
    }
  } catch (e) {
    console.error('GHL sync error:', e);
  }

  return { success: true };

}




/**
 * Server Action: anunciar imóvel (formulário multi-step)
 * 1. Salva no Supabase (property_submissions)
 * 2. Cria contato no GHL com tag "lead-anunciar"
 */
export async function submitPropertyAction(formData: FormData) {
  const submission: PropertySubmission = {
    owner_name: formData.get('owner_name') as string,
    owner_email: (formData.get('owner_email') as string) || undefined,
    owner_phone: formData.get('owner_phone') as string,
    property_type: (formData.get('property_type') as string) || undefined,
    transaction_type: (formData.get('transaction_type') as string) || undefined,
    neighborhood: (formData.get('neighborhood') as string) || undefined,
    city: (formData.get('city') as string) || 'São José dos Campos',
    bedrooms: formData.get('bedrooms')
      ? Number(formData.get('bedrooms'))
      : undefined,
    bathrooms: formData.get('bathrooms')
      ? Number(formData.get('bathrooms'))
      : undefined,
    garages: formData.get('garages')
      ? Number(formData.get('garages'))
      : undefined,
    living_area: formData.get('living_area')
      ? Number(formData.get('living_area'))
      : undefined,
    price_estimate: formData.get('price_estimate')
      ? Number(formData.get('price_estimate'))
      : undefined,
    description: (formData.get('description') as string) || undefined,
  };

  // Validação básica
  if (!submission.owner_name || !submission.owner_phone) {
    return { success: false, error: 'Nome e telefone são obrigatórios.' };
  }

  // 1. Salva no Supabase
  const result = await createPropertySubmission(submission);
  if (!result.success) return result;

  // 2. GHL sync completo: contato + opportunity + association
  try {
    const ghlResult = await processLeadFromSite({
      name: submission.owner_name,
      email: submission.owner_email,
      phone: submission.owner_phone,
      source: 'lead-anunciar',
      pageUrl: '/anunciar',
    });

    if (ghlResult.contactId) {
      const supabase = createServerClient();
      const { data: recentSub } = await supabase
        .from('property_submissions')
        .select('id')
        .eq('owner_phone', submission.owner_phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentSub) {
        await supabase
          .from('property_submissions')
          .update({ ghl_contact_id: ghlResult.contactId })
          .eq('id', recentSub.id);
      }
    }
  } catch (e) {
    console.error('GHL sync error:', e);
  }

  return { success: true };
}
