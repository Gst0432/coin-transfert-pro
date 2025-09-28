import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useBrandingSettings } from '@/hooks/useBrandingSettings';
import { NotificationBell } from "@/components/NotificationBell";
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User,
  Settings,
  LogOut,
  Home,
  Wallet,
  History,
  Bell,
  Shield,
  HelpCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  showNavigation?: boolean;
  showUserMenu?: boolean;
  logoUrl?: string;
  siteName?: string;
}

export const Header = ({ 
  showNavigation = true, 
  showUserMenu = true,
  logoUrl,
  siteName
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { settings } = useBrandingSettings();
  const location = useLocation();
  
  // Utiliser les paramètres de branding si pas de props spécifiques
  const finalLogoUrl = logoUrl || settings.main_logo_url;
  const finalSiteName = siteName || settings.site_name;

  const navigationItems = [
    { label: "Accueil", href: "/", icon: Home },
    { label: "Portefeuille", href: "/wallet", icon: Wallet },
    { label: "Historique", href: "/history", icon: History },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Support", href: "/support", icon: HelpCircle },
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            {finalLogoUrl && (
              <img 
                src={finalLogoUrl} 
                alt="Logo" 
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <span className="text-xl font-bold text-foreground">
              {finalSiteName}
            </span>
          </Link>

          {/* Navigation Desktop */}
          {showNavigation && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={isActiveRoute(item.href) ? "default" : "ghost"}
                  className={`transition-colors ${
                    isActiveRoute(item.href) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Link to={item.href} className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </nav>
          )}

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Notifications */}
            {showUserMenu && user && <NotificationBell />}
            
            {/* Theme Toggle */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User Menu ou Auth Buttons */}
            {showUserMenu && user ? (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={undefined} />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Utilisateur
                      </p>
                    </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center space-x-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/security" className="flex items-center space-x-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      <span>Sécurité</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 cursor-pointer text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/auth">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Inscription</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-md">
            <div className="flex flex-col space-y-2">
              {/* Navigation Mobile */}
              {showNavigation && navigationItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={isActiveRoute(item.href) ? "default" : "ghost"}
                  className={`justify-start transition-colors ${
                    isActiveRoute(item.href) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to={item.href} className="flex items-center space-x-2 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}

              <div className="border-t border-border pt-4 mt-4 space-y-2">
                {/* Theme Toggle Mobile */}
                <Button 
                  variant="ghost" 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="justify-start w-full"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
                </Button>

                {/* User Actions Mobile */}
                {showUserMenu && user ? (
                  <>
                    <div className="px-3 py-2 text-sm">
                      <p className="font-medium text-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Utilisateur
                      </p>
                    </div>
                    <Button asChild variant="ghost" className="justify-start w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/settings" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="justify-start w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/security" className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Sécurité</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Déconnexion</span>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button asChild variant="ghost" onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/auth">Connexion</Link>
                    </Button>
                    <Button asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/auth">Inscription</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};