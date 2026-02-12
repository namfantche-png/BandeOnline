'use client';

import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/imageUtils';

interface AdImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  /** Timestamp ou string para forçar reload quando a imagem mudar (ex: ao editar) */
  key?: string | number;
}

/**
 * Componente para exibir imagens de anúncios
 * - Suporta qualquer tipo de imagem (jpeg, png, webp, gif, etc.)
 * - Converte URLs relativas em absolutas
 * - Fallback quando a imagem falha ao carregar
 */
export function AdImage({ src, alt, className = '', objectFit = 'cover' }: AdImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = getImageUrl(src);

  // Reset estado de erro quando a fonte muda (ex: navegação entre anúncios)
  useEffect(() => {
    setHasError(false);
  }, [src, resolvedSrc]);

  if (!resolvedSrc || hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={{ minHeight: 120 }}
      >
        <span className="text-sm">Sem imagem</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={{ objectFit }}
      loading="lazy"
      onError={() => setHasError(true)}
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
