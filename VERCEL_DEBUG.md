# Vercel Environment Variables Check

## Issue
User can see projects on localhost but NOT on Vercel deployment.

## Database Status
- **PostgreSQL (Supabase)**: 4 projects ✅
  - Construction Complexe Résidentiel Les Jardins
  - test
  - awydgyjawg
  - aaaaaaaaa
- **Users in DB**: 6 users

## Diagnosis
The problem is likely one of these:

### 1. Authentication Issue on Vercel
When you login on Vercel, your user account might not exist in the database yet, so the API blocks you.

### 2. Environment Variables Missing on Vercel
Vercel deployment might not have the correct DATABASE_URL or Supabase keys.

### 3. User Record Missing
Your login email on Vercel might be different from localhost, and that user doesn't exist in the DB.

## Solution Steps

### Step 1: Verify Vercel Environment Variables
Go to your Vercel dashboard and ensure these are set:
```
DATABASE_URL=postgresql://postgres.arxwxcoetubpsbhvjbap:Ss0646453558@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://arxwxcoetubpsbhvjbap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeHd4Y29ldHVicHNiaHZqYmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTY3MzQsImV4cCI6MjA4Mzc3MjczNH0.eBu1FdozPG9oh4w1hoTrFIwtgHydT4oSICvzvtLgcBg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeHd4Y29ldHVicHNiaHZqYmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE5NjczNCwiZXhwIjoyMDgzNzcyNzM0fQ.U9s80WeF6fZpPFqn6vDV6Ut3aPrhCUkxKXSdUVe84qw
```

### Step 2: Redeploy on Vercel
After setting environment variables, redeploy:
```bash
git add .
git commit -m "Fix: Add requirePermission function"
git push
```

### Step 3: Check User Account
The callback now auto-creates users, but verify which email you're using on Vercel.

## Current Users in Database
Run this to see all users:
```bash
node scripts/check-current-db.js
```
