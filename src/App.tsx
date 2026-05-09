import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import CustomerManagement from "./pages/CustomerManagement.tsx";
import CustomerDetail from "./pages/CustomerDetail.tsx";
import FeedManagement from "./pages/FeedManagement.tsx";
import Favorites from "./pages/Favorites.tsx";
import PartnerLayout from "./pages/partner/PartnerLayout.tsx";
import PartnerDashboard from "./pages/partner/PartnerDashboard.tsx";
import PartnerOrders from "./pages/partner/PartnerOrders.tsx";
import PartnerBulk from "./pages/partner/PartnerBulk.tsx";
import PartnerCatalog from "./pages/partner/PartnerCatalog.tsx";
import PartnerNewOrder from "./pages/partner/PartnerNewOrder.tsx";
import PartnerCustomers from "./pages/partner/PartnerCustomers.tsx";
import PartnerIntegrations from "./pages/partner/PartnerIntegrations.tsx";
import PartnerAnalytics from "./pages/partner/PartnerAnalytics.tsx";
import PartnerSettings from "./pages/partner/PartnerSettings.tsx";
import Velkoobchod from "./pages/Velkoobchod.tsx";
import Dropshipping from "./pages/Dropshipping.tsx";
import Feed from "./pages/Feed.tsx";
import Luxury from "./pages/Luxury.tsx";
import Shop from "./pages/Shop.tsx";
import Brands from "./pages/Brands.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
              <Route path="bulk" element={<PartnerBulk />} />
              <Route path="catalog" element={<PartnerCatalog />} />
              <Route path="new-order" element={<PartnerNewOrder />} />
              <Route path="customers" element={<PartnerCustomers />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
