import { BarChart2 } from 'lucide-react';

export default function PartnerAnalytics() {
  return (
    <div className="p-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, color: 'var(--p-t3)' }}>
      <BarChart2 size={48} style={{ opacity: 0.3 }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--p-t2)' }}>Analytika</div>
      <div style={{ fontSize: 13 }}>Detailní přehledy výkonu — přijde v další iteraci.</div>
    </div>
  );
}
