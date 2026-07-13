import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BadgePercent, BarChart3, Bot, Boxes, ClipboardCheck, Globe, Inbox, LayoutDashboard,
  MessagesSquare, Rss, Users, type LucideIcon,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger,
} from '@/components/ui/sidebar';
import { SITE_MAP } from '@/lib/audit/siteMap';

/** Ikony k položkám admin clusteru ze siteMap (pageId → ikona). */
const NAV_ICONS: Record<string, LucideIcon> = {
  'admin-home': LayoutDashboard,
  'admin-ws': Bot,
  'admin-context': Boxes,
  'admin-erp': BarChart3,
  'admin-inquiries': Inbox,
  customers: Users,
  'admin-deals': BadgePercent,
  'audit-cockpit': ClipboardCheck,
  'feed-management': Rss,
};

/** Navigace odvozená ze siteMap clusteru `admin` — single source of truth. */
const ADMIN_NAV = (SITE_MAP.find((c) => c.id === 'admin')?.pages ?? [])
  .filter((p) => p.route && !p.dynamic);

/**
 * Sdílený shell všech admin rout: sidebar + obsah (<Outlet/>). Stránky uvnitř
 * zůstávají beze změny (vlastní Navbar apod.) — shell je jen zastřešuje.
 */
export default function AdminLayout() {
  const { pathname } = useLocation();

  const isActive = (route: string) =>
    route === '/admin' ? pathname === '/admin' : pathname.startsWith(route);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link to="/admin" className="flex items-center gap-2 px-2 py-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#131517] text-xs font-black text-[#d1fe17]">
              S
            </span>
            <span className="truncate text-sm font-bold tracking-tight group-data-[collapsible=icon]:hidden">
              Swelt Admin
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Řízení</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {ADMIN_NAV.map((page) => {
                  const Icon = NAV_ICONS[page.id] ?? LayoutDashboard;
                  return (
                    <SidebarMenuItem key={page.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(page.route!)}
                        tooltip={page.label}
                      >
                        <Link to={page.route!}>
                          <Icon />
                          <span>{page.label}</span>
                          {page.isLive === false && (
                            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                              mimo provoz
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Spolupráce</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Komunikace swelt × zago">
                    <Link to="/komunikace">
                      <MessagesSquare />
                      <span>Komunikace</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Zpět na web">
                <Link to="/">
                  <Globe />
                  <span>Zpět na web</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {/* Plovoucí trigger — stránky mají vlastní (absolute) Navbar nahoře,
            proto sedí dole vpravo; na mobilu nad BottomNav (jako ViewAsSwitcher). */}
        <SidebarTrigger className="fixed bottom-[76px] lg:bottom-4 right-4 z-[130] h-9 w-9 rounded-full border bg-background shadow-lg" />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
