import type { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

const BASE_URL = 'https://independenceimoveis.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();
  // Static pages
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${BASE_URL}/comprar`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/alugar`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/lancamentos`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/descobrir`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/sobre`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/anunciar`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  // Properties
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(5000);

  const propertyPages = (properties ?? []).map((p) => ({
    url: `${BASE_URL}/imoveis/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Launches
  const { data: launches } = await supabase
    .from('launches')
    .select('slug, updated_at')
    .eq('status', 'active');

  const launchPages = (launches ?? []).map((l) => ({
    url: `${BASE_URL}/lancamentos/${l.slug}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Neighborhoods (comprar + alugar)
  const { data: neighborhoods } = await supabase
    .from('neighborhoods')
    .select('slug, property_count')
    .gt('property_count', 2);

  const neighborhoodPages = (neighborhoods ?? []).flatMap((n) => [
    {
      url: `${BASE_URL}/comprar/${n.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/alugar/${n.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]);

  // Blog posts
  const blogSlugs = [
    'mercado-imobiliario-sjc-2024',
    '5-dicas-decorar-apartamento',
    'bairros-mais-valorizaram-sjc',
    'vale-pena-investir-imoveis-planta',
    'vantagens-morar-condominio-fechado',
    'aluguel-ou-financiamento',
  ];

  const blogPages = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...launchPages, ...neighborhoodPages, ...blogPages, ...propertyPages];
}
