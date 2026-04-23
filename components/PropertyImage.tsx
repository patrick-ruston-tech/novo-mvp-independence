'use client';

import { useState } from 'react';
import NextImage, { ImageProps } from 'next/image';

/**
 * Envolve next/image com fallback pra imagem original.
 * Se o src terminar em /wm/arquivo e retornar 404 (watermark ainda não gerado),
 * cai automaticamente pra URL original (sem o /wm/).
 */

function stripWmSegment(url: string): string {
  // Remove o segmento /wm/ (ex: .../AP1234/wm/foto.webp → .../AP1234/foto.webp)
  return url.replace(/\/wm\//, '/');
}

export default function PropertyImage({ src, alt = '', ...props }: ImageProps) {
  const initialSrc = typeof src === 'string' ? src : String(src);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [didFallback, setDidFallback] = useState(false);

  return (
    <NextImage
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (!didFallback && currentSrc.includes('/wm/')) {
          setCurrentSrc(stripWmSegment(currentSrc));
          setDidFallback(true);
        }
      }}
    />
  );
}
