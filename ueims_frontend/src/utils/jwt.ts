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

  // #region agent debug
  const _log = (msg: string, data: any) => fetch('http://127.0.0.1:7689/ingest/85060117-28a9-450a-b776-759dca15ff5a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c8288'},body:JSON.stringify({sessionId:'4c8288',location:'jwt.ts:extractUserFromToken',message:msg,data,timestamp:Date.now()})}).catch(()=>{});
  _log('JWT raw authorities', { authorities: payload.authorities, scope: payload.scope });
  // #endregion

  const scope = (payload.authorities || payload.scope) as string;
  const roles = scope
    ? scope
        .split(' ')
        .map((s: string) => s.startsWith('ROLE_') ? s.replace('ROLE_', '') : s) as string[]
    : [];

  _log('JWT parsed roles', { roles, scope });

  return {
    email: payload.sub,
    roles,
    mustChangePassword: payload.must_change_password,
    fullName: payload.full_name,
    avatarUrl: payload.avatar_url,
  };
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
