import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONCERNS } from '@/data/concerns';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { LogoShelf, type LogoShelfItem } from '@/components/LogoShelf';

/**
 * Police „Všechny koncerny" — úplně stejný shelf jako u značek, jen s logy
 * hodinářských koncernů. Ukazuje jen koncerny reálně přítomné ve feedu,
 * seřazené podle počtu produktů. „Vidět víc" míří na sekci koncernů na
 * homepage; klik na logo na detail koncernu.
 */
export function ConcernLogoRow({ topMargin }: { topMargin?: string }) {
  const navigate = useNavigate();
  const { data: catalog = [] } = useBrandCatalog();

  const items = useMemo<LogoShelfItem[]>(() => {
    return CONCERNS
      .map((c) => {
        const present = catalog.filter((e) => c.brandKeys.includes(e.key));
        const productCount = present.reduce((sum, e) => sum + e.count, 0);
        return { concern: c, productCount };
      })
      .filter((x) => x.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .map((x) => ({ name: x.concern.name, domain: x.concern.domain, slug: x.concern.slug }));
  }, [catalog]);

  if (items.length === 0) return null;

  return (
    <LogoShelf
      items={items}
      title="Všechny koncerny"
      detailLabel="Zobrazit koncern"
      onSeeMore={() => navigate('/#gbd-alerts-concerns')}
      onItemClick={(it) => navigate(`/koncerny/${it.slug}`)}
      topMargin={topMargin}
    />
  );
}
