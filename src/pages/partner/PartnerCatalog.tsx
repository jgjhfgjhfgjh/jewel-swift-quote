import { useEffect, useMemo, useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, X, Send, Clock, Check, ChevronDown, ChevronRight,
  Package, Store, Filter, Grid3x3, ArrowUpDown, Zap,
} from 'lucide-react';
import {
  PRODUCTS, CUSTOMERS, Product, Customer, fmtCZK, margin, marginColor,
} from './_data/mock';
import {
  Tag, PButton, Avatar, MarginBox, Card, Modal, PInput, Checkbox,
} from './_components/primitives';
import { pToast } from './_components/toast';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────
type CatalogMode = 'wholesale' | 'dropship';
interface BasketItem extends Product { qty: number }
interface Basket {
  id: string;
  customer: Customer;
  orderRef: string;
  poNumber: string;
  items: BasketItem[];
}

const SHIPPING_PER_BASKET = 89;

const mkBasket = (customer: Customer, idx = 0): Basket => ({
  id: 'B' + Math.random().toString(36).slice(2, 8),
  customer,
  orderRef: `DS-2026-${String(419 + idx).padStart(4, '0')}`,
  poNumber: '',
  items: [],
});

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────
export default function PartnerCatalog() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CatalogMode>('dropship');
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string>('all');

  // Multi-customer baskets state
  const [baskets, setBaskets] = useState<Basket[]>(() => [mkBasket(CUSTOMERS[0], 0)]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Customer-picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newCustOpen, setNewCustOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [newCustForm, setNewCustForm] = useState({ name: '', email: '', city: '', address: '' });

  // On mount, select & expand the initial basket
  useEffect(() => {
    if (selectedIds.size === 0 && baskets[0]) {
      setSelectedIds(new Set([baskets[0].id]));
      setExpandedId(baskets[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBaskets = baskets.filter(b => selectedIds.has(b.id));

  const cats = useMemo(() => ['all', ...Array.from(new Set(PRODUCTS.map(p => p.category)))], []);
  const filteredProducts = useMemo(
    () => PRODUCTS.filter(p =>
      (cat === 'all' || p.category === cat) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ),
    [cat, search],
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (expandedId === id) setExpandedId(null);
      } else {
        next.add(id);
        setExpandedId(id);
      }
      return next;
    });
  };
  const toggleExpand = (id: string) => {
    if (!selectedIds.has(id)) {
      toggleSelect(id);
      return;
    }
    setExpandedId(cur => cur === id ? null : id);
  };

  const updateBasket = (id: string, patch: Partial<Basket>) => {
    setBaskets(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  };

  // Add product → ALL selected baskets (per v2 spec)
  const addToOrder = (p: Product) => {
    const activeBasket = expandedId
      ? baskets.find(b => b.id === expandedId)
      : selectedIds.size > 0
        ? baskets.find(b => selectedIds.has(b.id))
        : baskets[0];
    const targets = selectedIds.size > 0
      ? baskets.filter(b => selectedIds.has(b.id))
      : activeBasket ? [activeBasket] : [];
    if (targets.length === 0) return;

    setBaskets(prev => prev.map(b => {
      if (!targets.some(t => t.id === b.id)) return b;
      const ex = b.items.find(i => i.id === p.id);
      const items = ex
        ? b.items.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
        : [...b.items, { ...p, qty: 1 }];
      return { ...b, items };
    }));
    if (targets.length === 1) pToast.bulk(`${p.name} → ${targets[0].customer.name}`);
    else pToast.bulk(`${p.name} → ${targets.length} zákazníkům`);
  };

  const addCustomer = (c: Customer) => {
    const existing = baskets.find(b => b.customer.id === c.id);
    if (existing) {
      pToast.info(`${c.name} už má rozpracovanou objednávku`);
      setSelectedIds(prev => new Set([...prev, existing.id]));
      setExpandedId(existing.id);
      setPickerOpen(false);
      return;
    }
    const nb = mkBasket(c, baskets.length);
    setBaskets(prev => [...prev, nb]);
    setSelectedIds(prev => new Set([...prev, nb.id]));
    setExpandedId(nb.id);
    setPickerOpen(false);
    setPickerSearch('');
  };

  const createCustomer = () => {
    if (!newCustForm.name) return;
    const colors = ['#A855F7', '#4F6EF7', '#00D2A0', '#F5A623', '#F74F4F', '#C084FC'];
    // TODO: persist new customer via Supabase insert
    const c: Customer = {
      id: 'C-N' + Math.random().toString(36).slice(2, 5).toUpperCase(),
      name: newCustForm.name,
      email: newCustForm.email,
      phone: '',
      company: null,
      city: newCustForm.city,
      address: newCustForm.address,
      color: colors[Math.floor(Math.random() * colors.length)],
      initials: newCustForm.name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?',
      orders: 0,
      spend: 0,
      lastOrder: 'právě teď',
      tag: 'Newsletter',
    };
    const nb = mkBasket(c, baskets.length);
    setBaskets(prev => [...prev, nb]);
    setSelectedIds(prev => new Set([...prev, nb.id]));
    setExpandedId(nb.id);
    setNewCustOpen(false);
    setPickerOpen(false);
    setNewCustForm({ name: '', email: '', city: '', address: '' });
    pToast.success(`Nový zákazník ${c.name} vytvořen`);
  };

  const closeBasket = (id: string) => {
    const remaining = baskets.filter(b => b.id !== id);
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    if (expandedId === id) setExpandedId(null);
    if (remaining.length === 0) {
      const nb = mkBasket(CUSTOMERS[0], 0);
      setBaskets([nb]);
      setSelectedIds(new Set([nb.id]));
      setExpandedId(nb.id);
    } else {
      setBaskets(remaining);
    }
  };

  // Per-basket actions
  const sendOne = (b: Basket) => {
    if (!b.items.length) return;
    if (!b.poNumber) {
      pToast.warning('Zadejte číslo objednávky (PO)');
      return;
    }
    pToast.success(`Odesláno: ${b.customer.name} (${b.poNumber})`);
    closeBasket(b.id);
  };
  const saveOne = (b: Basket) => {
    if (!b.items.length) return;
    if (!b.poNumber) {
      pToast.warning('Zadejte PO před uložením');
      return;
    }
    pToast.success(`Do čekajících: ${b.customer.name}`);
    closeBasket(b.id);
  };

  // Bulk send/save for ALL selected baskets — validates each
  const targetBaskets = () => {
    const pool = selectedIds.size > 0 ? baskets.filter(b => selectedIds.has(b.id)) : baskets;
    return pool.filter(b => b.items.length > 0);
  };
  const flushTargets = (targets: Basket[], navigateAfter = true) => {
    const ids = new Set(targets.map(t => t.id));
    const remaining = baskets.filter(b => !ids.has(b.id));
    if (remaining.length === 0) {
      const nb = mkBasket(CUSTOMERS[0], 0);
      setBaskets([nb]);
      setSelectedIds(new Set([nb.id]));
      setExpandedId(nb.id);
    } else {
      setBaskets(remaining);
      setSelectedIds(new Set());
      setExpandedId(null);
    }
    if (navigateAfter) navigate('/partner/orders');
  };

  const sendAll = () => {
    const targets = targetBaskets();
    const missing = targets.filter(b => !b.poNumber);
    if (missing.length) {
      pToast.warning(`${missing.length}× chybí PO`);
      return;
    }
    if (!targets.length) return;
    pToast.bulk(`Odesláno ${targets.length} objednávek`);
    flushTargets(targets);
  };
  const saveAll = () => {
    const targets = targetBaskets();
    const missing = targets.filter(b => !b.poNumber);
    if (missing.length) {
      pToast.warning(`${missing.length}× chybí PO`);
      return;
    }
    if (!targets.length) return;
    pToast.success(`${targets.length} objednávek uloženo`);
    flushTargets(targets);
  };

  // Derived sums
  const basketRetail = (b: Basket) => b.items.reduce((s, i) => s + i.retail * i.qty, 0);
  const basketWholesale = (b: Basket) => b.items.reduce((s, i) => s + i.wholesale * i.qty, 0);
  const scopeRetail = selectedBaskets.reduce((s, b) => s + basketRetail(b), 0);
  const scopeWholesale = selectedBaskets.reduce((s, b) => s + basketWholesale(b), 0);
  const scopeMargin = scopeRetail - scopeWholesale;
  const scopeItems = selectedBaskets.reduce((s, b) => s + b.items.reduce((q, i) => q + i.qty, 0), 0);
  const scopeReady = selectedBaskets.filter(b => b.items.length && b.poNumber).length;
  const scopeFilled = selectedBaskets.filter(b => b.items.length).length;
  const shippingTotal = SHIPPING_PER_BASKET * selectedBaskets.length;

  return (
    <div className="p-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-t1)', margin: 0 }}>Katalog</h1>
          <div style={{ fontSize: 13, color: 'var(--p-t3)', marginTop: 4 }}>
            {PRODUCTS.length} produktů · {PRODUCTS.filter(p => p.stock > 0).length} skladem
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PButton variant="ghost"><Filter size={14}/> Filtry</PButton>
          <PButton variant="ghost"><Grid3x3 size={14}/></PButton>
        </div>
      </div>

      {/* Mode switcher + tab bar (NOT sticky per v2 fix #5) */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <CatalogModeSwitch mode={mode} setMode={setMode}/>
          <div style={{ fontSize: 13, color: 'var(--p-t2)', flex: '1 1 200px' }}>
            {mode === 'wholesale'
              ? 'Velkoobchodní nákup pro váš sklad'
              : 'Objednávky pro koncové zákazníky s vlastní marží'}
          </div>
          {mode === 'dropship' && (
            <PButton variant="bulk" size="sm" onClick={() => navigate('/partner/bulk')}>
              <Zap size={13}/> Přepnout na Bulk Dispatch
            </PButton>
          )}
        </div>

        {/* Multi-customer baskets tab bar */}
        {mode === 'dropship' && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--p-border-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <span style={lbl}>
                Objednávám pro <b style={{ color: 'var(--p-t1)' }}>{selectedIds.size}</b> z {baskets.length} zákazníků:
              </span>
              <span className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>
                {scopeFilled} naplněno · {scopeItems} pol. · {fmtCZK(scopeRetail)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {baskets.map(b => {
                const isSel = selectedIds.has(b.id);
                const ready = b.items.length > 0 && b.poNumber.length > 0;
                return (
                  <div
                    key={b.id}
                    onClick={() => toggleSelect(b.id)}
                    title={isSel ? 'Klikem odznačit' : 'Klikem vybrat'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 8px 4px 5px',
                      background: isSel ? 'rgba(168,85,247,0.14)' : 'var(--p-surface-2)',
                      border: `1px solid ${isSel ? 'rgba(168,85,247,0.55)' : 'var(--p-border-soft)'}`,
                      borderRadius: 99, cursor: 'pointer',
                      boxShadow: isSel ? '0 0 0 2px rgba(168,85,247,0.18)' : 'none',
                      opacity: isSel ? 1 : 0.7,
                      transition: 'all var(--p-t-fast)',
                    }}
                  >
                    <span style={{
                      width: 14, height: 14, borderRadius: 4,
                      background: isSel ? 'var(--p-bulk)' : 'transparent',
                      border: `1.5px solid ${isSel ? 'var(--p-bulk)' : 'var(--p-border)'}`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isSel && <Check size={9} color="white" strokeWidth={4}/>}
                    </span>
                    <Avatar name={b.customer.name} color={b.customer.color} size={22}/>
                    <span style={{ fontSize: 12, fontWeight: isSel ? 600 : 400 }}>{b.customer.name}</span>
                    {b.items.length > 0 && (
                      b.poNumber
                        ? <span className="p-mono" style={{ fontSize: 10, color: 'var(--p-bulk-2)' }}>{b.poNumber}</span>
                        : <span className="p-mono" style={{ fontSize: 10, color: '#F5A623' }}>bez č.obj.</span>
                    )}
                    <span className="p-mono" style={{ fontSize: 10, color: 'var(--p-t3)' }}>
                      {b.items.length}p · {fmtCZK(basketRetail(b))}
                    </span>
                    {ready && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D2A0' }}/>}
                    <button
                      onClick={(e) => { e.stopPropagation(); closeBasket(b.id); }}
                      aria-label={`Zavřít košík ${b.customer.name}`}
                      style={{
                        width: 18, height: 18, borderRadius: 4, padding: 0,
                        background: 'transparent', border: 'none', color: 'var(--p-t3)',
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    ><X size={10}/></button>
                  </div>
                );
              })}
              <PButton variant="subtle" size="sm" onClick={() => setPickerOpen(true)}>
                <Plus size={12}/> Přidat zákazníka
              </PButton>
            </div>
          </div>
        )}
      </Card>

      {/* Body grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mode === 'dropship' ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)',
        gap: 14,
      }}>
        <div>
          {/* Filter bar */}
          <div style={filterBar}>
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <Search size={13} style={searchIconStyle}/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hledat produkty…"
                style={inlineInput}
              />
            </div>
            {cats.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={filterChip(cat === c)}
              >{c === 'all' ? 'Vše' : c}</button>
            ))}
            <div style={{ flex: 1 }}/>
            <button style={filterChip(false)}><ArrowUpDown size={12}/> Nejprodávanější</button>
          </div>

          {/* Product grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {filteredProducts.map(p => {
              const m = margin(p.wholesale, p.retail);
              const stockTag = p.stock === 0
                ? { label: 'Vyprodáno', color: '#F74F4F' }
                : p.stock < 50
                  ? { label: `Posledních ${p.stock}`, color: '#F5A623' }
                  : { label: 'Skladem', color: '#00D2A0' };
              return (
                <Card key={p.id} padding={0} style={{ overflow: 'hidden' }}>
                  <div style={{
                    height: 140,
                    background: `linear-gradient(135deg, ${p.img}, ${p.img}55)`,
                    position: 'relative',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)' }}/>
                    <Tag style={{ position: 'absolute', top: 10, left: 10 }}>{p.category}</Tag>
                    <span className="p-mono" style={{
                      position: 'absolute', top: 10, right: 10,
                      padding: '3px 8px',
                      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                      borderRadius: 6, fontSize: 10,
                      color: stockTag.color,
                      border: `1px solid ${stockTag.color}55`,
                      whiteSpace: 'nowrap',
                    }}>{stockTag.label}</span>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div className="p-mono" style={{ fontSize: 10, color: 'var(--p-t3)', marginBottom: 10 }}>SKU {p.sku}</div>

                    {mode === 'dropship' ? (
                      <>
                        <div style={kvRow}><span style={{ color: 'var(--p-t3)' }}>Velkoob.</span><span className="p-mono">{fmtCZK(p.wholesale)}</span></div>
                        <div style={{ ...kvRow, marginBottom: 10 }}>
                          <span style={{ color: 'var(--p-t3)' }}>Koncová</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(p.retail)}</span>
                            <span className="p-mono" style={{ fontSize: 10, fontWeight: 700, color: marginColor(m) }}>{m}%</span>
                          </span>
                        </div>
                        <PButton
                          variant="bulk" size="sm"
                          style={{ width: '100%' }}
                          disabled={p.stock === 0 || baskets.length === 0}
                          onClick={() => addToOrder(p)}
                        ><Plus size={11}/> Přidat do objednávky</PButton>
                      </>
                    ) : (
                      <>
                        <div style={kvRow}><span style={{ color: 'var(--p-t3)' }}>Velkoob.</span><span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(p.wholesale)}</span></div>
                        <div style={kvRow}><span style={{ color: 'var(--p-t3)' }}>Min. množství</span><span className="p-mono">12 ks</span></div>
                        <div style={{ ...kvRow, marginBottom: 10 }}>
                          <span style={{ color: 'var(--p-t3)' }}>Sleva 50+ ks</span>
                          <span className="p-mono" style={{ color: '#00D2A0' }}>−12%</span>
                        </div>
                        <PButton variant="primary" size="sm" style={{ width: '100%' }} disabled={p.stock === 0}>
                          <Plus size={11}/> Přidat do košíku
                        </PButton>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center', color: 'var(--p-t3)', fontSize: 13 }}>
                Žádné produkty neodpovídají filtrům.
              </div>
            )}
          </div>
        </div>

        {/* Right panel — multi-basket sidebar */}
        {mode === 'dropship' && (
          <Card padding={0} style={{
            position: 'sticky',
            top: 76, // header height + small gap
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 100px)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={cardHead}>
              <div>
                <h3 style={cardTitle}>Vybrané košíky</h3>
                <div className="p-mono" style={{ fontSize: 10, color: 'var(--p-t3)' }}>
                  {selectedBaskets.length} z {baskets.length} · cíl produktů
                </div>
              </div>
              <Tag variant="bulk">DROPSHIP</Tag>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {selectedBaskets.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', fontSize: 12, color: 'var(--p-t3)' }}>
                  Nikdo není vybraný.<br/>Klikněte na zákazníka v liště výše.
                </div>
              ) : selectedBaskets.map(b => (
                <BasketCard
                  key={b.id}
                  basket={b}
                  expanded={expandedId === b.id}
                  toggleExpand={() => toggleExpand(b.id)}
                  updateBasket={(patch) => updateBasket(b.id, patch)}
                  sendOne={() => sendOne(b)}
                  saveOne={() => saveOne(b)}
                />
              ))}
            </div>

            {/* Footer — totals + bulk actions */}
            {selectedBaskets.length > 0 && (
              <div style={{
                padding: 14, borderTop: '1px solid var(--p-border-soft)',
                background: 'var(--p-surface-2)',
              }}>
                <KVrow label="Celkem položek" value={`${scopeItems}`}/>
                <KVrow label={`Doprava (${selectedBaskets.length}× 89)`} value={fmtCZK(shippingTotal)}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'baseline' }}>
                  <b style={{ fontSize: 13 }}>Zákazníci platí</b>
                  <span className="p-mono" style={{ fontWeight: 700, fontSize: 14 }}>{fmtCZK(scopeRetail + shippingTotal)}</span>
                </div>

                <MarginBox compact>
                  <KVrow label="Vaše velkoob." value={fmtCZK(scopeWholesale)} small/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#00D2A0' }}>Vaše marže celkem</span>
                    <span className="p-mono" style={{ fontSize: 12, fontWeight: 700, color: '#00D2A0' }}>
                      {fmtCZK(scopeMargin)} {scopeRetail > 0 ? `(${Math.round((scopeMargin / scopeRetail) * 100)}%)` : ''}
                    </span>
                  </div>
                </MarginBox>

                <PButton
                  variant="bulk"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 10, marginBottom: 6 }}
                  disabled={scopeFilled === 0}
                  onClick={sendAll}
                ><Send size={12}/> Odeslat vybrané ({scopeReady}/{scopeFilled})</PButton>
                <PButton
                  variant="subtle"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={scopeFilled === 0}
                  onClick={saveAll}
                ><Clock size={12}/> Uložit do čekajících</PButton>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Customer picker modal */}
      <Modal
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setNewCustOpen(false); }}
        title={newCustOpen ? 'Nový zákazník' : 'Přidat zákazníka'}
        width={560}
      >
        {!newCustOpen ? (
          <>
            <PButton
              variant="bulk"
              size="lg"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}
              onClick={() => setNewCustOpen(true)}
            ><Plus size={14}/> Vytvořit nového zákazníka</PButton>

            <div style={{ borderTop: '1px solid var(--p-hairline)', marginBottom: 14 }}/>

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={13} style={searchIconStyle}/>
              <input
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                placeholder="Hledat zákazníka…"
                autoFocus
                style={inlineInput}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
              {CUSTOMERS
                .filter(c => !pickerSearch
                  || c.name.toLowerCase().includes(pickerSearch.toLowerCase())
                  || (c.email ?? '').toLowerCase().includes(pickerSearch.toLowerCase()))
                .map(c => {
                  const inBasket = baskets.some(b => b.customer.id === c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => addCustomer(c)}
                      disabled={inBasket}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 10,
                        background: 'var(--p-surface-2)',
                        border: '1px solid var(--p-border-soft)',
                        borderRadius: 8, textAlign: 'left',
                        opacity: inBasket ? 0.5 : 1,
                        cursor: inBasket ? 'not-allowed' : 'pointer',
                        color: 'var(--p-t1)',
                        fontFamily: 'var(--p-font-sans)',
                      }}
                    >
                      <Avatar name={c.name} color={c.color} size={32}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>{c.email} · {c.city}</div>
                      </div>
                      <span className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>{c.id}</span>
                      {inBasket && <Tag variant="bulk">v košíku</Tag>}
                    </button>
                  );
                })}
            </div>
          </>
        ) : (
          <>
            <FormLabel>Jméno *</FormLabel>
            <PInput value={newCustForm.name} onChange={(v) => setNewCustForm(f => ({ ...f, name: v }))} autoFocus/>
            <FormLabel style={{ marginTop: 10 }}>E-mail</FormLabel>
            <PInput value={newCustForm.email} onChange={(v) => setNewCustForm(f => ({ ...f, email: v }))} type="email"/>
            <FormLabel style={{ marginTop: 10 }}>Město</FormLabel>
            <PInput value={newCustForm.city} onChange={(v) => setNewCustForm(f => ({ ...f, city: v }))}/>
            <FormLabel style={{ marginTop: 10 }}>Adresa</FormLabel>
            <PInput value={newCustForm.address} onChange={(v) => setNewCustForm(f => ({ ...f, address: v }))}/>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <PButton variant="subtle" onClick={() => setNewCustOpen(false)}>Zpět</PButton>
              <div style={{ flex: 1 }}/>
              <PButton variant="bulk" disabled={!newCustForm.name} onClick={createCustomer}>
                Vytvořit a přidat
              </PButton>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Per-basket card in the right panel
// ─────────────────────────────────────────────────────────────────────────
function BasketCard({
  basket: b, expanded, toggleExpand, updateBasket, sendOne, saveOne,
}: {
  basket: Basket;
  expanded: boolean;
  toggleExpand: () => void;
  updateBasket: (patch: Partial<Basket>) => void;
  sendOne: () => void;
  saveOne: () => void;
}) {
  const retail = b.items.reduce((s, i) => s + i.retail * i.qty, 0);
  const wholesale = b.items.reduce((s, i) => s + i.wholesale * i.qty, 0);
  const marg = retail - wholesale;
  const margPct = retail > 0 ? Math.round((marg / retail) * 100) : 0;
  const poMissing = b.items.length > 0 && !b.poNumber;

  return (
    <div style={{ borderBottom: '1px solid var(--p-border-soft)' }}>
      <div
        onClick={toggleExpand}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: 12, cursor: 'pointer',
          background: expanded ? 'var(--p-surface-2)' : 'transparent',
        }}
      >
        <Avatar name={b.customer.name} color={b.customer.color} size={28}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.customer.name}</div>
          <div className="p-mono" style={{ fontSize: 11, color: 'var(--p-t3)' }}>
            {b.items.length}p · {fmtCZK(retail)}
            {b.poNumber
              ? <> · <span style={{ color: 'var(--p-bulk-2)' }}>{b.poNumber}</span></>
              : b.items.length > 0 ? <> · <span style={{ color: '#F5A623' }}>bez č.obj.</span></> : null}
          </div>
        </div>
        {expanded ? <ChevronDown size={14} color="var(--p-t3)"/> : <ChevronRight size={14} color="var(--p-t3)"/>}
      </div>

      {expanded && (
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ ...lbl as object, marginBottom: 4 }}>Číslo objednávky *</div>
          <PInput
            value={b.poNumber}
            onChange={(v) => updateBasket({ poNumber: v })}
            placeholder="např. PO-2026-001"
            warning={poMissing}
            size="sm"
            style={{ marginBottom: 10 }}
          />

          {b.items.length === 0 ? (
            <div style={{
              padding: 14, textAlign: 'center',
              background: 'var(--p-surface-2)', borderRadius: 7,
              fontSize: 11, color: 'var(--p-t3)',
            }}>Zatím žádné položky.</div>
          ) : b.items.map(i => (
            <div key={i.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 7, background: 'var(--p-surface-2)', borderRadius: 7,
              marginBottom: 6,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 5,
                background: `linear-gradient(135deg, ${i.img}, ${i.img}55)`,
                flexShrink: 0,
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.name}</div>
                <div className="p-mono" style={{ fontSize: 10, color: 'var(--p-t3)' }}>{i.qty}× × {fmtCZK(i.retail)}</div>
              </div>
              <span className="p-mono" style={{ fontSize: 11, fontWeight: 700 }}>{fmtCZK(i.retail * i.qty)}</span>
            </div>
          ))}

          {b.items.length > 0 && (
            <MarginBox compact style={{ marginTop: 8 }}>
              <KVrow label="Velkoob."  value={fmtCZK(wholesale)} small/>
              <KVrow label="Koncová"   value={fmtCZK(retail)} small/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#00D2A0' }}>Vaše marže</span>
                <span className="p-mono" style={{ fontSize: 12, fontWeight: 700, color: '#00D2A0' }}>
                  {fmtCZK(marg)} ({margPct}%)
                </span>
              </div>
            </MarginBox>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <PButton
              variant="bulk" size="sm"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={!b.items.length}
              onClick={(e) => { e.stopPropagation(); sendOne(); }}
            ><Send size={11}/> Odeslat</PButton>
            <PButton
              variant="subtle" size="sm"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={!b.items.length}
              onClick={(e) => { e.stopPropagation(); saveOne(); }}
            ><Clock size={11}/> Uložit</PButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Catalog mode switch (wholesale ↔ dropship)
// ─────────────────────────────────────────────────────────────────────────
function CatalogModeSwitch({ mode, setMode }: { mode: CatalogMode; setMode: (m: CatalogMode) => void }) {
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
        left: mode === 'wholesale' ? 4 : '50%',
        width: 'calc(50% - 4px)',
        background: mode === 'dropship'
          ? 'linear-gradient(135deg, var(--p-bulk), var(--p-primary))'
          : 'var(--p-primary)',
        borderRadius: 8,
        transition: 'left 0.22s var(--p-ease), background 0.22s var(--p-ease)',
        boxShadow: mode === 'dropship' ? 'var(--p-glow-bulk)' : 'var(--p-glow-primary)',
      }}/>
      <button
        onClick={() => setMode('wholesale')}
        style={{
          position: 'relative', zIndex: 1,
          padding: '8px 14px',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: 'none',
          color: mode === 'wholesale' ? 'white' : 'var(--p-t2)',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'var(--p-font-sans)', whiteSpace: 'nowrap',
        }}
      ><Store size={14}/> Wholesale Order</button>
      <button
        onClick={() => setMode('dropship')}
        style={{
          position: 'relative', zIndex: 1,
          padding: '8px 14px',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: 'none',
          color: mode === 'dropship' ? 'white' : 'var(--p-t2)',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'var(--p-font-sans)', whiteSpace: 'nowrap',
        }}
      ><Package size={14}/> Dropship Order</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function KVrow({ label, value, small }: { label: string; value: React.ReactNode; small?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
      <span style={{ fontSize: small ? 11 : 12, color: 'var(--p-t2)' }}>{label}</span>
      <span className="p-mono" style={{ fontSize: small ? 11 : 12 }}>{value}</span>
    </div>
  );
}
function FormLabel({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return <div style={{ ...lbl as object, marginBottom: 4, ...style }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────
const lbl: CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--p-t3)',
};
const cardHead: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 14px', borderBottom: '1px solid var(--p-hairline)',
};
const cardTitle: CSSProperties = { margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--p-t1)' };
const filterBar: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: 12,
  background: 'var(--p-card)', border: '1px solid var(--p-border-soft)',
  borderRadius: 'var(--p-radius)', marginBottom: 12, flexWrap: 'wrap',
};
const kvRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, marginBottom: 4 };
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
const filterChip = (active: boolean): CSSProperties => ({
  height: 32, padding: '0 12px',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: active ? 'rgba(79,110,247,0.12)' : 'var(--p-surface-2)',
  border: `1px solid ${active ? 'rgba(79,110,247,0.3)' : 'var(--p-border-soft)'}`,
  color: active ? 'var(--p-primary-2)' : 'var(--p-t2)',
  borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--p-font-sans)',
  whiteSpace: 'nowrap',
});
