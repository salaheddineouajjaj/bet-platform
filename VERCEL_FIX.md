# Configuration Vercel pour BET-Platform

## Problème identifié
- Connexion lente sur Vercel
- Projets ne s'affichent pas après connexion
- Fonctionne normalement en local

## Solutions à appliquer

### 1. Variables d'environnement Vercel
Assurez-vous que toutes les variables suivantes sont configurées dans Vercel Dashboard:

```bash
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

⚠️ **IMPORTANT:** Ne commitez JAMAIS ces valeurs réelles! Utilisez uniquement les variables d'environnement Vercel.

### 2. Configuration Supabase Authentication

Allez dans votre Dashboard Supabase → Authentication → URL Configuration:

**Site URL:**
```
https://votre-app.vercel.app
```

**Redirect URLs (à ajouter):**
```
https://votre-app.vercel.app/auth/callback
https://votre-app.vercel.app/**
http://localhost:3000/**
```

### 3. Vérifier le middleware Next.js

Le fichier `middleware.js` doit gérer les redirections correctement.

### 4. Console Logs de Debug

Ajoutez des logs dans AuthContext pour voir où ça bloque sur Vercel:

```javascript
console.log('[AUTH] Loading user data...');
console.log('[AUTH] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

### 5. Vérifier la Prisma Connection

Prisma pourrait avoir des problèmes de cold start sur Vercel. Solution:

- Utiliser `directUrl` dans le schema Prisma
- Activer Prisma Accelerate (optionnel)
