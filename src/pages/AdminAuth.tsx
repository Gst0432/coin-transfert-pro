import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, Shield, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  email: z.string().email('Email invalide').max(255, 'Email trop long'),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères').max(100, 'Mot de passe trop long')
});

export default function AdminAuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is admin and redirect
        if (session?.user) {
          try {
            const { data: hasAdminRole } = await supabase
              .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
            
            if (hasAdminRole) {
              navigate('/admin');
            } else {
              toast({
                title: "Accès refusé",
                description: "Vous n'avez pas les permissions administrateur",
                variant: "destructive"
              });
              await supabase.auth.signOut();
            }
          } catch (error) {
            console.error('Error checking admin role:', error);
            toast({
              title: "Erreur",
              description: "Impossible de vérifier les permissions",
              variant: "destructive"
            });
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const { data: hasAdminRole } = await supabase
            .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
          
          if (hasAdminRole) {
            navigate('/admin');
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    try {
      authSchema.parse(formData);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message };
      }
      return { success: false, error: 'Erreur de validation' };
    }
  };

  const handleLogin = async () => {
    const validation = validateForm();
    if (!validation.success) {
      toast({
        title: "Erreur de validation",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        let errorMessage = 'Erreur de connexion admin';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
        }
        
        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      // Success toast will be shown after role check in useEffect
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md crypto-card shadow-xl">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Connexion Administrateur
            </h1>
            <p className="text-sm text-muted-foreground">
              Accès sécurisé au tableau de bord admin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Administrateur</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="crypto-input h-11"
                placeholder="admin@exemple.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="crypto-input pr-12 h-11"
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full crypto-button-primary h-11 text-sm font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                  Connexion en cours...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground mb-1">
                  Accès Administrateur Uniquement
                </p>
                <p className="text-xs text-muted-foreground">
                  Cette page est réservée aux administrateurs de la plateforme. 
                  Seuls les comptes avec permissions admin peuvent accéder au tableau de bord.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary p-0"
              onClick={() => navigate('/')}
            >
              ← Retour à l'accueil
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}