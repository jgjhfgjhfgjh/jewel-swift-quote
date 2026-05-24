import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Grid3x3, List, Upload, Download, Plus, Eye, Zap,
} from 'lucide-react';
import { CUSTOMERS, SEGMENTS, fmtCZK } from './_data/mock';
import { Tag, PButton, Avatar, Card } from './_components/primitives';

export default function PartnerCustomers() {
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
    || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>Zákazníci</h1>
          <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>
            {filtered.length} koncových zákazníků · 47 nových v dubnu
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <PButton variant="ghost"><Upload size={14}/> Import CSV</PButton>
          <PButton variant="ghost"><Download size={14}/> Export</PButton>
          <PButton variant="primary" onClick={() => navigate('/partner/new-order')}><Plus size={14}/> Nový zákazník</PButton>
        </div>
      </div>

      {/* Filter bar */}
      <div style={filterBar}>
        <div style={{ position: 'relative', flex: '0 0 320px', maxWidth: '100%' }}>
          <Search size={13} style={searchIconStyle}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hledat zákazníky…"
            style={inlineInput}
          />
        </div>
        <PButton variant="ghost" size="sm"><Filter size={12}/> Filtry</PButton>
        <div style={{ width: 1, height: 24, background: 'var(--p-border-soft)' }}/>
        {SEGMENTS.slice(0, 3).map(s => (
          <button key={s.id} style={segmentChip}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }}/>
            {s.name}
            <span className="p-mono" style={{ fontSize: 10, color: 'var(--p-t3)', marginLeft: 4 }}>{s.count}</span>
          </button>
        ))}
        <div style={{ flex: 1 }}/>
        <div style={{
          display: 'flex', gap: 2, padding: 3,
          background: 'var(--p-surface-2)', borderRadius: 7,
          border: '1px solid var(--p-border-soft)',
        }}>
          <ViewToggle active={view === 'grid'} onClick={() => setView('grid')}><Grid3x3 size={13}/></ViewToggle>
          <ViewToggle active={view === 'list'} onClick={() => setView('list')}><List size={13}/></ViewToggle>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}>
          {filtered.map(c => (
            <Card
              key={c.id}
              style={{ padding: 16, cursor: 'pointer' }}
              padding={16}
            >
              <div
                onClick={() => navigate(`/partner/customers/${c.id}`)}
                style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <Avatar name={c.name} color={c.color} size={44}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--p-t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company || c.city}</div>
                </div>
              </div>
              <Tag variant={c.tag === 'VIP' ? 'bulk' : 'default'} style={{ marginBottom: 12 }}>{c.tag}</Tag>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <KpiCol label="OBJEDNÁVKY" value={String(c.orders)}/>
                <KpiCol label="VÝDAJE" value={fmtCZK(c.spend)} mono/>
              </div>
              <div style={{
                fontSize: 11, color: 'var(--p-t3)', marginTop: 8,
                paddingTop: 8, borderTop: '1px solid var(--p-hairline)',
              }}>
                Poslední: před {c.lastOrder}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <PButton
                  variant="subtle" size="sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); navigate('/partner/new-order'); }}
                ><Plus size={11}/> Objednávka</PButton>
                <PButton
                  variant="ghost" size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate('/partner/bulk'); }}
                  ariaLabel="Bulk dispatch"
                ><Zap size={12}/></PButton>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding={0}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={th}>Zákazník</th>
                  <th style={th}>Firma</th>
                  <th style={th}>Město</th>
                  <th style={th}>Tag</th>
                  <th style={{ ...th, textAlign: 'right' }}>Objednávek</th>
                  <th style={{ ...th, textAlign: 'right' }}>Útrata</th>
                  <th style={th}>Poslední</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    className="p-row"
                    style={{ borderTop: '1px solid var(--p-hairline)', cursor: 'pointer' }}
                    onClick={() => navigate(`/partner/customers/${c.id}`)}
                  >
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={c.name} color={c.color} size={28}/>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, color: 'var(--p-t2)', fontSize: 12 }}>{c.company || '—'}</td>
                    <td style={{ ...td, color: 'var(--p-t2)', fontSize: 12 }}>{c.city}</td>
                    <td style={td}><Tag variant={c.tag === 'VIP' ? 'bulk' : 'default'}>{c.tag}</Tag></td>
                    <td className="p-mono" style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{c.orders}</td>
                    <td className="p-mono" style={{ ...td, textAlign: 'right' }}>{fmtCZK(c.spend)}</td>
                    <td style={{ ...td, fontSize: 12, color: 'var(--p-t3)' }}>před {c.lastOrder}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button style={iconBtn} onClick={(e) => { e.stopPropagation(); navigate(`/partner/customers/${c.id}`); }} aria-label="Zobrazit"><Eye size={12}/></button>
                        <button style={iconBtn} onClick={(e) => { e.stopPropagation(); navigate('/partner/new-order'); }} aria-label="Nová objednávka"><Plus size={12}/></button>
                      </div>
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

function KpiCol({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <span className="p-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--p-t3)' }}>{label}</span>
      <span className={mono ? 'p-mono' : 'p-mono'} style={{ fontSize: 14, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function ViewToggle({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 28, height: 28, borderRadius: 5,
      background: active ? 'var(--p-card-hi)' : 'transparent',
      border: 'none', color: active ? 'var(--p-t1)' : 'var(--p-t3)',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

const filterBar: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: 12,
  background: 'var(--p-card)', border: '1px solid var(--p-border-soft)',
  borderRadius: 'var(--p-radius)', marginBottom: 12, flexWrap: 'wrap',
};
const segmentChip: CSSProperties = {
  height: 30, padding: '0 10px',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
  color: 'var(--p-t2)', borderRadius: 7, fontSize: 12, cursor: 'pointer',
  fontFamily: 'var(--p-font-sans)',
};
const searchIconStyle: CSSProperties = {
  position: 'absolute', left: 10, top: '50%',
  transform: 'translateY(-50%)', color: 'var(--p-t3)', pointerEvents: 'none',
};
const inlineInput: CSSProperties = {
  height: 34, width: '100%', paddingLeft: 32, paddingRight: 10,
  background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
  borderRadius: 8, color: 'var(--p-t1)', fontSize: 13, outline: 'none',
  fontFamily: 'var(--p-font-sans)',
};
const th: CSSProperties = {
  textAlign: 'left', padding: '12px 14px',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--p-t3)', background: 'var(--p-surface-2)',
  borderBottom: '1px solid var(--p-border-soft)', whiteSpace: 'nowrap',
};
const td: CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
const iconBtn: CSSProperties = {
  width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none',
  color: 'var(--p-t3)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
