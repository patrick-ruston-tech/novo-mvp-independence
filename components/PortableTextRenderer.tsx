import { PortableText, PortableTextComponents } from '@portabletext/react';
import { urlFor } from '@/lib/sanity';
import Image from 'next/image';

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-heading font-bold text-black mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-heading font-bold text-black mt-8 mb-3">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-gray-600 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 bg-gray-50 rounded-2xl p-6 md:p-8 border-l-4 border-[#EC5B13]">
        <p className="text-lg md:text-xl font-heading font-bold text-black italic leading-relaxed">{children}</p>
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-[#EC5B13] hover:underline">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src={urlFor(value).width(1200).url()}
              alt={value.caption || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-xs text-gray-400 text-center mt-3 italic">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
  },
};

export default function PortableTextRenderer({ content }: { content: any[] }) {
  if (!content) return null;
  return <PortableText value={content} components={components} />;
}
