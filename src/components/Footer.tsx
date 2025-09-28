import { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useBrandingSettings } from '@/hooks/useBrandingSettings';

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface FooterSettings {
  phone: string;
  email: string;
  address: string;
  copyright_year: string;
  social_links: SocialLink[];
}

const defaultFooterSettings: FooterSettings = {
  phone: '+229 XX XX XX XX',
  email: 'contact@exchangepro.com',
  address: 'Cotonou, Bénin',
  copyright_year: '2025',
  social_links: [
    { platform: 'facebook', url: '', enabled: false },
    { platform: 'twitter', url: '', enabled: false },
    { platform: 'instagram', url: '', enabled: false },
    { platform: 'linkedin', url: '', enabled: false },
    { platform: 'youtube', url: '', enabled: false },
  ],
};

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default function Footer() {
  const { settings: brandingSettings } = useBrandingSettings();
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [loading, setLoading] = useState(true);

  const fetchFooterSettings = async () => {
    try {
      const response = await fetch('/api/admin/footer-settings');
      if (response.ok) {
        const data = await response.json();
        setFooterSettings({ ...defaultFooterSettings, ...data });
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  if (loading) {
    return null; // Ne pas afficher le footer pendant le chargement
  }

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={brandingSettings.dashboard_logo_url} 
                alt={brandingSettings.site_name}
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-foreground">
                {brandingSettings.site_name}
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {brandingSettings.site_name} est votre plateforme de confiance pour l'échange de cryptomonnaies en toute sécurité.
            </p>
            
            {/* Réseaux sociaux */}
            {footerSettings.social_links.some(link => link.enabled && link.url) && (
              <div className="flex items-center gap-3">
                {footerSettings.social_links
                  .filter(link => link.enabled && link.url)
                  .map((link) => {
                    const IconComponent = socialIcons[link.platform as keyof typeof socialIcons];
                    return (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                      >
                        <IconComponent className="w-4 h-4" />
                      </a>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/privacy-policy" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a 
                  href="/terms-of-service" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a 
                  href="/security" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Sécurité
                </a>
              </li>
              <li>
                <a 
                  href="/support" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/trading" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Trading USDT
                </a>
              </li>
              <li>
                <a 
                  href="/wallet" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Portefeuille
                </a>
              </li>
              <li>
                <a 
                  href="/history" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Historique
                </a>
              </li>
              <li>
                <a 
                  href="/api-docs" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a 
                  href={`tel:${footerSettings.phone}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {footerSettings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a 
                  href={`mailto:${footerSettings.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {footerSettings.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {footerSettings.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-border my-8" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {footerSettings.copyright_year} {brandingSettings.site_name}. Tous droits réservés.
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Développé avec ❤️ par</span>
            <a 
              href="https://gstartup.pro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              G-STARTUP
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}