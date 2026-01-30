# Configuration Vercel pour BET-Platform

## Problème identifié
- Connexion lente sur Vercel
- Projets ne s'affichent pas après connexion
- Fonctionne normalement en local

## Solutions à appliquer

### 1. Variables d'environnement Vercel
Assurez-vous que toutes les variables suivantes sont configurées dans Vercel Dashboard:

```
DATABASE_URL=postgresql://postgres.arxwxcoetubpsbhvjbap:Ss0646453558@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://arxwxcoetubpsbhvjbap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeHd4Y29ldHVicHNiaHZqYmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTY3MzQsImV4cCI6MjA4Mzc3MjczNH0.eBu1FdozPG9oh4w1hoTrFIwtgHydT4oSICvzvtLgcBg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeHd4Y29ldHVicHNiaHZqYmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE5NjczNCwiZXhwIjoyMDgzNzcyNzM0fQ.U9s80WeF6fZpPFqn6vDV6Ut3aPrhCUkxKXSdUVe84qw
```

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
