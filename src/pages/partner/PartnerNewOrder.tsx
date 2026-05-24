import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Search, Plus, Minus, X, Check, CheckCircle2, Info,
} from 'lucide-react';
import {
  CUSTOMERS, PRODUCTS, CARRIERS, Customer, Product, fmtCZK,
} from './_data/mock';
import {
  Stepper, PButton, Avatar, Card, PInput, MarginBox,
} from './_components/primitives';
import { pToast } from './_components/toast';

interface CartLine extends Product { qty: number }

export default function PartnerNewOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0..3 = 4 steps

  const [picked, setPicked] = useState<Customer>(CUSTOMERS[0]);
  const [pickerSearch, setPickerSearch] = useState('');

  const [items, setItems] = useState<CartLine[]>([
    { ...PRODUCTS[0], qty: 1 },
    { ...PRODUCTS[2], qty: 2 },
  ]);
  const [productSearch, setProductSearch] = useState('');

  const [carrierId, setCarrierId] = useState('zasilkovna');
  const carrier = CARRIERS.find(c => c.id === carrierId) ?? CARRIERS[0];
  const [packingNote, setPackingNote] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [blind, setBlind] = useState(true);
  const [template, setTemplate] = useState<'minimal' | 'logo' | 'custom'>('logo');

  const subtotal = items.reduce((s, i) => s + i.retail * i.qty, 0);
  const wholesale = items.reduce((s, i) => s + i.wholesale * i.qty, 0);
  const marg = subtotal - wholesale;
  const margPct = subtotal > 0 ? Math.round((marg / subtotal) * 100) : 0;

  const addItem = (p: Product) => {
    setItems(prev => {
      const ex = prev.find(x => x.id === p.id);
      if (ex) return prev.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const adjustQty = (id: string, delta: number) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x));
  };
  const removeItem = (id: string) => setItems(prev => prev.filter(x => x.id !== id));

  const submitOrder = () => {
    pToast.success('Objednávka odeslána!');
    navigate('/partner/orders');
  };

  return (
    <div className="p-page">
      <div style={{ marginBottom: 16 }}>
        <PButton variant="ghost" size="sm" onClick={() => navigate('/partner/orders')}>
          <ChevronLeft size={12}/> Zrušit
        </PButton>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p-t1)', margin: '6px 0 4px' }}>
          Nová dropship objednávka
        </h1>
        <div style={{ fontSize: 13, color: 'var(--p-t3)' }}>Krok {step + 1} ze 4</div>
      </div>

      <Card style={{ padding: 24 }}>
        <Stepper
          steps={['Zákazník', 'Produkty', 'Doprava', 'Potvrzení']}
          current={step}
          onStepClick={(i) => { if (i < step) setStep(i); }}
        />

        <div style={{ marginTop: 28 }}>
          {step === 0 && (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <h3 style={h3}>Vyberte koncového zákazníka</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <PButton variant="primary" size="sm">Stávající zákazník</PButton>
                <PButton variant="subtle" size="sm">+ Vytvořit nového</PButton>
              </div>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <Search size={13} style={searchIconStyle}/>
                <input
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  placeholder="Hledat podle jména, e-mailu…"
                  style={inlineInput}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CUSTOMERS
                  .filter(c => !pickerSearch
                    || c.name.toLowerCase().includes(pickerSearch.toLowerCase())
                    || (c.email ?? '').toLowerCase().includes(pickerSearch.toLowerCase()))
                  .slice(0, 6).map(c => {
                    const active = picked.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setPicked(c)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                          background: active ? 'rgba(79,110,247,0.08)' : 'var(--p-surface-2)',
                          border: `1px solid ${active ? 'rgba(79,110,247,0.4)' : 'var(--p-border-soft)'}`,
                          borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                          color: 'var(--p-t1)', fontFamily: 'var(--p-font-sans)',
                        }}
                      >
                        <Avatar name={c.name} color={c.color} size={40}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--p-t3)' }}>{c.email} · {c.city}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="p-mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--p-t3)', letterSpacing: '0.08em' }}>OBJEDNÁVEK</div>
                          <div className="p-mono" style={{ fontWeight: 700 }}>{c.orders}</div>
                        </div>
                        {active && <CheckCircle2 size={18} color="var(--p-primary)"/>}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={h3}>Vyberte produkty</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 14 }}>
                <div>
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <Search size={13} style={searchIconStyle}/>
                    <input
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Hledat produkty…"
                      style={inlineInput}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                    {PRODUCTS
                      .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .slice(0, 8).map(p => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                        background: 'var(--p-surface-2)',
                        border: '1px solid var(--p-border-soft)',
                        borderRadius: 8,
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 6,
                          background: `linear-gradient(135deg, ${p.img}, ${p.img}55)`,
                          flexShrink: 0,
                        }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div className="p-mono" style={{ fontSize: 10, color: 'var(--p-t3)' }}>
                            {fmtCZK(p.wholesale)} → {fmtCZK(p.retail)}
                          </div>
                        </div>
                        <button
                          onClick={() => addItem(p)}
                          style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.3)',
                            color: 'var(--p-primary-2)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          aria-label={`Přidat ${p.name}`}
                        ><Plus size={12}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <Card padding={14} style={{ background: 'var(--p-surface-2)' }}>
                  <div style={lblStyle}>Souhrn</div>
                  {items.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--p-t3)', padding: '12px 0' }}>Zatím žádné položky.</div>
                  ) : items.map(i => (
                    <div key={i.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                      paddingBottom: 8, borderBottom: '1px solid var(--p-hairline)',
                    }}>
                      <div style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconBtn onClick={() => adjustQty(i.id, -1)}><Minus size={10}/></IconBtn>
                        <span className="p-mono" style={{ width: 18, textAlign: 'center', fontSize: 11 }}>{i.qty}</span>
                        <IconBtn onClick={() => adjustQty(i.id, +1)}><Plus size={10}/></IconBtn>
                        <IconBtn onClick={() => removeItem(i.id)}><X size={10}/></IconBtn>
                      </div>
                      <span className="p-mono" style={{ fontSize: 11, fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
                        {fmtCZK(i.retail * i.qty)}
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <b style={{ fontSize: 13 }}>Celkem</b>
                      <span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(subtotal)}</span>
                    </div>
                    <MarginBox compact>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: 'var(--p-t2)' }}>Marže</span>
                        <span className="p-mono" style={{ fontSize: 12, fontWeight: 700, color: '#00D2A0' }}>
                          {fmtCZK(marg)} ({margPct}%)
                        </span>
                      </div>
                    </MarginBox>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <h3 style={h3}>Doprava a balení</h3>
              <div style={lblStyle}>Dopravce</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, marginBottom: 18 }}>
                {CARRIERS.map(c => {
                  const active = carrierId === c.id;
                  return (
                    <label key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: 12,
                      background: active ? 'rgba(79,110,247,0.06)' : 'var(--p-surface-2)',
                      border: `1px solid ${active ? 'rgba(79,110,247,0.4)' : 'var(--p-border-soft)'}`,
                      borderRadius: 8, cursor: 'pointer',
                    }}>
                      <input
                        type="radio"
                        checked={active}
                        onChange={() => setCarrierId(c.id)}
                        style={{ accentColor: 'var(--p-primary)' }}
                      />
                      <span style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: c.color, color: 'white',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700,
                      }}>{c.name[0]}</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--p-t2)' }}>{c.days}</span>
                      <span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(c.price)}</span>
                    </label>
                  );
                })}
              </div>

              <div style={lblStyle}>Pokyny pro balení</div>
              <textarea
                value={packingNote}
                onChange={e => setPackingNote(e.target.value)}
                placeholder="Volitelné pokyny pro skladníka…"
                style={textareaStyle}
              />

              <div style={{ ...lblStyle, marginTop: 14 }}>Dárková zpráva (na packing slip)</div>
              <textarea
                value={giftMessage}
                onChange={e => setGiftMessage(e.target.value)}
                placeholder="Děkuji za nákup!"
                style={textareaStyle}
              />

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 12, background: 'var(--p-surface-2)', borderRadius: 8,
                marginTop: 14, marginBottom: 14,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Blind shipping</div>
                  <div style={{ fontSize: 11, color: 'var(--p-t3)' }}>
                    Skryje swelt.partner z packing slipu — zákazník vidí jen vás
                  </div>
                </div>
                <Toggle on={blind} onChange={setBlind}/>
              </div>

              <div style={lblStyle}>Šablona packing slipu</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {(['minimal', 'logo', 'custom'] as const).map(t => {
                  const active = template === t;
                  const titles = { minimal: 'Minimal', logo: 'Logo', custom: 'Custom' };
                  return (
                    <button
                      key={t}
                      onClick={() => setTemplate(t)}
                      style={{
                        flex: 1, padding: 14, textAlign: 'center',
                        background: 'var(--p-surface-2)',
                        border: `1px solid ${active ? 'var(--p-primary)' : 'var(--p-border-soft)'}`,
                        borderRadius: 10, cursor: 'pointer',
                        color: 'var(--p-t1)', fontFamily: 'var(--p-font-sans)',
                      }}
                    >
                      <div style={{
                        height: 70, background: 'var(--p-card)', borderRadius: 4,
                        marginBottom: 8, padding: 10, textAlign: 'left',
                        fontSize: 10, color: 'var(--p-t3)',
                      }}>
                        {t === 'minimal' && 'Jednoduchý text-only'}
                        {t === 'logo' && <>
                          <div style={{ height: 8, width: 30, background: 'var(--p-bulk)', marginBottom: 4 }}/>
                          Vaše logo nahoře
                        </>}
                        {t === 'custom' && 'Vlastní šablona'}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{titles[t]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <h3 style={h3}>Zkontrolujte a potvrďte</h3>

              <Card style={{ background: 'var(--p-surface-2)', padding: 18, marginBottom: 12 }}>
                <div style={lblStyle}>Zákazník</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <Avatar name={picked.name} color={picked.color} size={40}/>
                  <div>
                    <div style={{ fontWeight: 600 }}>{picked.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--p-t2)' }}>{picked.address}</div>
                  </div>
                </div>
              </Card>

              <Card style={{ background: 'var(--p-surface-2)', padding: 18, marginBottom: 12 }}>
                <div style={lblStyle}>Položky</div>
                <div style={{ marginTop: 8 }}>
                  {items.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span>{i.qty}× {i.name}</span>
                      <span className="p-mono">{fmtCZK(i.retail * i.qty)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--p-hairline)', margin: '8px 0' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Doprava ({carrier.name})</span>
                    <span className="p-mono">{fmtCZK(carrier.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                    <b>Celkem zákazník</b>
                    <span className="p-mono" style={{ fontWeight: 700 }}>{fmtCZK(subtotal + carrier.price)}</span>
                  </div>
                  <MarginBox compact style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#00D2A0' }}>Vaše marže</span>
                      <span className="p-mono" style={{ fontWeight: 700, color: '#00D2A0' }}>
                        {fmtCZK(marg)} ({margPct}%)
                      </span>
                    </div>
                  </MarginBox>
                </div>
              </Card>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 14, background: 'rgba(79,110,247,0.06)',
                border: '1px solid rgba(79,110,247,0.25)',
                borderRadius: 10, marginBottom: 12,
              }}>
                <Info size={16} style={{ color: 'var(--p-primary-2)' }}/>
                <span style={{ fontSize: 13 }}>
                  Odhadovaná expedice: <b>zítra</b> · Doručení {carrier.days}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 28,
          paddingTop: 18, borderTop: '1px solid var(--p-border-soft)',
          alignItems: 'center',
        }}>
          {step > 0 && (
            <PButton variant="subtle" onClick={() => setStep(step - 1)}>
              <ChevronLeft size={12}/> Zpět
            </PButton>
          )}
          <div style={{ flex: 1 }}/>
          {step < 3 ? (
            <PButton variant="primary" size="lg" onClick={() => setStep(step + 1)}>
              Pokračovat <ChevronRight size={14}/>
            </PButton>
          ) : (
            <PButton variant="primary" size="lg" onClick={submitOrder}>
              <Check size={14}/> Vytvořit objednávku
            </PButton>
          )}
        </div>
      </Card>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        position: 'relative',
        width: 38, height: 22,
        borderRadius: 99, padding: 0,
        background: on ? 'var(--p-primary)' : 'var(--p-border)',
        border: 'none', cursor: 'pointer',
        transition: 'background var(--p-t-fast)',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2, left: on ? 18 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: 'white',
        transition: 'left 0.18s var(--p-ease)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}/>
    </button>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 22, height: 22, borderRadius: 4,
      background: 'transparent', border: 'none', color: 'var(--p-t3)',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

const h3: CSSProperties = { fontSize: 16, fontWeight: 600, color: 'var(--p-t1)', margin: 0, marginBottom: 14 };
const lblStyle: CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 4,
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
const textareaStyle: CSSProperties = {
  width: '100%', minHeight: 70, padding: 10,
  background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
  borderRadius: 8, color: 'var(--p-t1)', fontSize: 13, outline: 'none',
  fontFamily: 'var(--p-font-sans)', resize: 'vertical', marginTop: 6,
};
