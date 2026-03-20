import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getRelatedPosts } from '@/lib/blog-data';
import { ArrowRight, Share2, Bookmark } from 'lucide-react';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);
  if (!post) return { title: 'Post não encontrado' };
  return {
    title: `${post.title} | Blog | Independence`,
    description: post.excerpt,
    alternates: { canonical: `https://independenceimoveis.com.br/blog/${resolvedParams.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: [{ url: post.coverImage }],
    },
  };
}

function renderContent(content: string) {
  const blocks = content.split('\n\n');
  return blocks.map((block, idx) => {
    const trimmed = block.trim();

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-2xl font-heading font-bold text-black mt-10 mb-4">
          {trimmed.replace('## ', '')}
        </h2>
      );
    }

    if (trimmed.startsWith('> ')) {
      const lines = trimmed.split('\n').map(l => l.replace(/^> ?/, ''));
      const quote = lines[0];
      const attribution = lines[1] ? lines[1].replace('— ', '') : null;
      return (
        <blockquote key={idx} className="my-8 bg-gray-50 rounded-2xl p-6 md:p-8 border-l-4 border-[#EC5B13]">
          <p className="text-lg md:text-xl font-heading font-bold text-black italic leading-relaxed mb-3">
            "{quote}"
          </p>
          {attribution && (
            <cite className="text-sm text-[#EC5B13] font-medium not-italic">— {attribution}</cite>
          )}
        </blockquote>
      );
    }

    if (trimmed) {
      return (
        <p key={idx} className="text-gray-600 leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    }

    return null;
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post.slug, 3);

  return (
    <div className="w-full">

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>·</span>
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
          <span>·</span>
          <span className="text-gray-600">{post.category}</span>
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
            <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-sm">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold text-black">{post.author.name}</div>
              <div className="text-xs text-gray-400">{post.publishedAt} · {post.readTime}</div>
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
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-8">
        <div className="aspect-[21/9] relative rounded-2xl overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <p className="text-xs text-gray-400 text-center mt-3 italic">
          Foto: Editorial Team
        </p>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        {renderContent(post.content)}

        {/* Tags */}
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
      </article>

      {/* Newsletter CTA */}
      <div className="px-4 sm:px-6 lg:px-[200px] pb-12 w-full">
        <section className="relative overflow-hidden rounded-3xl bg-brand-red py-10 px-8 sm:px-12">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white italic">
                Fique por dentro do mercado.
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Receba mensalmente nossa curadoria exclusiva sobre arquitetura, design e investimentos imobiliários direto no seu e-mail.
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
              <p className="text-[10px] text-white/40 text-center uppercase tracking-wider">
                Respeitamos sua privacidade. Cancele a qualquer momento.
              </p>
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
              <Link key={related.slug} href={`/blog/${related.slug}`} className="group block">
                <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-gray-100 mb-4">
                  <Image
                    src={related.coverImage}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="text-xs text-[#EC5B13] font-bold uppercase tracking-wider mb-2">{related.category}</div>
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
