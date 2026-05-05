import { Plug } from 'lucide-react';

export default function PartnerIntegrations() {
  return (
    <div className="p-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, color: 'var(--p-t3)' }}>
      <Plug size={48} style={{ opacity: 0.3 }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--p-t2)' }}>Integrace</div>
      <div style={{ fontSize: 13 }}>Shopify, WooCommerce, Shoptet — přijde v další iteraci.</div>
    </div>
  );
}
