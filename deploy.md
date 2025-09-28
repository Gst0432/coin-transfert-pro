# Guide de Déploiement Netlify

## Étapes de déploiement

### 1. Préparer le repository
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Configuration Netlify

1. **Connecter le repository**
   - Aller sur [Netlify Dashboard](https://app.netlify.com)
   - Cliquer sur "New site from Git"
   - Choisir votre provider Git (GitHub, GitLab, etc.)
   - Sélectionner votre repository

2. **Paramètres de build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Variables d'environnement**
   Dans Site settings → Environment variables, ajouter :
   ```
   VITE_SUPABASE_URL=https://bvleffevnnugjdwygqyz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bGVmZmV2bm51Z2pkd3lncXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDQ4NTYsImV4cCI6MjA3NDU4MDg1Nn0.A3t2QG_Qi57mBinjfg9vTq979jp31b9VDVFEKDOguHk
   NODE_ENV=production
   ```

### 3. Configuration du domaine personnalisé (optionnel)

1. **Dans Netlify Dashboard**
   - Aller dans Site settings → Domain management
   - Cliquer sur "Add custom domain"
   - Entrer votre domaine (ex: exchange-pro.com)

2. **Configuration DNS**
   - Ajouter un enregistrement CNAME : `www` → `your-site.netlify.app`
   - Ajouter un enregistrement A : `@` → IP Netlify

### 4. Optimisations post-déploiement

1. **Performance**
   - Activer "Asset optimization" dans Site settings → Build & deploy
   - Activer "Pretty URLs"
   - Configurer les cache headers (déjà fait dans netlify.toml)

2. **Sécurité**
   - Vérifier les headers de sécurité (déjà configurés)
   - Activer HTTPS (automatique avec Netlify)
   - Configurer les redirections HTTPS

3. **Monitoring**
   - Configurer les notifications de déploiement
   - Activer les analytics Netlify (optionnel)

### 5. Configuration Supabase pour production

1. **URLs de redirection**
   Dans le dashboard Supabase → Authentication → URL Configuration :
   ```
   Site URL: https://your-site.netlify.app
   Redirect URLs: 
   - https://your-site.netlify.app
   - https://your-site.netlify.app/auth
   - https://your-site.netlify.app/**
   ```

2. **CORS Origins**
   Ajouter votre domaine Netlify dans les origines autorisées

### 6. Tests post-déploiement

- [ ] Vérifier que l'app se charge correctement
- [ ] Tester l'authentification
- [ ] Vérifier les API calls vers Supabase
- [ ] Tester les redirections
- [ ] Vérifier les headers de sécurité
- [ ] Tester la responsivité mobile

### 7. Commandes utiles

```bash
# Test local du build de production
npm run build
npm run preview

# Déployer manuellement (avec Netlify CLI)
netlify deploy --prod --dir=dist

# Voir les logs de déploiement
netlify logs
```

## Fichiers créés pour le déploiement

- `netlify.toml` - Configuration principale
- `public/_redirects` - Redirections SPA
- `public/_headers` - Headers de sécurité
- `.env.production` - Variables d'environnement
- `deploy.md` - Ce guide

## Troubleshooting

### Erreur 404 sur les routes
- Vérifier que `_redirects` est dans `public/`
- S'assurer que la règle SPA `/* /index.html 200` est présente

### Problèmes d'authentification
- Vérifier les URLs de redirection dans Supabase
- Contrôler les variables d'environnement

### Erreurs CORS
- Ajouter le domaine Netlify dans les origines Supabase
- Vérifier la configuration CSP dans les headers

### Build qui échoue
- Vérifier les dépendances dans package.json
- Contrôler les variables d'environnement
- Regarder les logs de build Netlify