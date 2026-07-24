import { useNavigate } from 'react-router-dom';
import { useBrandCatalog } from '@/hooks/useBrandCatalog';
import { sortByBrandPriority } from '@/lib/brandOrder';
import { LogoShelf, type LogoShelfItem } from '@/components/LogoShelf';

/**
 * Police „Všechny značky" — loga značek z živého katalogu (prioritní pořadí).
 * Vizuál i chování dodává sdílený LogoShelf.
 */
export function BrandLogoRow({ topMargin }: { topMargin?: string }) {
  const navigate = useNavigate();
  const { data: catalog = [] } = useBrandCatalog();
  const items: LogoShelfItem[] = sortByBrandPriority(catalog).map((e) => ({
    name: e.name, domain: e.domain, slug: e.slug,
  }));

  return (
    <LogoShelf
      items={items}
      title="Všechny značky"
      detailLabel="Zobrazit značku"
      onSeeMore={() => navigate('/brands')}
      onItemClick={(it) => navigate(`/brands/${it.slug}`)}
      topMargin={topMargin}
    />
  );
}
