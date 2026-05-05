import { Settings } from 'lucide-react';

export default function PartnerSettings() {
  return (
    <div className="p-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, color: 'var(--p-t3)' }}>
      <Settings size={48} style={{ opacity: 0.3 }} />
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--p-t2)' }}>Nastavení</div>
      <div style={{ fontSize: 13 }}>Profil, branding, doručení, tým, API klíče — přijde v další iteraci.</div>
    </div>
  );
}
