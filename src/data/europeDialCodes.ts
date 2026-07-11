/** European country dial codes for the inquiry phone field.
 *  CZ and SK first (primary markets), then alphabetical by Czech name. */
export interface DialCode {
  /** ISO 3166-1 alpha-2 code (used to derive the flag emoji). */
  iso: string;
  /** Localised country name. */
  name: string;
  /** International dial code, e.g. "+420". */
  dial: string;
}

export const EUROPE_DIAL_CODES: DialCode[] = [
  { iso: 'CZ', name: 'Česko', dial: '+420' },
  { iso: 'SK', name: 'Slovensko', dial: '+421' },
  { iso: 'AL', name: 'Albánie', dial: '+355' },
  { iso: 'AD', name: 'Andorra', dial: '+376' },
  { iso: 'BE', name: 'Belgie', dial: '+32' },
  { iso: 'BY', name: 'Bělorusko', dial: '+375' },
  { iso: 'BA', name: 'Bosna a Hercegovina', dial: '+387' },
  { iso: 'BG', name: 'Bulharsko', dial: '+359' },
  { iso: 'ME', name: 'Černá Hora', dial: '+382' },
  { iso: 'DK', name: 'Dánsko', dial: '+45' },
  { iso: 'EE', name: 'Estonsko', dial: '+372' },
  { iso: 'FI', name: 'Finsko', dial: '+358' },
  { iso: 'FR', name: 'Francie', dial: '+33' },
  { iso: 'HR', name: 'Chorvatsko', dial: '+385' },
  { iso: 'IE', name: 'Irsko', dial: '+353' },
  { iso: 'IS', name: 'Island', dial: '+354' },
  { iso: 'IT', name: 'Itálie', dial: '+39' },
  { iso: 'XK', name: 'Kosovo', dial: '+383' },
  { iso: 'CY', name: 'Kypr', dial: '+357' },
  { iso: 'LI', name: 'Lichtenštejnsko', dial: '+423' },
  { iso: 'LT', name: 'Litva', dial: '+370' },
  { iso: 'LV', name: 'Lotyšsko', dial: '+371' },
  { iso: 'LU', name: 'Lucembursko', dial: '+352' },
  { iso: 'HU', name: 'Maďarsko', dial: '+36' },
  { iso: 'MT', name: 'Malta', dial: '+356' },
  { iso: 'MD', name: 'Moldavsko', dial: '+373' },
  { iso: 'MC', name: 'Monako', dial: '+377' },
  { iso: 'DE', name: 'Německo', dial: '+49' },
  { iso: 'NL', name: 'Nizozemsko', dial: '+31' },
  { iso: 'NO', name: 'Norsko', dial: '+47' },
  { iso: 'PL', name: 'Polsko', dial: '+48' },
  { iso: 'PT', name: 'Portugalsko', dial: '+351' },
  { iso: 'AT', name: 'Rakousko', dial: '+43' },
  { iso: 'RO', name: 'Rumunsko', dial: '+40' },
  { iso: 'GR', name: 'Řecko', dial: '+30' },
  { iso: 'SM', name: 'San Marino', dial: '+378' },
  { iso: 'MK', name: 'Severní Makedonie', dial: '+389' },
  { iso: 'RS', name: 'Srbsko', dial: '+381' },
  { iso: 'SI', name: 'Slovinsko', dial: '+386' },
  { iso: 'GB', name: 'Spojené království', dial: '+44' },
  { iso: 'ES', name: 'Španělsko', dial: '+34' },
  { iso: 'SE', name: 'Švédsko', dial: '+46' },
  { iso: 'CH', name: 'Švýcarsko', dial: '+41' },
  { iso: 'UA', name: 'Ukrajina', dial: '+380' },
  { iso: 'VA', name: 'Vatikán', dial: '+379' },
];

/** ISO alpha-2 → flag emoji (regional indicator symbols). */
export function flagEmoji(iso: string): string {
  return iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
