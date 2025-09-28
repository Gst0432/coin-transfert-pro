import { useBrandingSettings } from '@/hooks/useBrandingSettings';

export default function TermsOfService() {
  const { settings } = useBrandingSettings();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Conditions d'Utilisation
          </h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptation des Conditions</h2>
            <p className="text-muted-foreground leading-relaxed">
              En accédant et en utilisant {settings.site_name}, vous acceptez d'être lié par 
              ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
              veuillez ne pas utiliser notre plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description du Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              {settings.site_name} est une plateforme d'échange de cryptomonnaies qui permet 
              aux utilisateurs d'acheter, vendre et échanger des actifs numériques. 
              Nous facilitons les transactions entre les utilisateurs et les fournisseurs 
              de services de paiement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Eligibilité</h2>
            <p className="text-muted-foreground mb-4">Pour utiliser nos services, vous devez :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Être âgé d'au moins 18 ans</li>
              <li>Avoir la capacité juridique de conclure des contrats</li>
              <li>Résider dans une juridiction où nos services sont autorisés</li>
              <li>Fournir des informations d'identification véridiques</li>
              <li>Ne pas être sur une liste de sanctions internationales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compte Utilisateur</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-foreground">4.1 Création de compte</h3>
              <p className="text-muted-foreground">
                Vous devez créer un compte pour utiliser nos services. Vous êtes responsable 
                de maintenir la confidentialité de vos identifiants de connexion.
              </p>
              
              <h3 className="text-xl font-medium text-foreground">4.2 Vérification d'identité</h3>
              <p className="text-muted-foreground">
                Nous pouvons exiger une vérification d'identité (KYC) pour certaines 
                transactions. Vous devez fournir des documents authentiques et à jour.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Utilisation Acceptable</h2>
            <p className="text-muted-foreground mb-4">Vous acceptez de ne pas :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Utiliser notre service à des fins illégales</li>
              <li>Violer les lois locales, nationales ou internationales</li>
              <li>Manipuler les prix ou créer de faux marchés</li>
              <li>Usurper l'identité d'une autre personne</li>
              <li>Transmettre des virus ou codes malveillants</li>
              <li>Contourner nos mesures de sécurité</li>
              <li>Créer plusieurs comptes pour contourner les limites</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Transactions et Frais</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-foreground">6.1 Frais de service</h3>
              <p className="text-muted-foreground">
                Nous facturons des frais pour nos services d'échange. Les frais sont 
                transparents et affichés avant chaque transaction.
              </p>
              
              <h3 className="text-xl font-medium text-foreground">6.2 Finalité des transactions</h3>
              <p className="text-muted-foreground">
                Les transactions en cryptomonnaies sont généralement irréversibles. 
                Vérifiez soigneusement tous les détails avant de confirmer.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Risques</h2>
            <p className="text-muted-foreground mb-4">
              Les cryptomonnaies présentent des risques importants, notamment :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Volatilité extrême des prix</li>
              <li>Risques technologiques et de sécurité</li>
              <li>Incertitudes réglementaires</li>
              <li>Risque de perte totale</li>
              <li>Risques de liquidité</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Vous reconnaissez comprendre ces risques et les accepter entièrement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation de Responsabilité</h2>
            <p className="text-muted-foreground">
              {settings.site_name} ne sera pas responsable des dommages indirects, 
              incidents, spéciaux ou consécutifs résultant de l'utilisation de nos services. 
              Notre responsabilité est limitée au montant des frais payés au cours 
              des 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Suspension et Résiliation</h2>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de suspendre ou résilier votre compte 
              en cas de violation de ces conditions, d'activité suspecte ou 
              d'exigences réglementaires.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Modifications</h2>
            <p className="text-muted-foreground">
              Nous pouvons modifier ces conditions à tout moment. Les modifications 
              importantes vous seront notifiées et prendront effet après un délai 
              de préavis approprié.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Droit Applicable</h2>
            <p className="text-muted-foreground">
              Ces conditions sont régies par les lois du Bénin. Tout litige sera 
              soumis à la juridiction exclusive des tribunaux compétents du Bénin.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant ces conditions d'utilisation, 
              contactez-nous à l'adresse : 
              <span className="font-medium text-primary"> legal@{settings.site_name.toLowerCase().replace(/\s+/g, '')}.com</span>
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