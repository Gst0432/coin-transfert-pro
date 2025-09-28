#!/bin/bash

# Exchange Pro - Gestionnaire d'Edge Functions Supabase
# Ce script synchronise et déploie automatiquement les Edge Functions

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
FUNCTIONS_DIR="./supabase/functions"
BACKUP_DIR="./functions-backup_$(date +%Y%m%d_%H%M%S)"

# Fonction d'affichage avec couleurs
log() {
    local color=${2:-$NC}
    echo -e "${color}$1${NC}"
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log "\n🔍 Vérification des prérequis..." "$YELLOW"
    
    # Vérifier Supabase CLI
    if ! command -v supabase &> /dev/null; then
        log "❌ Supabase CLI n'est pas installé" "$RED"
        log "Installation requise : npm install -g supabase" "$YELLOW"
        return 1
    fi
    log "✅ Supabase CLI: $(supabase --version 2>/dev/null | head -n1)" "$GREEN"
    
    # Vérifier Deno (requis pour les Edge Functions)
    if ! command -v deno &> /dev/null; then
        log "❌ Deno n'est pas installé (requis pour les Edge Functions)" "$RED"
        log "Installation recommandée : curl -fsSL https://deno.land/install.sh | sh" "$YELLOW"
        return 1
    fi
    log "✅ Deno: $(deno --version | head -n1)" "$GREEN"
    
    # Vérifier la structure du projet
    if [[ ! -f "./supabase/config.toml" ]]; then
        log "❌ Projet Supabase non initialisé (config.toml manquant)" "$RED"
        return 1
    fi
    log "✅ Projet Supabase détecté" "$GREEN"
    
    return 0
}

# Fonction pour lister les fonctions existantes
list_functions() {
    log "\n📋 Edge Functions disponibles:" "$BLUE"
    
    if [[ -d "$FUNCTIONS_DIR" ]]; then
        local count=0
        for func_dir in "$FUNCTIONS_DIR"/*; do
            if [[ -d "$func_dir" ]]; then
                local func_name=$(basename "$func_dir")
                local has_index=false
                
                if [[ -f "$func_dir/index.ts" || -f "$func_dir/index.js" ]]; then
                    has_index=true
                    log "  ✅ $func_name" "$GREEN"
                else
                    log "  ⚠️  $func_name (pas de fichier index)" "$YELLOW"
                fi
                
                count=$((count + 1))
            fi
        done
        
        if [[ $count -eq 0 ]]; then
            log "  Aucune fonction trouvée" "$YELLOW"
        else
            log "\nTotal: $count fonction(s)" "$BLUE"
        fi
    else
        log "  Répertoire des fonctions non trouvé" "$YELLOW"
    fi
}

# Fonction pour créer une sauvegarde des fonctions
backup_functions() {
    log "\n💾 Sauvegarde des Edge Functions..." "$YELLOW"
    
    if [[ -d "$FUNCTIONS_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$FUNCTIONS_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
        
        # Créer un fichier de métadonnées
        cat > "$BACKUP_DIR/backup-info.json" << EOF
{
    "date": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
    "project": "Exchange Pro",
    "backup_dir": "$BACKUP_DIR",
    "functions_count": $(find "$FUNCTIONS_DIR" -maxdepth 1 -type d | tail -n +2 | wc -l)
}
EOF
        
        log "✅ Sauvegarde créée dans: $BACKUP_DIR" "$GREEN"
    else
        log "⚠️  Aucun répertoire de fonctions à sauvegarder" "$YELLOW"
    fi
}

# Fonction pour valider une fonction
validate_function() {
    local func_name="$1"
    local func_path="$FUNCTIONS_DIR/$func_name"
    
    if [[ ! -d "$func_path" ]]; then
        log "❌ Fonction '$func_name' non trouvée" "$RED"
        return 1
    fi
    
    if [[ ! -f "$func_path/index.ts" && ! -f "$func_path/index.js" ]]; then
        log "❌ Fonction '$func_name' sans fichier index" "$RED"
        return 1
    fi
    
    # Validation TypeScript/JavaScript basique
    local index_file=""
    if [[ -f "$func_path/index.ts" ]]; then
        index_file="$func_path/index.ts"
    else
        index_file="$func_path/index.js"
    fi
    
    # Vérifier la présence d'un handler de base
    if grep -q "serve\|handler\|export.*handler" "$index_file"; then
        log "✅ Fonction '$func_name' semble valide" "$GREEN"
        return 0
    else
        log "⚠️  Fonction '$func_name' pourrait avoir des problèmes de structure" "$YELLOW"
        return 0
    fi
}

# Fonction pour déployer toutes les fonctions
deploy_all_functions() {
    log "\n🚀 Déploiement de toutes les Edge Functions..." "$YELLOW"
    
    # Vérifier la connexion au projet
    if ! supabase status &> /dev/null; then
        log "❌ Projet Supabase non lié. Exécutez: supabase link --project-ref [your-ref]" "$RED"
        return 1
    fi
    
    # Déployer toutes les fonctions
    if supabase functions deploy; then
        log "✅ Toutes les fonctions déployées avec succès" "$GREEN"
        return 0
    else
        log "❌ Erreur lors du déploiement des fonctions" "$RED"
        return 1
    fi
}

# Fonction pour déployer une fonction spécifique
deploy_single_function() {
    local func_name="$1"
    
    log "\n🚀 Déploiement de la fonction '$func_name'..." "$YELLOW"
    
    # Valider d'abord la fonction
    if ! validate_function "$func_name"; then
        return 1
    fi
    
    # Déployer la fonction
    if supabase functions deploy "$func_name"; then
        log "✅ Fonction '$func_name' déployée avec succès" "$GREEN"
        return 0
    else
        log "❌ Erreur lors du déploiement de '$func_name'" "$RED"
        return 1
    fi
}

# Fonction pour tester les fonctions localement
test_functions_locally() {
    log "\n🧪 Test des fonctions en local..." "$YELLOW"
    
    # Démarrer l'environnement local Supabase
    log "Démarrage de l'environnement local..." "$YELLOW"
    
    # Vérifier si Docker est disponible
    if ! command -v docker &> /dev/null; then
        log "❌ Docker n'est pas installé (requis pour l'environnement local)" "$RED"
        return 1
    fi
    
    # Démarrer Supabase local
    if supabase start; then
        log "✅ Environnement local Supabase démarré" "$GREEN"
        log "🌐 Interface web : http://localhost:54323" "$BLUE"
        log "📡 API Gateway : http://localhost:54321/functions/v1/" "$BLUE"
        
        echo -e "${YELLOW}Les fonctions sont maintenant testables localement."
        echo -e "Pour arrêter l'environnement : supabase stop${NC}"
        
        return 0
    else
        log "❌ Erreur lors du démarrage de l'environnement local" "$RED"
        return 1
    fi
}

# Fonction pour synchroniser depuis un autre projet
sync_from_project() {
    local source_project_id="$1"
    
    if [[ -z "$source_project_id" ]]; then
        echo -e "${BLUE}ID du projet source:${NC}"
        read -r source_project_id
    fi
    
    log "\n🔄 Synchronisation depuis le projet $source_project_id..." "$YELLOW"
    
    # Cette fonctionnalité nécessiterait l'API Supabase Management
    # Pour l'instant, on suggère une approche manuelle
    log "⚠️  Synchronisation automatique non encore implémentée" "$YELLOW"
    log "📋 Pour synchroniser manuellement :" "$BLUE"
    log "1. Exportez les fonctions depuis l'ancien projet" "$BLUE"
    log "2. Copiez-les dans ./supabase/functions/" "$BLUE"
    log "3. Exécutez ce script pour les déployer" "$BLUE"
}

# Fonction pour créer une nouvelle fonction
create_new_function() {
    local func_name="$1"
    
    if [[ -z "$func_name" ]]; then
        echo -e "${BLUE}Nom de la nouvelle fonction:${NC}"
        read -r func_name
    fi
    
    # Valider le nom
    if [[ ! "$func_name" =~ ^[a-z][a-z0-9-]*[a-z0-9]$ ]]; then
        log "❌ Nom de fonction invalide. Utilisez uniquement des lettres minuscules, chiffres et tirets" "$RED"
        return 1
    fi
    
    local func_path="$FUNCTIONS_DIR/$func_name"
    
    if [[ -d "$func_path" ]]; then
        log "❌ La fonction '$func_name' existe déjà" "$RED"
        return 1
    fi
    
    log "\n✨ Création de la fonction '$func_name'..." "$YELLOW"
    
    # Créer le répertoire
    mkdir -p "$func_path"
    
    # Créer le fichier index.ts avec un template basique
    cat > "$func_path/index.ts" << EOF
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('${func_name} function called');

    // TODO: Implémentez votre logique ici
    const { data } = await req.json();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Function ${func_name} executed successfully',
      data 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in ${func_name}:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
EOF
    
    log "✅ Fonction '$func_name' créée avec succès" "$GREEN"
    log "📝 Editez le fichier : $func_path/index.ts" "$BLUE"
}

# Fonction pour afficher les logs
show_function_logs() {
    local func_name="$1"
    
    if [[ -z "$func_name" ]]; then
        # Afficher les logs de toutes les fonctions
        log "\n📊 Logs des Edge Functions..." "$YELLOW"
        supabase functions logs
    else
        log "\n📊 Logs de la fonction '$func_name'..." "$YELLOW"
        supabase functions logs --filter "function_name=$func_name"
    fi
}

# Menu interactif
show_menu() {
    echo
    log "🔧 Gestionnaire d'Edge Functions - Exchange Pro" "$BOLD$GREEN"
    log "============================================" "$GREEN"
    echo
    echo "1. Lister les fonctions disponibles"
    echo "2. Valider toutes les fonctions"
    echo "3. Déployer toutes les fonctions"
    echo "4. Déployer une fonction spécifique"
    echo "5. Tester les fonctions localement"
    echo "6. Créer une nouvelle fonction"
    echo "7. Afficher les logs"
    echo "8. Sauvegarder les fonctions"
    echo "9. Synchroniser depuis un autre projet"
    echo "0. Quitter"
    echo
}

# Fonction principale interactive
interactive_mode() {
    while true; do
        show_menu
        echo -e "${BLUE}Choisissez une option (0-9):${NC}"
        read -r choice
        
        case $choice in
            1)
                list_functions
                ;;
            2)
                log "\n🔍 Validation de toutes les fonctions..." "$YELLOW"
                for func_dir in "$FUNCTIONS_DIR"/*; do
                    if [[ -d "$func_dir" ]]; then
                        validate_function "$(basename "$func_dir")"
                    fi
                done
                ;;
            3)
                deploy_all_functions
                ;;
            4)
                list_functions
                echo -e "${BLUE}Nom de la fonction à déployer:${NC}"
                read -r func_name
                if [[ -n "$func_name" ]]; then
                    deploy_single_function "$func_name"
                fi
                ;;
            5)
                test_functions_locally
                ;;
            6)
                create_new_function
                ;;
            7)
                echo -e "${BLUE}Nom de la fonction (laissez vide pour toutes):${NC}"
                read -r func_name
                show_function_logs "$func_name"
                ;;
            8)
                backup_functions
                ;;
            9)
                sync_from_project
                ;;
            0)
                log "\n👋 Au revoir!" "$GREEN"
                exit 0
                ;;
            *)
                log "❌ Option invalide" "$RED"
                ;;
        esac
        
        echo -e "${YELLOW}Appuyez sur Entrée pour continuer...${NC}"
        read -r
    done
}

# Fonction principale
main() {
    # Vérifier les prérequis
    if ! check_prerequisites; then
        log "\n❌ Prérequis non satisfaits. Corrigez les erreurs ci-dessus." "$RED"
        exit 1
    fi
    
    # Si des arguments sont fournis, mode non-interactif
    if [[ $# -gt 0 ]]; then
        case "$1" in
            "list")
                list_functions
                ;;
            "deploy-all")
                deploy_all_functions
                ;;
            "deploy")
                if [[ -n "$2" ]]; then
                    deploy_single_function "$2"
                else
                    log "❌ Nom de fonction requis" "$RED"
                    exit 1
                fi
                ;;
            "test")
                test_functions_locally
                ;;
            "create")
                if [[ -n "$2" ]]; then
                    create_new_function "$2"
                else
                    log "❌ Nom de fonction requis" "$RED"
                    exit 1
                fi
                ;;
            "backup")
                backup_functions
                ;;
            "logs")
                show_function_logs "$2"
                ;;
            *)
                log "❌ Commande non reconnue: $1" "$RED"
                log "Commandes disponibles: list, deploy-all, deploy [name], test, create [name], backup, logs [name]" "$YELLOW"
                exit 1
                ;;
        esac
    else
        # Mode interactif
        interactive_mode
    fi
}

# Exécution du script principal
main "$@"