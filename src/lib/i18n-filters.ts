/**
 * Filter label translations.
 *
 * IMPORTANT: filter values (sent to RPC) remain in Czech – this file only
 * translates display labels. Lookup is by Czech key. If a label has no
 * translation for a given language, it falls back to the Czech original
 * so the UI never shows blanks.
 */
import type { Lang } from './i18n';

type Map = Record<string, string>;

/* ── Gender values (from "Určení" parameter) ────────────────────────────── */

export const GENDER_TRANSLATIONS: Record<Lang, Map> = {
  cs: { 'Pro muže': 'Muži', 'Pro ženy': 'Ženy', 'Pro děti': 'Děti', 'Unisex': 'Unisex' },
  sk: { 'Pro muže': 'Muži', 'Pro ženy': 'Ženy', 'Pro děti': 'Deti', 'Unisex': 'Unisex' },
  pl: { 'Pro muže': 'Mężczyźni', 'Pro ženy': 'Kobiety', 'Pro děti': 'Dzieci', 'Unisex': 'Unisex' },
  de: { 'Pro muže': 'Herren', 'Pro ženy': 'Damen', 'Pro děti': 'Kinder', 'Unisex': 'Unisex' },
  en: { 'Pro muže': 'Men', 'Pro ženy': 'Women', 'Pro děti': 'Kids', 'Unisex': 'Unisex' },
  fr: { 'Pro muže': 'Hommes', 'Pro ženy': 'Femmes', 'Pro děti': 'Enfants', 'Unisex': 'Unisexe' },
  es: { 'Pro muže': 'Hombre', 'Pro ženy': 'Mujer', 'Pro děti': 'Niños', 'Unisex': 'Unisex' },
  it: { 'Pro muže': 'Uomo', 'Pro ženy': 'Donna', 'Pro děti': 'Bambini', 'Unisex': 'Unisex' },
  nl: { 'Pro muže': 'Heren', 'Pro ženy': 'Dames', 'Pro děti': 'Kinderen', 'Unisex': 'Unisex' },
  pt: { 'Pro muže': 'Homem', 'Pro ženy': 'Mulher', 'Pro děti': 'Crianças', 'Unisex': 'Unissexo' },
  hu: { 'Pro muže': 'Férfiak', 'Pro ženy': 'Nők', 'Pro děti': 'Gyerekek', 'Unisex': 'Uniszex' },
  ro: { 'Pro muže': 'Bărbați', 'Pro ženy': 'Femei', 'Pro děti': 'Copii', 'Unisex': 'Unisex' },
  sv: { 'Pro muže': 'Herr', 'Pro ženy': 'Dam', 'Pro děti': 'Barn', 'Unisex': 'Unisex' },
  da: { 'Pro muže': 'Herre', 'Pro ženy': 'Dame', 'Pro děti': 'Børn', 'Unisex': 'Unisex' },
  fi: { 'Pro muže': 'Miehet', 'Pro ženy': 'Naiset', 'Pro děti': 'Lapset', 'Unisex': 'Unisex' },
  no: { 'Pro muže': 'Herre', 'Pro ženy': 'Dame', 'Pro děti': 'Barn', 'Unisex': 'Unisex' },
  el: { 'Pro muže': 'Άνδρες', 'Pro ženy': 'Γυναίκες', 'Pro děti': 'Παιδιά', 'Unisex': 'Unisex' },
  is: { 'Pro muže': 'Karlar', 'Pro ženy': 'Konur', 'Pro děti': 'Börn', 'Unisex': 'Kynhlutlaust' },
};

/* ── Category labels ────────────────────────────────────────────────────── */

export const CATEGORY_TRANSLATIONS: Record<Lang, Map> = {
  cs: { 'Hodinky': 'Hodinky', 'Šperky': 'Šperky', 'Příslušenství': 'Příslušenství' },
  sk: { 'Hodinky': 'Hodinky', 'Šperky': 'Šperky', 'Příslušenství': 'Príslušenstvo' },
  pl: { 'Hodinky': 'Zegarki', 'Šperky': 'Biżuteria', 'Příslušenství': 'Akcesoria' },
  de: { 'Hodinky': 'Uhren', 'Šperky': 'Schmuck', 'Příslušenství': 'Zubehör' },
  en: { 'Hodinky': 'Watches', 'Šperky': 'Jewelry', 'Příslušenství': 'Accessories' },
  fr: { 'Hodinky': 'Montres', 'Šperky': 'Bijoux', 'Příslušenství': 'Accessoires' },
  es: { 'Hodinky': 'Relojes', 'Šperky': 'Joyería', 'Příslušenství': 'Accesorios' },
  it: { 'Hodinky': 'Orologi', 'Šperky': 'Gioielli', 'Příslušenství': 'Accessori' },
  nl: { 'Hodinky': 'Horloges', 'Šperky': 'Sieraden', 'Příslušenství': 'Accessoires' },
  pt: { 'Hodinky': 'Relógios', 'Šperky': 'Joias', 'Příslušenství': 'Acessórios' },
  hu: { 'Hodinky': 'Órák', 'Šperky': 'Ékszerek', 'Příslušenství': 'Kiegészítők' },
  ro: { 'Hodinky': 'Ceasuri', 'Šperky': 'Bijuterii', 'Příslušenství': 'Accesorii' },
  sv: { 'Hodinky': 'Klockor', 'Šperky': 'Smycken', 'Příslušenství': 'Tillbehör' },
  da: { 'Hodinky': 'Ure', 'Šperky': 'Smykker', 'Příslušenství': 'Tilbehør' },
  fi: { 'Hodinky': 'Kellot', 'Šperky': 'Korut', 'Příslušenství': 'Asusteet' },
  no: { 'Hodinky': 'Klokker', 'Šperky': 'Smykker', 'Příslušenství': 'Tilbehør' },
  el: { 'Hodinky': 'Ρολόγια', 'Šperky': 'Κοσμήματα', 'Příslušenství': 'Αξεσουάρ' },
  is: { 'Hodinky': 'Úr', 'Šperky': 'Skartgripir', 'Příslušenství': 'Fylgihlutir' },
};

/* ── Parameter NAMES (the section titles in the sidebar) ────────────────── */

const cs_p: Map = {
  'Určení': 'Určení', 'Balení': 'Balení', 'Osazení': 'Osazení',
  'Materiál pouzdra': 'Materiál pouzdra', 'Řemínek/tah': 'Řemínek/tah',
  'Vodotěsnost': 'Vodotěsnost', 'Typ skla': 'Typ skla',
  'Barva ciferníku': 'Barva ciferníku', 'Barva pouzdra': 'Barva pouzdra',
  'Tvar pouzdra': 'Tvar pouzdra', 'Země původu': 'Země původu',
  'Barva řemínku/tahu': 'Barva řemínku/tahu', 'Materiál': 'Materiál',
  'Modelová řada': 'Modelová řada', 'Typ šperku': 'Typ šperku',
  'Povrchová úprava': 'Povrchová úprava', 'Princip čištění': 'Princip čištění',
  'Funkce': 'Funkce', 'Typ hodinek': 'Typ hodinek', 'Typ strojku': 'Typ strojku',
  'Průměr ciferníku': 'Průměr ciferníku', 'Typ zapínání - šperk': 'Typ zapínání - šperk',
  'Barva': 'Barva', 'Chronograf': 'Chronograf', 'Velikost ciferníku': 'Velikost ciferníku',
  'Délka': 'Délka', 'Šířka řemínku/tahu': 'Šířka řemínku/tahu',
  'Design/ Motiv': 'Design / Motiv', 'Ryzost': 'Ryzost', 'Typ náušnic': 'Typ náušnic',
  'Velikost': 'Velikost',
};

const sk_p: Map = {
  'Určení': 'Určenie', 'Balení': 'Balenie', 'Osazení': 'Osadenie',
  'Materiál pouzdra': 'Materiál puzdra', 'Řemínek/tah': 'Remienok/náramok',
  'Vodotěsnost': 'Vodotesnosť', 'Typ skla': 'Typ skla',
  'Barva ciferníku': 'Farba ciferníka', 'Barva pouzdra': 'Farba puzdra',
  'Tvar pouzdra': 'Tvar puzdra', 'Země původu': 'Krajina pôvodu',
  'Barva řemínku/tahu': 'Farba remienka', 'Materiál': 'Materiál',
  'Modelová řada': 'Modelový rad', 'Typ šperku': 'Typ šperku',
  'Povrchová úprava': 'Povrchová úprava', 'Princip čištění': 'Princíp čistenia',
  'Funkce': 'Funkcie', 'Typ hodinek': 'Typ hodiniek', 'Typ strojku': 'Typ strojčeka',
  'Průměr ciferníku': 'Priemer ciferníka', 'Typ zapínání - šperk': 'Typ zapínania',
  'Barva': 'Farba', 'Chronograf': 'Chronograf', 'Velikost ciferníku': 'Veľkosť ciferníka',
  'Délka': 'Dĺžka', 'Šířka řemínku/tahu': 'Šírka remienka',
  'Design/ Motiv': 'Dizajn / Motív', 'Ryzost': 'Rýdzosť', 'Typ náušnic': 'Typ náušníc',
  'Velikost': 'Veľkosť',
};

const pl_p: Map = {
  'Určení': 'Przeznaczenie', 'Balení': 'Opakowanie', 'Osazení': 'Oprawa',
  'Materiál pouzdra': 'Materiał koperty', 'Řemínek/tah': 'Pasek/bransoleta',
  'Vodotěsnost': 'Wodoodporność', 'Typ skla': 'Typ szkła',
  'Barva ciferníku': 'Kolor tarczy', 'Barva pouzdra': 'Kolor koperty',
  'Tvar pouzdra': 'Kształt koperty', 'Země původu': 'Kraj pochodzenia',
  'Barva řemínku/tahu': 'Kolor paska', 'Materiál': 'Materiał',
  'Modelová řada': 'Linia modelowa', 'Typ šperku': 'Typ biżuterii',
  'Povrchová úprava': 'Wykończenie', 'Princip čištění': 'Sposób czyszczenia',
  'Funkce': 'Funkcje', 'Typ hodinek': 'Typ zegarka', 'Typ strojku': 'Typ mechanizmu',
  'Průměr ciferníku': 'Średnica tarczy', 'Typ zapínání - šperk': 'Typ zapięcia',
  'Barva': 'Kolor', 'Chronograf': 'Chronograf', 'Velikost ciferníku': 'Wielkość tarczy',
  'Délka': 'Długość', 'Šířka řemínku/tahu': 'Szerokość paska',
  'Design/ Motiv': 'Wzór / Motyw', 'Ryzost': 'Próba', 'Typ náušnic': 'Typ kolczyków',
  'Velikost': 'Rozmiar',
};

const de_p: Map = {
  'Určení': 'Geeignet für', 'Balení': 'Verpackung', 'Osazení': 'Steinbesatz',
  'Materiál pouzdra': 'Gehäusematerial', 'Řemínek/tah': 'Armband',
  'Vodotěsnost': 'Wasserdichtheit', 'Typ skla': 'Glasart',
  'Barva ciferníku': 'Zifferblattfarbe', 'Barva pouzdra': 'Gehäusefarbe',
  'Tvar pouzdra': 'Gehäuseform', 'Země původu': 'Herkunftsland',
  'Barva řemínku/tahu': 'Armbandfarbe', 'Materiál': 'Material',
  'Modelová řada': 'Modellreihe', 'Typ šperku': 'Schmuckart',
  'Povrchová úprava': 'Oberfläche', 'Princip čištění': 'Reinigung',
  'Funkce': 'Funktionen', 'Typ hodinek': 'Uhrentyp', 'Typ strojku': 'Werktyp',
  'Průměr ciferníku': 'Zifferblattdurchmesser', 'Typ zapínání - šperk': 'Verschlusstyp',
  'Barva': 'Farbe', 'Chronograf': 'Chronograph', 'Velikost ciferníku': 'Zifferblattgröße',
  'Délka': 'Länge', 'Šířka řemínku/tahu': 'Armbandbreite',
  'Design/ Motiv': 'Design / Motiv', 'Ryzost': 'Feingehalt', 'Typ náušnic': 'Ohrringart',
  'Velikost': 'Größe',
};

const en_p: Map = {
  'Určení': 'Intended for', 'Balení': 'Packaging', 'Osazení': 'Stone setting',
  'Materiál pouzdra': 'Case material', 'Řemínek/tah': 'Strap/Bracelet',
  'Vodotěsnost': 'Water resistance', 'Typ skla': 'Crystal type',
  'Barva ciferníku': 'Dial color', 'Barva pouzdra': 'Case color',
  'Tvar pouzdra': 'Case shape', 'Země původu': 'Country of origin',
  'Barva řemínku/tahu': 'Strap color', 'Materiál': 'Material',
  'Modelová řada': 'Collection', 'Typ šperku': 'Jewelry type',
  'Povrchová úprava': 'Finish', 'Princip čištění': 'Cleaning method',
  'Funkce': 'Features', 'Typ hodinek': 'Watch type', 'Typ strojku': 'Movement type',
  'Průměr ciferníku': 'Dial diameter', 'Typ zapínání - šperk': 'Clasp type',
  'Barva': 'Color', 'Chronograf': 'Chronograph', 'Velikost ciferníku': 'Dial size',
  'Délka': 'Length', 'Šířka řemínku/tahu': 'Strap width',
  'Design/ Motiv': 'Design / Motif', 'Ryzost': 'Purity', 'Typ náušnic': 'Earring type',
  'Velikost': 'Size',
};

const fr_p: Map = {
  'Určení': 'Destiné à', 'Balení': 'Emballage', 'Osazení': 'Sertissage',
  'Materiál pouzdra': 'Matériau du boîtier', 'Řemínek/tah': 'Bracelet',
  'Vodotěsnost': 'Étanchéité', 'Typ skla': 'Type de verre',
  'Barva ciferníku': 'Couleur du cadran', 'Barva pouzdra': 'Couleur du boîtier',
  'Tvar pouzdra': 'Forme du boîtier', 'Země původu': "Pays d'origine",
  'Barva řemínku/tahu': 'Couleur du bracelet', 'Materiál': 'Matériau',
  'Modelová řada': 'Collection', 'Typ šperku': 'Type de bijou',
  'Povrchová úprava': 'Finition', 'Princip čištění': 'Méthode de nettoyage',
  'Funkce': 'Fonctions', 'Typ hodinek': 'Type de montre', 'Typ strojku': 'Type de mouvement',
  'Průměr ciferníku': 'Diamètre du cadran', 'Typ zapínání - šperk': 'Type de fermoir',
  'Barva': 'Couleur', 'Chronograf': 'Chronographe', 'Velikost ciferníku': 'Taille du cadran',
  'Délka': 'Longueur', 'Šířka řemínku/tahu': 'Largeur du bracelet',
  'Design/ Motiv': 'Design / Motif', 'Ryzost': 'Pureté', 'Typ náušnic': 'Type de boucles',
  'Velikost': 'Taille',
};

const es_p: Map = {
  'Určení': 'Destinado a', 'Balení': 'Embalaje', 'Osazení': 'Engaste',
  'Materiál pouzdra': 'Material de la caja', 'Řemínek/tah': 'Correa',
  'Vodotěsnost': 'Resistencia al agua', 'Typ skla': 'Tipo de cristal',
  'Barva ciferníku': 'Color de la esfera', 'Barva pouzdra': 'Color de la caja',
  'Tvar pouzdra': 'Forma de la caja', 'Země původu': 'País de origen',
  'Barva řemínku/tahu': 'Color de la correa', 'Materiál': 'Material',
  'Modelová řada': 'Colección', 'Typ šperku': 'Tipo de joya',
  'Povrchová úprava': 'Acabado', 'Princip čištění': 'Método de limpieza',
  'Funkce': 'Funciones', 'Typ hodinek': 'Tipo de reloj', 'Typ strojku': 'Tipo de movimiento',
  'Průměr ciferníku': 'Diámetro de esfera', 'Typ zapínání - šperk': 'Tipo de cierre',
  'Barva': 'Color', 'Chronograf': 'Cronógrafo', 'Velikost ciferníku': 'Tamaño de esfera',
  'Délka': 'Largo', 'Šířka řemínku/tahu': 'Ancho de correa',
  'Design/ Motiv': 'Diseño / Motivo', 'Ryzost': 'Pureza', 'Typ náušnic': 'Tipo de pendientes',
  'Velikost': 'Tamaño',
};

const it_p: Map = {
  'Určení': 'Destinato a', 'Balení': 'Confezione', 'Osazení': 'Castone',
  'Materiál pouzdra': 'Materiale cassa', 'Řemínek/tah': 'Cinturino',
  'Vodotěsnost': 'Impermeabilità', 'Typ skla': 'Tipo di vetro',
  'Barva ciferníku': 'Colore quadrante', 'Barva pouzdra': 'Colore cassa',
  'Tvar pouzdra': 'Forma cassa', 'Země původu': 'Paese di origine',
  'Barva řemínku/tahu': 'Colore cinturino', 'Materiál': 'Materiale',
  'Modelová řada': 'Collezione', 'Typ šperku': 'Tipo di gioiello',
  'Povrchová úprava': 'Finitura', 'Princip čištění': 'Metodo di pulizia',
  'Funkce': 'Funzioni', 'Typ hodinek': 'Tipo di orologio', 'Typ strojku': 'Tipo di movimento',
  'Průměr ciferníku': 'Diametro quadrante', 'Typ zapínání - šperk': 'Tipo di chiusura',
  'Barva': 'Colore', 'Chronograf': 'Cronografo', 'Velikost ciferníku': 'Dimensione quadrante',
  'Délka': 'Lunghezza', 'Šířka řemínku/tahu': 'Larghezza cinturino',
  'Design/ Motiv': 'Design / Motivo', 'Ryzost': 'Purezza', 'Typ náušnic': 'Tipo di orecchini',
  'Velikost': 'Misura',
};

const nl_p: Map = {
  'Určení': 'Bedoeld voor', 'Balení': 'Verpakking', 'Osazení': 'Zetting',
  'Materiál pouzdra': 'Kastmateriaal', 'Řemínek/tah': 'Band',
  'Vodotěsnost': 'Waterbestendigheid', 'Typ skla': 'Glassoort',
  'Barva ciferníku': 'Wijzerplaatkleur', 'Barva pouzdra': 'Kastkleur',
  'Tvar pouzdra': 'Kastvorm', 'Země původu': 'Land van herkomst',
  'Barva řemínku/tahu': 'Bandkleur', 'Materiál': 'Materiaal',
  'Modelová řada': 'Collectie', 'Typ šperku': 'Sieraadtype',
  'Povrchová úprava': 'Afwerking', 'Princip čištění': 'Reinigingsmethode',
  'Funkce': 'Functies', 'Typ hodinek': 'Horlogetype', 'Typ strojku': 'Uurwerktype',
  'Průměr ciferníku': 'Wijzerplaatdiameter', 'Typ zapínání - šperk': 'Sluitingstype',
  'Barva': 'Kleur', 'Chronograf': 'Chronograaf', 'Velikost ciferníku': 'Wijzerplaatgrootte',
  'Délka': 'Lengte', 'Šířka řemínku/tahu': 'Bandbreedte',
  'Design/ Motiv': 'Ontwerp / Motief', 'Ryzost': 'Zuiverheid', 'Typ náušnic': 'Type oorbellen',
  'Velikost': 'Maat',
};

const pt_p: Map = {
  'Určení': 'Destinado a', 'Balení': 'Embalagem', 'Osazení': 'Cravação',
  'Materiál pouzdra': 'Material da caixa', 'Řemínek/tah': 'Bracelete',
  'Vodotěsnost': 'Resistência à água', 'Typ skla': 'Tipo de vidro',
  'Barva ciferníku': 'Cor do mostrador', 'Barva pouzdra': 'Cor da caixa',
  'Tvar pouzdra': 'Forma da caixa', 'Země původu': 'País de origem',
  'Barva řemínku/tahu': 'Cor da bracelete', 'Materiál': 'Material',
  'Modelová řada': 'Coleção', 'Typ šperku': 'Tipo de joia',
  'Povrchová úprava': 'Acabamento', 'Princip čištění': 'Método de limpeza',
  'Funkce': 'Funções', 'Typ hodinek': 'Tipo de relógio', 'Typ strojku': 'Tipo de movimento',
  'Průměr ciferníku': 'Diâmetro do mostrador', 'Typ zapínání - šperk': 'Tipo de fecho',
  'Barva': 'Cor', 'Chronograf': 'Cronógrafo', 'Velikost ciferníku': 'Tamanho do mostrador',
  'Délka': 'Comprimento', 'Šířka řemínku/tahu': 'Largura da bracelete',
  'Design/ Motiv': 'Design / Motivo', 'Ryzost': 'Pureza', 'Typ náušnic': 'Tipo de brincos',
  'Velikost': 'Tamanho',
};

const hu_p: Map = {
  'Určení': 'Kinek szól', 'Balení': 'Csomagolás', 'Osazení': 'Foglalat',
  'Materiál pouzdra': 'Tok anyaga', 'Řemínek/tah': 'Szíj/Csat',
  'Vodotěsnost': 'Vízállóság', 'Typ skla': 'Üveg típusa',
  'Barva ciferníku': 'Számlap színe', 'Barva pouzdra': 'Tok színe',
  'Tvar pouzdra': 'Tok formája', 'Země původu': 'Származási ország',
  'Barva řemínku/tahu': 'Szíj színe', 'Materiál': 'Anyag',
  'Modelová řada': 'Kollekció', 'Typ šperku': 'Ékszer típusa',
  'Povrchová úprava': 'Felület', 'Princip čištění': 'Tisztítás',
  'Funkce': 'Funkciók', 'Typ hodinek': 'Óra típusa', 'Typ strojku': 'Szerkezet típusa',
  'Průměr ciferníku': 'Számlap átmérője', 'Typ zapínání - šperk': 'Zár típusa',
  'Barva': 'Szín', 'Chronograf': 'Kronográf', 'Velikost ciferníku': 'Számlap mérete',
  'Délka': 'Hossz', 'Šířka řemínku/tahu': 'Szíj szélessége',
  'Design/ Motiv': 'Design / Minta', 'Ryzost': 'Finomság', 'Typ náušnic': 'Fülbevaló típusa',
  'Velikost': 'Méret',
};

const ro_p: Map = {
  'Určení': 'Destinat pentru', 'Balení': 'Ambalaj', 'Osazení': 'Montură',
  'Materiál pouzdra': 'Material carcasă', 'Řemínek/tah': 'Curea/Brățară',
  'Vodotěsnost': 'Rezistență la apă', 'Typ skla': 'Tip sticlă',
  'Barva ciferníku': 'Culoare cadran', 'Barva pouzdra': 'Culoare carcasă',
  'Tvar pouzdra': 'Forma carcasei', 'Země původu': 'Țara de origine',
  'Barva řemínku/tahu': 'Culoare curea', 'Materiál': 'Material',
  'Modelová řada': 'Colecție', 'Typ šperku': 'Tip bijuterie',
  'Povrchová úprava': 'Finisaj', 'Princip čištění': 'Metodă de curățare',
  'Funkce': 'Funcții', 'Typ hodinek': 'Tip ceas', 'Typ strojku': 'Tip mecanism',
  'Průměr ciferníku': 'Diametru cadran', 'Typ zapínání - šperk': 'Tip închidere',
  'Barva': 'Culoare', 'Chronograf': 'Cronograf', 'Velikost ciferníku': 'Mărime cadran',
  'Délka': 'Lungime', 'Šířka řemínku/tahu': 'Lățime curea',
  'Design/ Motiv': 'Design / Motiv', 'Ryzost': 'Puritate', 'Typ náušnic': 'Tip cercei',
  'Velikost': 'Mărime',
};

const sv_p: Map = {
  'Určení': 'Avsedd för', 'Balení': 'Förpackning', 'Osazení': 'Infattning',
  'Materiál pouzdra': 'Boetmaterial', 'Řemínek/tah': 'Armband',
  'Vodotěsnost': 'Vattentäthet', 'Typ skla': 'Glastyp',
  'Barva ciferníku': 'Urtavlefärg', 'Barva pouzdra': 'Boettfärg',
  'Tvar pouzdra': 'Boettform', 'Země původu': 'Ursprungsland',
  'Barva řemínku/tahu': 'Armbandsfärg', 'Materiál': 'Material',
  'Modelová řada': 'Kollektion', 'Typ šperku': 'Smyckestyp',
  'Povrchová úprava': 'Ytbehandling', 'Princip čištění': 'Rengöringsmetod',
  'Funkce': 'Funktioner', 'Typ hodinek': 'Klocktyp', 'Typ strojku': 'Verktyp',
  'Průměr ciferníku': 'Urtavlediameter', 'Typ zapínání - šperk': 'Låstyp',
  'Barva': 'Färg', 'Chronograf': 'Kronograf', 'Velikost ciferníku': 'Urtavlestorlek',
  'Délka': 'Längd', 'Šířka řemínku/tahu': 'Armbandsbredd',
  'Design/ Motiv': 'Design / Motiv', 'Ryzost': 'Renhet', 'Typ náušnic': 'Örhängestyp',
  'Velikost': 'Storlek',
};

const da_p: Map = {
  'Určení': 'Beregnet til', 'Balení': 'Emballage', 'Osazení': 'Indfatning',
  'Materiál pouzdra': 'Kassemateriale', 'Řemínek/tah': 'Rem',
  'Vodotěsnost': 'Vandtæthed', 'Typ skla': 'Glastype',
  'Barva ciferníku': 'Skivefarve', 'Barva pouzdra': 'Kassefarve',
  'Tvar pouzdra': 'Kasseform', 'Země původu': 'Oprindelsesland',
  'Barva řemínku/tahu': 'Remfarve', 'Materiál': 'Materiale',
  'Modelová řada': 'Kollektion', 'Typ šperku': 'Smykketype',
  'Povrchová úprava': 'Overflade', 'Princip čištění': 'Rengøringsmetode',
  'Funkce': 'Funktioner', 'Typ hodinek': 'Urtype', 'Typ strojku': 'Værktype',
  'Průměr ciferníku': 'Skivediameter', 'Typ zapínání - šperk': 'Låsetype',
  'Barva': 'Farve', 'Chronograf': 'Kronograf', 'Velikost ciferníku': 'Skivestørrelse',
  'Délka': 'Længde', 'Šířka řemínku/tahu': 'Rembredde',
  'Design/ Motiv': 'Design / Motiv', 'Ryzost': 'Renhed', 'Typ náušnic': 'Øreringstype',
  'Velikost': 'Størrelse',
};

const fi_p: Map = {
  'Určení': 'Tarkoitettu', 'Balení': 'Pakkaus', 'Osazení': 'Istukka',
  'Materiál pouzdra': 'Kotelon materiaali', 'Řemínek/tah': 'Ranneke',
  'Vodotěsnost': 'Vesitiiviys', 'Typ skla': 'Lasin tyyppi',
  'Barva ciferníku': 'Kellotaulun väri', 'Barva pouzdra': 'Kotelon väri',
  'Tvar pouzdra': 'Kotelon muoto', 'Země původu': 'Alkuperämaa',
  'Barva řemínku/tahu': 'Rannekkeen väri', 'Materiál': 'Materiaali',
  'Modelová řada': 'Mallisto', 'Typ šperku': 'Korun tyyppi',
  'Povrchová úprava': 'Pinnoite', 'Princip čištění': 'Puhdistustapa',
  'Funkce': 'Toiminnot', 'Typ hodinek': 'Kellon tyyppi', 'Typ strojku': 'Koneiston tyyppi',
  'Průměr ciferníku': 'Kellotaulun halkaisija', 'Typ zapínání - šperk': 'Lukon tyyppi',
  'Barva': 'Väri', 'Chronograf': 'Kronografi', 'Velikost ciferníku': 'Kellotaulun koko',
  'Délka': 'Pituus', 'Šířka řemínku/tahu': 'Rannekkeen leveys',
  'Design/ Motiv': 'Design / Motiivi', 'Ryzost': 'Puhtaus', 'Typ náušnic': 'Korvakorujen tyyppi',
  'Velikost': 'Koko',
};

const no_p: Map = {
  'Určení': 'Beregnet for', 'Balení': 'Emballasje', 'Osazení': 'Innfatning',
  'Materiál pouzdra': 'Kassemateriale', 'Řemínek/tah': 'Rem',
  'Vodotěsnost': 'Vanntetthet', 'Typ skla': 'Glasstype',
  'Barva ciferníku': 'Skivefarge', 'Barva pouzdra': 'Kassefarge',
  'Tvar pouzdra': 'Kasseform', 'Země původu': 'Opprinnelsesland',
  'Barva řemínku/tahu': 'Remfarge', 'Materiál': 'Materiale',
  'Modelová řada': 'Kolleksjon', 'Typ šperku': 'Smykketype',
  'Povrchová úprava': 'Overflate', 'Princip čištění': 'Rengjøringsmetode',
  'Funkce': 'Funksjoner', 'Typ hodinek': 'Urtype', 'Typ strojku': 'Verkstype',
  'Průměr ciferníku': 'Skivediameter', 'Typ zapínání - šperk': 'Låsetype',
  'Barva': 'Farge', 'Chronograf': 'Kronograf', 'Velikost ciferníku': 'Skivestørrelse',
  'Délka': 'Lengde', 'Šířka řemínku/tahu': 'Rembredde',
  'Design/ Motiv': 'Design / Motiv', 'Ryzost': 'Renhet', 'Typ náušnic': 'Øredobbtype',
  'Velikost': 'Størrelse',
};

const el_p: Map = {
  'Určení': 'Προορίζεται για', 'Balení': 'Συσκευασία', 'Osazení': 'Δέσιμο',
  'Materiál pouzdra': 'Υλικό κάσας', 'Řemínek/tah': 'Λουράκι',
  'Vodotěsnost': 'Αντοχή στο νερό', 'Typ skla': 'Τύπος γυαλιού',
  'Barva ciferníku': 'Χρώμα καντράν', 'Barva pouzdra': 'Χρώμα κάσας',
  'Tvar pouzdra': 'Σχήμα κάσας', 'Země původu': 'Χώρα προέλευσης',
  'Barva řemínku/tahu': 'Χρώμα λουριού', 'Materiál': 'Υλικό',
  'Modelová řada': 'Συλλογή', 'Typ šperku': 'Τύπος κοσμήματος',
  'Povrchová úprava': 'Φινίρισμα', 'Princip čištění': 'Μέθοδος καθαρισμού',
  'Funkce': 'Λειτουργίες', 'Typ hodinek': 'Τύπος ρολογιού', 'Typ strojku': 'Τύπος μηχανισμού',
  'Průměr ciferníku': 'Διάμετρος καντράν', 'Typ zapínání - šperk': 'Τύπος κλείσματος',
  'Barva': 'Χρώμα', 'Chronograf': 'Χρονογράφος', 'Velikost ciferníku': 'Μέγεθος καντράν',
  'Délka': 'Μήκος', 'Šířka řemínku/tahu': 'Πλάτος λουριού',
  'Design/ Motiv': 'Σχέδιο / Μοτίβο', 'Ryzost': 'Καθαρότητα', 'Typ náušnic': 'Τύπος σκουλαρικιών',
  'Velikost': 'Μέγεθος',
};

const is_p: Map = {
  'Určení': 'Ætlað fyrir', 'Balení': 'Pökkun', 'Osazení': 'Steinn',
  'Materiál pouzdra': 'Efni í hulstri', 'Řemínek/tah': 'Ól',
  'Vodotěsnost': 'Vatnsheldni', 'Typ skla': 'Tegund glers',
  'Barva ciferníku': 'Litur skífu', 'Barva pouzdra': 'Litur hulsturs',
  'Tvar pouzdra': 'Lögun hulsturs', 'Země původu': 'Upprunaland',
  'Barva řemínku/tahu': 'Litur ólar', 'Materiál': 'Efni',
  'Modelová řada': 'Línan', 'Typ šperku': 'Tegund skartgrips',
  'Povrchová úprava': 'Yfirborð', 'Princip čištění': 'Hreinsiaðferð',
  'Funkce': 'Aðgerðir', 'Typ hodinek': 'Tegund úrs', 'Typ strojku': 'Tegund verks',
  'Průměr ciferníku': 'Þvermál skífu', 'Typ zapínání - šperk': 'Tegund festingar',
  'Barva': 'Litur', 'Chronograf': 'Tímamælir', 'Velikost ciferníku': 'Stærð skífu',
  'Délka': 'Lengd', 'Šířka řemínku/tahu': 'Breidd ólar',
  'Design/ Motiv': 'Hönnun / Mynstur', 'Ryzost': 'Hreinleiki', 'Typ náušnic': 'Tegund eyrnalokka',
  'Velikost': 'Stærð',
};

export const PARAM_NAME_TRANSLATIONS: Record<Lang, Map> = {
  cs: cs_p, sk: sk_p, pl: pl_p, de: de_p, en: en_p, fr: fr_p, es: es_p,
  it: it_p, nl: nl_p, pt: pt_p, hu: hu_p, ro: ro_p, sv: sv_p, da: da_p,
  fi: fi_p, no: no_p, el: el_p, is: is_p,
};

/* ── Convenience helpers ────────────────────────────────────────────────── */

export function tParamName(czechName: string, lang: Lang): string {
  return PARAM_NAME_TRANSLATIONS[lang]?.[czechName] ?? czechName;
}
export function tGender(czechValue: string, lang: Lang): string {
  return GENDER_TRANSLATIONS[lang]?.[czechValue] ?? czechValue;
}
export function tCategory(czechValue: string, lang: Lang): string {
  return CATEGORY_TRANSLATIONS[lang]?.[czechValue] ?? czechValue;
}
