/**
 * Kontaktní adresa dodavatelské větve (BigDealSupplier).
 *
 * TODO(rebranding): zbylá adresa na staré doméně — čeká na potvrzení nové
 * schránky po přechodu na GoBigDeal. Je tady schválně sama, aby se po
 * rebrandingu měnila na jediném místě: sahá na ni /suppliers i dialog
 * CreateBigDeal.
 */
export const SUPPLIER_EMAIL = 'obchod@swelt.cz';

/**
 * mailto s předmětem a volitelným tělem — tělo nese segmentaci z dialogu.
 *
 * Percent-encoding ručně, ne přes URLSearchParams: ten kóduje mezery jako `+`
 * (form encoding), což poštovní klient v těle zobrazí doslova jako plusy.
 */
export function supplierMailto(subject: string, body?: string): string {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${SUPPLIER_EMAIL}?${params.join('&')}`;
}
