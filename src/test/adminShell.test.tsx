import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminGuard } from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';

// Guard i layout čtou jen realIsAdmin/loading — zbytek kontextu není potřeba.
const authState = { realIsAdmin: false, loading: false };
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => authState,
}));

function renderShell(initialPath = '/admin') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>homepage</div>} />
        <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route path="/admin" element={<div>admin-obsah</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('admin shell (AdminGuard + AdminLayout)', () => {
  beforeEach(() => {
    authState.realIsAdmin = false;
    authState.loading = false;
  });

  it('přesměruje ne-admina na homepage', () => {
    renderShell();
    expect(screen.getByText('homepage')).toBeInTheDocument();
    expect(screen.queryByText('admin-obsah')).not.toBeInTheDocument();
  });

  it('během načítání auth nic nerozhoduje (spinner, žádný redirect)', () => {
    authState.loading = true;
    renderShell();
    expect(screen.queryByText('homepage')).not.toBeInTheDocument();
    expect(screen.queryByText('admin-obsah')).not.toBeInTheDocument();
  });

  it('adminovi vykreslí sidebar (položky ze siteMap) i obsah routy', () => {
    authState.realIsAdmin = true;
    renderShell();
    expect(screen.getByText('admin-obsah')).toBeInTheDocument();
    // Navigace odvozená ze siteMap clusteru `admin`
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('ERP & Objednávky')).toBeInTheDocument();
    expect(screen.getByText('Web Cockpit (audit)')).toBeInTheDocument();
    expect(screen.getByText('Správa zákazníků')).toBeInTheDocument();
  });
});
