import Image from 'next/image';
import Link from 'next/link';
import { mediaToImage } from '@/lib/payload';
import type { ReactNode } from 'react';

/**
 * Renderiza o corpo Lexical (JSON do Payload) em React, com os mesmos estilos
 * do antigo PortableTextRenderer (Sanity). Trata os blocos custom do blog:
 * imagem (com legenda), videoEmbed e cta, além de imagem inline e separador.
 */

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

// Bitmask de formatação de texto do Lexical
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKE = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_HIGHLIGHT = 1 << 7; // 128

function renderText(node: any, key: number): ReactNode {
  let el: ReactNode = node.text;
  const f: number = node.format || 0;
  if (f & IS_CODE) el = <code className="bg-gray-100 text-brand-red px-1.5 py-0.5 rounded text-sm">{el}</code>;
  if (f & IS_BOLD) el = <strong className="font-semibold text-black">{el}</strong>;
  if (f & IS_ITALIC) el = <em>{el}</em>;
  if (f & IS_UNDERLINE) el = <u>{el}</u>;
  if (f & IS_STRIKE) el = <s>{el}</s>;
  if (f & IS_HIGHLIGHT) el = <mark className="bg-yellow-100 px-1 rounded">{el}</mark>;
  return <span key={key}>{el}</span>;
}

function ImageFigure({ media, caption }: { media: any; caption?: string }) {
  const img = mediaToImage(media);
  if (!img) return null;
  return (
    <figure className="my-8">
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
        <Image
          src={img.hero || img.url}
          alt={img.alt || caption || ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      {caption && (
        <figcaption className="text-xs text-gray-400 text-center mt-3 italic">{caption}</figcaption>
      )}
    </figure>
  );
}

function VideoFigure({ url, caption }: { url: string; caption?: string }) {
  const youtubeId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);
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
      {caption && (
        <figcaption className="text-xs text-gray-400 text-center mt-3 italic">{caption}</figcaption>
      )}
    </figure>
  );
}

function CtaBox({ fields }: { fields: any }) {
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
  const style = fields.style || 'red';
  const bg = styles[style] || styles.red;
  const btn = btnStyles[style] || btnStyles.red;
  const isInternal = typeof fields.buttonUrl === 'string' && fields.buttonUrl.startsWith('/');
  return (
    <div className={`my-8 rounded-2xl p-6 md:p-8 ${bg}`}>
      <h3 className="font-heading font-bold text-xl mb-2">{fields.heading}</h3>
      {fields.text && <p className="opacity-80 text-sm mb-4">{fields.text}</p>}
      {fields.buttonText && fields.buttonUrl && (
        <a
          href={fields.buttonUrl}
          target={isInternal ? undefined : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          className={`inline-block font-semibold px-6 py-3 rounded-xl text-sm transition-colors ${btn}`}
        >
          {fields.buttonText}
        </a>
      )}
    </div>
  );
}

function renderBlock(fields: any, key: number): ReactNode {
  switch (fields?.blockType) {
    case 'imagem':
      return <ImageFigure key={key} media={fields.image} caption={fields.caption} />;
    case 'videoEmbed':
      return fields.url ? <VideoFigure key={key} url={fields.url} caption={fields.caption} /> : null;
    case 'cta':
      return <CtaBox key={key} fields={fields} />;
    default:
      return null;
  }
}

function renderNodes(nodes: any[]): ReactNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node, i) => renderNode(node, i)).filter(Boolean);
}

function renderNode(node: any, key: number): ReactNode {
  switch (node?.type) {
    case 'text':
      return renderText(node, key);

    case 'linebreak':
      return <br key={key} />;

    case 'paragraph': {
      const children = node.children || [];
      // pula parágrafos totalmente vazios (evita buracos de espaçamento)
      const isEmpty = children.every((c: any) => c?.type === 'text' && !c.text);
      if (children.length === 0 || isEmpty) return null;
      return (
        <p key={key} className="text-gray-600 leading-relaxed mb-4">
          {renderNodes(children)}
        </p>
      );
    }

    case 'heading': {
      const cls: Record<string, string> = {
        h2: 'text-2xl font-heading font-bold text-black mt-10 mb-4',
        h3: 'text-xl font-heading font-bold text-black mt-8 mb-3',
        h4: 'text-lg font-heading font-bold text-black mt-6 mb-2',
      };
      const tag = node.tag === 'h3' || node.tag === 'h4' ? node.tag : 'h2';
      const className = cls[tag];
      const children = renderNodes(node.children || []);
      if (tag === 'h3') return <h3 key={key} className={className}>{children}</h3>;
      if (tag === 'h4') return <h4 key={key} className={className}>{children}</h4>;
      return <h2 key={key} className={className}>{children}</h2>;
    }

    case 'quote':
      return (
        <blockquote key={key} className="my-8 bg-gray-50 rounded-2xl p-6 md:p-8 border-l-4 border-[#EC5B13]">
          <p className="text-lg md:text-xl font-heading font-bold text-black italic leading-relaxed">
            {renderNodes(node.children || [])}
          </p>
        </blockquote>
      );

    case 'list': {
      const items = renderNodes(node.children || []);
      if (node.listType === 'number' || node.tag === 'ol') {
        return <ol key={key} className="list-decimal pl-6 mb-4 space-y-2 text-gray-600">{items}</ol>;
      }
      return <ul key={key} className="list-disc pl-6 mb-4 space-y-2 text-gray-600">{items}</ul>;
    }

    case 'listitem':
      return <li key={key} className="leading-relaxed">{renderNodes(node.children || [])}</li>;

    case 'link':
    case 'autolink': {
      const url: string = node.fields?.url || '';
      const newTab: boolean = !!node.fields?.newTab;
      const children = renderNodes(node.children || []);
      if (!url) return <span key={key}>{children}</span>;
      if (url.startsWith('/')) {
        return (
          <Link key={key} href={url} className="text-[#EC5B13] hover:underline font-medium">
            {children}
          </Link>
        );
      }
      return (
        <a
          key={key}
          href={url}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
          className="text-[#EC5B13] hover:underline font-medium"
        >
          {children}
        </a>
      );
    }

    case 'horizontalrule':
      return <hr key={key} className="my-8 border-gray-200" />;

    case 'upload':
      // imagem inline inserida pela barra (sem legenda)
      return <ImageFigure key={key} media={node.value} />;

    case 'block':
      return renderBlock(node.fields, key);

    default:
      // tipos inline desconhecidos: tenta renderizar filhos, se houver
      return node?.children ? <span key={key}>{renderNodes(node.children)}</span> : null;
  }
}

export default function LexicalRenderer({ content }: { content: any }) {
  const root = content?.root;
  if (!root?.children) return null;
  return <>{renderNodes(root.children)}</>;
}
