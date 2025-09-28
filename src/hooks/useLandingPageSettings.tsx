import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LandingPageSettings {
  // Branding
  site_name: string;
  site_tagline: string;
  main_logo_url: string;
  dashboard_logo_url: string;
  
  // Couleurs (format HSL sans hsl())
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  
  // Section Hero
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_secondary_cta_text: string;
  hero_background_image: string;
  
  // Navigation
  nav_items: Array<{label: string; href: string}>;
  
  // Section Services
  services_title: string;
  services_subtitle: string;
  services_items: Array<{title: string; description: string; icon: string}>;
  
  // Section À propos
  about_title: string;
  about_content: string;
  about_image: string;
  
  // Section Partenaires
  partners_title: string;
  partners_items: Array<{name: string; logo: string}>;
  
  // Footer
  footer_description: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  
  // Réseaux sociaux
  social_links: Array<{platform: string; url: string; icon: string}>;
  
  // Copyright
  copyright_text: string;
  legal_links: Array<{label: string; href: string}>;
}

const defaultSettings: LandingPageSettings = {
  // Branding
  site_name: 'Exchange Pro',
  site_tagline: 'Plateforme d\'échange crypto sécurisée',
  main_logo_url: '/src/assets/logo-exchange.png',
  dashboard_logo_url: '/src/assets/logo-exchange.png',
  
  // Couleurs principales (HSL format pour compatibilité Tailwind)
  primary_color: '220 90% 56%',
  secondary_color: '220 14% 96%',
  accent_color: '24 95% 53%',
  background_color: '0 0% 100%',
  text_color: '224 71% 4%',
  
  // Section Hero
  hero_title: 'Échangez vos cryptomonnaies en toute sécurité',
  hero_subtitle: 'Plateforme d\'échange rapide et sécurisée pour convertir vos cryptomonnaies en monnaie locale et vice versa.',
  hero_cta_text: 'Commencer maintenant',
  hero_secondary_cta_text: 'En savoir plus',
  hero_background_image: '/src/assets/hero-crypto-exchange.jpg',
  
  // Navigation
  nav_items: [
    {label: 'Services', href: '#services'},
    {label: 'À propos', href: '#about'},
    {label: 'Partenaires', href: '#partners'},
    {label: 'Contact', href: '#contact'}
  ],
  
  // Section Services
  services_title: 'Nos Services',
  services_subtitle: 'Découvrez nos solutions d\'échange adaptées à vos besoins',
  services_items: [
    {
      title: 'Échange Crypto-FCFA',
      description: 'Convertissez vos cryptomonnaies en FCFA rapidement et en toute sécurité',
      icon: 'ArrowUpDown'
    },
    {
      title: 'Mobile Money',
      description: 'Recevez vos fonds directement sur votre compte Mobile Money',
      icon: 'Smartphone'
    },
    {
      title: 'Transferts Rapides',
      description: 'Transactions traitées en moins de 10 minutes',
      icon: 'Zap'
    },
    {
      title: 'Sécurité Maximale',
      description: 'Protection avancée de vos données et transactions',
      icon: 'Shield'
    }
  ],
  
  // Section À propos
  about_title: 'À Propos de Nous',
  about_content: 'Nous sommes une plateforme d\'échange de cryptomonnaies de nouvelle génération, offrant des solutions sécurisées et rapides pour convertir vos actifs numériques. Notre mission est de démocratiser l\'accès aux cryptomonnaies en Afrique de l\'Ouest.',
  about_image: '/src/assets/about-team.jpg',
  
  // Section Partenaires
  partners_title: 'Nos Partenaires',
  partners_items: [
    {name: 'Moneroo', logo: '/src/assets/logo-exchange.png'},
    {name: 'NOWPayments', logo: '/src/assets/logo-exchange.png'},
    {name: 'Mobile Money', logo: '/src/assets/logo-exchange.png'}
  ],
  
  // Footer
  footer_description: 'Plateforme d\'échange crypto leader en Afrique de l\'Ouest',
  contact_phone: '+229 XX XX XX XX',
  contact_email: 'contact@example.com',
  contact_address: 'Cotonou, Bénin',
  
  // Réseaux sociaux
  social_links: [
    {platform: 'Facebook', url: '#', icon: 'Facebook'},
    {platform: 'Twitter', url: '#', icon: 'Twitter'},
    {platform: 'Instagram', url: '#', icon: 'Instagram'},
    {platform: 'LinkedIn', url: '#', icon: 'Linkedin'}
  ],
  
  // Copyright
  copyright_text: '© 2024 Exchange Pro. Tous droits réservés.',
  legal_links: [
    {label: 'Conditions d\'utilisation', href: '/terms'},
    {label: 'Politique de confidentialité', href: '/privacy'},
    {label: 'Mentions légales', href: '/legal'}
  ]
};

export const useLandingPageSettings = () => {
  const [settings, setSettings] = useState<LandingPageSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_page_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // Convert array of settings to object
        const settingsObj: any = {};
        data.forEach(setting => {
          const key = setting.setting_key;
          settingsObj[key] = setting.setting_value;
        });
        
        setSettings({...defaultSettings, ...settingsObj});
      } else {
        // Initialize default settings if none exist
        await initializeDefaultSettings();
      }
    } catch (error) {
      console.error('Error fetching landing page settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration de la landing page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultSettings = async () => {
    try {
      const settingsArray = Object.entries(defaultSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        setting_type: getSettingType(key, value),
        description: getSettingDescription(key)
      }));

      const { error } = await supabase
        .from('landing_page_settings')
        .insert(settingsArray);

      if (error) throw error;
      
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error initializing landing page settings:', error);
    }
  };

  const updateSetting = async (key: keyof LandingPageSettings, value: any) => {
    try {
      const { error } = await supabase
        .from('landing_page_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          setting_type: getSettingType(key, value),
          description: getSettingDescription(key)
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Configuration mise à jour",
        description: `${key} a été mis à jour avec succès`,
      });
    } catch (error) {
      console.error('Error updating landing page setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration",
        variant: "destructive",
      });
    }
  };

  const updateMultipleSettings = async (updates: Partial<LandingPageSettings>) => {
    try {
      const settingsArray = Object.entries(updates).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        setting_type: getSettingType(key, value),
        description: getSettingDescription(key)
      }));

      const { error } = await supabase
        .from('landing_page_settings')
        .upsert(settingsArray);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Configuration mise à jour",
        description: "Les paramètres de la landing page ont été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating landing page settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    updateSetting,
    updateMultipleSettings,
    refreshSettings: fetchSettings
  };
};

const getSettingType = (key: string, value: any): string => {
  if (key.includes('color')) return 'color';
  if (key.includes('image') || key.includes('logo')) return 'image';
  if (key.includes('email')) return 'email';
  if (key.includes('items') || key.includes('links') || Array.isArray(value)) return 'json';
  if (typeof value === 'string' && value.length > 100) return 'textarea';
  return 'text';
};

const getSettingDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    site_name: 'Nom du site',
    site_tagline: 'Slogan du site',
    main_logo_url: 'Logo principal de la landing page',
    dashboard_logo_url: 'Logo du tableau de bord',
    primary_color: 'Couleur primaire (format HSL sans hsl())',
    secondary_color: 'Couleur secondaire',
    accent_color: 'Couleur d\'accent',
    background_color: 'Couleur de fond',
    text_color: 'Couleur du texte',
    hero_title: 'Titre principal de la section hero',
    hero_subtitle: 'Sous-titre de la section hero',
    hero_cta_text: 'Texte du bouton CTA principal',
    hero_secondary_cta_text: 'Texte du bouton CTA secondaire',
    hero_background_image: 'Image de fond de la section hero',
    nav_items: 'Éléments de navigation',
    services_title: 'Titre de la section services',
    services_subtitle: 'Sous-titre de la section services',
    services_items: 'Liste des services',
    about_title: 'Titre de la section à propos',
    about_content: 'Contenu de la section à propos',
    about_image: 'Image de la section à propos',
    partners_title: 'Titre de la section partenaires',
    partners_items: 'Liste des partenaires',
    footer_description: 'Description dans le footer',
    contact_phone: 'Numéro de téléphone',
    contact_email: 'Email de contact',
    contact_address: 'Adresse',
    social_links: 'Liens des réseaux sociaux',
    copyright_text: 'Texte de copyright',
    legal_links: 'Liens légaux'
  };
  
  return descriptions[key] || '';
};