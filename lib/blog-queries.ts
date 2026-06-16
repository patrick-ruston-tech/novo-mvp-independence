import { mediaToImage, payloadFetch, type BlogImage } from './payload';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: BlogImage | null;
  category: { title: string; slug: string; color?: string } | null;
  author: { name: string; role?: string; image: BlogImage | null } | null;
  tags?: string[];
  featured?: boolean;
  readTime?: string;
  publishedAt: string;
  body?: any; // Lexical root JSON ({ root: { children: [...] } })
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Alias retrocompatível — código antigo importava `SanityPost`.
export type SanityPost = BlogPost;

function mapPost(doc: any): BlogPost {
  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    coverImage: mediaToImage(doc.coverImage),
    category: doc.category
      ? { title: doc.category.title, slug: doc.category.slug, color: doc.category.color || undefined }
      : null,
    author: doc.author
      ? { name: doc.author.name, role: doc.author.role || undefined, image: mediaToImage(doc.author.avatar) }
      : null,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    featured: !!doc.featured,
    readTime: doc.readTime || undefined,
    publishedAt: doc.publishedAt,
    body: doc.body || null,
    videoUrl: doc.videoUrl || undefined,
    seoTitle: doc.seoTitle || undefined,
    seoDescription: doc.seoDescription || undefined,
  };
}

const BASE = '/api/posts';
// Com drafts ativos, leitura anônima já só vê published — mas filtramos
// explicitamente por garantia.
const PUBLISHED = 'where[_status][equals]=published';
const DEPTH = 'depth=2'; // popula category, author e author.avatar

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const data = await payloadFetch(`${BASE}?${PUBLISHED}&sort=-publishedAt&limit=100&${DEPTH}`);
    return (data.docs || []).map(mapPost);
  } catch (e) {
    console.error('Blog: getAllPosts falhou', e);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const data = await payloadFetch(
      `${BASE}?${PUBLISHED}&where[slug][equals]=${encodeURIComponent(slug)}&limit=1&${DEPTH}`
    );
    const doc = (data.docs || [])[0];
    return doc ? mapPost(doc) : null;
  } catch (e) {
    console.error('Blog: getPostBySlug falhou', e);
    return null;
  }
}

export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  // Volume baixo: busca tudo e filtra pela slug da categoria (mantém a
  // semântica antiga — a página passa o nome da categoria em minúsculas).
  const all = await getAllPosts();
  return all.filter((p) => p.category?.slug === categorySlug);
}

export async function getFeaturedPost(): Promise<BlogPost | null> {
  try {
    const data = await payloadFetch(
      `${BASE}?${PUBLISHED}&where[featured][equals]=true&sort=-publishedAt&limit=1&${DEPTH}`
    );
    const doc = (data.docs || [])[0];
    return doc ? mapPost(doc) : null;
  } catch (e) {
    console.error('Blog: getFeaturedPost falhou', e);
    return null;
  }
}

export async function getRelatedPosts(currentSlug: string, limit = 3): Promise<BlogPost[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.slug !== currentSlug).slice(0, limit);
}

export async function getAllCategories(): Promise<{ title: string; slug: string; color?: string }[]> {
  try {
    const data = await payloadFetch(`/api/categories?sort=title&limit=100`);
    return (data.docs || []).map((c: any) => ({
      title: c.title,
      slug: c.slug,
      color: c.color || undefined,
    }));
  } catch (e) {
    console.error('Blog: getAllCategories falhou', e);
    return [];
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const data = await payloadFetch(`${BASE}?${PUBLISHED}&limit=1000&depth=0`);
    return (data.docs || []).map((d: any) => d.slug).filter(Boolean);
  } catch (e) {
    console.error('Blog: getAllPostSlugs falhou', e);
    return [];
  }
}
