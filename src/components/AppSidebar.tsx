import { useState, useEffect } from "react";
import { 
  Home, 
  ArrowLeftRight, 
  Wallet, 
  History, 
  Settings, 
  HelpCircle, 
  User,
  Shield,
  Bell,
  LogOut,
  Moon,
  Sun,
  Monitor,
  UserCog,
  Layout
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useBrandingSettings } from '@/hooks/useBrandingSettings';
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainItems = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Achats & Ventes", url: "/trading", icon: ArrowLeftRight },
  { title: "Portefeuille", url: "/wallet", icon: Wallet },
  { title: "Historique", url: "/history", icon: History },
];

const supportItems = [
  { title: "Paramètres", url: "/settings", icon: Settings },
  { title: "Sécurité", url: "/security", icon: Shield },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Support", url: "/support", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { settings } = useBrandingSettings();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;
      
      try {
        const { data: hasAdminRole } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });
        setIsAdmin(hasAdminRole || false);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
      isActive 
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`;

  return (
    <Sidebar
      variant="sidebar"
      side="left"
      className="border-r border-border bg-card md:bg-card lg:bg-card w-40 sm:w-56 max-w-[80vw] data-[state=collapsed]:w-12 [&[data-mobile=true]]:bg-background [&[data-mobile=true]]:backdrop-blur-none"
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="p-2 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-2">
          {settings.dashboard_logo_url && !collapsed ? (
            <img 
              src={settings.dashboard_logo_url} 
              alt="Logo" 
              className="h-6 w-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded-md bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-xs">
                {settings.site_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {!collapsed && (
            <div>
              <h2 className="font-medium text-sidebar-foreground text-sm">{settings.site_name}</h2>
              <p className="text-[10px] text-sidebar-foreground/70">Crypto Exchange</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 bg-sidebar">
        {/* User Profile */}
        {!collapsed && (
          <div className="mb-3 p-2 rounded-md bg-sidebar-accent">
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src="" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  Amadou Diallo
                </p>
                <p className="text-[10px] text-sidebar-foreground/70 truncate">
                  amadou@example.com
                </p>
              </div>
              <Badge variant="outline" className="text-[9px] bg-success/20 text-success border-success/30 px-1 py-0">
                Vérifié
              </Badge>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wide px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {!collapsed && <span className="text-xs">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Admin Links - Only show for admin users */}
              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to="/admin" 
                        className={getNavCls({ isActive: isActive("/admin") })}
                      >
                        <UserCog className="w-3.5 h-3.5" />
                        {!collapsed && <span className="text-xs">Administration</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to="/admin/landing-page" 
                        className={getNavCls({ isActive: isActive("/admin/landing-page") })}
                      >
                        <Layout className="w-3.5 h-3.5" />
                        {!collapsed && <span className="text-xs">Landing Page</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        {/* Support & Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wide px-2">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {!collapsed && <span className="text-xs">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-2 border-t border-sidebar-border space-y-1 bg-sidebar">
        {/* Theme Selector */}
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground/85 hover:text-sidebar-foreground hover:bg-sidebar-accent h-7 text-xs">
                {theme === 'dark' ? <Moon className="w-3 h-3" /> : 
                 theme === 'light' ? <Sun className="w-3 h-3" /> : 
                 <Monitor className="w-3 h-3" />}
                <span className="capitalize text-xs">{theme === 'system' ? 'Système' : theme === 'dark' ? 'Sombre' : 'Clair'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 text-xs">
                <Sun className="w-3 h-3" />
                <span>Clair</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 text-xs">
                <Moon className="w-3 h-3" />
                <span>Sombre</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 text-xs">
                <Monitor className="w-3 h-3" />
                <span>Système</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="flex items-center gap-2 w-full text-left text-xs text-sidebar-foreground/85 hover:text-destructive hover:bg-sidebar-accent transition-colors py-1.5 px-2 rounded-md">
                <LogOut className="w-3.5 h-3.5" />
                {!collapsed && <span>Déconnexion</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}