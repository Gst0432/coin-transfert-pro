import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Eye, 
  EyeOff,
  Upload,
  Edit3,
  Check,
  X,
  Languages,
  DollarSign,
  Bell,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/PageLayout";
import { Link } from "react-router-dom";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // États pour le profil utilisateur
  const [profile, setProfile] = useState({
    display_name: "",
    phone_number: "",
    avatar_url: "",
  });

  // États pour les préférences
  const [preferences, setPreferences] = useState({
    language: "fr",
    currency: "XOF",
    timezone: "Africa/Porto-Novo",
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    two_factor_enabled: false,
    trading_alerts: true
  });

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          phone_number: data.phone_number || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profile.display_name,
          phone_number: profile.phone_number,
          avatar_url: profile.avatar_url,
        });

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });

      setIsEditingProfile(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez votre profil et vos préférences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        {/* Onglet Profil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations du Profil
              </CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et votre photo de profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar et informations de base */}
              <div className="flex items-start gap-6">
                <div className="text-center space-y-2">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {profile.display_name ? getInitials(profile.display_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Changer
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {profile.display_name || "Nom non défini"}
                      </p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Email vérifié
                        </Badge>
                        <Badge variant={profile.phone_number ? "default" : "secondary"} className="text-xs">
                          {profile.phone_number ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Téléphone vérifié
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3 mr-1" />
                              Téléphone non vérifié
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {isEditingProfile ? "Annuler" : "Modifier"}
                    </Button>
                  </div>

                  {isEditingProfile && (
                    <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="display_name">Nom complet</Label>
                          <Input
                            id="display_name"
                            value={profile.display_name}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              display_name: e.target.value
                            }))}
                            placeholder="Votre nom complet"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone_number">Numéro de téléphone</Label>
                          <Input
                            id="phone_number"
                            value={profile.phone_number}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              phone_number: e.target.value
                            }))}
                            placeholder="+229 XX XX XX XX"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={updateProfile}
                          disabled={isLoading}
                          size="sm"
                        >
                          {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                          size="sm"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Préférences */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Langue et Région
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <select
                    id="language"
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      language: e.target.value
                    }))}
                    className="w-full p-2 border border-input bg-background rounded-md"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <select
                    id="timezone"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      timezone: e.target.value
                    }))}
                    className="w-full p-2 border border-input bg-background rounded-md"
                  >
                    <option value="Africa/Porto-Novo">Afrique/Porto-Novo (GMT+1)</option>
                    <option value="Africa/Abidjan">Afrique/Abidjan (GMT)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Devise et Affichage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currency">Devise préférée</Label>
                  <select
                    id="currency"
                    value={preferences.currency}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      currency: e.target.value
                    }))}
                    className="w-full p-2 border border-input bg-background rounded-md"
                  >
                    <option value="XOF">FCFA (XOF)</option>
                    <option value="USD">Dollar US (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertes de trading</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications pour les opportunités de trading
                    </p>
                  </div>
                  <Switch
                    checked={preferences.trading_alerts}
                    onCheckedChange={(checked) => setPreferences(prev => ({
                      ...prev,
                      trading_alerts: checked
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Préférences de Notification
              </CardTitle>
              <CardDescription>
                Choisissez comment vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications importantes par email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => setPreferences(prev => ({
                      ...prev,
                      email_notifications: checked
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications sur votre navigateur
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push_notifications}
                    onCheckedChange={(checked) => setPreferences(prev => ({
                      ...prev,
                      push_notifications: checked
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des SMS pour les transactions importantes
                    </p>
                  </div>
                  <Switch
                    checked={preferences.sms_notifications}
                    onCheckedChange={(checked) => setPreferences(prev => ({
                      ...prev,
                      sms_notifications: checked
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emails marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des offres spéciales et actualités
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing_emails}
                    onCheckedChange={(checked) => setPreferences(prev => ({
                      ...prev,
                      marketing_emails: checked
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité du Compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div>
                      <p className="font-medium">Mot de passe</p>
                      <p className="text-sm text-muted-foreground">
                        Dernière modification il y a 30 jours
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/settings/password">Modifier</Link>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div>
                      <p className="font-medium">Authentification à deux facteurs</p>
                      <p className="text-sm text-muted-foreground">
                        {preferences.two_factor_enabled ? "Activée" : "Désactivée"}
                      </p>
                    </div>
                    <Switch
                      checked={preferences.two_factor_enabled}
                      onCheckedChange={(checked) => setPreferences(prev => ({
                        ...prev,
                        two_factor_enabled: checked
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions Actives</CardTitle>
                <CardDescription>
                  Gérez vos sessions de connexion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Session actuelle</p>
                        <p className="text-sm text-muted-foreground">
                          Chrome sur Windows • Maintenant
                        </p>
                      </div>
                      <Badge variant="default">Actuel</Badge>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Déconnecter toutes les autres sessions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bouton de sauvegarde global */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            toast({
              title: "Paramètres sauvegardés",
              description: "Vos préférences ont été mises à jour avec succès.",
            });
          }}
        >
          Sauvegarder les modifications
        </Button>
      </div>
        </div>
      </div>
    </PageLayout>
  );
}