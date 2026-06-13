/**
 * Checkout + orders translations.
 * CS + EN fully translated; all other languages fall back to EN.
 */
import { ALL_LANGS, type Lang } from './i18n';

export interface CheckoutText {
  checkoutButton: string;
  title: string;
  // step 1 — order type
  typeHeading: string;
  typeDropship: string;
  typeDropshipDesc: string;
  typeWholesale: string;
  typeWholesaleDesc: string;
  // step 2 — details
  endCustomerHeading: string;
  shipToHeading: string;
  name: string;
  company: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  contactHint: string;
  shippingMethod: string;
  codLabel: string;
  codAmount: string;
  codNotSupported: string;
  externalRef: string;
  externalRefHint: string;
  note: string;
  brandingLabel: string;
  brandingPartner: string;
  brandingSwelt: string;
  brandingNeutral: string;
  // step 3 — summary
  summaryHeading: string;
  items: string;
  shipping: string;
  vatNote: string;
  subtotal: string;
  submit: string;
  back: string;
  next: string;
  // result
  successHeading: string;
  successOrderNumber: string;
  awaitingPaymentInfo: string;
  forwardedInfo: string;
  totalInclVat: string;
  close: string;
  viewOrders: string;
  errorGeneric: string;
  required: string;
}

const cs: CheckoutText = {
  checkoutButton: 'Objednat',
  title: 'Dokončení objednávky',
  typeHeading: 'Typ objednávky',
  typeDropship: 'Dropshipping',
  typeDropshipDesc: 'Zásilka jde přímo vašemu koncovému zákazníkovi pod vaší značkou (white-label).',
  typeWholesale: 'Velkoobchod',
  typeWholesaleDesc: 'Zásilka jde na vaši adresu / do vašeho skladu.',
  endCustomerHeading: 'Koncový zákazník (doručovací údaje)',
  shipToHeading: 'Doručovací adresa',
  name: 'Jméno a příjmení',
  company: 'Firma (volitelné)',
  street: 'Ulice a číslo',
  city: 'Město',
  zip: 'PSČ',
  country: 'Země',
  phone: 'Telefon',
  email: 'E-mail',
  contactHint: 'U dropshipu vyplňte telefon nebo e-mail — dopravce potřebuje kontakt na příjemce.',
  shippingMethod: 'Doprava',
  codLabel: 'Dobírka (zákazník platí při převzetí)',
  codAmount: 'Částka dobírky (€)',
  codNotSupported: 'Zvolený dopravce dobírku nepodporuje.',
  externalRef: 'Číslo objednávky z vašeho e-shopu',
  externalRefHint: 'Propíše se na doklady a do komunikace s dodavatelem.',
  note: 'Poznámka k objednávce',
  brandingLabel: 'Branding zásilky a dokladů',
  brandingPartner: 'Moje značka (white-label)',
  brandingSwelt: 'swelt.partner',
  brandingNeutral: 'Neutrální',
  summaryHeading: 'Souhrn objednávky',
  items: 'Položky',
  shipping: 'Doprava',
  vatNote: 'DPH se vypočte dle vašich fakturačních údajů (země, DIČ) při potvrzení.',
  subtotal: 'Mezisoučet bez DPH',
  submit: 'Závazně objednat',
  back: 'Zpět',
  next: 'Pokračovat',
  successHeading: 'Objednávka přijata',
  successOrderNumber: 'Číslo objednávky',
  awaitingPaymentInfo: 'Objednávka čeká na úhradu. Platební údaje vám zašleme e-mailem; po připsání platby ji ihned předáme k expedici.',
  forwardedInfo: 'Objednávka byla automaticky předána dodavateli k expedici. O odeslání vás budeme informovat.',
  totalInclVat: 'Celkem vč. DPH',
  close: 'Zavřít',
  viewOrders: 'Moje objednávky',
  errorGeneric: 'Objednávku se nepodařilo vytvořit',
  required: 'Vyplňte povinná pole',
};

const en: CheckoutText = {
  checkoutButton: 'Place order',
  title: 'Checkout',
  typeHeading: 'Order type',
  typeDropship: 'Dropshipping',
  typeDropshipDesc: 'The parcel goes directly to your end customer under your brand (white-label).',
  typeWholesale: 'Wholesale',
  typeWholesaleDesc: 'The parcel goes to your address / warehouse.',
  endCustomerHeading: 'End customer (delivery details)',
  shipToHeading: 'Delivery address',
  name: 'Full name',
  company: 'Company (optional)',
  street: 'Street and number',
  city: 'City',
  zip: 'ZIP',
  country: 'Country',
  phone: 'Phone',
  email: 'E-mail',
  contactHint: 'For dropship orders fill in a phone or e-mail — the carrier needs a recipient contact.',
  shippingMethod: 'Shipping',
  codLabel: 'Cash on delivery',
  codAmount: 'COD amount (€)',
  codNotSupported: 'The selected carrier does not support COD.',
  externalRef: 'Your e-shop order number',
  externalRefHint: 'Shown on documents and passed to the supplier.',
  note: 'Order note',
  brandingLabel: 'Parcel & documents branding',
  brandingPartner: 'My brand (white-label)',
  brandingSwelt: 'swelt.partner',
  brandingNeutral: 'Neutral',
  summaryHeading: 'Order summary',
  items: 'Items',
  shipping: 'Shipping',
  vatNote: 'VAT is calculated from your billing details (country, VAT ID) on confirmation.',
  subtotal: 'Subtotal excl. VAT',
  submit: 'Place binding order',
  back: 'Back',
  next: 'Continue',
  successHeading: 'Order received',
  successOrderNumber: 'Order number',
  awaitingPaymentInfo: 'The order awaits payment. We will e-mail you the payment details; once paid it is forwarded for fulfilment immediately.',
  forwardedInfo: 'The order has been automatically forwarded to the supplier for fulfilment. We will notify you when it ships.',
  totalInclVat: 'Total incl. VAT',
  close: 'Close',
  viewOrders: 'My orders',
  errorGeneric: 'Failed to create the order',
  required: 'Please fill in the required fields',
};

export const checkoutText: Record<Lang, CheckoutText> = Object.fromEntries(
  ALL_LANGS.map((l) => [l, l === 'cs' ? cs : en])
) as Record<Lang, CheckoutText>;

/** EU member states (ISO2 → Czech label); market scope is EU-only. */
export const EU_COUNTRIES: { code: string; label: string }[] = [
  { code: 'AT', label: 'Rakousko' },
  { code: 'BE', label: 'Belgie' },
  { code: 'BG', label: 'Bulharsko' },
  { code: 'HR', label: 'Chorvatsko' },
  { code: 'CY', label: 'Kypr' },
  { code: 'CZ', label: 'Česko' },
  { code: 'DK', label: 'Dánsko' },
  { code: 'EE', label: 'Estonsko' },
  { code: 'FI', label: 'Finsko' },
  { code: 'FR', label: 'Francie' },
  { code: 'DE', label: 'Německo' },
  { code: 'GR', label: 'Řecko' },
  { code: 'HU', label: 'Maďarsko' },
  { code: 'IE', label: 'Irsko' },
  { code: 'IT', label: 'Itálie' },
  { code: 'LV', label: 'Lotyšsko' },
  { code: 'LT', label: 'Litva' },
  { code: 'LU', label: 'Lucembursko' },
  { code: 'MT', label: 'Malta' },
  { code: 'NL', label: 'Nizozemsko' },
  { code: 'PL', label: 'Polsko' },
  { code: 'PT', label: 'Portugalsko' },
  { code: 'RO', label: 'Rumunsko' },
  { code: 'SK', label: 'Slovensko' },
  { code: 'SI', label: 'Slovinsko' },
  { code: 'ES', label: 'Španělsko' },
  { code: 'SE', label: 'Švédsko' },
];
