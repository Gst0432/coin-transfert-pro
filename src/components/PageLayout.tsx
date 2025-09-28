import { ReactNode } from "react";
import { Header } from "./Header";

interface PageLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showUserMenu?: boolean;
  headerProps?: {
    logoUrl?: string;
    siteName?: string;
  };
  className?: string;
}

export const PageLayout = ({ 
  children, 
  showNavigation = true, 
  showUserMenu = true,
  headerProps,
  className = ""
}: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <Header 
        showNavigation={showNavigation} 
        showUserMenu={showUserMenu}
        {...headerProps}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};