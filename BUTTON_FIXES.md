# 🔐 ROLE-BASED BUTTON FUNCTIONALITY - IMPLEMENTATION STATUS

## ✅ COMPLETED:

### 1. Permissions System ✅
**File**: `lib/permissions.js`
**Features**:
- Role definitions (4 roles)
- Permission matrix
- `hasPermission()` function
- Lot-based access control
- Button visibility helper

---

## 🎯 BUTTON VISIBILITY BY ROLE:

### Chef de Projet (Full Access) ✅
**Can see and use ALL buttons:**
- ✅ ➕ Nouveau Projet
- ✅ ➕ Nouveau Livrable  
- ✅ ➕ Télécharger Document
- ✅ ➕ Nouvelle Remarque
- ✅ ➕ Nouvelle Réunion
- ✅ ➕ Nouvelle Décision
- ✅ ➕ Identifier un Risque
- ✅ ✓ Valider (deliverables)

### Référent Lot (Structure/CVC) ✅
**Can see:**
- ❌ ~~Nouveau Projet~~ (HIDDEN)
- ✅ ➕ Nouveau Livrable (own lot only)
- ✅ ➕ Télécharger Document (own lot only)
- ✅ ➕ Nouvelle Remarque
- ❌ ~~Nouvelle Réunion~~ (HIDDEN)
- ❌ ~~Nouvelle Décision~~ (HIDDEN)
- ✅ ➕ Identifier un Risque
- ❌ ~~Valider~~ (HIDDEN - only Chef can validate)

### Contributeur (Électricité) ✅
**Can see:**
- ❌ ~~Nouveau Projet~~ (HIDDEN)
- ❌ ~~Nouveau Livrable~~ (HIDDEN - can't create, only edit assigned)
- ✅ ➕ Télécharger Document (assigned deliverables only)
- ❌ ~~Nouvelle Remarque~~ (HIDDEN - can only comment)
- ❌ ~~Nouvelle Réunion~~ (HIDDEN)
- ❌ ~~Nouvelle Décision~~ (HIDDEN)
- ❌ ~~Identifier un Risque~~ (HIDDEN)
- ❌ ~~Valider~~ (HIDDEN)

### Externe (MOA) ✅
**Can see:**
- ❌ ~~Nouveau Projet~~ (HIDDEN)
- ❌ ~~Nouveau Livrable~~ (HIDDEN)
- ❌ ~~Télécharger Document~~ (HIDDEN - read-only)
- ❌ ~~Nouvelle Remarque~~ (HIDDEN - read-only)
- ❌ ~~Nouvelle Réunion~~ (HIDDEN)
- ✅ ➕ Nouvelle Décision (validation power!)
- ❌ ~~Identifier un Risque~~ (HIDDEN)
- ✅ ✓ Valider (can validate deliverables)

---

## 📋 IMPLEMENTATION PROGRESS:

### Stage 1: Permissions System ✅ DONE
- [x] Create `lib/permissions.js`
- [x] Define all roles
- [x] Define all permissions
- [x] Create helper functions

### Stage 2: Update Projects Page (In Progress)
- [ ] Add role check to "Nouveau Projet" button
- [ ] Create NewProjectModal component
- [ ] Connect to POST /api/projects
- [ ] Show success/error messages
- [ ] Refresh list after creation

### Stage 3: Update Deliverables Page (ONGLET 2)
- [ ] Add role check to "Nouveau Livrable" button
- [ ] Add lot filtering for Référent Lot
- [ ] Create NewDeliverableModal component
- [ ] Connect to POST /api/deliverables
- [ ] Refresh Kanban after creation

### Stage 4: Update Documents Page (ONGLET 3)
- [ ] Add role check to "Télécharger" button
- [ ] Add lot filtering
- [ ] Create file upload modal
- [ ] Connect to POST /api/documents
- [ ] Handle file upload to Supabase Storage
- [ ] Show PDF preview for "Voir" button

### Stage 5: Update Remarks Page (ONGLET 4)
- [ ] Add role check to "Nouvelle Remarque" button
- [ ] Create NewRemarkModal component
- [ ] Connect to POST /api/remarks
- [ ] Refresh list after creation
- [ ] Add comment form (all roles)

### Stage 6: Update Meetings Page (ONGLET 5)
- [ ] Add role check to "Nouvelle Réunion" button
- [ ] Create NewMeetingModal component
- [ ] Connect to POST /api/meetings
- [ ] Add action items section

### Stage 7: Update Decisions Page (ONGLET 6)
- [ ] Add role check to "Nouvelle Décision" button
- [ ] Create NewDecisionModal component
- [ ] Connect to POST /api/decisions
- [ ] Show for Chef + Externe only

### Stage 8: Update Risks Page (ONGLET 7)
- [ ] Add role check to "Identifier un Risque" button
- [ ] Create NewRiskModal component
- [ ] Connect to POST /api/risks
- [ ] Show for Chef + Référent Lot only

---

## 🔒 SECURITY IMPLEMENTATION:

### Frontend (UI Level):
```javascript
// Example: Show button only if user has permission
import { hasPermission } from '@/lib/permissions';

{hasPermission(user.role, 'CREATE_PROJECT') && (
  <button onClick={openModal}>➕ Nouveau Projet</button>
)}
```

### Backend (API Level):
All API endpoints already have RBAC checks in `lib/auth.js`:
- ✅ POST /api/projects - checks role
- ✅ POST /api/deliverables - checks role + lot
- ✅ POST /api/documents - checks role + lot
- ✅ POST /api/remarks - checks role
- ✅ POST /api/meetings - checks role
- ✅ POST /api/decisions - checks role
- ✅ POST /api/risks - checks role

---

## 📊 ESTIMATED TIME:

| Task | Time | Status |
|------|------|--------|
| Permissions system | 10 min | ✅ Done |
| Projects form | 20 min | ⏳ Next |
| Deliverables form | 20 min | ⏳ Pending |
| Documents upload | 25 min | ⏳ Pending |
| Remarks form | 15 min | ⏳ Pending |
| Meetings form | 20 min | ⏳ Pending |
| Decisions form | 15 min | ⏳ Pending |
| Risks form | 15 min | ⏳ Pending |
| Testing all roles | 20 min | ⏳ Pending |
| **TOTAL** | **~2.5 hours** | **5% done** |

---

## 🎯 PRIORITY ORDER:

Based on importance:

1. **HIGH**: Nouveau Livrable (most used feature)
2. **HIGH**: Nouvelle Remarque (collaboration)
3. **MEDIUM**: Télécharger Document
4. **MEDIUM**: Identifier un Risque
5. **MEDIUM**: Nouvelle Réunion
6. **MEDIUM**: Nouvelle Décision
7. **LOW**: Nouveau Projet (rarely created)

---

## ⚠️ IMPORTANT NOTES:

### Lot-Based Filtering:
- Référent Lot Structure can ONLY create/edit Structure deliverables
- Référent Lot CVC can ONLY create/edit CVC deliverables
- Contributeur can ONLY edit ASSIGNED deliverables
- Chef de Projet sees EVERYTHING

### User Context Required:
Each page needs to check:
```javascript
const userEmail = localStorage.getItem('userEmail');
// Then fetch user data to get role + lot
```

### Mock vs Real Data:
Currently using mock data. Forms will:
1. First: Create in memory (mock)
2. Later: Call real APIs when you're ready

---

## 🚀 NEXT STEPS:

Would you like me to:

**Option A**: Build all 6 forms now (2-3 hours of work)
**Option B**: Build just the HIGH priority ones first (Livrable + Remarque) (~40 min)
**Option C**: Build one complete example (Livrable) so you see the pattern (~20 min)

**I recommend Option B** - get the most important features working first!

What do you prefer?
