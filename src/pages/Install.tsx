import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, AlertCircle, Loader2, Database, Mail, Key, User, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InstallationData {
  database: {
    host: string;
    port: string;
    name: string;
    username: string;
    password: string;
  };
  app: {
    name: string;
    url: string;
    timezone: string;
  };
  smtp: {
    host: string;
    port: string;
    username: string;
    password: string;
    encryption: string;
    from_email: string;
    from_name: string;
  };
  payments: {
    moneroo_api_key: string;
    moneroo_secret_key: string;
    nowpayments_api_key: string;
    nowpayments_secret_key: string;
  };
  admin: {
    email: string;
    password: string;
    display_name: string;
  };
}

const INSTALLATION_STEPS = [
  { id: 'requirements', title: 'Prérequis', icon: Settings },
  { id: 'database', title: 'Base de données', icon: Database },
  { id: 'app', title: 'Configuration', icon: Settings },
  { id: 'smtp', title: 'Configuration Email', icon: Mail },
  { id: 'payments', title: 'APIs Paiement', icon: Key },
  { id: 'admin', title: 'Compte Admin', icon: User },
  { id: 'finalize', title: 'Finalisation', icon: CheckCircle },
];

export default function Install() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [installationData, setInstallationData] = useState<InstallationData>({
    database: {
      host: 'localhost',
      port: '3306',
      name: '',
      username: '',
      password: '',
    },
    app: {
      name: 'Exchange Pro',
      url: window.location.origin,
      timezone: 'UTC',
    },
    smtp: {
      host: '',
      port: '587',
      username: '',
      password: '',
      encryption: 'tls',
      from_email: '',
      from_name: 'Exchange Pro',
    },
    payments: {
      moneroo_api_key: '',
      moneroo_secret_key: '',
      nowpayments_api_key: '',
      nowpayments_secret_key: '',
    },
    admin: {
      email: '',
      password: '',
      display_name: 'Administrator',
    },
  });

  const { toast } = useToast();

  const updateInstallationData = (section: keyof InstallationData, field: string, value: string) => {
    setInstallationData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const callInstallAPI = async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`/api/install/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Erreur lors de ${endpoint}`);
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleStepSubmit = async () => {
    setLoading(true);
    const step = INSTALLATION_STEPS[currentStep];

    try {
      switch (step.id) {
        case 'requirements':
          await callInstallAPI('check-requirements', {});
          break;
        case 'database':
          await callInstallAPI('test-database', installationData.database);
          await callInstallAPI('run-migrations', installationData.database);
          break;
        case 'app':
          await callInstallAPI('configure-app', installationData.app);
          break;
        case 'smtp':
          await callInstallAPI('configure-smtp', installationData.smtp);
          break;
        case 'payments':
          await callInstallAPI('configure-payments', installationData.payments);
          break;
        case 'admin':
          await callInstallAPI('create-admin', installationData.admin);
          break;
        case 'finalize':
          await callInstallAPI('finalize', {});
          toast({
            title: "Installation terminée !",
            description: "Votre application est maintenant prête à être utilisée.",
          });
          window.location.href = '/admin';
          return;
      }

      setCompletedSteps(prev => [...prev, step.id]);
      setCurrentStep(prev => prev + 1);
      
      toast({
        title: "Étape terminée",
        description: `${step.title} configurée avec succès.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = INSTALLATION_STEPS[currentStep];

    switch (step.id) {
      case 'requirements':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Vérification des prérequis système...
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>PHP 8.1+</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>MySQL 5.7+</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Extensions PHP requises</span>
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="db_host">Serveur</Label>
                <Input
                  id="db_host"
                  value={installationData.database.host}
                  onChange={(e) => updateInstallationData('database', 'host', e.target.value)}
                  placeholder="localhost"
                />
              </div>
              <div>
                <Label htmlFor="db_port">Port</Label>
                <Input
                  id="db_port"
                  value={installationData.database.port}
                  onChange={(e) => updateInstallationData('database', 'port', e.target.value)}
                  placeholder="3306"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="db_name">Nom de la base</Label>
              <Input
                id="db_name"
                value={installationData.database.name}
                onChange={(e) => updateInstallationData('database', 'name', e.target.value)}
                placeholder="exchange_pro"
              />
            </div>
            <div>
              <Label htmlFor="db_username">Utilisateur</Label>
              <Input
                id="db_username"
                value={installationData.database.username}
                onChange={(e) => updateInstallationData('database', 'username', e.target.value)}
                placeholder="root"
              />
            </div>
            <div>
              <Label htmlFor="db_password">Mot de passe</Label>
              <Input
                id="db_password"
                type="password"
                value={installationData.database.password}
                onChange={(e) => updateInstallationData('database', 'password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
        );

      case 'app':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="app_name">Nom de l'application</Label>
              <Input
                id="app_name"
                value={installationData.app.name}
                onChange={(e) => updateInstallationData('app', 'name', e.target.value)}
                placeholder="Exchange Pro"
              />
            </div>
            <div>
              <Label htmlFor="app_url">URL de l'application</Label>
              <Input
                id="app_url"
                value={installationData.app.url}
                onChange={(e) => updateInstallationData('app', 'url', e.target.value)}
                placeholder="https://votre-domaine.com"
              />
            </div>
            <div>
              <Label htmlFor="app_timezone">Fuseau horaire</Label>
              <Select value={installationData.app.timezone} onValueChange={(value) => updateInstallationData('app', 'timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="Africa/Casablanca">Africa/Casablanca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'smtp':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_host">Serveur SMTP</Label>
                <Input
                  id="smtp_host"
                  value={installationData.smtp.host}
                  onChange={(e) => updateInstallationData('smtp', 'host', e.target.value)}
                  placeholder="mail.votredomaine.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_port">Port</Label>
                <Select value={installationData.smtp.port} onValueChange={(value) => updateInstallationData('smtp', 'port', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="587">587 (TLS)</SelectItem>
                    <SelectItem value="465">465 (SSL)</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="smtp_username">Email utilisateur</Label>
              <Input
                id="smtp_username"
                type="email"
                value={installationData.smtp.username}
                onChange={(e) => updateInstallationData('smtp', 'username', e.target.value)}
                placeholder="noreply@votredomaine.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp_password">Mot de passe email</Label>
              <Input
                id="smtp_password"
                type="password"
                value={installationData.smtp.password}
                onChange={(e) => updateInstallationData('smtp', 'password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_from_email">Email expéditeur</Label>
                <Input
                  id="smtp_from_email"
                  type="email"
                  value={installationData.smtp.from_email}
                  onChange={(e) => updateInstallationData('smtp', 'from_email', e.target.value)}
                  placeholder="noreply@votredomaine.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_from_name">Nom expéditeur</Label>
                <Input
                  id="smtp_from_name"
                  value={installationData.smtp.from_name}
                  onChange={(e) => updateInstallationData('smtp', 'from_name', e.target.value)}
                  placeholder="Exchange Pro"
                />
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Configuration Moneroo</h4>
              <div>
                <Label htmlFor="moneroo_api_key">Clé API Moneroo</Label>
                <Input
                  id="moneroo_api_key"
                  value={installationData.payments.moneroo_api_key}
                  onChange={(e) => updateInstallationData('payments', 'moneroo_api_key', e.target.value)}
                  placeholder="mk_live_..."
                />
              </div>
              <div>
                <Label htmlFor="moneroo_secret_key">Clé secrète Moneroo</Label>
                <Input
                  id="moneroo_secret_key"
                  type="password"
                  value={installationData.payments.moneroo_secret_key}
                  onChange={(e) => updateInstallationData('payments', 'moneroo_secret_key', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Configuration NOWPayments</h4>
              <div>
                <Label htmlFor="nowpayments_api_key">Clé API NOWPayments</Label>
                <Input
                  id="nowpayments_api_key"
                  value={installationData.payments.nowpayments_api_key}
                  onChange={(e) => updateInstallationData('payments', 'nowpayments_api_key', e.target.value)}
                  placeholder="API Key"
                />
              </div>
              <div>
                <Label htmlFor="nowpayments_secret_key">Clé secrète NOWPayments</Label>
                <Input
                  id="nowpayments_secret_key"
                  type="password"
                  value={installationData.payments.nowpayments_secret_key}
                  onChange={(e) => updateInstallationData('payments', 'nowpayments_secret_key', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_email">Email administrateur</Label>
              <Input
                id="admin_email"
                type="email"
                value={installationData.admin.email}
                onChange={(e) => updateInstallationData('admin', 'email', e.target.value)}
                placeholder="admin@votredomaine.com"
              />
            </div>
            <div>
              <Label htmlFor="admin_password">Mot de passe</Label>
              <Input
                id="admin_password"
                type="password"
                value={installationData.admin.password}
                onChange={(e) => updateInstallationData('admin', 'password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="admin_display_name">Nom d'affichage</Label>
              <Input
                id="admin_display_name"
                value={installationData.admin.display_name}
                onChange={(e) => updateInstallationData('admin', 'display_name', e.target.value)}
                placeholder="Administrator"
              />
            </div>
          </div>
        );

      case 'finalize':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Installation terminée !</h3>
              <p className="text-muted-foreground">
                Votre application Exchange Pro est maintenant configurée et prête à être utilisée.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / INSTALLATION_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Installation Exchange Pro</h1>
          <p className="text-muted-foreground mt-2">
            Configuration automatique de votre plateforme d'échange
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(INSTALLATION_STEPS[currentStep].icon, { className: "h-5 w-5" })}
                  {INSTALLATION_STEPS[currentStep].title}
                </CardTitle>
                <CardDescription>
                  Étape {currentStep + 1} sur {INSTALLATION_STEPS.length}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-lg font-semibold">{Math.round(progress)}%</div>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                {INSTALLATION_STEPS.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = index === currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent 
                            ? 'border-primary text-primary' 
                            : 'border-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-semibold">{index + 1}</span>
                        )}
                      </div>
                      {index < INSTALLATION_STEPS.length - 1 && (
                        <div className={`w-8 h-0.5 ${
                          isCompleted ? 'bg-green-500' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="min-h-[300px]">
              {renderStepContent()}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0 || loading}
              >
                Précédent
              </Button>
              
              <Button
                onClick={handleStepSubmit}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentStep === INSTALLATION_STEPS.length - 1 ? 'Terminer' : 'Suivant'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}