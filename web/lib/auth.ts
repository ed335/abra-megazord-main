const TOKEN_KEY = 'abracann_token';
const COOKIE_NAME = 'auth_token';

// Use same-origin by default to evitar CORS entre www/apex; sobrescreva via NEXT_PUBLIC_API_URL se precisar.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const buildUrl = (path: string) =>
  path.startsWith('http') ? path : `${API_URL}${path}`;

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${COOKIE_NAME}=${token}; path=/; SameSite=None; Secure`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const ls = localStorage.getItem(TOKEN_KEY);
  if (ls) return ls;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

type FetchOptions = RequestInit & { 
  skipAuthHeader?: boolean;
  skipLogoutOn401?: boolean;
};

export async function fetchWithAuth<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = options.skipAuthHeader ? null : getToken();
  const headers = new Headers(options.headers || {});

  if (!options.skipAuthHeader && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401 && !options.skipLogoutOn401) {
    clearToken();
    const error = new Error('Sessão expirada. Faça login novamente.');
    (error as Error & { code?: string }).code = 'UNAUTHORIZED';
    throw error;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.error || errorData?.message || 'Erro ao comunicar com o servidor';
    const error = new Error(message);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}
