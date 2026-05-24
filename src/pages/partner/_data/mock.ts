// =====================================================
// Partner Hub — mock data (Czech locale)
// TODO: replace each export with Supabase queries via TanStack Query hooks.
//       Suggested tables: partner_products, partner_customers, partner_orders,
//       partner_integrations, partner_segments.
// =====================================================

export type Status =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'queued'
  | 'error';

export type OrderSource = 'manual' | 'shopify' | 'woocommerce' | 'shoptet' | 'upgates';

export interface Product {
  id: string;
  name: string;
  sku: string;
  img: string;       // color hex used as placeholder swatch
  category: string;
  wholesale: number; // CZK
  retail: number;    // CZK
  stock: number;
  sales: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  city: string;
  address: string;
  initials: string;
  color: string;
  orders: number;
  spend: number;
  lastOrder: string;
  tag: string;
}

interface OrderBase {
  id: string;
  items: number;
  products: string[];
  total: number;
  status: Status;
  source: OrderSource;
  created: string;
  carrier: string;
}

export interface SingleOrder extends OrderBase {
  type: 'single';
  customer: number; // index into CUSTOMERS
}

export interface BulkOrder extends OrderBase {
  type: 'bulk';
  customer: null;
  recipients: number[];   // indexes into CUSTOMERS
  recipientCount: number;
}

export type Order = SingleOrder | BulkOrder;

export interface Carrier {
  id: string;
  name: string;
  price: number;
  days: string;
  color: string;
}

export interface Segment {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface Integration {
  id: string;
  name: string;
  desc: string;
  connected: boolean;
  status: 'active' | 'warning' | 'error' | null;
  lastSync: string | null;
  orders: number;
}

export const PRODUCTS: Product[] = [
  { id: 'P-1042', name: 'Aroma Diffuser Lumina',        sku: 'ADL-200', img: '#A855F7', category: 'Home',        wholesale: 320,  retail: 690,  stock: 184, sales: 412 },
  { id: 'P-1043', name: 'Bambusový stojan na telefon',  sku: 'BST-110', img: '#4F6EF7', category: 'Office',      wholesale: 89,   retail: 199,  stock: 612, sales: 287 },
  { id: 'P-1044', name: 'Skleněná lahev Fjord 750ml',   sku: 'FJD-750', img: '#00D2A0', category: 'Lifestyle',   wholesale: 145,  retail: 349,  stock: 28,  sales: 803 },
  { id: 'P-1045', name: 'Bezdrátová sluchátka Nordic',  sku: 'NRD-X1',  img: '#F5A623', category: 'Electronics', wholesale: 540,  retail: 1199, stock: 0,   sales: 156 },
  { id: 'P-1046', name: 'LED páska Aurora 5m',          sku: 'AUR-5M',  img: '#F74F4F', category: 'Home',        wholesale: 210,  retail: 449,  stock: 312, sales: 98  },
  { id: 'P-1047', name: 'Cestovní kufr Voyager 55L',    sku: 'VOY-55',  img: '#6E8AFF', category: 'Travel',      wholesale: 1280, retail: 2490, stock: 47,  sales: 64  },
  { id: 'P-1048', name: 'Keramický hrnek Terra',        sku: 'TER-300', img: '#C084FC', category: 'Lifestyle',   wholesale: 65,   retail: 199,  stock: 824, sales: 521 },
  { id: 'P-1049', name: 'Dřevěné hodiny Helsinki',      sku: 'HEL-W30', img: '#2EE6B7', category: 'Home',        wholesale: 380,  retail: 890,  stock: 92,  sales: 142 },
];

export const CUSTOMERS: Customer[] = [
  { id: 'C-001', name: 'Jana Nováková',        email: 'jana.novakova@email.cz',  phone: '+420 602 145 887', company: null,              city: 'Praha 7',          address: 'Letenská 14, 170 00 Praha 7',                  initials: 'JN', color: '#A855F7', orders: 24, spend: 48720, lastOrder: '2 dny',  tag: 'VIP' },
  { id: 'C-002', name: 'Petr Kovář',           email: 'petr.kovar@gmail.com',    phone: '+420 776 332 901', company: 'Kovář s.r.o.',     city: 'Brno',             address: 'Veveří 92, 602 00 Brno',                       initials: 'PK', color: '#4F6EF7', orders: 8,  spend: 12480, lastOrder: '5 dní',  tag: 'Newsletter' },
  { id: 'C-003', name: 'Martin Svoboda',       email: 'm.svoboda@seznam.cz',     phone: '+420 603 887 221', company: null,              city: 'Ostrava',          address: 'Stodolní 18, 702 00 Ostrava',                  initials: 'MS', color: '#00D2A0', orders: 17, spend: 32190, lastOrder: '1 den',  tag: 'Region: Morava' },
  { id: 'C-004', name: 'Eva Horáčková',        email: 'eva.horackova@centrum.cz',phone: '+420 731 442 119', company: 'Horáček design',   city: 'Plzeň',            address: 'Klatovská 88, 301 00 Plzeň',                   initials: 'EH', color: '#F5A623', orders: 31, spend: 67930, lastOrder: '3 hod',  tag: 'VIP' },
  { id: 'C-005', name: 'Tomáš Dvořák',         email: 'tomas.dvorak@firma.cz',   phone: '+420 608 211 547', company: 'Dvořák Trading',   city: 'Praha 4',          address: 'Budějovická 27, 140 00 Praha 4',               initials: 'TD', color: '#F74F4F', orders: 12, spend: 18750, lastOrder: '7 dní',  tag: 'Wholesale' },
  { id: 'C-006', name: 'Lucie Černá',          email: 'lucie.cerna@gmail.com',   phone: '+420 774 998 332', company: null,              city: 'Liberec',          address: 'Pražská 41, 460 01 Liberec',                   initials: 'LČ', color: '#C084FC', orders: 5,  spend: 6420,  lastOrder: '12 dní', tag: 'Newsletter' },
  { id: 'C-007', name: 'Jakub Beneš',          email: 'j.benes@email.cz',        phone: '+420 602 887 119', company: 'BeneShop',         city: 'Hradec Králové',   address: 'Gočárova 1234, 500 02 Hradec Králové',         initials: 'JB', color: '#2EE6B7', orders: 19, spend: 38740, lastOrder: '4 dny',  tag: 'Region: Východ' },
  { id: 'C-008', name: 'Kateřina Procházková', email: 'katerina.p@seznam.cz',    phone: '+420 731 558 290', company: null,              city: 'Olomouc',          address: 'Masarykova třída 8, 779 00 Olomouc',           initials: 'KP', color: '#6E8AFF', orders: 14, spend: 22380, lastOrder: '6 dní',  tag: 'VIP' },
  { id: 'C-009', name: 'David Marek',          email: 'david.marek@firma.com',   phone: '+420 608 311 442', company: 'Marek & Co',       city: 'České Budějovice', address: 'Lannova 5, 370 01 České Budějovice',           initials: 'DM', color: '#FBB54A', orders: 22, spend: 41200, lastOrder: '1 hod',  tag: 'Wholesale' },
  { id: 'C-010', name: 'Tereza Veselá',        email: 't.vesela@gmail.com',      phone: '+420 776 442 887', company: null,              city: 'Pardubice',        address: 'Třída Míru 92, 530 02 Pardubice',              initials: 'TV', color: '#FF7878', orders: 7,  spend: 9870,  lastOrder: '9 dní',  tag: 'Newsletter' },
];

export const ORDERS: Order[] = [
  { id: 'DS-2026-0418', type: 'single', customer: 0,    items: 2, products: ['Aroma Diffuser Lumina', 'Bambusový stojan'],                                              total: 1238,  status: 'shipped',    source: 'manual',      created: 'Dnes, 14:22',   carrier: 'Zásilkovna' },
  { id: 'BD-2026-0042', type: 'bulk',   customer: null, items: 1, products: ['Skleněná lahev Fjord 750ml'],                                                              total: 18420, status: 'processing', source: 'manual',      created: 'Dnes, 11:08',   carrier: 'Zásilkovna', recipients: [3,1,2,4,5,7,9,0,8,6], recipientCount: 47 },
  { id: 'DS-2026-0417', type: 'single', customer: 3,    items: 1, products: ['Cestovní kufr Voyager 55L'],                                                              total: 2490,  status: 'delivered',  source: 'shopify',     created: 'Včera, 18:44',  carrier: 'PPL' },
  { id: 'DS-2026-0416', type: 'single', customer: 2,    items: 4, products: ['LED páska Aurora 5m', 'Keramický hrnek Terra', 'Dřevěné hodiny Helsinki', 'Bambusový stojan'], total: 1742,  status: 'pending',    source: 'woocommerce', created: 'Včera, 16:12',  carrier: 'DPD' },
  { id: 'BD-2026-0041', type: 'bulk',   customer: null, items: 2, products: ['Keramický hrnek Terra', 'Aroma Diffuser Lumina'],                                          total: 9420,  status: 'delivered',  source: 'manual',      created: 'Včera, 09:30',  carrier: 'Zásilkovna', recipients: [0,1,2,3,4,5],         recipientCount: 18 },
  { id: 'DS-2026-0415', type: 'single', customer: 4,    items: 1, products: ['Bezdrátová sluchátka Nordic'],                                                             total: 1199,  status: 'cancelled',  source: 'shoptet',     created: '21. dub, 22:18', carrier: 'GLS' },
  { id: 'DS-2026-0414', type: 'single', customer: 6,    items: 3, products: ['Bambusový stojan', 'Keramický hrnek Terra', 'LED páska Aurora 5m'],                       total: 847,   status: 'shipped',    source: 'manual',      created: '21. dub, 15:05', carrier: 'Zásilkovna' },
  { id: 'DS-2026-0413', type: 'single', customer: 7,    items: 2, products: ['Aroma Diffuser Lumina', 'Dřevěné hodiny Helsinki'],                                       total: 1580,  status: 'processing', source: 'shopify',     created: '21. dub, 11:42', carrier: 'PPL' },
  { id: 'DS-2026-0412', type: 'single', customer: 8,    items: 1, products: ['Cestovní kufr Voyager 55L'],                                                              total: 2490,  status: 'delivered',  source: 'manual',      created: '20. dub, 18:00', carrier: 'Česká pošta' },
  { id: 'BD-2026-0040', type: 'bulk',   customer: null, items: 1, products: ['Skleněná lahev Fjord 750ml'],                                                              total: 4185,  status: 'delivered',  source: 'manual',      created: '20. dub, 10:15', carrier: 'Zásilkovna', recipients: [0,2,4,6,8],           recipientCount: 12 },
  { id: 'DS-2026-0411', type: 'single', customer: 9,    items: 2, products: ['Bambusový stojan', 'Keramický hrnek Terra'],                                              total: 398,   status: 'shipped',    source: 'woocommerce', created: '19. dub, 21:30', carrier: 'DPD' },
  { id: 'DS-2026-0410', type: 'single', customer: 5,    items: 1, products: ['LED páska Aurora 5m'],                                                                    total: 449,   status: 'pending',    source: 'shopify',     created: '19. dub, 14:50', carrier: 'GLS' },
];

export const SOURCES: Record<OrderSource, { label: string; color: string; letter: string }> = {
  manual:      { label: 'Ruční',        color: '#6B7280', letter: 'M' },
  shopify:     { label: 'Shopify',      color: '#7AB55C', letter: 'S' },
  woocommerce: { label: 'WooCommerce',  color: '#7F54B3', letter: 'W' },
  shoptet:     { label: 'Shoptet',      color: '#E84A23', letter: 'T' },
  upgates:     { label: 'Upgates',      color: '#1E73BE', letter: 'U' },
};

export const CARRIERS: Carrier[] = [
  { id: 'zasilkovna', name: 'Zásilkovna',  price: 89,  days: '1-2 dny', color: '#C8102E' },
  { id: 'ppl',        name: 'PPL',         price: 119, days: '1-2 dny', color: '#FECC0E' },
  { id: 'dpd',        name: 'DPD',         price: 129, days: '1-2 dny', color: '#DC0028' },
  { id: 'gls',        name: 'GLS',         price: 109, days: '2-3 dny', color: '#063A82' },
  { id: 'ceska',      name: 'Česká pošta', price: 95,  days: '2-3 dny', color: '#FFCC00' },
];

export const SEGMENTS: Segment[] = [
  { id: 'vip',        name: 'VIP zákazníci',     count: 12,  color: '#A855F7' },
  { id: 'newsletter', name: 'Newsletter',        count: 184, color: '#4F6EF7' },
  { id: 'praha',      name: 'Region: Praha',     count: 67,  color: '#00D2A0' },
  { id: 'morava',     name: 'Region: Morava',    count: 41,  color: '#F5A623' },
  { id: 'wholesale',  name: 'Wholesale partneři',count: 23,  color: '#F74F4F' },
];

export const INTEGRATIONS: Integration[] = [
  { id: 'shopify',     name: 'Shopify',        desc: 'Synchronizace objednávek a inventáře', connected: true,  status: 'active',  lastSync: 'před 2 min', orders: 84 },
  { id: 'woocommerce', name: 'WooCommerce',    desc: 'WordPress e-shop plugin',              connected: true,  status: 'active',  lastSync: 'před 8 min', orders: 42 },
  { id: 'shoptet',     name: 'Shoptet',        desc: 'Český e-shop systém',                  connected: true,  status: 'warning', lastSync: 'před 3 hod', orders: 18 },
  { id: 'upgates',     name: 'Upgates',        desc: 'Český e-shop systém',                  connected: false, status: null,      lastSync: null,          orders: 0  },
  { id: 'prestashop',  name: 'PrestaShop',     desc: 'Open-source e-shop',                   connected: false, status: null,      lastSync: null,          orders: 0  },
  { id: 'magento',     name: 'Magento',        desc: 'Adobe Commerce',                       connected: false, status: null,      lastSync: null,          orders: 0  },
  { id: 'webhook',     name: 'Custom Webhook', desc: 'Vaše vlastní integrace',              connected: false, status: null,      lastSync: null,          orders: 0  },
];

export const STATUS_LABELS: Record<Status, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Čeká',        color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  processing: { label: 'Zpracovává',  color: '#6E8AFF', bg: 'rgba(79,110,247,0.12)' },
  shipped:    { label: 'Odesláno',    color: '#C084FC', bg: 'rgba(168,85,247,0.12)' },
  delivered:  { label: 'Doručeno',    color: '#00D2A0', bg: 'rgba(0,210,160,0.12)'  },
  cancelled:  { label: 'Zrušeno',     color: '#F74F4F', bg: 'rgba(247,79,79,0.12)'  },
  queued:     { label: 'Ve frontě',   color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)'},
  error:      { label: 'Chyba',       color: '#F74F4F', bg: 'rgba(247,79,79,0.16)'  },
};

const czk = new Intl.NumberFormat('cs-CZ');

export const fmtCZK = (n: number): string => `${czk.format(Math.round(n))} Kč`;
export const fmtNum = (n: number): string => czk.format(n);

export const margin = (wholesale: number, retail: number): number =>
  retail > 0 ? Math.round(((retail - wholesale) / retail) * 100) : 0;

export const marginCls = (m: number): 'lo' | 'md' | 'hi' =>
  m < 10 ? 'lo' : m < 25 ? 'md' : 'hi';

export const marginColor = (m: number): string => {
  if (m < 10) return '#F74F4F';
  if (m < 25) return '#F5A623';
  return '#00D2A0';
};
