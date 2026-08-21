/** Remote API base for local dev; empty string uses same-origin /api. */
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === 'true';

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export function staticDataUrl(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalized}`;
}

export function isGitHubPagesHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
}
