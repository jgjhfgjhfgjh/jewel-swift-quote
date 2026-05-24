import { useMemo, useState, CSSProperties } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Download, DollarSign, Package, CreditCard,
  Zap,
} from 'lucide-react';
import { PRODUCTS, CUSTOMERS, fmtCZK } from './_data/mock';
import { Card, Tag, PButton, Avatar } from './_components/primitives';

type Period = '7D' | '30D' | '90D' | '1R';

const SPARK_DATA: Record<string, number[]> = {
  revenue: [180, 210, 260, 240, 310, 360, 412],
  orders:  [640, 680, 710, 725, 780, 810, 847],
  avg:     [420, 440, 460, 455, 470, 480, 487],
  margin:  [28, 29, 30, 29, 30, 31, 31.4],
};

const CHART_DATA = [
  { day: '15', single: 12, bulk: 4  },
  { day: '16', single: 18, bulk: 6  },
  { day: '17', single: 14, bulk: 8  },
  { day: '18', single: 22, bulk: 5  },
  { day: '19', single: 19, bulk: 12 },
  { day: '20', single: 28, bulk: 9  },
  { day: '21', single: 34, bulk: 18 },
  { day: '22', single: 29, bulk: 14 },
  { day: '23', single: 38, bulk: 22 },
  { day: '24', single: 42, bulk: 19 },
  { day: '25', single: 36, bulk: 28 },
  { day: '26', single: 48, bulk: 24 },
  { day: '27', single: 52, bulk: 38 },
  { day: '28', single: 58, bulk: 32 },
];

export default function PartnerAnalytics() {
  const [period, setPeriod] = useState<Period>('30D');

  const topCustomers = useMemo(
    () => [...CUSTOMERS].sort((a, b) => b.spend - a.spend).slice(0, 5),
    [],
  );
  const topProducts = useMemo(
    () => [...PRODUCTS].sort((a, b) => b.sales * b.retail - a.sales * a.retail).slice(0, 5),
    [],
  );
  const maxProductValue = Math.max(...topProducts.map(p => p.sales * p.retail));

  return (
    <div className="p-page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>Analytika</h1>
          <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>
            Výnosy, marže, top produkty · 28. dub 2026
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', gap: 2, padding: 3,
            background: 'var(--p-surface-2)', borderRadius: 7,
            border: '1px solid var(--p-border-soft)',
          }}>
            {(['7D', '30D', '90D', '1R'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  height: 26, padding: '0 12px',
                  background: period === p ? 'var(--p-card-hi)' : 'transparent',
                  border: 'none', borderRadius: 5,
                  color: period === p ? 'var(--p-t1)' : 'var(--p-t3)',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--p-font-mono)',
                }}
              >{p}</button>
            ))}
          </div>
          <PButton variant="ghost"><Download size={14}/> Export PDF</PButton>
        </div>
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12, marginBottom: 14,
      }}>
        <KpiCard label="Výnosy"          value="412 380 Kč" delta="+24%"  Icon={DollarSign}  spark={SPARK_DATA.revenue} color="#00D2A0"/>
        <KpiCard label="Objednávek"      value="847"        delta="+18%"  Icon={Package}     spark={SPARK_DATA.orders}  color="var(--p-primary-2)"/>
        <KpiCard label="Avg. objednávka" value="487 Kč"     delta="+5%"   Icon={CreditCard}  spark={SPARK_DATA.avg}     color="var(--p-bulk-2)"/>
        <KpiCard label="Avg. marže"      value="31.4%"      delta="+2.1pb" Icon={TrendingUp} spark={SPARK_DATA.margin}  color="#F5A623"/>
      </div>

      {/* Revenue chart */}
      <Card padding={0} style={{ marginBottom: 14 }}>
        <div style={cardHead}>
          <div>
            <h3 style={cardTitle}>Výnosy & Objednávky v čase</h3>
            <div style={{ fontSize: 12, color: 'var(--p-t3)' }}>Single vs Bulk · {period}</div>
          </div>
        </div>
        <div style={{ padding: 16, height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="single" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#4F6EF7" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="#4F6EF7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="bulk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#A855F7" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="#A855F7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="day" stroke="var(--p-t3)" tick={{ fontSize: 11 }}/>
              <YAxis stroke="var(--p-t3)" tick={{ fontSize: 11 }}/>
              <Tooltip
                contentStyle={{
                  background: 'var(--p-card)',
                  border: '1px solid var(--p-border)',
                  borderRadius: 8, fontSize: 12,
                }}
                labelStyle={{ color: 'var(--p-t1)' }}
              />
              <Area type="monotone" dataKey="single" stroke="#4F6EF7" strokeWidth={2} fill="url(#single)" name="Single"/>
              <Area type="monotone" dataKey="bulk"   stroke="#A855F7" strokeWidth={2} fill="url(#bulk)"   name="Bulk"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top products + top customers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 14 }}>
        <Card padding={0}>
          <div style={cardHead}>
            <div>
              <h3 style={cardTitle}>Top produkty</h3>
              <div style={{ fontSize: 12, color: 'var(--p-t3)' }}>Podle výnosů</div>
            </div>
          </div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topProducts.map(p => {
              const value = p.sales * p.retail;
              const pct = (value / maxProductValue) * 100;
              return (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.name}</span>
                    <span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(value)}</span>
                  </div>
                  <div style={{
                    height: 6, background: 'var(--p-surface-2)',
                    borderRadius: 99, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: p.img,
                      borderRadius: 99,
                      transition: 'width var(--p-t) var(--p-ease)',
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding={0}>
          <div style={cardHead}>
            <div>
              <h3 style={cardTitle}>Top zákazníci</h3>
              <div style={{ fontSize: 12, color: 'var(--p-t3)' }}>Lifetime value</div>
            </div>
          </div>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topCustomers.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 10, background: 'var(--p-surface-2)', borderRadius: 8,
              }}>
                <span className="p-mono" style={{ width: 22, fontWeight: 700, color: 'var(--p-t3)', fontSize: 12 }}>#{i + 1}</span>
                <Avatar name={c.name} color={c.color} size={28}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{c.orders} obj.</div>
                </div>
                <span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(c.spend)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sources + Bulk-vs-Single + Speed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 14 }}>
        <Card padding={0}>
          <div style={cardHead}><h3 style={cardTitle}>Zdroje objednávek</h3></div>
          <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <Donut data={[
              { value: 184, color: '#7AB55C' },
              { value: 142, color: '#7F54B3' },
              { value: 84,  color: '#E84A23' },
              { value: 68,  color: '#6B7280' },
              { value: 42,  color: '#A855F7' },
            ]} size={140} thickness={20}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 auto', minWidth: 120 }}>
              {[
                { l: 'Shopify',   v: 184, c: '#7AB55C' },
                { l: 'Woo',       v: 142, c: '#7F54B3' },
                { l: 'Shoptet',   v: 84,  c: '#E84A23' },
                { l: 'Manual',    v: 68,  c: '#6B7280' },
                { l: 'Bulk',      v: 42,  c: '#A855F7' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.c }}/>
                  <span style={{ flex: 1 }}>{l.l}</span>
                  <span className="p-mono" style={{ fontWeight: 600 }}>{l.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card padding={0}>
          <div style={cardHead}><h3 style={cardTitle}>Bulk vs Single</h3></div>
          <div style={{ padding: 22 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span>Single objednávky</span>
                <span className="p-mono" style={{ fontWeight: 700 }}>478</span>
              </div>
              <Bar value={85}/>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: 'var(--p-bulk-2)' }}>Bulk dispatch</span>
                <span className="p-mono" style={{ fontWeight: 700 }}>42 (369 příjemců)</span>
              </div>
              <Bar value={65} variant="bulk"/>
            </div>
            <Card style={{
              padding: 12, marginTop: 8,
              background: 'rgba(168,85,247,0.06)',
              borderColor: 'rgba(168,85,247,0.25)',
            }}>
              <div className="p-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--p-t3)' }}>
                ÚSPORA VS JEDNOTLIVĚ
              </div>
              <div className="p-mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-bulk-2)', marginTop: 4 }}>
                {fmtCZK(18420)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--p-t3)', marginTop: 4 }}>
                Ušetřeno na poplatcích a čase
              </div>
            </Card>
          </div>
        </Card>

        <Card padding={0}>
          <div style={cardHead}><h3 style={cardTitle}>Rychlost expedice</h3></div>
          <div style={{ padding: 22, textAlign: 'center' }}>
            <div className="p-mono" style={{ fontSize: 36, fontWeight: 700, color: '#00D2A0', lineHeight: 1 }}>
              1.4 <span style={{ fontSize: 16, color: 'var(--p-t3)' }}>dní</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--p-t3)', marginTop: 6 }}>
              Průměr objednávka → odeslání
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', alignItems: 'center' }}>
              <Tag variant="success"><TrendingDown size={11}/> −0.3 dní</Tag>
              <span style={{ fontSize: 12, color: 'var(--p-t3)' }}>vs. minulý měsíc</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bulk performance */}
      <Card padding={0}>
        <div style={cardHead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={16} style={{ color: 'var(--p-bulk-2)' }}/>
            <h3 style={cardTitle}>Bulk Dispatch — výkon</h3>
          </div>
        </div>
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <BulkStatCard label="PRŮM. PŘÍJEMCŮ / BULK" value="23.4"/>
          <BulkStatCard label="NEJPOPULÁRNĚJŠÍ BULK PRODUKT" custom>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>Skleněná lahev Fjord</div>
            <div style={{ fontSize: 11, color: 'var(--p-t3)', marginTop: 4 }}>8 bulk dispečinků · 184 ks</div>
          </BulkStatCard>
          <BulkStatCard label="FREKVENCE" value="1.4 / týden"/>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, delta, Icon, spark, color }: {
  label: string;
  value: string;
  delta: string;
  Icon: React.ElementType;
  spark: number[];
  color: string;
}) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="p-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--p-t3)' }}>{label}</span>
        <Icon size={14} style={{ color: 'var(--p-t3)' }}/>
      </div>
      <div className="p-mono" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 8 }}>
        <Tag variant="success" style={{ flexShrink: 0 }}><TrendingUp size={11}/> {delta}</Tag>
        <Sparkline values={spark} color={color}/>
      </div>
    </Card>
  );
}

function Sparkline({ values, color, w = 80, h = 28 }: { values: number[]; color: string; w?: number; h?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const gradId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Donut({ data, size, thickness }: { data: { value: number; color: string }[]; size: number; thickness: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size}>
      {data.map((d, i) => {
        const len = (d.value / total) * circ;
        const arc = (
          <circle
            key={i}
            cx={c} cy={c} r={r}
            fill="none" stroke={d.color} strokeWidth={thickness}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${c} ${c})`}
            strokeLinecap="butt"
          />
        );
        offset += len;
        return arc;
      })}
      <text x={c} y={c - 4} textAnchor="middle" style={{ fontFamily: 'var(--p-font-mono)', fontSize: 22, fontWeight: 700, fill: 'var(--p-t1)' }}>
        {total}
      </text>
      <text x={c} y={c + 14} textAnchor="middle" style={{ fontFamily: 'var(--p-font-mono)', fontSize: 10, fill: 'var(--p-t3)' }}>
        OBJEDNÁVEK
      </text>
    </svg>
  );
}

function Bar({ value, variant }: { value: number; variant?: 'bulk' }) {
  return (
    <div style={{
      height: 8, background: 'var(--p-surface-2)',
      borderRadius: 99, overflow: 'hidden',
    }}>
      <div style={{
        width: `${value}%`, height: '100%',
        background: variant === 'bulk'
          ? 'linear-gradient(90deg, var(--p-bulk), var(--p-bulk-2))'
          : 'var(--p-primary)',
        borderRadius: 99,
        transition: 'width var(--p-t) var(--p-ease)',
      }}/>
    </div>
  );
}

function BulkStatCard({ label, value, children, custom }: { label: string; value?: string; children?: React.ReactNode; custom?: boolean }) {
  return (
    <div style={{
      padding: 14, background: 'var(--p-surface-2)',
      border: '1px solid var(--p-border-soft)',
      borderRadius: 10,
    }}>
      <div className="p-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--p-t3)' }}>
        {label}
      </div>
      {custom
        ? children
        : <div className="p-mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{value}</div>}
    </div>
  );
}

const cardHead: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px', borderBottom: '1px solid var(--p-hairline)',
};
const cardTitle: CSSProperties = { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--p-t1)' };
