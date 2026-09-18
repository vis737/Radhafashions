/**
 * Dedicated authenticated fetch helper for admin panel operations.
 * Sends both HTTP-only credentials (cookies) and Bearer token for double redundancy.
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (response.status === 401) {
    console.warn('[Admin API] 401 Unauthorized encountered for:', input);
  }

  return response;
}
