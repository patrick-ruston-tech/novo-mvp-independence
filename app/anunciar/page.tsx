import { Metadata } from 'next';
import { getNeighborhoods } from '@/lib/queries';
import AnunciarClient from './AnunciarClient';

export const metadata: Metadata = {
  title: 'Anunciar Imóvel | Independence',
  description: 'Cadastre seu imóvel em poucos minutos e nossa equipe entrará em contato.',
};

export const revalidate = 3600; // revalidate at most every hour

export default async function AnunciarPage() {
  const bairros = await getNeighborhoods();

  return <AnunciarClient bairros={bairros} />;
}
