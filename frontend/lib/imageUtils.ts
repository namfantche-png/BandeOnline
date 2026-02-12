/**
 * Utilitários para exibição de imagens
 * Converte URLs relativas em absolutas e garante que qualquer tipo de imagem funcione
 */

function getApiBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api\/?$/, '');
}

/**
 * Converte uma URL de imagem para formato absoluto
 * - URLs que já são absolutas (http/https) são retornadas como estão
 * - URLs relativas (/uploads/...) são convertidas para o backend
 * - Suporta Cloudinary, URLs locais e data URIs
 */
export function getImageUrl(url: string | null | undefined): string {
  if (url == null) return '';
  const str = typeof url === 'string' ? url : (typeof url === 'object' && url && 'url' in url ? (url as { url: string }).url : '');
  if (typeof str !== 'string') return '';
  const trimmed = str.trim();
  if (!trimmed) return '';

  // Já é URL absoluta (http, https, data:, blob:)
  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // URL relativa - prepender base do backend
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${getApiBase()}${path}`;
}

/**
 * Placeholder SVG para quando a imagem falha ao carregar
 */
export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3ESem imagem%3C/text%3E%3C/svg%3E";
