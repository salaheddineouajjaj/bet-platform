# Configuration Supabase Storage pour les Documents

## ⚠️ Important - Configuration requise

Pour que l'upload de documents fonctionne, vous devez créer le bucket dans Supabase Storage:

### Étapes:

1. **Allez sur** https://supabase.com/dashboard
2. Sélectionnez votre projet **anxwxcoetubpsbhyjbap**
3. Dans le menu gauche, cliquez sur **Storage**
4. Cliquez sur **"New bucket"**
5. Configurez comme suit:
   - **Name**: `documents`
   - **Public bucket**: ✅ **ON** (Important pour pouvoir télécharger les fichiers)
   - **File size limit**: 50MB (ou plus selon vos besoins)
   - **Allowed MIME types**: Laissez vide pour tout accepter

6. Cliquez sur **"Create bucket"**

### Structure des fichiers:

Les documents seront stockés avec cette structure:
```
documents/
  └── projects/
      └── {projectId}/
          ├── 00_Admin/
          │   └── {timestamp}_{filename}
          ├── 01_APS/
          │   └── {timestamp}_{filename}
          ├── 02_APD/
          ├── 03_PRO/
          ├── 04_DCE/
          └── 05_ACT/
```

### Permissions RLS (Row Level Security):

Si besoin, ajoutez ces politiques de sécurité:

````sql
-- Allow authenticated users to read all documents
CREATE POLICY "Allow authenticated users to read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow users to delete their own uploaded documents
CREATE POLICY "Allow users to delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
````

---

## Variables d'environnement requises

Assurez-vous que vous avez dans votre `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://anxwxcoetubpsbhyjbap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

Le `SUPABASE_SERVICE_ROLE_KEY` est nécessaire pour uploader des fichiers depuis le backend.

---

## Formats de fichiers acceptés

Le système accepte actuellement:
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- AutoCAD (`.dwg`)

Vous pouvez modifier ça dans `components/UploadDocumentModal/UploadDocumentModal.jsx` ligne 115.

---

## Test

Une fois le bucket créé:
1. Connectez-vous en tant que Chef de Projet
2. Allez sur un projet
3. Onglet "Plans & Documents"
4. Cliquez sur "Télécharger un document"
5. Uploadez un PDF
6. Le fichier devrait apparaître dans la liste
7. Cliquez sur "Voir" pour l'ouvrir en nouvel onglet
8. Cliquez sur "Télécharger" pour le télécharger
