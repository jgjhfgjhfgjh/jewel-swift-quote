import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Route-level code splitting — each page ships as its own lazy-loaded chunk.
const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const CustomerManagement = lazy(() => import("./pages/CustomerManagement.tsx"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail.tsx"));
const FeedManagement = lazy(() => import("./pages/FeedManagement.tsx"));
const Favorites = lazy(() => import("./pages/Favorites.tsx"));
const PartnerLayout = lazy(() => import("./pages/partner/PartnerLayout.tsx"));
const PartnerDashboard = lazy(() => import("./pages/partner/PartnerDashboard.tsx"));
const PartnerOrders = lazy(() => import("./pages/partner/PartnerOrders.tsx"));
const PartnerOrderDetail = lazy(() => import("./pages/partner/PartnerOrderDetail.tsx"));
const PartnerBulk = lazy(() => import("./pages/partner/PartnerBulk.tsx"));
const PartnerBulkDetail = lazy(() => import("./pages/partner/PartnerBulkDetail.tsx"));
const PartnerCatalog = lazy(() => import("./pages/partner/PartnerCatalog.tsx"));
const PartnerNewOrder = lazy(() => import("./pages/partner/PartnerNewOrder.tsx"));
const PartnerCustomers = lazy(() => import("./pages/partner/PartnerCustomers.tsx"));
const PartnerCustomerDetail = lazy(() => import("./pages/partner/PartnerCustomerDetail.tsx"));
const PartnerIntegrations = lazy(() => import("./pages/partner/PartnerIntegrations.tsx"));
const PartnerAnalytics = lazy(() => import("./pages/partner/PartnerAnalytics.tsx"));
const PartnerSettings = lazy(() => import("./pages/partner/PartnerSettings.tsx"));
const Velkoobchod = lazy(() => import("./pages/Velkoobchod.tsx"));
const Dropshipping = lazy(() => import("./pages/Dropshipping.tsx"));
const Feed = lazy(() => import("./pages/Feed.tsx"));
const Luxury = lazy(() => import("./pages/Luxury.tsx"));
const Shop = lazy(() => import("./pages/Shop.tsx"));
const Brands = lazy(() => import("./pages/Brands.tsx"));
const BrandDetail = lazy(() => import("./pages/BrandDetail.tsx"));
const Deals = lazy(() => import("./pages/Deals.tsx"));
const DealDetail = lazy(() => import("./pages/DealDetail.tsx"));
const AdminDeals = lazy(() => import("./pages/admin/AdminDeals.tsx"));
const ComLayout = lazy(() => import("./pages/komunikace/ComLayout.tsx"));
const ComOverview = lazy(() => import("./pages/komunikace/ComOverview.tsx"));
const ComTopicDetail = lazy(() => import("./pages/komunikace/ComTopicDetail.tsx"));
const ComParticipants = lazy(() => import("./pages/komunikace/ComParticipants.tsx"));

const queryClient = new QueryClient();

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/admin/feeds" element={<FeedManagement />} />
              <Route path="/favorites" element={<Favorites />} />
              {/* Partner Hub — dropshipping dashboard */}
              <Route path="/partner" element={<PartnerLayout />}>
                <Route index element={<PartnerDashboard />} />
                <Route path="orders" element={<PartnerOrders />} />
                <Route path="orders/:id" element={<PartnerOrderDetail />} />
                <Route path="bulk" element={<PartnerBulk />} />
                <Route path="bulk/:id" element={<PartnerBulkDetail />} />
                <Route path="catalog" element={<PartnerCatalog />} />
                <Route path="new-order" element={<PartnerNewOrder />} />
                <Route path="customers" element={<PartnerCustomers />} />
                <Route path="customers/:id" element={<PartnerCustomerDetail />} />
                <Route path="integrations" element={<PartnerIntegrations />} />
                <Route path="analytics" element={<PartnerAnalytics />} />
                <Route path="settings" element={<PartnerSettings />} />
              </Route>
              <Route path="/velkoobchod" element={<Velkoobchod />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/dropshipping" element={<Dropshipping />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/luxury" element={<Luxury />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/brands/:slug" element={<BrandDetail />} />
              {/* DEAL offers — closeout catalogs */}
              <Route path="/deals" element={<Deals />} />
              <Route path="/deals/:slug" element={<DealDetail />} />
              <Route path="/admin/deals" element={<AdminDeals />} />
              {/* Komunikace swelt × zago — interní kolaborační workspace */}
              <Route path="/komunikace" element={<ComLayout />}>
                <Route index element={<ComOverview />} />
                <Route path="t/:id" element={<ComTopicDetail />} />
                <Route path="ucastnici" element={<ComParticipants />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
