import { useMemo, useState, CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Download, Mail, Users, Package, Clock, AlertTriangle,
  Zap, Eye, RefreshCcw, Plus, Layers, Send, Truck,
} from 'lucide-react';
import {
  ORDERS, CUSTOMERS, PRODUCTS, Order, BulkOrder, Status, fmtCZK,
} from './_data/mock';
import {
  StatusPill, Tag, PButton, Avatar, Card, MarginBox,
} from './_components/primitives';

export default function PartnerBulkDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<'recipients' | 'products' | 'timeline' | 'errors'>('recipients');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const order = useMemo<Order>(() => {
    const byId = ORDERS.find(o => o.id === id && o.type === 'bulk');
    if (byId) return byId;
    return ORDERS.find(o => o.type === 'bulk') ?? ORDERS[0];
  }, [id]);

  if (order.type !== 'bulk') {
    return (
      <div className="p-page" style={{ padding: 32, textAlign: 'center', color: 'var(--p-t3)' }}>
        Tato objednávka není bulk.
      </div>
    );
  }

  const bulk: BulkOrder = order;
  const recipients = bulk.recipients.map(i => CUSTOMERS[i]).filter(Boolean);

  // Synthesize per-recipient statuses for the demo
  const rowStatus = (i: number): Status => {
    if (i === 4 || i === 7) return 'pending';
    if (i < 6) return 'delivered';
    return 'shipped';
  };
  const counts = {
    all: recipients.length,
    delivered: recipients.filter((_, i) => rowStatus(i) === 'delivered').length,
    shipped:   recipients.filter((_, i) => rowStatus(i) === 'shipped').length,
    pending:   recipients.filter((_, i) => rowStatus(i) === 'pending').length,
  };

  const filteredRecipients = recipients
    .map((r, i) => ({ r, i, status: rowStatus(i) }))
    .filter(row => statusFilter === 'all' ? true : row.status === statusFilter);

  return (
    <div className="p-page">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <PButton variant="ghost" size="sm" onClick={() => navigate('/partner/orders')} style={{ marginBottom: 8 }}>
          <ChevronLeft size={12}/> Zpět na objednávky
        </PButton>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Zap size={22} style={{ color: 'var(--p-bulk-2)' }}/>
              <h1 className="p-mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>{bulk.id}</h1>
              <Tag variant="bulk">BULK DISPATCH</Tag>
              <StatusPill status={bulk.status}/>
            </div>
            <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>
              {bulk.recipientCount} příjemců · {bulk.products.length} produkt(ů) · vytvořeno {bulk.created}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <PButton variant="ghost"><Download size={14}/> Souhrn PDF</PButton>
            <PButton variant="bulk"><Mail size={14}/> Poslat notifikace</PButton>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12, marginBottom: 16,
      }}>
        <Kpi label="Celkem"   value={bulk.recipientCount}     sub="Příjemců"/>
        <Kpi label="Odesláno" value={counts.delivered + counts.shipped} sub="v dopravě / doručeno" color="#00D2A0"/>
        <Kpi label="Čeká"     value={counts.pending}          sub="zpracovává se" color="#F5A623"/>
        <Kpi label="Marže"    value={fmtCZK(8420)}            sub="28% z výnosu" color="var(--p-bulk-2)" mono/>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid var(--p-border-soft)', overflowX: 'auto' }}>
        {([
          { id: 'recipients', label: 'Příjemci',  Icon: Users,          count: bulk.recipientCount },
          { id: 'products',   label: 'Produkty',  Icon: Package,        count: bulk.products.length },
          { id: 'timeline',   label: 'Timeline',  Icon: Clock,          count: undefined as number | undefined },
          { id: 'errors',     label: 'Chyby',     Icon: AlertTriangle,  count: 3 },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--p-bulk)' : 'transparent'}`,
              color: tab === t.id ? 'var(--p-bulk-2)' : 'var(--p-t3)',
              fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--p-font-sans)',
            }}
          >
            <t.Icon size={13}/> {t.label}
            {t.count != null && (
              <span className="p-mono" style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 4,
                background: tab === t.id ? 'rgba(168,85,247,0.15)' : 'var(--p-surface-2)',
                color: tab === t.id ? 'var(--p-bulk-2)' : 'var(--p-t3)',
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Recipients tab ── */}
      {tab === 'recipients' && (
        <Card padding={0}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: 12,
            borderBottom: '1px solid var(--p-border-soft)', flexWrap: 'wrap',
          }}>
            <FilterChip active={statusFilter === 'all'}       onClick={() => setStatusFilter('all')}>Vše · {counts.all}</FilterChip>
            <FilterChip active={statusFilter === 'delivered'} onClick={() => setStatusFilter('delivered')}>Doručeno · {counts.delivered}</FilterChip>
            <FilterChip active={statusFilter === 'shipped'}   onClick={() => setStatusFilter('shipped')}>V dopravě · {counts.shipped}</FilterChip>
            <FilterChip active={statusFilter === 'pending'}   onClick={() => setStatusFilter('pending')}>Čeká · {counts.pending}</FilterChip>
            <div style={{ flex: 1 }}/>
            <PButton variant="subtle" size="sm"><Mail size={12}/> Poslat všem</PButton>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={th}>Zákazník</th>
                  <th style={th}>Adresa</th>
                  <th style={th}>Objednávka</th>
                  <th style={th}>Tracking</th>
                  <th style={th}>Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipients.map(({ r, i, status }) => (
                  <tr key={r.id} className="p-row" style={{ borderTop: '1px solid var(--p-hairline)' }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={r.name} color={r.color} size={28}/>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, color: 'var(--p-t2)', fontSize: 12 }}>{r.address}</td>
                    <td className="p-mono" style={{ ...td, fontSize: 12 }}>DS-2026-09{(i + 10).toString().padStart(2, '0')}</td>
                    <td style={td}>
                      {status === 'pending'
                        ? <span style={{ fontSize: 12, color: 'var(--p-t3)' }}>—</span>
                        : <span className="p-mono" style={{ fontSize: 12 }}>Z {(8847000 + i * 23)}</span>}
                    </td>
                    <td style={td}><StatusPill status={status}/></td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <ActionBtn><Eye size={12}/></ActionBtn>
                        <ActionBtn><RefreshCcw size={12}/></ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Products tab ── */}
      {tab === 'products' && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bulk.products.map((name, i) => {
              const p = PRODUCTS.find(pp => pp.name === name) ?? PRODUCTS[0];
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: 16, background: 'var(--p-surface-2)', borderRadius: 10,
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 10,
                    background: `linear-gradient(135deg, ${p.img}, ${p.img}66)`,
                    flexShrink: 0,
                  }}/>
                  <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>SKU {p.sku}</div>
                  </div>
                  <Stat label="CELKEM KS" value={`${bulk.recipientCount} ks`}/>
                  <Stat label="VELKOOB."   value={fmtCZK(p.wholesale * bulk.recipientCount)}/>
                  <Stat label="VÝNOS"      value={fmtCZK(p.retail * bulk.recipientCount)} color="#00D2A0"/>
                </div>
              );
            })}
            <MarginBox style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: 'var(--p-t2)' }}>Hrubá marže batch</span>
                <span className="p-mono" style={{ fontSize: 15, fontWeight: 700, color: '#00D2A0' }}>{fmtCZK(8420)} (28%)</span>
              </div>
            </MarginBox>
          </div>
        </Card>
      )}

      {/* ── Timeline tab ── */}
      {tab === 'timeline' && (
        <Card padding={0}>
          {[
            { t: 'Bulk dispatch vytvořen',                              d: 'Dnes, 11:08', who: 'Jana Novák',     Icon: Plus },
            { t: `${bulk.recipientCount} jednotlivých objednávek vygenerováno`, d: 'Dnes, 11:08', who: 'Systém',        Icon: Layers },
            { t: 'Odesláno k zpracování',                               d: 'Dnes, 11:09', who: 'Systém',         Icon: Send },
            { t: '32 zásilek odesláno přes Zásilkovna',                d: 'Dnes, 14:22', who: 'Zásilkovna API', Icon: Truck },
            { t: '3 objednávky vyžadují pozornost (chybná adresa)',     d: 'Dnes, 15:01', who: 'Systém',         Icon: AlertTriangle },
          ].map((e, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: 14,
              borderBottom: i < arr.length - 1 ? '1px solid var(--p-hairline)' : undefined,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--p-bulk-2)', flexShrink: 0,
              }}><e.Icon size={14}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{e.t}</div>
                <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{e.d} · {e.who}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* ── Errors tab ── */}
      {tab === 'errors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recipients.slice(0, 3).map((r) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 14,
              background: 'rgba(245,166,35,0.04)',
              border: '1px solid rgba(245,166,35,0.2)',
              borderRadius: 10, flexWrap: 'wrap',
            }}>
              <AlertTriangle size={20} style={{ color: '#F5A623', flexShrink: 0 }}/>
              <div style={{ flex: '1 1 220px', minWidth: 200 }}>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--p-t2)' }}>Neplatné PSČ — {r.address}</div>
              </div>
              <PButton variant="subtle" size="sm">Opravit adresu</PButton>
              <PButton variant="bulk" size="sm">Znovu odeslat</PButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Kpi({ label, value, sub, color, mono }: { label: string; value: number | string; sub: string; color?: string; mono?: boolean }) {
  return (
    <Card>
      <div className="p-mono" style={{ fontSize: 10, color: 'var(--p-t3)', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</div>
      <div className={mono ? 'p-mono' : 'p-mono'} style={{
        fontSize: 22, fontWeight: 700, color: color ?? 'var(--p-t1)', marginTop: 8, lineHeight: 1,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--p-t3)', marginTop: 8 }}>{sub}</div>
    </Card>
  );
}
function Stat({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', minWidth: 90 }}>
      <span className="p-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--p-t3)' }}>{label}</span>
      <span className="p-mono" style={{ fontSize: 14, fontWeight: 700, color: color ?? 'var(--p-t1)' }}>{value}</span>
    </div>
  );
}
function FilterChip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      height: 30, padding: '0 12px',
      background: active ? 'rgba(168,85,247,0.12)' : 'var(--p-surface-2)',
      border: `1px solid ${active ? 'rgba(168,85,247,0.3)' : 'var(--p-border-soft)'}`,
      color: active ? 'var(--p-bulk-2)' : 'var(--p-t2)',
      borderRadius: 7, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
      fontFamily: 'var(--p-font-sans)',
    }}>{children}</button>
  );
}
function ActionBtn({ children }: { children: React.ReactNode }) {
  return (
    <button style={{
      width: 26, height: 26, borderRadius: 6,
      background: 'transparent', border: 'none', color: 'var(--p-t3)',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

const th: CSSProperties = {
  textAlign: 'left', padding: '10px 14px',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--p-t3)', background: 'var(--p-surface-2)',
  borderBottom: '1px solid var(--p-border-soft)', whiteSpace: 'nowrap',
};
const td: CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
