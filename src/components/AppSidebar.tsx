import { useState } from "react";
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
  Monitor
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

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all ${
      isActive 
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <Sidebar
      variant="sidebar"
      side="left"
      className="border-r border-border bg-card/50 backdrop-blur-sm w-40 sm:w-56 max-w-[80vw] data-[state=collapsed]:w-12"
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">G</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-medium text-foreground text-sm">G-Transfert</h2>
              <p className="text-[10px] text-muted-foreground">Crypto Exchange</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* User Profile */}
        {!collapsed && (
          <div className="mb-3 p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  Amadou Diallo
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
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
          <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2">
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Balance Overview */}
        {!collapsed && (
          <div className="my-3 p-2 rounded-md bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <h3 className="text-xs font-medium text-foreground mb-1">
              Solde Total
            </h3>
            <div className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">FCFA</span>
                <span className="font-medium text-foreground">125,000</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">USD</span>
                <span className="font-medium text-foreground">210.15</span>
              </div>
            </div>
          </div>
        )}

        {/* Support & Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2">
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
      <SidebarFooter className="p-2 border-t border-border space-y-1">
        {/* Theme Selector */}
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-7 text-xs">
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
              <button className="flex items-center gap-2 w-full text-left text-xs text-muted-foreground hover:text-destructive transition-colors py-1.5 px-2">
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