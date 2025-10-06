# 🚀 Guide Complet de Migration et Déploiement Automatique
## Exchange Pro - Système d'Automatisation

Ce guide vous explique comment utiliser le système d'automatisation complet pour migrer entre bases de données et déployer votre application Exchange Pro.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation et prérequis](#installation-et-prérequis)
3. [Migration Supabase automatique](#migration-supabase-automatique)
4. [Gestion des variables d'environnement](#gestion-des-variables-denvironnement)
5. [Gestion des Edge Functions](#gestion-des-edge-functions)
6. [Scripts de déploiement](#scripts-de-déploiement)
7. [Changement de base de données](#changement-de-base-de-données)
8. [Résolution de problèmes](#résolution-de-problèmes)

---

## 🎯 Vue d'ensemble

Exchange Pro dispose maintenant d'un système complet d'automatisation qui vous permet de :

- ✅ **Migrer automatiquement** entre projets Supabase
- ✅ **Synchroniser** les migrations et edge functions
- ✅ **Gérer** les variables d'environnement de façon interactive
- ✅ **Changer** de backend (Supabase ↔ Laravel) facilement
- ✅ **Déployer** automatiquement selon la configuration
- ✅ **Sauvegarder** et restaurer en cas de problème

### 🛠️ Outils disponibles

| Script | Description | Utilisation |
|--------|-------------|-------------|
| `migrate-supabase.sh` | Migration complète entre projets Supabase | `npm run migrate:supabase` |
| `env-manager.sh` | Configuration interactive des variables | `npm run config:env` |
| `function-manager.sh` | Gestion des Edge Functions | `npm run functions:manage` |

---

## 🔧 Installation et prérequis

### Prérequis système

```bash
# Node.js et npm (déjà installés)
node --version  # v18+
npm --version

# Git (déjà installé)
git --version

# Supabase CLI (recommandé)
npm install -g supabase

# Deno (pour les Edge Functions)
curl -fsSL https://deno.land/install.sh | sh

# Docker (pour les tests locaux)
# Suivez les instructions sur docker.com
```

### Vérification de l'installation

```bash
# Vérifier tous les outils
npm run functions:manage  # Mode interactif pour vérifier
```

---

## 🗄️ Migration Supabase automatique

### Cas d'usage

Utilisez la migration automatique quand vous devez :
- 🔄 Changer de projet Supabase
- 🆕 Migrer vers un nouveau compte
- 🏢 Passer d'un environnement de test à la production
- 🌍 Changer de région pour des raisons de performance

### Processus de migration étape par étape

#### 1. Préparation

```bash
# S'assurer que le projet est à jour
git add . && git commit -m "Sauvegarde avant migration"
git push

# Lancer la migration
npm run migrate:supabase
```

#### 2. Processus automatique

Le script va vous demander :

1. **Informations source** :
   - ID du projet actuel
   - URL Supabase actuelle
   - Clé service role

2. **Informations cible** :
   - ID du nouveau projet
   - URL du nouveau projet
   - Clé service role du nouveau projet

3. **Confirmation** de la migration

#### 3. Actions automatisées

Le système va automatiquement :

1. 📁 **Créer une sauvegarde** complète
2. 🗃️ **Exporter** les migrations existantes
3. ⚡ **Sauvegarder** les Edge Functions
4. ⚙️ **Copier** la configuration
5. 🔗 **Lier** le nouveau projet
6. 📊 **Déployer** les migrations
7. ⚡ **Déployer** les Edge Functions
8. 🔧 **Mettre à jour** les fichiers d'environnement
9. 📋 **Générer** un rapport complet

#### 4. Actions post-migration

Après la migration, vous devez :

```bash
# Mettre à jour la clé anonyme dans .env
VITE_SUPABASE_ANON_KEY=votre_nouvelle_cle_anonyme

# Configurer les variables d'environnement des functions
# (voir section suivante)

# Tester l'application
npm run dev
```

### Exemple complet

```bash
$ npm run migrate:supabase

🚀 Exchange Pro - Script de Migration Supabase
=============================================

🔹 Informations sur la base de données SOURCE :
ID du projet Supabase source: bvleffevnnugjdwygqyz
URL Supabase source: https://bvleffevnnugjdwygqyz.supabase.co
Clé service role source: [saisie masquée]

🔹 Informations sur la base de données CIBLE :
ID du nouveau projet Supabase: abcdef123456
URL du nouveau projet: https://abcdef123456.supabase.co
Clé service role du nouveau projet: [saisie masquée]

⚠️ Êtes-vous sûr de vouloir procéder à la migration ? (oui/non): oui

🚀 Début de la migration...
✅ Répertoire de sauvegarde créé
✅ Migrations sauvegardées
✅ Edge Functions sauvegardées
✅ Configuration exportée
✅ Configuration mise à jour
✅ Migrations déployées
✅ Edge Functions déployées

🎉 Migration terminée !
📋 Consultez MIGRATION_REPORT.md pour les étapes suivantes
```

---

## ⚙️ Gestion des variables d'environnement

### Configuration interactive

```bash
# Lancer la configuration interactive
npm run config:env
```

### Processus de configuration

1. **Détection automatique** de la configuration actuelle
2. **Choix du mode** de déploiement (Supabase/Laravel)
3. **Configuration spécifique** selon le backend
4. **Configuration des clés** de paiement
5. **Configuration SMTP** (optionnelle)
6. **Génération automatique** des fichiers .env
7. **Validation** de la configuration
8. **Génération du guide** d'utilisation

### Modes supportés

#### Mode Supabase (Netlify)
- URL Supabase
- Clé anonyme
- Clé service role (optionnel)
- Clés de paiement (Moneroo, NOWPayments)
- Configuration SMTP

#### Mode Laravel (Hostinger)
- URL de l'API Laravel
- Configuration MySQL (optionnel)
- Clés de paiement
- Configuration SMTP

### Exemple de configuration

```bash
$ npm run config:env

🔧 Exchange Pro - Gestionnaire de Variables d'Environnement
=========================================================

🔹 Configuration actuelle détectée :
   Backend: supabase
   URL Supabase: https://bvleffevnnugjdwygqyz.supabase.co

🎯 Choix du mode de déploiement
1. Supabase (Netlify + Supabase)
2. Laravel (Hostinger + Laravel)  
3. Conserver le mode actuel (supabase)

Choisissez votre mode (1-3): 1

🔧 Configuration Supabase
URL du projet Supabase [https://...]: https://nouveau-projet.supabase.co
Clé anonyme Supabase: [saisie masquée]

💳 Configuration des clés de paiement
🔹 Configuration Moneroo:
Clé API Moneroo: [saisie masquée]
Clé secrète Moneroo: [saisie masquée]

✅ Configuration validée avec succès
🎉 Configuration terminée !
```

---

## ⚡ Gestion des Edge Functions

### Interface interactive

```bash
# Lancer le gestionnaire de fonctions
npm run functions:manage
```

### Fonctionnalités disponibles

1. **Lister** les fonctions disponibles
2. **Valider** toutes les fonctions
3. **Déployer** toutes les fonctions
4. **Déployer** une fonction spécifique
5. **Tester** les fonctions localement
6. **Créer** une nouvelle fonction
7. **Afficher** les logs
8. **Sauvegarder** les fonctions
9. **Synchroniser** depuis un autre projet

### Commandes rapides

```bash
# Déployer toutes les fonctions
npm run functions:deploy

# Tester localement
npm run functions:test

# Mode interactif complet
npm run functions:manage
```

### Test local des fonctions

```bash
# Démarrer l'environnement local
npm run functions:test

# Accès aux interfaces
# Interface web: http://localhost:54323
# API Gateway: http://localhost:54321/functions/v1/
```

### Créer une nouvelle fonction

```bash
# Via l'interface interactive
npm run functions:manage
# Puis choisir l'option 6

# Ou directement
./migration-tools/function-manager.sh create ma-nouvelle-fonction
```

---

## 🚀 Scripts de déploiement

### Scripts disponibles

```bash
# Développement
npm run dev              # Mode par défaut
npm run dev:supabase     # Forcer Supabase
npm run dev:laravel      # Forcer Laravel

# Build
npm run build            # Build standard
npm run build:netlify    # Build pour Netlify + Supabase
npm run build:hostinger  # Build pour Hostinger + Laravel

# Déploiement
npm run deploy:netlify   # Package complet Netlify
npm run deploy:hostinger # Package complet Hostinger

# Migration
npm run config:env       # Configuration variables
npm run migrate:supabase # Migration Supabase
npm run functions:manage # Gestion functions
npm run migration:help   # Aide sur les migrations
```

### Workflow de déploiement complet

#### Pour Netlify + Supabase

```bash
# 1. Configurer l'environnement
npm run config:env

# 2. Migrer si nécessaire
npm run migrate:supabase

# 3. Déployer les fonctions
npm run functions:deploy

# 4. Build pour Netlify
npm run build:netlify

# 5. Déployer sur Netlify
npm run deploy:netlify
# Puis uploader le contenu sur Netlify
```

#### Pour Hostinger + Laravel

```bash
# 1. Configurer l'environnement
npm run config:env

# 2. Build pour Hostinger
npm run build:hostinger

# 3. Déployer sur Hostinger
npm run deploy:hostinger
# Puis uploader exchange-pro-hostinger-deploy.zip
```

---

## 🔄 Changement de base de données

### Scénarios courants

#### 1. Supabase vers nouveau Supabase

```bash
# Migration complète automatique
npm run migrate:supabase
```

#### 2. Supabase vers Laravel

```bash
# 1. Reconfigurer pour Laravel
npm run config:env
# Choisir mode Laravel

# 2. Exporter les données Supabase manuellement
# (via dashboard ou SQL)

# 3. Build et déployer Laravel
npm run build:hostinger
npm run deploy:hostinger

# 4. Importer les données dans MySQL
# Utiliser le fichier setup-database.sql généré
```

#### 3. Laravel vers Supabase

```bash
# 1. Exporter les données MySQL
# mysqldump ou via phpMyAdmin

# 2. Créer nouveau projet Supabase

# 3. Reconfigurer pour Supabase
npm run config:env
# Choisir mode Supabase

# 4. Importer les données dans Supabase
# Via dashboard SQL Editor

# 5. Déployer
npm run functions:deploy
npm run build:netlify
```

### Checklist de migration

- [ ] ✅ Sauvegarder les données actuelles
- [ ] ✅ Créer le nouveau projet/base de données
- [ ] ✅ Lancer la migration automatique
- [ ] ✅ Configurer les nouvelles clés API
- [ ] ✅ Tester la connectivité
- [ ] ✅ Migrer les données utilisateur
- [ ] ✅ Tester toutes les fonctionnalités
- [ ] ✅ Mettre à jour la production

---

## 🛠️ Résolution de problèmes

### Erreurs communes

#### "Supabase CLI not found"
```bash
# Installer Supabase CLI
npm install -g supabase

# Vérifier l'installation
supabase --version
```

#### "Project not linked"
```bash
# Lier le projet manuellement
supabase link --project-ref votre-project-id
```

#### "Permission denied" sur scripts
```bash
# Rendre les scripts exécutables
chmod +x migration-tools/*.sh
chmod +x deploy-scripts/*.sh
```

#### Erreurs de build
```bash
# Vérifier les variables d'environnement
cat .env

# Reconfigurer si nécessaire
npm run config:env
```

#### Erreurs de connectivité Supabase
```bash
# Vérifier l'URL et les clés
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Tester la connectivité
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" $VITE_SUPABASE_URL/rest/v1/
```

### Restauration en cas d'erreur

#### Restaurer la configuration

```bash
# Lister les sauvegardes
ls -la *.backup.*

# Restaurer .env
cp .env.backup.YYYYMMDD_HHMMSS .env

# Restaurer config.toml
cp supabase/config.toml.backup supabase/config.toml
```

#### Restaurer les fonctions

```bash
# Lister les sauvegardes
ls -la functions-backup_*

# Restaurer les fonctions
cp -r functions-backup_YYYYMMDD_HHMMSS/* supabase/functions/
```

#### Rollback complet

```bash
# Si vous avez une sauvegarde Git
git reset --hard HEAD~1

# Ou restaurer depuis migration backup
cp -r migration-backup_YYYYMMDD_HHMMSS/config/* .
cp -r migration-backup_YYYYMMDD_HHMMSS/functions/* supabase/functions/
cp -r migration-backup_YYYYMMDD_HHMMSS/migrations/* supabase/migrations/
```

### Logs et debugging

```bash
# Voir les logs des functions
npm run functions:manage
# Puis option 7

# Logs détaillés de migration
tail -f migration.log

# Debug du build
npm run build -- --mode development

# Tester la configuration
npm run dev
```

### Support avancé

#### Variables d'environnement détaillées

```bash
# Voir toutes les variables
printenv | grep VITE_

# Tester les différents modes
VITE_BACKEND_TYPE=supabase npm run dev
VITE_BACKEND_TYPE=laravel npm run dev
```

#### Tests de connectivité

```bash
# Test Supabase
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
     $VITE_SUPABASE_URL/rest/v1/

# Test Laravel
curl $VITE_LARAVEL_API_URL/health
```

---

## 📞 Support et ressources

### Documentation officielle
- [Supabase Docs](https://supabase.com/docs)
- [Laravel Docs](https://laravel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

### Communauté
- [Supabase Discord](https://discord.supabase.com/)
- [Laravel Discord](https://discord.gg/laravel)

### Fichiers d'aide générés
- `MIGRATION_REPORT.md` - Rapport de migration
- `CONFIGURATION_GUIDE.md` - Guide de configuration
- `migration.log` - Logs de migration
- Répertoires de sauvegarde avec horodatage

---

*Guide généré automatiquement par Exchange Pro Migration System*
*Dernière mise à jour : $(date)*