'use server';

import { createLead, createPropertySubmission } from '@/lib/queries';
import type { Lead, PropertySubmission } from '@/types/property';

/**
 * Server Action: enviar lead (formulário de contato no detalhe do imóvel)
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

  const result = await createLead(lead);
  return result;
}

/**
 * Server Action: anunciar imóvel (formulário multi-step)
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

  const result = await createPropertySubmission(submission);
  return result;
}
