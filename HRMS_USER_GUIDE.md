# 🚀 Enterprise HRMS — UI Navigation & Feature Testing Guide

Welcome to the **Enterprise HRMS User Operating & Feature Testing Guide**. This document provides a comprehensive step-by-step walkthrough for operating, navigating, and testing every module, user interface flow, and **form validation rule** within the application.

---

## 🌐 Local Environment & Access
* **Dev Server URL**: `http://localhost:5174/` (or `http://localhost:5173/`)
* **Framework**: React 19 + Vite + MUI v6 + Zod Validation

---

## 📑 Table of Contents
1. [Authentication & Account Setup](#1-authentication--account-setup)
2. [Main Dashboard & Quick Widgets](#2-main-dashboard--quick-widgets)
3. [Employee Directory & People Hub](#3-employee-directory--people-hub)
4. [Attendance & Time Tracking](#4-attendance--time-tracking)
5. [Leave & Approvals Management](#5-leave--approvals-management)
6. [Holidays & Branch Calendars](#6-holidays--branch-calendars)
7. [Organization & Master Data Administration](#7-organization--master-data-administration)
8. [Roles & Permissions Administration](#8-roles--permissions-administration)
9. [Onboarding & Document Verification](#9-onboarding--document-verification)

---

## 1. 🔐 Authentication & Account Setup

### **1.1 Sign Up / User Registration**
* **Route**: `/signup` (wrapped in `<GuestGuard>`)
* **Overview**: Multi-field company workspace registration form with auto-sanitized workspace URL generation (alphanumeric), real-time URL availability check, country-aware phone validation, and work email verification.
* **Access Control**: Guest-Only (`GuestGuard`). Logged-in users attempting to access `/signup` are automatically redirected to `/dashboard`.
* **Testing Steps**:
  1. Navigate to `/signup` (ensure you are logged out).
  2. Enter **Company Name** (e.g. `Creater Tech`) — verify **Workspace URL** auto-generates as `creatertech` (clean alphanumeric, without hyphens or spaces).
  3. Select **Team Size** from the dropdown menu (e.g. `11 – 50 employees`).
  4. Enter **First Name** and **Last Name**.
  5. Enter **Work Email** (must be a valid business domain email; personal domains like `gmail.com` are rejected on backend submit).
  6. Enter **Password** and **Confirm Password** (must match, 8-12 chars, containing uppercase, lowercase, digit, and special character).
  7. Select **Country Code** and enter **Phone Number** (digits only, validated per country format).
  8. Click **Create Account**.

---

#### **✅ Success Cases**

| Action | Steps | Expected Result |
| :--- | :--- | :--- |
| **Workspace URL Auto-Generation** | Type `Creater Tech` into **Company Name** field | `workspaceSlug` field automatically populates with `creatertech`. Real-time availability indicator displays `✓ "creatertech" is available` in green (`#10B981`). |
| **Pick Suggested Slug** | Type a taken slug name, click any suggestion chip (e.g. `creatertech1`) | Workspace URL field updates to `creatertech1`, availability indicator updates to `✓ "creatertech1" is available`. |
| **Successful Account Registration** | Fill all required fields with valid data & click **Create Account** | Submit button shows loading spinner (`loading={true}`). Backend returns `201 Created` with message `"Company registered successfully"`. Redux state `isRegisterSuccess` triggers navigation to `/check-email` with state `{ email: "user@domain.com" }`. |
| **Already Authenticated Redirect** | Navigate directly to `/signup` while logged in | `GuestGuard` intercepts request (`hasSession === true`) and redirects instantly to `/dashboard`. |

---

#### **⚠️ Validation Errors to Test**

| Field | Trigger Condition | Expected Error Message | Source |
| :--- | :--- | :--- | :--- |
| **Company Name** | Leave empty or enter 1 character | `"Company name must be at least 2 characters"` | Frontend Zod (`signup.schema.ts`) |
| **Company Name** | Enter text > 200 characters | `"Company name cannot exceed 200 characters"` | Frontend Zod (`signup.schema.ts`) |
| **Workspace URL** | Clear field or enter < 3 characters | `"Workspace URL must be at least 3 characters"` | Frontend Zod (`signup.schema.ts`) |
| **Workspace URL** | Enter text > 63 characters | `"Workspace URL cannot exceed 63 characters"` | Frontend Zod (`signup.schema.ts`) |
| **Workspace URL** | Enter non-alphanumeric/hyphen characters | `"Only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen."` | Frontend Zod (`signup.schema.ts`) |
| **Workspace URL** | Enter reserved name (e.g. `admin`, `api`, `app`) | `"This workspace name is reserved. Please choose another."` | Backend DTO (`common.validator.ts`) |
| **Team Size** | Unselected dropdown | `"Please select your team size"` | Frontend Zod (`signup.schema.ts`) |
| **First Name** | Leave empty or enter 1 character | `"First name must be at least 2 characters"` | Frontend Zod (`signup.schema.ts`) |
| **First Name** | Enter text > 100 characters | `"First name cannot exceed 100 characters"` | Frontend Zod (`signup.schema.ts`) |
| **Last Name** | Leave empty or enter 1 character | `"Last name must be at least 2 characters"` | Frontend Zod (`signup.schema.ts`) |
| **Last Name** | Enter text > 100 characters | `"Last name cannot exceed 100 characters"` | Frontend Zod (`signup.schema.ts`) |
| **Work Email** | Leave blank | `"Email is required"` | Frontend Zod (`signup.schema.ts`) |
| **Work Email** | Invalid email format (e.g. `user@com`) | `"Please enter a valid email"` | Frontend Zod (`signup.schema.ts`) |
| **Work Email** | Personal email domain (e.g. `gmail.com`, `yahoo.com`) | `"Please use your work email address. Personal email providers are not allowed."` | Backend DTO (`common.validator.ts`) |
| **Password** | Leave blank | `"Password is required"` | Frontend Zod (`signup.schema.ts`) |
| **Password** | Less than 8 characters | `"Password must be at least 8 characters"` | Frontend Zod (`signup.schema.ts`) |
| **Password** | Missing uppercase, lowercase, digit, or special char | `"Password must contain at least one uppercase letter"` / `"Password must contain at least one number"` / `"Password must contain at least one special character"` | Backend DTO (`common.validator.ts`) |
| **Password** | Exceeds 12 characters | `"Password must not exceed 12 characters"` | Backend DTO (`auth.dto.ts`) |
| **Confirm Password** | Leave blank | `"Confirm password is required"` | Frontend Zod (`signup.schema.ts`) |
| **Confirm Password** | Does not match Password | `"Passwords do not match"` | Frontend Zod (`signup.schema.ts`) |
| **Phone Number** | Contains letters or special characters | `"Phone number must contain digits only"` | Frontend Zod (`signup.schema.ts`) |
| **Phone Number** | Exceeds 10 digits | `"Phone number cannot exceed 10 digits"` | Frontend Zod (`signup.schema.ts`) |
| **Phone Number** | Number invalid for selected country code | `"Invalid phone number for the selected country"` | Frontend Zod (`signup.schema.ts` / `libphonenumber-js`) |

---

#### **❌ Error / Failure Cases**

| Scenario | Trigger Condition | Expected Behavior |
| :--- | :--- | :--- |
| **Workspace URL Already Taken (409)** | Slug already registered in database (`workspaceSlugExists`) | Real-time status shows `⚠️ Already taken. Try:` followed by up to 3 suggestion chips. Red warning text displayed: `"Please choose an available workspace URL before continuing."`. **Create Account** button remains disabled (`disabled={slugAvailable === false}`). |
| **Duplicate Email Registration (409)** | Register with an email already in database | Backend rejects with `409 Conflict`. Top-right toast notification pops up displaying: `"Email already registered"`. |
| **Slug Conflict on Submit (409)** | Submit registration when workspace slug is claimed concurrently | Backend rejects with `409 Conflict`. Top-right toast notification pops up displaying: `"Workspace URL \"{workspaceSlug}\" is already taken."`. |
| **Backend DTO Validation Failure (400)** | Field fails backend DTO (e.g. personal email or password > 12 chars) | Backend rejects with `400 Bad Request`. Redux Saga helper `extractErrorMessage()` extracts `errors[0].message` and top-right toast notification displays the specific field error (e.g. `"Please use your work email address. Personal email providers are not allowed."`). |
| **Slug Check API Failure** | Backend server offline or network error during `checkSlug()` GET call | Real-time status displays orange warning: `⚠️ Could not check availability. Please try again.`. |
| **Server Connection Failure (500/Network)** | Backend offline or unhandled database exception | Top-right toast notification displays Axios error message (`"Registration failed"` or `"Something went wrong"`). |

---

#### **🛡️ Role-Based Access & Restrictions**

| Role Slug | Can Access? | Restrictions / What They See Instead | Code Reference |
| :--- | :--- | :--- | :--- |
| **Unauthenticated / Guest** | ✅ Yes | Full access to `/signup` page and workspace creation form. | [`AppRoutes` / `GuestGuard`](file:///d:/hrms/src/routes/index.tsx#L47-L49) |
| **`ORG_ADMIN`** | ❌ No | Intercepted by `GuestGuard` (`hasSession === true`). Instantly redirected to `/dashboard`. | [`GuestGuard.tsx:L25-L27`](file:///d:/hrms/src/auth/guards/GuestGuard.tsx#L25-L27) |
| **`HR_ADMIN`** | ❌ No | Intercepted by `GuestGuard` (`hasSession === true`). Instantly redirected to `/dashboard`. | [`GuestGuard.tsx:L25-L27`](file:///d:/hrms/src/auth/guards/GuestGuard.tsx#L25-L27) |
| **`BRANCH_ADMIN`** | ❌ No | Intercepted by `GuestGuard` (`hasSession === true`). Instantly redirected to `/dashboard`. | [`GuestGuard.tsx:L25-L27`](file:///d:/hrms/src/auth/guards/GuestGuard.tsx#L25-L27) |
| **`LEADERSHIP`** | ❌ No | Intercepted by `GuestGuard` (`hasSession === true`). Instantly redirected to `/dashboard`. | [`GuestGuard.tsx:L25-L27`](file:///d:/hrms/src/auth/guards/GuestGuard.tsx#L25-L27) |
| **`MANAGER`** | ❌ No | Intercepted by `GuestGuard` (`hasSession === true`). Instantly redirected to `/dashboard`. | [`GuestGuard.tsx:L25-L27`](file:///d:/hrms/src/auth/guards/GuestGuard.tsx#L25-L27) |
| **`PRODUCT_MANAGER`** | ❌ No | Intercepted by `GuestGuard` (`hasSession === true`). Instantly redirected to `/dashboard`. | [`GuestGuard.tsx:L25-L27`](file:///d:/hrms/src/auth/guards/GuestGuard.tsx#L25-L27) |
| **`EMPLOYEE`** | ❌ No | Intercepted by `GuestGuard` (`hasSession === true`). Instantly redirected to `/dashboard`. | [`GuestGuard.tsx:L25-L27`](file:///d:/hrms/src/auth/guards/GuestGuard.tsx#L25-L27) |

---

### **1.2 Login Page**
* **Route**: `/login` (wrapped in `<GuestGuard>`)
* **Overview**: Secure authentication screen featuring real-time email domain/SSO detection, workspace branding auto-discovery, lockout rate-limiting with live countdown timer, and automated post-login redirect priority dispatch.
* **Access Control**: Guest-Only (`GuestGuard`). Logged-in users attempting to access `/login` are automatically redirected to `/dashboard`.
* **Testing Steps**:
  1. Navigate to `/login` (ensure you are logged out).
  2. Enter your registered **Company Email** (e.g., `admin@company.com`). Notice the 500ms debounced email check: if workspace branding exists, the company logo and name appear dynamically above the heading.
  3. Enter your **Password**.
  4. (Optional) Check **Remember this device** to issue a 30-day persistent session token.
  5. Click **Sign In**.
  6. Observe post-login redirect priority:
     * **Priority 1**: If `requiresPasswordReset` is true $\rightarrow$ redirected to `/auth/change-password`.
     * **Priority 2**: If `onboardingCompleted` is false $\rightarrow$ redirected to `/onboarding`.
     * **Priority 3**: Role-based redirect (`ORG_ADMIN` $\rightarrow$ `/dashboard`, `HR` $\rightarrow$ `/hr/dashboard`, `EMPLOYEE` $\rightarrow$ `/employee/dashboard`).

---

#### **✅ Success Cases**

| Action | Steps | Expected Result |
| :--- | :--- | :--- |
| **Workspace Branding Auto-Discovery** | Type a valid registered email into **Company Email** field & pause 500ms | Input displays circular loading indicator (`CircularProgress`). Upon response, heading updates to Company Name, workspace logo displays, and subtext updates to `"Sign in to your workspace"`. |
| **SSO Email Detection** | Type an email belonging to an SSO-enabled domain | Password field hides automatically. Alert displays: `"Continue with [provider]"` or `"SSO is enabled for this account."`. |
| **Successful Authentication (Admin)** | Enter valid credentials for `ORG_ADMIN` & click **Sign In** | `accessToken` & `refreshToken` saved in `localStorage`. Redirects to `/dashboard`. |
| **First Login Workspace Setup Redirect** | Log in with a newly registered account where `onboardingCompleted === false` | Priority redirect triggers: User is redirected to `/onboarding` setup wizard instead of dashboard. |
| **Mandatory Password Change Redirect** | Log in with an admin-invited account where `requiresPasswordReset === true` | Priority redirect triggers: User is redirected to `/auth/change-password` with `replace: true`. |
| **Remember Device Token** | Check **Remember this device** checkbox before submitting | `rememberDevice: true` is sent in payload. Backend returns a 30-day hashed token set in storage. |
| **Already Authenticated Redirect** | Navigate directly to `/login` while logged in | `GuestGuard` intercepts request (`hasSession === true`) and redirects instantly to `/dashboard`. |

---

#### **⚠️ Validation Errors to Test**

| Field | Trigger Condition | Expected Error Message | Source |
| :--- | :--- | :--- | :--- |
| **Company Email** | Leave blank & click **Sign In** | `"Email is required"` | Frontend Zod (`login.schema.ts`) |
| **Company Email** | Invalid email format (e.g. `admin@com`) | `"Please enter a valid email"` | Frontend Zod (`login.schema.ts`) |
| **Password** | Leave blank & click **Sign In** | `"Password is required"` | Frontend Zod (`login.schema.ts`) |

---

#### **❌ Error / Failure Cases**

| Scenario | Trigger Condition | Expected Behavior |
| :--- | :--- | :--- |
| **Invalid Email or Password** | Submit incorrect password (1–4 failed attempts) | Toast notification displays: `"Invalid email or password. N attempt(s) remaining before lockout."` for 5 seconds. |
| **Unverified Email (403)** | Log in with account that hasn't completed email verification | Toast notification displays: `"Please verify your email address before logging in. Check your inbox for the verification link."` with an interactive **Resend Email** action button (10-second duration). Clicking action navigates to `/check-email`. |
| **Deactivated Account (401)** | Log in with user account marked `isActive: false` in DB | Toast notification displays: `"Your account has been deactivated. Please contact your administrator."`. |
| **Lockout Rate Limiting (429)** | 5 consecutive failed login attempts | Backend returns `429 Too Many Requests` with `remainingSecs` (900s / 15 mins). **Sign In** button becomes disabled (`disabled={true}`). Red text displays: `"Too many attempts. Try again in {secondsLeft} seconds."` along with a **Reset Password?** link. Live countdown timer runs via `useCountdown`. |
| **Server Offline / Network Failure** | Submit login form when backend server is unreachable | Toast notification displays Axios error message (`"Login failed"` or `"Something went wrong"`). |

---

#### **🛡️ Role-Based Access & Restrictions**

| Role Slug | Can Access? | Post-Login Redirect Target | Code Reference |
| :--- | :--- | :--- | :--- |
| **Unauthenticated / Guest** | ✅ Yes | N/A (Can view and submit login form) | [`AppRoutes` / `GuestGuard`](file:///d:/hrms/src/routes/index.tsx#L50-L53) |
| **`ORG_ADMIN`** | ❌ No (Redirected if logged in) | Redirects to `/dashboard` | [`LoginView.tsx:L68`](file:///d:/hrms/src/sections/auth/login/LoginView.tsx#L68) |
| **`HR` / `HR_ADMIN`** | ❌ No (Redirected if logged in) | Redirects to `/hr/dashboard` | [`LoginView.tsx:L71`](file:///d:/hrms/src/sections/auth/login/LoginView.tsx#L71) |
| **`EMPLOYEE`** | ❌ No (Redirected if logged in) | Redirects to `/employee/dashboard` | [`LoginView.tsx:L74`](file:///d:/hrms/src/sections/auth/login/LoginView.tsx#L74) |
| **`BRANCH_ADMIN`** | ❌ No (Redirected if logged in) | Fallback redirects to `/` | [`LoginView.tsx:L77`](file:///d:/hrms/src/sections/auth/login/LoginView.tsx#L77) |
| **`LEADERSHIP`** | ❌ No (Redirected if logged in) | Fallback redirects to `/` | [`LoginView.tsx:L77`](file:///d:/hrms/src/sections/auth/login/LoginView.tsx#L77) |
| **`MANAGER`** | ❌ No (Redirected if logged in) | Fallback redirects to `/` | [`LoginView.tsx:L77`](file:///d:/hrms/src/sections/auth/login/LoginView.tsx#L77) |
| **`PRODUCT_MANAGER`** | ❌ No (Redirected if logged in) | Fallback redirects to `/` | [`LoginView.tsx:L77`](file:///d:/hrms/src/sections/auth/login/LoginView.tsx#L77) |

---

### **1.3 Password Recovery & Account Activation**
* **Routes**: `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/activate`
* **Testing Steps**:
  1. Click **Forgot Password?** on the login page.
  2. Enter your registered email address and submit.
* **⚠️ Validation Errors to Test**:
  * Leaving email blank triggers `"Email is required"`.
  * Mismatched new password in Reset Password triggers `"Passwords do not match"`.

---

## 2. 📊 Main Dashboard & Quick Widgets

* **Route**: `/dashboard` (wrapped in `<AuthGuard>`)
* **Overview**: Centralized command center providing real-time workforce metrics, AI-driven insights, interactive attendance charts, pending leave requests, team widgets, and organization setup guidance.
* **Access Control**: Authenticated users only (`AuthGuard`). Redirects unauthenticated guests to `/login`.
* **Testing Steps**:
  1. Log in to the application and navigate to `/dashboard`.
  2. Observe top header greeting displaying user's first name, last login timestamp, IP address, and login device.
  3. Review top KPI cards (*Total Employees*, *Present Today*, *Leave Requests Pending*, *Upcoming Celebrations*).
  4. (If logged in as `ORG_ADMIN` or `HR_ADMIN` with an incomplete workspace setup) Observe the **Organization Initial Setup Required** banner displaying current progress (0–3 steps completed). Click **Complete Initial Setup** to open the modal wizard.
  5. Fill out setup modal fields (**Country Code**, **Timezone**, **Base Currency**, **Fiscal Year Start**, **Employee Count Range**, **Industry**, **Phone Number**, **Admin Job Title**) and click **Complete Setup & Seed Head Office**.
  6. (If logged in as non-`ORG_ADMIN`) Interact with the **Daily Punch Card** widget to clock in/out.

---

### **2.1 Organization Setup Wizard Dialog**
* **Trigger**: Click **Complete Initial Setup** button inside `OrgSetupGuidanceWidget` on `/dashboard`.
* **Overview**: Modal dialog for administrators to configure organization locales and automatically seed Head Office branch, default departments, designations, shifts, and statutory holidays into MongoDB.

---

#### **✅ Success Cases**

| Action | Steps | Expected Result |
| :--- | :--- | :--- |
| **Open Organization Setup Dialog** | Click **Complete Initial Setup** button on `OrgSetupGuidanceWidget` card | `AdminSetupWizardDialog` opens. Form fields pre-populate with existing organization data from `useUserOrgData()` (`countryCode`, `timezone`, `baseCurrency`, `fiscalYearStart`, `employeeCountRange`, `industry`, `phone`). |
| **Dynamic Flag & Dial Code Sync** | Select a new country in **Country Code** dropdown or change **Phone Number** flag | Country flag emoji, international dial code, and digit length validation auto-update dynamically across `<PhoneInput />`. |
| **Complete Setup & Master Data Seeding** | Fill required fields & click **Complete Setup & Seed Head Office** | Button shows loading spinner (`submitting: true`). Backend executes `completeOnboarding()`: seeds Head Office branch, default departments, designations, shifts, and national holidays. Toast displays `"Organization setup & Head Office seeding completed successfully!"` (or backend message `"Workspace configured successfully."`). Dialog closes and `OrgSetupGuidanceWidget` auto-hides. |
| **Manual Progress Bar Refresh** | Click **Refresh status** icon on `OrgSetupGuidanceWidget` card | `fetchCounts()` executes, re-checking branch, department, and designation counts from API and updating progress bar (`0%`, `33%`, `66%`, `100%`). |
| **Auto-Hide Guidance Banner** | Complete all 3 setup items (Branch + Depts + Designations) | `OrgSetupGuidanceWidget` detects `hasBranch && hasDepts && hasDesigs === true` and cleanly unmounts from `/dashboard`. |

---

#### **⚠️ Validation Errors to Test**

| Field | Trigger Condition | Expected Error Message | Source |
| :--- | :--- | :--- | :--- |
| **Phone Number** | Enter non-digit characters or input length $\neq 10$ digits | `"Contact phone number must be exactly 10 digits."` | Frontend `AdminSetupWizardDialog.tsx:L106` |
| **Phone Number** | Submit empty phone input | Browser native field validation / `"Invalid phone number for the selected country"` | Frontend `<PhoneInput />` |
| **Admin Job Title** | Leave blank & submit form | Browser native required validation (`!adminJobTitle.trim()`) | Frontend `AdminSetupWizardDialog.tsx:L103` |
| **Timezone** | Clear dropdown selection & submit | `"Timezone is required"` | Backend DTO (`OnboardingWizardDto`) |
| **Base Currency** | Clear dropdown selection & submit | `"Base currency is required"` | Backend DTO (`OnboardingWizardDto`) |
| **Fiscal Year Start** | Clear dropdown selection & submit | `"Fiscal year start is required"` | Backend DTO (`OnboardingWizardDto`) |

---

#### **❌ Error / Failure Cases**

| Scenario | Trigger Condition | Expected Behavior |
| :--- | :--- | :--- |
| **Backend Setup API Failure (400/500)** | Submit setup form when API fails or database transaction errors | Alert banner inside dialog displays server error message (`err?.response?.data?.message` or `"Failed to complete onboarding setup."`). Dialog stays open. |
| **Head Office Check Failure** | API call to `getHeadOffice()` fails on widget mount | Widget catches error silently, sets `branchExists = false`, and allows manual branch creation. |
| **Department / Designation Count API Failure** | `listDepartments()` or `listDesignations()` network failure | `Promise.all` catch block sets count to `0` and displays error banner: `"Failed to check organization setup status."`. |

---

#### **🛡️ Role-Based Access & Restrictions**

| Role Slug | Can Access Dashboard? | Component Visibility / Restrictions | Code Reference |
| :--- | :--- | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Yes | Full Dashboard access. **Sees `OrgSetupGuidanceWidget`** (if setup incomplete). **Hides `DailyPunchCard`** (`role !== "ORG_ADMIN"`). | [`DashboardView.tsx:L36-L40`](file:///d:/hrms/src/pages/dashboard/DashboardView.tsx#L36-L40) & [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`HR_ADMIN`** / **`HR`** | ✅ Yes | Full Dashboard access. **Sees `OrgSetupGuidanceWidget`** (if setup incomplete). **Sees `DailyPunchCard`**. | [`DashboardView.tsx:L36-L40`](file:///d:/hrms/src/pages/dashboard/DashboardView.tsx#L36-L40) & [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`BRANCH_ADMIN`** | ✅ Yes | Dashboard access. **Hides `OrgSetupGuidanceWidget`** (`role !== "ORG_ADMIN" && role !== "HR_ADMIN"` returns `null`). **Sees `DailyPunchCard`**. | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`LEADERSHIP`** | ✅ Yes | Dashboard access. **Hides `OrgSetupGuidanceWidget`**. **Sees `DailyPunchCard`**. | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`MANAGER`** | ✅ Yes | Dashboard access. **Hides `OrgSetupGuidanceWidget`**. **Sees `DailyPunchCard`**. | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`PRODUCT_MANAGER`** | ✅ Yes | Dashboard access. **Hides `OrgSetupGuidanceWidget`**. **Sees `DailyPunchCard`**. | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`EMPLOYEE`** | ✅ Yes | Dashboard access. **Hides `OrgSetupGuidanceWidget`**. **Sees `DailyPunchCard`**. | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |

---

## 3. 👥 Employee Directory & People Hub

* **Routes**: `/employees/directory`, `/employees/create`, `/employees/profile/:id`
* **Overview**: Complete workforce management hub with dual view modes (Table & Card Grid).

### **3.1 Directory View & Filters**
* **Route**: `/employees/directory`
* **Features & Testing**:
  1. **View Mode Switcher**:
     * Click **Grid View** icon to display employee cards with profile avatars.
     * Click **Table View** icon to display the high-performance **Virtualized Table**.
  2. **Search & Multi-Filtering**:
     * Type any employee name or code in the **Search** input.
     * Click the **Filter Bar** to filter by Department, Designation, or Status.

---

### **3.2 Add New Employee Form**
* **Route**: `/employees/create`

#### 📝 Step-by-Step Field Guide: How to Fill Form Sections

##### **Section 1: Organizational Placement & Cascading Hierarchy**
1. **STEP 1: Branch Location (`* Required`)**:
   * Select the employee's physical office branch (e.g. *Headquarters*, *Mumbai Branch*).
   * *Note: Selecting a Branch automatically enables the Department dropdown.*
2. **STEP 2: Department (`* Required - Cascading`)**:
   * Select the department (e.g. *Engineering (ENG)*, *Human Resources (HR)*).
   * *Note: Selecting a Department automatically filters available Designations and Reporting Managers.*
3. **STEP 3: Designation (`* Required - Cascading`)**:
   * Select the official job designation (e.g. *Software Engineer*, *Product Manager*).
4. **STEP 4: Squad Team (`Optional`)**:
   * Select a functional squad/team (e.g. *Frontend Team*, *Core Platform Squad*).
5. **STEP 5: Primary Reporting Manager (`Optional`)**:
   * Select the primary manager to whom this employee reports.
6. **STEP 6: Secondary Managers (`Optional Multi-Select`)**:
   * Select additional project or matrix managers if applicable.
7. **STEP 7: System Security Role (`* Required`)**:
   * Assign access role: *Super Admin*, *HR Manager*, *Department Lead*, or *Employee*.

---

##### **Section 2: Personal Details & Contact**
1. **First Name (`* Required`)**: Enter 2 to 100 characters (e.g., `Rohan`).
2. **Last Name (`* Required`)**: Enter 2 to 100 characters (e.g., `Sharma`).
3. **Work Email Address (`* Required`)**: Enter valid company email (e.g., `rohan.sharma@company.com`).
4. **Mobile Phone Number (`Optional`)**: Select country code (e.g. `+91`) and enter a valid 10-digit mobile number.
5. **Date of Birth (`Optional`)**: Select date of birth (`YYYY-MM-DD`).
6. **Gender (`Optional`)**: Select *Male*, *Female*, or *Other*.
7. **Blood Group & Marital Status (`Optional`)**: Select blood group (*A+*, *B+*, *O+*, etc.) and marital status (*Single*, *Married*).
8. **Nationality (`Optional`)**: Enter nationality (e.g., `Indian`).

---

##### **Section 3: Government Verification & Identity**
1. **PAN Card Number (`Optional`)**: Enter 10-character uppercase PAN string (e.g., `ABCDE1234F`).
2. **Aadhaar Number (`Optional`)**: Enter 12-digit Aadhaar number (cannot start with 0 or 1, e.g., `234567890123`).

---

##### **Section 4: Employment Terms & Work Schedule**
1. **Employee Type (`* Required`)**: Select employment category: *Full Time*, *Part Time*, *Contract*, *Intern*, *Consultant*, *Temporary*, or *Freelance*.
2. **Joining Date (`* Required`)**: Select official date of joining (`YYYY-MM-DD`).
3. **Probation End Date (`Optional`)**: Select probation evaluation end date.
4. **Assigned Shift (`Optional`)**: Select assigned work timing shift (e.g., *General Morning Shift 09:00 AM - 06:00 PM*).

---

##### **Section 5: Emergency Contacts**
1. **Contact Person Name (`* Required if contact added`)**: Full name of emergency contact (e.g., `Suresh Sharma`).
2. **Relationship (`* Required if contact added`)**: Relationship type (e.g., *Father*, *Spouse*, *Sibling*).
3. **Emergency Phone (`* Required`)**: 10-digit emergency contact phone number.
4. **Email (`Optional`)**: Emergency contact email.

---

##### **Section 6: Bank Account Details**
1. **Bank Name (`Optional`)**: Financial institution name (e.g., *HDFC Bank*).
2. **Account Number (`Optional`)**: 6 to 20 digit numeric bank account number.
3. **IFSC Code (`Optional`)**: 11-character bank IFSC code (e.g., `HDFC0001234`).
4. **Account Type (`Optional`)**: Select *Salary*, *Savings*, or *Current*.

---

##### **Section 7: Salary Setup & Annual CTC**
1. **Annual CTC (`Optional`)**: Enter total yearly Cost to Company in INR (e.g., `1200000`).
2. **Payroll Components (`Optional`)**: Configure line item breakdown (*BASIC*, *HRA*, *SPECIAL_ALLOWANCE*).

---

* **⚠️ Validation Errors Table for Add Employee Form**:
  | Section | Field | Trigger Condition | Expected Error Message |
  | :--- | :--- | :--- | :--- |
  | **Basic Info** | First / Last Name | Less than 2 chars | `"First name must be 2-100 characters"` |
  | **Basic Info** | Email | Invalid email format | `"Please enter a valid email"` |
  | **Govt IDs** | PAN Card | Invalid PAN format | `"Invalid PAN format (e.g. ABCDE1234F)"` |
  | **Govt IDs** | Aadhaar Card | Invalid Aadhaar format | `"Aadhaar must be 12 digits and cannot start with 0 or 1"` |
  | **Org Mapping** | Department | Not selected | `"Department is required"` |
  | **Org Mapping** | Designation | Not selected | `"Designation is required"` |
  | **Org Mapping** | Role | Not selected | `"Role is required"` |
  | **Employment** | Joining Date | Empty date | `"Joining date is required"` |
  | **Bank Account** | Account Number | Invalid length / non-numeric | `"Account number must be 6-20 numeric digits"` |
  | **Bank Account** | IFSC Code | Invalid IFSC format | `"Invalid IFSC code format (e.g. HDFC0001234)"` |
  | **Emergency** | Phone | Not 10 digits | `"Emergency phone must be exactly 10 digits"` |

---

### **3.3 Employee Profile Tabs**
* **Route**: `/employees/profile/:id`
* **Testing Steps**:
  * Click on any employee row to open their 360-degree profile.
  * Test tab navigation: **Overview**, **Personal Info**, **Attendance Log**, **Leave History**, **Documents**, **Payroll**.

---

## 4. ⏰ Attendance & Time Tracking

* **Routes**: `/attendance`, `/reports`, `/attendance/regularizations`

### **4.1 Real-Time Check-In / Check-Out**
* **Route**: `/attendance`
* **Testing Steps**:
  1. Click the **Punch In** button.
  2. Observe current timestamp and location log update.
  3. Click **Punch Out** at end of test.

---

### **4.2 Attendance Reports & Punch Log Table**
* **Route**: `/reports`
* **Features & Testing**:
  1. **Date Range Filter**: Select **From Date** and **To Date** to filter attendance entries.
  2. **Punch Log Data Table**:
     * Verify table headers: `S.NO.`, `EMPLOYEE CODE`, `EMPLOYEE NAME`, `PUNCH LOG`, `PUNCH DATE`.
     * Verify **NO internal vertical scrollbar** (smooth natural height with 10 rows per page).
     * Click **Export** to download the CSV report.
  3. **Row Detail Modal**: Click on any row to open the **Attendance Details** modal.

---

### **4.3 Attendance Regularization Requests**
* **Route**: `/attendance/regularizations`
* **Testing Steps**:
  1. Click **+ Request Regularization**.
  2. Select Date, Missed Punch Type (Check In / Check Out), Reason, and submit.
* **⚠️ Validation Errors to Test**:
  | Field | Trigger Condition | Expected Error Message |
  | :--- | :--- | :--- |
  | **Reason** | Blank or < 10 chars | `"Please enter a detailed reason (at least 10 characters)"` |
  | **Date** | Future date selected | `"Regularization date cannot be in the future"` |

---

## 5. 🌴 Leave & Approvals Management

* **Routes**: `/leave`, `/leave/approvals`

### **5.1 Leave Dashboard & Request Submission**
* **Route**: `/leave`
* **Testing Steps**:
  1. Inspect **Leave Balance Cards** (Casual Leave, Sick Leave, Earned Leave).
  2. Click **+ Apply Leave**.
  3. Select **Leave Type**, **Start Date**, **End Date**, and enter **Reason**.
  4. Click **Submit Application**.
* **⚠️ Validation Errors to Test**:
  | Field | Trigger Condition | Expected Error Message |
  | :--- | :--- | :--- |
  | **Leave Type** | Unselected | `"Please select a leave type"` |
  | **Dates** | End Date < Start Date | `"End date cannot be earlier than start date"` |
  | **Reason** | Leave blank | `"Reason is required"` |
  | **Balance** | Requested days > Balance | `"Insufficient leave balance for the selected leave type"` |

---

### **5.2 Leave Approvals Queue (Manager View)**
* **Route**: `/leave/approvals`
* **Testing Steps**:
  1. View pending leave requests from team members.
  2. Click **Approve** (green button) or **Reject** (red button).
  3. Optional: Add reviewer comments in the confirmation dialog.

---

## 6. 📅 Holidays & Branch Calendars

* **Routes**: `/holidays`, `/branches/calendar`

### **Features & Testing**:
1. **Holidays Directory (`/holidays`)**:
   * View full list of public, national, and company holidays.
   * Filter holidays by year or branch.
2. **Branch Work Calendar (`/branches/calendar`)**:
   * Interactive calendar grid displaying working days, weekend policies, and scheduled company events.

---

## 7. 🏢 Organization & Master Data Administration

* **Routes**: `/departments`, `/designations`, `/branches`

### **7.1 Departments Management (`/departments`)**
* **Testing Steps**:
  1. View department list with code chips and employee counts.
  2. Click **+ Add Department**.
  3. Enter Department Name, Code (e.g. `ENG`, `HR`), and Department Head.
* **⚠️ Validation Errors to Test**:
  | Field | Trigger Condition | Expected Error Message |
  | :--- | :--- | :--- |
  | **Department Name** | Blank | `"Department name is required"` |
  | **Department Code** | Non-alphanumeric or > 10 chars | `"Code must be 2-10 uppercase alphanumeric characters"` |

---

### **7.2 Designations Management (`/designations`)**
* **Testing Steps**:
  1. View designations directory.
  2. Click **+ Add Designation** to configure job titles and pay bands.
* **⚠️ Validation Errors to Test**:
  * Leaving Title blank triggers `"Designation title is required"`.

---

### **7.3 Branch Management (`/branches`)**
* **Testing Steps**:
  1. View office branch locations.
  2. Add new branch address, timezone, and working hours.
* **⚠️ Validation Errors to Test**:
  * Leaving Branch Name blank triggers `"Branch name is required"`.

---

## 8. 🛡️ Roles & Permissions Administration

* **Route**: `/settings`

### **Features & Testing**:
1. **Roles Directory**:
   * View built-in roles: *Super Admin*, *HR Manager*, *Department Lead*, *Employee*.
2. **Permission Matrix Checkbox Grid**:
   * Select any role to load its permission matrix.
   * Toggle permissions across modules (*View*, *Create*, *Edit*, *Delete*, *Approve*).
   * Click **Save Permissions**.
* **⚠️ Validation Errors to Test**:
  * Submitting custom role without name triggers `"Role name is required"`.
  * Selecting zero permissions triggers `"At least one permission must be granted"`.

---

## 9. 📋 Onboarding & Document Verification

* **Route**: `/onboarding`

### **Features & Testing**:
1. **Onboarding Pipeline**:
   * Track status of new hires (*Pending Documents*, *Verification in Progress*, *Completed*).
2. **Document Verification Modal**:
   * Click on any new joiner record to preview submitted ID proofs (Aadhaar, PAN, Passport).
   * Click **Verify** or **Request Resubmission**.
* **⚠️ Validation Errors to Test**:
  * Rejecting a document without entering a rejection note triggers `"Rejection reason is required"`.

---

## 💡 Quick Tips for Testers
> [!TIP]
> **Performance Verification**: All major data tables (Employee Directory, Attendance Log, Leave Requests) use **Virtualization**. Open Chrome DevTools (`F12` $\rightarrow$ `Elements`) while scrolling to verify sub-16ms frame rates and zero DOM bloat.

> [!NOTE]
> **Responsive Layouts**: Resize your browser window or switch to mobile view (`< 600px`). The app automatically switches table views into compact mobile cards.
