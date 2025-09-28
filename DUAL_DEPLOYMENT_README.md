# Exchange Pro - Dual Deployment System

Ce projet supporte **deux modes de déploiement** distincts :

## 🚀 Option 1 : Netlify + Supabase (Recommandé pour MVP)

### Avantages
- ✅ **Gratuit** pour débuter (Netlify + Supabase free tier)
- ✅ **Simple à configurer** (pas de serveur à gérer)
- ✅ **Déploiement automatique** via Git
- ✅ **Base de données PostgreSQL** incluse
- ✅ **Authentification intégrée**
- ✅ **Temps réel** avec subscriptions
- ✅ **Edge Functions** pour la logique backend

### Configuration
```bash
# Utiliser la configuration existante
npm run deploy:netlify
```

### Structure
```
Frontend: Netlify (React + Vite)
Backend: Supabase (PostgreSQL + Edge Functions)
Auth: Supabase Auth
Storage: Supabase Storage
```

---

## 🖥️ Option 2 : Hostinger + Laravel + MySQL

### Avantages
- ✅ **Contrôle total** du serveur et de la base de données
- ✅ **Coût prévisible** (hébergement mutualisé ~3€/mois)
- ✅ **Laravel ecosystem** (Eloquent, Queues, etc.)
- ✅ **MySQL** familier pour beaucoup de développeurs
- ✅ **Pas de limite** de requêtes API
- ✅ **Personnalisation** avancée possible

### Configuration
```bash
# Build pour Hostinger
npm run deploy:hostinger

# Le script génère un package complet avec :
# - Frontend React build
# - Backend Laravel complet
# - Base de données MySQL
# - Configuration Apache
```

### Structure
```
Frontend: Hostinger public_html/ (React build statique)
Backend: Hostinger public_html/api/ (Laravel API)
Database: MySQL (Hostinger)
Auth: Laravel Sanctum
```

---

## 🔄 Basculement entre les modes

### Développement local
```bash
# Mode Supabase (défaut)
npm run dev

# Mode Laravel
VITE_BACKEND_TYPE=laravel npm run dev
```

### Build de production
```bash
# Build pour Netlify + Supabase
npm run build:netlify

# Build pour Hostinger + Laravel
npm run build:hostinger
```

---

## 📁 Structure des fichiers

### Communs aux deux modes
- `src/components/` - Interface utilisateur React
- `src/pages/` - Pages de l'application
- `src/assets/` - Images et ressources

### Spécifiques Supabase
- `src/integrations/supabase/` - Client Supabase
- `supabase/` - Edge functions et migrations
- `netlify.toml` - Configuration Netlify

### Spécifiques Laravel
- `laravel-backend/` - API Laravel complète
- `src/services/ApiService.ts` - Abstraction API
- `hostinger-deploy/` - Fichiers de déploiement

### Abstractions unifiées
- `src/hooks/useUnifiedAuth.tsx` - Authentification unifiée
- `src/hooks/useUnifiedTransactions.tsx` - Gestion des transactions
- `src/config/deployment.ts` - Configuration de déploiement

---

## 🚀 Guide de déploiement

### Netlify + Supabase

1. **Configuration existante** (déjà prête)
2. **Push vers Git** et connexion Netlify
3. **Variables d'environnement** Netlify :
   ```
   VITE_BACKEND_TYPE=supabase
   VITE_SUPABASE_URL=https://bvleffevnnugjdwygqyz.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key
   ```

### Hostinger + Laravel

1. **Générer le package de déploiement** :
   ```bash
   npm run deploy:hostinger
   ```

2. **Uploader le contenu** de `hostinger-deploy/` vers `public_html/`

3. **Configurer la base de données** MySQL via panel Hostinger

4. **Importer le schéma** : `setup-database.sql`

5. **Configurer l'API** : Éditer `api/.env` avec vos credentials

---

## 🔧 Configuration avancée

### Variables d'environnement

#### Mode Supabase
```env
VITE_BACKEND_TYPE=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### Mode Laravel
```env
VITE_BACKEND_TYPE=laravel
VITE_LARAVEL_API_URL=https://your-domain.com/api
```

### Intégrations de paiement

Les deux modes supportent :
- ✅ **Moneroo** (Mobile Money FCFA)
- ✅ **NOWPayments** (Cryptomonnaies)

Configuration automatique selon le backend choisi.

---

## 📊 Comparaison des coûts

| Aspect | Netlify + Supabase | Hostinger + Laravel |
|--------|-------------------|-------------------|
| **Démarrage** | Gratuit | ~36€/an |
| **Scaling** | Pay-as-you-grow | Coût fixe |
| **Maintenance** | Minimal | Modéré |
| **Flexibilité** | Limitée | Totale |
| **Performance** | Excellente (CDN) | Dépend de l'hébergeur |

---

## 🎯 Recommandations

### Choisir Netlify + Supabase si :
- ✅ Vous débutez ou testez le concept
- ✅ Vous voulez un déploiement rapide
- ✅ Vous n'avez pas d'expertise backend
- ✅ Vous voulez des fonctionnalités temps réel

### Choisir Hostinger + Laravel si :
- ✅ Vous voulez un contrôle total
- ✅ Vous avez de l'expérience avec Laravel
- ✅ Vous planifiez une croissance importante
- ✅ Vous voulez des coûts prévisibles

---

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev                 # Mode Supabase
VITE_BACKEND_TYPE=laravel npm run dev  # Mode Laravel

# Build
npm run build:netlify      # Build pour Netlify
npm run build:hostinger    # Build pour Hostinger

# Déploiement
npm run deploy:netlify     # Package Netlify
npm run deploy:hostinger   # Package Hostinger complet
```

---

## 📚 Documentation détaillée

- 📖 `deploy.md` - Guide Netlify détaillé
- 📖 `hostinger-deploy/DEPLOYMENT_INSTRUCTIONS.md` - Guide Hostinger
- 📖 `laravel-backend/README.md` - Documentation API Laravel
- 🆕 **`MIGRATION_GUIDE.md`** - Guide complet de migration automatique
- 🆕 **`QUICK_START.md`** - Démarrage rapide du système d'automatisation
- 🆕 **`migration-tools/`** - Outils d'automatisation complets

## 🚀 Nouveau : Système d'automatisation

Exchange Pro dispose maintenant d'un **système complet d'automatisation** pour :

### 📋 Scripts d'automatisation
```bash
npm run config:env           # Configuration interactive des variables
npm run migrate:supabase     # Migration automatique entre projets Supabase
npm run functions:manage     # Gestionnaire d'Edge Functions
npm run functions:deploy     # Déploiement rapide des fonctions
npm run migration:help       # Aide sur les outils de migration
npm run migration:demo       # Démonstration du système
```

### 🎯 Fonctionnalités principales
- ✅ **Migration automatique** entre projets Supabase
- ✅ **Sauvegarde et restauration** automatique
- ✅ **Gestion des Edge Functions** avec interface interactive
- ✅ **Configuration des variables** d'environnement guidée
- ✅ **Support dual-mode** Supabase ↔ Laravel
- ✅ **Validation et tests** automatiques

### 🚀 Changement de base de données simplifié
Plus besoin de migration manuelle ! Le système automatise :
1. Sauvegarde de l'ancien projet
2. Export des migrations et fonctions
3. Configuration du nouveau projet
4. Déploiement automatique
5. Mise à jour des variables d'environnement
6. Génération de rapport détaillé

**➡️ Consultez `MIGRATION_GUIDE.md` pour le guide complet**

---

## 🆘 Support et troubleshooting

### Problèmes communs
1. **Variables d'environnement** : Vérifier la configuration selon le mode
2. **CORS** : Configuration automatique dans les deux modes
3. **Base de données** : Migrations automatiques incluses
4. **Paiements** : Clés API à configurer selon le backend

### Logs et debugging
- **Supabase** : Dashboard Supabase > Logs
- **Laravel** : `storage/logs/laravel.log`
- **Frontend** : Console navigateur

---

**🎉 Votre application est maintenant prête pour les deux modes de déploiement !**

Choisissez celui qui correspond le mieux à vos besoins et à votre niveau d'expertise.