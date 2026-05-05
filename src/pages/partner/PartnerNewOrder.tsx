import { ShoppingCart } from 'lucide-react';

export default function PartnerNewOrder() {
  return (
    <div className="p-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, color: 'var(--p-t3)' }}>
      <ShoppingCart size={48} style={{ opacity: 0.3 }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--p-t2)' }}>Nová objednávka</div>
      <div style={{ fontSize: 13 }}>4-krokový průvodce — přijde v další iteraci.</div>
    </div>
  );
}
