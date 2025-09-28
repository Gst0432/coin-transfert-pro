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
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
      isActive 
        ? "bg-primary/20 text-primary border border-primary/30" 
        : "text-muted-foreground hover:bg-muted"
    }`;

  return (
    <Sidebar
      variant="inset"
      className="border-r border-border bg-card/50 backdrop-blur-sm"
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">G</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-foreground">G-Transfert</h2>
              <p className="text-xs text-muted-foreground">Crypto Exchange</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <SidebarTrigger className="ml-auto -mr-1" />
        )}
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* User Profile */}
        {!collapsed && (
          <div className="mb-6 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Amadou Diallo
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  amadou@example.com
                </p>
              </div>
              <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/30">
                Vérifié
              </Badge>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Balance Overview */}
        {!collapsed && (
          <div className="my-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Solde Total
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">FCFA</span>
                <span className="font-semibold text-foreground">125,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">USD</span>
                <span className="font-semibold text-foreground">210.15</span>
              </div>
            </div>
          </div>
        )}

        {/* Support & Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-border space-y-2">
        {/* Theme Selector */}
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : 
                 theme === 'light' ? <Sun className="w-4 h-4" /> : 
                 <Monitor className="w-4 h-4" />}
                <span className="capitalize">{theme === 'system' ? 'Système' : theme === 'dark' ? 'Sombre' : 'Clair'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
                <Sun className="w-4 h-4" />
                <span>Clair</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
                <Moon className="w-4 h-4" />
                <span>Sombre</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
                <Monitor className="w-4 h-4" />
                <span>Système</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="flex items-center gap-3 w-full text-left text-sm text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
                {!collapsed && <span>Déconnexion</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}