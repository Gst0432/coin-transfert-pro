import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useBrandingSettings } from '@/hooks/useBrandingSettings';
import { Settings, Image, Globe, FileText, Save, RefreshCw } from 'lucide-react';

export default function BrandingManager() {
  const { settings, loading, updateMultipleSettings, refreshSettings } = useBrandingSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setSaving] = useState(false);

  // Mettre à jour localSettings quand settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (key: keyof typeof settings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateMultipleSettings(localSettings);
      
      if (result.success) {
        toast({
          title: "Paramètres sauvegardés",
          description: "Les paramètres de marque ont été mis à jour avec succès.",
        });
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres de marque.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await refreshSettings();
    setLocalSettings(settings);
    toast({
      title: "Paramètres actualisés",
      description: "Les paramètres ont été rechargés depuis la base de données.",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Chargement des paramètres...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Gestion de l'identité de marque</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Informations générales
            </CardTitle>
            <CardDescription>
              Configurez le nom et les informations de base de votre site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Nom du site</Label>
                <Input
                  id="site_name"
                  value={localSettings.site_name}
                  onChange={(e) => handleInputChange('site_name', e.target.value)}
                  placeholder="Exchange Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_title">Titre de la page HTML</Label>
                <Input
                  id="site_title"
                  value={localSettings.site_title}
                  onChange={(e) => handleInputChange('site_title', e.target.value)}
                  placeholder="Exchange Pro - Plateforme d'échange crypto"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Description du site</Label>
              <Textarea
                id="site_description"
                value={localSettings.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="Description de votre plateforme d'échange..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logos et visuels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Logos et visuels
            </CardTitle>
            <CardDescription>
              Gérez les logos et le favicon de votre plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="main_logo_url">Logo principal</Label>
                <Input
                  id="main_logo_url"
                  value={localSettings.main_logo_url}
                  onChange={(e) => handleInputChange('main_logo_url', e.target.value)}
                  placeholder="/src/assets/logo-exchange.png"
                />
                <p className="text-xs text-muted-foreground">
                  Utilisé sur la landing page et dans l'en-tête
                </p>
                {localSettings.main_logo_url && (
                  <div className="mt-2 p-2 border rounded-lg">
                    <img 
                      src={localSettings.main_logo_url} 
                      alt="Logo principal" 
                      className="h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboard_logo_url">Logo dashboard</Label>
                <Input
                  id="dashboard_logo_url"
                  value={localSettings.dashboard_logo_url}
                  onChange={(e) => handleInputChange('dashboard_logo_url', e.target.value)}
                  placeholder="/src/assets/logo-exchange.png"
                />
                <p className="text-xs text-muted-foreground">
                  Utilisé dans la barre latérale et l'interface admin
                </p>
                {localSettings.dashboard_logo_url && (
                  <div className="mt-2 p-2 border rounded-lg">
                    <img 
                      src={localSettings.dashboard_logo_url} 
                      alt="Logo dashboard" 
                      className="h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="favicon_url">Favicon</Label>
              <Input
                id="favicon_url"
                value={localSettings.favicon_url}
                onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                placeholder="/favicon.png"
              />
              <p className="text-xs text-muted-foreground">
                💡 Le favicon apparaît dans l'onglet du navigateur. Format recommandé : 32x32px PNG
              </p>
              {localSettings.favicon_url && (
                <div className="flex items-center space-x-2 mt-2 p-2 border rounded-lg">
                  <img 
                    src={localSettings.favicon_url} 
                    alt="Favicon" 
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Aperçu du favicon</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aperçu en temps réel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Aperçu
            </CardTitle>
            <CardDescription>
              Aperçu de l'affichage avec les paramètres actuels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3">
                {localSettings.main_logo_url && (
                  <img 
                    src={localSettings.main_logo_url} 
                    alt="Logo" 
                    className="h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h3 className="font-semibold">{localSettings.site_name}</h3>
                  <p className="text-sm text-muted-foreground">{localSettings.site_title}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {localSettings.site_description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}