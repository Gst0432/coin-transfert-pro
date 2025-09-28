#!/bin/bash

# Exchange Pro - Gestionnaire de Variables d'Environnement
# Ce script facilite la configuration des variables d'environnement lors du changement de base de données

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Fonction d'affichage avec couleurs
log() {
    local color=${2:-$NC}
    echo -e "${color}$1${NC}"
}

# Fonction pour demander une valeur avec valeur par défaut
ask_with_default() {
    local prompt="$1"
    local default_value="$2"
    local var_name="$3"
    
    if [[ -n "$default_value" ]]; then
        echo -e "${BLUE}${prompt} [${default_value}]:${NC}"
    else
        echo -e "${BLUE}${prompt}:${NC}"
    fi
    
    read -r value
    if [[ -z "$value" && -n "$default_value" ]]; then
        value="$default_value"
    fi
    
    eval "$var_name=\"$value\""
}

# Fonction pour demander une valeur secrète (masquée)
ask_secret() {
    local prompt="$1"
    local var_name="$2"
    
    echo -e "${BLUE}${prompt}:${NC}"
    read -r -s value
    echo
    eval "$var_name=\"$value\""
}

# Fonction pour détecter l'environnement actuel
detect_current_config() {
    log "\n🔍 Détection de la configuration actuelle..." "$YELLOW"
    
    # Lire les variables actuelles depuis .env
    if [[ -f ".env" ]]; then
        CURRENT_BACKEND_TYPE=$(grep "VITE_BACKEND_TYPE=" .env | cut -d'=' -f2 | tr -d '"' || echo "supabase")
        CURRENT_SUPABASE_URL=$(grep "VITE_SUPABASE_URL=" .env | cut -d'=' -f2 | tr -d '"' || echo "")
        CURRENT_SUPABASE_ANON_KEY=$(grep "VITE_SUPABASE_ANON_KEY=" .env | cut -d'=' -f2 | tr -d '"' || echo "")
        CURRENT_LARAVEL_API_URL=$(grep "VITE_LARAVEL_API_URL=" .env | cut -d'=' -f2 | tr -d '"' || echo "")
        
        log "✅ Configuration actuelle détectée :" "$GREEN"
        log "   Backend: $CURRENT_BACKEND_TYPE" "$GREEN"
        if [[ "$CURRENT_BACKEND_TYPE" == "supabase" ]]; then
            log "   URL Supabase: $CURRENT_SUPABASE_URL" "$GREEN"
        else
            log "   API Laravel: $CURRENT_LARAVEL_API_URL" "$GREEN"
        fi
    else
        log "⚠️  Aucun fichier .env trouvé" "$YELLOW"
        CURRENT_BACKEND_TYPE="supabase"
    fi
}

# Fonction pour choisir le mode de déploiement
choose_deployment_mode() {
    log "\n🎯 Choix du mode de déploiement" "$BLUE"
    log "================================" "$BLUE"
    
    echo "1. Supabase (Netlify + Supabase) - Recommandé pour MVP"
    echo "2. Laravel (Hostinger + Laravel) - Plus de contrôle"
    echo "3. Conserver le mode actuel ($CURRENT_BACKEND_TYPE)"
    echo
    
    while true; do
        echo -e "${BLUE}Choisissez votre mode de déploiement (1-3):${NC}"
        read -r choice
        
        case $choice in
            1)
                NEW_BACKEND_TYPE="supabase"
                DEPLOYMENT_MODE="netlify-supabase"
                break
                ;;
            2)
                NEW_BACKEND_TYPE="laravel"
                DEPLOYMENT_MODE="hostinger-laravel"
                break
                ;;
            3)
                NEW_BACKEND_TYPE="$CURRENT_BACKEND_TYPE"
                if [[ "$NEW_BACKEND_TYPE" == "supabase" ]]; then
                    DEPLOYMENT_MODE="netlify-supabase"
                else
                    DEPLOYMENT_MODE="hostinger-laravel"
                fi
                break
                ;;
            *)
                echo "Choix invalide. Choisissez 1, 2 ou 3."
                ;;
        esac
    done
    
    log "✅ Mode sélectionné: $DEPLOYMENT_MODE" "$GREEN"
}

# Configuration Supabase
configure_supabase() {
    log "\n🔧 Configuration Supabase" "$YELLOW"
    log "=========================" "$YELLOW"
    
    ask_with_default "URL du projet Supabase" "$CURRENT_SUPABASE_URL" "SUPABASE_URL"
    ask_secret "Clé anonyme Supabase (anon key)" "SUPABASE_ANON_KEY"
    ask_secret "Clé service role Supabase (optionnel)" "SUPABASE_SERVICE_ROLE_KEY"
    
    # Validation basique de l'URL
    if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
        log "⚠️  Format d'URL Supabase non standard détecté" "$YELLOW"
    fi
}

# Configuration Laravel
configure_laravel() {
    log "\n🔧 Configuration Laravel" "$YELLOW"
    log "========================" "$YELLOW"
    
    ask_with_default "URL de l'API Laravel" "$CURRENT_LARAVEL_API_URL" "LARAVEL_API_URL"
    
    # Configuration optionnelle de la base de données Laravel
    while true; do
        echo -e "${BLUE}Voulez-vous configurer les paramètres de base de données MySQL ? (oui/non):${NC}"
        read -r configure_db
        
        case $configure_db in
            [Oo]ui|[Yy]es)
                ask_with_default "Host de la base de données" "localhost" "DB_HOST"
                ask_with_default "Port de la base de données" "3306" "DB_PORT"
                ask_with_default "Nom de la base de données" "exchange_pro" "DB_DATABASE"
                ask_with_default "Utilisateur de la base de données" "root" "DB_USERNAME"
                ask_secret "Mot de passe de la base de données" "DB_PASSWORD"
                CONFIGURE_DB=true
                break
                ;;
            [Nn]on|[Nn]o)
                CONFIGURE_DB=false
                break
                ;;
            *)
                echo "Répondez par 'oui' ou 'non'"
                ;;
        esac
    done
}

# Configuration des clés de paiement
configure_payment_keys() {
    log "\n💳 Configuration des clés de paiement" "$YELLOW"
    log "====================================" "$YELLOW"
    
    # Moneroo (Mobile Money FCFA)
    log "🔹 Configuration Moneroo (Mobile Money FCFA):" "$BLUE"
    ask_secret "Clé API Moneroo" "MONEROO_API_KEY"
    ask_secret "Clé secrète Moneroo" "MONEROO_SECRET_KEY"
    
    echo
    # NOWPayments (Cryptomonnaies)
    log "🔹 Configuration NOWPayments (Cryptomonnaies):" "$BLUE"
    ask_secret "Clé API NOWPayments" "NOWPAYMENTS_API_KEY"
    
    echo
    # Configuration SMTP (optionnel)
    while true; do
        echo -e "${BLUE}Voulez-vous configurer SMTP pour les emails ? (oui/non):${NC}"
        read -r configure_smtp
        
        case $configure_smtp in
            [Oo]ui|[Yy]es)
                ask_with_default "Host SMTP" "smtp.gmail.com" "MAIL_HOST"
                ask_with_default "Port SMTP" "587" "MAIL_PORT"
                ask_with_default "Email d'envoi" "" "MAIL_FROM_ADDRESS"
                ask_secret "Mot de passe SMTP" "MAIL_PASSWORD"
                ask_with_default "Encryption (tls/ssl)" "tls" "MAIL_ENCRYPTION"
                CONFIGURE_SMTP=true
                break
                ;;
            [Nn]on|[Nn]o)
                CONFIGURE_SMTP=false
                break
                ;;
            *)
                echo "Répondez par 'oui' ou 'non'"
                ;;
        esac
    done
}

# Générer le fichier .env
generate_env_file() {
    log "\n📝 Génération des fichiers d'environnement..." "$YELLOW"
    
    # Sauvegarder l'ancien fichier .env s'il existe
    if [[ -f ".env" ]]; then
        cp ".env" ".env.backup.$(date +%Y%m%d_%H%M%S)"
        log "✅ Ancien fichier .env sauvegardé" "$GREEN"
    fi
    
    # Créer le nouveau fichier .env
    cat > ".env" << EOF
# Exchange Pro - Configuration Environment
# Generated on $(date)

# Backend Type: supabase or laravel
VITE_BACKEND_TYPE=$NEW_BACKEND_TYPE

EOF
    
    # Configuration spécifique au backend
    if [[ "$NEW_BACKEND_TYPE" == "supabase" ]]; then
        cat >> ".env" << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_ANON_KEY

EOF
        
        if [[ -n "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
            cat >> ".env" << EOF
# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

EOF
        fi
    else
        cat >> ".env" << EOF
# Laravel Configuration
VITE_LARAVEL_API_URL=$LARAVEL_API_URL

EOF
        
        if [[ "$CONFIGURE_DB" == true ]]; then
            cat >> ".env" << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_DATABASE=$DB_DATABASE
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD

EOF
        fi
    fi
    
    # Clés de paiement
    cat >> ".env" << EOF
# Payment Gateway Configuration
MONEROO_API_KEY=$MONEROO_API_KEY
MONEROO_SECRET_KEY=$MONEROO_SECRET_KEY
NOWPAYMENTS_API_KEY=$NOWPAYMENTS_API_KEY

EOF
    
    # Configuration SMTP si activée
    if [[ "$CONFIGURE_SMTP" == true ]]; then
        cat >> ".env" << EOF
# SMTP Configuration
MAIL_HOST=$MAIL_HOST
MAIL_PORT=$MAIL_PORT
MAIL_FROM_ADDRESS=$MAIL_FROM_ADDRESS
MAIL_PASSWORD=$MAIL_PASSWORD
MAIL_ENCRYPTION=$MAIL_ENCRYPTION

EOF
    fi
    
    # Variables génériques
    cat >> ".env" << EOF
# Application Configuration  
NODE_ENV=development
VITE_APP_NAME="Exchange Pro"
VITE_APP_VERSION="1.0.0"

# Debug & Logging
DEBUG=false
LOG_LEVEL=info
EOF
    
    log "✅ Fichier .env généré" "$GREEN"
}

# Générer le fichier .env.production
generate_env_production() {
    log "\n📝 Génération du fichier .env.production..." "$YELLOW"
    
    # Sauvegarder l'ancien fichier s'il existe
    if [[ -f ".env.production" ]]; then
        cp ".env.production" ".env.production.backup.$(date +%Y%m%d_%H%M%S)"
        log "✅ Ancien fichier .env.production sauvegardé" "$GREEN"
    fi
    
    # Copier .env vers .env.production avec des ajustements pour la production
    cp ".env" ".env.production"
    
    # Modifier les variables spécifiques à la production
    sed -i.bak 's/NODE_ENV=development/NODE_ENV=production/' ".env.production"
    sed -i.bak 's/DEBUG=false/DEBUG=false/' ".env.production"
    sed -i.bak 's/LOG_LEVEL=info/LOG_LEVEL=error/' ".env.production"
    
    # Supprimer le fichier de sauvegarde temporaire
    rm -f ".env.production.bak"
    
    log "✅ Fichier .env.production généré" "$GREEN"
}

# Mettre à jour les scripts NPM
update_package_scripts() {
    log "\n📦 Mise à jour des scripts NPM..." "$YELLOW"
    
    # Vérifier si package.json existe
    if [[ ! -f "package.json" ]]; then
        log "❌ package.json non trouvé" "$RED"
        return 1
    fi
    
    # Créer une sauvegarde
    cp "package.json" "package.json.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Ajouter ou mettre à jour les scripts de déploiement
    if [[ "$NEW_BACKEND_TYPE" == "supabase" ]]; then
        # Ajouter/mettre à jour les scripts pour Supabase
        npm pkg set scripts.build:netlify="VITE_BACKEND_TYPE=supabase npm run build"
        npm pkg set scripts.deploy:netlify="./deploy-scripts/build-for-netlify.sh"
        npm pkg set scripts.migrate:supabase="./migration-tools/migrate-supabase.sh"
    else
        # Ajouter/mettre à jour les scripts pour Laravel
        npm pkg set scripts.build:hostinger="VITE_BACKEND_TYPE=laravel npm run build"
        npm pkg set scripts.deploy:hostinger="./deploy-scripts/build-for-hostinger.sh"
    fi
    
    # Scripts communs
    npm pkg set scripts.config:env="./migration-tools/env-manager.sh"
    npm pkg set scripts.dev:supabase="VITE_BACKEND_TYPE=supabase npm run dev"
    npm pkg set scripts.dev:laravel="VITE_BACKEND_TYPE=laravel npm run dev"
    
    log "✅ Scripts NPM mis à jour" "$GREEN"
}

# Fonction de validation de la configuration
validate_configuration() {
    log "\n✅ Validation de la configuration..." "$YELLOW"
    
    local errors=0
    
    # Valider selon le backend choisi
    if [[ "$NEW_BACKEND_TYPE" == "supabase" ]]; then
        if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" ]]; then
            log "❌ Configuration Supabase incomplète" "$RED"
            errors=$((errors + 1))
        fi
        
        # Test de connectivité Supabase (basique)
        if command -v curl &> /dev/null; then
            if curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_ANON_KEY" > /dev/null 2>&1; then
                log "✅ Connectivité Supabase OK" "$GREEN"
            else
                log "⚠️  Impossible de vérifier la connectivité Supabase" "$YELLOW"
            fi
        fi
    else
        if [[ -z "$LARAVEL_API_URL" ]]; then
            log "❌ Configuration Laravel incomplète" "$RED"
            errors=$((errors + 1))
        fi
        
        # Test de connectivité Laravel (basique)
        if command -v curl &> /dev/null; then
            if curl -s "$LARAVEL_API_URL/health" > /dev/null 2>&1; then
                log "✅ Connectivité Laravel OK" "$GREEN"
            else
                log "⚠️  Endpoint Laravel non accessible (normal si pas encore déployé)" "$YELLOW"
            fi
        fi
    fi
    
    # Valider les clés de paiement
    if [[ -z "$MONEROO_API_KEY" || -z "$NOWPAYMENTS_API_KEY" ]]; then
        log "⚠️  Clés de paiement incomplètes - certaines fonctionnalités seront limitées" "$YELLOW"
    fi
    
    if [[ $errors -gt 0 ]]; then
        log "❌ $errors erreur(s) de configuration détectée(s)" "$RED"
        return 1
    else
        log "✅ Configuration validée avec succès" "$GREEN"
        return 0
    fi
}

# Générer le guide d'utilisation
generate_usage_guide() {
    log "\n📖 Génération du guide d'utilisation..." "$YELLOW"
    
    local guide_file="CONFIGURATION_GUIDE.md"
    
    cat > "$guide_file" << EOF
# Guide de Configuration - Exchange Pro
## Configuration générée le $(date)

### 🎯 Mode de déploiement configuré : $DEPLOYMENT_MODE

### 📋 Configuration actuelle

#### Backend : $NEW_BACKEND_TYPE
EOF
    
    if [[ "$NEW_BACKEND_TYPE" == "supabase" ]]; then
        cat >> "$guide_file" << EOF

#### Configuration Supabase
- **URL** : $SUPABASE_URL
- **Clé anonyme** : Configurée ✅
- **Mode** : Netlify + Supabase

##### Prochaines étapes pour Supabase :
1. Déployez vos migrations :
   \`\`\`bash
   npm run migrate:supabase
   \`\`\`

2. Construisez pour Netlify :
   \`\`\`bash
   npm run build:netlify
   \`\`\`

3. Déployez sur Netlify :
   \`\`\`bash
   npm run deploy:netlify
   \`\`\`

##### Variables d'environnement Netlify à configurer :
\`\`\`
VITE_BACKEND_TYPE=supabase
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=[votre_cle_anonyme]
MONEROO_API_KEY=[votre_cle_moneroo]
NOWPAYMENTS_API_KEY=[votre_cle_nowpayments]
\`\`\`
EOF
    else
        cat >> "$guide_file" << EOF

#### Configuration Laravel
- **API URL** : $LARAVEL_API_URL
- **Mode** : Hostinger + Laravel + MySQL

##### Prochaines étapes pour Laravel :
1. Construisez pour Hostinger :
   \`\`\`bash
   npm run build:hostinger
   \`\`\`

2. Déployez sur Hostinger :
   \`\`\`bash
   npm run deploy:hostinger
   \`\`\`

3. Configurez votre base de données MySQL sur Hostinger

4. Importez le schéma de base de données depuis \`hostinger-deploy/setup-database.sql\`

##### Configuration requise côté serveur :
- Editez \`api/.env\` avec vos credentials de base de données
- Configurez les clés API dans \`api/.env\`
EOF
    fi
    
    cat >> "$guide_file" << EOF

### 🚀 Scripts disponibles

#### Développement
\`\`\`bash
npm run dev               # Mode par défaut ($NEW_BACKEND_TYPE)
npm run dev:supabase      # Forcer le mode Supabase
npm run dev:laravel       # Forcer le mode Laravel
\`\`\`

#### Build et déploiement
\`\`\`bash
npm run build             # Build standard
EOF
    
    if [[ "$NEW_BACKEND_TYPE" == "supabase" ]]; then
        cat >> "$guide_file" << EOF
npm run build:netlify     # Build pour Netlify
npm run deploy:netlify    # Package pour Netlify
npm run migrate:supabase  # Migrer vers nouveau Supabase
EOF
    else
        cat >> "$guide_file" << EOF
npm run build:hostinger   # Build pour Hostinger  
npm run deploy:hostinger  # Package pour Hostinger
EOF
    fi
    
    cat >> "$guide_file" << EOF
\`\`\`

#### Gestion de la configuration
\`\`\`bash
npm run config:env        # Reconfigurer les variables d'environnement
\`\`\`

### 🔧 Changement de mode

Pour basculer entre Supabase et Laravel :
\`\`\`bash
npm run config:env  # Relancer la configuration
\`\`\`

### 🆘 Dépannage

#### Erreurs de build
- Vérifiez vos variables d'environnement dans \`.env\`
- Assurez-vous que toutes les clés API sont correctement configurées

#### Erreurs de connectivité
- **Supabase** : Vérifiez l'URL et la clé anonyme
- **Laravel** : Vérifiez que l'API est déployée et accessible

#### Restauration
En cas de problème, restaurez depuis la sauvegarde :
\`\`\`bash
cp .env.backup.[timestamp] .env
\`\`\`

### 📞 Support
- Documentation Supabase : https://supabase.com/docs
- Documentation Laravel : https://laravel.com/docs
- Documentation du projet : README.md

---
Guide généré automatiquement par Exchange Pro Configuration Tool
EOF
    
    log "✅ Guide généré : $guide_file" "$GREEN"
}

# Fonction principale
main() {
    echo
    log "🔧 Exchange Pro - Gestionnaire de Variables d'Environnement" "$BOLD$GREEN"
    log "=========================================================" "$GREEN"
    log "Ce script configure automatiquement vos variables d'environnement" "$YELLOW"
    echo
    
    # Détecter la configuration actuelle
    detect_current_config
    
    # Choisir le mode de déploiement
    choose_deployment_mode
    
    # Configuration selon le mode choisi
    if [[ "$NEW_BACKEND_TYPE" == "supabase" ]]; then
        configure_supabase
    else
        configure_laravel
    fi
    
    # Configuration des clés de paiement
    configure_payment_keys
    
    # Génération des fichiers
    generate_env_file
    generate_env_production
    update_package_scripts
    
    # Validation
    if validate_configuration; then
        generate_usage_guide
        
        log "\n🎉 Configuration terminée avec succès !" "$BOLD$GREEN"
        log "📋 Consultez CONFIGURATION_GUIDE.md pour les prochaines étapes" "$YELLOW"
        log "🚀 Vous pouvez maintenant lancer : npm run dev" "$GREEN"
    else
        log "\n⚠️  Configuration terminée avec des avertissements" "$YELLOW"
        log "📋 Vérifiez les erreurs ci-dessus et consultez CONFIGURATION_GUIDE.md" "$YELLOW"
    fi
}

# Exécution du script principal
main "$@"