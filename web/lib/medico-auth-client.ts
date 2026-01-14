const MEDICO_TOKEN_KEY = 'abracann_token';

export function getMedicoToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MEDICO_TOKEN_KEY);
}

export function setMedicoToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEDICO_TOKEN_KEY, token);
}

export function removeMedicoToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MEDICO_TOKEN_KEY);
}

export async function fetchWithMedicoAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getMedicoToken();
  
  if (!token) {
    throw new Error('Não autenticado');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    throw { code: 'UNAUTHORIZED', message: 'Sessão expirada' };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
}
