import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, getFeaturedPost, getAllCategories, getPostsByCategory } from '@/lib/blog-queries';
import { urlFor } from '@/lib/sanity';
import BlogCategoryFilter from '@/components/BlogCategoryFilter';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Dicas e Mercado Imobiliário de São José dos Campos',
  description: 'Artigos sobre mercado imobiliário, dicas de decoração, investimentos e análises de bairros em São José dos Campos.',
  alternates: { canonical: 'https://independenceimoveis.com.br/blog' },
};

export const revalidate = 300;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const activeCategory = (resolvedParams.categoria as string) || 'Todos';

  const [featured, categories, allPosts] = await Promise.all([
    getFeaturedPost(),
    getAllCategories(),
    activeCategory === 'Todos' ? getAllPosts() : getPostsByCategory(activeCategory.toLowerCase()),
  ]);

  const categoryNames = ['Todos', ...categories.map(c => c.title)];
  const posts = activeCategory === 'Todos' ? allPosts.filter(p => !p.featured) : allPosts;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div className="w-full">

      {/* Featured Post Hero */}
      {featured && activeCategory === 'Todos' && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
          <Link href={`/blog/${featured.slug}`} className="block group">
            <div className="relative overflow-hidden rounded-3xl min-h-[400px] md:min-h-[480px] flex items-end">
              {featured.coverImage && (
                <Image
                  src={urlFor(featured.coverImage).width(1920).height(800).url()}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="100vw"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-8 md:p-12 max-w-2xl">
                <span className="inline-block bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-4">
                  Destaque
                </span>
                <h2 className="text-2xl md:text-4xl font-heading font-bold text-white leading-tight mb-3">
                  {featured.title}
                </h2>
                <p className="text-white/70 text-sm mb-4 max-w-lg hidden md:block">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {featured.author?.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{featured.author?.name}</div>
                      <div className="text-white/50 text-xs">{featured.author?.role} · {featured.readTime || '5 min'}</div>
                    </div>
                  </div>
                  <span className="bg-white text-black font-semibold px-5 py-2.5 rounded-xl text-sm hidden sm:inline-flex items-center gap-1">
                    Ler Agora <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Category Filter + Posts Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BlogCategoryFilter categories={categoryNames} activeCategory={activeCategory} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="group block">
              <article>
                <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-gray-100 mb-4">
                  {post.coverImage && (
                    <Image
                      src={urlFor(post.coverImage).width(600).height(450).url()}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg"
                      style={{ backgroundColor: post.category.color || '#EC5B13' }}>
                      {post.category.title}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">
                  {formatDate(post.publishedAt)}
                </div>
                <h3 className="text-lg font-heading font-bold text-black group-hover:text-[#EC5B13] transition-colors leading-snug mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <span className="text-sm font-semibold text-brand-red flex items-center gap-1 group-hover:gap-2 transition-all">
                  Continuar lendo <ArrowRight className="w-4 h-4" />
                </span>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">Nenhum post nesta categoria ainda.</p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        <section className="relative overflow-hidden rounded-3xl bg-brand-red py-12 px-8 sm:px-12 lg:px-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white italic mb-2">
              Fique por dentro das novidades
            </h2>
            <p className="text-white/80 text-sm mb-6">
              Receba as melhores oportunidades e dicas exclusivas diretamente no seu e-mail.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 bg-white rounded-xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/20"
              />
              <button className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                Inscrever-se
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
