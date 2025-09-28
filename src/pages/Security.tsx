import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Eye, 
  AlertTriangle,
  Check,
  Clock,
  MapPin,
  Monitor,
  Key,
  Download,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";

export default function Security() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour les paramètres de sécurité
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    sms_verification: false,
    email_verification: true,
    login_alerts: true,
    suspicious_activity_alerts: true,
    session_timeout: 30, // minutes
    require_password_for_transactions: true,
    whitelist_enabled: false,
  });

  // Sessions actives mockées
  const [activeSessions] = useState([
    {
      id: '1',
      device: 'Chrome sur Windows',
      location: 'Cotonou, Bénin',
      ip: '192.168.1.1',
      last_active: '2024-01-15T10:30:00Z',
      is_current: true
    },
    {
      id: '2',
      device: 'Safari sur iPhone',
      location: 'Lagos, Nigeria',
      ip: '192.168.1.2',
      last_active: '2024-01-14T15:45:00Z',
      is_current: false
    },
    {
      id: '3',
      device: 'Firefox sur Ubuntu',
      location: 'Accra, Ghana',
      ip: '192.168.1.3',
      last_active: '2024-01-13T09:15:00Z',
      is_current: false
    }
  ]);

  // Activités récentes mockées
  const [recentActivity] = useState([
    {
      id: '1',
      type: 'login',
      description: 'Connexion réussie',
      timestamp: '2024-01-15T10:30:00Z',
      location: 'Cotonou, Bénin',
      status: 'success'
    },
    {
      id: '2',
      type: 'password_change',
      description: 'Mot de passe modifié',
      timestamp: '2024-01-14T14:20:00Z',
      location: 'Cotonou, Bénin',
      status: 'success'
    },
    {
      id: '3',
      type: 'failed_login',
      description: 'Tentative de connexion échouée',
      timestamp: '2024-01-13T22:10:00Z',
      location: 'Inconnu',
      status: 'warning'
    },
    {
      id: '4',
      type: 'transaction',
      description: 'Transaction de 100 USDT',
      timestamp: '2024-01-13T16:45:00Z',
      location: 'Cotonou, Bénin',
      status: 'success'
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-warning" />;
    
    switch (type) {
      case 'login':
        return <Check className="w-4 h-4 text-success" />;
      case 'password_change':
        return <Lock className="w-4 h-4 text-primary" />;
      case 'transaction':
        return <RefreshCw className="w-4 h-4 text-primary" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const enableTwoFactor = async () => {
    setIsLoading(true);
    try {
      // Simulation de l'activation 2FA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSecuritySettings(prev => ({
        ...prev,
        two_factor_enabled: true
      }));

      toast({
        title: "2FA activé",
        description: "L'authentification à deux facteurs a été activée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer l'authentification à deux facteurs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = (sessionId: string) => {
    toast({
      title: "Session terminée",
      description: "La session a été déconnectée avec succès.",
    });
  };

  const terminateAllSessions = () => {
    toast({
      title: "Sessions terminées",
      description: "Toutes les autres sessions ont été déconnectées.",
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sécurité</h1>
        <p className="text-muted-foreground">
          Protégez votre compte avec nos outils de sécurité avancés
        </p>
      </div>

      {/* Statut de sécurité global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Niveau de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 bg-secondary rounded-full flex-1">
                  <div className="h-full bg-success rounded-full w-4/5"></div>
                </div>
                <Badge variant="default">Élevé</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Votre compte est bien protégé. Activez l'authentification à deux facteurs pour une sécurité maximale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Authentification
            </CardTitle>
            <CardDescription>
              Gérez vos méthodes d'authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mot de passe */}
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <h4 className="font-medium">Mot de passe</h4>
                <p className="text-sm text-muted-foreground">
                  Dernière modification il y a 7 jours
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/settings/password">Modifier</Link>
              </Button>
            </div>

            {/* 2FA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Authentification à deux facteurs (2FA)</h4>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                </div>
                <Switch
                  checked={securitySettings.two_factor_enabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      enableTwoFactor();
                    } else {
                      setSecuritySettings(prev => ({
                        ...prev,
                        two_factor_enabled: false
                      }));
                    }
                  }}
                  disabled={isLoading}
                />
              </div>

              {!securitySettings.two_factor_enabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Nous recommandons fortement d'activer l'authentification à deux facteurs pour sécuriser votre compte.
                  </AlertDescription>
                </Alert>
              )}

              {securitySettings.two_factor_enabled && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">2FA activé</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Votre compte est protégé par l'authentification à deux facteurs.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Codes de secours
                    </Button>
                    <Button variant="outline" size="sm">
                      Reconfigurer
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Vérification SMS */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Vérification SMS</h4>
                <p className="text-sm text-muted-foreground">
                  Recevoir des codes par SMS
                </p>
              </div>
              <Switch
                checked={securitySettings.sms_verification}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({
                  ...prev,
                  sms_verification: checked
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de sécurité */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de Sécurité</CardTitle>
            <CardDescription>
              Configurez les options de sécurité avancées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertes de connexion</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié des nouvelles connexions
                  </p>
                </div>
                <Switch
                  checked={securitySettings.login_alerts}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({
                    ...prev,
                    login_alerts: checked
                  }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Détection d'activité suspecte</Label>
                  <p className="text-sm text-muted-foreground">
                    Surveillance automatique des activités inhabituelles
                  </p>
                </div>
                <Switch
                  checked={securitySettings.suspicious_activity_alerts}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({
                    ...prev,
                    suspicious_activity_alerts: checked
                  }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mot de passe pour transactions</Label>
                  <p className="text-sm text-muted-foreground">
                    Demander le mot de passe pour les transactions importantes
                  </p>
                </div>
                <Switch
                  checked={securitySettings.require_password_for_transactions}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({
                    ...prev,
                    require_password_for_transactions: checked
                  }))}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="session_timeout">Délai d'expiration de session</Label>
                <select
                  id="session_timeout"
                  value={securitySettings.session_timeout}
                  onChange={(e) => setSecuritySettings(prev => ({
                    ...prev,
                    session_timeout: Number(e.target.value)
                  }))}
                  className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 heure</option>
                  <option value={120}>2 heures</option>
                  <option value={480}>8 heures</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions actives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Sessions Actives
          </CardTitle>
          <CardDescription>
            Gérez vos sessions de connexion actives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                      <span>IP: {session.ip}</span>
                      <span>Dernière activité: {formatDate(session.last_active)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.is_current ? (
                    <Badge variant="default">Session actuelle</Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Terminer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <Button variant="destructive" onClick={terminateAllSessions}>
            <Trash2 className="w-4 h-4 mr-2" />
            Déconnecter toutes les autres sessions
          </Button>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activité Récente
          </CardTitle>
          <CardDescription>
            Consultez l'historique de sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg">
                {getActivityIcon(activity.type, activity.status)}
                <div className="flex-1">
                  <p className="font-medium">{activity.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatDate(activity.timestamp)}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full">
              Voir l'historique complet
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </PageLayout>
  );
}