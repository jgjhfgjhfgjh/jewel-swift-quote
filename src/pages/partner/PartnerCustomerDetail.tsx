import { useMemo, useState, CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Mail, Phone, MapPin, Edit3, Plus, Zap,
  CheckCircle2, Truck, Tag as TagIcon,
} from 'lucide-react';
import { CUSTOMERS, ORDERS, fmtCZK } from './_data/mock';
import {
  Avatar, Card, PButton, StatusPill, Tag,
} from './_components/primitives';

type TabId = 'orders' | 'bulk' | 'addr' | 'notes' | 'activity';

export default function PartnerCustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const c = useMemo(() => CUSTOMERS.find(x => x.id === id) ?? CUSTOMERS[0], [id]);
  const [tab, setTab] = useState<TabId>('orders');

  const customerOrders = ORDERS.filter(o => o.type === 'single' && CUSTOMERS[o.customer]?.id === c.id);
  const bulkBatches = ORDERS.filter(o => o.type === 'bulk');
  const avgOrder = c.orders > 0 ? Math.round(c.spend / c.orders) : 0;

  return (
    <div className="p-page">
      <div style={{ marginBottom: 16 }}>
        <PButton variant="ghost" size="sm" onClick={() => navigate('/partner/customers')}>
          <ChevronLeft size={12}/> Zpět na zákazníky
        </PButton>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar name={c.name} color={c.color} size={56}/>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>{c.name}</h1>
                <Tag variant={c.tag === 'VIP' ? 'bulk' : 'default'}>{c.tag}</Tag>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 12, color: 'var(--p-t2)', flexWrap: 'wrap' }}>
                <span style={inlineMeta}><Mail size={11}/> {c.email}</span>
                <span style={inlineMeta}><Phone size={11}/> <span className="p-mono">{c.phone}</span></span>
                <span style={inlineMeta}><MapPin size={11}/> {c.city}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <PButton variant="ghost"><Edit3 size={14}/> Upravit</PButton>
            <PButton variant="bulk" onClick={() => navigate('/partner/bulk')}><Zap size={14}/> Bulk Dispatch</PButton>
            <PButton variant="primary" onClick={() => navigate('/partner/new-order')}><Plus size={14}/> Nová objednávka</PButton>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Kpi label="Objednávek"    value={String(c.orders)}    sub="Celkem všech časů"/>
        <Kpi label="Útrata"        value={fmtCZK(c.spend)}     sub="Lifetime value"      color="#00D2A0"/>
        <Kpi label="Avg. objednávka" value={fmtCZK(avgOrder)}  sub="Průměr"              color="var(--p-bulk-2)"/>
        <Kpi label="Zákazník od"   value="14. led 2024"        sub="2 roky · 3 měs"/>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid var(--p-border-soft)', overflowX: 'auto' }}>
        {([
          { id: 'orders',   label: 'Objednávky',   count: c.orders },
          { id: 'bulk',     label: 'Bulk dispatch', count: bulkBatches.length },
          { id: 'addr',     label: 'Adresy',       count: 2 },
          { id: 'notes',    label: 'Poznámky',     count: undefined as number | undefined },
          { id: 'activity', label: 'Aktivita',     count: undefined as number | undefined },
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
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--p-font-sans)',
            }}
          >
            {t.label}
            {t.count != null && (
              <span className="p-mono" style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 4,
                background: tab === t.id ? 'rgba(79,110,247,0.15)' : 'var(--p-surface-2)',
                color: tab === t.id ? 'var(--p-primary-2)' : 'var(--p-t3)',
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <Card padding={0}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Datum</th>
                <th style={th}>Položky</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: 'right' }}>Celkem</th>
              </tr>
            </thead>
            <tbody>
              {(customerOrders.length > 0 ? customerOrders : ORDERS.slice(0, 6)).map(o => (
                <tr key={o.id} className="p-row" style={{ borderTop: '1px solid var(--p-hairline)', cursor: 'pointer' }}
                    onClick={() => navigate(`/partner/orders/${o.id}`)}>
                  <td className="p-mono" style={{ ...td, fontSize: 12 }}>{o.id}</td>
                  <td style={{ ...td, fontSize: 12, color: 'var(--p-t2)' }}>{o.created}</td>
                  <td style={{ ...td, fontSize: 12, color: 'var(--p-t2)' }}>{o.items} ks · {o.products[0]}</td>
                  <td style={td}><StatusPill status={o.status}/></td>
                  <td className="p-mono" style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtCZK(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'bulk' && (
        <Card padding={0}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Bulk ID</th>
                <th style={th}>Datum</th>
                <th style={th}>Příjemců</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bulkBatches.map(o => (
                <tr key={o.id} className="p-row" style={{ borderTop: '1px solid var(--p-hairline)', cursor: 'pointer', background: 'rgba(168,85,247,0.025)' }}
                    onClick={() => navigate(`/partner/bulk/${o.id}`)}>
                  <td className="p-mono" style={{ ...td, fontSize: 12 }}>{o.id}</td>
                  <td style={{ ...td, fontSize: 12, color: 'var(--p-t2)' }}>{o.created}</td>
                  <td className="p-mono" style={{ ...td, fontSize: 12 }}>{o.type === 'bulk' ? o.recipientCount : '—'}</td>
                  <td style={td}><StatusPill status={o.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'addr' && (
        <Card>
          <AddressRow primary name={c.name} address={c.address}/>
          <AddressRow name="Práce" address="Václavské nám. 23, 110 00 Praha 1"/>
        </Card>
      )}

      {tab === 'notes' && (
        <Card>
          <textarea
            placeholder="Přidat interní poznámku…"
            style={{
              width: '100%', minHeight: 70, padding: 10,
              background: 'var(--p-surface-2)',
              border: '1px solid var(--p-border-soft)',
              borderRadius: 8, color: 'var(--p-t1)', fontSize: 13,
              outline: 'none', fontFamily: 'var(--p-font-sans)',
              resize: 'vertical', marginBottom: 12,
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: 12, background: 'var(--p-surface-2)', borderRadius: 8,
          }}>
            <Avatar name="Jana Novák" color="#A855F7" size={28}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12 }}>Preferuje křehké balení. Vždy posílat s fragile štítkem.</div>
              <div style={{ fontSize: 11, color: 'var(--p-t3)', marginTop: 2 }}>Jana Novák · před 5 dny</div>
            </div>
          </div>
        </Card>
      )}

      {tab === 'activity' && (
        <Card padding={0}>
          {[
            { t: 'Objednávka DS-2026-0418 doručena', d: 'před 2 hod', Icon: CheckCircle2 },
            { t: 'Objednávka DS-2026-0418 odeslána', d: 'včera',      Icon: Truck },
            { t: 'Objednávka DS-2026-0418 vytvořena', d: 'včera',     Icon: Plus },
            { t: 'Adresa aktualizována',            d: 'před 4 dny', Icon: Edit3 },
            { t: 'Tag VIP přidán',                  d: 'před týdnem',Icon: TagIcon },
          ].map((e, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 12,
              borderBottom: i < arr.length - 1 ? '1px solid var(--p-hairline)' : undefined,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--p-t2)',
              }}><e.Icon size={13}/></div>
              <span style={{ flex: 1, fontSize: 13 }}>{e.t}</span>
              <span style={{ fontSize: 11, color: 'var(--p-t3)' }}>{e.d}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Kpi({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <Card>
      <div className="p-mono" style={{ fontSize: 10, color: 'var(--p-t3)', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</div>
      <div className="p-mono" style={{
        fontSize: 22, fontWeight: 700, color: color ?? 'var(--p-t1)',
        marginTop: 8, lineHeight: 1,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--p-t3)', marginTop: 8 }}>{sub}</div>
    </Card>
  );
}

function AddressRow({ name, address, primary }: { name: string; address: string; primary?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: 14,
      background: 'var(--p-surface-2)', borderRadius: 10, marginBottom: 8,
    }}>
      <MapPin size={16} style={{ color: primary ? 'var(--p-primary)' : 'var(--p-t3)' }}/>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ fontSize: 13 }}>{name}</b>
          {primary && <Tag variant="primary">VÝCHOZÍ</Tag>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--p-t2)', marginTop: 4 }}>{address}</div>
      </div>
      <PButton variant="ghost" size="sm"><Edit3 size={12}/></PButton>
    </div>
  );
}

const inlineMeta: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4 };
const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th: CSSProperties = {
  textAlign: 'left', padding: '10px 14px',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--p-t3)', background: 'var(--p-surface-2)',
  borderBottom: '1px solid var(--p-border-soft)', whiteSpace: 'nowrap',
};
const td: CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
