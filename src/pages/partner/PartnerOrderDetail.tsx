import { useMemo, CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Download, Copy, Truck, Mail, Phone, MapPin,
  Plus, Package, CheckCircle2, Check, X, Edit3, RefreshCcw,
} from 'lucide-react';
import {
  ORDERS, CUSTOMERS, PRODUCTS, SOURCES, Order, fmtCZK, margin, marginColor,
} from './_data/mock';
import {
  StatusPill, Tag, PButton, Avatar, SourceBadge, MarginValue, Card, MarginBox,
} from './_components/primitives';
import { pToast } from './_components/toast';

export default function PartnerOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const order: Order = useMemo(() => ORDERS.find(o => o.id === id) ?? ORDERS[0], [id]);

  // If user landed on a bulk id, redirect inline
  if (order.type === 'bulk') {
    return (
      <div className="p-page" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: 'var(--p-t3)' }}>
          Toto je bulk objednávka — <button onClick={() => navigate(`/partner/bulk/${order.id}`)} style={linkBtn}>otevřít bulk detail</button>.
        </p>
      </div>
    );
  }
  const customer = CUSTOMERS[order.customer];

  const items = order.products.map(name => {
    const p = PRODUCTS.find(p => p.name === name) ?? PRODUCTS[0];
    return { ...p, qty: 1 };
  });
  const subtotal = items.reduce((s, it) => s + it.retail, 0);
  const wholesale = items.reduce((s, it) => s + it.wholesale, 0);
  const shipping = 89;
  const marginPct = subtotal > 0 ? Math.round(((subtotal - wholesale) / subtotal) * 100) : 0;

  const timeline = [
    { label: 'Vytvořeno',  time: order.created,                                                      done: true, icon: Plus },
    { label: 'Zpracováno', time: order.created.includes('Dnes') ? 'Dnes, 14:30' : 'Včera, 19:00',     done: order.status !== 'pending' && order.status !== 'cancelled', icon: Check },
    { label: 'Zabaleno',   time: 'Dnes, 16:42',                                                       done: order.status === 'shipped' || order.status === 'delivered', icon: Package },
    { label: 'Odesláno',   time: (order.status === 'shipped' || order.status === 'delivered') ? 'Dnes, 17:15' : null, done: order.status === 'shipped' || order.status === 'delivered', icon: Truck },
    { label: 'Doručeno',   time: order.status === 'delivered' ? 'Zítra, 10:30 (odhad)' : null,        done: order.status === 'delivered', icon: CheckCircle2 },
  ];

  return (
    <div className="p-page">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <PButton variant="ghost" size="sm" onClick={() => navigate('/partner/orders')} style={{ marginBottom: 8 }}>
          <ChevronLeft size={12}/> Zpět na objednávky
        </PButton>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="p-mono" style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--p-t1)' }}>{order.id}</h1>
              <StatusPill status={order.status}/>
            </div>
            <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>
              Vytvořeno {order.created} · {SOURCES[order.source].label}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <PButton variant="ghost" onClick={() => pToast.info('Faktura PDF (TODO)')}><Download size={14}/> Faktura PDF</PButton>
            <PButton variant="ghost" onClick={() => pToast.info('Duplikovat (TODO)')}><Copy size={14}/> Duplikovat</PButton>
            <PButton variant="primary"><Truck size={14}/> Sledovat zásilku</PButton>
          </div>
        </div>
      </div>

      <div style={detailGrid}>
        {/* ── Left column: items, tracking, notes ────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Items */}
          <Card padding={0}>
            <div style={cardHead}>
              <h3 style={cardHeadTitle}>Položky objednávky</h3>
              <span className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>{items.length} produktů</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={th}>Produkt</th>
                  <th style={{ ...th, textAlign: 'right' }}>Množ.</th>
                  <th style={{ ...th, textAlign: 'right' }}>Velkoob.</th>
                  <th style={{ ...th, textAlign: 'right' }}>Koncová</th>
                  <th style={{ ...th, textAlign: 'right' }}>Marže</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const m = margin(it.wholesale, it.retail);
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--p-hairline)' }}>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 8,
                            background: `linear-gradient(135deg, ${it.img}, ${it.img}66)`,
                            position: 'relative', overflow: 'hidden', flexShrink: 0,
                          }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)' }}/>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</div>
                            <div className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>SKU {it.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-mono" style={{ ...td, textAlign: 'right' }}>{it.qty}×</td>
                      <td className="p-mono" style={{ ...td, textAlign: 'right', color: 'var(--p-t2)' }}>{fmtCZK(it.wholesale)}</td>
                      <td className="p-mono" style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmtCZK(it.retail)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <span className="p-mono" style={{ fontWeight: 700, color: marginColor(m), fontSize: 12 }}>{m}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: 16, background: 'var(--p-surface-2)', borderTop: '1px solid var(--p-border-soft)' }}>
              <Row label="Mezisoučet" value={fmtCZK(subtotal)}/>
              <Row label={`Doprava (${order.carrier})`} value={fmtCZK(shipping)}/>
              <div style={{ margin: '8px 0', borderTop: '1px solid var(--p-hairline)' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600 }}>Celkem zákazník</span>
                <span className="p-mono" style={{ fontWeight: 700, fontSize: 16 }}>{fmtCZK(subtotal + shipping)}</span>
              </div>
              <MarginBox style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--p-t2)' }}>Velkoobchodní náklady · {fmtCZK(wholesale)}</span>
                  <span className="p-mono" style={{ fontSize: 15, fontWeight: 700, color: '#00D2A0' }}>
                    Marže {fmtCZK(subtotal - wholesale)} (<MarginValue pct={marginPct}/>)
                  </span>
                </div>
              </MarginBox>
            </div>
          </Card>

          {/* Tracking timeline */}
          <Card padding={0}>
            <div style={cardHead}>
              <h3 style={cardHeadTitle}>Sledování zásilky</h3>
              <Tag>{order.carrier}</Tag>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {timeline.map((t, i) => {
                const Ic = t.icon;
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < timeline.length - 1 ? 18 : 0, position: 'relative' }}>
                    {i < timeline.length - 1 && (
                      <div style={{
                        position: 'absolute', left: 13, top: 28, bottom: 0, width: 2,
                        background: t.done ? '#00D2A0' : 'var(--p-border)',
                      }}/>
                    )}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: t.done ? 'rgba(0,210,160,0.15)' : 'var(--p-surface-2)',
                      border: `1px solid ${t.done ? 'rgba(0,210,160,0.4)' : 'var(--p-border)'}`,
                      color: t.done ? '#00D2A0' : 'var(--p-t3)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, position: 'relative', zIndex: 1,
                    }}><Ic size={13}/></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: t.done ? 'var(--p-t1)' : 'var(--p-t2)' }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--p-t3)', marginTop: 2 }}>{t.time ?? 'Čeká'}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 16, padding: 12, background: 'var(--p-surface-2)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <Package size={14} style={{ color: 'var(--p-t2)' }}/>
                  <span style={{ color: 'var(--p-t2)' }}>Tracking č.:</span>
                  <span className="p-mono" style={{ fontWeight: 700 }}>Z 8847 1192 045</span>
                  <div style={{ flex: 1 }}/>
                  <PButton variant="ghost" size="sm" onClick={() => pToast.success('Zkopírováno')}>
                    <Copy size={11}/> Kopírovat
                  </PButton>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right column: customer, details, actions ───────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card padding={0}>
            <div style={cardHead}>
              <h3 style={cardHeadTitle}>Koncový zákazník</h3>
              <PButton variant="ghost" size="sm"><Edit3 size={12}/></PButton>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Avatar name={customer.name} color={customer.color} size={44}/>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{customer.name}</div>
                  {customer.company && <div style={{ fontSize: 12, color: 'var(--p-t2)' }}>{customer.company}</div>}
                  <div className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>{customer.id}</div>
                </div>
              </div>
              <ContactRow icon={Mail} text={customer.email}/>
              <ContactRow icon={Phone} text={customer.phone} mono/>
              <ContactRow icon={MapPin} text={customer.address} multiline/>
              <div style={{ margin: '14px 0', borderTop: '1px solid var(--p-hairline)' }}/>
              <PButton variant="subtle" style={{ width: '100%' }} onClick={() => navigate(`/partner/customers/${customer.id}`)}>
                Zobrazit profil <ChevronRight size={12}/>
              </PButton>
            </div>
          </Card>

          <Card padding={0}>
            <div style={cardHead}><h3 style={cardHeadTitle}>Detaily objednávky</h3></div>
            <div style={{ padding: 16, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <KV label="ID Objednávky" value={<span className="p-mono">{order.id}</span>}/>
              <KV label="Zdroj" value={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><SourceBadge source={order.source}/>{SOURCES[order.source].label}</span>}/>
              <KV label="Reference" value={<span className="p-mono">#SH-2026-1842</span>}/>
              <KV label="Vytvořeno" value={order.created}/>
              <KV label="Dopravce" value={order.carrier}/>
              <KV label="Blind shipping" value={<span style={{ color: '#00D2A0' }}>Ano</span>}/>
              <KV label="Tagy" value={<div style={{ display: 'inline-flex', gap: 4 }}><Tag>priorita</Tag><Tag variant="primary">VIP</Tag></div>}/>
            </div>
          </Card>

          <Card padding={0}>
            <div style={cardHead}><h3 style={cardHeadTitle}>Akce</h3></div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PButton variant="subtle" style={{ width: '100%', justifyContent: 'flex-start' }}><RefreshCcw size={13}/> Změnit status</PButton>
              <PButton variant="subtle" style={{ width: '100%', justifyContent: 'flex-start' }}><Mail size={13}/> Poslat e-mail</PButton>
              <PButton variant="danger" style={{ width: '100%', justifyContent: 'flex-start' }}><X size={13}/> Zrušit objednávku</PButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: 'var(--p-t2)' }}>{label}</span>
      <span className="p-mono" style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}
function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--p-t3)' }}>{label}</span>
      <span style={{ color: 'var(--p-t1)' }}>{value}</span>
    </div>
  );
}
function ContactRow({ icon: Ic, text, mono, multiline }: { icon: React.ElementType; text: string; mono?: boolean; multiline?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 10, marginBottom: 8 }}>
      <Ic size={13} style={{ color: 'var(--p-t3)', marginTop: multiline ? 2 : 0, flexShrink: 0 }}/>
      <span className={mono ? 'p-mono' : undefined} style={{ fontSize: 12, color: 'var(--p-t1)' }}>{text}</span>
    </div>
  );
}

const detailGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
  gap: 14,
};
const cardHead: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px', borderBottom: '1px solid var(--p-hairline)',
};
const cardHeadTitle: CSSProperties = { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--p-t1)' };
const th: CSSProperties = {
  textAlign: 'left', padding: '10px 14px',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--p-t3)', background: 'var(--p-surface-2)',
  borderBottom: '1px solid var(--p-border-soft)', whiteSpace: 'nowrap',
};
const td: CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
const linkBtn: CSSProperties = {
  background: 'transparent', border: 'none', padding: 0,
  color: 'var(--p-primary-2)', cursor: 'pointer', fontFamily: 'inherit',
  fontSize: 'inherit', textDecoration: 'underline',
};
