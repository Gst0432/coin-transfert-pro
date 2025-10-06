# 🚀 Démarrage Rapide - Système de Migration Exchange Pro

## ⚡ Commandes essentielles

```bash
# 🎯 COMMENCER ICI
npm run migration:demo        # Démonstration complète du système
npm run migration:help        # Liste des commandes disponibles

# ⚙️ CONFIGURATION
npm run config:env           # Configuration interactive des variables

# 🗄️ MIGRATION SUPABASE  
npm run migrate:supabase     # Migration complète vers nouveau projet

# ⚡ GESTION DES FONCTIONS
npm run functions:manage     # Interface complète des Edge Functions
npm run functions:deploy     # Déploiement rapide de toutes les fonctions
npm run functions:test       # Test local avec Docker

# 🚀 DÉPLOIEMENT
npm run build:netlify        # Build pour Netlify + Supabase
npm run build:hostinger      # Build pour Hostinger + Laravel
npm run deploy:netlify       # Package complet Netlify  
npm run deploy:hostinger     # Package complet Hostinger
```

## 📋 Workflow de base

### 1️⃣ Configuration initiale
```bash
npm run config:env
# Choisir le mode (Supabase/Laravel)
# Configurer les clés API
# Configurer SMTP (optionnel)
```

### 2️⃣ Migration (si nécessaire)
```bash
npm run migrate:supabase
# Saisir les informations source et cible
# La migration s'effectue automatiquement
# Consulter MIGRATION_REPORT.md
```

### 3️⃣ Gestion des fonctions
```bash
npm run functions:manage
# Interface interactive pour :
# - Lister/valider/déployer les fonctions
# - Créer de nouvelles fonctions
# - Voir les logs
```

### 4️⃣ Test et validation
```bash
npm run dev                  # Test en développement
npm run functions:test       # Test local des fonctions (Docker requis)
```

### 5️⃣ Déploiement
```bash
# Pour Netlify + Supabase
npm run build:netlify && npm run deploy:netlify

# Pour Hostinger + Laravel
npm run build:hostinger && npm run deploy:hostinger
```

## 🔧 Cas d'usage courants

### Changer de projet Supabase
```bash
npm run migrate:supabase
# ✅ Migration automatique complète
# ✅ Sauvegarde de l'ancien projet
# ✅ Déploiement sur le nouveau projet
```

### Changer de backend (Supabase ↔ Laravel)
```bash
npm run config:env
# Choisir le nouveau mode
# Les scripts de build s'adaptent automatiquement
```

### Ajouter une nouvelle Edge Function
```bash
npm run functions:manage
# Option 6: Créer une nouvelle fonction
# Le template sera généré automatiquement
```

### Problème de configuration
```bash
npm run config:env
# Reconfiguration complète
# Validation automatique
```

## 📁 Fichiers importants générés

- `MIGRATION_REPORT.md` - Rapport de migration détaillé
- `CONFIGURATION_GUIDE.md` - Guide de configuration personnalisé  
- `migration-backup_*` - Sauvegardes automatiques
- `migration.log` - Logs détaillés

## 🆘 Aide et support

```bash
npm run migration:help       # Commandes disponibles
npm run migration:demo       # Démonstration complète
```

📖 **Guides complets :**
- `MIGRATION_GUIDE.md` - Guide détaillé
- `migration-tools/README.md` - Documentation technique
- `DUAL_DEPLOYMENT_README.md` - Guide des deux modes

⚠️ **En cas de problème :**
- Consultez `migration.log`
- Restaurez depuis `migration-backup_*`  
- Relancez `npm run config:env`

---
*Exchange Pro Migration System - Prêt à l'emploi ! 🚀*