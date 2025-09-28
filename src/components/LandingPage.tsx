import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, LogIn, UserPlus, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email invalide').max(255, 'Email trop long'),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères').max(100, 'Mot de passe trop long'),
  displayName: z.string().min(2, 'Nom minimum 2 caractères').max(50, 'Nom trop long').optional(),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Numéro de téléphone invalide').optional()
});

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: ''
  });
  
  const { toast } = useToast();

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
        description: "Bienvenue sur Exchange!"
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
      
      const { error } = await supabase.auth.signUp({
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left side - Hero content */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  Plateforme de change sécurisée
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
                  Exchange
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground mb-6">
                  Échangez facilement entre <span className="text-primary font-semibold">FCFA</span> et <span className="text-primary font-semibold">USDT</span>
                </p>
                <p className="text-lg text-muted-foreground">
                  La solution de référence pour convertir vos cryptomonnaies en mobile money et vice versa, 
                  rapidement et en toute sécurité.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Instantané</div>
                    <div className="text-xs text-muted-foreground">Transactions rapides</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Sécurisé</div>
                    <div className="text-xs text-muted-foreground">Protection totale</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Afrique</div>
                    <div className="text-xs text-muted-foreground">Couverture régionale</div>
                  </div>
                </div>
              </div>

              {/* CTA for mobile */}
              <div className="lg:hidden">
                <p className="text-sm text-muted-foreground mb-4">
                  Créez votre compte pour commencer
                </p>
                <ArrowRight className="w-5 h-5 mx-auto text-primary animate-bounce" />
              </div>
            </div>

            {/* Right side - Auth form */}
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-sm crypto-card">
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-foreground mb-1">
                      {isLogin ? 'Connexion' : 'Inscription'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {isLogin ? 'Accédez à votre compte' : 'Créez votre compte gratuit'}
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
                          <Label htmlFor="email" className="text-xs">Email</Label>
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
                          <Label htmlFor="password" className="text-xs">Mot de passe</Label>
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
                          <Label htmlFor="signup-email" className="text-xs">Email</Label>
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
                          <Label htmlFor="signup-password" className="text-xs">Mot de passe</Label>
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
                          <Label htmlFor="displayName" className="text-xs">Nom d'affichage</Label>
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
                          <Label htmlFor="phoneNumber" className="text-xs">Numéro de téléphone</Label>
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
                        className="w-full crypto-button-primary h-9 px-3 text-sm"
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

                    <div className="mt-6 text-center">
                      <p className="text-xs text-muted-foreground">
                        {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                        <Button
                          variant="link"
                          className="pl-1 text-primary text-xs h-auto p-0 ml-1"
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
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pourquoi choisir Exchange ?
            </h2>
            <p className="text-lg text-muted-foreground">
              La plateforme de confiance pour vos échanges crypto-fiat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-lg crypto-card">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transactions rapides</h3>
              <p className="text-muted-foreground">
                Échanges instantanés entre FCFA et USDT avec confirmation en quelques minutes seulement.
              </p>
            </div>

            <div className="text-center p-6 bg-card rounded-lg crypto-card">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sécurité maximale</h3>
              <p className="text-muted-foreground">
                Vos fonds et données personnelles sont protégés par les dernières technologies de sécurité.
              </p>
            </div>

            <div className="text-center p-6 bg-card rounded-lg crypto-card">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Couverture Afrique</h3>
              <p className="text-muted-foreground">
                Support de tous les principaux opérateurs mobile money d'Afrique de l'Ouest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}