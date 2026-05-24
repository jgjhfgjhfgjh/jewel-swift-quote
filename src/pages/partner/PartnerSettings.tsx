import { useState, CSSProperties } from 'react';
import { Upload, Eye, Plus, Edit3, Trash2, Download, Mail } from 'lucide-react';
import { Avatar, Card, PButton, Tag } from './_components/primitives';
import { pToast } from './_components/toast';
// pToast used inside Billing rows below

type TabId = 'branding' | 'defaults' | 'notif' | 'billing' | 'team';

export default function PartnerSettings() {
  const [tab, setTab] = useState<TabId>('branding');

  return (
    <div className="p-page">
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>Nastavení</h1>
        <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>
          Spravujte branding, výchozí hodnoty a tým
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid var(--p-border-soft)', overflowX: 'auto' }}>
        {([
          { id: 'branding', label: 'Branding'   },
          { id: 'defaults', label: 'Výchozí'    },
          { id: 'notif',    label: 'Notifikace' },
          { id: 'billing',  label: 'Fakturace'  },
          { id: 'team',     label: 'Tým'        },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 14px',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--p-primary)' : 'transparent'}`,
              color: tab === t.id ? 'var(--p-t1)' : 'var(--p-t3)',
              fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--p-font-sans)',
            }}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'branding' && <Branding/>}
      {tab === 'defaults' && <Defaults/>}
      {tab === 'notif' && <Notifications/>}
      {tab === 'billing' && <Billing/>}
      {tab === 'team' && <Team/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Branding() {
  const [company, setCompany] = useState('NOVÁK Trading s.r.o.');
  const [thanks, setThanks] = useState('Děkujeme za nákup! Pokud máte jakékoliv otázky, ozvěte se na info@novak-trading.cz');
  const [blind, setBlind] = useState(true);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
      <Card>
        <h3 style={h3}>Identita</h3>
        <FormLabel>Název firmy (na packing slipech)</FormLabel>
        <input value={company} onChange={e => setCompany(e.target.value)} style={inputStyle}/>
        <FormLabel style={{ marginTop: 12 }}>Logo</FormLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 12 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--p-primary), var(--p-bulk))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 24,
          }}>N</div>
          <PButton variant="subtle"><Upload size={12}/> Nahrát logo</PButton>
        </div>
        <ToggleRow
          title="Blind shipping (výchozí)"
          subtitle="Skrýt swelt.partner z packing slipů"
          on={blind} onChange={setBlind}
        />
        <FormLabel style={{ marginTop: 12 }}>Děkovná zpráva</FormLabel>
        <textarea
          value={thanks}
          onChange={e => setThanks(e.target.value)}
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
        />
      </Card>

      <Card>
        <h3 style={h3}>Šablony packing slipů</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { id: 'minimal',  title: 'Minimal Black', usage: 'Výchozí',         primary: true },
            { id: 'logo',     title: 'Logo Header',   usage: 'Použito v 23 obj.', primary: false },
            { id: 'festive',  title: 'Custom Festive', usage: 'Použito v 8 obj.', primary: false },
          ].map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 12, background: 'var(--p-surface-2)', borderRadius: 10,
            }}>
              <div style={{
                width: 50, height: 64, background: 'var(--p-card)',
                borderRadius: 4, padding: 6,
              }}>
                {i === 0 && <>
                  <div style={{ height: 4, background: 'var(--p-t1)', width: 24 }}/>
                  <div style={{ height: 2, background: 'var(--p-t3)', width: 30, marginTop: 4 }}/>
                  <div style={{ height: 2, background: 'var(--p-t3)', width: 26, marginTop: 2 }}/>
                </>}
                {i === 1 && <>
                  <div style={{ height: 8, background: 'var(--p-bulk)', width: 20, marginBottom: 4 }}/>
                  <div style={{ height: 2, background: 'var(--p-t2)', width: 30 }}/>
                </>}
                {i === 2 && <>
                  <div style={{
                    height: 12, borderRadius: 2, marginBottom: 4,
                    background: 'linear-gradient(135deg, var(--p-bulk), var(--p-primary))',
                  }}/>
                  <div style={{ height: 2, background: 'var(--p-t3)', width: 30 }}/>
                </>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{t.usage}</div>
              </div>
              <PButton variant="ghost" size="sm"><Eye size={12}/></PButton>
              {t.primary && <Tag variant="primary">VÝCHOZÍ</Tag>}
            </div>
          ))}
          <PButton variant="subtle" size="sm" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            <Plus size={12}/> Vytvořit novou šablonu
          </PButton>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Defaults() {
  const [carrier, setCarrier] = useState('zasilkovna');
  const [currency, setCurrency] = useState('CZK');
  const [margin, setMargin] = useState('35');
  const [maxRecipients, setMaxRecipients] = useState('500');
  const [autoNotify, setAutoNotify] = useState(true);

  return (
    <Card style={{ maxWidth: 720 }}>
      <h3 style={h3}>Výchozí hodnoty</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
        <div>
          <FormLabel>Výchozí dopravce</FormLabel>
          <select value={carrier} onChange={e => setCarrier(e.target.value)} style={selectStyle}>
            <option value="zasilkovna">Zásilkovna</option>
            <option value="ppl">PPL</option>
            <option value="dpd">DPD</option>
          </select>
        </div>
        <div>
          <FormLabel>Výchozí měna</FormLabel>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={selectStyle}>
            <option value="CZK">CZK · Kč</option>
            <option value="EUR">EUR · €</option>
          </select>
        </div>
        <div>
          <FormLabel>Výchozí marže (%)</FormLabel>
          <input value={margin} onChange={e => setMargin(e.target.value)} type="number" style={inputStyle}/>
        </div>
        <div>
          <FormLabel>Max. příjemců / bulk</FormLabel>
          <input value={maxRecipients} onChange={e => setMaxRecipients(e.target.value)} type="number" style={inputStyle}/>
        </div>
      </div>
      <ToggleRow
        title="Auto-notifikace zákazníků při odeslání"
        subtitle="E-mail s tracking číslem"
        on={autoNotify} onChange={setAutoNotify}
      />
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Notifications() {
  const items = [
    'Nová objednávka',
    'Objednávka odeslána',
    'Bulk dispatch dokončen',
    'Chyba importu z e-shopu',
    'Zákazník odpověděl',
  ];
  const [state, setState] = useState<boolean[]>([true, true, true, true, false]);

  return (
    <Card style={{ maxWidth: 720 }}>
      <h3 style={h3}>E-mailové notifikace</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((label, i) => (
          <ToggleRow
            key={i}
            title={label}
            on={state[i]}
            onChange={(v) => setState(s => s.map((x, j) => j === i ? v : x))}
          />
        ))}
      </div>

      <h3 style={{ ...h3, marginTop: 24 }}>Webhook notifikace</h3>
      <FormLabel>URL pro POST</FormLabel>
      <input
        placeholder="https://your-system.com/swelt-webhook"
        style={{ ...inputStyle, fontFamily: 'var(--p-font-mono)' }}
      />
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Billing() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 14 }}>
      <Card style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(79,110,247,0.05))',
        borderColor: 'rgba(168,85,247,0.25)',
      }}>
        <Tag variant="bulk">AKTUÁLNÍ PLÁN</Tag>
        <div style={{ fontWeight: 700, fontSize: 22, marginTop: 12 }}>Dropshipping Pro</div>
        <div style={{ fontSize: 13, color: 'var(--p-t2)' }}>2 990 Kč / měsíc</div>
        <div style={{ borderTop: '1px solid var(--p-hairline)', margin: '14px 0' }}/>
        <div style={lblStyle}>USAGE TENTO MĚSÍC</div>
        <UsageRow label="Objednávky"      used={847} total={2000} pct={42}/>
        <UsageRow label="Bulk dispatchy"  used={42}  total={100}  pct={42}/>
        <PButton variant="bulk" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
          Upgrade na Enterprise
        </PButton>
      </Card>

      <Card padding={0}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Historie fakturace</h3>
          <PButton variant="subtle" size="sm"><Download size={12}/> Vše PDF</PButton>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>Faktura</th>
              <th style={th}>Datum</th>
              <th style={th}>Plán</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Částka</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {['INV-2026-04','INV-2026-03','INV-2026-02','INV-2026-01','INV-2025-12'].map((id, i) => (
              <tr key={id} style={{ borderTop: '1px solid var(--p-hairline)' }}>
                <td className="p-mono" style={{ ...td, fontSize: 12 }}>{id}</td>
                <td style={{ ...td, fontSize: 12, color: 'var(--p-t2)' }}>{['1. dub','1. bře','1. úno','1. led','1. pro'][i]} 2026</td>
                <td style={td}>Pro</td>
                <td style={td}><Tag variant="success">Zaplaceno</Tag></td>
                <td className="p-mono" style={{ ...td, textAlign: 'right', fontWeight: 700 }}>2 990 Kč</td>
                <td style={td}>
                  <button style={iconBtn} onClick={() => pToast.info('Stahuji PDF…')}><Download size={12}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Team() {
  const members = [
    { name: 'Jana Novák',        email: 'jana@novak-trading.cz',  role: 'Owner',   last: 'právě teď',  color: '#A855F7' },
    { name: 'Tomáš Novák',       email: 'tomas@novak-trading.cz', role: 'Manager', last: 'před 12 min', color: '#4F6EF7' },
    { name: 'Petra Svobodová',   email: 'petra@novak-trading.cz', role: 'Manager', last: 'před 2 hod',  color: '#00D2A0' },
    { name: 'Karel Dvořák',      email: 'karel@novak-trading.cz', role: 'Viewer',  last: 'včera',       color: '#F5A623' },
  ];
  return (
    <Card padding={0}>
      <div style={cardHead}>
        <h3 style={cardTitle}>Členové týmu · {members.length}</h3>
        <PButton variant="primary" size="sm"><Mail size={12}/> Pozvat člena</PButton>
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={th}>Člen</th>
            <th style={th}>E-mail</th>
            <th style={th}>Role</th>
            <th style={th}>Poslední přihlášení</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.email} className="p-row" style={{ borderTop: '1px solid var(--p-hairline)' }}>
              <td style={td}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={m.name} color={m.color} size={28}/>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                </div>
              </td>
              <td style={{ ...td, color: 'var(--p-t2)', fontSize: 12 }}>{m.email}</td>
              <td style={td}><Tag variant={m.role === 'Owner' ? 'bulk' : 'default'}>{m.role}</Tag></td>
              <td style={{ ...td, color: 'var(--p-t3)', fontSize: 12 }}>{m.last}</td>
              <td style={td}>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button style={iconBtn}><Edit3 size={12}/></button>
                  <button style={iconBtn}><Trash2 size={12}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ToggleRow({ title, subtitle, on, onChange }: { title: string; subtitle?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 12px', background: 'var(--p-surface-2)', borderRadius: 8,
      marginBottom: 6, gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{subtitle}</div>}
      </div>
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

function UsageRow({ label, used, total, pct }: { label: string; used: number; total: number; pct: number }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: 'var(--p-t2)' }}>{label}</span>
        <span className="p-mono">{used} / {total}</span>
      </div>
      <div style={{
        height: 6, background: 'var(--p-surface-2)',
        borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'linear-gradient(90deg, var(--p-primary), var(--p-bulk))',
          borderRadius: 99,
        }}/>
      </div>
    </div>
  );
}

function FormLabel({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return <div style={{ ...lblStyle, marginBottom: 6, ...style }}>{children}</div>;
}

const h3: CSSProperties = { fontSize: 16, fontWeight: 600, color: 'var(--p-t1)', margin: 0, marginBottom: 14 };
const lblStyle: CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--p-t3)',
};
const inputStyle: CSSProperties = {
  height: 36, width: '100%', padding: '0 12px',
  background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
  borderRadius: 8, color: 'var(--p-t1)', fontSize: 13, outline: 'none',
  fontFamily: 'var(--p-font-sans)',
};
const selectStyle: CSSProperties = {
  ...inputStyle,
  padding: '0 32px 0 12px', appearance: 'none', cursor: 'pointer',
  backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2.5\'><polyline points=\'6,9 12,15 18,9\'/></svg>")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
};
const cardHead: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px', borderBottom: '1px solid var(--p-hairline)',
};
const cardTitle: CSSProperties = { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--p-t1)' };
const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th: CSSProperties = {
  textAlign: 'left', padding: '10px 14px',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--p-t3)', background: 'var(--p-surface-2)',
  borderBottom: '1px solid var(--p-border-soft)', whiteSpace: 'nowrap',
};
const td: CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
const iconBtn: CSSProperties = {
  width: 26, height: 26, borderRadius: 5, background: 'transparent', border: 'none',
  color: 'var(--p-t3)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
