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

🧭 **How to Get Here**: After logging in, click **Dashboard** in the left sidebar (the top menu item under main navigation). This takes you to `/dashboard`. If you are logged in as an administrator (`ORG_ADMIN` or `HR_ADMIN`) and your organization setup is incomplete (i.e. Head Office branch, departments, or designations have not yet been created), the purple **Organization Initial Setup Required 🎉** banner will appear near the top of the dashboard page. Click **Complete Initial Setup** on the right side of this banner to open the setup wizard modal dialog (`AdminSetupWizardDialog`). If you do not see this banner, your organization structure is already fully configured or your role does not have setup permissions — see the Role-Based Access table below.

* **Route**: `/dashboard` (Modal overlay: `AdminSetupWizardDialog`)
* **Overview**: Interactive setup wizard allowing company administrators to configure organization locales (country, timezone, currency, fiscal year) and automatically seed Head Office branch, default departments, designations, shifts, and statutory national holidays into the database.
* **Testing Steps**:
  1. Log in as `ORG_ADMIN` or `HR_ADMIN` and navigate to `/dashboard`.
  2. Locate the **Organization Initial Setup Required 🎉** card and click **Complete Initial Setup**.
  3. Verify the setup modal opens with pre-filled default locale values fetched from your tenant organization.
  4. Fill or adjust the 8 configuration fields (**Country Code**, **Timezone**, **Base Currency**, **Fiscal Year Start**, **Employee Count Range**, **Industry**, **Phone Number**, **Admin Job Title**).
  5. Click **Complete Setup & Seed Head Office**.
  6. Confirm the loading spinner runs, the modal closes, the success toast appears, and the setup banner on `/dashboard` auto-hides once all initial master data is seeded.

---

#### 📝 **Step-by-Step Field Guide: Organization Setup Wizard**

| Label as Shown on Screen | What to Enter or Select | Required? | Dependencies & Dynamic Behaviors |
| :--- | :--- | :---: | :--- |
| **Country Code** | Select country from dropdown.<br>• *Format*: 2-letter ISO code dropdown.<br>• *Valid Example*: `India (IN)` | **Yes** | Pre-populated from tenant data (`orgData.countryCode`). Selecting a new country dynamically updates the flag icon and international dial code in the **Phone Number** field. |
| **Timezone** | Select primary timezone from dropdown.<br>• *Format*: Standard IANA timezone string.<br>• *Valid Example*: `Asia/Kolkata (IST +5:30)` | **Yes** | Pre-populated from `orgData.timezone`. Options: `Asia/Kolkata`, `UTC`, `America/New_York`, `Europe/London`, `Asia/Dubai`. |
| **Base Currency** | Select base accounting currency.<br>• *Format*: 3-letter currency code dropdown.<br>• *Valid Example*: `INR (₹) - Indian Rupee` | **Yes** | Pre-populated from `orgData.baseCurrency`. Options: `INR`, `USD`, `EUR`, `GBP`, `AED`. |
| **Fiscal Year Start** | Select fiscal year starting month.<br>• *Format*: Month name dropdown.<br>• *Valid Example*: `April` | **Yes** | Pre-populated from `orgData.fiscalYearStart`. Options: `April`, `January`, `July`, `October`. |
| **Employee Count Range** | Select estimated workforce scale.<br>• *Format*: Range bracket dropdown.<br>• *Valid Example*: `11-50` | **Yes** | Pre-populated from `orgData.employeeCountRange`. Options: `1-10 Employees`, `11-50 Employees`, `51-200 Employees`, `201-500 Employees`, `500+ Employees`. Automatically sets `maxEmployees` subscription limit on backend. |
| **Industry** | Select primary business sector.<br>• *Format*: Category dropdown.<br>• *Valid Example*: `Technology` | **Yes** | Pre-populated from `orgData.industry`. Options: `Technology`, `Healthcare`, `Financial Services`, `Retail & E-commerce`, `Manufacturing`, `Education`, `Professional Services`, `Other`. |
| **Phone Number** | Enter contact phone number.<br>• *Format*: Exactly 10 numeric digits (digits only, no spaces or symbols).<br>• *Valid Example*: `9876543210` | **Yes** | Uses `<PhoneInput />`. Pre-filled from `orgData.phone` (stripped of non-digits). Automatically strips non-numeric characters as you type. Dial code prefix is linked to **Country Code**. |
| **Admin Job Title** | Enter administrator's official title.<br>• *Format*: Free-text string (1–100 chars).<br>• *Valid Example*: `Head of HR & Operations` | **Yes** | Plain text input. Must not be empty or whitespace-only. Saved to administrator profile. |

##### **Modal Action Buttons & Controls**
* **`Cancel` Button**: Closes the dialog (`onClose()`) without saving changes or seeding database tables. Disabled while form submission is in progress (`submitting: true`).
* **`Close (X)` Icon**: Located at top-right of dialog header. Immediately dismisses the modal without submitting.
* **`Complete Setup & Seed Head Office` Button**: Triggers form submission (`handleSubmit`). 
  * *Input State*: Requires **Phone Number** (10 digits) and **Admin Job Title** to be non-empty.
  * *Submitting State*: Disables both buttons, shows `<CircularProgress size={18} />`, and changes label to `"Completing & Seeding..."`.

---

#### **✅ Success Cases**

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Open Setup Wizard Dialog** | Click **Complete Initial Setup** button on `OrgSetupGuidanceWidget` card | `AdminSetupWizardDialog` opens (`open={true}`). Backdrop blurs (`backdropFilter: "blur(6px)"`). Form controls pre-fill with tenant data from `useUserOrgData()`. | [`OrgSetupGuidanceWidget.tsx:L169`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L169) |
| **Country Flag & Phone Dial Sync** | Change **Country Code** dropdown selection | Country flag icon and phone prefix inside `<PhoneInput />` update dynamically to match the selected country code. | [`AdminSetupWizardDialog.tsx:L337-L344`](file:///d:/hrms/src/sections/dashboard/components/AdminSetupWizardDialog.tsx#L337-L344) |
| **Execute Setup & Master Data Seeding** | Fill valid inputs & click **Complete Setup & Seed Head Office** | API POST `/api/v1/auth/complete-onboarding` returns HTTP 200. Backend creates `Head Office` branch (code `HQ`), seeds default roles, departments, designations, shifts, and national holidays. Toast displays `"Workspace configured successfully."`. Dialog closes and `fetchCounts()` triggers. | [`AdminSetupWizardDialog.tsx:L126-L134`](file:///d:/hrms/src/sections/dashboard/components/AdminSetupWizardDialog.tsx#L126-L134), [`auth.service.ts:L751-L830`](file:///d:/hrms/hrms-backend/src/modules/auth/auth.service.ts#L751-L830) |
| **Refresh Progress Counts** | Click **Refresh status** icon (🔄) on `OrgSetupGuidanceWidget` header | `fetchCounts()` re-queries `getHeadOffice()`, `listDepartments(1,1)`, and `listDesignations(1,1)`. Progress bar updates to match completed steps (`0%`, `33%`, `66%`, `100%`). | [`OrgSetupGuidanceWidget.tsx:L41-L69`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L41-L69) |
| **Auto-Hide Guidance Banner** | Complete setup so Head Office, Departments, and Designations exist | `OrgSetupGuidanceWidget` checks `hasBranch && hasDepts && hasDesigs === true` and cleanly unmounts (`return null`) from `/dashboard`. | [`OrgSetupGuidanceWidget.tsx:L96`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L96) |

---

#### **⚠️ Validation Errors to Test**

| Field | Trigger Condition | Expected Error Message | Source / File Reference |
| :--- | :--- | :--- | :--- |
| **Phone Number** | Enter a phone number with length $\neq 10$ digits (e.g. `98765`) and submit | `"Contact phone number must be exactly 10 digits."` | Frontend [`AdminSetupWizardDialog.tsx:L106-L109`](file:///d:/hrms/src/sections/dashboard/components/AdminSetupWizardDialog.tsx#L106-L109) |
| **Phone Number** | Submit with phone field completely empty | Form submission blocked by `!phone.trim()` check / HTML5 `required` attribute validation | Frontend [`AdminSetupWizardDialog.tsx:L104`](file:///d:/hrms/src/sections/dashboard/components/AdminSetupWizardDialog.tsx#L104) |
| **Admin Job Title** | Leave blank or enter whitespace only and submit | Form submission blocked silently by `!adminJobTitle.trim()` check / HTML5 `required` attribute validation | Frontend [`AdminSetupWizardDialog.tsx:L104`](file:///d:/hrms/src/sections/dashboard/components/AdminSetupWizardDialog.tsx#L104) |
| **Country Code** | Send single character or invalid code via direct API payload | `"Country code must be 2 characters"` | Backend Zod DTO [`common.validator.ts:L218`](file:///d:/hrms/hrms-backend/src/shared/validators/common.validator.ts#L218) |
| **Timezone** | Send empty string for timezone via direct API payload | `"Timezone is required"` | Backend Zod DTO [`auth.dto.ts:L92`](file:///d:/hrms/hrms-backend/src/modules/auth/auth.dto.ts#L92) |
| **Industry** | Send string shorter than 2 characters via direct API payload | `"Must be at least 2 character"` | Backend Zod DTO [`common.validator.ts:L201`](file:///d:/hrms/hrms-backend/src/shared/validators/common.validator.ts#L201) |
| **Admin Job Title** | Send whitespace-only string `" "` via direct API payload | `"Job title cannot be empty"` | Backend Zod DTO [`auth.dto.ts:L104`](file:///d:/hrms/hrms-backend/src/modules/auth/auth.dto.ts#L104) |

---

#### **❌ Error / Failure Cases**

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Missing Tenant Session (401)** | Submit setup form without active JWT auth session (`!req.context?.tenantId`) | Backend returns HTTP 401. Dialog catches error and displays red alert: `"Unauthorized"`. | [`auth.controller.ts:L227-L230`](file:///d:/hrms/hrms-backend/src/modules/auth/auth.controller.ts#L227-L230) |
| **Organization Not Found (404)** | Submit setup for a deleted/invalid `tenantId` | Backend returns HTTP 404. Dialog catches error and displays red alert: `"Organization not found"`. | [`auth.service.ts:L753`](file:///d:/hrms/hrms-backend/src/modules/auth/auth.service.ts#L753) |
| **API / Server Setup Failure (500)** | Database transaction or seeding script fails during submission | Red `<Alert severity="error">` banner renders inside dialog displaying `err?.response?.data?.message` or `"Failed to complete onboarding setup."`. Dialog remains open with entered values preserved. | [`AdminSetupWizardDialog.tsx:L137-L140`](file:///d:/hrms/src/sections/dashboard/components/AdminSetupWizardDialog.tsx#L137-L140) |
| **Head Office Check API Failure** | `getHeadOffice()` API call fails on widget mount | `OrgSetupGuidanceWidget` silently catches error, sets `hasBranch = false`, allowing manual branch creation step to remain visible. | [`OrgSetupGuidanceWidget.tsx:L50-L52`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L50-L52) |
| **Department / Designation Count API Failure** | `listDepartments()` or `listDesignations()` API network failure | `Promise.all` catch block catches error, sets counts to `0`, and displays top error alert: `"Failed to check organization setup status."`. | [`OrgSetupGuidanceWidget.tsx:L63-L66`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L63-L66) |

---

#### **🛡️ Role-Based Access & Restrictions**

| Role Slug | Can Access Setup Banner & Dialog? | Component Visibility / Restrictions | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Yes | Full access. `OrgSetupGuidanceWidget` renders on `/dashboard`. Can open setup modal, execute setup, and seed Head Office master data. | [`OrgSetupGuidanceWidget.tsx:L72`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L72) |
| **`HR_ADMIN`** | ✅ Yes | Full access. `OrgSetupGuidanceWidget` renders on `/dashboard`. Can open setup modal, execute setup, and seed Head Office master data. | [`OrgSetupGuidanceWidget.tsx:L72`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L72) |
| **`EMPLOYEE`** | ❌ No | Access restricted. `OrgSetupGuidanceWidget` returns `null` (guidance banner and setup wizard are completely hidden). | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`MANAGER`** | ❌ No | Access restricted. `OrgSetupGuidanceWidget` returns `null` (guidance banner and setup wizard are completely hidden). | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`LEADERSHIP`** | ❌ No | Access restricted. `OrgSetupGuidanceWidget` returns `null` (guidance banner and setup wizard are completely hidden). | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`BRANCH_ADMIN`** | ❌ No | Access restricted. `OrgSetupGuidanceWidget` returns `null` (guidance banner and setup wizard are completely hidden). | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |
| **`PRODUCT_MANAGER`** | ❌ No | Access restricted. `OrgSetupGuidanceWidget` returns `null` (guidance banner and setup wizard are completely hidden). | [`OrgSetupGuidanceWidget.tsx:L87`](file:///d:/hrms/src/sections/dashboard/components/OrgSetupGuidanceWidget.tsx#L87) |

---

### Step 3 — Flag List (Uncertainties & Rule Mismatches)

1. **Frontend vs Backend Validation Discrepancies:**
   * **Phone Number Length Rule**: 
     * **Frontend** (`AdminSetupWizardDialog.tsx:L106`) strictly enforces `phone.replace(/\D/g, "").length !== 10` and shows `"Contact phone number must be exactly 10 digits."`.
     * **Backend DTO** (`auth.dto.ts:L97`) uses `optionalString(phoneSchema)`, which checks `min(1, "Phone is required")` and regex `/^\d+$/` ("Phone must contain only digits"), but does **not** enforce 10 digits. (Note: `withPhoneValidation` is defined in `common.validator.ts` but is not chained onto `OnboardingWizardDto`).
   * **Admin Job Title Empty State**:
     * **Frontend** (`AdminSetupWizardDialog.tsx:L104`) checks `!adminJobTitle.trim()` and returns silently without setting a state error string (relying on HTML5 `required` browser validation).
     * **Backend DTO** (`auth.dto.ts:L104`) uses `optionalString(z.string().min(1, "Job title cannot be empty"))`. If sent as `""`, `optionalString` converts it to `undefined` (making it optional), but if sent as whitespace `" "`, Zod triggers `"Job title cannot be empty"`.
   * **Fiscal Year Month Options**:
     * **Frontend** UI dropdown only offers 4 months: `["April", "January", "July", "October"]`.
     * **Backend DTO** (`auth.dto.ts:L99-L103`) accepts an enum of all 12 calendar months (`"January"` through `"December"`).

2. **Toast Message Resolution:**
   * On success, `AdminSetupWizardDialog.tsx:L128-L131` attempts fallback `"Organization setup & Head Office seeding completed successfully!"`, but the backend API (`auth.service.ts:L826`) returns `message: "Workspace configured successfully."`. Therefore, `showSnackbar` displays the backend string (`"Workspace configured successfully."`).

3. **Role Gating Consistency:**
   * `OrgSetupGuidanceWidget.tsx` explicitly permits `ORG_ADMIN` and `HR_ADMIN`. `BRANCH_ADMIN` is excluded from initial setup guidance because the wizard creates the root `Head Office` branch.

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

🧭 **How to Get Here**: After logging in, click **Employees** in the left sidebar (under main navigation, with the workforce icon). This takes you to `/employees/list` (or `/employees/directory`). Click the **Add Employee** button at the top right of the employee directory view, or navigate directly to `/employees/create`. If you do not see the **Employees** menu item or the **Add Employee** button, your role does not have `employee.read` or `employee.create` permissions — see the Role-Based Access table below.

* **Route**: `/employees/create` (wrapped in `<RoleGuard permission="employee.create">`)
* **Overview**: Comprehensive multi-card employee onboarding form featuring 7 structured cards, cascading organizational placement (Branch → Department → Designation → Eligible Managers), international phone formatting, bank account setup, and automatic salary structure mapping.
* **Testing Steps**:
  1. Log in as `ORG_ADMIN` or `HR_ADMIN` and navigate to `/employees/create`.
  2. Complete **Card 1: Organizational Placement**: Select **Branch Location** (STEP 1). Observe that **Department** (STEP 2) unlocks. Select a Department; observe that **Designation** (STEP 3) and **Primary Reporting Manager** (STEP 5) populate with branch-and-department-filtered options. Select Designation and System Security Role (STEP 7).
  3. Complete **Card 2: Basic Information & Contact**: Enter **First Name**, **Last Name**, **Work Email Address**, and **Mobile Number**.
  4. Complete **Card 3: Employment Details & Schedule**: Select **Employee Type** (defaults to `Full-Time`) and **Joining Date** (`YYYY-MM-DD`).
  5. (Optional) Complete **Card 4: Bank Account Details**: Enter **Bank Name**, **Account Number**, **IFSC Code**, and select **Account Type**.
  6. (Optional) Complete **Card 5: Compensation & Salary Setup**: Enter **Annual CTC (₹)** and review or adjust the component breakdown (**Basic Salary**, **HRA**, **Special Allowance**).
  7. Click **💾 Submit Employee**.
  8. Confirm the loading spinner runs inside the button (`submitting: true`), the form submits to POST `/api/v1/employees`, a success toast is dispatched, and you are redirected to `/employees/directory`.

---

#### 📝 **Step-by-Step Field Guide: Add New Employee Form**

##### **Card 1: Organizational Placement & Hierarchy**

| Label as Shown on Screen | What to Enter or Select | Required? | Dependencies & Dynamic Behaviors |
| :--- | :--- | :---: | :--- |
| **STEP 1: Branch Location** | Select physical office branch.<br>• *Format*: Select dropdown.<br>• *Valid Example*: `Head Office` | **Yes** | Pre-populated with active branch from `useActiveBranchId()`. Changing Branch resets Department, Designation, and Manager fields, and triggers `listDepartments(1, 100, branchId)`. |
| **STEP 2: Department** | Select organizational department.<br>• *Format*: Cascading dropdown.<br>• *Valid Example*: `Engineering (ENG)` | **Yes** | Disabled until **Branch Location** is selected (`disabledPlaceholder: "Select Branch first"`). Changing Department resets Designation and Manager fields, and triggers `listDesignations(1, 100, departmentId)`. |
| **STEP 3: Designation** | Select official job designation.<br>• *Format*: Cascading dropdown.<br>• *Valid Example*: `Senior Full Stack Developer` | **Yes** | Disabled until **Department** is selected (`disabledPlaceholder: "Select Department first"`). Options are filtered by selected Department. |
| **STEP 4: Squad Team** | Select functional project squad/team.<br>• *Format*: Select dropdown.<br>• *Valid Example*: `Core Platform Squad (SQUAD)` | Optional | Populated from `listTeams()`. Optional placement tag. |
| **STEP 5: Primary Reporting Manager** | Select direct reporting manager.<br>• *Format*: Cascading dropdown with sub-labels.<br>• *Valid Example*: `Vikram Malhotra [EMP-004] • Engineering Lead` | Optional | Disabled until both **Branch** and **Department** are selected (`disabledPlaceholder: "Select Branch & Dept first"`). Populated dynamically by `useEligibleManagers()`. Auto-selects department head if default manager exists. |
| **STEP 6: Secondary Managers** | Select matrix/project managers.<br>• *Format*: Multi-select dropdown.<br>• *Valid Example*: `Ananya Sharma [EMP-012] • Product Manager` | Optional | Disabled until Branch and Department are selected. Supports multiple manager selections. |
| **STEP 7: System Security Role** | Select system access role.<br>• *Format*: Select dropdown.<br>• *Valid Example*: `Employee (EMPLOYEE)` | **Yes** | Options loaded from `listRoles()` API with fallback defaults (`EMPLOYEE`, `MANAGER`, `TEAM_LEADER`, `HR_ADMIN`, `BRANCH_ADMIN`, `ORG_ADMIN`). Defaults to `EMPLOYEE`. |

---

##### **Card 2: Basic Information & Contact**

| Label as Shown on Screen | What to Enter or Select | Required? | Dependencies & Dynamic Behaviors |
| :--- | :--- | :---: | :--- |
| **First Name** | Enter employee's first name.<br>• *Format*: Text string (2–100 chars).<br>• *Valid Example*: `Rohan` | **Yes** | Plain text input. `autoComplete="new-password"` enabled to prevent browser autofill. |
| **Last Name** | Enter employee's last name.<br>• *Format*: Text string (2–100 chars).<br>• *Valid Example*: `Sharma` | **Yes** | Plain text input. `autoComplete="new-password"` enabled. |
| **Work Email Address** | Enter official company email address.<br>• *Format*: Valid email string.<br>• *Valid Example*: `rohan.sharma@apexglobal.io` | **Yes** | Validated for email format. Serves as unique login identity across tenant. |
| **Mobile Number** | Select country code & enter phone number.<br>• *Format*: International phone component.<br>• *Valid Example*: `+91` `9876543210` | Optional | Uses `<PhoneInput />`. Max 10 digits for subscriber portion. Strips non-digits automatically. |

---

##### **Card 3: Employment Details & Schedule**

| Label as Shown on Screen | What to Enter or Select | Required? | Dependencies & Dynamic Behaviors |
| :--- | :--- | :---: | :--- |
| **Employee Type** | Select employment category.<br>• *Format*: Select dropdown.<br>• *Valid Example*: `Full-Time` | **Yes** | Options: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN`, `CONSULTANT`, `TEMPORARY`, `FREELANCE`. Defaults to `FULL_TIME`. Automatically updates **Salary Pay Type** (`FULL_TIME` → `CTC`, `PART_TIME` → `HOURLY_RATE`, `CONTRACT` → `FIXED_MONTHLY`, `INTERN` → `STIPEND`). |
| **Joining Date** | Select official date of joining.<br>• *Format*: Calendar date picker (`YYYY-MM-DD`).<br>• *Valid Example*: `2026-09-15` | **Yes** | Formats date string to `YYYY-MM-DD` on submission using `formatToYYYYMMDD()`. |
| **Probation End Date** | Select end date of probation period.<br>• *Format*: Calendar date picker (`YYYY-MM-DD`).<br>• *Valid Example*: `2026-12-15` | Optional | Date picker input. |
| **Shift Selection** | Select assigned working shift.<br>• *Format*: Select dropdown.<br>• *Valid Example*: `General Morning Shift (09:00 - 18:00)` | Optional | Populated from `listShifts()`. Defaults to organization's default shift if left unselected. |

---

##### **Card 4: Bank Account Details (Payroll Setup)**

| Label as Shown on Screen | What to Enter or Select | Required? | Dependencies & Dynamic Behaviors |
| :--- | :--- | :---: | :--- |
| **Bank Name** | Enter financial institution name.<br>• *Format*: Text string.<br>• *Valid Example*: `HDFC Bank` | Optional | Plain text input. |
| **Account Number** | Enter bank account number.<br>• *Format*: 6 to 20 numeric digits.<br>• *Valid Example*: `50100432109876` | Optional | Restricted to numeric format up to 20 digits. |
| **IFSC Code** | Enter bank branch IFSC code.<br>• *Format*: 11-char uppercase alphanumeric string.<br>• *Valid Example*: `HDFC0001234` | Optional | Auto-converts input to uppercase. Validated against regex `/^[A-Z]{4}0[A-Z0-9]{6}$/`. |
| **Account Type** | Select bank account type.<br>• *Format*: Select dropdown.<br>• *Valid Example*: `Salary Account` | Optional | Options: `SALARY`, `SAVINGS`, `CURRENT`. Defaults to `SALARY`. |
| **Account Holder Name** | Enter account holder name.<br>• *Format*: Free text string.<br>• *Valid Example*: `Rohan Sharma` | Optional | If left blank, automatically pre-fills with `${firstName} ${lastName}` on form submit. |

---

##### **Card 5: Compensation & Salary Setup**

| Label as Shown on Screen | What to Enter or Select | Required? | Dependencies & Dynamic Behaviors |
| :--- | :--- | :---: | :--- |
| **Annual CTC (₹)** | Enter total annual CTC amount.<br>• *Format*: Number input.<br>• *Valid Example*: `1200000` | Optional | Numeric input. Used to calculate default line-item breakdown if components are unallocated. |
| **Currency** | Select compensation currency.<br>• *Format*: Select dropdown.<br>• *Valid Example*: `INR (₹)` | Optional | Options: `INR`, `USD`, `EUR`, `GBP`. |
| **Basic Salary** | Enter annual Basic salary component.<br>• *Format*: Number input.<br>• *Valid Example*: `600000` | Optional | Maps to component code `BASIC`. Defaults to 50% of CTC if left blank. |
| **HRA** | Enter House Rent Allowance component.<br>• *Format*: Number input.<br>• *Valid Example*: `300000` | Optional | Maps to component code `HRA`. |
| **Special Allowance** | Enter Special Allowance component.<br>• *Format*: Number input.<br>• *Valid Example*: `300000` | Optional | Maps to component code `ALLOWANCE`. |

---

##### **Action Buttons & Form Controls**

* **`Cancel` Button**: Located at bottom right of form. Navigates back to `/employees/directory` without saving.
* **`💾 Submit Employee` Button**: Triggers `handleSubmit(onSubmit, onInvalidForm)`.
  * *Valid State*: Disables button, renders `<CircularProgress size={24} color="inherit" />`, and dispatches `createEmployeeRequest(payload)`.
  * *Invalid State*: Prevents submission, logs error object, and renders a warning banner at top: `"Validation Error: Please check "[fieldName]" ([errorDetails])"`.

---

#### **✅ Success Cases**

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Open Add Employee Form** | Navigate to `/employees/create` or click **Add Employee** button | `EmployeeCreateView` opens (`<RoleGuard permission="employee.create">`). Active branch pre-selects in **STEP 1**. Roles and Teams load from API. | [`EmployeeCreateView.tsx:L72-L173`](file:///d:/hrms/src/sections/employees/employee-create/EmployeeCreateView.tsx#L72-L173) |
| **Cascading Branch & Dept Selection** | Select Branch, then Department | `listDepartments(1, 100, branchId)` and `listDesignations(1, 100, departmentId)` execute. Cascading dropdowns populate. `useEligibleManagers()` fetches filtered manager list. | [`EmployeeCreateView.tsx:L208-L277`](file:///d:/hrms/src/sections/employees/employee-create/EmployeeCreateView.tsx#L208-L277) |
| **Auto-Select Default Manager** | Select Department that has a designated head | `useEligibleManagers` hook returns `defaultManagerId`. Form automatically sets `managerId` field. | [`EmployeeCreateView.tsx:L280-L284`](file:///d:/hrms/src/sections/employees/employee-create/EmployeeCreateView.tsx#L280-L284) |
| **Submit Valid Employee Form** | Fill required fields & click **💾 Submit Employee** | Form passes Zod schema validation. Payload dispatches to POST `/api/v1/employees`. Backend creates Employee record & User account, generates atomic employee code (`EMP-xxx`), and returns HTTP 201. Redux triggers `success: true`, toast displays, and page redirects to `/employees/directory`. | [`EmployeeCreateView.tsx:L340-L414`](file:///d:/hrms/src/sections/employees/employee-create/EmployeeCreateView.tsx#L340-L414), [`employee.service.ts:L67-L180`](file:///d:/hrms/hrms-backend/src/modules/employee/services/employee.service.ts#L67-L180) |
| **Account Holder Name Auto-Fill** | Fill Bank Account Number & IFSC, leave **Account Holder Name** blank | On submit, `onSubmit` handler automatically constructs `accountHolderName = "${firstName} ${lastName}"`. | [`EmployeeCreateView.tsx:L377-L379`](file:///d:/hrms/src/sections/employees/employee-create/EmployeeCreateView.tsx#L377-L379) |

---

#### **⚠️ Validation Errors to Test**

| Field | Trigger Condition | Expected Error Message | Source / File Reference |
| :--- | :--- | :--- | :--- |
| **First Name** | Enter < 2 characters or leave empty | `"First name must be 2-100 characters"` | Frontend [`create-employee.schema.ts:L86`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L86) |
| **Last Name** | Enter < 2 characters or leave empty | `"Last name must be 2-100 characters"` | Frontend [`create-employee.schema.ts:L87`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L87) |
| **Work Email Address** | Leave empty or enter invalid email format (e.g. `rohan@`) | `"Email is required"` / `"Please enter a valid email"` | Frontend [`create-employee.schema.ts:L88`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L88) |
| **Mobile Number** | Enter > 10 digits (e.g. `98765432101`) | `"Phone number cannot exceed 10 digits"` | Frontend [`create-employee.schema.ts:L89`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L89) |
| **STEP 1: Branch Location** | Submit form without branch selected | `"Branch is required"` | Frontend [`create-employee.schema.ts:L100`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L100) |
| **STEP 2: Department** | Submit form without department selected | `"Department is required"` | Frontend [`create-employee.schema.ts:L101`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L101) |
| **STEP 3: Designation** | Submit form without designation selected | `"Designation is required"` | Frontend [`create-employee.schema.ts:L102`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L102) |
| **STEP 7: System Security Role** | Submit form without role selected | `"Role is required"` | Frontend [`create-employee.schema.ts:L107`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L107) |
| **Joining Date** | Leave joining date empty | `"Joining date is required"` | Frontend [`create-employee.schema.ts:L109`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L109) |
| **Account Number** | Enter invalid account number (< 6 digits or non-numeric) | `"Account number must be 6-20 numeric digits"` | Frontend [`create-employee.schema.ts:L67`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L67) |
| **IFSC Code** | Enter invalid IFSC format (e.g. `HDFC123`) | `"Invalid IFSC code format (e.g. HDFC0001234)"` | Frontend [`create-employee.schema.ts:L77`](file:///d:/hrms/src/validations/employee/create-employee.schema.ts#L77) |

---

#### **❌ Error / Failure Cases**

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Workspace Tier User Limit Reached (403)** | Submit employee creation when tenant has reached `maxEmployees` capacity | API returns HTTP 403. Red alert banner displays: `"User limit reached for your workspace tier (Team size range: X, Max allowed: Y users). You cannot add user/employee #Z. Please upgrade your workspace tier."`. | [`employee.service.ts:L83-L88`](file:///d:/hrms/hrms-backend/src/modules/employee/services/employee.service.ts#L83-L88) |
| **Strict Branch Exclusivity Rule Violation (409)** | Create an employee with an email/identity already actively assigned to another branch | API returns HTTP 409. Red alert banner displays: `"Strict Branch Exclusivity Rule: This employee is already actively assigned to branch \"[Branch Name]\". An employee cannot belong to multiple branches simultaneously..."`. | [`employee.service.ts:L103-L109`](file:///d:/hrms/hrms-backend/src/modules/employee/services/employee.service.ts#L103-L109) |
| **Duplicate Email Address (409)** | Submit form with an email that already exists in the organization | API returns HTTP 409. Red alert banner displays: `"Employee with email \"[email]\" already exists"` or `"A user account with email \"[email]\" already exists"`. | [`employee.service.ts:L113-L129`](file:///d:/hrms/hrms-backend/src/modules/employee/services/employee.service.ts#L113-L129) |
| **Inactive / Invalid Branch (400)** | Select a branch that has been deactivated or deleted in DB | API returns HTTP 400. Red alert banner displays: `"Specified branch does not exist or is inactive in this organization."`. | [`employee.service.ts:L163-L165`](file:///d:/hrms/hrms-backend/src/modules/employee/services/employee.service.ts#L163-L165) |
| **Unauthorized Session (401)** | Submit form with an expired JWT access token | API returns HTTP 401. User is redirected to `/login`. | [`auth.middleware.ts:L35`](file:///d:/hrms/hrms-backend/src/shared/middlewares/auth.middleware.ts#L35) |

---

#### **🛡️ Role-Based Access & Restrictions**

| Role Slug | Can Access Add Employee Form? | Component Visibility & Behavior | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Yes | Full access. Has `employee.create` permission. Can open `/employees/create` and submit new employee profiles. | [`routes/index.tsx:L117-L122`](file:///d:/hrms/src/routes/index.tsx#L117-L122) |
| **`HR_ADMIN`** | ✅ Yes | Full access. Has `employee.create` permission. Can open `/employees/create` and submit new employee profiles. | [`routes/index.tsx:L117-L122`](file:///d:/hrms/src/routes/index.tsx#L117-L122) |
| **`EMPLOYEE`** | ❌ No | Access restricted. Does not have `employee.create`. `RoleGuard` blocks route `/employees/create` and redirects to `/unauthorized`. | [`RoleGuard.tsx:L28`](file:///d:/hrms/src/auth/guards/RoleGuard.tsx#L28) |
| **`MANAGER`** | ❌ No | Access restricted. Does not have `employee.create`. `RoleGuard` blocks route `/employees/create` and redirects to `/unauthorized`. | [`RoleGuard.tsx:L28`](file:///d:/hrms/src/auth/guards/RoleGuard.tsx#L28) |
| **`LEADERSHIP`** | ❌ No | Access restricted. Does not have `employee.create`. `RoleGuard` blocks route `/employees/create` and redirects to `/unauthorized`. | [`RoleGuard.tsx:L28`](file:///d:/hrms/src/auth/guards/RoleGuard.tsx#L28) |
| **`BRANCH_ADMIN`** | ❌ No | Access restricted. Does not have `employee.create` by default. `RoleGuard` blocks route `/employees/create` and redirects to `/unauthorized`. | [`RoleGuard.tsx:L28`](file:///d:/hrms/src/auth/guards/RoleGuard.tsx#L28) |
| **`PRODUCT_MANAGER`** | ❌ No | Access restricted. Does not have `employee.create`. `RoleGuard` blocks route `/employees/create` and redirects to `/unauthorized`. | [`RoleGuard.tsx:L28`](file:///d:/hrms/src/auth/guards/RoleGuard.tsx#L28) |

---

### Step 3 — Flag List (Uncertainties & Rule Mismatches)

1. **Frontend vs Backend Validation Discrepancies:**
   * **Phone Number Regex Rule**:
     * **Frontend** (`create-employee.schema.ts:L89`) validates phone with regex `/^\d{1,10}$/` ("Phone number cannot exceed 10 digits").
     * **Backend DTO** (`employee.dto.ts:L21` & `common.validator.ts:L34-L38`) uses `withPhoneValidation` and `phoneSchema` (`/^\d+$/`). It checks numeric digits, but does not limit length to 10 digits unless `withPhoneValidation` library parsing succeeds.
   * **Work Email Key Mapping**:
     * **Frontend** form field registers as `email`.
     * **Backend DTO** (`employee.dto.ts:L143-L146`) accepts both `email` and `workEmail`, transforming `data.email || data.workEmail` into the final `email` property.

2. **Role Fallback List:**
   * If the backend `listRoles()` API call fails or experiences network latency, `EmployeeCreateView.tsx:L53-L60` falls back to `DEFAULT_FALLBACK_ROLES` (`EMPLOYEE`, `MANAGER`, `TEAM_LEADER`, `HR_ADMIN`, `BRANCH_ADMIN`, `ORG_ADMIN`) to prevent blocking the form UI.

3. **Salary Structure Pay Type Sync:**
   * Selecting `employeeType` automatically sets `salarySetup.employeePayType` and maps structure types (`FULL_TIME` → `CTC`, `PART_TIME` → `HOURLY_RATE`, `CONTRACT`/`TEMPORARY`/`FREELANCE` → `FIXED_MONTHLY`, `INTERN`/`CONSULTANT` → `STIPEND`). If `manageSalary` is true and line items are empty, `onSubmit` automatically defaults `BASIC` component to 50% of annual CTC.

---

### **3.3 Employee Profile Tabs**

* **Routes**: `/profile` (Self Profile), `/employees/:id` (Employee 360° Profile)
* **Overview**: Comprehensive employee profile hub providing a 360-degree view of employee personal details, organizational placement, reporting hierarchy, attendance logs, leave balances, bank accounts, salary structure, and uploaded verification documents. Features 6 active primary tabs (**Overview**, **Personal**, **Attendance**, **Leave**, **Payroll**, **Documents**), live profile picture cropping/uploading, emergency contact management, leave application, bank account linking, and salary structure assignment.

---

🧭 **How to Get Here**:
* **Self Profile**: After logging in, click **My Profile** (with the `<PersonIcon />`) located at the bottom of the left sidebar navigation. This navigates directly to `/profile` (defaulting to `/profile?tab=overview`). Accessible to all logged-in users regardless of role.
* **Employee 360° Profile**: Click **Employees** in the left sidebar (under main navigation), select **Directory** or **Employee List** (`/employees/directory`), and click on any employee row/card. This opens `/employees/:id`. Accessing another employee's profile requires `employee.read` permission.

---

### 📝 Step-by-Step Field Guide: Profile Actions & Modals (By Section Tab)

#### 🔷 A. Overview Section Tab (`?tab=overview`)

##### 1. 📷 Upload Profile Picture (Avatar) Dialog
* **Trigger**: Hover over or click the blue edit pencil icon (`<EditOutlinedIcon />`) at the bottom-right of the avatar frame on the hero header card.
* **Modal**: `UploadAvatarDialog.tsx`
* **Fields & Controls**:
  * **Image File Input**: Click the circular upload zone or **Change Photo** link. Accepts `.png`, `.jpg`, `.jpeg`, `.webp` image files up to **5MB**. Selecting an invalid file type displays `"Invalid file type. Please select an image file (PNG, JPG, WEBP)."`. Exceeding 5MB displays `"File size exceeds 5MB limit. Please select a smaller image."`.
  * **Interactive Image Cropper**: Renders a circular cropping canvas (`CROP_SIZE = 220px`). Drag the photo within the frame to position.
  * **Zoom Controls**: Use the zoom slider, **Zoom In** (`+`), **Zoom Out** (`-`), mouse wheel scroll, or **Reset** (🔄) button to scale the image between `1.0x` and `3.0x`.
  * **Submit Button (`Upload Picture`)**: Generates a 400x400 PNG crop canvas and submits via `PATCH /api/v1/employees/me/avatar` (or `PATCH /api/v1/employees/:id/avatar`). On success, dispatches toast `"Profile picture updated successfully"` and updates the header avatar across the app.

##### 2. 💡 Add Skill or Expertise Modal
* **Trigger**: Click **+ Add Skill** chip on the **Skills & Expertise** card inside the **Overview** tab (`?tab=overview`).
* **Modal**: Built-in `Dialog` in `OverviewTab.tsx`
* **Fields & Controls**:
  * **Skill Name**: Text input for technical or domain skill (e.g. `Docker`, `Python`, `TypeScript`).
  * **Submit Button (`Add Skill`)**: Appends skill chip to local profile state and displays toast `"Skill added to profile"`.

---

#### 🔷 B. Personal Section Tab (`?tab=personal`)

##### 3. ✏️ Edit Personal Details & Address Modal
* **Trigger**: Click **Edit Details** at the top right of the **Personal Information** card inside the **Personal** tab (`?tab=personal`).
* **Modal**: Built-in `Dialog` in `ProfileView.tsx`
* **Fields & Controls**:
  * **Phone Number**: Plain text input. Enter a 10-digit mobile number (e.g. `9876543210`). Optional.
  * **Date of Birth**: Native date picker (`YYYY-MM-DD`). E.g. `1995-08-15`. Optional.
  * **Gender**: Dropdown select with options `MALE`, `FEMALE`, `OTHER`. Optional.
  * **Country Code**: Text input for 2-letter ISO country code (e.g. `IN`). Defaults to `IN`.
  * **Address Line 1**: Text input for street/house address (e.g. `123 MG Road, Koramangala`). Optional.
  * **City**: Text input for city (e.g. `Bangalore`). Optional.
  * **State**: Text input for state (e.g. `Karnataka`). Optional.
  * **Pincode / Zip**: Text input for postal code (e.g. `560001`). Optional.
  * **Submit Button (`Save Changes`)**: Submits payload to `PATCH /api/v1/employees/me`. Displays toast `"Personal details and address updated successfully"`.

##### 4. 🚨 Add Emergency Contact Modal
* **Trigger**: Click **Add Contact** (`+`) at the top right of the **Emergency Contacts** card in the **Personal** tab (`?tab=personal`).
* **Modal**: `EmergencyContactDialog.tsx`
* **Fields & Controls**:
  * **Full Name** (`name`): Exact text input. Required. E.g. `Anita Nair`.
  * **Relationship** (`relationship`): Exact text input. Required. E.g. `Mother`, `Father`, `Spouse`.
  * **Phone Number** (`phone`): Numeric phone input. Auto-strips non-digits (`replace(/\D/g, "")`) and caps at 10 digits. Required. E.g. `9876500001`.
  * **Submit Button (`Save Contact`)**: Appends contact to `emergencyContacts` array and updates profile via `PATCH /api/v1/employees/me`. Displays toast `"Emergency contact added successfully"`.

---

#### 🔷 C. Attendance Section Tab (`?tab=attendance`)

##### 5. ⏰ Attendance Log & Calendar View
* **Trigger**: Click the **Attendance** tab (`?tab=attendance`).
* **Controls & Views**:
  * **Date Range Filters**: **From Date** (defaults to 1st of current month `YYYY-MM-01`) and **To Date** (defaults to current date `YYYY-MM-DD`).
  * **View Switcher**: Toggle between **List View** (structured table with columns Date, Status, Check In, Check Out, Worked Hours, Actions) and **Calendar View** (FullCalendar interactive grid color-coded by status: Green = Present, Orange = Late/Half Day, Red = Absent, Blue = On Leave).
  * **Monthly Summary Card**: Displays statistics for the selected period (Total Working Days, Days Present, Days Late, Days Absent, Leaves Taken, Total Worked Hours).
  * **Attendance Record Detail Modal**: Click any log row in List View or event block in Calendar View to open detailed punch logs, IP/location metadata, and regularization status.

##### 6. ➕ Manual Attendance Entry Modal
* **Trigger**: Click **+ Manual Entry** button in **Attendance** tab (visible only if user holds `attendance.create` permission).
* **Modal**: `ManualAttendanceDialog.tsx`
* **Fields & Controls**:
  * **Date**: Date picker (`YYYY-MM-DD`). E.g. `2025-06-10`. Required.
  * **Punch In Time**: Time picker (`HH:mm`). E.g. `09:15 AM`. Required.
  * **Punch Out Time**: Time picker (`HH:mm`). E.g. `06:30 PM`. Required.
  * **Attendance Status**: Select dropdown with options `PRESENT`, `LATE`, `HALF_DAY`, `ABSENT`. Required.
  * **Notes / Reason**: Text input for admin override justification. Optional.
  * **Submit Button (`Save Log`)**: Submits payload to `POST /api/v1/attendance/manual`. Displays toast `"Attendance record added successfully"`.

##### 7. 📝 Regularize Attendance Request Modal
* **Trigger**: Click **Regularize** button on any attendance log entry row or click **+ Regularize Request** in the **Attendance** tab (`?tab=attendance`).
* **Modal**: `RegularizeRequestDialog.tsx`
* **Fields & Controls**:
  * **Target Attendance Date**: Pre-filled or date picker (`YYYY-MM-DD`). E.g. `2025-06-15`. Required.
  * **Requested Check-In Time**: Time picker (`HH:mm`). E.g. `09:00 AM`. Required.
  * **Requested Check-Out Time**: Time picker (`HH:mm`). E.g. `06:00 PM`. Required.
  * **Reason for Regularization**: Textarea input explaining reason (e.g. `Forgot to punch in due to client meeting`). Required.
  * **Submit Button (`Submit Request`)**: Submits payload to `POST /api/v1/attendance/regularize`. Displays toast `"Regularization request submitted successfully"`.

---

#### 🔷 D. Leave Section Tab (`?tab=leave`)

##### 8. 🌴 Leave Balances & Requests Overview
* **Trigger**: Click the **Leave** tab (`?tab=leave`).
* **Components**:
  * **Leave Balances Grid**: Displays available leave balances by policy type (e.g. *Casual Leave*, *Sick Leave*, *Earned Leave*) with available days count and total quota.
  * **My Leave Applications Table**: Displays submitted leave requests with columns `LEAVE TYPE`, `DATES`, `DAYS`, `REASON`, `STATUS` (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).

##### 9. 📝 Apply for Leave Modal
* **Trigger**: Click **Apply Leave** (`+`) button at the top right of the **Leave** tab (`?tab=leave`).
* **Modal**: `ApplyLeaveDialog.tsx`
* **Fields & Controls**:
  * **Leave Type**: Select dropdown displaying available leave policies and balances (e.g. `Casual Leave (CL) — Balance: 10`). Required.
  * **From Date**: Native date picker (`YYYY-MM-DD`). E.g. `2025-07-10`. Required.
  * **From Session**: Select dropdown with options `Full Day` (`FULL_DAY`), `First Half` (`FIRST_HALF`), `Second Half` (`SECOND_HALF`). Defaults to `FULL_DAY`.
  * **To Date**: Native date picker (`YYYY-MM-DD`). E.g. `2025-07-12`. Required.
  * **To Session**: Select dropdown with options `Full Day` (`FULL_DAY`), `First Half` (`FIRST_HALF`), `Second Half` (`SECOND_HALF`). Defaults to `FULL_DAY`.
  * **Reason for Leave**: Textarea input explaining leave reason (minimum 5 characters). Required. Entering less than 5 characters displays red error text: `"Reason must be at least 5 characters long."`.
  * **Submit Button (`Submit`)**: Submits payload to `POST /api/v1/leave/requests`. Displays toast `"Leave application submitted successfully!"`.

---

#### 🔷 E. Documents Section Tab (`?tab=documents`)

##### 10. 📄 Upload Verification Document Modal
* **Trigger**: Click **Upload Document** at the top right of the **Documents** tab (`?tab=documents`).
* **Modal**: `DocumentsTab.tsx`
* **Fields & Controls**:
  * **Document Type**: Select dropdown with options: `PAN Card` (`PAN`), `Aadhaar Card` (`AADHAAR`), `Passport` (`PASSPORT`), `Driving License` (`DRIVING_LICENSE`), `Offer Letter` (`OFFER_LETTER`), `Resume` (`RESUME`), `Degree` (`DEGREE`), `Experience Letter` (`EXPERIENCE`), `Other` (`OTHER`). Defaults to `PAN`. Required.
  * **Select File**: File input accepting `.jpg`, `.jpeg`, `.pdf` formats. Required. Selecting unsupported file types displays red alert: `"Only JPG, JPEG, and PDF files are allowed."`.
  * **Submit Button (`Upload`)**: Uploads multipart form data to `POST /api/v1/documents`. Displays toast `"Document uploaded — awaiting HR verification"`.

---

#### 🔷 F. Payroll Section Tab (`?tab=payroll`)

##### 11. 🏦 Add Bank Account Modal
* **Trigger**: Click **Add Bank Account** at the top right of the **Bank Accounts** card inside the **Payroll** tab (`?tab=payroll`).
* **Modal**: Built-in `Dialog` in `PayrollTab.tsx`
* **Fields & Controls**:
  * **Bank Name**: Text input for official bank name (e.g. `State Bank of India`). Required.
  * **Account Number**: Text input for bank account number (8–20 digits, e.g. `1234567890`). Required.
  * **IFSC Code**: Text input for 11-character IFSC code (e.g. `SBIN0001234`). Required. Auto-converts input to uppercase.
  * **Account Type**: Select dropdown with options `Salary` (`SALARY`), `Savings` (`SAVINGS`), `Current` (`CURRENT`). Defaults to `SALARY`.
  * **Set as primary account**: Toggle switch (`isPrimary`). Defaults to `false`.
  * **Submit Button (`Save`)**: Submits payload to `POST /api/v1/employees/me/bank-accounts` (or `POST /api/v1/employees/:id/bank-accounts`). Displays toast `"Bank account added successfully"`.

##### 12. 💰 Assign / Revise Salary Structure Modal
* **Trigger**: Click **Assign Salary Structure** or **Revise Salary Structure** button in the **Payroll** tab (`?tab=payroll`). Available only to `ORG_ADMIN`, `HR_ADMIN`, `isSuperAdmin`, or users holding `payroll.create`, `payroll.run`, or `employee.update` permissions.
* **Modal**: `SalaryStructureDialog.tsx`
* **Fields & Controls**:
  * **Annual CTC (₹)** (`ctcAnnual`): Number input for annual compensation (e.g. `1200000`). Required. Typing automatically calculates:
    * **Calculated Gross Monthly**: $\text{Annual CTC} / 12$ (e.g. ₹1,00,000 / mo).
    * **Basic Salary (Monthly)**: 50% of monthly gross (e.g. ₹50,000).
    * **HRA (Monthly)**: 25% of monthly gross (e.g. ₹25,000).
    * **Special Allowance (Monthly)**: Remaining balance (e.g. ₹25,000).
  * **Currency**: Select dropdown with options `INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`. Defaults to `INR`.
  * **Basic Salary (Monthly)**: Override input for basic component.
  * **HRA (Monthly)**: Override input for House Rent Allowance component.
  * **Special Allowance (Monthly)**: Override input for Special Allowance component.
  * **Submit Button (`Save Salary Structure`)**: Submits payload to `POST /api/v1/payroll/structures`. Displays toast `"Salary structure assigned successfully!"`.

---

#### ✅ Success Cases

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Tab Navigation & Query Sync** | Click any profile tab (**Overview**, **Personal**, **Attendance**, **Leave**, **Payroll**, **Documents**) | URL updates with query parameter (e.g. `/profile?tab=leave`). Selected tab renders wrapped in `<Suspense>` fallback loader. | [`ProfileView.tsx:L108-L111`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L108-L111) |
| **Upload Avatar** | Select PNG image $\le 5\text{MB}$, adjust zoom slider to `1.2x`, click **Upload Picture** | API `PATCH /api/v1/employees/me/avatar` returns 200. Toast displays `"Profile picture updated successfully"`. Header avatar updates with cache-busting timestamp `?t=...`. | [`ProfileView.tsx:L143-L153`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L143-L153), [`UploadAvatarDialog.tsx:L99-L103`](file:///d:/hrms/src/sections/profile/components/UploadAvatarDialog.tsx#L99-L103) |
| **Add Skill** | Click **+ Add Skill**, enter `Docker`, click **Add Skill** | Skill chip added to Overview card, toast displays `"Skill added to profile"`. | [`OverviewTab.tsx:L521-L528`](file:///d:/hrms/src/sections/profile/components/OverviewTab.tsx#L521-L528) |
| **Edit Personal Details** | Click **Edit Details**, update phone to `9876543210` & city to `Bangalore`, click **Save Changes** | API `PATCH /api/v1/employees/me` returns 200. Modal closes, profile reloads, and toast displays `"Personal details and address updated successfully"`. | [`ProfileView.tsx:L267-L271`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L267-L271) |
| **Add Emergency Contact** | Click **Add Contact**, enter Name: `Anita Nair`, Relationship: `Mother`, Phone: `9876500001`, click **Save Contact** | API `PATCH /api/v1/employees/me` appends contact. Modal closes and toast displays `"Emergency contact added successfully"`. | [`PersonalTab.tsx:L61-L65`](file:///d:/hrms/src/sections/profile/components/PersonalTab.tsx#L61-L65) |
| **Attendance Date Filter & Switcher** | Select date range & toggle to **Calendar View** | Attendance logs reload for range. FullCalendar renders color-coded event badges (Green/Orange/Red/Blue). | [`AttendanceTab.tsx:L71-L115`](file:///d:/hrms/src/sections/profile/components/AttendanceTab.tsx#L71-L115) |
| **Manual Attendance Entry** | Click **+ Manual Entry**, pick date & times, click **Save Log** | API `POST /api/v1/attendance/manual` returns 200. Toast displays `"Attendance record added successfully"`. Log is saved to database. | [`AttendanceTab.tsx:L58-L60`](file:///d:/hrms/src/sections/profile/components/AttendanceTab.tsx#L58-L60) |
| **Submit Attendance Regularization** | Click **Regularize** on a log row, enter reason & times, click **Submit Request** | API `POST /api/v1/attendance/regularize` returns 200. Toast displays `"Regularization request submitted successfully"`. Request appears in **Regularization Requests** sub-tab as `PENDING`. | [`AttendanceTab.tsx:L63-L65`](file:///d:/hrms/src/sections/profile/components/AttendanceTab.tsx#L63-L65) |
| **Apply for Leave** | Click **Apply Leave**, select Casual Leave, pick dates, enter reason $\ge 5$ chars, click **Submit** | API `POST /api/v1/leave/requests` creates request. Modal closes and toast displays `"Leave application submitted successfully!"`. Request appears in My Leave Applications table with status `PENDING`. | [`LeaveTab.tsx:L67-L114`](file:///d:/hrms/src/sections/profile/components/LeaveTab.tsx#L67-L114), [`ApplyLeaveDialog.tsx:L56-L67`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx#L56-L67) |
| **Upload Document** | Select type `PAN Card`, choose PDF file, click **Upload** | API `POST /api/v1/documents` uploads file. Dialog closes, input resets, and toast displays `"Document uploaded — awaiting HR verification"`. | [`DocumentsTab.tsx:L103-L114`](file:///d:/hrms/src/sections/profile/components/DocumentsTab.tsx#L103-L114) |
| **Add Bank Account** | Click **Add Bank Account**, enter Bank: `SBI`, Account: `1234567890`, IFSC: `SBIN0001234`, click **Save** | API `POST /api/v1/employees/me/bank-accounts` returns 200. Dialog closes and toast displays `"Bank account added successfully"`. | [`PayrollTab.tsx:L113-L130`](file:///d:/hrms/src/sections/profile/components/PayrollTab.tsx#L113-L130) |
| **Assign Salary Structure** | Click **Assign Salary Structure**, enter Annual CTC `1200000`, click **Save Salary Structure** | API `POST /api/v1/payroll/structures` saves structure with components (Basic: 6,00,000, HRA: 3,00,000, Special Allowance: 3,00,000). Toast displays `"Salary structure assigned successfully!"`. | [`SalaryStructureDialog.tsx:L111-L123`](file:///d:/hrms/src/sections/profile/components/SalaryStructureDialog.tsx#L111-L123) |

---

#### ⚠️ Validation Errors to Test

| Field | Trigger Condition | Expected Error Message | Source / File Reference |
| :--- | :--- | :--- | :--- |
| **Avatar File Type** | Select a non-image file (e.g. `document.txt` or `file.pdf`) in avatar upload dialog | `"Invalid file type. Please select an image file (PNG, JPG, WEBP)."` | Frontend [`UploadAvatarDialog.tsx:L62`](file:///d:/hrms/src/sections/profile/components/UploadAvatarDialog.tsx#L62) |
| **Avatar File Size** | Select an image file larger than 5MB | `"File size exceeds 5MB limit. Please select a smaller image."` | Frontend [`UploadAvatarDialog.tsx:L66`](file:///d:/hrms/src/sections/profile/components/UploadAvatarDialog.tsx#L66) |
| **Leave Reason Length** | Enter a leave reason shorter than 5 characters (e.g. `Sick`) in Apply Leave modal | `"Reason must be at least 5 characters long."` | Frontend [`ApplyLeaveDialog.tsx:L189`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx#L189) |
| **Leave Application Mandatories** | Leave Leave Type, From Date, or To Date empty | **Submit** button remains disabled (`disabled={!leaveTypeId || ...}`) | Frontend [`ApplyLeaveDialog.tsx:L199`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx#L199) |
| **Document File Extension** | Select a `.docx` or `.png` file in Document Upload dialog | `"Only JPG, JPEG, and PDF files are allowed."` | Frontend [`DocumentsTab.tsx:L86`](file:///d:/hrms/src/sections/profile/components/DocumentsTab.tsx#L86) |
| **Emergency Contact Fields** | Leave Name, Relationship, or Phone blank | **Save Contact** button remains disabled (`disabled={!isValid}`) | Frontend [`EmergencyContactDialog.tsx:L124`](file:///d:/hrms/src/sections/profile/components/EmergencyContactDialog.tsx#L124) |
| **Regularization Reason** | Submit regularization request without a reason | Submit button blocked by `!reason.trim()` check | Frontend [`RegularizeRequestDialog.tsx`](file:///d:/hrms/src/sections/attendance/components/RegularizeRequestDialog.tsx) |
| **Bank Account Mandatory Fields** | Leave Bank Name, Account Number, or IFSC Code blank | **Save** button remains disabled (`disabled={!bankName.trim() || ...}`) | Frontend [`PayrollTab.tsx:L443`](file:///d:/hrms/src/sections/profile/components/PayrollTab.tsx#L443) |
| **IFSC Code Format** | Send invalid IFSC string (e.g. `12345`) via API payload | `"Invalid IFSC code format (e.g. HDFC0000123)"` | Backend Zod DTO [`employee.dto.ts:L256`](file:///d:/hrms/hrms-backend/src/modules/employee/dto/employee.dto.ts#L256) |
| **Salary Annual CTC** | Clear Annual CTC or enter `0` and click **Save Salary Structure** | `"Please enter a valid Annual CTC."` | Frontend [`SalaryStructureDialog.tsx:L97`](file:///d:/hrms/src/sections/profile/components/SalaryStructureDialog.tsx#L97) |

---

#### ❌ Error / Failure Cases

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Account Without Employee Link** | User account lacks an associated employee record (`user.employeeId` is undefined) and attempts avatar upload | Red alert banner displays: `"Your account does not have an employee profile linked. Please contact your administrator."` | [`ProfileView.tsx:L139-L167`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L139-L167) |
| **Unauthorized Profile Fetch (401)** | JWT token expires while loading `/profile` | Axios interceptor handles redirect to `/auth/login`. | [`axios.ts`](file:///d:/hrms/src/utils/axios.ts) |
| **Employee Profile Not Found (404)** | Navigate to `/employees/invalid-id` for a deleted employee ID | Profile fetch fails; page gracefully falls back to empty profile state without crashing. | [`ProfileView.tsx:L248-L251`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L248-L251) |
| **Leave Application Failure (500)** | Server responds with 500 or insufficient leave balance | Red alert banner displays inside Apply Leave dialog displaying server error message. Dialog remains open for correction. | [`ApplyLeaveDialog.tsx:L105-L107`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx#L105-L107) |
| **Attendance Log Fetch Failure (500)** | API `GET /attendance/my-history` fails | Red alert banner renders in Attendance tab: `"Failed to load attendance records."` | [`AttendanceTab.tsx:L75`](file:///d:/hrms/src/sections/profile/components/AttendanceTab.tsx#L75) |
| **Document Upload Server Failure (500)** | Server responds with 500 during file upload | Red alert banner displays inside dialog: `res.message` or `"Failed to upload document"`. Dialog stays open for retry. | [`DocumentsTab.tsx:L106-L116`](file:///d:/hrms/src/sections/profile/components/DocumentsTab.tsx#L106-L116) |

---

#### 🛡️ Role-Based Access & Restrictions

| Role Slug | Can Access Profile? | Tab & Feature Restrictions | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Yes | Full access to self profile (`/profile`) and all employee 360° profiles (`/employees/:id`). Can view/edit personal info, assign salary structures, upload avatars, apply/approve leaves, and manage documents. | [`ProfileView.tsx:L91-L93`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L91-L93), [`PayrollTab.tsx:L159-L160`](file:///d:/hrms/src/sections/profile/components/PayrollTab.tsx#L159-L160) |
| **`HR_ADMIN`** | ✅ Yes | Full access to self profile and all employee 360° profiles. Can view/edit details, manage bank accounts, apply/approve leaves, and assign/revise salary structures. | [`ProfileView.tsx:L91-L93`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L91-L93), [`PayrollTab.tsx:L159-L160`](file:///d:/hrms/src/sections/profile/components/PayrollTab.tsx#L159-L160) |
| **`EMPLOYEE`** | ✅ Self Only | Access to `/profile` (Self Profile). Access to view other employees' 360° profiles (`/employees/:id`) requires `employee.read` permission. When viewing other profiles, **Edit Details**, **Add Emergency Contact**, **Upload Document**, **Add Bank Account**, and **Apply Leave** buttons are hidden (`!isViewingOther`). **Attendance** tab is hidden when viewing other employees unless `attendance.read` or `attendance.create` permission is granted (`canViewAttendance`). | [`ProfileView.tsx:L92`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L92), [`PersonalTab.tsx:L83`](file:///d:/hrms/src/sections/profile/components/PersonalTab.tsx#L83), [`DocumentsTab.tsx:L125`](file:///d:/hrms/src/sections/profile/components/DocumentsTab.tsx#L125), [`PayrollTab.tsx:L271`](file:///d:/hrms/src/sections/profile/components/PayrollTab.tsx#L271) |
| **`MANAGER`** | ✅ Self & Team | Full access to self profile. Can view team member 360° profiles if granted `employee.read`. Salary assignment button in **Payroll** tab is visible only if holding `payroll.create`, `payroll.run`, or `employee.update` permissions. | [`PayrollTab.tsx:L159-L160`](file:///d:/hrms/src/sections/profile/components/PayrollTab.tsx#L159-L160) |
| **`LEADERSHIP`** | ✅ Yes | Can view self profile and employee profiles. Action buttons to edit personal info, bank accounts, or documents are restricted when viewing other employees (`isViewingOther: true`). | [`PersonalTab.tsx:L83`](file:///d:/hrms/src/sections/profile/components/PersonalTab.tsx#L83) |
| **`BRANCH_ADMIN`** | ✅ Yes | Full access to self profile and branch employee profiles. | [`ProfileView.tsx:L92`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L92) |
| **`PRODUCT_MANAGER`** | ✅ Yes | Access to self profile and employee profiles based on permissions. | [`ProfileView.tsx:L92`](file:///d:/hrms/src/sections/profile/ProfileView.tsx#L92) |

---

### Step 3 — Flag List (Uncertainties & Rule Mismatches)

1. **Frontend vs Backend Validation Discrepancies:**
   * **IFSC Code Regex Rule**:
     * **Frontend** `addBankAccount` form (`PayrollTab.tsx:L107`) checks `!ifscCode.trim()` (allowing any string format).
     * **Backend DTO** (`employee.dto.ts:L256`) strictly validates IFSC using regex `/^[A-Z]{4}0[A-Z0-9]{6}$/` (e.g. `SBIN0001234`). If a user inputs `SBI123`, the frontend accepts it, but the backend rejects it with `"Invalid IFSC code format (e.g. HDFC0000123)"`.
   * **Document Allowed File Types**:
     * **Frontend** `handleFileSelect` (`DocumentsTab.tsx:L85`) allows `.jpg`, `.jpeg`, `.pdf`.
     * **Backend DTO** (`document.dto.ts`) validates MIME types (`image/jpeg`, `application/pdf`).

2. **Placeholder / Coming Soon Features:**
   * **AI Insights Banner & Actions**: In `OverviewTab.tsx:L444-L476` and `ProfileView.tsx:L674-L705`, the **AI Summary**, **Generate Review**, **Generate Promotion Summary**, **Recommend Training**, **Schedule 1:1**, and **Send Recognition** buttons display a snackbar warning `"AI Action [...] is coming soon!"`.
   * **Performance, Learning, Assets, Timeline, Notes, Activity Tabs**: In `ProfileView.tsx:L709-L718`, selecting these tabs renders a placeholder card stating `"[Tab Name] Section — Detailed [Tab Name] information for [User] is loaded into this section."`.

3. **Attendance Tab Visibility Gating:**
   * `ProfileView.tsx:L92` checks `canViewAttendance = !isViewingOther || hasPermission("attendance.read") || hasPermission("attendance.create")`. If an employee views another employee's profile without attendance permissions and tries to navigate to `?tab=attendance`, `useEffect` automatically redirects them back to `?tab=overview`.

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
