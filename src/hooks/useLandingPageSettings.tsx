import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LandingPageSettings {
  // Branding & Identité
  site_name: string;
  site_tagline: string;
  site_description: string;
  main_logo_url: string;
  dashboard_logo_url: string;
  favicon_url: string;
  
  // Couleurs & Thème (format HSL sans hsl())
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  border_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  
  // Header personnalisé
  header_show_logo: boolean;
  header_show_navigation: boolean;
  header_show_theme_toggle: boolean;
  header_show_auth_buttons: boolean;
  header_background_color: string;
  header_text_color: string;
  header_height: string;
  
  // Section Hero
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_secondary_cta_text: string;
  hero_background_image: string;
  hero_overlay_color: string;
  hero_text_alignment: string;
  hero_show_stats: boolean;
  
  // Navigation principale
  nav_items: Array<{label: string; href: string; icon?: string; external?: boolean}>;
  nav_style: string;
  nav_position: string;
  
  // Section Services
  services_title: string;
  services_subtitle: string;
  services_items: Array<{title: string; description: string; icon: string; link?: string}>;
  services_layout: string;
  services_background_color: string;
  
  // Section À propos
  about_title: string;
  about_subtitle: string;
  about_content: string;
  about_image: string;
  about_layout: string;
  about_background_color: string;
  
  // Section Partenaires
  partners_title: string;
  partners_subtitle: string;
  partners_items: Array<{name: string; logo: string; url?: string}>;
  partners_show_grayscale: boolean;
  partners_layout: string;
  
  // Section Témoignages
  testimonials_title: string;
  testimonials_subtitle: string;
  testimonials_items: Array<{
    name: string; 
    role: string; 
    company: string; 
    content: string; 
    avatar: string;
    rating: number;
  }>;
  testimonials_show: boolean;
  
  // Section FAQ
  faq_title: string;
  faq_subtitle: string;
  faq_items: Array<{question: string; answer: string}>;
  faq_show: boolean;
  
  // Section CTA (Call to Action)
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
  cta_button_link: string;
  cta_background_image: string;
  cta_show: boolean;
  
  // Footer complet
  footer_description: string;
  footer_background_color: string;
  footer_text_color: string;
  footer_show_logo: boolean;
  footer_show_social: boolean;
  footer_show_newsletter: boolean;
  footer_newsletter_title: string;
  footer_newsletter_text: string;
  
  // Contact & Informations
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_hours: string;
  contact_show_map: boolean;
  
  // Réseaux sociaux
  social_links: Array<{platform: string; url: string; icon: string}>;
  
  // Liens légaux & Footer
  copyright_text: string;
  legal_links: Array<{label: string; href: string}>;
  footer_links: Array<{
    title: string;
    links: Array<{label: string; href: string; external?: boolean}>;
  }>;
  
  // SEO & Meta
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  meta_image: string;
  
  // Pages personnalisées
  custom_pages: Array<{
    slug: string;
    title: string;
    content: string;
    meta_title: string;
    meta_description: string;
    show_in_nav: boolean;
    show_in_footer: boolean;
  }>;
  
  // Analytics & Intégrations
  google_analytics_id: string;
  facebook_pixel_id: string;
  custom_css: string;
  custom_js: string;
  
  // Maintenance & Status
  maintenance_mode: boolean;
  maintenance_message: string;
  announcement_bar_show: boolean;
  announcement_bar_text: string;
  announcement_bar_color: string;
  announcement_bar_link: string;
}

const defaultSettings: LandingPageSettings = {
  // Branding & Identité
  site_name: 'Exchange Pro',
  site_tagline: 'Plateforme d\'échange crypto sécurisée',
  site_description: 'La plateforme d\'échange de cryptomonnaies la plus sécurisée et conviviale du marché',
  main_logo_url: '/src/assets/logo-exchange.png',
  dashboard_logo_url: '/src/assets/logo-exchange.png',
  favicon_url: '',
  
  // Couleurs & Thème
  primary_color: '170 74% 35%',
  secondary_color: '220 8% 96%',
  accent_color: '170 74% 45%',
  background_color: '0 0% 100%',
  text_color: '220 8% 4%',
  border_color: '220 8% 90%',
  success_color: '142 76% 36%',
  warning_color: '38 92% 50%',
  error_color: '0 72% 51%',
  
  // Header personnalisé
  header_show_logo: true,
  header_show_navigation: true,
  header_show_theme_toggle: true,
  header_show_auth_buttons: true,
  header_background_color: '0 0% 100%',
  header_text_color: '220 8% 4%',
  header_height: '64px',
  
  // Section Hero
  hero_title: 'Échangez vos cryptomonnaies en toute sécurité',
  hero_subtitle: 'La plateforme d\'échange crypto la plus simple et sécurisée. Commencez dès maintenant avec des frais réduits.',
  hero_cta_text: 'Commencer maintenant',
  hero_secondary_cta_text: 'En savoir plus',
  hero_background_image: '/src/assets/hero-crypto-exchange.jpg',
  hero_overlay_color: '0 0% 0% / 0.3',
  hero_text_alignment: 'left',
  hero_show_stats: true,
  
  // Navigation principale
  nav_items: [
    { label: 'Accueil', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'À propos', href: '#about' },
    { label: 'Partenaires', href: '#partners' },
    { label: 'Contact', href: '#contact' }
  ],
  nav_style: 'horizontal',
  nav_position: 'top',
  
  // Section Services
  services_title: 'Nos Services',
  services_subtitle: 'Découvrez nos solutions d\'échange de cryptomonnaies',
  services_items: [
    {
      title: 'Échange Rapide',
      description: 'Échangez vos cryptomonnaies en quelques secondes',
      icon: 'ArrowUpDown'
    },
    {
      title: 'Application Mobile',
      description: 'Tradez partout avec notre app mobile sécurisée',
      icon: 'Smartphone'
    },
    {
      title: 'Transactions Rapides',
      description: 'Des transactions ultra-rapides avec des frais réduits',
      icon: 'Zap'
    },
    {
      title: 'Sécurité Maximale',
      description: 'Vos fonds sont protégés par une sécurité de niveau bancaire',
      icon: 'Shield'
    }
  ],
  services_layout: 'grid',
  services_background_color: '220 8% 98%',
  
  // Section À propos
  about_title: 'À propos d\'Exchange Pro',
  about_subtitle: 'Votre partenaire de confiance dans l\'univers crypto',
  about_content: 'Nous sommes une équipe passionnée de professionnels de la blockchain et de la finance, dédiée à rendre les cryptomonnaies accessibles à tous. Notre plateforme combine sécurité, simplicité et innovation pour offrir la meilleure expérience d\'échange possible.',
  about_image: '/src/assets/about-team.jpg',
  about_layout: 'image-right',
  about_background_color: '0 0% 100%',
  
  // Section Partenaires
  partners_title: 'Nos Partenaires de Confiance',
  partners_subtitle: 'Nous collaborons avec les leaders du secteur',
  partners_items: [],
  partners_show_grayscale: true,
  partners_layout: 'carousel',
  
  // Section Témoignages
  testimonials_title: 'Ce que disent nos utilisateurs',
  testimonials_subtitle: 'Découvrez les avis de notre communauté',
  testimonials_items: [
    {
      name: 'Marie Dubois',
      role: 'Trader',
      company: 'Crypto Enthusiast',
      content: 'Exchange Pro a révolutionné ma façon de trader. Interface simple, frais réduits, je recommande !',
      avatar: '/placeholder.svg',
      rating: 5
    }
  ],
  testimonials_show: false,
  
  // Section FAQ
  faq_title: 'Questions fréquemment posées',
  faq_subtitle: 'Trouvez rapidement les réponses à vos questions',
  faq_items: [
    {
      question: 'Comment commencer à trader ?',
      answer: 'Inscrivez-vous gratuitement, vérifiez votre identité et commencez à échanger en quelques minutes.'
    },
    {
      question: 'Quels sont les frais de transaction ?',
      answer: 'Nos frais sont parmi les plus compétitifs du marché, à partir de 0,1% par transaction.'
    }
  ],
  faq_show: false,
  
  // Section CTA
  cta_title: 'Prêt à commencer ?',
  cta_subtitle: 'Rejoignez des milliers d\'utilisateurs qui nous font confiance',
  cta_button_text: 'Créer un compte gratuit',
  cta_button_link: '/auth',
  cta_background_image: '',
  cta_show: false,
  
  // Footer complet
  footer_description: 'Exchange Pro est votre plateforme de confiance pour l\'échange de cryptomonnaies en toute sécurité.',
  footer_background_color: '220 8% 4%',
  footer_text_color: '0 0% 98%',
  footer_show_logo: true,
  footer_show_social: true,
  footer_show_newsletter: false,
  footer_newsletter_title: 'Newsletter',
  footer_newsletter_text: 'Recevez nos dernières actualités crypto',
  
  // Contact & Informations
  contact_phone: '+229 XX XX XX XX',
  contact_email: 'contact@exchangepro.com',
  contact_address: 'Cotonou, Bénin',
  contact_hours: 'Lun-Ven: 9h-18h',
  contact_show_map: false,
  
  // Réseaux sociaux
  social_links: [
    { platform: 'Facebook', url: 'https://facebook.com', icon: 'Facebook' },
    { platform: 'Twitter', url: 'https://twitter.com', icon: 'Twitter' },
    { platform: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' },
    { platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin' }
  ],
  
  // Copyright et liens
  copyright_text: '© 2025 Exchange Pro. Tous droits réservés.',
  legal_links: [
    { label: 'Politique de confidentialité', href: '/privacy' },
    { label: 'Conditions d\'utilisation', href: '/terms' },
    { label: 'Mentions légales', href: '/legal' }
  ],
  footer_links: [
    {
      title: 'Produits',
      links: [
        { label: 'Échange Spot', href: '/spot' },
        { label: 'Trading P2P', href: '/p2p' },
        { label: 'Portefeuille', href: '/wallet' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Centre d\'aide', href: '/help' },
        { label: 'Contact', href: '/contact' },
        { label: 'API', href: '/api' }
      ]
    }
  ],
  
  // SEO & Meta
  meta_title: 'Exchange Pro - Plateforme d\'échange crypto sécurisée',
  meta_description: 'Échangez vos cryptomonnaies en toute sécurité avec Exchange Pro. Frais réduits, transactions rapides, sécurité maximale.',
  meta_keywords: 'crypto, bitcoin, ethereum, échange, trading, blockchain, sécurisé',
  meta_image: '/src/assets/hero-crypto-exchange.jpg',
  
  // Pages personnalisées
  custom_pages: [],
  
  // Analytics & Intégrations
  google_analytics_id: '',
  facebook_pixel_id: '',
  custom_css: '',
  custom_js: '',
  
  // Maintenance & Status
  maintenance_mode: false,
  maintenance_message: 'Site en maintenance. Nous reviendrons bientôt !',
  announcement_bar_show: false,
  announcement_bar_text: 'Nouvelle fonctionnalité disponible !',
  announcement_bar_color: '170 74% 35%',
  announcement_bar_link: ''
};

export const useLandingPageSettings = () => {
  const [settings, setSettings] = useState<LandingPageSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch settings from database
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('landing_page_settings')
        .select('setting_key, setting_value')
        .order('created_at', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        const settingsObj = data.reduce((acc: any, curr: any) => {
          try {
            acc[curr.setting_key] = JSON.parse(curr.setting_value);
          } catch (e) {
            acc[curr.setting_key] = curr.setting_value;
          }
          return acc;
        }, {});
        
        setSettings({ ...defaultSettings, ...settingsObj });
      } else {
        // Initialize with default settings if no data exists
        await initializeDefaultSettings();
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize default settings in the database
  const initializeDefaultSettings = async () => {
    try {
      const settingsArray = Object.entries(defaultSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'object' ? JSON.stringify(value) : value.toString(),
        setting_type: getSettingType(key, value),
        description: getSettingDescription(key)
      }));

      const { error } = await supabase
        .from('landing_page_settings')
        .insert(settingsArray);

      if (error) throw error;

      setSettings(defaultSettings);
      toast({
        title: "Paramètres initialisés",
        description: "Les paramètres par défaut ont été créés",
      });
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  };

  // Update a single setting
  const updateSetting = async (key: keyof LandingPageSettings, value: any) => {
    try {
      const { error } = await supabase
        .from('landing_page_settings')
        .upsert({
          setting_key: key,
          setting_value: typeof value === 'object' ? JSON.stringify(value) : value.toString(),
          setting_type: getSettingType(key, value),
          description: getSettingDescription(key)
        }, { 
          onConflict: 'setting_key' 
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Paramètre mis à jour",
        description: `${key} a été modifié avec succès`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre",
        variant: "destructive",
      });
    }
  };

  // Update multiple settings
  const updateMultipleSettings = async (newSettings: Partial<LandingPageSettings>) => {
    try {
      const settingsArray = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'object' ? JSON.stringify(value) : value?.toString() || '',
        setting_type: getSettingType(key, value),
        description: getSettingDescription(key)
      }));

      const { error } = await supabase
        .from('landing_page_settings')
        .upsert(settingsArray, { 
          onConflict: 'setting_key' 
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Tous les paramètres ont été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    fetchSettings,
    updateSetting,
    updateMultipleSettings,
    refreshSettings: fetchSettings
  };
};

// Helper functions
export const getSettingType = (key: string, value: any): string => {
  if (key.includes('color')) return 'color';
  if (key.includes('image') || key.includes('logo') || key.includes('favicon')) return 'image';
  if (Array.isArray(value)) return 'json';
  if (typeof value === 'object') return 'json';
  if (typeof value === 'boolean') return 'boolean';
  if (key.includes('content') || key.includes('description') || key.includes('message')) return 'textarea';
  return 'text';
};

export const getSettingDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    site_name: 'Nom de votre site web',
    site_tagline: 'Slogan ou description courte',
    site_description: 'Description complète de votre site',
    main_logo_url: 'URL du logo principal',
    dashboard_logo_url: 'URL du logo pour le dashboard',
    favicon_url: 'URL du favicon du site',
    primary_color: 'Couleur principale du thème',
    secondary_color: 'Couleur secondaire du thème',
    hero_title: 'Titre principal de la page d\'accueil',
    hero_subtitle: 'Sous-titre de la section hero',
    nav_items: 'Éléments du menu de navigation',
    services_items: 'Liste des services proposés',
    social_links: 'Liens vers les réseaux sociaux',
    contact_phone: 'Numéro de téléphone de contact',
    contact_email: 'Adresse email de contact',
    copyright_text: 'Texte de copyright dans le footer'
  };
  
  return descriptions[key] || `Configuration pour ${key}`;
};