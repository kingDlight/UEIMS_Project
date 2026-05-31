export function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function extractUserFromToken(token: string) {
  const payload = parseJwt(token);
  if (!payload) return null;

  const scope = payload.scope as string;
  const roles = scope
    ? scope
        .split(' ')
        .filter((s: string) => s.startsWith('ROLE_'))
        .map((s: string) => s.replace('ROLE_', '')) as string[]
    : [];

  return {
    email: payload.sub,
    roles,
    mustChangePassword: payload.must_change_password,
  };
}
