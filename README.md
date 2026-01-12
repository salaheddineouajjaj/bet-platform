# BET Platform - Bureau d'Études Collaborative Platform

A full-stack Next.js application for Bureau d'Études (BET) to optimize inter-lot coordination during construction project study phases, following the ONGLET structure.

## 🎯 Project Overview

This platform helps BET teams:
- ✅ Track deliverables across project phases (APS → ACT)
- 📁 Manage documents with versioning (GED)
- 💬 Handle remarks and validations
- 📊 Monitor risks and delays
- 🤝 Coordinate between multiple lots
- 📈 Generate activity timelines

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript
- **Database**: MySQL (hosted on Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: CSS Modules (premium design)
- **Deployment**: Vercel

## 📂 Project Structure

```
bet-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   ├── projects/                 # Project pages
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── Kanban/Board/            # Kanban for deliverables
│   ├── DocumentUpload/          # File upload
│   └── ...
├── lib/                          # Utilities & helpers
│   ├── prisma.js                # Prisma client
│   ├── supabase.js              # Supabase client
│   ├── auth.js                  # Authentication & RBAC
│   ├── helpers.js               # Utility functions
│   └── validation.js            # Zod schemas
├── prisma/                       # Database
│   ├── schema.prisma            # Database schema
│   └── seed.js                  # Seed data
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── next.config.mjs              # Next.js configuration
└── package.json                  # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Basic knowledge of Next.js

### Installation

1. **Clone or navigate to the project**

```bash
cd "d:/anas next/bet-platform"
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase** (see SUPABASE_SETUP.md)

4. **Configure environment variables**

Create `.env.local` file (or use PowerShell to create it):

```bash
# Create the file with PowerShell
New-Item -Path .env.local -ItemType File -Force

# Then edit it and add your values
```

Required variables:
```env
DATABASE_URL="mysql://user:password@host:port/database"
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. **Initialize database**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with test data
npx prisma db seed
```

6. **Run development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 👥 User Roles & Permissions

### CHEF_DE_PROJET (Project Manager)
- ✅ Full access to all features
- ✅ Create/update projects
- ✅ Validate deliverables
- ✅ Make technical decisions
- ✅ Access all lots

### REFERENT_LOT (Lot Manager)
- ✅ Manage deliverables for their lot
- ✅ Upload documents for their lot
- ✅ Respond to remarks
- ❌ Cannot validate final deliverables

### CONTRIBUTEUR (Contributor)
- ✅ Upload documents for their lot
- ❌ Cannot validate or manage deliverables

### EXTERNE (External - MOA/Architect)
- ✅ Read-only access
- ✅ Can comment on remarks
- ✅ Can validate decisions

## 📋 ONGLET Structure (7 Tabs)

### ONGLET 1: Vue d'Ensemble
- Project summary & contacts
- Current phase
- Latest decisions
- Active blocking points
- Visual timeline

### ONGLET 2: Planning des Livrables
- Kanban board view
- Table view with filters
- Late deliverable alerts
- Real-time status updates

### ONGLET 3: Plans & Documents (GED)
- Fixed folder structure:
  - 00_Admin
  - 01_APS
  - 02_APD
  - 03_PRO
  - 04_DCE
  - 05_ACT
- Document versioning
- Preview & download

### ONGLET 4: Remarques & Visa
- Ticket system
- Priority management
- Real-time comments
- Status workflow

### ONGLET 5: Réunions & CR
- Meeting management
- Compte Rendu editor
- Action item tracking

### ONGLET 6: Décisions & Validations
- Technical decisions log
- MOA/Architect validations
- Immutable audit trail

### ONGLET 7: Risques & Retards
- Risk register
- Impact assessment (Delay/Cost/Penalty)
- Mitigation tracking

## 🧪 Test Users

After running `npx prisma db seed`, you'll have these test users:

```
Email: chef@bet-platform.com
Role: CHEF_DE_PROJET
Name: Marie Dupont

Email: structure@bet-platform.com
Role: REFERENT_LOT (Lot: Structure)
Name: Pierre Martin

Email: cvc@bet-platform.com
Role: REFERENT_LOT (Lot: CVC)
Name: Sophie Bernard

Email: contrib@bet-platform.com
Role: CONTRIBUTEUR (Lot: Électricité)
Name: Luc Moreau

Email: moa@bet-platform.com
Role: EXTERNE
Name: Jean Architecte
```

Note: You'll need to set passwords in Supabase Auth for these users.

## 🗄️ Database Schema

### Core Entities
- `User` - with role-based access control
- `Project` - with phases and contacts
- `Deliverable` - with status tracking
- `Document` - with versioning
- `Remark` - ticket system with comments
- `Meeting` - with action items
- `Decision` - immutable audit log
- `Risk` - impact tracking
- `ActivityLog` - global timeline

See `prisma/schema.prisma` for full schema.

## 🔐 Authentication Flow

1. User signs up via Supabase Auth
2. User profile created in database with role
3. Middleware checks auth on protected routes
4. RBAC enforced in API routes and UI

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed test data
npx prisma studio    # Open Prisma Studio

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🌐 Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See full deployment guide in the implementation plan.

## 📱 Features

### Real-time Updates
- Deliverable status changes
- Remark comments
- Activity timeline
- Powered by Supabase real-time subscriptions

### Advanced UI
- Drag & drop Kanban board
- Glassmorphism effects
- Smooth animations
- Responsive design
- Premium color palette

### File Management
- Upload to Supabase Storage
- Automatic versioning
- Preview support
- Download tracking

## 🐛 Troubleshooting

### Prisma Issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Supabase Connection
- Check DATABASE_URL format
- Verify Supabase project is active
- Check connection pooler settings

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

This is an academic project (ADS defense). For questions or improvements, contact the project team.

## 📄 License

Academic project - all rights reserved.

---

**Built for ADS Defense 2024** 🎓
