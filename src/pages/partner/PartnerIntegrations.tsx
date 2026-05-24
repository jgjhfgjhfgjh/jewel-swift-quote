import { useMemo, useState, CSSProperties } from 'react';
import {
  Info, Link as LinkIcon, RefreshCcw, Copy, Eye, Code, Plus, Edit3, Trash2,
} from 'lucide-react';
import { INTEGRATIONS, Integration } from './_data/mock';
import { Tag, PButton, Card } from './_components/primitives';
import { pToast } from './_components/toast';

export default function PartnerIntegrations() {
  const [selectedId, setSelectedId] = useState<string>('shopify');
  const sel = useMemo(() => INTEGRATIONS.find(i => i.id === selectedId), [selectedId]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    autoImport: true,
    autoProcess: false,
    syncInv: true,
    syncPrice: false,
    autoTracking: true,
  });
  const [secretShown, setSecretShown] = useState(false);

  return (
    <div className="p-page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>Integrace</h1>
          <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>
            Propojte svůj e-shop a automaticky importujte objednávky
          </div>
        </div>
        <PButton variant="ghost"><Info size={14}/> Dokumentace</PButton>
      </div>

      {/* Integration cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12, marginBottom: 18,
      }}>
        {INTEGRATIONS.map(i => (
          <IntegrationCard
            key={i.id}
            i={i}
            selected={selectedId === i.id}
            onClick={() => setSelectedId(i.id)}
          />
        ))}
      </div>

      {/* Selected integration detail panel — only for connected ones */}
      {sel && sel.connected && (
        <Card padding={0}>
          <div style={cardHead}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--p-surface-2)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--p-font-mono)', fontWeight: 700,
              }}>{sel.name[0]}</div>
              <div>
                <h3 style={cardTitle}>{sel.name} — Konfigurace</h3>
                <div style={{ fontSize: 12, color: 'var(--p-t3)' }}>
                  {sel.orders} objednávek · poslední sync {sel.lastSync}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <PButton variant="subtle" size="sm" onClick={() => pToast.success(`Synchronizace ${sel.name} spuštěna`)}>
                <RefreshCcw size={12}/> Synchronizovat
              </PButton>
              <PButton variant="danger" size="sm">Odpojit</PButton>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14, padding: 18,
          }}>
            <div>
              <div style={lblStyle}>Synchronizace</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <ToggleRow label="Auto-import objednávek"        on={toggles.autoImport}   onChange={v => setToggles(s => ({ ...s, autoImport: v }))}/>
                <ToggleRow label="Auto-zpracování při importu"   on={toggles.autoProcess}  onChange={v => setToggles(s => ({ ...s, autoProcess: v }))}/>
                <ToggleRow label="Sync inventáře (swelt → e-shop)" on={toggles.syncInv}    onChange={v => setToggles(s => ({ ...s, syncInv: v }))}/>
                <ToggleRow label="Sync cen"                       on={toggles.syncPrice}   onChange={v => setToggles(s => ({ ...s, syncPrice: v }))}/>
                <ToggleRow label="Auto-update tracking v e-shopu" on={toggles.autoTracking} onChange={v => setToggles(s => ({ ...s, autoTracking: v }))}/>
              </div>
              <div style={{ ...lblStyle, marginTop: 14 }}>Filtr objednávek</div>
              <select style={selectStyle}>
                <option>Všechny objednávky</option>
                <option>Pouze nezpracované</option>
                <option>Pouze s tagem "dropship"</option>
              </select>
            </div>

            <div>
              <div style={lblStyle}>Bulk Dispatch pravidla</div>
              <div style={{
                marginTop: 8, padding: 14, borderRadius: 10,
                background: 'rgba(168,85,247,0.04)',
                border: '1px solid rgba(168,85,247,0.25)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--p-t2)' }}>KDYŽ</span>
                  <Tag>tag = "newsletter"</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12 }}>
                  <span style={{ color: 'var(--p-t2)' }}>PAK</span>
                  <Tag variant="bulk">→ Bulk skupina "Newsletter"</Tag>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <PButton variant="ghost" size="sm"><Edit3 size={11}/></PButton>
                  <PButton variant="ghost" size="sm"><Trash2 size={11}/></PButton>
                </div>
              </div>
              <PButton variant="subtle" size="sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                <Plus size={12}/> Přidat pravidlo
              </PButton>

              <div style={{ ...lblStyle, marginTop: 14 }}>Webhook URL</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input
                  className="p-mono"
                  readOnly
                  value="https://api.swelt.partner/v1/webhook/sh_8847"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <PButton variant="subtle" size="sm" onClick={() => pToast.success('Zkopírováno')}><Copy size={12}/></PButton>
              </div>
              <div style={{ ...lblStyle, marginTop: 12 }}>Secret key</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input
                  className="p-mono"
                  readOnly
                  value={secretShown ? 'sk_live_a1b2c3d4e5f6g7h88847' : '••••••••••••••••8847'}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <PButton variant="subtle" size="sm" onClick={() => setSecretShown(v => !v)}><Eye size={12}/></PButton>
                <PButton variant="subtle" size="sm" onClick={() => pToast.warning('Klíč přegenerován (TODO)')}><RefreshCcw size={12}/></PButton>
              </div>
            </div>
          </div>

          {/* Sync log */}
          <div style={{ borderTop: '1px solid var(--p-border-soft)', padding: 18 }}>
            <div style={lblStyle}>Sync log · posledních 5</div>
            <table style={{ ...tableStyle, marginTop: 10 }}>
              <thead>
                <tr>
                  <th style={th}>Čas</th>
                  <th style={th}>Událost</th>
                  <th style={th}>E-shop ID</th>
                  <th style={th}>swelt ID</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: 'před 2 min',  e: 'Order imported',    s: '#SH-1842', sw: 'DS-2026-0418', ok: true },
                  { t: 'před 8 min',  e: 'Tracking pushed',   s: '#SH-1841', sw: 'DS-2026-0417', ok: true },
                  { t: 'před 12 min', e: 'Inventory synced',  s: '—',        sw: '184 SKU',      ok: true },
                  { t: 'před 18 min', e: 'Order imported',    s: '#SH-1840', sw: 'DS-2026-0416', ok: true },
                  { t: 'před 24 min', e: 'Webhook timeout',   s: '#SH-1839', sw: '—',            ok: false },
                ].map((l, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--p-hairline)' }}>
                    <td style={{ ...td, color: 'var(--p-t2)', fontSize: 12 }}>{l.t}</td>
                    <td style={{ ...td, fontSize: 13 }}>{l.e}</td>
                    <td className="p-mono" style={{ ...td, fontSize: 12 }}>{l.s}</td>
                    <td className="p-mono" style={{ ...td, fontSize: 12 }}>{l.sw}</td>
                    <td style={td}>
                      <Tag variant={l.ok ? 'success' : 'danger'}>{l.ok ? 'OK' : 'Chyba'}</Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function IntegrationCard({ i, selected, onClick }: { i: Integration; selected: boolean; onClick: () => void }) {
  const statusTag = i.connected
    ? (i.status === 'warning'
        ? <Tag variant="warning">Pozor</Tag>
        : <Tag variant="success">Aktivní</Tag>)
    : <Tag style={{ opacity: 0.6 }}>Nepřipojeno</Tag>;
  return (
    <Card
      style={{
        padding: 16,
        cursor: 'pointer',
        borderColor: selected ? 'var(--p-primary)' : 'var(--p-border-soft)',
        transition: 'border-color var(--p-t-fast)',
      }}
      padding={16}
    >
      <div onClick={onClick}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--p-surface-2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--p-font-mono)', fontSize: 14, fontWeight: 700,
            letterSpacing: '-0.04em',
          }}>
            {i.name === 'Custom Webhook' ? <Code size={18}/> : i.name[0]}
          </div>
          {statusTag}
        </div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{i.name}</div>
        <div style={{ fontSize: 11, color: 'var(--p-t3)', marginBottom: 12, minHeight: 28 }}>{i.desc}</div>
        {i.connected ? (
          <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{i.orders} objednávek · sync {i.lastSync}</div>
        ) : (
          <PButton variant="subtle" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
            <LinkIcon size={12}/> Připojit
          </PButton>
        )}
      </div>
    </Card>
  );
}

function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 12px', background: 'var(--p-surface-2)', borderRadius: 8,
    }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <button
        role="switch" aria-checked={on}
        onClick={() => onChange(!on)}
        style={{
          position: 'relative', width: 38, height: 22, borderRadius: 99, padding: 0,
          background: on ? 'var(--p-primary)' : 'var(--p-border)',
          border: 'none', cursor: 'pointer',
          transition: 'background var(--p-t-fast)',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: on ? 18 : 2,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left 0.18s var(--p-ease)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}/>
      </button>
    </div>
  );
}

const lblStyle: CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--p-t3)',
};
const cardHead: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px', borderBottom: '1px solid var(--p-hairline)',
  gap: 12, flexWrap: 'wrap',
};
const cardTitle: CSSProperties = { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--p-t1)' };
const selectStyle: CSSProperties = {
  height: 36, width: '100%', padding: '0 32px 0 12px', marginTop: 8,
  background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
  color: 'var(--p-t1)', borderRadius: 8, fontSize: 13,
  fontFamily: 'var(--p-font-sans)', appearance: 'none', cursor: 'pointer',
  backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2.5\'><polyline points=\'6,9 12,15 18,9\'/></svg>")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
};
const inputStyle: CSSProperties = {
  height: 32, padding: '0 10px',
  background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
  color: 'var(--p-t1)', borderRadius: 8, fontSize: 12, outline: 'none',
};
const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th: CSSProperties = {
  textAlign: 'left', padding: '10px 14px',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--p-t3)', background: 'var(--p-surface-2)',
  borderBottom: '1px solid var(--p-border-soft)', whiteSpace: 'nowrap',
};
const td: CSSProperties = { padding: '10px 14px', verticalAlign: 'middle' };
