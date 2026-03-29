import { sanityClient } from './sanity';

export interface SanityPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: any;
  category: {
    title: string;
    slug: string;
    color?: string;
  };
  author: {
    name: string;
    role?: string;
    image?: any;
  };
  tags?: string[];
  featured?: boolean;
  readTime?: string;
  publishedAt: string;
  body?: any[];
}

const POST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  "category": category->{title, "slug": slug.current, color},
  "author": author->{name, role, image},
  tags,
  featured,
  readTime,
  publishedAt,
  body
`;

export async function getAllPosts(): Promise<SanityPost[]> {
  return sanityClient.fetch(
    `*[_type == "post"] | order(publishedAt desc) {${POST_FIELDS}}`
  );
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  const result = await sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0] {${POST_FIELDS}}`,
    { slug }
  );
  return result || null;
}

export async function getPostsByCategory(categorySlug: string): Promise<SanityPost[]> {
  return sanityClient.fetch(
    `*[_type == "post" && category->slug.current == $categorySlug] | order(publishedAt desc) {${POST_FIELDS}}`,
    { categorySlug }
  );
}

export async function getFeaturedPost(): Promise<SanityPost | null> {
  const result = await sanityClient.fetch(
    `*[_type == "post" && featured == true] | order(publishedAt desc)[0] {${POST_FIELDS}}`
  );
  return result || null;
}

export async function getRelatedPosts(currentSlug: string, limit = 3): Promise<SanityPost[]> {
  return sanityClient.fetch(
    `*[_type == "post" && slug.current != $currentSlug] | order(publishedAt desc)[0...$limit] {${POST_FIELDS}}`,
    { currentSlug, limit: limit - 1 }
  );
}

export async function getAllCategories(): Promise<{ title: string; slug: string; color?: string }[]> {
  return sanityClient.fetch(
    `*[_type == "category"] | order(title asc) { title, "slug": slug.current, color }`
  );
}

export async function getAllPostSlugs(): Promise<string[]> {
  const results = await sanityClient.fetch(
    `*[_type == "post"]{ "slug": slug.current }`
  );
  return results.map((r: any) => r.slug);
}
