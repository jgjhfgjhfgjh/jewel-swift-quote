import { Zap } from 'lucide-react';

export default function PartnerBulk() {
  return (
    <div className="p-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, color: 'var(--p-t3)' }}>
      <Zap size={48} style={{ opacity: 0.3, color: 'var(--p-bulk)' }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--p-t2)' }}>Hromadné odeslání</div>
      <div style={{ fontSize: 13 }}>Flagship funkce — přijde v další iteraci.</div>
    </div>
  );
}
