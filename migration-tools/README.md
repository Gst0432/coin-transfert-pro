# 🛠️ Migration Tools - Exchange Pro

Outils d'automatisation pour la migration et le déploiement d'Exchange Pro.

## 📁 Contenu du dossier

### Scripts principaux

| Script | Description | Usage |
|--------|-------------|--------|
| `migrate-supabase.sh` | Migration complète entre projets Supabase | `npm run migrate:supabase` |
| `env-manager.sh` | Gestionnaire interactif de variables d'environnement | `npm run config:env` |
| `function-manager.sh` | Gestionnaire d'Edge Functions Supabase | `npm run functions:manage` |
| `supabase-migrator.js` | Version Node.js du migrateur (avancé) | `node migration-tools/supabase-migrator.js` |

## 🚀 Utilisation rapide

### Configuration initiale
```bash
# Configurer les variables d'environnement
npm run config:env
```

### Migration Supabase
```bash
# Migrer vers un nouveau projet Supabase
npm run migrate:supabase
```

### Gestion des fonctions
```bash
# Interface interactive pour les Edge Functions
npm run functions:manage

# Déployer toutes les fonctions rapidement
npm run functions:deploy
```

## 🔧 Scripts détaillés

### migrate-supabase.sh
- ✅ Sauvegarde complète du projet actuel
- ✅ Export des migrations et fonctions
- ✅ Configuration du nouveau projet
- ✅ Déploiement automatique
- ✅ Génération de rapport détaillé

### env-manager.sh
- ✅ Détection automatique de la configuration actuelle
- ✅ Support Supabase et Laravel
- ✅ Configuration des clés de paiement
- ✅ Configuration SMTP
- ✅ Validation de la configuration

### function-manager.sh
- ✅ Liste et validation des fonctions
- ✅ Déploiement individuel ou groupé
- ✅ Tests en local avec Docker
- ✅ Création de nouvelles fonctions
- ✅ Affichage des logs
- ✅ Sauvegarde des fonctions

## 📋 Prérequis

### Obligatoires
- Node.js 18+ et npm
- Git
- Bash (Linux/macOS/WSL)

### Recommandés
- Supabase CLI (`npm install -g supabase`)
- Deno (pour les Edge Functions)
- Docker (pour les tests locaux)

### Installation des prérequis
```bash
# Supabase CLI
npm install -g supabase

# Deno
curl -fsSL https://deno.land/install.sh | sh

# Vérification
supabase --version
deno --version
```

## 🔄 Flux de travail typique

### 1. Migration complète
```bash
# Étape 1: Migration automatique
npm run migrate:supabase

# Étape 2: Configuration finale
npm run config:env

# Étape 3: Test et validation
npm run dev
```

### 2. Changement de configuration
```bash
# Reconfiguration rapide
npm run config:env

# Test du changement
npm run dev:supabase  # ou dev:laravel
```

### 3. Déploiement des fonctions
```bash
# Interface complète
npm run functions:manage

# Déploiement rapide
npm run functions:deploy
```

## 📊 Fichiers générés

### Sauvegardes automatiques
- `migration-backup_YYYYMMDD_HHMMSS/` - Sauvegarde complète
- `functions-backup_YYYYMMDD_HHMMSS/` - Sauvegarde des fonctions
- `.env.backup.YYYYMMDD_HHMMSS` - Sauvegarde de configuration

### Rapports et guides
- `MIGRATION_REPORT.md` - Rapport de migration détaillé
- `CONFIGURATION_GUIDE.md` - Guide de configuration personnalisé
- `migration.log` - Logs détaillés de migration

## 🛠️ Personnalisation

### Variables d'environnement des scripts
```bash
# Répertoire de sauvegarde personnalisé
export BACKUP_DIR="./mes-sauvegardes"

# Mode debug
export DEBUG=true

# Délai d'attente personnalisé
export TIMEOUT=300
```

### Configuration avancée

Pour modifier le comportement des scripts, éditez les variables en début de fichier :

#### migrate-supabase.sh
```bash
BACKUP_DIR="./migration-backup_$(date +%Y%m%d_%H%M%S)"
MIGRATION_LOG="./migration.log"
```

#### function-manager.sh
```bash
FUNCTIONS_DIR="./supabase/functions"
BACKUP_DIR="./functions-backup_$(date +%Y%m%d_%H%M%S)"
```

## 🔍 Débogage

### Logs détaillés
```bash
# Voir les logs de migration
tail -f migration.log

# Logs des fonctions via Supabase
supabase functions logs

# Mode verbose pour tous les scripts
DEBUG=true npm run migrate:supabase
```

### Problèmes courants

#### Script non exécutable
```bash
chmod +x migration-tools/*.sh
```

#### Supabase CLI non trouvé
```bash
npm install -g supabase
export PATH="$PATH:$(npm root -g)/bin"
```

#### Erreur de permissions Docker
```bash
# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
# Puis redémarrer la session
```

## 📞 Support

### Ressources
- Guide complet : `../MIGRATION_GUIDE.md`
- Documentation Supabase : https://supabase.com/docs
- Issues GitHub : [Créer une issue](https://github.com/Gst0432/coin-transfert-pro/issues)

### Aide rapide
```bash
# Liste des commandes de migration
npm run migration:help

# Mode interactif pour les fonctions
npm run functions:manage

# Validation de la configuration
npm run config:env
```

---

*Migration Tools v1.0 - Exchange Pro*
*Créé le $(date) pour simplifier les migrations et déploiements*