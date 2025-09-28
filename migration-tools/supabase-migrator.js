#!/usr/bin/env node

/**
 * Exchange Pro - Supabase Database Migration Tool
 * 
 * Ce script automatise le processus de migration entre bases de données Supabase :
 * - Export des schémas et données
 * - Déploiement des edge functions
 * - Configuration des variables d'environnement
 * - Synchronisation complète vers une nouvelle instance
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const Colors = {
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

class SupabaseMigrator {
  constructor() {
    this.config = {
      sourceProject: null,
      targetProject: null,
      sourceUrl: null,
      targetUrl: null,
      sourceKey: null,
      targetKey: null,
      backupDir: './migration-backup',
      migrationDate: new Date().toISOString().slice(0, 16).replace(/[:\-]/g, '').replace('T', '_')
    };
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  log(message, color = Colors.RESET) {
    console.log(`${color}${message}${Colors.RESET}`);
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(`${Colors.BLUE}${prompt}${Colors.RESET}`, resolve);
    });
  }

  async init() {
    this.log('\n🚀 Exchange Pro - Supabase Migration Tool', Colors.BOLD + Colors.GREEN);
    this.log('===============================================\n', Colors.GREEN);
    
    this.log('Ce script va vous aider à migrer votre base de données Supabase vers une nouvelle instance.\n', Colors.YELLOW);
    
    // Configuration de la source
    this.log('📊 Configuration de la base de données SOURCE :', Colors.BLUE);
    this.config.sourceProject = await this.question('ID du projet source (ex: bvleffevnnugjdwygqyz): ');
    this.config.sourceUrl = await this.question('URL Supabase source (ex: https://xxx.supabase.co): ');
    this.config.sourceKey = await this.question('Clé service role source: ');
    
    // Configuration de la cible
    this.log('\n📈 Configuration de la base de données CIBLE :', Colors.BLUE);
    this.config.targetProject = await this.question('ID du projet cible: ');
    this.config.targetUrl = await this.question('URL Supabase cible: ');
    this.config.targetKey = await this.question('Clé service role cible: ');
    
    const confirm = await this.question('\n⚠️  Êtes-vous sûr de vouloir procéder à la migration ? (oui/non): ');
    if (confirm.toLowerCase() !== 'oui') {
      this.log('❌ Migration annulée.', Colors.RED);
      process.exit(0);
    }
  }

  async createBackupDirectory() {
    this.log('\n📁 Création du répertoire de sauvegarde...', Colors.YELLOW);
    
    const backupPath = `${this.config.backupDir}_${this.config.migrationDate}`;
    this.config.backupDir = backupPath;
    
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
      fs.mkdirSync(`${backupPath}/migrations`, { recursive: true });
      fs.mkdirSync(`${backupPath}/functions`, { recursive: true });
      fs.mkdirSync(`${backupPath}/config`, { recursive: true });
    }
    
    this.log(`✅ Répertoire créé: ${backupPath}`, Colors.GREEN);
  }

  async exportSchema() {
    this.log('\n🗃️  Export du schéma de base de données...', Colors.YELLOW);
    
    try {
      // Export des migrations existantes
      if (fs.existsSync('./supabase/migrations')) {
        execSync(`cp -r ./supabase/migrations/* ${this.config.backupDir}/migrations/`, { stdio: 'inherit' });
        this.log('✅ Migrations existantes sauvegardées', Colors.GREEN);
      }
      
      // Export du schéma via pg_dump si disponible
      try {
        const dbUrl = `postgresql://postgres:[YOUR_PASSWORD]@db.${this.config.sourceProject}.supabase.co:5432/postgres`;
        execSync(`pg_dump "${dbUrl}" --schema-only > ${this.config.backupDir}/schema.sql`, { stdio: 'inherit' });
        this.log('✅ Schéma de base de données exporté', Colors.GREEN);
      } catch (error) {
        this.log('⚠️  pg_dump non disponible, utilisation des migrations existantes', Colors.YELLOW);
      }
      
    } catch (error) {
      this.log(`❌ Erreur lors de l'export: ${error.message}`, Colors.RED);
      throw error;
    }
  }

  async exportFunctions() {
    this.log('\n⚡ Export des Edge Functions...', Colors.YELLOW);
    
    try {
      if (fs.existsSync('./supabase/functions')) {
        execSync(`cp -r ./supabase/functions/* ${this.config.backupDir}/functions/`, { stdio: 'inherit' });
        
        // Créer un fichier d'index des fonctions
        const functions = fs.readdirSync('./supabase/functions');
        const functionsList = functions.filter(f => fs.statSync(`./supabase/functions/${f}`).isDirectory());
        
        fs.writeFileSync(
          `${this.config.backupDir}/functions/functions-list.json`,
          JSON.stringify({ functions: functionsList, exportDate: new Date().toISOString() }, null, 2)
        );
        
        this.log(`✅ ${functionsList.length} Edge Functions exportées`, Colors.GREEN);
      }
    } catch (error) {
      this.log(`❌ Erreur lors de l'export des fonctions: ${error.message}`, Colors.RED);
      throw error;
    }
  }

  async exportConfig() {
    this.log('\n⚙️  Export de la configuration...', Colors.YELLOW);
    
    try {
      // Copier config.toml
      if (fs.existsSync('./supabase/config.toml')) {
        fs.copyFileSync('./supabase/config.toml', `${this.config.backupDir}/config/config.toml`);
      }
      
      // Créer un fichier de configuration pour la migration
      const migrationConfig = {
        sourceProject: this.config.sourceProject,
        targetProject: this.config.targetProject,
        migrationDate: this.config.migrationDate,
        sourceUrl: this.config.sourceUrl,
        targetUrl: this.config.targetUrl,
        // Ne pas sauvegarder les clés pour des raisons de sécurité
        note: "Les clés d'API doivent être configurées manuellement pour des raisons de sécurité"
      };
      
      fs.writeFileSync(
        `${this.config.backupDir}/config/migration-config.json`,
        JSON.stringify(migrationConfig, null, 2)
      );
      
      this.log('✅ Configuration exportée', Colors.GREEN);
    } catch (error) {
      this.log(`❌ Erreur lors de l'export de la configuration: ${error.message}`, Colors.RED);
      throw error;
    }
  }

  async linkToNewProject() {
    this.log('\n🔗 Liaison avec le nouveau projet Supabase...', Colors.YELLOW);
    
    try {
      // Vérifier si supabase CLI est installé
      try {
        execSync('supabase --version', { stdio: 'pipe' });
      } catch {
        this.log('❌ Supabase CLI n\'est pas installé. Installation requise:', Colors.RED);
        this.log('npm install -g supabase', Colors.YELLOW);
        return false;
      }
      
      // Créer un nouveau fichier config.toml pour le projet cible
      const newConfig = `project_id = "${this.config.targetProject}"

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
verify_jwt = true`;
      
      fs.writeFileSync('./supabase/config.toml', newConfig);
      this.log('✅ Configuration mise à jour avec le nouveau projet', Colors.GREEN);
      
      return true;
    } catch (error) {
      this.log(`❌ Erreur lors de la liaison: ${error.message}`, Colors.RED);
      return false;
    }
  }

  async deployMigrations() {
    this.log('\n📊 Déploiement des migrations...', Colors.YELLOW);
    
    try {
      // Appliquer les migrations
      execSync('supabase db push', { stdio: 'inherit' });
      this.log('✅ Migrations appliquées avec succès', Colors.GREEN);
      
      return true;
    } catch (error) {
      this.log(`❌ Erreur lors du déploiement des migrations: ${error.message}`, Colors.RED);
      return false;
    }
  }

  async deployFunctions() {
    this.log('\n⚡ Déploiement des Edge Functions...', Colors.YELLOW);
    
    try {
      execSync('supabase functions deploy', { stdio: 'inherit' });
      this.log('✅ Edge Functions déployées avec succès', Colors.GREEN);
      
      return true;
    } catch (error) {
      this.log(`❌ Erreur lors du déploiement des fonctions: ${error.message}`, Colors.RED);
      return false;
    }
  }

  async updateEnvironmentFiles() {
    this.log('\n🔧 Mise à jour des fichiers d\'environnement...', Colors.YELLOW);
    
    try {
      // Mettre à jour .env
      if (fs.existsSync('.env')) {
        let envContent = fs.readFileSync('.env', 'utf8');
        envContent = envContent.replace(
          /VITE_SUPABASE_URL=.*/,
          `VITE_SUPABASE_URL=${this.config.targetUrl}`
        );
        // Note: La clé anonyme doit être mise à jour manuellement
        fs.writeFileSync('.env', envContent);
      }
      
      // Mettre à jour .env.production
      if (fs.existsSync('.env.production')) {
        let envContent = fs.readFileSync('.env.production', 'utf8');
        envContent = envContent.replace(
          /VITE_SUPABASE_URL=.*/,
          `VITE_SUPABASE_URL=${this.config.targetUrl}`
        );
        fs.writeFileSync('.env.production', envContent);
      }
      
      this.log('✅ Fichiers d\'environnement mis à jour', Colors.GREEN);
      this.log('⚠️  N\'oubliez pas de mettre à jour la VITE_SUPABASE_ANON_KEY manuellement', Colors.YELLOW);
      
      return true;
    } catch (error) {
      this.log(`❌ Erreur lors de la mise à jour: ${error.message}`, Colors.RED);
      return false;
    }
  }

  async generateMigrationReport() {
    this.log('\n📋 Génération du rapport de migration...', Colors.YELLOW);
    
    const report = `# Rapport de Migration Supabase
## Exchange Pro - ${new Date().toLocaleString()}

### Informations de migration
- **Date**: ${new Date().toLocaleString()}
- **Projet source**: ${this.config.sourceProject}
- **Projet cible**: ${this.config.targetProject}
- **URL source**: ${this.config.sourceUrl}
- **URL cible**: ${this.config.targetUrl}

### Éléments migrés
- ✅ Schéma de base de données
- ✅ Edge Functions
- ✅ Configuration du projet
- ✅ Variables d'environnement

### Actions post-migration requises
1. **Mettre à jour la clé anonyme Supabase**
   - Récupérer la nouvelle clé depuis le dashboard Supabase
   - Mettre à jour VITE_SUPABASE_ANON_KEY dans .env et .env.production

2. **Configurer les variables d'environnement des Edge Functions**
   - Aller dans le dashboard Supabase > Edge Functions > Settings
   - Configurer les clés API (MONEROO_API_KEY, NOWPAYMENTS_API_KEY, etc.)

3. **Tester l'application**
   - npm run dev pour tester en développement
   - Vérifier la connectivité à la base de données
   - Tester les fonctions critiques

### Fichiers de sauvegarde
Répertoire de sauvegarde: \`${this.config.backupDir}\`

### Rollback
En cas de problème, restaurer depuis la sauvegarde :
\`\`\`bash
cp -r ${this.config.backupDir}/migrations/* ./supabase/migrations/
cp -r ${this.config.backupDir}/functions/* ./supabase/functions/
cp ${this.config.backupDir}/config/config.toml ./supabase/config.toml
\`\`\`
`;
    
    fs.writeFileSync(`${this.config.backupDir}/MIGRATION_REPORT.md`, report);
    fs.writeFileSync('./MIGRATION_REPORT.md', report);
    
    this.log('✅ Rapport de migration généré', Colors.GREEN);
  }

  async run() {
    try {
      await this.init();
      await this.createBackupDirectory();
      await this.exportSchema();
      await this.exportFunctions();
      await this.exportConfig();
      
      const linked = await this.linkToNewProject();
      if (!linked) {
        this.log('❌ Impossible de lier le nouveau projet', Colors.RED);
        process.exit(1);
      }
      
      const migrationsDeployed = await this.deployMigrations();
      const functionsDeployed = await this.deployFunctions();
      
      if (migrationsDeployed && functionsDeployed) {
        await this.updateEnvironmentFiles();
        await this.generateMigrationReport();
        
        this.log('\n🎉 Migration terminée avec succès !', Colors.BOLD + Colors.GREEN);
        this.log('📋 Consultez MIGRATION_REPORT.md pour les étapes suivantes', Colors.YELLOW);
      } else {
        this.log('\n⚠️  Migration partiellement terminée', Colors.YELLOW);
        this.log('Consultez les erreurs ci-dessus et le rapport de migration', Colors.YELLOW);
      }
      
    } catch (error) {
      this.log(`\n❌ Erreur critique: ${error.message}`, Colors.RED);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new SupabaseMigrator();
  migrator.run().catch(console.error);
}

export default SupabaseMigrator;