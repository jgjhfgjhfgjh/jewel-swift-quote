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
import Partner from "./pages/Partner.tsx";
import Velkoobchod from "./pages/Velkoobchod.tsx";
import Dropshipping from "./pages/Dropshipping.tsx";
import Feed from "./pages/Feed.tsx";
import Luxury from "./pages/Luxury.tsx";
import Shop from "./pages/Shop.tsx";

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
            <Route path="/partner" element={<Partner />} />
            <Route path="/velkoobchod" element={<Velkoobchod />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/dropshipping" element={<Dropshipping />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/luxury" element={<Luxury />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
