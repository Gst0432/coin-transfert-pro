import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  email: z.string().email('Email invalide').max(255, 'Email trop long'),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères').max(100, 'Mot de passe trop long'),
  displayName: z.string().min(2, 'Nom minimum 2 caractères').max(50, 'Nom trop long').optional(),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Numéro de téléphone invalide').optional()
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users to main page
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    try {
      const dataToValidate = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
      
      authSchema.parse(dataToValidate);
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
        let errorMessage = 'Erreur de connexion';
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

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté"
      });
      
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

  const handleSignup = async () => {
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
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: formData.displayName,
            phone_number: formData.phoneNumber
          }
        }
      });

      if (error) {
        let errorMessage = 'Erreur lors de l\'inscription';
        if (error.message.includes('User already registered')) {
          errorMessage = 'Un compte avec cet email existe déjà';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        }
        
        toast({
          title: "Erreur d'inscription",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte"
      });

      // Send welcome notification and email
      try {
        if (data?.user?.id) {
          await supabase.functions.invoke('create-notification', {
            body: {
              userId: data.user.id,
              title: 'Bienvenue !',
              message: 'Votre compte a été créé avec succès. Vous pouvez maintenant commencer à échanger.',
              type: 'success',
              category: 'account',
              important: true
            }
          });
        }
      } catch (notificationError) {
        console.error('Error sending welcome notifications:', notificationError);
      }
      
      // Switch to login tab
      setIsLogin(true);
      
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
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3">
      <Card className="w-full max-w-sm crypto-card">
        <div className="p-4">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-foreground mb-1">
              Exchange
            </h1>
            <p className="text-sm text-muted-foreground">
              Plateforme d'échange FCFA ↔ USDT
            </p>
          </div>

          <Tabs value={isLogin ? "login" : "signup"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-8">
              <TabsTrigger 
                value="login" 
                onClick={() => setIsLogin(true)}
                className="flex items-center gap-1 text-xs"
              >
                <LogIn className="w-3 h-3" />
                Connexion
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                onClick={() => setIsLogin(false)}
                className="flex items-center gap-1 text-xs"
              >
                <UserPlus className="w-3 h-3" />
                Inscription
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-3">
              <TabsContent value="login" className="space-y-3 mt-0">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="crypto-input h-9"
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="crypto-input pr-8 h-9"
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-3 mt-0">
                <div className="space-y-1">
                  <Label htmlFor="signup-email" className="text-sm">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="crypto-input h-9"
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signup-password" className="text-sm">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="crypto-input pr-8 h-9"
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 caractères
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="displayName" className="text-sm">Nom d'affichage</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="crypto-input h-9"
                    placeholder="Votre nom"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phoneNumber" className="text-sm">Numéro de téléphone</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="crypto-input h-9"
                    placeholder="+227 XX XX XX XX"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format international (+227...)
                  </p>
                </div>
              </TabsContent>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full crypto-button-primary h-9"
              >
                {isLoading ? (
                  'Chargement...'
                ) : isLogin ? (
                  'Se connecter'
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>

            {isLogin && (
              <div className="mt-3 text-center">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-primary p-0"
                  asChild
                >
                  <a href="/reset-password">
                    Mot de passe oublié ?
                  </a>
                </Button>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <Button
                  variant="link"
                  className="pl-1 text-primary"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </Button>
              </p>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}