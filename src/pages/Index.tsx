import { useAuth } from '@/hooks/useAuth';
import TradingInterface from '@/components/TradingInterface';
import LandingPage from '@/components/LandingPage';

const Index = () => {
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

  // Show landing page if not authenticated, trading interface if authenticated
  return user ? <TradingInterface /> : <LandingPage />;
};

export default Index;