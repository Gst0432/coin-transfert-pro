# Exchange Pro

Une plateforme moderne et sécurisée d'échange de cryptomonnaies.

## 🚀 Fonctionnalités

- **Interface intuitive** - Design moderne et responsive
- **Sécurité maximale** - Protection des fonds et des données
- **Transactions rapides** - Échanges instantanés
- **Support 24/7** - Assistance disponible en permanence

## 📋 Technologies utilisées

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase
- **Authentification**: Supabase Auth
- **Base de données**: PostgreSQL
- **Déploiement**: Build de production optimisé

## 🛠️ Installation

1. Clonez le repository
```bash
git clone [URL_DU_REPO]
cd exchange-pro
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez les variables d'environnement
```bash
cp .env.example .env
```

4. Lancez le serveur de développement
```bash
npm run dev
```

## 🏗️ Structure du projet

```
src/
├── components/          # Composants React réutilisables
├── pages/              # Pages de l'application
├── hooks/              # Hooks personnalisés
├── lib/                # Utilitaires et configurations
├── assets/             # Images et ressources statiques
└── integrations/       # Intégrations externes (Supabase)
```

## 📱 Administration

L'interface d'administration permet de personnaliser :
- Identité de la plateforme (logo, couleurs, favicon)
- Contenu des pages (hero, services, à propos)
- Navigation et liens
- Métadonnées SEO
- Paramètres avancés

Accès admin : `/admin/landing-page` (réservé aux administrateurs)

## 🔒 Sécurité

- Authentification sécurisée avec Supabase
- Row Level Security (RLS) sur toutes les tables
- Validation des données côté client et serveur
- Protection CSRF et XSS

## 📈 Déploiement

```bash
npm run build
```

Le build de production sera généré dans le dossier `dist/`.

## 📄 Licence

Tous droits réservés - Exchange Pro © 2025

## 📞 Support

Pour toute question ou assistance :
- 📧 Email: contact@exchangepro.com
- 🌐 Site web: [URL_DU_SITE]