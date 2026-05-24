import { useMemo, useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Calendar, ChevronDown, Users, Zap, Package, Download, Plus,
  ChevronLeft, ChevronRight, Send, X, Check, Eye, Truck, MoreHorizontal,
  Info, ArrowUpDown,
} from 'lucide-react';
import {
  ORDERS, CUSTOMERS, SOURCES, Order, Status, OrderSource,
  fmtCZK, fmtNum,
} from './_data/mock';
import {
  StatusPill, Tag, PButton, Checkbox, Avatar, SourceBadge,
} from './_components/primitives';
import { pToast } from './_components/toast';

// ─────────────────────────────────────────────────────────────────────────
// Helpers (mock margin assumption — wholesale = 62% of total, matching v2 spec)
// TODO: replace with real wholesale numbers per line item once API is wired.
// ─────────────────────────────────────────────────────────────────────────
const WHOLESALE_RATIO = 0.62;
const wholesaleOf = (o: Order) => Math.round(o.total * WHOLESALE_RATIO);
const marginOf = (o: Order) => o.total - wholesaleOf(o);

type TypeFilter = 'all' | 'single' | 'bulk';
type StatusTab = 'all' | 'pending' | 'processing' | 'delivered' | 'cancelled';
type SourceFilter = 'all' | OrderSource;

const tabDefs: Array<{ id: StatusTab; label: string }> = [
  { id: 'all',        label: 'Vše' },
  { id: 'pending',    label: 'Čekající' },
  { id: 'processing', label: 'Aktivní' },
  { id: 'delivered',  label: 'Doručené' },
  { id: 'cancelled',  label: 'Zrušené' },
];

const countOnTab = (tab: StatusTab): number => {
  if (tab === 'all') return ORDERS.length;
  if (tab === 'processing') return ORDERS.filter(o => o.status === 'processing' || o.status === 'shipped').length;
  return ORDERS.filter(o => o.status === (tab as Status)).length;
};

const tabMatch = (o: Order, tab: StatusTab): boolean => {
  if (tab === 'all') return true;
  if (tab === 'processing') return o.status === 'processing' || o.status === 'shipped';
  return o.status === tab;
};

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────
export default function PartnerOrders() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<StatusTab>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [source, setSource] = useState<SourceFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return ORDERS.filter(o => {
      if (!tabMatch(o, tab)) return false;
      if (type !== 'all' && o.type !== type) return false;
      if (source !== 'all' && o.source !== source) return false;
      if (search) {
        const q = search.toLowerCase();
        const hit =
          o.id.toLowerCase().includes(q) ||
          (o.type === 'single' && CUSTOMERS[o.customer]?.name.toLowerCase().includes(q)) ||
          o.products.some(p => p.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [tab, type, source, search]);

  const allSelectedOnPage = filtered.length > 0 && filtered.every(o => selected.has(o.id));
  const someSelectedOnPage = !allSelectedOnPage && filtered.some(o => selected.has(o.id));

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        filtered.forEach(o => next.delete(o.id));
      } else {
        filtered.forEach(o => next.add(o.id));
      }
      return next;
    });
  };
  const toggleRow = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openOrder = (o: Order) => {
    if (o.type === 'bulk') navigate(`/partner/bulk/${o.id}`);
    else navigate(`/partner/orders/${o.id}`);
  };

  return (
    <div className="p-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={pageHeader}>
        <div>
          <h1 style={pageTitle}>Objednávky</h1>
          <div style={pageSub}>
            {fmtNum(filtered.length)} z {fmtNum(ORDERS.length)} objednávek · 28 nových dnes
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <PButton variant="ghost" onClick={() => pToast.info('Export CSV (TODO)')}><Download size={14}/> Export CSV</PButton>
          <PButton variant="bulk" onClick={() => navigate('/partner/bulk')}><Zap size={14}/> Bulk Dispatch</PButton>
          <PButton variant="primary" onClick={() => navigate('/partner/new-order')}><Plus size={14}/> Nová objednávka</PButton>
        </div>
      </div>

      {/* ── Status tabs ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid var(--p-border-soft)', overflowX: 'auto' }}>
        {tabDefs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--p-primary)' : 'transparent'}`,
              color: tab === t.id ? 'var(--p-t1)' : 'var(--p-t3)',
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'color var(--p-t-fast)',
              whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            {t.label}
            <span className="p-mono" style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 4,
              background: tab === t.id ? 'rgba(79,110,247,0.15)' : 'var(--p-surface-2)',
              color: tab === t.id ? 'var(--p-primary-2)' : 'var(--p-t3)',
            }}>{countOnTab(t.id)}</span>
          </button>
        ))}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div style={filterBar}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--p-t3)', pointerEvents: 'none' }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hledat ID, zákazníka, produkt…"
            style={{
              height: 34, width: '100%', paddingLeft: 32, paddingRight: 10,
              background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
              borderRadius: 8, color: 'var(--p-t1)', fontSize: 13, outline: 'none',
              fontFamily: 'var(--p-font-sans)',
            }}
          />
        </div>
        <FilterBtn><Calendar size={13}/> Posledních 30 dní <ChevronDown size={11}/></FilterBtn>
        <Vdiv/>
        <FilterBtn active={type === 'all'} onClick={() => setType('all')}>Všechny typy</FilterBtn>
        <FilterBtn active={type === 'single'} onClick={() => setType('single')}><Users size={13}/> Jednotlivé</FilterBtn>
        <FilterBtn active={type === 'bulk'} onClick={() => setType('bulk')} accent="bulk"><Zap size={13}/> Bulk</FilterBtn>
        <Vdiv/>
        <select
          value={source}
          onChange={e => setSource(e.target.value as SourceFilter)}
          style={{
            height: 32, padding: '0 26px 0 10px',
            background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
            color: 'var(--p-t1)', borderRadius: 8, fontSize: 12, cursor: 'pointer',
            fontFamily: 'var(--p-font-sans)', appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2.5\'><polyline points=\'6,9 12,15 18,9\'/></svg>")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
          }}
        >
          <option value="all">Všechny zdroje</option>
          {(Object.keys(SOURCES) as OrderSource[]).map(k => <option key={k} value={k}>{SOURCES[k].label}</option>)}
        </select>
        <div style={{ flex: 1 }}/>
        <FilterBtn><ArrowUpDown size={13}/> Nejnovější <ChevronDown size={11}/></FilterBtn>
      </div>

      {/* ── Smart sticky-foot — rendered ABOVE table when active ── */}
      {/* (We render BELOW the card too via sticky bottom; per spec it sits below tabs/table) */}

      {/* ── Orders table ───────────────────────────────────────── */}
      <div style={tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableEl as CSSProperties}>
            <thead>
              <tr>
                <th style={{ ...th, width: 40 }}>
                  <Checkbox
                    checked={allSelectedOnPage}
                    indeterminate={someSelectedOnPage}
                    onChange={toggleAll}
                    ariaLabel="Vybrat vše"
                  />
                </th>
                <th style={th}>ID</th>
                <th style={th}>Typ</th>
                <th style={th}>Zákazník(ci)</th>
                <th style={th}>Produkty</th>
                <th style={th}>Status</th>
                <th style={th}>Zdroj</th>
                <th style={th}>Vytvořeno</th>
                <th style={{ ...th, textAlign: 'right' }}>Celkem</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const isSel = selected.has(o.id);
                const c = o.type === 'single' ? CUSTOMERS[o.customer] : null;
                return (
                  <tr
                    key={o.id}
                    className="p-row"
                    style={{
                      background: isSel
                        ? (o.type === 'bulk' ? 'rgba(168,85,247,0.06)' : 'rgba(79,110,247,0.05)')
                        : 'transparent',
                      borderTop: '1px solid var(--p-hairline)',
                    }}
                  >
                    <td style={td}>
                      <Checkbox
                        checked={isSel}
                        onChange={() => toggleRow(o.id)}
                        variant={o.type === 'bulk' ? 'bulk' : 'primary'}
                        ariaLabel={`Vybrat ${o.id}`}
                      />
                    </td>
                    <td style={td}>
                      <button
                        onClick={() => openOrder(o)}
                        className="p-mono"
                        style={{
                          background: 'transparent', border: 'none', padding: 0,
                          color: 'var(--p-t1)', fontWeight: 500, fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >{o.id}</button>
                    </td>
                    <td style={td}>
                      {o.type === 'bulk'
                        ? <Tag variant="bulk"><Zap size={11}/> BULK</Tag>
                        : <Tag><Users size={11}/> Single</Tag>}
                    </td>
                    <td style={td}>
                      {o.type === 'bulk' && o.recipients ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <AvatarStack indexes={o.recipients.slice(0, 4)}/>
                          <span className="p-mono" style={{ fontSize: 11, color: 'var(--p-bulk-2)', fontWeight: 600 }}>
                            {o.recipientCount} příjemců
                          </span>
                        </div>
                      ) : c ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={c.name} color={c.color} size={28}/>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 13 }}>{c.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--p-t3)' }}>{c.city}</span>
                          </div>
                        </div>
                      ) : null}
                    </td>
                    <td style={{ ...td, color: 'var(--p-t2)', fontSize: 12 }}>
                      <span title={o.products.join(', ')}>
                        {o.items} ks · {' '}
                        <span style={{ color: 'var(--p-t3)' }}>
                          {o.products[0]}{o.products.length > 1 ? `, +${o.products.length - 1}` : ''}
                        </span>
                      </span>
                    </td>
                    <td style={td}><StatusPill status={o.status}/></td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SourceBadge source={o.source}/>
                        <span style={{ fontSize: 12, color: 'var(--p-t2)' }}>{SOURCES[o.source].label}</span>
                      </div>
                    </td>
                    <td style={{ ...td, fontSize: 12, color: 'var(--p-t2)' }}>{o.created}</td>
                    <td style={{ ...td, textAlign: 'right' }} className="p-mono">
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{fmtCZK(o.total)}</span>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <IconBtn onClick={() => openOrder(o)} aria-label="Zobrazit"><Eye size={13}/></IconBtn>
                        <IconBtn aria-label="Sledovat"><Truck size={13}/></IconBtn>
                        <IconBtn aria-label="Více"><MoreHorizontal size={13}/></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 48, textAlign: 'center', color: 'var(--p-t3)', fontSize: 13 }}>
                    Žádné objednávky neodpovídají filtrům.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer (static visual) */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--p-border-soft)',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, color: 'var(--p-t2)' }}>
            Zobrazeno 1 — {filtered.length} z {ORDERS.length}
          </span>
          <div style={{ flex: 1 }}/>
          <FilterBtn disabled><ChevronLeft size={12}/></FilterBtn>
          <FilterBtn active>1</FilterBtn>
          <FilterBtn>2</FilterBtn>
          <FilterBtn>3</FilterBtn>
          <span style={{ color: 'var(--p-t3)' }}>…</span>
          <FilterBtn>11</FilterBtn>
          <FilterBtn><ChevronRight size={12}/></FilterBtn>
        </div>
      </div>

      {/* ── Sticky-foot selection bar ──────────────────────────── */}
      <StickyFoot
        filtered={filtered}
        selectedIds={selected}
        clearSelection={() => setSelected(new Set())}
        isPendingTab={tab === 'pending'}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sticky-foot — 3 states (none / some / all) per v2 spec
// ─────────────────────────────────────────────────────────────────────────
function StickyFoot({
  filtered, selectedIds, clearSelection, isPendingTab,
}: {
  filtered: Order[];
  selectedIds: Set<string>;
  clearSelection: () => void;
  isPendingTab: boolean;
}) {
  const selectedRows = filtered.filter(o => selectedIds.has(o.id));
  const showBar = selectedRows.length > 0 || isPendingTab;
  if (!showBar) return null;

  // Sums computed over scope: selection if any, else all filtered (used by "Odeslat všechny")
  const scope = selectedRows.length > 0 ? selectedRows : filtered;
  const sumTotal = scope.reduce((s, o) => s + o.total, 0);
  const sumWholesale = scope.reduce((s, o) => s + wholesaleOf(o), 0);
  const sumMargin = sumTotal - sumWholesale;
  const marginPct = sumTotal > 0 ? Math.round((sumMargin / sumTotal) * 100) : 0;
  const sumItems = scope.reduce((s, o) => s + o.items, 0);

  const allFilteredSelected = filtered.length > 0 && selectedRows.length === filtered.length;
  const allPending = selectedRows.length > 0 && selectedRows.every(o => o.status === 'pending');

  return (
    <div className="p-sticky-foot">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Stat label={selectedRows.length > 0 ? 'VYBRÁNO' : 'OBJEDNÁVEK'}>
          <span style={selectedRows.length > 0 ? { color: 'var(--p-bulk-2)' } : undefined}>
            {selectedRows.length > 0 ? `${selectedRows.length} z ${filtered.length}` : filtered.length}
          </span>
        </Stat>
        <SVdiv/>
        <Stat label="PRODUKTŮ">{sumItems} ks</Stat>
        <SVdiv/>
        <Stat label="VELKOOB.">{fmtCZK(sumWholesale)}</Stat>
        <SVdiv/>
        <Stat label="MARŽE" accent="#00D2A0">{fmtCZK(sumMargin)} ({marginPct}%)</Stat>
        <SVdiv/>
        <Stat label="CELKEM">{fmtCZK(sumTotal)}</Stat>

        <div style={{ flex: 1, minWidth: 16 }}/>

        {selectedRows.length === 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--p-t3)' }}>
            <Info size={13}/> Vyberte objednávky zaškrtnutím, nebo odešlete vše
          </span>
        ) : (
          <PButton variant="ghost" size="sm" onClick={clearSelection}>Zrušit výběr</PButton>
        )}

        {/* CTA cluster — depends on selection state */}
        {selectedRows.length === 0 && isPendingTab && (
          <>
            <PButton variant="subtle" size="sm"><Zap size={12}/> Nastavit triggery</PButton>
            <PButton variant="bulk" size="lg" onClick={() => { pToast.bulk(`Odesláno ${filtered.length} objednávek`); clearSelection(); }}>
              <Send size={14}/> Odeslat všechny ({filtered.length})
            </PButton>
          </>
        )}

        {selectedRows.length > 0 && allFilteredSelected && (
          <>
            <PButton variant="subtle" size="sm"><Package size={12}/> Tisk štítků</PButton>
            <PButton variant="subtle" size="sm"><Download size={12}/> Export CSV</PButton>
            <PButton variant="bulk" size="lg" onClick={() => { pToast.bulk(`Odesláno ${selectedRows.length} objednávek`); clearSelection(); }}>
              <Send size={14}/> Odeslat všechny ({selectedRows.length})
            </PButton>
          </>
        )}

        {selectedRows.length > 0 && !allFilteredSelected && (
          <>
            <PButton variant="subtle" size="sm"><Check size={12}/> Označit jako zpracováváno</PButton>
            <PButton variant="subtle" size="sm"><Zap size={12}/> Trigger ({selectedRows.length})</PButton>
            <PButton variant="danger" size="sm"><X size={12}/> Zrušit ({selectedRows.length})</PButton>
            {allPending && (
              <PButton variant="bulk" size="lg" onClick={() => { pToast.bulk(`Odesláno ${selectedRows.length} objednávek`); clearSelection(); }}>
                <Send size={14}/> Odeslat vybrané ({selectedRows.length})
              </PButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Local helpers
// ─────────────────────────────────────────────────────────────────────────
function Stat({ label, accent, children }: { label: string; accent?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.1 }}>
      <span className="p-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: accent ?? 'var(--p-t3)' }}>{label}</span>
      <span className="p-mono" style={{ fontSize: 13, fontWeight: 600, color: accent ?? 'var(--p-t1)' }}>{children}</span>
    </div>
  );
}
const SVdiv = () => <div style={{ width: 1, height: 28, background: 'var(--p-border-soft)' }}/>;

function FilterBtn({ children, active, accent, onClick, disabled }: { children: React.ReactNode; active?: boolean; accent?: 'bulk' | 'primary'; onClick?: () => void; disabled?: boolean }) {
  const palette = accent === 'bulk'
    ? { bg: 'rgba(168,85,247,0.12)', color: 'var(--p-bulk-2)', border: 'rgba(168,85,247,0.3)' }
    : { bg: 'rgba(79,110,247,0.12)', color: 'var(--p-primary-2)', border: 'rgba(79,110,247,0.3)' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 32, padding: '0 12px',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: active ? palette.bg : 'var(--p-surface-2)',
        border: `1px solid ${active ? palette.border : 'var(--p-border-soft)'}`,
        color: active ? palette.color : 'var(--p-t2)',
        borderRadius: 8, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap', fontFamily: 'var(--p-font-sans)',
      }}
    >{children}</button>
  );
}
const Vdiv = () => <div style={{ width: 1, height: 24, background: 'var(--p-border-soft)' }}/>;

function IconBtn({ children, onClick, ...rest }: { children: React.ReactNode; onClick?: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button onClick={onClick} {...rest} style={{
      width: 28, height: 28, borderRadius: 6,
      background: 'transparent', border: 'none', color: 'var(--p-t3)',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

function AvatarStack({ indexes }: { indexes: number[] }) {
  return (
    <div style={{ display: 'flex' }}>
      {indexes.map((idx, i) => {
        const c = CUSTOMERS[idx];
        if (!c) return null;
        return (
          <span
            key={i}
            style={{
              width: 24, height: 24, borderRadius: 24,
              background: c.color, color: 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
              border: '2px solid var(--p-card)',
              marginLeft: i === 0 ? 0 : -8,
              zIndex: indexes.length - i,
            }}
          >{c.initials}</span>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Inline styles reused across the page
// ─────────────────────────────────────────────────────────────────────────
const pageHeader: CSSProperties = {
  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  gap: 16, marginBottom: 16, flexWrap: 'wrap',
};
const pageTitle: CSSProperties = { fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--p-t1)' };
const pageSub: CSSProperties = { fontSize: 13, color: 'var(--p-t3)', marginTop: 4 };

const filterBar: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: 12,
  background: 'var(--p-card)', border: '1px solid var(--p-border-soft)',
  borderRadius: 'var(--p-radius)', marginBottom: 12, flexWrap: 'wrap',
};

const tableCard: CSSProperties = {
  background: 'var(--p-card)', border: '1px solid var(--p-border-soft)',
  borderRadius: 'var(--p-radius)', overflow: 'hidden',
};
const tableEl = { width: '100%', borderCollapse: 'collapse', fontSize: 13 } as const;
const th: CSSProperties = {
  textAlign: 'left', padding: '12px 14px',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--p-t3)', background: 'var(--p-surface-2)', borderBottom: '1px solid var(--p-border-soft)',
  whiteSpace: 'nowrap',
};
const td: CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
