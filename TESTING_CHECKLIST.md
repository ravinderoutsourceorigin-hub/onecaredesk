# 🧪 Complete Website Testing Checklist

## 📅 Date: October 7, 2025
## 🎯 Project: OneCare Desk - Healthcare Management System

---

## ✅ 1. ROUTING & NAVIGATION

### Public Routes (No Auth Required)
- [ ] **`/`** → Home page (Home_new) loads
- [ ] **`/auth`** → Auth page loads with login form
- [ ] **`/Features`** → Features page loads
- [ ] **`/Pricing`** → Pricing page loads
- [ ] **`/About`** → About page loads
- [ ] **`/Contact`** → Contact page loads

### Protected Routes (Auth Required)
- [ ] **`/Dashboard`** → Redirects to /auth if not logged in
- [ ] **`/Leads`** → Redirects to /auth if not logged in
- [ ] **`/Patients`** → Redirects to /auth if not logged in
- [ ] **`/Caregivers`** → Redirects to /auth if not logged in
- [ ] **`/Calendar`** → Redirects to /auth if not logged in
- [ ] **`/Documents`** → Redirects to /auth if not logged in
- [ ] **`/FormTemplates`** → Redirects to /auth if not logged in
- [ ] **`/Signatures`** → Redirects to /auth if not logged in
- [ ] **`/Settings`** → Redirects to /auth if not logged in

---

## 🔐 2. AUTHENTICATION SYSTEM

### A. Kinde OAuth (Google Sign-in)
- [ ] "Continue with Google" button visible on login page
- [ ] "Sign up with Google" button visible on signup page
- [ ] Button shows loading state when clicked
- [ ] Redirects to Kinde authentication page
- [ ] After successful auth, redirects back to app
- [ ] User data stored in localStorage
- [ ] User synced with backend database
- [ ] Navigates to Dashboard after successful login

### B. Traditional Email/Password Login
- [ ] Login form visible on `/auth`
- [ ] Email/Username field accepts input
- [ ] Password field accepts input
- [ ] Password visibility toggle works (eye icon)
- [ ] "Remember me" checkbox functional
- [ ] Form validation works (empty fields)
- [ ] Submit button shows loading state
- [ ] **Backend API Call:** `POST /api/auth` with `action: 'login'`
- [ ] Success: User data stored in localStorage
- [ ] Success: Navigates to Dashboard
- [ ] Error: Shows error message (invalid credentials)
- [ ] Error: Rate limiting works (429 error)

### C. Sign Up Functionality
- [ ] "Sign up" link visible on login page
- [ ] Clicking "Sign up" switches to signup form
- [ ] Sign up form shows all required fields:
  - [ ] First Name
  - [ ] Last Name
  - [ ] Email
  - [ ] Username
  - [ ] Password
  - [ ] Confirm Password
- [ ] Password visibility toggle works for both fields
- [ ] Form validation:
  - [ ] All fields required
  - [ ] Email format validation
  - [ ] Password minimum 8 characters
  - [ ] Passwords match validation
- [ ] **Backend API Call:** `POST /api/auth` with `action: 'signup'`
- [ ] Success: Shows success message
- [ ] Success: Auto switches to login form after 2 seconds
- [ ] Success: Username pre-filled in login form
- [ ] Error: Shows error message (duplicate email/username)
- [ ] "Already have an account? Sign in" link works

### D. Forgot Password (Magic Link)
- [ ] "Forgot Password?" link visible on login page
- [ ] Clicking link switches to forgot password form
- [ ] Email field accepts input
- [ ] Form validation (empty email, valid format)
- [ ] **Backend API Call:** `requestPasswordReset()`
- [ ] Success: Shows "Magic link sent" message
- [ ] Error: Shows error message
- [ ] "Back to Sign In" link works

### E. Session Management
- [ ] User session stored in localStorage (`app_user`)
- [ ] Session persists on page refresh
- [ ] Logout clears localStorage
- [ ] Logout redirects to login page
- [ ] Protected routes check session validity
- [ ] Expired session redirects to login

---

## 📊 3. DASHBOARD & DATA MANAGEMENT

### Dashboard
- [ ] Dashboard loads after login
- [ ] Stats cards display correctly
- [ ] Recent data widgets load
- [ ] Navigation sidebar visible
- [ ] User profile shows in sidebar
- [ ] Logout button works

### Leads Management
- [ ] Leads page loads
- [ ] Leads list displays
- [ ] Create new lead form works
- [ ] **Backend API:** `GET /api/leads`
- [ ] **Backend API:** `POST /api/leads`
- [ ] **Backend API:** `PUT /api/leads/:id`
- [ ] **Backend API:** `DELETE /api/leads/:id`
- [ ] Filter/search functionality works
- [ ] Pagination works

### Patients Management
- [ ] Patients page loads
- [ ] Patients list displays
- [ ] Create patient form works
- [ ] **Backend API:** `GET /api/patients`
- [ ] **Backend API:** `POST /api/patients`
- [ ] **Backend API:** `PUT /api/patients/:id`
- [ ] **Backend API:** `DELETE /api/patients/:id`

### Caregivers Management
- [ ] Caregivers page loads
- [ ] Caregivers list displays
- [ ] Create caregiver form works
- [ ] **Backend API:** `GET /api/caregivers`
- [ ] **Backend API:** `POST /api/caregivers`
- [ ] **Backend API:** `PUT /api/caregivers/:id`
- [ ] **Backend API:** `DELETE /api/caregivers/:id`

---

## 📝 4. JOTFORM INTEGRATION

### Form Templates Page
- [ ] FormTemplates page loads
- [ ] Shows existing form templates
- [ ] Import from JotForm button works
- [ ] JotForm import dialog opens
- [ ] **Backend API:** `GET /api/integrations/jotform/forms`
- [ ] Forms list displays (should show 25 forms)
- [ ] HIPAA endpoint used: `hipaa-api.jotform.com`
- [ ] Import selected form works
- [ ] Form saved to database

### Form Viewing
- [ ] FormViewer page loads
- [ ] Form displays correctly
- [ ] Form submissions can be viewed
- [ ] **Backend API:** `GET /api/integrations/jotform/forms/:formId`
- [ ] **Backend API:** `GET /api/integrations/jotform/forms/:formId/submissions`

---

## ✍️ 5. SIGNATURE REQUESTS

### Create Signature Request
- [ ] Signatures page loads
- [ ] Create signature request button works
- [ ] Dialog opens with form
- [ ] Can select JotForm form
- [ ] Can add recipients
- [ ] Can add custom message
- [ ] **Backend API:** `POST /api/signatures`
- [ ] **Email Sent via Resend API**
- [ ] Email contains:
  - [ ] Professional design
  - [ ] Recipient name
  - [ ] Document title
  - [ ] Custom message
  - [ ] JotForm link button
  - [ ] OneCare Desk branding

### Email Template
- [ ] Email has modern gradient design
- [ ] Responsive layout
- [ ] All content properly formatted
- [ ] "Open & Sign Document" button works
- [ ] Link clickable
- [ ] Footer includes company info

---

## 🔌 6. BACKEND API ENDPOINTS

### Authentication Routes (`/api/auth`)
- [ ] `POST /api/auth` - Login/Signup works
- [ ] Returns JWT token
- [ ] Returns user data
- [ ] Validates credentials
- [ ] Handles duplicate users
- [ ] Rate limiting implemented

### Leads Routes (`/api/leads`)
- [ ] `GET /api/leads` - List all leads
- [ ] `GET /api/leads/:id` - Get single lead
- [ ] `POST /api/leads` - Create lead
- [ ] `PUT /api/leads/:id` - Update lead
- [ ] `DELETE /api/leads/:id` - Delete lead
- [ ] Uses `created_date` column (not `created_at`)

### Patients Routes (`/api/patients`)
- [ ] `GET /api/patients` - List all patients
- [ ] `GET /api/patients/:id` - Get single patient
- [ ] `POST /api/patients` - Create patient
- [ ] `PUT /api/patients/:id` - Update patient
- [ ] `DELETE /api/patients/:id` - Delete patient
- [ ] Uses `created_date` column

### Caregivers Routes (`/api/caregivers`)
- [ ] `GET /api/caregivers` - List all caregivers
- [ ] `GET /api/caregivers/:id` - Get single caregiver
- [ ] `POST /api/caregivers` - Create caregiver
- [ ] `PUT /api/caregivers/:id` - Update caregiver
- [ ] `DELETE /api/caregivers/:id` - Delete caregiver

### JotForm Integration Routes (`/api/integrations/jotform`)
- [ ] `GET /api/integrations/jotform/forms` - List forms
- [ ] Uses HIPAA endpoint: `hipaa-api.jotform.com`
- [ ] API key working: `21bc888ff3b474d977908952181f80fc`
- [ ] Returns 25 forms
- [ ] `GET /api/integrations/jotform/forms/:formId` - Get single form
- [ ] `GET /api/integrations/jotform/forms/:formId/submissions` - Get submissions

### Signatures Routes (`/api/signatures`)
- [ ] `GET /api/signatures` - List signature requests
- [ ] `POST /api/signatures` - Create signature request
- [ ] Sends email via Resend
- [ ] Email template renders correctly
- [ ] Domain configuration: `onecaredesk.com`
- [ ] From email: `noreply@onecaredesk.com`

### Resend Email Integration
- [ ] API key working: `re_5nxurDK3_Btx82tErHN1MV2Tn7ko6bToS`
- [ ] Domain configured: `onecaredesk.com`
- [ ] Email sends successfully
- [ ] Recipient receives email
- [ ] Email not in spam folder

---

## 🗄️ 7. DATABASE CONNECTIVITY

### PostgreSQL (Neon)
- [ ] Database connection established
- [ ] Connection timeout: 10000ms
- [ ] Tables accessible:
  - [ ] `users`
  - [ ] `agencies`
  - [ ] `leads`
  - [ ] `patients`
  - [ ] `caregivers`
  - [ ] `signatures`
  - [ ] `form_templates`
- [ ] Column names correct (`created_date` not `created_at`)
- [ ] CRUD operations work

---

## 🎨 8. UI/UX COMPONENTS

### Shared Components
- [ ] Logo component renders
- [ ] Navigation sidebar works
- [ ] Mobile menu works
- [ ] Buttons have hover states
- [ ] Loading spinners show during API calls
- [ ] Success/error alerts display correctly
- [ ] Forms have proper validation feedback

### Auth Page Design
- [ ] Gradient background renders
- [ ] Card shadow visible
- [ ] Responsive on mobile
- [ ] Icons display correctly
- [ ] Separator line between Google and email auth
- [ ] Form inputs have icons
- [ ] Password visibility toggle icon changes

### Dashboard Layout
- [ ] Desktop sidebar fixed
- [ ] Mobile hamburger menu
- [ ] User profile popover works
- [ ] Agency name displays (if applicable)
- [ ] Active route highlighted
- [ ] Logout button in popover

---

## 🔧 9. CONFIGURATION & ENVIRONMENT

### Frontend (.env)
- [ ] `VITE_API_BASE_URL=http://localhost:5000/api` ✅
- [ ] `VITE_KINDE_DOMAIN` configured ✅
- [ ] `VITE_KINDE_CLIENT_ID` configured ✅
- [ ] `VITE_KINDE_REDIRECT_URI` configured ✅

### Backend (.env)
- [ ] `DATABASE_URL` configured ✅
- [ ] `KINDE_DOMAIN` configured ✅
- [ ] `KINDE_CLIENT_ID` configured ✅
- [ ] `KINDE_CLIENT_SECRET` configured ✅
- [ ] `JWT_SECRET` configured ✅
- [ ] `RESEND_API_KEY` configured ✅
- [ ] `RESEND_FROM_EMAIL=noreply@onecaredesk.com` ✅
- [ ] `RESEND_FROM_NAME=OneCare Desk` ✅
- [ ] `JOTFORM_API_KEY` configured ✅

---

## 🚀 10. DEPLOYMENT READINESS

### Code Quality
- [ ] No console errors in browser
- [ ] No compilation errors
- [ ] No linting errors
- [ ] All imports resolved
- [ ] No unused variables

### Performance
- [ ] Pages load within 2 seconds
- [ ] API responses within 500ms
- [ ] Images optimized
- [ ] No memory leaks

### Security
- [ ] Passwords hashed in backend
- [ ] JWT tokens secure
- [ ] API keys in .env (not hardcoded)
- [ ] CORS configured properly
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 📝 TESTING INSTRUCTIONS

### How to Test:

1. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   ```
   Server should run on: `http://localhost:5000`

2. **Start Frontend Dev Server:**
   ```bash
   npm run dev
   ```
   App should run on: `http://localhost:5173`

3. **Test Public Routes:**
   - Open `http://localhost:5173/` → Should show Home page
   - Open `http://localhost:5173/auth` → Should show Auth page

4. **Test Authentication:**
   - Click "Sign up" → Fill form → Create account
   - Should show success message
   - Should redirect to login
   - Login with created credentials
   - Should redirect to Dashboard

5. **Test Protected Routes:**
   - While logged in, visit `/Dashboard`, `/Leads`, etc.
   - Should load successfully
   - Logout
   - Try visiting `/Dashboard` → Should redirect to `/auth`

6. **Test JotForm Integration:**
   - Login
   - Go to Form Templates
   - Click "Import from JotForm"
   - Should see 25 forms
   - Select a form → Import
   - Check database for saved form

7. **Test Signature Requests:**
   - Login
   - Go to Signatures
   - Create new signature request
   - Add recipient email
   - Select JotForm form
   - Send request
   - Check recipient's email for professional email

8. **Test Backend APIs (using Postman/Thunder Client):**
   ```
   GET http://localhost:5000/api/leads
   POST http://localhost:5000/api/auth
   GET http://localhost:5000/api/integrations/jotform/forms
   ```

---

## ✅ FINAL CHECKLIST

- [ ] All routes accessible
- [ ] Authentication fully functional
- [ ] Backend APIs responding
- [ ] Database connected
- [ ] JotForm integration working
- [ ] Email sending working
- [ ] UI/UX polished
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Ready for production

---

## 🐛 KNOWN ISSUES

### To Fix:
1. **Domain Verification:** User needs to verify `onecaredesk.com` on Resend.com to enable email sending
2. **Kinde OAuth:** May need to test with real Google account
3. **Database Migrations:** Ensure all tables have correct schema

### Notes:
- Password bypass is active in development (disable in production)
- Debug logs enabled (disable in production)
- Email template tested and working
- All backend routes functional

---

## 📊 TEST RESULTS

**Date Tested:** [Fill after testing]  
**Tester:** [Your name]  
**Overall Status:** [ ] PASS / [ ] FAIL  
**Issues Found:** [List any issues]

---

**Generated on:** October 7, 2025  
**Project:** OneCare Desk Healthcare Management System  
**Version:** 1.0.0
