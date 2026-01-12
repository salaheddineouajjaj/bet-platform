# 🧪 BET PLATFORM - TEST ACCOUNTS

## 📧 All Test Accounts (Password: demo123)

Use these accounts to test different user roles and permissions:

---

### 1. 👔 Chef de Projet (Project Manager)
**Email**: `chef@bet-platform.com`  
**Password**: `demo123`  
**Permissions**: Full access to all features

**Can do:**
- ✅ Create/edit/delete projects
- ✅ Create/assign deliverables
- ✅ Upload documents
- ✅ Create/assign remarks
- ✅ Schedule meetings
- ✅ Record decisions
- ✅ Identify/manage risks
- ✅ View all lots
- ✅ Validate deliverables

---

### 2. 🏗️ Référent Lot - Structure  
**Email**: `structure@bet-platform.com`  
**Password**: `demo123`  
**Lot**: Structure  
**Permissions**: Full access to Structure lot

**Can do:**
- ✅ View all projects
- ✅ Create/edit deliverables for Structure lot
- ✅ Upload documents for Structure lot
- ✅ Create remarks
- ✅ Comment on remarks
- ✅ Submit deliverables for validation
- ❌ Cannot validate (needs Chef de Projet)
- ❌ Cannot access other lots' data

---

### 3. 🌡️ Référent Lot - CVC
**Email**: `cvc@bet-platform.com`  
**Password**: `demo123`  
**Lot**: CVC (Chauffage, Ventilation,Climatisation)  
**Permissions**: Full access to CVC lot

**Can do:**
- ✅ View all projects
- ✅ Create/edit deliverables for CVC lot
- ✅ Upload documents for CVC lot
- ✅ Create remarks
- ✅ Comment on remarks
- ✅ Submit deliverables for validation
- ❌ Cannot validate (needs Chef de Projet)
- ❌ Cannot access other lots' data

---

### 4. ⚡ Contributeur - Électricité
**Email**: `contrib@bet-platform.com`  
**Password**: `demo123`  
**Lot**: Électricité  
**Permissions**: Read/Write for assigned tasks only

**Can do:**
- ✅ View projects
- ✅ Edit assigned deliverables only
- ✅ Upload documents for assigned deliverables
- ✅ Comment on remarks
- ❌ Cannot create deliverables
- ❌ Cannot create remarks
- ❌ Cannot validate anything
- ❌ Limited access to other lots

---

### 5. 👁️ Externe - MOA (Maître d'Ouvrage)
**Email**: `moa@bet-platform.com`  
**Password**: `demo123`  
**Role**: External Observer  
**Permissions**: Read-only + Validation rights

**Can do:**
- ✅ View all projects
- ✅ View all deliverables
- ✅ View all documents
- ✅ Validate deliverables (MOA approval)
- ✅ Create decisions
- ❌ Cannot create projects
- ❌ Cannot upload documents
- ❌ Cannot create remarks
- ❌ Read-only for most features

---

## 🔄 How to Switch Between Accounts

### Method 1: Login Page
1. Go to `/auth/login`
2. Click on any test account button
3. Automatically logged in!

### Method 2: Logout and Re-login
1. Click "Déconnexion" button in navigation
2. Choose another test account

---

## 🧪 Testing Scenarios

### Scenario 1: Create and Validate a Deliverable
1. **Login as**: `chef@bet-platform.com`
2. **Create** a new deliverable
3. **Assign to**: Structure lot
4. **Logout** and login as: `structure@bet-platform.com`
5. **Edit** the deliverable
6. **Change status** to "À valider"
7. **Logout** and login as: `chef@bet-platform.com`
8. **Validate** the deliverable

### Scenario 2: Full Remark Workflow
1. **Login as**: `cvc@bet-platform.com`
2. **Create** a remark about coordination
3. **Assign to**: Structure lot
4. **Logout** and login as: `structure@bet-platform.com`
5. **View** the remark
6. **Add comment** responding to the issue
7. **Change status** to "En cours"
8. **Logout** and login as: `chef@bet-platform.com`
9. **Close** the remark after resolution

### Scenario 3: Document Upload and Review
1. **Login as**: `structure@bet-platform.com`
2. **Upload** a document (e.g., note de calcul)
3. **Logout** and login as: `moa@bet-platform.com`
4. **Review** the document
5. **Add decision** to validate or request changes

---

## 📊 Permission Matrix

| Feature | Chef Projet | Référent Lot | Contributeur | Externe |
|---------|:-----------:|:------------:|:------------:|:-------:|
| **Create Project** | ✅ | ❌ | ❌ | ❌ |
| **Create Deliverable** | ✅ | ✅ (own lot) | ❌ | ❌ |
| **Upload Document** | ✅ | ✅ (own lot) | ✅ (assigned) | ❌ |
| **Create Remark** | ✅ | ✅ | ❌ | ❌ |
| **Comment on Remark** | ✅ | ✅ | ✅ | ❌ |
| **Validate Deliverable** | ✅ | ❌ | ❌ | ✅ |
| **Create Meeting** | ✅ | ❌ | ❌ | ❌ |
| **Create Decision** | ✅ | ❌ | ❌ | ✅ |
| **Identify Risk** | ✅ | ✅ | ❌ | ❌ |
| **View All Lots** | ✅ | ❌ | ❌ | ✅ |
| **View Activity Log** | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 Security Notes

These are **test accounts** for development and demonstration purposes.

**For production:**
- Change all passwords
- Enable real Supabase authentication
- Add email verification
- Implement MFA (Multi-Factor Authentication)
- Set up proper session management

---

## 🎯 Quick Login Links

For your convenience, bookmark these:
- Login Page: `http://localhost:3000/auth/login` (local)
- Login Page: `https://your-app.vercel.app/auth/login` (production)

---

**Happy Testing!** 🚀
