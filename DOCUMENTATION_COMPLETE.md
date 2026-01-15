# 📚 DOCUMENTATION COMPLÈTE - BET PLATFORM
## Toute la configuration et l'historique du projet

---

# 🔐 CONFIGURATION & CREDENTIALS

## Supabase (Base de données)
- **Fichier de configuration**: `.env.local` (à la racine du projet)
- **Variables utilisées**:
  - `DATABASE_URL` - URL de connexion PostgreSQL
  - `NEXT_PUBLIC_SUPABASE_URL` - URL publique Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme
  - `SUPABASE_SERVICE_ROLE_KEY` - Clé de service

⚠️ **IMPORTANT**: Les credentials sont dans `.env.local` - NE JAMAIS les commiter sur Git!

## GitHub
- **Repository**: https://github.com/salaheddineouajjaj/bet-platform.git
- **Branche principale**: main
- **Workflow**: Push automatique après chaque modification importante

## Vercel (Déploiement)
- **URL Production**: https://bet-platform.vercel.app
- **Connexion**: Via compte GitHub

---

# 🔄 WORKFLOW GIT

Après chaque modification, je fais:
```bash
git add .
git commit -m "description du changement"
git push
```

Les commits sont automatiquement déployés sur Vercel.

---

# 🛠️ TOUTES LES CORRECTIONS EFFECTUÉES

## Session du 15 Janvier 2026

### 1. Page Remarques (`app/projects/[id]/remarks/page.jsx`)
**Problème**: `Cannot read properties of undefined (reading 'length')`
**Solution**: 
- Ajout `use` hook pour unwrap params
- Ajout vérification `remarks && remarks.length > 0`
- Ajout message "Aucune remarque pour ce projet"

### 2. Page Réunions (`app/projects/[id]/meetings/page.jsx`)
**Problème**: `meeting.participants.map is not a function`
**Solution**:
- Parsing JSON sécurisé avec try/catch pour participants
- Ajout `meetings && meetings.length > 0`
- Ajout `meeting.actionItems?.map()` avec optional chaining
- Ajout message "Aucune réunion pour ce projet"

### 3. Modal Nouvelle Réunion (`components/NewMeetingModal/NewMeetingModal.jsx`)
**Problème**: Participants stockés comme texte brut au lieu de JSON
**Solution**:
```javascript
const participantsArray = formData.participants.split(',').map(p => p.trim()).filter(p => p);
const participantsJSON = JSON.stringify(participantsArray);
```

### 4. API Réunions (`app/api/meetings/route.js`)
**Problème**: actionItems non chargés
**Solution**: Ajout dans le include:
```javascript
actionItems: {
    include: {
        assignedTo: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'asc' }
}
```

### 5. Page Décisions (`app/projects/[id]/decisions/page.jsx`)
**Problème**: `Cannot read properties of undefined (reading 'name')` sur decidedBy
**Solution**:
- Ajout `decision.decidedBy?.name || 'Inconnu'`
- Ajout `decisions && decisions.length > 0`
- Ajout message "Aucune décision pour ce projet"

### 6. Page Risques (`app/projects/[id]/risks/page.jsx`)
**Problème**: `Cannot read properties of undefined (reading 'name')` sur responsable et createdBy
**Solution**:
- Ajout `risk.responsable?.name || 'Non assigné'`
- Ajout `risk.createdBy?.name || 'Inconnu'`
- Ajout `risks && risks.length > 0`
- Ajout message "Aucun risque identifié"

### 7. API Risques (`app/api/risks/route.js`)
**Problème**: createdBy non inclus
**Solution**: Ajout dans l'include:
```javascript
createdBy: {
    select: { name: true, email: true }
}
```

### 8. API Documents (`app/api/documents/route.js`)
**Nouveau fichier créé** pour remplacer les mock data
```javascript
// GET /api/documents?projectId=xxx&path=xxx
// Récupère les documents depuis la DB
```

### 9. Page Documents (`app/projects/[id]/documents/page.jsx`)
**Problème**: Utilisait localStorage et mock data
**Solution**: Connexion à la nouvelle API `/api/documents`

---

# 📁 STRUCTURE DU PROJET

```
bet-platform/
├── .env.local              # ⚠️ CREDENTIALS ICI (ne pas commiter)
├── .gitignore              # Exclut .env.local
├── prisma/
│   └── schema.prisma       # Schéma base de données (18 tables)
├── app/
│   ├── api/                # Routes API
│   │   ├── projects/
│   │   ├── deliverables/
│   │   ├── documents/      # ✅ Nouveau
│   │   ├── remarks/
│   │   ├── meetings/       # ✅ Modifié
│   │   ├── decisions/
│   │   └── risks/          # ✅ Modifié
│   └── projects/
│       └── [id]/
│           ├── page.jsx         # Vue d'ensemble
│           ├── deliverables/
│           ├── documents/       # ✅ Modifié
│           ├── remarks/         # ✅ Modifié
│           ├── meetings/        # ✅ Modifié
│           ├── decisions/       # ✅ Modifié
│           └── risks/           # ✅ Modifié
├── components/
│   └── NewMeetingModal/    # ✅ Modifié
└── lib/
    ├── prisma.js
    ├── auth.js
    └── permissions.js
```

---

# 🚀 COMMANDES UTILES

## Démarrer le serveur de développement
```bash
cd "d:/anas next/bet-platform"
npm run dev
```
→ Accessible sur http://localhost:3000

## Régénérer Prisma Client (après modification du schema)
```bash
# 1. Stopper le serveur (Ctrl+C)
npx prisma generate
# 2. Relancer le serveur
npm run dev
```

## Pousser les modifications sur GitHub
```bash
git add .
git commit -m "description"
git push
```

## Appliquer des migrations
```bash
npx prisma db push
```

---

# 🎯 FONCTIONNALITÉS IMPLÉMENTÉES

## ✅ Authentification
- Login/Logout avec Supabase Auth
- 4 rôles: CHEF_DE_PROJET, REFERENT_LOT, CONTRIBUTEUR, EXTERNE
- RBAC (Role-Based Access Control)

## ✅ Gestion de Projets
- Création avec dates, enjeux, phases
- Vue d'ensemble dynamique
- Timeline par phase
- Contacts et points bloquants

## ✅ Livrables
- CRUD complet
- Statuts: À FAIRE → EN COURS → DÉPOSÉ → VALIDÉ
- Assignation responsable

## ✅ Documents (GED)
- Structure par dossiers (APS, APD, PRO...)
- Connecté à la base de données

## ✅ Remarques & Visa
- Création avec priorité
- Workflow de résolution
- Commentaires

## ✅ Réunions & CR
- Liste des participants (JSON)
- Compte rendu
- Actions avec assignation

## ✅ Décisions
- Journal immutable (audit trail)
- Types: Technique, MOA, Architecte

## ✅ Risques
- Impact: Délai, Coût, Pénalité
- Plan de mitigation
- Statuts: OPEN → MITIGATING → RESOLVED

---

# 📊 BASE DE DONNÉES

## Tables Principales (18 au total)
- User, Project, Deliverable, Document
- Remark, RemarkComment
- Meeting, ActionItem
- Decision, Risk
- ProjectContact, ActivityLog
- Et plus...

## Connexion
La connexion est gérée par Prisma via `DATABASE_URL` dans `.env.local`

---

# ⚠️ PROBLÈMES CONNUS ET SOLUTIONS

## "EPERM: operation not permitted" lors de prisma generate
**Cause**: Le serveur Next.js verrouille les fichiers
**Solution**: Stopper le serveur avant de générer

## Erreur "params was accessed directly"
**Cause**: Next.js 16 nécessite d'unwrap params avec `use()`
**Solution**: 
```javascript
import { use } from 'react';
const { id } = use(params);
```

## Mock data affiché au lieu des vraies données
**Cause**: Composant utilise localStorage ou données hardcodées
**Solution**: Créer une API et fetch les données

---

# 📅 HISTORIQUE DES COMMITS

- `fix: Add createdBy to risks API and optional chaining`
- `fix: Add safety checks for risks array and responsable object`
- `fix: Add safety checks for decisions array and decidedBy object`
- `fix: Include actionItems in meetings API and add safety check`
- `fix: Add JSON parsing safety and format participants correctly`
- `fix: Parse participants JSON and add safety checks in Meetings page`
- `fix: Add safety check for remarks array to prevent undefined error`

---

# 📝 RAPPORTS CRÉÉS

- `RAPPORT_BET_PLATFORM.md` - Rapport professionnel (en cours)
- `SESSION_HISTORY.md` - Ce fichier
- `VERIFICATION_STATUS.md` - Statut des vérifications

---

**Dernière mise à jour**: 15 Janvier 2026
