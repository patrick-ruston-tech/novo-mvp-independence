import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getRelatedPosts, getAllPostSlugs } from '@/lib/blog-queries';
import { urlFor } from '@/lib/sanity';
import PortableTextRenderer from '@/components/PortableTextRenderer';
import { ArrowRight, Share2, Bookmark } from 'lucide-react';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  if (!post) return { title: 'Post não encontrado' };

  const imageUrl = post.coverImage ? urlFor(post.coverImage).width(1200).height(630).url() : '/hero/hero-1.jpg';

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://independenceimoveis.com.br/blog/${resolvedParams.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.slug, 3);

  return (
    <div className="w-full">

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>·</span>
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
          <span>·</span>
          <span className="text-gray-600">{post.category?.title}</span>
        </nav>

        <h1 className="text-3xl md:text-5xl font-heading font-bold text-black leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          {post.excerpt}
        </p>

        {/* Author + Actions */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-sm overflow-hidden">
              {post.author?.image ? (
                <Image src={urlFor(post.author.image).width(80).height(80).url()} alt={post.author.name} width={40} height={40} className="object-cover" />
              ) : (
                post.author?.name?.charAt(0) || 'E'
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-black">{post.author?.name}</div>
              <div className="text-xs text-gray-400">{formatDate(post.publishedAt)} · {post.readTime || '5 min de leitura'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black text-xs font-medium flex items-center gap-1">
              <Share2 className="w-4 h-4" /> SHARE
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-8">
          <div className="aspect-[21/9] relative rounded-2xl overflow-hidden">
            <Image
              src={urlFor(post.coverImage).width(1920).height(800).url()}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <PortableTextRenderer content={post.body} />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-500 hover:border-[#EC5B13] hover:text-[#EC5B13] transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Newsletter CTA */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        <section className="relative overflow-hidden rounded-3xl bg-brand-red py-10 px-8 sm:px-12">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white italic">
                Fique por dentro do mercado.
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Receba mensalmente nossa curadoria exclusiva sobre investimentos imobiliários.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[280px]">
              <input
                type="email"
                placeholder="seu@email.com"
                className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/30"
              />
              <button className="bg-white text-brand-red font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors border border-white">
                Inscrever-se na Newsletter
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-heading font-bold text-black">Continue Lendo</h2>
            <Link href="/blog" className="text-sm font-semibold text-[#EC5B13] hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((related) => (
              <Link key={related._id} href={`/blog/${related.slug}`} className="group block">
                <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-gray-100 mb-4">
                  {related.coverImage && (
                    <Image
                      src={urlFor(related.coverImage).width(600).height(450).url()}
                      alt={related.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="33vw"
                    />
                  )}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: related.category?.color || '#EC5B13' }}>
                  {related.category?.title}
                </div>
                <h3 className="text-base font-heading font-bold text-black group-hover:text-[#EC5B13] transition-colors leading-snug">
                  {related.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
