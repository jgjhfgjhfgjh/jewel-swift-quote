import { describe, it, expect } from 'vitest';
import { buildContextBundle, bundleToMarkdown, type LiveSnapshot } from '@/lib/context/bundle';

describe('context bundle', () => {
  const bundle = buildContextBundle('client');

  it('obsahuje mapu webu ze siteMap', () => {
    expect(bundle.site.pageCount).toBeGreaterThan(20);
    expect(bundle.site.sectionCount).toBeGreaterThan(0);
    const admin = bundle.site.clusters.find((c) => c.id === 'admin');
    expect(admin).toBeTruthy();
    expect(admin!.pages.some((p) => p.route === '/admin/context')).toBe(true);
  });

  it('obsahuje souhrn copy bez textů (jen počty)', () => {
    expect(bundle.copy.totalStrings).toBeGreaterThan(1000);
    expect(bundle.copy.langs.length).toBeGreaterThan(10);
    // souhrn nesmí nést jednotlivé stringy — drží bundle malý
    expect(JSON.stringify(bundle.copy.groups)).not.toContain('keyPath');
  });

  it('markdown export nese strukturu i mrtvé stránky', () => {
    const md = bundleToMarkdown(bundle);
    expect(md).toContain('# swelt.partner — context bundle');
    expect(md).toContain('## Web — mapa stránek');
    expect(md).toContain('MIMO PROVOZ'); // feed-management je isLive: false
    expect(md).toContain('/api/context');
    expect(md).not.toContain('## Živý snapshot'); // klientský bundle živá KPI nemá
  });

  it('markdown zahrne živý snapshot, když je k dispozici', () => {
    const live: LiveSnapshot = {
      fetchedAt: '2026-07-14T00:00:00Z',
      products: { total: 11000, inStock: 9000 },
      orders: { total: 5, gmv: 1234.5, marginTotal: 200, awaitingPayment: 1 },
      inquiries: { total: 10, open: 3 },
      deals: { total: 2 },
      customers: { profiles: 42 },
    };
    const md = bundleToMarkdown({ ...bundle, live });
    expect(md).toContain('## Živý snapshot');
    expect(md).toContain('9000 skladem');
    expect(md).toContain('3 otevřených');
  });
});
