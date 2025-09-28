import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Save, 
  RefreshCw,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Copyright
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
  name: string;
  icon: React.ComponentType<any>;
}

interface FooterSettings {
  phone: string;
  email: string;
  address: string;
  copyright_year: string;
  social_links: SocialLink[];
}

const socialPlatforms: SocialLink[] = [
  { platform: 'facebook', url: '', enabled: false, name: 'Facebook', icon: Facebook },
  { platform: 'twitter', url: '', enabled: false, name: 'Twitter', icon: Twitter },
  { platform: 'instagram', url: '', enabled: false, name: 'Instagram', icon: Instagram },
  { platform: 'linkedin', url: '', enabled: false, name: 'LinkedIn', icon: Linkedin },
  { platform: 'youtube', url: '', enabled: false, name: 'YouTube', icon: Youtube },
];

export default function FooterConfiguration() {
  const { toast } = useToast();
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    phone: '+229 XX XX XX XX',
    email: 'contact@exchangepro.com',
    address: 'Cotonou, Bénin',
    copyright_year: '2025',
    social_links: socialPlatforms,
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadFooterSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/footer-settings');
      if (response.ok) {
        const data = await response.json();
        setFooterSettings(prev => ({
          ...prev,
          ...data,
          social_links: data.social_links ? data.social_links.map((link: any) => ({
            ...link,
            icon: socialPlatforms.find(p => p.platform === link.platform)?.icon || Globe,
            name: socialPlatforms.find(p => p.platform === link.platform)?.name || link.platform,
          })) : prev.social_links,
        }));
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFooterSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/footer-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(footerSettings),
      });

      if (response.ok) {
        setHasChanges(false);
        toast({
          title: "Configuration sauvegardée",
          description: "Les paramètres du pied de page ont été mis à jour avec succès.",
        });
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres du pied de page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof FooterSettings, value: any) => {
    setFooterSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateSocialLink = (platform: string, field: 'url' | 'enabled', value: string | boolean) => {
    setFooterSettings(prev => ({
      ...prev,
      social_links: prev.social_links.map(link =>
        link.platform === platform ? { ...link, [field]: value } : link
      ),
    }));
    setHasChanges(true);
  };

  useEffect(() => {
    loadFooterSettings();
  }, []);

  if (loading && !footerSettings.phone) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuration Pied de Page</h2>
          <p className="text-muted-foreground">
            Gérez les informations de contact et les liens des réseaux sociaux
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary">Modifications non sauvegardées</Badge>
          )}
          
          <Button 
            onClick={() => {
              loadFooterSettings();
              setHasChanges(false);
            }} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          
          <Button 
            onClick={saveFooterSettings} 
            disabled={loading || !hasChanges}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Réseaux Sociaux
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Copyright className="w-4 h-4" />
            Légal
          </TabsTrigger>
        </TabsList>

        {/* Informations de contact */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Informations de Contact
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront dans le pied de page de votre site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={footerSettings.phone}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    placeholder="+229 XX XX XX XX"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={footerSettings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    placeholder="contact@exchangepro.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse physique</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={footerSettings.address}
                    onChange={(e) => updateSetting('address', e.target.value)}
                    placeholder="Cotonou, Bénin"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Réseaux sociaux */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Réseaux Sociaux
              </CardTitle>
              <CardDescription>
                Configurez les liens vers vos réseaux sociaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {footerSettings.social_links.map((link) => {
                const IconComponent = link.icon;
                return (
                  <div key={link.platform} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
                      
                      <div className="min-w-0 flex-1">
                        <Label htmlFor={`${link.platform}_url`} className="font-medium">
                          {link.name}
                        </Label>
                        <Input
                          id={`${link.platform}_url`}
                          value={link.url}
                          onChange={(e) => updateSocialLink(link.platform, 'url', e.target.value)}
                          placeholder={`https://${link.platform}.com/votre-page`}
                          className="mt-1"
                          disabled={!link.enabled}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${link.platform}_enabled`} className="text-sm">
                        Activer
                      </Label>
                      <Switch
                        id={`${link.platform}_enabled`}
                        checked={link.enabled}
                        onCheckedChange={(checked) => updateSocialLink(link.platform, 'enabled', checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Légal */}
        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copyright className="w-5 h-5" />
                Informations Légales
              </CardTitle>
              <CardDescription>
                Configurez les informations légales et le copyright
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="copyright_year">Année de copyright</Label>
                <Input
                  id="copyright_year"
                  value={footerSettings.copyright_year}
                  onChange={(e) => updateSetting('copyright_year', e.target.value)}
                  placeholder="2025"
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Cette année apparaîtra dans le copyright du pied de page
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Liens légaux disponibles</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Politique de confidentialité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Conditions d'utilisation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sécurité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}