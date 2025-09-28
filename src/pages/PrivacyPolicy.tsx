import { useBrandingSettings } from '@/hooks/useBrandingSettings';

export default function PrivacyPolicy() {
  const { settings } = useBrandingSettings();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              {settings.site_name} s'engage à protéger votre vie privée. Cette politique de confidentialité 
              explique comment nous collectons, utilisons et protégeons vos informations personnelles 
              lorsque vous utilisez notre plateforme d'échange de cryptomonnaies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Informations Collectées</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-foreground">2.1 Informations que vous nous fournissez</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Adresse email et informations de compte</li>
                <li>Informations de vérification d'identité</li>
                <li>Informations de paiement et portefeuilles</li>
                <li>Communications avec notre support client</li>
              </ul>
              
              <h3 className="text-xl font-medium text-foreground">2.2 Informations collectées automatiquement</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Adresse IP et données de géolocalisation</li>
                <li>Informations sur votre navigateur et appareil</li>
                <li>Données d'utilisation de la plateforme</li>
                <li>Cookies et technologies similaires</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Utilisation des Informations</h2>
            <p className="text-muted-foreground mb-4">Nous utilisons vos informations pour :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fournir et améliorer nos services d'échange</li>
              <li>Vérifier votre identité et prévenir la fraude</li>
              <li>Traiter vos transactions en toute sécurité</li>
              <li>Vous contacter concernant votre compte ou nos services</li>
              <li>Respecter nos obligations légales et réglementaires</li>
              <li>Analyser l'utilisation de notre plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Partage des Informations</h2>
            <p className="text-muted-foreground mb-4">
              Nous ne vendons jamais vos informations personnelles. Nous pouvons partager 
              vos informations uniquement dans les cas suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Avec votre consentement explicite</li>
              <li>Avec nos prestataires de services de confiance</li>
              <li>Pour respecter les obligations légales</li>
              <li>Pour protéger nos droits et la sécurité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Sécurité des Données</h2>
            <p className="text-muted-foreground">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
              appropriées pour protéger vos informations contre l'accès non autorisé, 
              la divulgation, l'altération ou la destruction. Cela inclut le chiffrement, 
              l'authentification à deux facteurs et des audits de sécurité réguliers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Vos Droits</h2>
            <p className="text-muted-foreground mb-4">Vous avez le droit de :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Accéder à vos informations personnelles</li>
              <li>Rectifier ou mettre à jour vos données</li>
              <li>Supprimer votre compte et vos données</li>
              <li>Limiter le traitement de vos informations</li>
              <li>Porter vos données vers un autre service</li>
              <li>Vous opposer au traitement de vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies</h2>
            <p className="text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience, analyser l'utilisation 
              du site et personnaliser le contenu. Vous pouvez gérer vos préférences de cookies 
              dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Conservation des Données</h2>
            <p className="text-muted-foreground">
              Nous conservons vos informations personnelles aussi longtemps que nécessaire 
              pour fournir nos services et respecter nos obligations légales. Les données 
              de transaction peuvent être conservées plus longtemps à des fins de conformité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Modifications</h2>
            <p className="text-muted-foreground">
              Nous pouvons modifier cette politique de confidentialité à tout moment. 
              Les modifications importantes vous seront notifiées par email ou sur notre plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant cette politique de confidentialité ou vos données 
              personnelles, contactez-nous à l'adresse : 
              <span className="font-medium text-primary"> privacy@{settings.site_name.toLowerCase().replace(/\s+/g, '')}.com</span>
            </p>
          </section>
        </div>

        {/* Back to home */}
        <div className="mt-12 pt-8 border-t border-border">
          <a 
            href="/" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}