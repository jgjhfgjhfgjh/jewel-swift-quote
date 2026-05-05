import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus,
  Package, DollarSign, Zap, Users,
  Eye, Truck, MoreHorizontal,
  ShoppingCart, UserPlus, Download, Plug, ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

// ── Mock data ──────────────────────────────────────────────────────

const MOCK_ORDERS = [
  { id: 'DS-2026-0418', customer: 'Jana Nováková',     items: 3, status: 'delivered',  total: 4280,  type: 'dropship' },
  { id: 'DS-2026-0417', customer: 'Petr Dvořák',       items: 1, status: 'shipped',    total: 1890,  type: 'dropship' },
  { id: 'B-2026-0042',  customer: '47 příjemců',       items: 6, status: 'processing', total: 38400, type: 'bulk' },
  { id: 'DS-2026-0416', customer: 'Marie Procházková', items: 2, status: 'pending',    total: 2340,  type: 'dropship' },
  { id: 'DS-2026-0415', customer: 'Tomáš Krejčí',      items: 4, status: 'delivered',  total: 5670,  type: 'dropship' },
  { id: 'DS-2026-0414', customer: 'Eva Horáková',      items: 1, status: 'cancelled',  total: 1240,  type: 'dropship' },
];

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  pending:    { label: 'Čeká',        bg: 'rgba(245,166,35,0.12)',   color: '#F5A623' },
  processing: { label: 'Zpracovává',  bg: 'rgba(79,110,247,0.12)',   color: '#6E8AFF' },
  shipped:    { label: 'Odesláno',    bg: 'rgba(168,85,247,0.12)',   color: '#C084FC' },
  delivered:  { label: 'Doručeno',    bg: 'rgba(0,210,160,0.12)',    color: '#00D2A0' },
  cancelled:  { label: 'Zrušeno',     bg: 'rgba(247,79,79,0.12)',    color: '#F74F4F' },
};

const REVENUE_DATA = [
  { date: '15.4', dropship: 42,  wholesale: 128 },
  { date: '17.4', dropship: 51,  wholesale: 138 },
  { date: '19.4', dropship: 48,  wholesale: 156 },
  { date: '21.4', dropship: 62,  wholesale: 162 },
  { date: '23.4', dropship: 71,  wholesale: 182 },
  { date: '25.4', dropship: 84,  wholesale: 195 },
  { date: '27.4', dropship: 92,  wholesale: 204 },
  { date: '28.4', dropship: 102, wholesale: 228 },
];

const TOP_PRODUCTS = [
  { label: 'Skleněná lahev Fjord 750ml',    value: 803, color: '#00D2A0' },
  { label: 'Keramický hrnek Terra',          value: 521, color: '#C084FC' },
  { label: 'Aroma Diffuser Lumina',          value: 412, color: '#A855F7' },
  { label: 'Bambusový stojan',               value: 287, color: '#4F6EF7' },
  { label: 'Bezdrátová sluchátka Nordic',    value: 156, color: '#F5A623' },
];

const DONUT_DATA = [
  { label: 'Doručeno',   value: 64, color: '#00D2A0' },
  { label: 'Odesláno',   value: 32, color: '#A855F7' },
  { label: 'Zpracovává', value: 18, color: '#4F6EF7' },
  { label: 'Čeká',       value: 11, color: '#F5A623' },
  { label: 'Zrušeno',    value:  3, color: '#F74F4F' },
];

// ── Sub-components ─────────────────────────────────────────────────

const Sparkline = ({ values, color = '#00D2A0', w = 80, h = 28 }: {
  values: number[]; color?: string; w?: number; h?: number;
}) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const lastY = h - ((values[values.length - 1] - min) / range) * (h - 4) - 2;
  const gradId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gradId})`} />
      <circle cx={step * (values.length - 1)} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
};

const SvgDonut = ({ data, size = 160, thickness = 22 }: {
  data: { label: string; value: number; color: string }[];
  size?: number; thickness?: number;
}) => {
  const r = size / 2 - thickness / 2 - 1;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  let off = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--p-surface-2)" strokeWidth={thickness} />
      {data.map((d, i) => {
        const len = (d.value / total) * c;
        const dash = `${len} ${c - len}`;
        const dashOff = -(off / c) * c;
        off += len;
        return (
          <circle key={i} cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={d.color} strokeWidth={thickness}
            strokeDasharray={dash} strokeDashoffset={dashOff}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'all 0.6s var(--p-ease)' }} />
        );
      })}
      <text x="50%" y="46%" textAnchor="middle" fill="var(--p-t1)"
        fontSize="18" fontWeight="700" fontFamily="var(--p-font-mono)">{total}</text>
      <text x="50%" y="60%" textAnchor="middle" fill="var(--p-t3)"
        fontSize="9" letterSpacing="1" fontFamily="var(--p-font-mono)">OBJEDNÁVEK</text>
    </svg>
  );
};

const HBar = ({ items }: { items: typeof TOP_PRODUCTS }) => {
  const max = Math.max(...items.map(i => i.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: it.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--p-t1)' }}>{it.label}</span>
            </div>
            <span style={{ fontSize: 12, fontFamily: 'var(--p-font-mono)', color: 'var(--p-t2)' }}>
              {it.value} ks
            </span>
          </div>
          <div style={{ height: 5, background: 'var(--p-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${(it.value / max) * 100}%`, height: '100%',
              background: it.color, borderRadius: 99,
              transition: 'width 0.6s var(--p-ease)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ── KPI Card ───────────────────────────────────────────────────────

interface KpiProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  dir: 'up' | 'down' | 'flat';
  spark: number[];
  sparkColor: string;
  accent?: 'primary' | 'bulk' | 'warn' | 'success';
}

const ACCENT_COLORS = {
  primary: 'var(--p-primary)',
  bulk:    'var(--p-bulk)',
  warn:    'var(--p-warn)',
  success: 'var(--p-success)',
};

const KpiCard = ({ icon: Icon, label, value, delta, dir, spark, sparkColor, accent }: KpiProps) => {
  const accentColor = accent ? ACCENT_COLORS[accent] : 'var(--p-primary)';
  const DeltaIcon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus;
  const deltaColor = dir === 'up' ? 'var(--p-success)' : dir === 'down' ? 'var(--p-danger)' : 'var(--p-t3)';
  return (
    <div style={{
      background: 'var(--p-card)', border: '1px solid var(--p-border-soft)',
      borderRadius: 'var(--p-radius)', padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: accent === 'bulk' ? '0 0 0 1px rgba(168,85,247,0.12) inset' : undefined,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: 'var(--p-t2)', fontWeight: 500 }}>{label}</span>
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: `${accentColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
        }}>
          <Icon size={14} />
        </span>
      </div>
      <div style={{
        fontSize: 26, fontFamily: 'var(--p-font-mono)',
        fontWeight: 700, color: 'var(--p-t1)', lineHeight: 1,
      }}>{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: deltaColor, fontWeight: 500 }}>
          <DeltaIcon size={11} />{delta}
        </span>
        <Sparkline values={spark} color={sparkColor} />
      </div>
    </div>
  );
};

// ── Quick action item ──────────────────────────────────────────────

const QA = ({ icon: Icon, title, sub, bulk, onClick }: {
  icon: React.ElementType; title: string; sub: string; bulk?: boolean; onClick?: () => void;
}) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: 12, textAlign: 'left', cursor: 'pointer',
    background: bulk
      ? 'linear-gradient(180deg, rgba(168,85,247,0.08), rgba(168,85,247,0.02))'
      : 'var(--p-surface-2)',
    border: `1px solid ${bulk ? 'rgba(168,85,247,0.2)' : 'var(--p-border-soft)'}`,
    borderRadius: 10,
    transition: `all var(--p-t-fast)`,
    color: 'var(--p-t1)',
  }}>
    <span style={{
      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
      background: bulk
        ? 'linear-gradient(135deg, var(--p-bulk), #7E22CE)'
        : 'var(--p-card-hi)',
      boxShadow: bulk ? '0 4px 12px -2px rgba(168,85,247,0.4)' : undefined,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: bulk ? 'white' : 'var(--p-t2)',
    }}>
      <Icon size={16} />
    </span>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
      <b style={{ fontSize: 13, fontWeight: 600, color: 'var(--p-t1)' }}>{title}</b>
      <span style={{ fontSize: 11.5, color: 'var(--p-t3)' }}>{sub}</span>
    </div>
    <ChevronRight size={14} style={{ color: 'var(--p-t4)', flexShrink: 0 }} />
  </button>
);

// ── Card wrapper ───────────────────────────────────────────────────

const Card = ({ children, style }: { children: React.ReactNode; style?: CSSProperties }) => (
  <div style={{
    background: 'var(--p-card)', border: '1px solid var(--p-border-soft)',
    borderRadius: 'var(--p-radius)', ...style,
  }}>{children}</div>
);

const CardHeader = ({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '16px 18px 12px', borderBottom: '1px solid var(--p-hairline)',
  }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--p-t1)' }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--p-t3)', marginTop: 2 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const GhostBtn = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, color: 'var(--p-t2)', cursor: 'pointer',
    background: 'transparent', border: '1px solid var(--p-border-soft)',
    borderRadius: 6, padding: '4px 10px',
  }}>{children}</button>
);

// ── Custom chart tooltip ───────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--p-card-hi)', border: '1px solid var(--p-border)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
      fontFamily: 'var(--p-font-mono)',
    }}>
      <div style={{ color: 'var(--p-t3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.stroke, flexShrink: 0 }} />
          <span style={{ color: 'var(--p-t2)' }}>{p.name === 'dropship' ? 'Dropship' : 'Wholesale'}</span>
          <span style={{ color: 'var(--p-t1)', marginLeft: 'auto' }}>{p.value}k Kč</span>
        </div>
      ))}
    </div>
  );
};

// ── Main dashboard ─────────────────────────────────────────────────

export default function PartnerDashboard() {
  const { profile } = useAuthContext();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'7D' | '30D' | '90D' | '1R'>('30D');

  const name = profile?.company_name?.split(' ')[0] || 'partnere';

  return (
    <div className="p-page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>
            Dobré ráno, {name} 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4, margin: '4px 0 0' }}>
            Přehled vaší dropshipping aktivity · {new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <GhostBtn><Download size={13} /> Export</GhostBtn>
          <button onClick={() => navigate('/partner/bulk')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: 'none',
            background: 'linear-gradient(135deg, var(--p-bulk), #7E22CE)',
            color: 'white', boxShadow: 'var(--p-glow-bulk)',
          }}>
            <Zap size={14} /> Hromadné odeslání
          </button>
          <button onClick={() => navigate('/partner/new-order')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: 'none',
            background: 'var(--p-primary)', color: 'white',
            boxShadow: 'var(--p-glow-primary)',
          }}>
            <Plus size={14} /> Nová objednávka
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="partner-grid-4">
        <KpiCard
          icon={Package} label="Objednávky dnes" value="34"
          delta="+18%" dir="up"
          spark={[12, 18, 14, 22, 19, 28, 34]} sparkColor="#00D2A0"
          accent="success"
        />
        <KpiCard
          icon={DollarSign} label="Výnosy · duben" value="412 380 Kč"
          delta="+24%" dir="up"
          spark={[180, 210, 260, 240, 310, 360, 412]} sparkColor="#00D2A0"
          accent="success"
        />
        <KpiCard
          icon={Truck} label="Čekající zásilky" value="14"
          delta="−3" dir="down"
          spark={[22, 19, 18, 17, 16, 15, 14]} sparkColor="#F5A623"
          accent="warn"
        />
        <KpiCard
          icon={Users} label="Aktivní zákazníci" value="1 247"
          delta="+47 nových" dir="up"
          spark={[1180, 1195, 1208, 1220, 1228, 1240, 1247]} sparkColor="#C084FC"
          accent="bulk"
        />
      </div>

      {/* Recent orders + Quick actions */}
      <div className="partner-grid-2-1">

        {/* Recent orders */}
        <Card>
          <CardHeader
            title="Nedávné objednávky"
            sub="Posledních 24 hodin"
            action={
              <GhostBtn onClick={() => navigate('/partner/orders')}>
                Zobrazit vše <ChevronRight size={11} />
              </GhostBtn>
            }
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--p-hairline)' }}>
                  {['ID', 'Zákazník', 'Ks', 'Status', 'Celkem', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '8px 14px', fontSize: 11, fontWeight: 600, textAlign: i >= 4 ? 'right' : 'left',
                      color: 'var(--p-t3)', letterSpacing: '0.05em', textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.map(o => {
                  const st = STATUS[o.status];
                  return (
                    <tr key={o.id} style={{
                      borderBottom: '1px solid var(--p-hairline)',
                      boxShadow: o.type === 'bulk' ? 'inset 3px 0 0 var(--p-bulk)' : undefined,
                    }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {o.type === 'bulk' && (
                            <Zap size={12} style={{ color: 'var(--p-bulk-2)', flexShrink: 0 }} />
                          )}
                          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: 12, color: 'var(--p-t1)' }}>
                            {o.id}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--p-t1)' }}>
                        {o.customer}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--p-t3)' }}>
                        {o.items} ks
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                          background: st.bg, color: st.color, whiteSpace: 'nowrap',
                        }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: 12, color: 'var(--p-t1)', fontWeight: 600 }}>
                          {o.total.toLocaleString('cs-CZ')} Kč
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {[<Eye size={12} />, <Truck size={12} />, <MoreHorizontal size={12} />].map((ico, i) => (
                            <button key={i} style={{
                              width: 24, height: 24, borderRadius: 5,
                              background: 'transparent', border: 'none',
                              color: 'var(--p-t3)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>{ico}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick actions */}
        <Card style={{ padding: '16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--p-t1)' }}>Rychlé akce</span>
            <Zap size={14} style={{ color: 'var(--p-t4)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <QA icon={Zap}          title="Hromadné odeslání"       sub="Pošlete více zákazníkům najednou"  bulk onClick={() => navigate('/partner/bulk')} />
            <QA icon={ShoppingCart} title="Nová dropship objednávka" sub="Pro jednoho koncového zákazníka"    onClick={() => navigate('/partner/new-order')} />
            <QA icon={UserPlus}     title="Přidat zákazníka"         sub="Manuálně nebo z CSV"                onClick={() => navigate('/partner/customers')} />
            <QA icon={Plug}         title="Import z e-shopu"         sub="Shopify, Woo, Shoptet"              onClick={() => navigate('/partner/integrations')} />
            <QA icon={Download}     title="Stáhnout faktury"         sub="PDF za duben 2026" />
          </div>
        </Card>
      </div>

      {/* Top products + Order status */}
      <div className="partner-grid-1-1">

        {/* Top products */}
        <Card>
          <CardHeader title="Nejprodávanější produkty" sub="Posledních 30 dní" />
          <div style={{ padding: '16px 18px' }}>
            <HBar items={TOP_PRODUCTS} />
          </div>
        </Card>

        {/* Orders by status — Donut */}
        <Card>
          <CardHeader title="Objednávky podle stavu" sub="Aktivní · 128 celkem" />
          <div style={{
            padding: '16px 18px',
            display: 'grid', gridTemplateColumns: 'auto 1fr',
            gap: 24, alignItems: 'center',
          }}>
            <SvgDonut data={DONUT_DATA} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DONUT_DATA.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--p-t2)', flex: 1 }}>{d.label}</span>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: 13, color: 'var(--p-t1)', fontWeight: 600 }}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader
          title="Výnosy v čase"
          sub="Dropship vs Wholesale srovnání"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Dropship', color: '#A855F7' },
                  { label: 'Wholesale', color: '#4F6EF7' },
                ].map(s => (
                  <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--p-t2)' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
              <div style={{
                display: 'flex', gap: 2, padding: 3,
                background: 'var(--p-surface-2)', borderRadius: 8,
                border: '1px solid var(--p-border-soft)',
              }}>
                {(['7D', '30D', '90D', '1R'] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 10px', height: 26,
                    borderRadius: 6, cursor: 'pointer', border: 'none',
                    background: period === p ? 'var(--p-card-hi)' : 'transparent',
                    color: period === p ? 'var(--p-t1)' : 'var(--p-t3)',
                    transition: `all var(--p-t-fast)`,
                  }}>{p}</button>
                ))}
              </div>
            </div>
          }
        />
        <div style={{ padding: '12px 18px 16px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDs" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradWs" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4F6EF7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4F6EF7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'var(--p-font-mono)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'var(--p-font-mono)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="wholesale" stroke="#4F6EF7" strokeWidth={2} fill="url(#gradWs)" />
              <Area type="monotone" dataKey="dropship"  stroke="#A855F7" strokeWidth={2} fill="url(#gradDs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
