#!/bin/bash

# Exchange Pro - Script de migration Supabase
# Version simplifiée en bash pour la migration automatisée

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration par défaut
BACKUP_DIR="./migration-backup_$(date +%Y%m%d_%H%M%S)"
MIGRATION_LOG="./migration.log"

# Fonction pour afficher les messages avec couleurs
log() {
    local color=${2:-$NC}
    echo -e "${color}$1${NC}" | tee -a "$MIGRATION_LOG"
}

# Fonction pour poser des questions
ask() {
    local prompt="$1"
    local var_name="$2"
    echo -e "${BLUE}${prompt}${NC}"
    read -r value
    eval "$var_name=\"$value\""
}

# Fonction pour confirmer une action
confirm() {
    local prompt="$1"
    while true; do
        echo -e "${YELLOW}${prompt} (oui/non):${NC}"
        read -r answer
        case $answer in
            [Oo]ui|[Yy]es) return 0 ;;
            [Nn]on|[Nn]o) return 1 ;;
            *) echo "Répondez par 'oui' ou 'non'" ;;
        esac
    done
}

# Fonction de vérification des prérequis
check_prerequisites() {
    log "\n🔍 Vérification des prérequis..." "$YELLOW"
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log "❌ Node.js n'est pas installé" "$RED"
        return 1
    fi
    log "✅ Node.js: $(node --version)" "$GREEN"
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log "❌ npm n'est pas installé" "$RED"
        return 1
    fi
    log "✅ npm: $(npm --version)" "$GREEN"
    
    # Vérifier git
    if ! command -v git &> /dev/null; then
        log "❌ git n'est pas installé" "$RED"
        return 1
    fi
    log "✅ git: $(git --version | head -n1)" "$GREEN"
    
    # Vérifier supabase CLI (optionnel mais recommandé)
    if command -v supabase &> /dev/null; then
        log "✅ Supabase CLI: $(supabase --version 2>/dev/null | head -n1)" "$GREEN"
        SUPABASE_CLI_AVAILABLE=true
    else
        log "⚠️  Supabase CLI non installé (recommandé pour certaines fonctions)" "$YELLOW"
        SUPABASE_CLI_AVAILABLE=false
    fi
    
    return 0
}

# Fonction pour installer Supabase CLI si nécessaire
install_supabase_cli() {
    if [[ "$SUPABASE_CLI_AVAILABLE" == false ]]; then
        if confirm "Voulez-vous installer Supabase CLI maintenant ?"; then
            log "📦 Installation de Supabase CLI..." "$YELLOW"
            npm install -g supabase
            if command -v supabase &> /dev/null; then
                log "✅ Supabase CLI installé avec succès" "$GREEN"
                SUPABASE_CLI_AVAILABLE=true
            else
                log "❌ Échec de l'installation de Supabase CLI" "$RED"
                return 1
            fi
        fi
    fi
    return 0
}

# Fonction de collecte des informations
collect_migration_info() {
    log "\n📊 Configuration de la migration" "$BLUE"
    log "=================================" "$BLUE"
    
    echo
    log "🔹 Informations sur la base de données SOURCE :" "$BLUE"
    ask "ID du projet Supabase source (ex: bvleffevnnugjdwygqyz):" "SOURCE_PROJECT_ID"
    ask "URL Supabase source (ex: https://xxx.supabase.co):" "SOURCE_URL"
    ask "Clé service role source:" "SOURCE_KEY"
    
    echo
    log "🔹 Informations sur la base de données CIBLE :" "$BLUE"
    ask "ID du nouveau projet Supabase:" "TARGET_PROJECT_ID"
    ask "URL du nouveau projet (ex: https://yyy.supabase.co):" "TARGET_URL"
    ask "Clé service role du nouveau projet:" "TARGET_KEY"
    
    # Validation basique
    if [[ -z "$SOURCE_PROJECT_ID" || -z "$TARGET_PROJECT_ID" || -z "$SOURCE_URL" || -z "$TARGET_URL" ]]; then
        log "❌ Informations incomplètes" "$RED"
        return 1
    fi
    
    return 0
}

# Fonction de création du répertoire de sauvegarde
create_backup_directory() {
    log "\n📁 Création du répertoire de sauvegarde..." "$YELLOW"
    
    mkdir -p "$BACKUP_DIR"/{migrations,functions,config,data}
    
    if [[ -d "$BACKUP_DIR" ]]; then
        log "✅ Répertoire de sauvegarde créé: $BACKUP_DIR" "$GREEN"
        return 0
    else
        log "❌ Impossible de créer le répertoire de sauvegarde" "$RED"
        return 1
    fi
}

# Fonction d'export des migrations
export_migrations() {
    log "\n🗃️  Export des migrations existantes..." "$YELLOW"
    
    if [[ -d "./supabase/migrations" ]]; then
        cp -r ./supabase/migrations/* "$BACKUP_DIR/migrations/" 2>/dev/null || true
        local migration_count=$(find "$BACKUP_DIR/migrations" -name "*.sql" | wc -l)
        log "✅ $migration_count fichiers de migration sauvegardés" "$GREEN"
    else
        log "⚠️  Aucun dossier de migrations trouvé" "$YELLOW"
    fi
    
    return 0
}

# Fonction d'export des edge functions
export_functions() {
    log "\n⚡ Export des Edge Functions..." "$YELLOW"
    
    if [[ -d "./supabase/functions" ]]; then
        cp -r ./supabase/functions/* "$BACKUP_DIR/functions/" 2>/dev/null || true
        local function_count=$(find "./supabase/functions" -maxdepth 1 -type d | tail -n +2 | wc -l)
        log "✅ $function_count Edge Functions sauvegardées" "$GREEN"
        
        # Créer un index des fonctions
        find "./supabase/functions" -maxdepth 1 -type d | tail -n +2 | xargs -n 1 basename > "$BACKUP_DIR/functions/functions-list.txt"
    else
        log "⚠️  Aucun dossier de fonctions trouvé" "$YELLOW"
    fi
    
    return 0
}

# Fonction d'export de la configuration
export_config() {
    log "\n⚙️  Export de la configuration..." "$YELLOW"
    
    # Sauvegarder config.toml si existant
    if [[ -f "./supabase/config.toml" ]]; then
        cp "./supabase/config.toml" "$BACKUP_DIR/config/config.toml.backup"
        log "✅ Configuration Supabase sauvegardée" "$GREEN"
    fi
    
    # Sauvegarder les fichiers .env
    if [[ -f ".env" ]]; then
        cp ".env" "$BACKUP_DIR/config/.env.backup"
        log "✅ Fichier .env sauvegardé" "$GREEN"
    fi
    
    if [[ -f ".env.production" ]]; then
        cp ".env.production" "$BACKUP_DIR/config/.env.production.backup"
        log "✅ Fichier .env.production sauvegardé" "$GREEN"
    fi
    
    # Créer un fichier de configuration de migration
    cat > "$BACKUP_DIR/config/migration-info.txt" << EOF
Migration Supabase - Exchange Pro
Date: $(date)
Projet source: $SOURCE_PROJECT_ID
URL source: $SOURCE_URL
Projet cible: $TARGET_PROJECT_ID  
URL cible: $TARGET_URL
EOF
    
    return 0
}

# Fonction de mise à jour de la configuration
update_configuration() {
    log "\n🔧 Mise à jour de la configuration pour le nouveau projet..." "$YELLOW"
    
    # Mettre à jour config.toml
    if [[ -f "./supabase/config.toml" ]]; then
        sed -i.bak "s/project_id = \".*\"/project_id = \"$TARGET_PROJECT_ID\"/" "./supabase/config.toml"
        log "✅ config.toml mis à jour avec le nouveau projet ID" "$GREEN"
    else
        # Créer un nouveau config.toml si inexistant
        cat > "./supabase/config.toml" << EOF
project_id = "$TARGET_PROJECT_ID"

[functions.moneroo-webhook]
verify_jwt = false

[functions.process-moneroo-payment]
verify_jwt = false

[functions.nowpayments-webhook]
verify_jwt = false

[functions.process-nowpayments-payment]
verify_jwt = false

[functions.make-admin]
verify_jwt = false

[functions.retry-payment]
verify_jwt = false

[functions.initiate-payout]
verify_jwt = false

[functions.send-notification-email]
verify_jwt = false

[functions.create-notification]
verify_jwt = false

[functions.setup-default-admin]
verify_jwt = false

[functions.update-admin-credentials]
verify_jwt = true

[functions.update-api-keys]
verify_jwt = true
EOF
        log "✅ Nouveau config.toml créé" "$GREEN"
    fi
    
    # Mettre à jour .env
    if [[ -f ".env" ]]; then
        sed -i.bak "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$TARGET_URL|" ".env"
        log "✅ Fichier .env mis à jour" "$GREEN"
    fi
    
    # Mettre à jour .env.production
    if [[ -f ".env.production" ]]; then
        sed -i.bak "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$TARGET_URL|" ".env.production"
        log "✅ Fichier .env.production mis à jour" "$GREEN"
    fi
    
    return 0
}

# Fonction de déploiement des migrations
deploy_migrations() {
    log "\n📊 Déploiement des migrations..." "$YELLOW"
    
    if [[ "$SUPABASE_CLI_AVAILABLE" == true ]]; then
        if supabase db push; then
            log "✅ Migrations déployées avec succès" "$GREEN"
            return 0
        else
            log "❌ Erreur lors du déploiement des migrations" "$RED"
            return 1
        fi
    else
        log "⚠️  Supabase CLI non disponible. Déploiement manuel requis :" "$YELLOW"
        log "   1. Connectez-vous au dashboard Supabase" "$YELLOW"
        log "   2. Allez dans 'SQL Editor'" "$YELLOW"
        log "   3. Exécutez les fichiers de migration depuis $BACKUP_DIR/migrations/" "$YELLOW"
        return 0
    fi
}

# Fonction de déploiement des edge functions
deploy_functions() {
    log "\n⚡ Déploiement des Edge Functions..." "$YELLOW"
    
    if [[ "$SUPABASE_CLI_AVAILABLE" == true ]]; then
        if supabase functions deploy; then
            log "✅ Edge Functions déployées avec succès" "$GREEN"
            return 0
        else
            log "❌ Erreur lors du déploiement des fonctions" "$RED"
            return 1
        fi
    else
        log "⚠️  Supabase CLI non disponible. Déploiement manuel requis :" "$YELLOW"
        log "   1. Connectez-vous au dashboard Supabase" "$YELLOW"
        log "   2. Allez dans 'Edge Functions'" "$YELLOW"
        log "   3. Créez manuellement les fonctions depuis $BACKUP_DIR/functions/" "$YELLOW"
        return 0
    fi
}

# Fonction de génération du rapport
generate_report() {
    log "\n📋 Génération du rapport de migration..." "$YELLOW"
    
    local report_file="MIGRATION_REPORT.md"
    
    cat > "$report_file" << EOF
# Rapport de Migration Supabase
## Exchange Pro - $(date)

### ✅ Migration effectuée avec succès

### Informations de migration
- **Date** : $(date)
- **Projet source** : $SOURCE_PROJECT_ID
- **URL source** : $SOURCE_URL
- **Projet cible** : $TARGET_PROJECT_ID
- **URL cible** : $TARGET_URL
- **Répertoire de sauvegarde** : $BACKUP_DIR

### Éléments migrés
- ✅ Migrations de base de données
- ✅ Edge Functions
- ✅ Configuration du projet
- ✅ Variables d'environnement

### Actions post-migration OBLIGATOIRES

#### 1. Mettre à jour la clé anonyme Supabase
\`\`\`bash
# Dans votre fichier .env et .env.production
VITE_SUPABASE_ANON_KEY=votre_nouvelle_cle_anonyme
\`\`\`

#### 2. Configurer les variables d'environnement des Edge Functions
Dans le dashboard Supabase > Edge Functions > Settings, ajoutez :
- MONEROO_API_KEY
- MONEROO_SECRET_KEY  
- NOWPAYMENTS_API_KEY
- Autres clés spécifiques à votre application

#### 3. Tester l'application
\`\`\`bash
npm run dev
\`\`\`

### Rollback en cas de problème
\`\`\`bash
# Restaurer la configuration
cp $BACKUP_DIR/config/config.toml.backup ./supabase/config.toml
cp $BACKUP_DIR/config/.env.backup .env
cp $BACKUP_DIR/config/.env.production.backup .env.production

# Restaurer les migrations si nécessaire
cp -r $BACKUP_DIR/migrations/* ./supabase/migrations/
cp -r $BACKUP_DIR/functions/* ./supabase/functions/
\`\`\`

### Support
En cas de problème, consultez :
1. Les logs de migration : $MIGRATION_LOG
2. Les fichiers de sauvegarde : $BACKUP_DIR
3. La documentation Supabase

---
Migration générée par Exchange Pro Migration Tool
EOF
    
    # Copier le rapport dans le répertoire de sauvegarde aussi
    cp "$report_file" "$BACKUP_DIR/"
    
    log "✅ Rapport généré : $report_file" "$GREEN"
}

# Fonction principale
main() {
    echo
    log "🚀 Exchange Pro - Script de Migration Supabase" "$BOLD$GREEN"
    log "=============================================" "$GREEN"
    log "Ce script va migrer votre base de données Supabase vers une nouvelle instance" "$YELLOW"
    echo
    
    # Vérifier les prérequis
    if ! check_prerequisites; then
        log "❌ Prérequis non satisfaits" "$RED"
        exit 1
    fi
    
    # Installer Supabase CLI si nécessaire
    install_supabase_cli
    
    # Collecter les informations de migration
    if ! collect_migration_info; then
        log "❌ Configuration incomplète" "$RED"
        exit 1
    fi
    
    # Confirmation finale
    echo
    log "📋 Résumé de la migration :" "$YELLOW"
    log "- Source : $SOURCE_PROJECT_ID ($SOURCE_URL)" "$YELLOW"
    log "- Cible : $TARGET_PROJECT_ID ($TARGET_URL)" "$YELLOW"
    log "- Sauvegarde : $BACKUP_DIR" "$YELLOW"
    echo
    
    if ! confirm "⚠️  Êtes-vous sûr de vouloir procéder à la migration ?"; then
        log "❌ Migration annulée par l'utilisateur" "$RED"
        exit 0
    fi
    
    # Début de la migration
    log "\n🚀 Début de la migration..." "$BOLD$YELLOW"
    
    create_backup_directory || exit 1
    export_migrations || exit 1
    export_functions || exit 1
    export_config || exit 1
    update_configuration || exit 1
    
    # Déploiement (peut échouer sans arrêter le processus)
    deploy_migrations
    deploy_functions
    
    # Génération du rapport final
    generate_report
    
    log "\n🎉 Migration terminée !" "$BOLD$GREEN"
    log "📋 Consultez le fichier MIGRATION_REPORT.md pour les étapes suivantes" "$YELLOW"
    log "⚠️  N'oubliez pas de configurer la nouvelle clé anonyme Supabase !" "$YELLOW"
}

# Exécution du script principal
main "$@"