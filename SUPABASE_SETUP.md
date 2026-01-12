# Supabase Setup Guide for BET Platform

This guide walks you through setting up Supabase for the BET Platform, step by step.

## 📋 Prerequisites

- Email address for Supabase account
- GitHub account (recommended for sign-up)

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Choose sign-up method:
   - **GitHub** (recommended - one-click)
   - Email & Password

### Step 2: Create New Project

1. Once logged in, click **"New Project"**
2. Select or create an organization:
   - If first time: Enter organization name (e.g., "BET Platform")
   - If existing: Select from dropdown

3. Fill in project details:
   ```
   Project Name: bet-platform
   Database Password: [Generate a strong password]
   Region: [Choose closest to you, e.g., Europe (Paris)]
   Pricing Plan: Free
   ```

4. **IMPORTANT**: Save your database password somewhere safe!
   - You'll need it for the DATABASE_URL
   - Example: Use a password manager or note app

5. Click **"Create new project"**
   - This takes about 2 minutes
   - You'll see a progress indicator

### Step 3: Get Database Connection String

1. In your new project dashboard, go to **Settings** (⚙️ icon in sidebar)

2. Click **Database** in the sidebar

3. Scroll down to **"Connection string"** section

4. Click on the **"Session pooler"** tab (Transaction mode)
   - This is optimized for serverless/Prisma

5. You'll see a connection string like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

6. **Copy this string** and replace `[YOUR-PASSWORD]` with the password you saved in Step 2

7. **Convert to MySQL format** (Prisma with MySQL provider):
   ```
   mysql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
   
   > Note: Just change `postgresql://` to `mysql://` at the beginning

8. This is your `DATABASE_URL` - save it!

### Step 4: Configure Authentication

1. Go to **Authentication** → **Providers** in sidebar

2. **Email Provider** (should be enabled by default):
   - Leave enabled
   - For development, you can disable "Confirm email" to skip email verification
   - For production, keep it enabled

3. Go to **Authentication** → **URL Configuration**

4. Add your development URL:
   ```
   Site URL: http://localhost:3000
   ```

5. Add redirect URLs (for development):
   ```
   Redirect URLs:
   http://localhost:3000/**
   ```

### Step 5: Create Storage Bucket

1. Go to **Storage** in the sidebar

2. Click **"Create a new bucket"**

3. Fill in:
   ```
   Name: documents
   Public bucket: OFF (keep it private)
   ```

4. Click **"Create bucket"**

5. Set bucket policies (for authenticated users):
   - Click on the `documents` bucket
   - Go to **Policies** tab
   - Click **"New Policy"**
   - Choose **"For full customization"**
   - Add this SQL:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid() = owner);
```

### Step 6: Get API Keys

1. Go to **Settings** → **API**

2. You'll see three important values:

   **Project URL**:
   ```
   https://[your-project-ref].supabase.co
   ```
   → This is your `NEXT_PUBLIC_SUPABASE_URL`

   **anon public** (under Project API keys):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **service_role** (under Project API keys - click "Reveal"):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   → This is your `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ **WARNING**: Keep `service_role` secret! Never commit it to Git or share it publicly.

3. Copy all three values - you'll need them for `.env.local`

### Step 7: Enable Realtime

1. Go to **Database** → **Replication**

2. After you run `npx prisma db push` (which creates the tables), come back here

3. Enable realtime for these tables:
   - `Deliverable`
   - `Remark`
   - `RemarkComment`
   - `ActivityLog`

4. For each table:
   - Find it in the list
   - Click the toggle to **Enable**
   - Leave "Insert", "Update", and "Delete" all checked

### Step 8: Create .env.local File

Now that you have all the values, create your `.env.local` file:

**Option 1: PowerShell**
```powershell
New-Item -Path .env.local -ItemType File -Force
notepad .env.local
```

**Option 2: Manually**
Create a file named `.env.local` in the project root.

**Content**:
```env
# Database (from Step 3)
DATABASE_URL="mysql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Supabase (from Step 6)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the placeholders with your actual values!

### Step 9: Initialize Database

Run these commands in order:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema to Supabase database
npx prisma db push

# 3. Seed with test data
npx prisma db seed
```

You should see output like:
```
🌱 Starting database seeding...
✅ Created 5 users
✅ Created project: Construction Complexe Résidentiel Les Jardins
...
🎉 Database seeding completed successfully!
```

### Step 10: Create Auth Users

Since we seeded database users but not Supabase auth users, you need to create them:

1. Go to **Authentication** → **Users** in Supabase

2. Click **"Add user"** → **"Create new user"**

3. Create users for testing (one at a time):

```
Email: chef@bet-platform.com
Password: [choose a password, e.g., Password123!]
Auto Confirm User: ✅ YES (for testing)
```

Repeat for:
- `structure@bet-platform.com`
- `cvc@bet-platform.com`
- `contrib@bet-platform.com`
- `moa@bet-platform.com`

### Step 11: Verify Setup

1. Open Prisma Studio to see your data:
```bash
npx prisma studio
```

2. Go to Supabase dashboard → **Table Editor**
   - You should see all your tables (User, Project, Deliverable, etc.)
   - Click on `User` table to see the 5 seeded users

3. Check **Storage** → `documents` bucket exists

4. Check **Authentication** → Users shows your 5 test users

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database connection string obtained
- [ ] API keys copied (URL, anon, service_role)
- [ ] Storage bucket `documents` created
- [ ] Bucket policies added
- [ ] `.env.local` file created with all values
- [ ] `npx prisma generate` successful
- [ ] `npx prisma db push` successful
- [ ] `npx prisma db seed` successful
- [ ] 5 auth users created in Supabase
- [ ] Realtime enabled for tables

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Check DATABASE_URL format (should start with `mysql://`)
- Verify project is fully initialized (wait 2-3 min after creation)
- Check your internet connection

### Error: "Authentication failed"
- Double-check password in DATABASE_URL
- Make sure there are no extra spaces
- Password special characters might need URL encoding

### Prisma push fails
```bash
# Try resetting
npx prisma migrate reset --force
npx prisma db push
```

### Can't access Supabase tables
- Make sure you used Session Pooler connection (not Direct connection)
- Verify region in connection string matches your project region

### Realtime not working
- Make sure tables are created first (run `npx prisma db push`)
- Enable replication for each table individually
- Restart Next.js dev server after enabling

## 📝 Notes

- **Free tier limits**:
  - 500 MB database
  - 1 GB file storage
  - 50,000 monthly active users
  - 2 GB bandwidth
  - Sufficient for development and demos!

- **Production setup**:
  - Enable email confirmation
  - Set up proper auth redirect URLs
  - Configure custom domain
  - Consider paid tier for larger projects

## 🔗 Helpful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)

## 🎉 You're Done!

Your Supabase backend is now fully configured! You can:
1. Run `npm run dev`
2. Test authentication with the test users
3. Upload documents
4. Create deliverables
5. See real-time updates

---

Need help? Check the README.md or create an issue in the project repository.
