/** Remote API base for GitHub Pages; empty string uses same-origin /api (local dev). */
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export function hasRemoteApi(): boolean {
  return Boolean(API_BASE);
}

export function isGitHubPagesHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
}
