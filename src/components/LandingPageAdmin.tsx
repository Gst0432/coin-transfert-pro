import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save,
  RefreshCw,
  Palette,
  Image,
  Type,
  Globe,
  Users,
  Mail,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLandingPageSettings, LandingPageSettings } from '@/hooks/useLandingPageSettings';

export default function LandingPageAdmin() {
  const { settings, isLoading, updateMultipleSettings, refreshSettings } = useLandingPageSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateLocalSetting = (key: keyof LandingPageSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMultipleSettings(localSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    toast({
      title: "Paramètres réinitialisés",
      description: "Les modifications non sauvegardées ont été annulées",
    });
  };

  const addNavItem = () => {
    const newNavItems = [...localSettings.nav_items, { label: 'Nouveau', href: '#' }];
    updateLocalSetting('nav_items', newNavItems);
  };

  const removeNavItem = (index: number) => {
    const newNavItems = localSettings.nav_items.filter((_, i) => i !== index);
    updateLocalSetting('nav_items', newNavItems);
  };

  const updateNavItem = (index: number, field: 'label' | 'href', value: string) => {
    const newNavItems = [...localSettings.nav_items];
    newNavItems[index][field] = value;
    updateLocalSetting('nav_items', newNavItems);
  };

  const addServiceItem = () => {
    const newServices = [...localSettings.services_items, {
      title: 'Nouveau Service',
      description: 'Description du service',
      icon: 'Shield'
    }];
    updateLocalSetting('services_items', newServices);
  };

  const removeServiceItem = (index: number) => {
    const newServices = localSettings.services_items.filter((_, i) => i !== index);
    updateLocalSetting('services_items', newServices);
  };

  const updateServiceItem = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    const newServices = [...localSettings.services_items];
    newServices[index][field] = value;
    updateLocalSetting('services_items', newServices);
  };

  const addPartnerItem = () => {
    const newPartners = [...localSettings.partners_items, {
      name: 'Nouveau Partenaire',
      logo: '/placeholder.svg'
    }];
    updateLocalSetting('partners_items', newPartners);
  };

  const removePartnerItem = (index: number) => {
    const newPartners = localSettings.partners_items.filter((_, i) => i !== index);
    updateLocalSetting('partners_items', newPartners);
  };

  const updatePartnerItem = (index: number, field: 'name' | 'logo', value: string) => {
    const newPartners = [...localSettings.partners_items];
    newPartners[index][field] = value;
    updateLocalSetting('partners_items', newPartners);
  };

  const addSocialLink = () => {
    const newSocial = [...localSettings.social_links, {
      platform: 'Nouveau',
      url: '#',
      icon: 'Globe'
    }];
    updateLocalSetting('social_links', newSocial);
  };

  const removeSocialLink = (index: number) => {
    const newSocial = localSettings.social_links.filter((_, i) => i !== index);
    updateLocalSetting('social_links', newSocial);
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url' | 'icon', value: string) => {
    const newSocial = [...localSettings.social_links];
    newSocial[index][field] = value;
    updateLocalSetting('social_links', newSocial);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuration Landing Page</h2>
          <p className="text-muted-foreground">
            Personnalisez entièrement votre page d'accueil
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* Onglet Branding */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Identité de Marque
              </CardTitle>
              <CardDescription>
                Configurez le nom, le slogan et les logos de votre plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="site_name">Nom du Site</Label>
                  <Input
                    id="site_name"
                    value={localSettings.site_name}
                    onChange={(e) => updateLocalSetting('site_name', e.target.value)}
                    placeholder="Exchange Pro"
                  />
                </div>

                <div>
                  <Label htmlFor="site_tagline">Slogan</Label>
                  <Input
                    id="site_tagline"
                    value={localSettings.site_tagline}
                    onChange={(e) => updateLocalSetting('site_tagline', e.target.value)}
                    placeholder="Plateforme d'échange crypto sécurisée"
                  />
                </div>

                <div>
                  <Label htmlFor="main_logo_url">Logo Principal (URL)</Label>
                  <Input
                    id="main_logo_url"
                    value={localSettings.main_logo_url}
                    onChange={(e) => updateLocalSetting('main_logo_url', e.target.value)}
                    placeholder="/placeholder.svg"
                  />
                </div>

                <div>
                  <Label htmlFor="dashboard_logo_url">Logo Dashboard (URL)</Label>
                  <Input
                    id="dashboard_logo_url"
                    value={localSettings.dashboard_logo_url}
                    onChange={(e) => updateLocalSetting('dashboard_logo_url', e.target.value)}
                    placeholder="/placeholder.svg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Couleurs */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Palette de Couleurs
              </CardTitle>
              <CardDescription>
                Définissez les couleurs principales de votre plateforme (format HSL sans hsl())
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="primary_color">Couleur Primaire</Label>
                  <Input
                    id="primary_color"
                    value={localSettings.primary_color}
                    onChange={(e) => updateLocalSetting('primary_color', e.target.value)}
                    placeholder="220 90% 56%"
                  />
                  <div 
                    className="mt-2 h-8 w-full rounded border"
                    style={{ backgroundColor: `hsl(${localSettings.primary_color})` }}
                  />
                </div>

                <div>
                  <Label htmlFor="secondary_color">Couleur Secondaire</Label>
                  <Input
                    id="secondary_color"
                    value={localSettings.secondary_color}
                    onChange={(e) => updateLocalSetting('secondary_color', e.target.value)}
                    placeholder="220 14% 96%"
                  />
                  <div 
                    className="mt-2 h-8 w-full rounded border"
                    style={{ backgroundColor: `hsl(${localSettings.secondary_color})` }}
                  />
                </div>

                <div>
                  <Label htmlFor="accent_color">Couleur d'Accent</Label>
                  <Input
                    id="accent_color"
                    value={localSettings.accent_color}
                    onChange={(e) => updateLocalSetting('accent_color', e.target.value)}
                    placeholder="24 95% 53%"
                  />
                  <div 
                    className="mt-2 h-8 w-full rounded border"
                    style={{ backgroundColor: `hsl(${localSettings.accent_color})` }}
                  />
                </div>

                <div>
                  <Label htmlFor="background_color">Couleur de Fond</Label>
                  <Input
                    id="background_color"
                    value={localSettings.background_color}
                    onChange={(e) => updateLocalSetting('background_color', e.target.value)}
                    placeholder="0 0% 100%"
                  />
                  <div 
                    className="mt-2 h-8 w-full rounded border"
                    style={{ backgroundColor: `hsl(${localSettings.background_color})` }}
                  />
                </div>

                <div>
                  <Label htmlFor="text_color">Couleur du Texte</Label>
                  <Input
                    id="text_color"
                    value={localSettings.text_color}
                    onChange={(e) => updateLocalSetting('text_color', e.target.value)}
                    placeholder="224 71% 4%"
                  />
                  <div 
                    className="mt-2 h-8 w-full rounded border"
                    style={{ backgroundColor: `hsl(${localSettings.text_color})` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Hero */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" />
                Section Hero
              </CardTitle>
              <CardDescription>
                Configurez la section principale de votre page d'accueil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="hero_title">Titre Principal</Label>
                <Input
                  id="hero_title"
                  value={localSettings.hero_title}
                  onChange={(e) => updateLocalSetting('hero_title', e.target.value)}
                  placeholder="Échangez vos cryptomonnaies en toute sécurité"
                />
              </div>

              <div>
                <Label htmlFor="hero_subtitle">Sous-titre</Label>
                <Textarea
                  id="hero_subtitle"
                  value={localSettings.hero_subtitle}
                  onChange={(e) => updateLocalSetting('hero_subtitle', e.target.value)}
                  placeholder="Description de votre plateforme"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="hero_cta_text">Texte Bouton Principal</Label>
                  <Input
                    id="hero_cta_text"
                    value={localSettings.hero_cta_text}
                    onChange={(e) => updateLocalSetting('hero_cta_text', e.target.value)}
                    placeholder="Commencer maintenant"
                  />
                </div>

                <div>
                  <Label htmlFor="hero_secondary_cta_text">Texte Bouton Secondaire</Label>
                  <Input
                    id="hero_secondary_cta_text"
                    value={localSettings.hero_secondary_cta_text}
                    onChange={(e) => updateLocalSetting('hero_secondary_cta_text', e.target.value)}
                    placeholder="En savoir plus"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hero_background_image">Image de Fond Hero (URL)</Label>
                <Input
                  id="hero_background_image"
                  value={localSettings.hero_background_image}
                  onChange={(e) => updateLocalSetting('hero_background_image', e.target.value)}
                  placeholder="https://example.com/hero-bg.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Navigation */}
        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Navigation
              </CardTitle>
              <CardDescription>
                Gérez les éléments de navigation de votre site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {localSettings.nav_items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <Input
                      value={item.label}
                      onChange={(e) => updateNavItem(index, 'label', e.target.value)}
                      placeholder="Label"
                    />
                    <Input
                      value={item.href}
                      onChange={(e) => updateNavItem(index, 'href', e.target.value)}
                      placeholder="Lien"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeNavItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addNavItem} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un élément de navigation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Services */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Services
              </CardTitle>
              <CardDescription>
                Configurez la section des services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="services_title">Titre Section Services</Label>
                  <Input
                    id="services_title"
                    value={localSettings.services_title}
                    onChange={(e) => updateLocalSetting('services_title', e.target.value)}
                    placeholder="Nos Services"
                  />
                </div>

                <div>
                  <Label htmlFor="services_subtitle">Sous-titre Services</Label>
                  <Input
                    id="services_subtitle"
                    value={localSettings.services_subtitle}
                    onChange={(e) => updateLocalSetting('services_subtitle', e.target.value)}
                    placeholder="Découvrez nos solutions"
                  />
                </div>
              </div>

              <Separator />

              {localSettings.services_items.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Service {index + 1}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeServiceItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={service.title}
                      onChange={(e) => updateServiceItem(index, 'title', e.target.value)}
                      placeholder="Titre du service"
                    />
                    <Input
                      value={service.icon}
                      onChange={(e) => updateServiceItem(index, 'icon', e.target.value)}
                      placeholder="Nom de l'icône"
                    />
                    <Input
                      value={service.description}
                      onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                </div>
              ))}

              <Button onClick={addServiceItem} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Contenu */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section À Propos & Partenaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="about_title">Titre À Propos</Label>
                <Input
                  id="about_title"
                  value={localSettings.about_title}
                  onChange={(e) => updateLocalSetting('about_title', e.target.value)}
                  placeholder="À Propos de Nous"
                />
              </div>

              <div>
                <Label htmlFor="about_content">Contenu À Propos</Label>
                <Textarea
                  id="about_content"
                  value={localSettings.about_content}
                  onChange={(e) => updateLocalSetting('about_content', e.target.value)}
                  placeholder="Description de votre entreprise"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="about_image">Image À Propos (URL)</Label>
                <Input
                  id="about_image"
                  value={localSettings.about_image}
                  onChange={(e) => updateLocalSetting('about_image', e.target.value)}
                  placeholder="/placeholder.svg"
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="partners_title">Titre Partenaires</Label>
                <Input
                  id="partners_title"
                  value={localSettings.partners_title}
                  onChange={(e) => updateLocalSetting('partners_title', e.target.value)}
                  placeholder="Nos Partenaires"
                />
              </div>

              {localSettings.partners_items.map((partner, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <Input
                      value={partner.name}
                      onChange={(e) => updatePartnerItem(index, 'name', e.target.value)}
                      placeholder="Nom du partenaire"
                    />
                    <Input
                      value={partner.logo}
                      onChange={(e) => updatePartnerItem(index, 'logo', e.target.value)}
                      placeholder="URL du logo"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePartnerItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button onClick={addPartnerItem} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un partenaire
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Footer */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Footer & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="footer_description">Description Footer</Label>
                <Textarea
                  id="footer_description"
                  value={localSettings.footer_description}
                  onChange={(e) => updateLocalSetting('footer_description', e.target.value)}
                  placeholder="Description de votre plateforme"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="contact_phone">Téléphone</Label>
                  <Input
                    id="contact_phone"
                    value={localSettings.contact_phone}
                    onChange={(e) => updateLocalSetting('contact_phone', e.target.value)}
                    placeholder="+229 XX XX XX XX"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={localSettings.contact_email}
                    onChange={(e) => updateLocalSetting('contact_email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_address">Adresse</Label>
                  <Input
                    id="contact_address"
                    value={localSettings.contact_address}
                    onChange={(e) => updateLocalSetting('contact_address', e.target.value)}
                    placeholder="Cotonou, Bénin"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Réseaux Sociaux</h4>
                {localSettings.social_links.map((social, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg mb-4">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <Input
                        value={social.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        placeholder="Plateforme"
                      />
                      <Input
                        value={social.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        placeholder="URL"
                      />
                      <Input
                        value={social.icon}
                        onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                        placeholder="Icône"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSocialLink(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addSocialLink} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un réseau social
                </Button>
              </div>

              <div>
                <Label htmlFor="copyright_text">Copyright</Label>
                <Input
                  id="copyright_text"
                  value={localSettings.copyright_text}
                  onChange={(e) => updateLocalSetting('copyright_text', e.target.value)}
                  placeholder="© 2024 Exchange Pro. Tous droits réservés."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}