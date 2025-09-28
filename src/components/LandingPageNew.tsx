import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLandingPageSettings } from "@/hooks/useLandingPageSettings";
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
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";

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

  return (
    <div 
      className="min-h-screen"
      style={{
        '--primary': settings.primary_color,
        '--secondary': settings.secondary_color,
        '--accent': settings.accent_color,
        '--background': settings.background_color,
        '--foreground': settings.text_color,
      } as React.CSSProperties}
    >
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src={settings.main_logo_url} 
                alt={settings.site_name}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-foreground">
                {settings.site_name}
              </span>
            </div>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {settings.nav_items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Boutons CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link to="/auth">Connexion</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">S'inscrire</Link>
              </Button>
            </div>

            {/* Menu mobile */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Menu mobile ouvert */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                {settings.nav_items.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex flex-col space-y-2 pt-4">
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/auth">Connexion</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/auth">S'inscrire</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Section Hero */}
      <section 
        className="py-20 px-4"
        style={{
          backgroundImage: settings.hero_background_image ? `url(${settings.hero_background_image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {settings.hero_title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            {settings.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth">{settings.hero_cta_text}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <a href="#about">{settings.hero_secondary_cta_text}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section id="services" className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              {settings.services_title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {settings.services_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {settings.services_items.map((service, index) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap];
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    {IconComponent && (
                      <IconComponent className="h-12 w-12 mx-auto mb-4 text-primary" />
                    )}
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section À propos */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                {settings.about_title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {settings.about_content}
              </p>
              <Button asChild className="mt-8" size="lg">
                <Link to="/auth">Rejoindre maintenant</Link>
              </Button>
            </div>
            <div>
              <img 
                src={settings.about_image}
                alt="À propos"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Partenaires */}
      <section id="partners" className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-foreground">
            {settings.partners_title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center justify-items-center">
            {settings.partners_items.map((partner, index) => (
              <div key={index} className="grayscale hover:grayscale-0 transition-all">
                <img 
                  src={partner.logo}
                  alt={partner.name}
                  className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Contactez-nous
            </h2>
            <p className="text-xl text-muted-foreground">
              Notre équipe est là pour vous aider
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Phone className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Téléphone</h3>
                <p className="text-muted-foreground">{settings.contact_phone}</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Email</h3>
                <p className="text-muted-foreground">{settings.contact_email}</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Adresse</h3>
                <p className="text-muted-foreground">{settings.contact_address}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo et description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={settings.main_logo_url} 
                  alt={settings.site_name}
                  className="h-8 w-8 brightness-0 invert"
                />
                <span className="text-xl font-bold">
                  {settings.site_name}
                </span>
              </div>
              <p className="text-background/70 mb-6">
                {settings.footer_description}
              </p>
              <div className="flex space-x-4">
                {settings.social_links.map((social) => {
                  const IconComponent = iconMap[social.icon as keyof typeof iconMap];
                  return IconComponent ? (
                    <a
                      key={social.platform}
                      href={social.url}
                      className="text-background/70 hover:text-background transition-colors"
                    >
                      <IconComponent className="h-6 w-6" />
                    </a>
                  ) : null;
                })}
              </div>
            </div>

            {/* Liens légaux */}
            <div>
              <h4 className="font-semibold mb-4">Liens utiles</h4>
              <div className="space-y-2">
                {settings.legal_links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-background/70">
                <p>{settings.contact_phone}</p>
                <p>{settings.contact_email}</p>
                <p>{settings.contact_address}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-background/20 mt-8 pt-8 text-center">
            <p className="text-background/70">
              {settings.copyright_text}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};