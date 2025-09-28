import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  DollarSign, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Trash2,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  category: 'transaction' | 'security' | 'system' | 'promotion';
  timestamp: string;
  read: boolean;
  important: boolean;
}

export default function Notifications() {
  const { toast } = useToast();
  
  // États pour les préférences de notifications
  const [notificationSettings, setNotificationSettings] = useState({
    // Notifications par email
    email_transactions: true,
    email_security: true,
    email_promotions: false,
    email_system: true,
    
    // Notifications push
    push_transactions: true,
    push_security: true,
    push_promotions: false,
    push_system: true,
    
    // Notifications SMS
    sms_transactions: false,
    sms_security: true,
    sms_promotions: false,
    
    // Paramètres généraux
    sound_enabled: true,
    digest_frequency: 'daily', // 'realtime', 'daily', 'weekly'
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });

  // Notifications récentes mockées
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Transaction réussie',
      message: 'Votre échange de 100 USDT vers 65,000 FCFA a été complété avec succès.',
      type: 'success',
      category: 'transaction',
      timestamp: '2024-01-15T14:30:00Z',
      read: false,
      important: false
    },
    {
      id: '2',
      title: 'Nouvelle connexion détectée',
      message: 'Une nouvelle connexion depuis Chrome sur Windows a été détectée.',
      type: 'warning',
      category: 'security',
      timestamp: '2024-01-15T12:15:00Z',
      read: false,
      important: true
    },
    {
      id: '3',
      title: 'Mise à jour système',
      message: 'La plateforme sera en maintenance programmée le 20 janvier de 02h00 à 04h00.',
      type: 'info',
      category: 'system',
      timestamp: '2024-01-15T10:00:00Z',
      read: true,
      important: false
    },
    {
      id: '4',
      title: 'Offre spéciale',
      message: 'Profitez de 0% de frais sur vos 5 prochaines transactions !',
      type: 'info',
      category: 'promotion',
      timestamp: '2024-01-15T09:30:00Z',
      read: true,
      important: false
    },
    {
      id: '5',
      title: 'Transaction en attente',
      message: 'Votre transaction de 50 USDT nécessite une vérification supplémentaire.',
      type: 'warning',
      category: 'transaction',
      timestamp: '2024-01-14T16:45:00Z',
      read: true,
      important: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const importantCount = notifications.filter(n => n.important && !n.read).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'security') return <Shield className="w-4 h-4" />;
    if (category === 'transaction') return <DollarSign className="w-4 h-4" />;
    if (category === 'promotion') return <TrendingUp className="w-4 h-4" />;
    
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "Notifications marquées",
      description: "Toutes les notifications ont été marquées comme lues.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée avec succès.",
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notifications effacées",
      description: "Toutes les notifications ont été supprimées.",
    });
  };

  const updateSetting = (key: keyof typeof notificationSettings, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences de notification ont été mises à jour.",
    });
  };

  const testNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Test de notification', {
            body: 'Ceci est un test de notification push.',
            icon: '/favicon.ico'
          });
        }
      });
    }
    toast({
      title: "Notification de test envoyée",
      description: "Vérifiez si vous avez reçu la notification.",
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Gérez vos notifications et préférences
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} non lues</Badge>
          )}
          {importantCount > 0 && (
            <Badge variant="outline">{importantCount} importantes</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Actions rapides */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {unreadCount > 0 
                        ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                        : 'Toutes les notifications sont lues'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marquer toutes comme lues
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Tout effacer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des notifications */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Aucune notification
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.read 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'hover:bg-secondary/50'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'success' ? 'bg-success/10' :
                        notification.type === 'warning' ? 'bg-warning/10' :
                        notification.type === 'error' ? 'bg-destructive/10' :
                        'bg-primary/10'
                      }`}>
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">
                                {notification.title}
                              </h4>
                              {notification.important && (
                                <Badge variant="destructive" className="text-xs">
                                  Important
                                </Badge>
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(notification.timestamp)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications par Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Notifications par Email
                </CardTitle>
                <CardDescription>
                  Configurez les notifications que vous souhaitez recevoir par email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Transactions</Label>
                      <p className="text-sm text-muted-foreground">
                        Confirmations et échecs de transactions
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_transactions}
                      onCheckedChange={(checked) => updateSetting('email_transactions', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sécurité</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes de sécurité et nouvelles connexions
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_security}
                      onCheckedChange={(checked) => updateSetting('email_security', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Système</Label>
                      <p className="text-sm text-muted-foreground">
                        Maintenances et mises à jour importantes
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_system}
                      onCheckedChange={(checked) => updateSetting('email_system', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Promotions</Label>
                      <p className="text-sm text-muted-foreground">
                        Offres spéciales et actualités
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_promotions}
                      onCheckedChange={(checked) => updateSetting('email_promotions', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Push */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Notifications Push
                </CardTitle>
                <CardDescription>
                  Notifications instantanées sur votre navigateur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Transactions</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications immédiates des transactions
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_transactions}
                      onCheckedChange={(checked) => updateSetting('push_transactions', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sécurité</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes de sécurité critiques
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_security}
                      onCheckedChange={(checked) => updateSetting('push_security', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Système</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes système importantes
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_system}
                      onCheckedChange={(checked) => updateSetting('push_system', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Promotions</Label>
                      <p className="text-sm text-muted-foreground">
                        Offres limitées dans le temps
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_promotions}
                      onCheckedChange={(checked) => updateSetting('push_promotions', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <Button variant="outline" onClick={testNotification} className="w-full">
                  Tester les notifications push
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Paramètres généraux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres Généraux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Son des notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Jouer un son pour les notifications importantes
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.sound_enabled}
                      onCheckedChange={(checked) => updateSetting('sound_enabled', checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="digest_frequency">Fréquence des résumés</Label>
                    <select
                      id="digest_frequency"
                      value={notificationSettings.digest_frequency}
                      onChange={(e) => updateSetting('digest_frequency', e.target.value)}
                      className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                    >
                      <option value="realtime">Temps réel</option>
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Heures de silence</Label>
                      <p className="text-sm text-muted-foreground">
                        Suspendre les notifications non critiques
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.quiet_hours_enabled}
                      onCheckedChange={(checked) => updateSetting('quiet_hours_enabled', checked)}
                    />
                  </div>

                  {notificationSettings.quiet_hours_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quiet_start">Début</Label>
                        <input
                          type="time"
                          id="quiet_start"
                          value={notificationSettings.quiet_hours_start}
                          onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                          className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quiet_end">Fin</Label>
                        <input
                          type="time"
                          id="quiet_end"
                          value={notificationSettings.quiet_hours_end}
                          onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                          className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              Sauvegarder les paramètres
            </Button>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}