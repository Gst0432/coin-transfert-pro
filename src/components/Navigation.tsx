import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Settings, Home, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Navigation() {
  const location = useLocation();
  const { user, signOut, isLoading } = useAuth();
  const { toast } = useToast();
  const isAdmin = location.pathname === '/admin';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <nav className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2 glass-effect rounded-xl p-2">
          <Badge variant="outline">Chargement...</Badge>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 glass-effect rounded-xl p-2">
        {user ? (
          <>
            <Badge variant="outline" className="status-success flex items-center gap-1">
              <User className="w-3 h-3" />
              {isAdmin ? 'Admin' : 'Client'}
            </Badge>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-6 px-2 text-xs"
            >
              <LogOut className="w-3 h-3" />
              Déconnexion
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-6 px-2 text-xs"
            >
              <LogIn className="w-3 h-3" />
              Connexion
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}