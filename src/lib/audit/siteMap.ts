/**
 * Site map registry — kanonický strom celého webu swelt.partner pro „Swelt Web
 * Cockpit" (admin nástroj /admin/audit na audit copy + struktury).
 *
 * Strom: cluster → page → section. U i18n-backed stránek se sekce odvozují
 * AUTOMATICKY z `copyManifest.json` (viz scripts/extract-copy.ts) — propojení je
 * přes `manifest.group.page === page.id`. U inline stránek (texty natvrdo v JSX)
 * jsou sekce deklarované ručně níže (hrubě; zpřesní se při verifikaci).
 *
 * `id` je stabilní klíč proti tabulce `content_audit` (node_id). NEMĚNIT po
 * nasazení, jinak se ztratí navázaný stav verifikace.
 */

export type Audience = 'guest' | 'lead' | 'customer' | 'b2b' | 'admin';
export type CopySource = 'i18n' | 'inline' | 'data' | 'dynamic';

export interface SiteSection {
  /** stabilní id, konvence `<pageId>::<key>` */
  id: string;
  label: string;
  copySource?: CopySource;
  note?: string;
}

export interface SitePage {
  /** id odpovídá `page` v copyManifest u i18n-backed stránek */
  id: string;
  label: string;
  route?: string;
  /** dynamická routa (`:slug`/`:id`) — nelze otevřít bez parametru */
  dynamic?: boolean;
  sourceFile?: string;
  audience?: Audience[];
  copySource?: CopySource;
  /** false = na webu sice je kód, ale není živé / je mimo provoz */
  isLive?: boolean;
  note?: string;
  /** ručně deklarované sekce (pro inline stránky nebo doplněk k i18n) */
  sections?: SiteSection[];
}

export interface SiteCluster {
  id: string;
  label: string;
  description?: string;
  pages: SitePage[];
}

/** Standardní sekce pro inline stránku, ať je co verifikovat hned. */
const inlineSection = (pageId: string, key: string, label: string, note?: string): SiteSection => ({
  id: `${pageId}::${key}`,
  label,
  copySource: 'inline',
  note,
});

export const SITE_MAP: SiteCluster[] = [
  {
    id: 'global',
    label: 'Globální & sdílené',
    description: 'Texty, které se zobrazují napříč webem nezávisle na stránce.',
    pages: [
      {
        id: '_core',
        label: 'Globální UI (navbar, košík, společné labely)',
        sourceFile: 'src/lib/i18n.ts',
        copySource: 'i18n',
        audience: ['guest', 'lead', 'customer', 'b2b', 'admin'],
      },
      {
        id: 'auth',
        label: 'Přihlášení / registrace (AuthModal)',
        sourceFile: 'src/components/AuthModal.tsx',
        copySource: 'i18n',
        audience: ['guest', 'lead'],
      },
      {
        id: 'checkout',
        label: 'Pokladna (CheckoutDialog)',
        sourceFile: 'src/components/checkout/CheckoutDialog.tsx',
        copySource: 'i18n',
        audience: ['customer', 'b2b', 'admin'],
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & landing',
    description: 'Veřejné prodejní stránky — hlavní těžiště copywritingu.',
    pages: [
      {
        id: 'index',
        label: 'Homepage (/)',
        route: '/',
        sourceFile: 'src/pages/Index.tsx',
        copySource: 'i18n',
        audience: ['guest', 'lead', 'customer', 'b2b', 'admin'],
        note: 'Skládá se z home (hero + gateway), gateway sekcí a triple gateway.',
      },
      { id: 'velkoobchod', label: 'Velkoobchod', route: '/velkoobchod', sourceFile: 'src/pages/Velkoobchod.tsx', copySource: 'i18n', audience: ['guest', 'lead', 'b2b'] },
      { id: 'dropshipping', label: 'Dropshipping', route: '/dropshipping', sourceFile: 'src/pages/Dropshipping.tsx', copySource: 'i18n', audience: ['guest', 'lead', 'b2b'] },
      { id: 'luxury', label: 'Luxury', route: '/luxury', sourceFile: 'src/pages/Luxury.tsx', copySource: 'i18n', audience: ['guest', 'lead', 'b2b'] },
      { id: 'shop', label: 'Shop / katalog landing', route: '/shop', sourceFile: 'src/pages/Shop.tsx', copySource: 'i18n', audience: ['guest', 'lead', 'customer', 'b2b'] },
      { id: 'feed', label: 'Produktový feed', route: '/feed', sourceFile: 'src/pages/Feed.tsx', copySource: 'i18n', audience: ['lead', 'b2b'] },
    ],
  },
  {
    id: 'catalog',
    label: 'Katalog & značky',
    description: 'Značky, koncerny a DEAL nabídky.',
    pages: [
      {
        id: 'brands',
        label: 'Přehled značek',
        route: '/brands',
        sourceFile: 'src/pages/Brands.tsx',
        copySource: 'dynamic',
        audience: ['guest', 'lead', 'customer', 'b2b'],
        note: 'Data ze živého katalogu (useBrandCatalog). Statický copy je minimální.',
        sections: [
          inlineSection('brands', 'intro', 'Úvodní hlavička'),
          inlineSection('brands', 'grid', 'Mřížka značek (dynamická)'),
        ],
      },
      {
        id: 'brand-detail',
        label: 'Detail značky',
        route: '/brands/:slug',
        dynamic: true,
        sourceFile: 'src/pages/BrandDetail.tsx',
        copySource: 'data',
        audience: ['guest', 'lead', 'customer', 'b2b'],
        note: 'Příběhy značek v src/data/brandStories.ts.',
        sections: [
          inlineSection('brand-detail', 'hero', 'Hero značky'),
          inlineSection('brand-detail', 'story', 'Příběh značky (brandStories.ts)', 'copySource: data'),
          inlineSection('brand-detail', 'products', 'Produkty značky (dynamické)'),
        ],
      },
      {
        id: 'concern-detail',
        label: 'Detail koncernu',
        route: '/koncerny/:slug',
        dynamic: true,
        sourceFile: 'src/pages/ConcernDetail.tsx',
        copySource: 'data',
        audience: ['guest', 'lead', 'customer', 'b2b'],
        note: 'Data v src/data/concerns.ts.',
        sections: [
          inlineSection('concern-detail', 'hero', 'Hero koncernu'),
          inlineSection('concern-detail', 'brands', 'Značky koncernu'),
        ],
      },
      { id: 'deals', label: 'DEAL nabídky', route: '/deals', sourceFile: 'src/pages/Deals.tsx', copySource: 'i18n', audience: ['lead', 'customer', 'b2b'] },
      {
        id: 'deal-detail',
        label: 'Detail DEAL nabídky',
        route: '/deals/:slug',
        dynamic: true,
        sourceFile: 'src/pages/DealDetail.tsx',
        copySource: 'i18n',
        audience: ['lead', 'customer', 'b2b'],
        note: 'Sdílí dealsI18n; obsah deal/produktů je dynamický.',
        sections: [
          inlineSection('deal-detail', 'header', 'Hlavička nabídky + countdown'),
          inlineSection('deal-detail', 'products', 'Produkty nabídky (dynamické)'),
          inlineSection('deal-detail', 'orderbar', 'Objednací lišta'),
        ],
      },
    ],
  },
  {
    id: 'account',
    label: 'Účet & objednávky',
    description: 'Přihlašování, nastavení účtu, oblíbené a objednávky zákazníka.',
    pages: [
      {
        id: 'login', label: 'Login', route: '/login', sourceFile: 'src/pages/Login.tsx', copySource: 'i18n', audience: ['guest'],
        sections: [inlineSection('login', 'form', 'Přihlašovací formulář')],
      },
      {
        id: 'register', label: 'Registrace', route: '/register', sourceFile: 'src/pages/Register.tsx', copySource: 'i18n', audience: ['guest'],
        sections: [inlineSection('register', 'form', 'Registrační formulář')],
      },
      {
        id: 'reset-password', label: 'Reset hesla', route: '/auth/reset-password', sourceFile: 'src/pages/ResetPassword.tsx', copySource: 'inline', audience: ['guest'],
        sections: [inlineSection('reset-password', 'form', 'Formulář reset hesla')],
      },
      {
        id: 'account-settings', label: 'Nastavení účtu', route: '/ucet', sourceFile: 'src/pages/AccountSettings.tsx', copySource: 'inline', audience: ['lead', 'customer', 'b2b', 'admin'],
        sections: [
          inlineSection('account-settings', 'profile', 'Profil & firemní údaje'),
          inlineSection('account-settings', 'security', 'Bezpečnost / heslo'),
          inlineSection('account-settings', 'preferences', 'Předvolby'),
        ],
      },
      {
        id: 'favorites', label: 'Oblíbené', route: '/favorites', sourceFile: 'src/pages/Favorites.tsx', copySource: 'inline', audience: ['lead', 'customer', 'b2b', 'admin'],
        sections: [
          inlineSection('favorites', 'empty', 'Prázdný stav'),
          inlineSection('favorites', 'grid', 'Mřížka oblíbených'),
        ],
      },
      {
        id: 'orders', label: 'Moje objednávky', route: '/orders', sourceFile: 'src/pages/Orders.tsx', copySource: 'inline', audience: ['customer', 'b2b', 'admin'],
        sections: [
          inlineSection('orders', 'list', 'Seznam objednávek'),
          inlineSection('orders', 'empty', 'Prázdný stav'),
        ],
      },
    ],
  },
  {
    id: 'partner',
    label: 'Partner Hub (dropshipping dashboard)',
    description: 'Nested routy pod /partner — provozní rozhraní pro partnery.',
    pages: [
      { id: 'partner-dashboard', label: 'Dashboard', route: '/partner', sourceFile: 'src/pages/partner/PartnerDashboard.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-dashboard', 'kpis', 'KPI karty'), inlineSection('partner-dashboard', 'activity', 'Poslední aktivita')] },
      { id: 'partner-orders', label: 'Objednávky', route: '/partner/orders', sourceFile: 'src/pages/partner/PartnerOrders.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-orders', 'table', 'Tabulka objednávek'), inlineSection('partner-orders', 'empty', 'Prázdný stav')] },
      { id: 'partner-order-detail', label: 'Detail objednávky', route: '/partner/orders/:id', dynamic: true, sourceFile: 'src/pages/partner/PartnerOrderDetail.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-order-detail', 'summary', 'Souhrn objednávky'), inlineSection('partner-order-detail', 'timeline', 'Stav / timeline')] },
      { id: 'partner-bulk', label: 'Hromadné objednávky', route: '/partner/bulk', sourceFile: 'src/pages/partner/PartnerBulk.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-bulk', 'list', 'Seznam')] },
      { id: 'partner-bulk-detail', label: 'Detail hromadné objednávky', route: '/partner/bulk/:id', dynamic: true, sourceFile: 'src/pages/partner/PartnerBulkDetail.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-bulk-detail', 'detail', 'Detail')] },
      { id: 'partner-catalog', label: 'Katalog', route: '/partner/catalog', sourceFile: 'src/pages/partner/PartnerCatalog.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-catalog', 'grid', 'Katalog produktů')] },
      { id: 'partner-new-order', label: 'Nová objednávka', route: '/partner/new-order', sourceFile: 'src/pages/partner/PartnerNewOrder.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-new-order', 'form', 'Formulář objednávky')] },
      { id: 'partner-customers', label: 'Zákazníci', route: '/partner/customers', sourceFile: 'src/pages/partner/PartnerCustomers.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-customers', 'list', 'Seznam zákazníků')] },
      { id: 'partner-customer-detail', label: 'Detail zákazníka', route: '/partner/customers/:id', dynamic: true, sourceFile: 'src/pages/partner/PartnerCustomerDetail.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-customer-detail', 'detail', 'Detail zákazníka')] },
      { id: 'partner-integrations', label: 'Integrace', route: '/partner/integrations', sourceFile: 'src/pages/partner/PartnerIntegrations.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-integrations', 'list', 'Seznam integrací')] },
      { id: 'partner-analytics', label: 'Analytika', route: '/partner/analytics', sourceFile: 'src/pages/partner/PartnerAnalytics.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-analytics', 'charts', 'Grafy a metriky')] },
      { id: 'partner-settings', label: 'Nastavení', route: '/partner/settings', sourceFile: 'src/pages/partner/PartnerSettings.tsx', copySource: 'inline', audience: ['b2b', 'admin'], sections: [inlineSection('partner-settings', 'form', 'Nastavení partnera')] },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Interní admin nástroje (jen role admin).',
    pages: [
      { id: 'admin-home', label: 'Dashboard', route: '/admin', sourceFile: 'src/pages/admin/AdminHome.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('admin-home', 'tiles', 'Dlaždice sektorů')] },
      { id: 'admin-ws', label: 'AI Workspace', route: '/admin/ws', sourceFile: 'src/pages/admin/AdminWorkspace.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('admin-ws', 'surfaces', 'Chat / Jarvis / Preview / Split')] },
      { id: 'admin-context', label: 'Context Hub', route: '/admin/context', sourceFile: 'src/pages/admin/AdminContext.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('admin-context', 'export', 'Bundle & exporty')] },
      { id: 'admin-erp', label: 'ERP & Objednávky', route: '/admin/erp', sourceFile: 'src/pages/AdminErp.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('admin-erp', 'kpi', 'KPI přehled'), inlineSection('admin-erp', 'orders', 'Seznam objednávek'), inlineSection('admin-erp', 'outbox', 'Outbox dodavatelských objednávek')] },
      { id: 'admin-inquiries', label: 'Poptávky Prestige', route: '/admin/poptavky', sourceFile: 'src/pages/admin/AdminInquiries.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('admin-inquiries', 'queue', 'Fronta poptávek'), inlineSection('admin-inquiries', 'detail', 'Detail & nabídka')] },
      { id: 'customers', label: 'Správa zákazníků', route: '/customers', sourceFile: 'src/pages/CustomerManagement.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('customers', 'list', 'Seznam zákazníků'), inlineSection('customers', 'search', 'Hledání / filtry')] },
      { id: 'customer-detail', label: 'Detail zákazníka', route: '/customers/:id', dynamic: true, sourceFile: 'src/pages/CustomerDetail.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('customer-detail', 'profile', 'Profil & slevy'), inlineSection('customer-detail', 'credentials', 'Přihlašovací údaje')] },
      { id: 'admin-deals', label: 'Schvalování DEALů', route: '/admin/deals', sourceFile: 'src/pages/admin/AdminDeals.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('admin-deals', 'queue', 'Fronta ke schválení')] },
      { id: 'audit-cockpit', label: 'Web Cockpit (audit)', route: '/admin/audit', sourceFile: 'src/pages/admin/AuditCockpit.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('audit-cockpit', 'tool', 'Audit copy & struktury')] },
      {
        id: 'feed-management', label: 'Správa feedu', route: '/admin/feeds', sourceFile: 'src/pages/FeedManagement.tsx', copySource: 'inline', audience: ['admin'],
        isLive: false, note: 'Dle CLAUDE.md čte neexistující tabulky feed_config/feed_sync_logs — mrtvá stránka.',
        sections: [inlineSection('feed-management', 'controls', 'Ovládání sync')],
      },
    ],
  },
  {
    id: 'komunikace',
    label: 'Komunikace swelt × zago',
    description: 'Interní kolaborační workspace (admin + účastníci).',
    pages: [
      { id: 'com-overview', label: 'Přehled témat', route: '/komunikace', sourceFile: 'src/pages/komunikace/ComOverview.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('com-overview', 'topics', 'Seznam témat'), inlineSection('com-overview', 'composer', 'Nové téma')] },
      { id: 'com-topic', label: 'Detail tématu', route: '/komunikace/t/:id', dynamic: true, sourceFile: 'src/pages/komunikace/ComTopicDetail.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('com-topic', 'thread', 'Vlákno zpráv'), inlineSection('com-topic', 'tasks', 'Úkoly')] },
      { id: 'com-participants', label: 'Účastníci', route: '/komunikace/ucastnici', sourceFile: 'src/pages/komunikace/ComParticipants.tsx', copySource: 'inline', audience: ['admin'], sections: [inlineSection('com-participants', 'list', 'Seznam účastníků')] },
    ],
  },
  {
    id: 'archive',
    label: 'Archiv (mimo provoz)',
    description: 'Kód existuje, ale není v živém routingu.',
    pages: [
      {
        id: 'intelligence', label: 'Intelligence', sourceFile: '_archive/intelligence/Intelligence.tsx', copySource: 'i18n', audience: ['admin'],
        isLive: false, note: 'Není v App.tsx routingu (CLAUDE.md: _archive ignorovat). i18n texty stále existují.',
      },
    ],
  },
];

/** Všechny stránky napříč clustery (zploštěné). */
export const ALL_PAGES: SitePage[] = SITE_MAP.flatMap((c) => c.pages);

/** Mapa pageId → cluster (pro popisky a filtry). */
export const PAGE_CLUSTER: Record<string, SiteCluster> = Object.fromEntries(
  SITE_MAP.flatMap((c) => c.pages.map((p) => [p.id, c])),
);
