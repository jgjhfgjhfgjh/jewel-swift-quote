/**
 * Kanonická adresa webu pro odkazy v e-mailech (potvrzení účtu, reset hesla,
 * změna e-mailu).
 *
 * Pozor: NEPOUŽÍVAT `window.location.origin` napřímo — když uživatel zrovna
 * prochází immutable preview deploy (např. `…-grkfbofur-….vercel.app`), zapsala
 * by se tahle dočasná adresa do e-mailu a odkaz by později 404oval / vedl na
 * starý build. Proto bereme pevnou doménu z VITE_SITE_URL a na origin padáme
 * jen v lokálním dev prostředí.
 */
export function siteUrl(): string {
  const fromEnv = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  return window.location.origin;
}
