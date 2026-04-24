'use client';

import { useEffect, useState } from 'react';
import NextImage, { ImageProps } from 'next/image';

/**
 * Envolve next/image com fallback pra imagem original.
 * Se o src terminar em /wm/arquivo e retornar 404 (watermark ainda não gerado),
 * cai automaticamente pra URL original (sem o /wm/).
 *
 * Observação importante: usa useEffect para sincronizar o state interno
 * quando a prop `src` muda (ex: lightbox navegando entre fotos). Sem isso,
 * o state ficava preso na primeira imagem montada.
 */

function stripWmSegment(url: string): string {
  return url.replace(/\/wm\//, '/');
}

export default function PropertyImage({ src, alt = '', ...props }: ImageProps) {
  const initialSrc = typeof src === 'string' ? src : String(src);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  // Ressincroniza quando a prop src muda (ex: troca de foto no lightbox).
  useEffect(() => {
    setCurrentSrc(initialSrc);
  }, [initialSrc]);

  return (
    <NextImage
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc.includes('/wm/')) {
          setCurrentSrc(stripWmSegment(currentSrc));
        }
      }}
    />
  );
}
