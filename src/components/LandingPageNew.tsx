import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLandingPageSettings } from "@/hooks/useLandingPageSettings";
import { useTheme } from "@/components/ThemeProvider";
import { useFavicon, updatePageMetadata } from "@/hooks/useFavicon";
import { 
  ArrowUpDown, 
  Smartphone, 
  Zap, 
  Shield, 
  Menu, 
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Sun,
  Moon
} from "lucide-react";
import { Link } from "react-router-dom";
import usdtCoin from "@/assets/usdt-coin.jpg";
import { useEffect } from "react";

// Mapping des icônes
const iconMap = {
  ArrowUpDown,
  Smartphone,
  Zap,
  Shield,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin
};

export const LandingPageNew = () => {
  const { settings, isLoading } = useLandingPageSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Utiliser le hook de favicon et mettre à jour les métadonnées
  useFavicon(settings.favicon_url);
  
  useEffect(() => {
    updatePageMetadata(settings);
  }, [settings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Appliquer les couleurs dynamiques
  const dynamicStyles = {
    '--dynamic-primary': settings.primary_color,
    '--dynamic-secondary': settings.secondary_color,
    '--dynamic-accent': settings.accent_color,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background" style={dynamicStyles} id="home">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {settings.main_logo_url && (
                <img 
                  src={settings.main_logo_url} 
                  alt="Logo" 
                  className="h-8 w-8 object-contain"
                />
              )}
              <span className="text-xl font-bold text-foreground">
                {settings.site_name || "Exchange"}
              </span>
            </div>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {Array.isArray(settings.nav_items) && settings.nav_items.map((item: any, index: number) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors smooth-scroll"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Theme Toggle & CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button asChild variant="outline">
                <Link to="/auth">Connexion</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Commencer</Link>
              </Button>
            </div>

            {/* Bouton menu mobile */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Menu Mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                {Array.isArray(settings.nav_items) && settings.nav_items.map((item: any, index: number) => (
                  <a
                    key={index}
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors px-2 py-1 smooth-scroll"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex items-center space-x-2 px-2 py-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm text-muted-foreground">Thème</span>
                </div>
                <div className="flex flex-col space-y-2 px-2">
                  <Button asChild variant="outline">
                    <Link to="/auth">Connexion</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">Commencer</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Section Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenu textuel */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  {settings.hero_title}
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  {settings.hero_subtitle}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="text-lg px-8 py-4 crypto-button-primary border-0 shadow-[var(--shadow-button)]"
                >
                  <Link to="/auth">{settings.hero_cta_text}</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 crypto-button-secondary"
                >
                  <a href="#about">{settings.hero_secondary_cta_text}</a>
                </Button>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Trading</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">0.1%</div>
                  <div className="text-sm text-muted-foreground">Frais</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-muted-foreground">Utilisateurs</div>
                </div>
              </div>
            </div>

            {/* Image USDT */}
            <div className="relative">
              <div className="relative z-10 crypto-card bg-gradient-to-br from-card to-muted/20 p-8">
                <img 
                  src={usdtCoin} 
                  alt="USDT Cryptocurrency" 
                  className="w-full max-w-md mx-auto rounded-2xl shadow-[var(--shadow-glow)]"
                />
                
                {/* Indicateurs de prix flottants */}
                <div className="absolute top-4 right-4 crypto-card px-4 py-2 bg-success/20 border border-success/30">
                  <div className="text-success font-semibold">USDT</div>
                  <div className="text-xs text-success/80">$1.00</div>
                </div>
                
                <div className="absolute bottom-4 left-4 crypto-card px-4 py-2 bg-primary/20 border border-primary/30">
                  <div className="text-primary font-semibold">Échange</div>
                  <div className="text-xs text-primary/80">Instantané</div>
                </div>
              </div>
              
              {/* Effets de background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section id="services" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            {settings.services_title}
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            {settings.services_subtitle}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.isArray(settings.services_items) && settings.services_items.map((service: any, index: number) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap];
              
              return (
                <Card key={index} className="crypto-card text-center">
                  <CardContent className="pt-6">
                    {IconComponent && <IconComponent className="w-12 h-12 text-primary mx-auto mb-4" />}
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section About */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                {settings.about_title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {settings.about_content}
              </p>
            </div>
            {settings.about_image && (
              <div className="relative">
                <img 
                  src={settings.about_image} 
                  alt="À propos" 
                  className="w-full h-auto rounded-2xl shadow-[var(--shadow-card)]"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Partners */}
      <section id="partners" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-foreground">
            {settings.partners_title}
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {Array.isArray(settings.partners_items) && settings.partners_items.map((partner: any, index: number) => (
              <div key={index} className="crypto-card p-6">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="w-full h-16 object-contain grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-foreground">
            Contactez-nous
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="crypto-card text-center">
              <CardContent className="pt-6">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Téléphone</h3>
                <p className="text-muted-foreground">{settings.contact_phone}</p>
              </CardContent>
            </Card>
            
            <Card className="crypto-card text-center">
              <CardContent className="pt-6">
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Email</h3>
                <p className="text-muted-foreground">{settings.contact_email}</p>
              </CardContent>
            </Card>
            
            <Card className="crypto-card text-center">
              <CardContent className="pt-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Adresse</h3>
                <p className="text-muted-foreground">{settings.contact_address}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/20 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo et description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                {settings.main_logo_url && (
                  <img 
                    src={settings.main_logo_url} 
                    alt="Logo" 
                    className="h-8 w-8 object-contain"
                  />
                )}
                <span className="text-xl font-bold text-foreground">
                  {settings.site_name}
                </span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                {settings.footer_description}
              </p>
              
              {/* Réseaux sociaux */}
              <div className="flex space-x-4">
                {Array.isArray(settings.social_links) && settings.social_links.map((social: any, index: number) => {
                  const IconComponent = iconMap[social.platform as keyof typeof iconMap];
                  
                  return (
                    <a
                      key={index}
                      href={social.url}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Liens légaux */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Légal</h3>
              <div className="space-y-2">
                <a href="/privacy" className="block text-muted-foreground hover:text-primary transition-colors">
                  Politique de confidentialité
                </a>
                <a href="/terms" className="block text-muted-foreground hover:text-primary transition-colors">
                  Conditions d'utilisation
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{settings.contact_phone}</p>
                <p>{settings.contact_email}</p>
                <p>{settings.contact_address}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 mt-8 text-center">
            <p className="text-muted-foreground">
              {settings.copyright_text}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};