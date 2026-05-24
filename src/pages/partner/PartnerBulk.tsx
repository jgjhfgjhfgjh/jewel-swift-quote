import { useMemo, useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Minus, X, Send, Copy, Trash2, Upload, Download, Edit3,
  Check, Info, Layers, Split, Tag as TagIcon, Package, ChevronRight,
} from 'lucide-react';
import {
  PRODUCTS, CUSTOMERS, CARRIERS, SEGMENTS,
  Product, Customer, Carrier, fmtCZK, margin, marginColor,
} from './_data/mock';
import {
  Tag, PButton, Checkbox, Avatar, MarginBox, Card,
} from './_components/primitives';
import { pToast } from './_components/toast';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────
type Mode = 'A' | 'B';
type Stage = 'compose' | 'progress' | 'done';
interface CartLine extends Product { qty: number }
interface FeedEntry { customer: Customer; orderId: string; error: string | null }

interface ModeBRow {
  id: number;
  customer: Customer;
  products: CartLine[];
  shipping: string; // carrier id
  note: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────
export default function PartnerBulk() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('A');
  const [stage, setStage] = useState<Stage>('compose');
  const [progress, setProgress] = useState(0);
  const [feed, setFeed] = useState<FeedEntry[]>([]);

  // Mode A state
  const [cart, setCart] = useState<CartLine[]>([{ ...PRODUCTS[2], qty: 1 }]);
  const [recipients, setRecipients] = useState<Customer[]>(CUSTOMERS.slice(0, 8));
  const [carrierId, setCarrierId] = useState<string>('zasilkovna');
  const carrier = CARRIERS.find(c => c.id === carrierId) ?? CARRIERS[0];

  // Mode B state
  const [rows, setRows] = useState<ModeBRow[]>(() => seedModeBRows());

  const launch = () => {
    setStage('progress');
    setProgress(0);
    setFeed([]);
    const target = mode === 'A' ? recipients : rows.map(r => r.customer);
    let i = 0;
    const tick = () => {
      if (i >= target.length) {
        window.setTimeout(() => setStage('done'), 500);
        return;
      }
      const r = target[i];
      const isError = i === 4 && target.length > 5;
      setFeed(f => [...f, {
        customer: r,
        orderId: `DS-2026-${900 + i}`,
        error: isError ? 'Neplatná adresa' : null,
      }]);
      setProgress(((i + 1) / target.length) * 100);
      i++;
      window.setTimeout(tick, 220);
    };
    window.setTimeout(tick, 300);
  };

  if (stage === 'progress') {
    return <BulkProgress
      progress={progress} feed={feed}
      total={mode === 'A' ? recipients.length : rows.length}
      onCancel={() => setStage('compose')}
    />;
  }
  if (stage === 'done') {
    return <BulkDone feed={feed}
      total={mode === 'A' ? recipients.length : rows.length}
      onClose={() => { pToast.bulk('Bulk dispatch dokončen'); setStage('compose'); navigate('/partner/orders'); }}
    />;
  }

  return (
    <div className="p-page">
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Tag variant="bulk">FLAGSHIP</Tag>
          <span className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>SCREEN 3</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>Bulk Dispatch</h1>
        <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>
          Pošlete produkty mnoha koncovým zákazníkům najednou — jeden flow, jedna účtenka.
        </div>
      </div>

      {/* Mode toggle */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <ModeSwitch mode={mode} setMode={setMode}/>
          <div style={{ fontSize: 13, color: 'var(--p-t2)' }}>
            {mode === 'A'
              ? 'Stejný produkt → mnoho zákazníků (newsletter, dárek, promo)'
              : 'Různé produkty → různí zákazníci (batch z e-shopu)'}
          </div>
        </div>
      </Card>

      {mode === 'A' ? (
        <ModeA
          cart={cart} setCart={setCart}
          recipients={recipients} setRecipients={setRecipients}
          carrier={carrier} setCarrierId={setCarrierId}
          launch={launch}
        />
      ) : (
        <ModeB rows={rows} setRows={setRows} launch={launch}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Mode switch
// ─────────────────────────────────────────────────────────────────────────
function ModeSwitch({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex',
      background: 'var(--p-surface-2)',
      border: '1px solid var(--p-border-soft)',
      borderRadius: 10, padding: 4, gap: 2,
    }}>
      <div style={{
        position: 'absolute',
        top: 4, bottom: 4,
        left: mode === 'A' ? 4 : '50%',
        width: 'calc(50% - 4px)',
        background: 'linear-gradient(135deg, var(--p-bulk), var(--p-primary))',
        borderRadius: 8,
        transition: 'left 0.22s var(--p-ease)',
        boxShadow: 'var(--p-glow-bulk)',
      }}/>
      <button onClick={() => setMode('A')} style={modeBtn(mode === 'A')}>
        <Layers size={14}/> Mode A · Stejné produkty
      </button>
      <button onClick={() => setMode('B')} style={modeBtn(mode === 'B')}>
        <Split size={14}/> Mode B · Různé produkty
      </button>
    </div>
  );
}
const modeBtn = (active: boolean): CSSProperties => ({
  position: 'relative', zIndex: 1,
  padding: '8px 14px',
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'transparent', border: 'none',
  color: active ? 'white' : 'var(--p-t2)',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'var(--p-font-sans)',
  whiteSpace: 'nowrap',
});

// ─────────────────────────────────────────────────────────────────────────
// Mode A
// ─────────────────────────────────────────────────────────────────────────
function ModeA({
  cart, setCart, recipients, setRecipients, carrier, setCarrierId, launch,
}: {
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  recipients: Customer[];
  setRecipients: React.Dispatch<React.SetStateAction<Customer[]>>;
  carrier: Carrier;
  setCarrierId: (id: string) => void;
  launch: () => void;
}) {
  const [search, setSearch] = useState('');
  const [addSrc, setAddSrc] = useState<'search' | 'csv' | 'group'>('search');

  const productList = useMemo(
    () => PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const wholesaleTotal = cart.reduce((s, c) => s + c.wholesale * c.qty, 0) * recipients.length;
  const retailTotal = cart.reduce((s, c) => s + c.retail * c.qty, 0) * recipients.length;
  const shipTotal = carrier.price * recipients.length;
  const totalCost = wholesaleTotal + shipTotal;
  const marginTotal = retailTotal - totalCost;
  const marginPct = retailTotal > 0 ? Math.round((marginTotal / retailTotal) * 100) : 0;

  const addProduct = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === p.id);
      if (existing) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const adjustQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  };
  const removeProduct = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const removeRecipient = (id: string) => setRecipients(prev => prev.filter(r => r.id !== id));
  const addRecipient = (c: Customer) => {
    setRecipients(prev => prev.some(r => r.id === c.id) ? prev : [...prev, c]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)', gap: 14 }}>
      {/* LEFT: Products */}
      <Card padding={0}>
        <div style={cardHead}>
          <div>
            <h3 style={cardTitle}>Vyberte produkty</h3>
            <div style={{ fontSize: 12, color: 'var(--p-t3)' }}>{cart.length} v košíku</div>
          </div>
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={13} style={searchIconStyle}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Hledat produkty…"
              style={inlineInput}
            />
          </div>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {productList.slice(0, 6).map(p => {
            const m = margin(p.wholesale, p.retail);
            const inCart = cart.find(c => c.id === p.id);
            return (
              <div key={p.id} style={{
                padding: 12, background: 'var(--p-surface-2)',
                border: `1px solid ${inCart ? 'rgba(168,85,247,0.4)' : 'var(--p-border-soft)'}`,
                borderRadius: 10,
              }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <ProductSwatch color={p.img} size={44}/>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>Sklad: {p.stock} ks</div>
                  </div>
                </div>
                <div style={kvRow}><span style={{ color: 'var(--p-t3)' }}>Velkoob.</span><span className="p-mono">{fmtCZK(p.wholesale)}</span></div>
                <div style={{ ...kvRow, marginBottom: 8 }}>
                  <span style={{ color: 'var(--p-t3)' }}>Koncová</span>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                    <span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(p.retail)}</span>
                    <span className="p-mono" style={{ fontSize: 10, fontWeight: 700, color: marginColor(m) }}>{m}%</span>
                  </span>
                </div>
                <PButton
                  variant={inCart ? 'bulk' : 'subtle'}
                  size="sm"
                  style={{ width: '100%' }}
                  onClick={() => addProduct(p)}
                >
                  {inCart ? <><Check size={11}/> V košíku · {inCart.qty}</> : <><Plus size={11}/> Přidat</>}
                </PButton>
              </div>
            );
          })}
        </div>

        {/* Cart */}
        <div style={{ padding: 16, borderTop: '1px solid var(--p-border-soft)', background: 'var(--p-surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={lbl}>Dispatch Cart</span>
            <span className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>{cart.length} produktů</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cart.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: 8,
                background: 'var(--p-card)', borderRadius: 8, border: '1px solid var(--p-border-soft)',
              }}>
                <ProductSwatch color={c.img} size={32}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{c.qty}× × {recipients.length} příjemců = {c.qty * recipients.length} ks</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconBtn onClick={() => adjustQty(c.id, -1)}><Minus size={11}/></IconBtn>
                  <span className="p-mono" style={{ width: 18, textAlign: 'center', fontSize: 12 }}>{c.qty}</span>
                  <IconBtn onClick={() => adjustQty(c.id, +1)}><Plus size={11}/></IconBtn>
                  <IconBtn onClick={() => removeProduct(c.id)}><X size={11}/></IconBtn>
                </div>
              </div>
            ))}
            {cart.length === 0 && <span style={{ fontSize: 12, color: 'var(--p-t3)' }}>Košík je prázdný.</span>}
          </div>
          <MarginBox style={{ marginTop: 12 }} compact>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--p-t2)' }}>Velkoob. celkem (1 příjemce)</span>
              <span className="p-mono" style={{ fontSize: 13, fontWeight: 700 }}>
                {fmtCZK(cart.reduce((s, c) => s + c.wholesale * c.qty, 0))}
              </span>
            </div>
          </MarginBox>
        </div>
      </Card>

      {/* RIGHT: Recipients + Shipping + Launch */}
      <Card padding={0}>
        <div style={cardHead}>
          <div>
            <h3 style={cardTitle}>Odesíláte <span style={{ color: 'var(--p-bulk-2)' }} className="p-mono">{recipients.length}</span> zákazníkům</h3>
            <div style={{ fontSize: 12, color: 'var(--p-t3)' }}>Přidat z databáze, segmentu, nebo CSV</div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {/* Add source tabs */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: 12, padding: 4,
            background: 'var(--p-surface-2)', borderRadius: 8, border: '1px solid var(--p-border-soft)',
          }}>
            {(['search', 'csv', 'group'] as const).map(s => {
              const labels = { search: 'Hledat', csv: 'CSV', group: 'Segment' };
              const Ic = s === 'search' ? Search : s === 'csv' ? Upload : TagIcon;
              return (
                <button
                  key={s}
                  onClick={() => setAddSrc(s)}
                  style={{
                    flex: 1, height: 32,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: addSrc === s ? 'var(--p-card-hi)' : 'transparent',
                    border: `1px solid ${addSrc === s ? 'var(--p-border)' : 'transparent'}`,
                    color: addSrc === s ? 'var(--p-t1)' : 'var(--p-t2)',
                    borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--p-font-sans)',
                  }}
                ><Ic size={12}/> {labels[s]}</button>
              );
            })}
          </div>

          {addSrc === 'search' && <RecipientSearch onPick={addRecipient} excludeIds={recipients.map(r => r.id)}/>}

          {addSrc === 'csv' && (
            <div style={{
              padding: 24, textAlign: 'center',
              background: 'var(--p-surface-2)', border: '1px dashed var(--p-border)',
              borderRadius: 10, marginBottom: 8,
            }}>
              <Upload size={20} style={{ color: 'var(--p-t3)', marginBottom: 8 }}/>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Přetáhněte CSV soubor</div>
              <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>nebo <span style={{ color: 'var(--p-bulk-2)' }}>klikněte pro výběr</span></div>
              <div style={{ fontSize: 11, color: 'var(--p-t3)', marginTop: 8 }}>Sloupce: jméno, email, ulice, město, PSČ</div>
              <PButton variant="ghost" size="sm" style={{ marginTop: 12 }}><Download size={12}/> Stáhnout šablonu</PButton>
            </div>
          )}

          {addSrc === 'group' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              {SEGMENTS.map(s => (
                <button key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', background: 'var(--p-surface-2)',
                  border: '1px solid var(--p-border-soft)', borderRadius: 8,
                  textAlign: 'left', cursor: 'pointer', color: 'var(--p-t1)',
                  fontFamily: 'var(--p-font-sans)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }}/>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                  <span className="p-mono" style={{ fontSize: 11, color: 'var(--p-t2)' }}>{s.count} zákazníků</span>
                  <Plus size={12} style={{ color: 'var(--p-t3)' }}/>
                </button>
              ))}
            </div>
          )}

          {/* Recipients list */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 8 }}>
            <span style={lbl}>Vybraní zákazníci</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <PButton variant="ghost" size="sm" onClick={() => setRecipients(CUSTOMERS)}>Vybrat vše</PButton>
              <PButton variant="ghost" size="sm" onClick={() => setRecipients([])}>Vymazat</PButton>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
            {recipients.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', background: 'var(--p-surface-2)',
                borderRadius: 7, border: '1px solid var(--p-border-soft)',
              }}>
                <Avatar name={r.name} color={r.color} size={28}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--p-t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address}</div>
                </div>
                <IconBtn onClick={() => removeRecipient(r.id)}><X size={11}/></IconBtn>
              </div>
            ))}
            {recipients.length === 0 && <span style={{ fontSize: 12, color: 'var(--p-t3)' }}>Žádní příjemci.</span>}
          </div>

          {/* Shipping */}
          <div style={{ margin: '14px 0', borderTop: '1px solid var(--p-hairline)' }}/>
          <span style={lbl}>Doprava</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, marginTop: 8 }}>
            {CARRIERS.map(c => {
              const active = carrier.id === c.id;
              return (
                <label key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: active ? 'rgba(168,85,247,0.06)' : 'var(--p-surface-2)',
                  border: `1px solid ${active ? 'rgba(168,85,247,0.4)' : 'var(--p-border-soft)'}`,
                  borderRadius: 8, cursor: 'pointer',
                  transition: 'all var(--p-t-fast)',
                }}>
                  <input
                    type="radio"
                    checked={active}
                    onChange={() => setCarrierId(c.id)}
                    style={{ accentColor: 'var(--p-bulk)' }}
                  />
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: c.color, color: 'white',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700,
                  }}>{c.name[0]}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--p-t2)' }}>{c.days}</span>
                  <span className="p-mono" style={{ fontWeight: 700, fontSize: 12 }}>{fmtCZK(c.price)}</span>
                </label>
              );
            })}
          </div>

          {/* Cost summary */}
          <div style={{
            padding: 14, borderRadius: 10,
            background: 'linear-gradient(180deg, rgba(168,85,247,0.08), rgba(168,85,247,0.02))',
            border: '1px solid rgba(168,85,247,0.25)',
          }}>
            <Row label="Produkty (velkoobchod)" value={fmtCZK(wholesaleTotal)}/>
            <Row label={`Doprava (${recipients.length} × ${fmtCZK(carrier.price)})`} value={fmtCZK(shipTotal)}/>
            <div style={{ borderTop: '1px solid var(--p-hairline)', margin: '8px 0' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 600 }}>Celkové náklady</span>
              <span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(totalCost)}</span>
            </div>
            <Row label="Odhadovaný výnos" value={fmtCZK(retailTotal)}/>
            <MarginBox style={{ marginTop: 10 }} compact>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#00D2A0' }}>Celková marže</span>
                <span className="p-mono" style={{ fontWeight: 700, fontSize: 14, color: '#00D2A0' }}>
                  {fmtCZK(marginTotal)} ({marginPct}%)
                </span>
              </div>
            </MarginBox>
          </div>

          <PButton
            variant="bulk" size="lg"
            style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
            onClick={launch}
            disabled={cart.length === 0 || recipients.length === 0}
          >
            <Send size={16}/> Spustit Bulk Dispatch
          </PButton>
          <div style={{ fontSize: 11, color: 'var(--p-t3)', textAlign: 'center', marginTop: 8 }}>
            Vytvoří {recipients.length} jednotlivých zásilek
          </div>
        </div>
      </Card>
    </div>
  );
}

function RecipientSearch({ onPick, excludeIds }: { onPick: (c: Customer) => void; excludeIds: string[] }) {
  const [q, setQ] = useState('');
  const visible = q
    ? CUSTOMERS.filter(c => !excludeIds.includes(c.id) && c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];
  return (
    <>
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <Search size={13} style={searchIconStyle}/>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Hledat zákazníky a přidat…"
          style={inlineInput}
        />
      </div>
      {visible.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {visible.map(c => (
            <button key={c.id} onClick={() => { onPick(c); setQ(''); }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', background: 'var(--p-surface-2)',
              border: '1px solid var(--p-border-soft)', borderRadius: 7,
              cursor: 'pointer', color: 'var(--p-t1)', textAlign: 'left',
              fontFamily: 'var(--p-font-sans)',
            }}>
              <Avatar name={c.name} color={c.color} size={26}/>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: 'var(--p-t3)' }}>{c.city}</span>
              <Plus size={12} style={{ marginLeft: 'auto', color: 'var(--p-bulk-2)' }}/>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Mode B — matrix table with sticky-foot
// ─────────────────────────────────────────────────────────────────────────
function ModeB({
  rows, setRows, launch,
}: {
  rows: ModeBRow[];
  setRows: React.Dispatch<React.SetStateAction<ModeBRow[]>>;
  launch: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const allChecked = rows.length > 0 && selected.size === rows.length;
  const someChecked = selected.size > 0 && !allChecked;

  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(rows.map(r => r.id)));
  };
  const toggleRow = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selRows = rows.filter(r => selected.has(r.id));
  const scope = selRows.length > 0 ? selRows : rows;
  const totalProducts = scope.reduce((s, r) => s + r.products.reduce((a, p) => a + p.qty, 0), 0);
  const totalWholesale = scope.reduce((s, r) => s + r.products.reduce((a, p) => a + p.wholesale * p.qty, 0), 0);
  const totalRetail = scope.reduce((s, r) => s + r.products.reduce((a, p) => a + p.retail * p.qty, 0), 0);
  const totalMargin = totalRetail - totalWholesale;
  const marginPct = totalRetail > 0 ? Math.round((totalMargin / totalRetail) * 100) : 0;

  const duplicateSelected = () => {
    setRows(prev => {
      const max = Math.max(0, ...prev.map(r => r.id));
      const dupes = selRows.map((r, i) => ({ ...r, id: max + 1 + i }));
      return [...prev, ...dupes];
    });
    pToast.info(`Duplikováno ${selRows.length} řádků`);
    setSelected(new Set());
  };
  const removeSelected = () => {
    setRows(prev => prev.filter(r => !selected.has(r.id)));
    pToast.warning(`Smazáno ${selected.size} řádků`);
    setSelected(new Set());
  };

  return (
    <Card padding={0}>
      <div style={{ ...cardHead, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={cardTitle}>Hromadná tabulka objednávek</h3>
          <div style={{ fontSize: 12, color: 'var(--p-t3)' }}>Každý řádek = jeden koncový zákazník + jeho produkty</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <PButton variant="subtle" size="sm"><Plus size={12}/> Přidat řádek</PButton>
          <PButton variant="subtle" size="sm"><Upload size={12}/> Import CSV</PButton>
          <PButton variant="subtle" size="sm"><Download size={12}/> Šablona</PButton>
          <PButton variant="danger" size="sm"><Trash2 size={12}/></PButton>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 36 }}>
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={toggleAll}
                  variant="bulk"
                  ariaLabel="Vybrat vše"
                />
              </th>
              <th style={{ ...th, width: 40 }}>#</th>
              <th style={th}>Zákazník</th>
              <th style={th}>Produkty</th>
              <th style={th}>Doprava</th>
              <th style={th}>Poznámka</th>
              <th style={{ ...th, textAlign: 'right' }}>Velkoob.</th>
              <th style={{ ...th, textAlign: 'right' }}>Koncová</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isSel = selected.has(r.id);
              const rW = r.products.reduce((s, p) => s + p.wholesale * p.qty, 0);
              const rR = r.products.reduce((s, p) => s + p.retail * p.qty, 0);
              const car = CARRIERS.find(c => c.id === r.shipping) ?? CARRIERS[0];
              return (
                <tr key={r.id} className="p-row" style={{
                  borderTop: '1px solid var(--p-hairline)',
                  background: isSel ? 'rgba(168,85,247,0.06)' : 'transparent',
                }}>
                  <td style={td}>
                    <Checkbox checked={isSel} onChange={() => toggleRow(r.id)} variant="bulk" ariaLabel={`Vybrat řádek ${i+1}`}/>
                  </td>
                  <td className="p-mono" style={{ ...td, color: 'var(--p-t3)', fontSize: 11 }}>{i+1}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={r.customer.name} color={r.customer.color} size={28}/>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.customer.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{r.customer.city}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {r.products.map((p, pi) => (
                        <span key={pi} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 7px', background: 'var(--p-surface-2)',
                          border: '1px solid var(--p-border-soft)', borderRadius: 6,
                          fontSize: 11, color: 'var(--p-t1)',
                          maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          <span style={{ color: p.img }}>●</span>
                          {p.name.split(' ').slice(0, 2).join(' ')}
                          <span className="p-mono" style={{ color: 'var(--p-t2)' }}>×{p.qty}</span>
                        </span>
                      ))}
                      <IconBtn><Plus size={11}/></IconBtn>
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: 3, background: car.color, color: 'white',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700,
                      }}>{car.name[0]}</span>
                      {car.name}
                    </span>
                  </td>
                  <td style={{ ...td, color: 'var(--p-t3)', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.note || '—'}</td>
                  <td className="p-mono" style={{ ...td, textAlign: 'right', color: 'var(--p-t2)', fontSize: 12 }}>{fmtCZK(rW)}</td>
                  <td className="p-mono" style={{ ...td, textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{fmtCZK(rR)}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <IconBtn><Edit3 size={11}/></IconBtn>
                      <IconBtn><Copy size={11}/></IconBtn>
                      <IconBtn><Trash2 size={11}/></IconBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Sticky-foot (Mode B) — 3 states per v2 spec ── */}
      <div className="p-sticky-foot is-bulk" style={{ margin: 0, borderRadius: 0, position: 'static' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Stat label={selRows.length > 0 ? 'VYBRÁNO' : 'OBJEDNÁVEK'}>
            <span style={selRows.length > 0 ? { color: 'var(--p-bulk-2)' } : undefined}>
              {selRows.length > 0 ? `${selRows.length} z ${rows.length}` : rows.length}
            </span>
          </Stat>
          <SVdiv/>
          <Stat label="PRODUKTŮ">{totalProducts} ks</Stat>
          <SVdiv/>
          <Stat label="VELKOOB.">{fmtCZK(totalWholesale)}</Stat>
          <SVdiv/>
          <Stat label="MARŽE" accent="#00D2A0">{fmtCZK(totalMargin)} ({marginPct}%)</Stat>
          <SVdiv/>
          <Stat label="CELKEM">{fmtCZK(totalRetail)}</Stat>

          <div style={{ flex: 1, minWidth: 16 }}/>

          {selRows.length === 0 && (
            <>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--p-t3)' }}>
                <Info size={13}/> Vyberte řádky zaškrtnutím, nebo odešlete vše
              </span>
              <PButton variant="subtle">Uložit koncept</PButton>
              <PButton variant="bulk" size="lg" onClick={launch}>
                <Send size={14}/> Odeslat všechny ({rows.length})
              </PButton>
            </>
          )}

          {selRows.length > 0 && allChecked && (
            <>
              <PButton variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Zrušit výběr</PButton>
              <PButton variant="subtle">Uložit koncept</PButton>
              <PButton variant="bulk" size="lg" onClick={launch}>
                <Send size={14}/> Odeslat všechny ({rows.length})
              </PButton>
            </>
          )}

          {selRows.length > 0 && !allChecked && (
            <>
              <PButton variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Zrušit výběr</PButton>
              <PButton variant="subtle" size="sm" onClick={duplicateSelected}><Copy size={12}/> Duplikovat ({selRows.length})</PButton>
              <PButton variant="danger" size="sm" onClick={removeSelected}><Trash2 size={12}/> Smazat ({selRows.length})</PButton>
              <PButton variant="bulk" size="lg" onClick={launch}>
                <Send size={14}/> Odeslat vybrané ({selRows.length})
              </PButton>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function seedModeBRows(): ModeBRow[] {
  return [
    { id: 1, customer: CUSTOMERS[0], products: [{ ...PRODUCTS[0], qty: 2 }, { ...PRODUCTS[1], qty: 1 }], shipping: 'zasilkovna', note: 'Dárkové balení' },
    { id: 2, customer: CUSTOMERS[1], products: [{ ...PRODUCTS[2], qty: 1 }],                              shipping: 'ppl',         note: '' },
    { id: 3, customer: CUSTOMERS[2], products: [{ ...PRODUCTS[3], qty: 1 }, { ...PRODUCTS[4], qty: 2 }], shipping: 'zasilkovna', note: '' },
    { id: 4, customer: CUSTOMERS[3], products: [{ ...PRODUCTS[6], qty: 3 }],                              shipping: 'dpd',         note: 'Doručit po 17:00' },
    { id: 5, customer: CUSTOMERS[4], products: [{ ...PRODUCTS[5], qty: 1 }],                              shipping: 'gls',         note: '' },
    { id: 6, customer: CUSTOMERS[6], products: [{ ...PRODUCTS[7], qty: 1 }, { ...PRODUCTS[1], qty: 2 }], shipping: 'zasilkovna', note: '' },
    { id: 7, customer: CUSTOMERS[7], products: [{ ...PRODUCTS[2], qty: 2 }],                              shipping: 'ppl',         note: 'Křehké' },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// Progress & Done stages
// ─────────────────────────────────────────────────────────────────────────
function BulkProgress({ progress, feed, total, onCancel }: { progress: number; feed: FeedEntry[]; total: number; onCancel: () => void }) {
  const pct = Math.round(progress);
  const errCount = feed.filter(f => f.error).length;
  const successCount = feed.length - errCount;
  const r = 68;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="p-page">
      <div style={{ marginBottom: 16 }}>
        <Tag variant="bulk">PROCESSING</Tag>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-t1)', margin: '6px 0 4px' }}>
          Zpracovávám {total} objednávek
        </h1>
        <div style={{ fontSize: 13, color: 'var(--p-t3)' }}>Toto bude trvat několik sekund. Nezavírejte stránku.</div>
      </div>

      <Card style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={r} fill="none" stroke="var(--p-surface-2)" strokeWidth="10"/>
              <circle
                cx="80" cy="80" r={r}
                fill="none" stroke="url(#prog-grad)" strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dashoffset 0.3s var(--p-ease)' }}
              />
              <defs>
                <linearGradient id="prog-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#A855F7"/>
                  <stop offset="100%" stopColor="#4F6EF7"/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            }}>
              <div className="p-mono" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
                {pct}<span style={{ fontSize: 18, color: 'var(--p-t3)' }}>%</span>
              </div>
              <div className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)', marginTop: 4 }}>
                {feed.length} / {total}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 240 }}>
            <div className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)', letterSpacing: '0.08em' }}>PRŮBĚH</div>
            <div style={{ display: 'flex', gap: 28 }}>
              <BigStat label="DOKONČENO" value={successCount} color="#00D2A0"/>
              <BigStat label="CHYBY" value={errCount} color="#F74F4F"/>
              <BigStat label="ZBÝVÁ" value={total - feed.length} color="var(--p-t1)"/>
            </div>
            <div style={{
              height: 6, background: 'var(--p-surface-2)',
              borderRadius: 99, overflow: 'hidden', marginTop: 8,
            }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 99,
                background: 'linear-gradient(90deg, var(--p-bulk), var(--p-primary))',
                transition: 'width 0.3s var(--p-ease)',
              }}/>
            </div>
            <PButton variant="subtle" size="sm" onClick={onCancel} style={{ width: 'fit-content', marginTop: 12 }}>
              Přerušit
            </PButton>
          </div>
        </div>
      </Card>

      <Card padding={0}>
        <div style={cardHead}>
          <h3 style={cardTitle}>Live feed</h3>
          <span className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>aktualizace v reálném čase</span>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {feed.slice().reverse().map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 20px', borderBottom: '1px solid var(--p-hairline)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: f.error ? 'rgba(247,79,79,0.15)' : 'rgba(0,210,160,0.15)',
                color: f.error ? '#F74F4F' : '#00D2A0',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{f.error ? <X size={11}/> : <Check size={11}/>}</div>
              <Avatar name={f.customer.name} color={f.customer.color} size={26}/>
              <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{f.customer.name}</span>
              {f.error ? (
                <>
                  <Tag variant="danger">{f.error}</Tag>
                  <PButton variant="ghost" size="sm">Opravit</PButton>
                </>
              ) : (
                <>
                  <span className="p-mono" style={{ fontSize: 12, color: 'var(--p-t2)' }}>{f.orderId}</span>
                  <span style={{ fontSize: 11, color: 'var(--p-t3)' }}>vytvořeno</span>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function BulkDone({ feed, total, onClose }: { feed: FeedEntry[]; total: number; onClose: () => void }) {
  const errors = feed.filter(f => f.error);
  const success = feed.length - errors.length;
  return (
    <div className="p-page">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,210,160,0.2), rgba(168,85,247,0.15))',
          border: '2px solid rgba(0,210,160,0.4)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Check size={36} color="#00D2A0" strokeWidth={3}/>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>Hotovo!</h1>
        <div style={{ fontSize: 14, color: 'var(--p-t2)', marginTop: 8, maxWidth: 480 }}>
          Vytvořeno {success} z {total} objednávek{errors.length > 0 ? `, ${errors.length} s chybou` : ''}.
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 24, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <BigStat label="ÚSPĚŠNÉ"  value={success}     color="#00D2A0"/>
          <BigStat label="CHYBY"    value={errors.length} color="#F74F4F"/>
          <BigStat label="CELKEM"   value={total}        color="var(--p-t1)"/>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <PButton variant="ghost"><Download size={14}/> Stáhnout report</PButton>
          <PButton variant="primary" onClick={onClose}><Package size={14}/> Otevřít objednávky <ChevronRight size={12}/></PButton>
        </div>
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
function BigStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span className="p-mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--p-t3)' }}>{label}</span>
      <span className="p-mono" style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
    </div>
  );
}
const SVdiv = () => <div style={{ width: 1, height: 28, background: 'var(--p-border-soft)' }}/>;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: 'var(--p-t2)' }}>{label}</span>
      <span className="p-mono" style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}
function ProductSwatch({ color, size = 44 }: { color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: `linear-gradient(135deg, ${color}, ${color}66)`,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)' }}/>
    </div>
  );
}
function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 24, height: 24, borderRadius: 5,
      background: 'transparent', border: 'none', color: 'var(--p-t3)',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

const cardHead: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px', borderBottom: '1px solid var(--p-hairline)',
};
const cardTitle: CSSProperties = { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--p-t1)' };
const lbl: CSSProperties = { fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--p-t3)' };
const kvRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, marginBottom: 4 };
const th: CSSProperties = {
  textAlign: 'left', padding: '12px 14px',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--p-t3)', background: 'var(--p-surface-2)',
  borderBottom: '1px solid var(--p-border-soft)', whiteSpace: 'nowrap',
};
const td: CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };

const searchIconStyle: CSSProperties = {
  position: 'absolute', left: 10, top: '50%',
  transform: 'translateY(-50%)', color: 'var(--p-t3)', pointerEvents: 'none',
};
const inlineInput: CSSProperties = {
  height: 32, width: '100%', paddingLeft: 30, paddingRight: 10,
  background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
  borderRadius: 8, color: 'var(--p-t1)', fontSize: 12, outline: 'none',
  fontFamily: 'var(--p-font-sans)',
};
