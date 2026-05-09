import { useState, useEffect, CSSProperties } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard, Package, Zap, BookOpen, ShoppingCart,
  Users, Plug, BarChart2, Settings, ChevronLeft, ChevronRight,
  Search, Bell, Plus, ChevronDown, Home, Menu, X,
} from 'lucide-react';

type NavItem =
  | { section: string }
  | { id: string; label: string; icon: React.ElementType; path: string; pill?: string; count?: number };

const NAV: NavItem[] = [
  { section: 'Hlavní' },
  { id: 'dashboard',    label: 'Přehled',              icon: LayoutDashboard, path: '/partner' },
  { id: 'orders',       label: 'Objednávky',           icon: Package,         path: '/partner/orders',       count: 128 },
  { id: 'bulk',         label: 'Hromadné odeslání',    icon: Zap,             path: '/partner/bulk',         pill: 'NEW', count: 3 },
  { id: 'catalog',      label: 'Katalog',              icon: BookOpen,        path: '/partner/catalog' },
  { id: 'new-order',    label: 'Nová objednávka',      icon: ShoppingCart,    path: '/partner/new-order' },
  { section: 'Zákazníci & integrace' },
  { id: 'customers',    label: 'Zákazníci',            icon: Users,           path: '/partner/customers' },
  { id: 'integrations', label: 'Integrace',            icon: Plug,            path: '/partner/integrations' },
  { id: 'analytics',    label: 'Analytika',            icon: BarChart2,       path: '/partner/analytics' },
  { section: 'Účet' },
  { id: 'settings',     label: 'Nastavení',            icon: Settings,        path: '/partner/settings' },
];

function getPageTitle(pathname: string): string {
  if (pathname === '/partner') return 'Přehled';
  if (pathname.startsWith('/partner/orders'))       return 'Objednávky';
  if (pathname.startsWith('/partner/bulk'))         return 'Hromadné odeslání';
  if (pathname.startsWith('/partner/catalog'))      return 'Katalog';
  if (pathname.startsWith('/partner/new-order'))    return 'Nová objednávka';
  if (pathname.startsWith('/partner/customers'))    return 'Zákazníci';
  if (pathname.startsWith('/partner/integrations')) return 'Integrace';
  if (pathname.startsWith('/partner/analytics'))    return 'Analytika';
  if (pathname.startsWith('/partner/settings'))     return 'Nastavení';
  return 'Partner Hub';
}

function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P';
}

const iconBtn: CSSProperties = {
  position: 'relative',
  width: 34, height: 34, borderRadius: 8,
  background: 'transparent', border: '1px solid var(--p-border)',
  color: 'var(--p-t2)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

export default function PartnerLayout() {
  const { isB2bApproved, isAdmin, user, profile, loading } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const setViewMode = useStore((s) => s.setViewMode);

  const goToCatalog = () => {
    setViewMode('catalog');
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  if (loading) return null;
  if (!user || (!isB2bApproved && !isAdmin)) return <Navigate to="/login" replace />;

  return (
    <div className="partner-app" style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Mobile backdrop */}
      <div
        className={`partner-sidebar-overlay${mobileOpen ? ' mobile-open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`partner-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>

        {/* Brand — klik vede zpět do hlavního katalogu */}
        <button
          type="button"
          onClick={goToCatalog}
          title="Zpět do katalogu"
          aria-label="Zpět do katalogu"
          style={{
            padding: '18px 16px 14px',
            borderBottom: '1px solid var(--p-hairline)',
            display: 'flex', alignItems: 'center', gap: 10,
            minHeight: 64,
            background: 'transparent', border: 'none', cursor: 'pointer',
            width: '100%', textAlign: 'left',
          }}
        >
          <div style={{
            width: 28, height: 28, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--p-primary), var(--p-bulk))',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: 'white', fontWeight: 700,
          }}>◆</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--p-t1)' }}>
                partner<span style={{ color: 'var(--p-t3)' }}>.hub</span>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                color: 'var(--p-bulk-2)', marginTop: 2,
              }}>DROPSHIPPING</div>
            </div>
          )}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map((item, i) => {
            if ('section' in item) {
              return !collapsed
                ? <div key={i} style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--p-t4)', padding: '12px 8px 4px', whiteSpace: 'nowrap',
                  }}>{item.section}</div>
                : <div key={i} style={{ height: 8 }} />;
            }
            const isActive = item.path === '/partner'
              ? location.pathname === '/partner'
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 10, width: '100%',
                  padding: collapsed ? '9px 0' : '9px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 8, marginBottom: 2,
                  cursor: 'pointer', border: 'none',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(79,110,247,0.15), rgba(79,110,247,0.04))'
                    : 'transparent',
                  boxShadow: isActive ? 'inset 2px 0 0 var(--p-primary)' : 'none',
                  color: isActive ? 'var(--p-primary-2)' : 'var(--p-t2)',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  transition: `all var(--p-t-fast)`,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {item.pill && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                        padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(168,85,247,0.2)', color: 'var(--p-bulk-2)',
                      }}>{item.pill}</span>
                    )}
                    {item.count != null && (
                      <span style={{
                        fontSize: 11, fontFamily: 'var(--p-font-mono)',
                        color: 'var(--p-t4)',
                      }}>{item.count}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer usage card */}
        {!collapsed && (
          <div style={{ padding: '12px', borderTop: '1px solid var(--p-hairline)' }}>
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              background: 'var(--p-card)', border: '1px solid var(--p-border-soft)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--p-t3)', marginBottom: 4 }}>
                VYUŽITÍ · DUBEN
              </div>
              <div style={{
                fontSize: 13, fontFamily: 'var(--p-font-mono)',
                color: 'var(--p-t1)', marginBottom: 8,
              }}>847 / 2 000 obj.</div>
              <div style={{ height: 4, background: 'var(--p-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  width: '42%', height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, var(--p-primary), var(--p-bulk))',
                  transition: 'width 0.6s var(--p-ease)',
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <button
          className="partner-collapse-toggle"
          onClick={() => setCollapsed(v => !v)}
          style={{
            position: 'absolute', top: '50%', right: -12,
            transform: 'translateY(-50%)',
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--p-surface-1)', border: '1px solid var(--p-border)',
            color: 'var(--p-t3)', cursor: 'pointer',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className={`partner-main${collapsed ? ' sidebar-collapsed' : ''}`}>

        {/* Header */}
        <header className="partner-header" style={{
          height: 60,
          background: 'rgba(10,11,15,0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--p-border-soft)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 16,
          position: 'sticky', top: 0, zIndex: 40,
          flexShrink: 0,
        }}>
          {/* Mobile menu hamburger */}
          <button
            className="partner-mobile-menu-btn"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Otevřít menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--p-t3)', flexShrink: 0, minWidth: 0,
          }}>
            <Home size={13} className="partner-header-breadcrumb-home" />
            <span className="partner-header-breadcrumb-home">/</span>
            <span style={{
              color: 'var(--p-t1)', fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {getPageTitle(location.pathname)}
            </span>
          </div>

          {/* Search (hidden on mobile) */}
          <div className="partner-header-search" style={{ flex: 1, maxWidth: 360, margin: '0 auto', position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--p-t3)', pointerEvents: 'none',
            }} />
            <input
              placeholder="Hledat objednávky, zákazníky, produkty…"
              style={{
                width: '100%', height: 34,
                background: 'var(--p-surface-2)', border: '1px solid var(--p-border-soft)',
                borderRadius: 8, padding: '0 36px 0 32px',
                fontSize: 13, color: 'var(--p-t1)', outline: 'none',
              }}
            />
            <kbd style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              fontSize: 10, color: 'var(--p-t4)', fontFamily: 'var(--p-font-mono)',
              background: 'var(--p-card)', border: '1px solid var(--p-border)',
              padding: '1px 5px', borderRadius: 4, pointerEvents: 'none',
            }}>⌘K</kbd>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
            <button className="partner-header-actions-extra" style={iconBtn}>
              <Bell size={15} />
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--p-bulk)',
              }} />
            </button>
            <button className="partner-header-actions-extra" style={iconBtn}><Plus size={15} /></button>
            <div className="partner-header-actions-extra" style={{ width: 1, height: 24, background: 'var(--p-border)', margin: '0 4px' }} />
            {/* Avatar pill */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 6px',
              background: 'transparent', border: '1px solid var(--p-border)',
              borderRadius: 8, cursor: 'pointer', color: 'var(--p-t1)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--p-primary), var(--p-bulk))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'white',
              }}>
                {getInitials(profile?.company_name || '')}
              </span>
              <div className="partner-header-avatar-text" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                  {profile?.company_name || 'Partner'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--p-t3)', lineHeight: 1.2 }}>Dropshipping</span>
              </div>
              <ChevronDown size={12} style={{ color: 'var(--p-t3)', marginLeft: 2 }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="partner-main-content" style={{
          flex: 1, padding: '24px',
          background: 'var(--p-bg)',
          overflowY: 'auto', minWidth: 0,
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
