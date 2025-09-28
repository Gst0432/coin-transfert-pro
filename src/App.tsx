import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppSidebar } from "./components/AppSidebar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import Navigation from "./components/Navigation";
import { useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";
import Wallet from "./pages/Wallet";
import History from "./pages/History";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import PasswordSettings from "./pages/PasswordSettings";

const queryClient = new QueryClient();

// Main App component with conditional sidebar
const AppContent = () => {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show simple layout without sidebar
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/cancel" element={<PaymentCancel />} />
          <Route path="*" element={<Index />} />
        </Routes>
      </div>
    );
  }

  // If user is authenticated, show full layout with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        <AppSidebar />
        
        {/* Overlay pour PC */}
        <div className="hidden lg:block fixed inset-0 bg-black/80 backdrop-blur-sm z-30 data-[state=closed]:hidden data-[state=open]:block opacity-0 data-[state=open]:opacity-100 transition-opacity duration-300" 
             data-sidebar-overlay />
        
        <div className="flex-1 flex flex-col relative z-40">
          {/* Header with Sidebar Trigger */}
          <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-sm lg:px-6">
            <SidebarTrigger className="text-foreground hover:text-primary lg:hidden" />
            <div className="hidden lg:block" />
            <Navigation />
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto pb-16 lg:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/trading" element={<Index />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/history" element={<History />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/settings/password" element={<PasswordSettings />} />
              <Route path="/success" element={<PaymentSuccess />} />
              <Route path="/cancel" element={<PaymentCancel />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="exchange-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
