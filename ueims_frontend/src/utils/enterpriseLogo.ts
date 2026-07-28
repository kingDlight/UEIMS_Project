// ============================================================
// ENTERPRISE LOGO RESOLVER
// ============================================================
// Some demo enterprises in our seed data do not carry a `logoUrl`.
// To keep the UI consistent (and to showcase who actually posted
// each job / who owns each profile), we fall back to a known
// public CDN URL keyed by a keyword match on the company name.
//
// Mapping is intentionally loose: `Momo` matches both "MoMo" and
// "Momo Vietnam" so the demo keeps working even after the
// training manager renames a row. New entries can be appended
// without touching the rest of the codebase — the resolver is
// the single source of truth.
// ============================================================

const LOGO_TABLE: { match: RegExp; url: string; label: string }[] = [
  { match: /momo/i, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/MoMo_Logo_App.svg/960px-MoMo_Logo_App.svg.png', label: 'MoMo' },
  { match: /shopee/i, url: 'https://cdn.aptoide.com/imgs/4/e/7/4e7c4da75f46e755fb8b012c9793b9df_icon.png', label: 'Shopee' },
  { match: /vng/i, url: 'https://mondialbrand.com/wp-content/uploads/2024/02/vng_corporation-logo_brandlogos.net_ysr15.png', label: 'VNG' },
  { match: /fpt/i, url: 'https://rubicmarketing.com/wp-content/uploads/2022/07/y-nghia-logo-fpt-lan-3.jpg', label: 'FPT' },
];

/**
 * Resolve a logo URL for the given enterprise. If the entity already
 * carries a non-empty `logoUrl`, return it as-is. Otherwise walk the
 * {@link LOGO_TABLE} looking for the first match on the company name.
 *
 * @returns The resolved URL, or `null` when no match is found.
 */
export function resolveEnterpriseLogo(companyName: string | null | undefined, explicitUrl?: string | null): string | null {
  const trimmed = explicitUrl?.trim();
  if (trimmed) return trimmed;
  if (!companyName) return null;
  const hit = LOGO_TABLE.find((entry) => entry.match.test(companyName));
  return hit ? hit.url : null;
}

/**
 * Two-letter initials for the avatar fallback (rendered when neither the
 * explicit `logoUrl` nor the {@link LOGO_TABLE} produces a usable image).
 */
export function enterpriseInitials(companyName: string | null | undefined): string {
  const source = (companyName || 'EN').trim();
  return source.substring(0, 2).toUpperCase();
}