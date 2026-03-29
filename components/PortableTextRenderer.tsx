import { PortableText, PortableTextComponents } from '@portabletext/react';
import { urlFor } from '@/lib/sanity';
import Image from 'next/image';
import Link from 'next/link';

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-heading font-bold text-black mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-heading font-bold text-black mt-8 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-heading font-bold text-black mt-6 mb-2">{children}</h4>
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
    underline: ({ children }) => <u>{children}</u>,
    highlight: ({ children }) => <mark className="bg-yellow-100 px-1 rounded">{children}</mark>,
    link: ({ children, value }) => {
      const target = value?.blank ? '_blank' : undefined;
      const rel = value?.blank ? 'noopener noreferrer' : undefined;
      if (value?.href?.startsWith('/')) {
        return <Link href={value.href} className="text-[#EC5B13] hover:underline font-medium">{children}</Link>;
      }
      return (
        <a href={value?.href} target={target} rel={rel} className="text-[#EC5B13] hover:underline font-medium">
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src={urlFor(value).width(1200).url()}
              alt={value.alt || value.caption || ''}
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
    videoEmbed: ({ value }) => {
      if (!value?.url) return null;
      const youtubeId = getYouTubeId(value.url);
      const vimeoId = getVimeoId(value.url);
      const embedUrl = youtubeId
        ? `https://www.youtube.com/embed/${youtubeId}`
        : vimeoId
        ? `https://player.vimeo.com/video/${vimeoId}`
        : null;

      if (!embedUrl) return null;

      return (
        <figure className="my-8">
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {value.caption && (
            <figcaption className="text-xs text-gray-400 text-center mt-3 italic">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
    callToAction: ({ value }) => {
      if (!value) return null;
      const styles: Record<string, string> = {
        red: 'bg-brand-red text-white',
        gray: 'bg-gray-50 text-black border border-gray-100',
        dark: 'bg-[#1A2B3C] text-white',
      };
      const btnStyles: Record<string, string> = {
        red: 'bg-white text-brand-red hover:bg-gray-100',
        gray: 'bg-black text-white hover:bg-gray-800',
        dark: 'bg-white text-[#1A2B3C] hover:bg-gray-100',
      };
      const bg = styles[value.style || 'red'] || styles.red;
      const btn = btnStyles[value.style || 'red'] || btnStyles.red;

      return (
        <div className={`my-8 rounded-2xl p-6 md:p-8 ${bg}`}>
          <h3 className="font-heading font-bold text-xl mb-2">{value.heading}</h3>
          {value.text && <p className="opacity-80 text-sm mb-4">{value.text}</p>}
          {value.buttonText && value.buttonUrl && (
            <a
              href={value.buttonUrl}
              target={value.buttonUrl.startsWith('/') ? undefined : '_blank'}
              rel={value.buttonUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
              className={`inline-block font-semibold px-6 py-3 rounded-xl text-sm transition-colors ${btn}`}
            >
              {value.buttonText}
            </a>
          )}
        </div>
      );
    },
    divider: ({ value }) => {
      if (value?.style === 'space') {
        return <div className="my-8" />;
      }
      return <hr className="my-8 border-gray-200" />;
    },
  },
};

export default function PortableTextRenderer({ content }: { content: any[] }) {
  if (!content) return null;
  return <PortableText value={content} components={components} />;
}
