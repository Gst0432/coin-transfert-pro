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
import Index from "./pages/Index";
import Wallet from "./pages/Wallet";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="g-transfert-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
                    <Route path="/history" element={<Index />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/auth" element={<Auth />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                
                {/* Mobile Bottom Navigation */}
                <MobileBottomNav />
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
