export const AUTH_PRIMARY = '#E96500';
export const AUTH_PRIMARY_DARK = '#C45200';
export const AUTH_PRIMARY_LIGHT = '#FFF2E8';
export const AUTH_TEXT_DARK = '#1E293B';
export const AUTH_TEXT_GRAY = '#64748B';
export const AUTH_WHITE = '#FFFFFF';
export const AUTH_BORDER = '#E2E8F0';
export const AUTH_DANGER = '#EF4444';
export const AUTH_STRENGTH_ORANGE = '#F97316';
export const AUTH_STRENGTH_YELLOW = '#EAB308';
export const AUTH_STRENGTH_GREEN = '#22C55E';

export const AUTH_SHADOW = '0 30px 60px rgba(233, 101, 0, 0.15)';
export const AUTH_BORDER_RADIUS = 16;
export const AUTH_FONT = "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif";

export function validatePassword(password: string): { valid: boolean; hints: string[] } {
  const hints: string[] = [];
  if (password.length < 8) hints.push('It nht 8 ky tu');
  if (!/[A-Z]/.test(password)) hints.push('It nht 1 chu hoa (A-Z)');
  if (!/[a-z]/.test(password)) hints.push('It nht 1 chu thuong (a-z)');
  if (!/\d/.test(password)) hints.push('It nht 1 chu so (0-9)');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) hints.push('It nht 1 ky tu dbc (!@#$...)');
  return { valid: hints.length === 0, hints };
}

export function getPasswordStrength(password: string): { level: number; color: string; label: string } {
  if (!password) return { level: 0, color: AUTH_BORDER, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  if (score <= 1) return { level: 1, color: AUTH_DANGER, label: 'Yeu' };
  if (score <= 2) return { level: 2, color: AUTH_STRENGTH_ORANGE, label: 'Trung binh' };
  if (score <= 3) return { level: 3, color: AUTH_STRENGTH_YELLOW, label: 'Kha' };
  return { level: 4, color: AUTH_STRENGTH_GREEN, label: 'Manh' };
}

export function PasswordStrengthMeter({ password }: { readonly password: string }) {
  const strength = getPasswordStrength(password);
  const { hints } = validatePassword(password);
  if (!password) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: level <= strength.level + 1 && strength.level > 0 ? strength.color : AUTH_BORDER,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: strength.color }}>Do manh: {strength.label}</span>
        {strength.level < 4 && hints.length > 0 && (
          <span style={{ fontSize: 9, color: AUTH_TEXT_GRAY }}>Can: {hints[0]}</span>
        )}
      </div>
    </div>
  );
}
