/**
 * Podklady dlaždic katalogu — jeden zdroj pravdy pro filtrační karusely
 * (koncerny, značky) i pro média na kartách dealů, aby měl koncern všude
 * stejnou barvu.
 *
 * Tóny jsou tlumené a chladné (rodina gradientu blue → cyan → emerald z
 * homepage). Wolt má pastelovou duhu; Swelt si drží luxusní klid.
 */
export const TINTS = [
  '#F1F5F9', // slate-100
  '#EFF6FF', // blue-50
  '#ECFEFF', // cyan-50
  '#ECFDF5', // emerald-50
  '#F5F3FF', // violet-50
  '#F4F4F5', // zinc-100
  '#F0F9FF', // sky-50
  '#F0FDFA', // teal-50
  '#EEF2FF', // indigo-50
  '#FAFAF9', // stone-50
] as const;

/** Stabilní tón podle textového klíče (slug koncernu, klíč značky). */
export function tintForKey(key: string | undefined): string {
  if (!key) return TINTS[5];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}
