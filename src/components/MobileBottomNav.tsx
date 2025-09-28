import { Home, ArrowLeftRight, Wallet, History } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const quickActions = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Trading", url: "/trading", icon: ArrowLeftRight },
  { title: "Portefeuille", url: "/wallet", icon: Wallet },
  { title: "Historique", url: "/history", icon: History },
];

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const currentPath = location.pathname;

  if (!isMobile) return null;

  const isActive = (path: string) => currentPath === path;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <nav className="flex items-center justify-around px-2 py-2">
        {quickActions.map((action) => (
          <NavLink
            key={action.title}
            to={action.url}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              isActive(action.url)
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{action.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}