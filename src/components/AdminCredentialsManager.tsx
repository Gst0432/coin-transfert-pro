import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, User, Lock, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminCredentialsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [adminSetupCompleted, setAdminSetupCompleted] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [lastPasswordChange, setLastPasswordChange] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Load admin settings
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const { data: settings } = await supabase
          .from('admin_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['admin_setup_completed', 'default_admin_email', 'admin_password_last_changed']);

        if (settings) {
          const setupCompleted = settings.find(s => s.setting_key === 'admin_setup_completed')?.setting_value === true;
          const email = settings.find(s => s.setting_key === 'default_admin_email')?.setting_value as string;
          const lastChange = settings.find(s => s.setting_key === 'admin_password_last_changed')?.setting_value as string;

          setAdminSetupCompleted(setupCompleted);
          setCurrentEmail(typeof email === 'string' ? email.replace(/"/g, '') : '');
          setLastPasswordChange(lastChange && lastChange !== 'null' ? lastChange : null);
          setFormData(prev => ({ ...prev, newEmail: typeof email === 'string' ? email.replace(/"/g, '') : '' }));
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
      }
    };

    loadAdminSettings();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { email: '', password: '', confirmPassword: '' };
    let isValid = true;

    // Email validation
    if (formData.newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.newEmail)) {
        newErrors.email = 'Format d\'email invalide';
        isValid = false;
      }
    }

    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        newErrors.password = 'Minimum 8 caractères requis';
        isValid = false;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        isValid = false;
      }
    }

    // At least one field must be filled
    if (!formData.newEmail && !formData.newPassword) {
      newErrors.email = 'Veuillez remplir au moins un champ';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSetupAdmin = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-default-admin');

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Admin créé avec succès",
          description: `Email: ${data.email}`,
        });
        setAdminSetupCompleted(true);
        setCurrentEmail(data.email);
      } else {
        toast({
          title: "Information",
          description: data.message,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error setting up admin:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'admin par défaut",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);
    try {
      const updateData: any = {
        currentAdminId: user.id
      };

      if (formData.newEmail && formData.newEmail !== currentEmail) {
        updateData.newEmail = formData.newEmail;
      }

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      const { data, error } = await supabase.functions.invoke('update-admin-credentials', {
        body: updateData
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Informations mises à jour",
          description: "Les informations administrateur ont été modifiées avec succès",
        });

        // Update local state
        if (updateData.newEmail) {
          setCurrentEmail(updateData.newEmail);
        }
        if (updateData.newPassword) {
          setLastPasswordChange(new Date().toISOString());
        }

        // Clear password fields
        setFormData(prev => ({ 
          ...prev, 
          newPassword: '', 
          confirmPassword: '' 
        }));
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!adminSetupCompleted) {
    return (
      <Card className="crypto-card p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Configuration Administrateur
          </h2>
          <p className="text-muted-foreground">
            Créer le compte administrateur par défaut pour gérer la plateforme.
          </p>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              L'admin par défaut sera créé avec l'email <strong>admin@exchange.com</strong> et le mot de passe <strong>Admin123!</strong>
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleSetupAdmin}
            disabled={isLoading}
            className="crypto-button-primary"
          >
            {isLoading ? 'Création...' : 'Créer Admin par Défaut'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="crypto-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Gestion Compte Administrateur
            </h2>
            <p className="text-sm text-muted-foreground">
              Modifier l'email et le mot de passe de l'administrateur principal
            </p>
          </div>
        </div>

        {/* Current Info */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium text-foreground mb-2">Informations actuelles</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-mono">{currentEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernière modification mot de passe:</span>
              <span className="font-mono">
                {lastPasswordChange 
                  ? new Date(lastPasswordChange.replace(/"/g, '')).toLocaleDateString('fr-FR')
                  : 'Jamais modifié'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email Update */}
          <div className="space-y-2">
            <Label htmlFor="newEmail" className="text-sm font-medium">
              Nouvel Email (optionnel)
            </Label>
            <Input
              id="newEmail"
              type="email"
              value={formData.newEmail}
              onChange={(e) => handleInputChange('newEmail', e.target.value)}
              className="crypto-input"
              placeholder="admin@exemple.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password Update */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Nouveau Mot de Passe (optionnel)
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="crypto-input pr-12"
                placeholder="Nouveau mot de passe"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          {formData.newPassword && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmer le Mot de Passe
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="crypto-input pr-12"
                  placeholder="Confirmer le mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <Button
            onClick={handleUpdateCredentials}
            disabled={isLoading}
            className="w-full crypto-button-primary"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Mise à jour...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mettre à Jour les Informations
              </div>
            )}
          </Button>
        </div>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Sécurité:</strong> Après modification de l'email ou du mot de passe, 
          vous devrez vous reconnecter avec les nouvelles informations.
        </AlertDescription>
      </Alert>
    </div>
  );
}