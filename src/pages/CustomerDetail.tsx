import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerDiscounts } from '@/hooks/useCustomerDiscounts';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, Mail, Building2, IdCard, Calendar, Shield, Save, Trash2,
  Heart, Tag, Package, Briefcase, Plus, Activity, KeyRound, Send, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, AppRole } from '@/hooks/useAuth';

interface AuthMeta {
  email?: string;
  phone?: string;
  provider?: string;
  providers?: string[];
  created_at?: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  raw_user_meta_data?: Record<string, unknown>;
}

interface ServiceRow {
  id: string;
  service_type: string;
  plan: string | null;
  status: string;
  monthly_price: number | null;
  started_at: string;
  ended_at: string | null;
  admin_note: string | null;
}

interface BrandDiscount { brand: string; percent: number; }
interface ProductDiscountRow { product_id: string; percent: number; product_name?: string; }

const ROLES: AppRole[] = ['admin', 'b2b_approved', 'customer', 'lead'];
const SERVICE_TYPES = ['intelligence', 'dropshipping', 'velkoobchod', 'partner', 'jine'];
const SERVICE_STATUSES = ['active', 'paused', 'cancelled'];

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function CustomerDetail() {
  const { id: userId } = useParams<{ id: string }>();
  const { isAdmin, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [meta, setMeta] = useState<AuthMeta | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // editable
  const [companyName, setCompanyName] = useState('');
  const [ico, setIco] = useState('');
  const [baseDiscount, setBaseDiscount] = useState<string>('0');

  // discounts
  const { fetchDiscounts, saveBrandDiscount, saveProductDiscount, removeBrandDiscount, removeProductDiscount } = useCustomerDiscounts();
  const [brandDiscounts, setBrandDiscounts] = useState<BrandDiscount[]>([]);
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscountRow[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [newBrandPct, setNewBrandPct] = useState('');

  // wishlist
  const [wishlist, setWishlist] = useState<{ id: string; product_id: string; product_name?: string; created_at: string }[]>([]);

  // services
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [newService, setNewService] = useState({ service_type: 'intelligence', plan: '', monthly_price: '' });

  // credentials
  const [newPassword, setNewPassword] = useState('');
  const [credBusy, setCredBusy] = useState(false);

  const handleSetPassword = async () => {
    if (!userId || newPassword.length < 6) return;
    setCredBusy(true);
    const { data, error } = await supabase.functions.invoke('admin-user-credentials', {
      body: { action: 'set_password', user_id: userId, password: newPassword },
    });
    setCredBusy(false);
    if (error || (data as { error?: string })?.error) {
      toast.error('Chyba: ' + (error?.message || (data as { error?: string })?.error));
    } else {
      toast.success('Heslo zákazníka bylo nastaveno');
      setNewPassword('');
    }
  };

  const handleSendLink = async (action: 'send_recovery' | 'send_magic_link') => {
    if (!userId) return;
    setCredBusy(true);
    const { data, error } = await supabase.functions.invoke('admin-user-credentials', {
      body: { action, user_id: userId, redirect_to: window.location.origin },
    });
    setCredBusy(false);
    if (error || (data as { error?: string })?.error) {
      toast.error('Chyba: ' + (error?.message || (data as { error?: string })?.error));
    } else {
      const label = action === 'send_recovery' ? 'Email pro reset hesla' : 'Magic link';
      toast.success(`${label} odeslán${(data as { email?: string })?.email ? ` na ${(data as { email?: string }).email}` : ''}`);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [authLoading, isAdmin, navigate]);

  const loadAll = async () => {
    if (!userId) return;
    setLoading(true);

    const [profileRes, roleRes, wishRes, servicesRes, metaRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      supabase.from('wishlist').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('customer_services').select('*').eq('customer_user_id', userId).order('created_at', { ascending: false }),
      supabase.functions.invoke('admin-get-user-meta', { body: { user_id: userId } }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setCompanyName(profileRes.data.company_name ?? '');
      setIco(profileRes.data.ico ?? '');
      setBaseDiscount(String(profileRes.data.base_discount ?? 0));
    }
    setRole((roleRes.data?.role as AppRole) ?? 'customer');
    setServices((servicesRes.data ?? []) as ServiceRow[]);

    if (metaRes.data && !metaRes.error) setMeta(metaRes.data as AuthMeta);

    // Discounts
    const d = await fetchDiscounts(userId);
    setBrandDiscounts(d.brandDiscounts);

    // Resolve product names for wishlist & product discounts
    const productIds = new Set<string>([
      ...(wishRes.data ?? []).map(w => w.product_id),
      ...Object.keys(d.productDiscounts),
    ]);
    let nameMap = new Map<string, string>();
    if (productIds.size > 0) {
      const { data: prods } = await supabase
        .from('products')
        .select('id, sku, original_name_cz, product_name_is')
        .in('id', Array.from(productIds));
      nameMap = new Map((prods ?? []).map(p => [p.id, p.original_name_cz || p.product_name_is || p.sku]));
    }

    setWishlist((wishRes.data ?? []).map(w => ({ ...w, product_name: nameMap.get(w.product_id) })));
    setProductDiscounts(
      Object.entries(d.productDiscounts).map(([pid, pct]) => ({
        product_id: pid, percent: pct, product_name: nameMap.get(pid),
      }))
    );

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin && userId) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, userId]);

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    const discountVal = Math.min(100, Math.max(0, Number(baseDiscount) || 0));
    const { error } = await supabase
      .from('profiles')
      .update({ company_name: companyName, ico, base_discount: discountVal })
      .eq('user_id', userId);
    if (error) toast.error('Chyba: ' + error.message);
    else toast.success('Profil uložen');
    setSaving(false);
    loadAll();
  };

  const handleChangeRole = async (newRole: AppRole) => {
    if (!userId) return;
    // Delete existing then insert (since user_roles has no UPDATE policy)
    const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (delErr) { toast.error('Chyba: ' + delErr.message); return; }
    const { error: insErr } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
    if (insErr) { toast.error('Chyba: ' + insErr.message); return; }
    setRole(newRole);
    toast.success(`Role změněna na ${newRole}`);
  };

  const handleAddBrandDiscount = async () => {
    if (!userId || !newBrand.trim() || !newBrandPct) return;
    const ok = await saveBrandDiscount(userId, newBrand.trim(), Number(newBrandPct));
    if (ok) {
      setNewBrand(''); setNewBrandPct('');
      loadAll();
    }
  };

  const handleRemoveBrand = async (brand: string) => {
    if (!userId) return;
    const ok = await removeBrandDiscount(userId, brand);
    if (ok) loadAll();
  };

  const handleRemoveProductDiscount = async (productId: string) => {
    if (!userId) return;
    const ok = await removeProductDiscount(userId, productId);
    if (ok) loadAll();
  };

  const handleAddService = async () => {
    if (!userId) return;
    const { error } = await supabase.from('customer_services').insert({
      customer_user_id: userId,
      service_type: newService.service_type,
      plan: newService.plan || null,
      monthly_price: newService.monthly_price ? Number(newService.monthly_price) : null,
      status: 'active',
    });
    if (error) toast.error('Chyba: ' + error.message);
    else {
      toast.success('Služba přidána');
      setNewService({ service_type: 'intelligence', plan: '', monthly_price: '' });
      loadAll();
    }
  };

  const handleUpdateServiceStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('customer_services').update({
      status, ended_at: status === 'cancelled' ? new Date().toISOString() : null,
    }).eq('id', id);
    if (error) toast.error('Chyba: ' + error.message);
    else { toast.success('Status aktualizován'); loadAll(); }
  };

  const handleDeleteService = async (id: string) => {
    const { error } = await supabase.from('customer_services').delete().eq('id', id);
    if (error) toast.error('Chyba: ' + error.message);
    else { toast.success('Služba smazána'); loadAll(); }
  };

  const stats = useMemo(() => ({
    wishlistCount: wishlist.length,
    brandDiscountsCount: brandDiscounts.length,
    productDiscountsCount: productDiscounts.length,
    activeServices: services.filter(s => s.status === 'active').length,
  }), [wishlist, brandDiscounts, productDiscounts, services]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="h-14" />
        <div className="mx-auto w-full max-w-4xl p-4">
          <Button variant="ghost" onClick={() => navigate('/customers')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Zpět
          </Button>
          <p className="text-muted-foreground">Zákazník nenalezen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <div className="h-14" />
      <div className="mx-auto w-full max-w-6xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                {profile.company_name || '— bez názvu —'}
              </h1>
              <p className="text-xs text-muted-foreground font-mono">{profile.user_id}</p>
            </div>
          </div>
          <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="text-xs uppercase">
            <Shield className="h-3 w-3 mr-1" />{role}
          </Badge>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Heart className="h-4 w-4" />} label="Wishlist" value={stats.wishlistCount} />
          <StatCard icon={<Tag className="h-4 w-4" />} label="Brand slevy" value={stats.brandDiscountsCount} />
          <StatCard icon={<Package className="h-4 w-4" />} label="Produktové slevy" value={stats.productDiscountsCount} />
          <StatCard icon={<Briefcase className="h-4 w-4" />} label="Aktivní služby" value={stats.activeServices} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Profile */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Profil firmy</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Field label="Název firmy">
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Field>
              <Field label="IČO">
                <Input value={ico} onChange={(e) => setIco(e.target.value)} />
              </Field>
              <Field label="Základní sleva (%)">
                <Input type="number" min="0" max="100" value={baseDiscount} onChange={(e) => setBaseDiscount(e.target.value)} />
              </Field>
              <Field label="Role">
                <Select value={role ?? 'customer'} onValueChange={(v) => handleChangeRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />Uložit profil
              </Button>
            </CardContent>
          </Card>

          {/* Auth meta + credential actions */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" />Přihlašovací údaje</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={meta?.email ?? '—'} />
              <InfoRow icon={<IdCard className="h-3.5 w-3.5" />} label="Provider" value={
                <Badge variant="outline" className="text-[10px]">{meta?.provider ?? '—'}</Badge>
              } />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Registrován" value={fmtDate(meta?.created_at)} />
              <InfoRow icon={<Activity className="h-3.5 w-3.5" />} label="Naposledy přihlášen" value={fmtDate(meta?.last_sign_in_at)} />
              <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email potvrzen" value={
                meta?.email_confirmed_at
                  ? <Badge variant="default" className="text-[10px]">Ano</Badge>
                  : <Badge variant="destructive" className="text-[10px]">Ne</Badge>
              } />
              {meta?.phone && <InfoRow label="Telefon" value={meta.phone} />}

              <div className="pt-3 mt-3 border-t space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Správa hesla</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Heslo zákazníka je hashované a nelze ho zobrazit. Můžeš ho ale přepsat nebo poslat odkaz pro reset / přihlášení.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Nové heslo (min. 6 znaků)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" onClick={handleSetPassword} disabled={credBusy || newPassword.length < 6}>
                    <KeyRound className="h-3.5 w-3.5 mr-1" />Nastavit
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleSendLink('send_recovery')} disabled={credBusy}>
                    <Send className="h-3.5 w-3.5 mr-1" />Reset emailem
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSendLink('send_magic_link')} disabled={credBusy}>
                    <Sparkles className="h-3.5 w-3.5 mr-1" />Magic link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brand discounts */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" />Trvalé slevy na značky</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Značka</label>
                <Input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="např. Casio" />
              </div>
              <div className="w-28">
                <label className="text-xs text-muted-foreground">Sleva %</label>
                <Input type="number" min="0" max="100" value={newBrandPct} onChange={(e) => setNewBrandPct(e.target.value)} />
              </div>
              <Button onClick={handleAddBrandDiscount}><Plus className="h-4 w-4 mr-1" />Přidat</Button>
            </div>
            {brandDiscounts.length === 0 ? (
              <p className="text-xs text-muted-foreground">Žádné trvalé brand slevy</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Značka</TableHead><TableHead>Sleva</TableHead><TableHead className="w-16"></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {brandDiscounts.map(b => (
                    <TableRow key={b.brand}>
                      <TableCell className="font-medium">{b.brand}</TableCell>
                      <TableCell><Badge variant="secondary">{b.percent}%</Badge></TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleRemoveBrand(b.brand)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Product discounts */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" />Trvalé slevy na produkty</CardTitle></CardHeader>
          <CardContent>
            {productDiscounts.length === 0 ? (
              <p className="text-xs text-muted-foreground">Žádné trvalé produktové slevy</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Produkt</TableHead><TableHead>Sleva</TableHead><TableHead className="w-16"></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {productDiscounts.map(p => (
                    <TableRow key={p.product_id}>
                      <TableCell className="text-sm">{p.product_name ?? p.product_id}</TableCell>
                      <TableCell><Badge variant="secondary">{p.percent}%</Badge></TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleRemoveProductDiscount(p.product_id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-[10px] text-muted-foreground mt-2">
              Produktové slevy se nastavují přes „režim nabídky" v katalogu.
            </p>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4" />Objednané služby</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
              <div>
                <label className="text-xs text-muted-foreground">Typ</label>
                <Select value={newService.service_type} onValueChange={(v) => setNewService(s => ({ ...s, service_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tarif</label>
                <Input value={newService.plan} onChange={(e) => setNewService(s => ({ ...s, plan: e.target.value }))} placeholder="např. Pro" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Cena/měsíc</label>
                <Input type="number" value={newService.monthly_price} onChange={(e) => setNewService(s => ({ ...s, monthly_price: e.target.value }))} />
              </div>
              <Button onClick={handleAddService}><Plus className="h-4 w-4 mr-1" />Přidat službu</Button>
            </div>
            {services.length === 0 ? (
              <p className="text-xs text-muted-foreground">Žádné služby</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead><TableHead>Tarif</TableHead>
                    <TableHead>Status</TableHead><TableHead>Cena/měs</TableHead>
                    <TableHead>Od</TableHead><TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium capitalize">{s.service_type}</TableCell>
                      <TableCell>{s.plan ?? '—'}</TableCell>
                      <TableCell>
                        <Select value={s.status} onValueChange={(v) => handleUpdateServiceStatus(s.id, v)}>
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SERVICE_STATUSES.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{s.monthly_price ? `${s.monthly_price} Kč` : '—'}</TableCell>
                      <TableCell className="text-xs">{fmtDate(s.started_at)}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteService(s.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Wishlist */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4" />Wishlist ({wishlist.length})</CardTitle></CardHeader>
          <CardContent>
            {wishlist.length === 0 ? (
              <p className="text-xs text-muted-foreground">Wishlist je prázdný</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Produkt</TableHead><TableHead>Přidáno</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {wishlist.map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="text-sm">{w.product_name ?? w.product_id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(w.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{icon}{label}</div>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
