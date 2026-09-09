# 🚀 Enterprise HRMS — UI Navigation & Feature Testing Guide

> [!NOTE]
> **🧭 How Navigation Works in This Guide**
> 
> * **The Left Sidebar**: This is the primary vertical menu on the left side of your screen. It lists main feature areas (such as **People**, **Attendance**, **Leave Management**, and **Holiday**).
> * **Nested Menus & Tabs**: Some instructions tell you to click a main menu item first, then select a specific sub-item or tab across the top of the page (for example: *Click **Leave Management** in the left sidebar, then click the **Requests** tab*).
> * **Technical Page Addresses**: You will see technical addresses in parentheses throughout this guide, such as `(/employees/directory)` or `(/leave)`. These are provided strictly as reference paths for QA testers and software developers cross-checking against the code. You do **not** need to type these addresses — simply follow the click-by-click instructions.

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
7. [Document Verification](#7-document-verification)
8. [Organization & Master Data Administration](#8-organization--master-data-administration)
9. [Roles & Permissions Administration](#9-roles--permissions-administration)
10. [Employee Onboarding](#10-employee-onboarding)

---

## 1. 🔐 Authentication & Account Setup

### **1.1 Sign Up / User Registration**
* **Testing Steps**:
  1. Open your web browser and go to the HRMS sign-up page.
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
* **Route**: Login screen (`/login`)
* **Testing Steps**:
  1. Open your web browser and go to the HRMS login page.
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
* **Routes**: Password Recovery screens (`/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`)
* **Testing Steps**:
  1. On the login screen, click the **Forgot Password?** link located below the password field (`/auth/forgot-password`).
  2. Enter your registered email address and submit.
* **⚠️ Validation Errors to Test**:
  * Leaving email blank triggers `"Email is required"`.
  * Mismatched new password in Reset Password triggers `"Passwords do not match"`.

---

## 2. 📊 Main Dashboard & Quick Widgets

* **Route**: Main Dashboard screen (`/dashboard`)
* **Overview**: Centralized command center providing real-time workforce metrics, AI-driven insights, interactive attendance charts, pending leave requests, team widgets, and organization setup guidance.
* **Access Control**: Authenticated users only (`AuthGuard`). Redirects unauthenticated guests to `/login`.
* **Testing Steps**:
  1. Log in to the application. You will land directly on the **Main Dashboard** screen (`/dashboard`). Alternatively, click **Dashboard** in the top section of the left sidebar.
  2. Observe top header greeting displaying user's first name, last login timestamp, IP address, and login device.
  3. Review top KPI cards (*Total Employees*, *Present Today*, *Leave Requests Pending*, *Upcoming Celebrations*).
  4. (If logged in as `ORG_ADMIN` or `HR_ADMIN` with an incomplete workspace setup) Observe the **Organization Initial Setup Required** banner displaying current progress (0–3 steps completed). Click **Complete Initial Setup** to open the modal wizard.
  5. Fill out setup modal fields (**Country Code**, **Timezone**, **Base Currency**, **Fiscal Year Start**, **Employee Count Range**, **Industry**, **Phone Number**, **Admin Job Title**) and click **Complete Setup & Seed Head Office**.
  6. (If logged in as non-`ORG_ADMIN`) Interact with the **Daily Punch Card** widget to clock in/out.

---

### **2.1 Organization Setup Wizard Dialog**

🧭 **How to Get Here**: After logging in, click **Dashboard** in the top section of the left sidebar (icon: `<DashboardIcon />`). This takes you to the **Main Dashboard** screen (`/dashboard`). If you are logged in as an administrator (`ORG_ADMIN` or `HR_ADMIN`) and your organization setup is incomplete (i.e. Head Office branch, departments, or designations have not yet been created), the purple **Organization Initial Setup Required 🎉** banner will appear near the top of the dashboard page. Click **Complete Initial Setup** on the right side of this banner to open the setup wizard modal dialog (`AdminSetupWizardDialog`). If you do not see this banner, your organization structure is already fully configured or your role does not have setup permissions — see the Role-Based Access table below.

* **Route**: `/dashboard` (Modal overlay: `AdminSetupWizardDialog`)
* **Overview**: Interactive setup wizard allowing company administrators to configure organization locales (country, timezone, currency, fiscal year) and automatically seed Head Office branch, default departments, designations, shifts, and statutory national holidays into the database.
* **Testing Steps**:
  1. Log in as `ORG_ADMIN` or `HR_ADMIN`. On the Main Dashboard screen (`/dashboard`), locate the setup banner.
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

* **Routes**: Employee Directory (`/employees/directory`), Add Employee (`/employees/create`), Profile View (`/employees/profile/:id`)
* **Overview**: Complete workforce management hub with dual view modes (Table & Card Grid).

### **3.1 Directory View & Filters**
* **Route**: Employee Directory screen (`/employees/directory`)
🧭 **How to Get Here**: Click **People** in the left sidebar (under top navigation group, icon: `<PeopleIcon />`). This opens the **Employee Directory** screen (`/employees/directory`).
* **Features & Testing**:
  1. **View Mode Switcher**:
     * Click **Grid View** icon to display employee cards with profile avatars.
     * Click **Table View** icon to display the high-performance **Virtualized Table**.
  2. **Search & Multi-Filtering**:
     * Type any employee name or code in the **Search** input.
     * Click the **Filter Bar** to filter by Department, Designation, or Status.

---

### **3.2 Add New Employee Form**

🧭 **How to Get Here**: After logging in: 1. Click **People** in the left sidebar (under top navigation group, icon: `<PeopleIcon />`). This opens the **Employee Directory** screen (`/employees/directory`). 2. Click the **`[ + Add Employee ]`** button in the top-right corner of the screen. This opens the **Add New Employee** form (`/employees/create`). If you do not see the **Employees** menu item or the **Add Employee** button, your role does not have `employee.read` or `employee.create` permissions — see the Role-Based Access table below.

* **Route**: `/employees/create` (wrapped in `<RoleGuard permission="employee.create">`)
* **Overview**: Comprehensive multi-card employee onboarding form featuring 7 structured cards, cascading organizational placement (Branch → Department → Designation → Eligible Managers), international phone formatting, bank account setup, and automatic salary structure mapping.
* **Testing Steps**:
  1. Log in as `ORG_ADMIN` or `HR_ADMIN`, click **People** in the left sidebar (`/employees/directory`), then click **`[ + Add Employee ]`** (`/employees/create`).
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

### **4.1 Real-Time Check-In / Check-Out (Daily Punch Card)**

* **Route**: `/dashboard` *(Note: Navigating to `/attendance` directly auto-redirects to `/profile?tab=attendance`)*
* **Source Component**: [`DailyPunchCard.tsx`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx)
* **API Calls**: `GET /api/v1/attendance/me/today`, `POST /api/v1/attendance/me/punch/web`, `GET /api/v1/attendance/shifts`

🧭 **How to Get Here**:
After logging in, click **Dashboard** in the left sidebar (under the main navigation group, icon: `<DashboardIcon />`). This takes you to `/dashboard`. The **Daily Attendance Punch Card** sits at the top of the main dashboard page. If your profile is incomplete, the card will display a profile completion lock screen instead — see the Role-Based Access & Lock Restrictions table below.

---

#### 📝 Interactive Controls & Button-by-Button Field Guide

The Daily Punch Card is a dynamic, multi-state interactive control that guides the user through their daily work shift. Below is the field-by-field breakdown of every control, indicator, and button on the card:

| Element / Control Label | Expected Format & Type | Required / Optional | State Dependencies & Interactive UI Behavior |
| :--- | :--- | :---: | :--- |
| **Live Digital Clock** | Digital time display (`HH:MM:SS AM/PM TimeZone`), e.g. `09:30:15 AM IST` | Indicator | Continuously updates every 1 second (`1000ms`) using locale-aware formatting (`Intl.DateTimeFormat`). Displays current weekday, date, month, and year below the clock. |
| **Geofence Verified Chip** | Status badge (`#DCFCE7` background, green text) | Indicator | Displays green location icon (`<LocationOnIcon />`) confirming client browser geolocation verification capability. |
| **Shift Status Chip** | Dynamic badge | Indicator | Displays real-time status:<br>• `Not Clocked In` (Grey) — Before first check-in.<br>• `Active Shift` (Green) — Punched in & actively working.<br>• `On Break` (Orange) — Currently on break.<br>• `Shift Completed` (Indigo) — Punched out for the day. |
| **`[ Clock In ]` Button** | Primary Action Button (Solid Indigo `#6D5DF6`) | Click Action | **Visible when**: User has not clocked in today.<br>**Behavior**: Clicking prompts browser for HTML5 Geolocation coordinates (`longitude`, `latitude`), resolves default shift ID (`/attendance/shifts`), and submits `type: "CHECK_IN"`. Button shows spinner (`"Clocking In..."`).<br>**Result**: Displays green alert `"Checked in successfully!"`, status chip changes to `Active Shift`, and card displays shift start timestamp. If profile completion is in NUDGE phase, pops open **Nudge Reminder Modal**. |
| **Check-In Recorded Box** | Info Box (Green dashed border) | Indicator | **Visible when**: Active shift is running.<br>**Content**: Displays `<CheckCircleOutlinedIcon />` and text: *"Check-In Recorded — Shift started at HH:MM AM/PM today."* |
| **`[ Break Out ]` Button** | Secondary Action Button (Orange `#F59E0B`) | Click Action | **Visible when**: User is in an `Active Shift`.<br>**Behavior**: Submits `type: "BREAK_OUT"`. Button shows spinner (`"Processing..."`).<br>**Result**: Displays green alert `"Took a break successfully!"`, status chip changes to `On Break`, card transitions to On Break info box. |
| **`[ Resume Shift ]` Button** | Action Button (Green `#10B981`) | Click Action | **Visible when**: User is currently `On Break`.<br>**Behavior**: Submits `type: "BREAK_IN"`. Button shows spinner (`"Resuming..."`).<br>**Result**: Displays green alert `"Resumed shift successfully!"`, status chip returns to `Active Shift`. |
| **`[ Clock Out ]` Button** | Danger Action Button (Red `#EF4444`) | Click Action | **Visible when**: User is in an `Active Shift` (side-by-side with Break Out).<br>**Behavior**: Submits `type: "CHECK_OUT"`. Button shows spinner (`"Clocking Out..."`).<br>**Result**: Displays green alert `"Checked out successfully!"`, status chip changes to `Shift Completed`, and card locks into **Shift Summary** mode. |
| **Shift Summary Card** | Summary Box (Indigo border) | Indicator | **Visible when**: Shift is completed (`hasCheckedOut`).<br>**Content**: Displays:<br>• **Clock In**: Start time + `Late` chip if `isLate: true`.<br>• **Clock Out**: End time + `Early` chip if `isCheckOutEarly: true`.<br>• **Worked Hours**: Computed duration (e.g. `8h 30m`). |
| **`[ Complete Profile ]` Button** | Warning Action Button (Primary Indigo) | Click Action | **Visible when**: User profile is incomplete (`isBlocked: true`).<br>**Behavior**: Clicking navigates directly to `/onboarding`. All punch buttons remain hidden until required profile sections are completed. |

---

#### ✅ Success Cases

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Initial Clock In** | 1. Open `/dashboard`<br>2. Confirm status chip reads `Not Clocked In`<br>3. Click **`[ Clock In ]`**. | Button shows spinner (`"Clocking In..."`). Green alert banner displays `"Checked in successfully!"`. Status chip updates to `Active Shift`. Check-In Recorded box displays `Shift started at [HH:MM AM/PM] today.` | [`DailyPunchCard.tsx:L105-L110`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L105-L110) |
| **Start Break** | 1. During an active shift, click **`[ Break Out ]`**. | Button shows spinner (`"Processing..."`). Green alert banner displays `"Took a break successfully!"`. Status chip changes to `On Break`. Card renders Currently On Break box displaying break start time. | [`DailyPunchCard.tsx:L155-L161`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L155-L161) |
| **Resume Shift** | 1. While on break, click **`[ Resume Shift ]`**. | Button shows spinner (`"Resuming..."`). Green alert banner displays `"Resumed shift successfully!"`. Status chip returns to `Active Shift`. Action buttons revert to `Break Out` and `Clock Out`. | [`DailyPunchCard.tsx:L177-L183`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L177-L183) |
| **Clock Out** | 1. During an active shift, click **`[ Clock Out ]`**. | Button shows spinner (`"Clocking Out..."`). Green alert banner displays `"Checked out successfully!"`. Status chip changes to `Shift Completed`. Card renders **Shift Summary** with Clock In, Clock Out, and Worked Hours (`formatWorkedTime`). | [`DailyPunchCard.tsx:L133-L137`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L133-L137) |
| **Nudge Modal Trigger** | 1. Clock in as an employee with profile in NUDGE phase. | Green alert appears AND **Nudge Reminder Modal** pops open displaying profile completion percentage (e.g. `45%`) with option to complete profile or dismiss. | [`DailyPunchCard.tsx:L110-L114`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L110-L114) |

---

#### ⚠️ Validation Errors to Test

| Field / DTO Constraint | Trigger Condition | Expected Error Message | Code Reference |
| :--- | :--- | :--- | :--- |
| **Punch Type Enum (`PunchDto`)** | Send invalid punch type string to `POST /api/v1/attendance/me/punch/web` | Backend Zod schema validation fails: `"Invalid enum value. Expected 'CHECK_IN' \| 'BREAK_OUT' \| 'BREAK_IN' \| 'CHECK_OUT'"` | [`attendance.dto.ts:L7`](file:///d:/hrms/hrms-backend/src/modules/attendance/dto/attendance.dto.ts#L7) |
| **Latitude Range (`PunchDto`)** | Send latitude < -90 or > 90 | Backend Zod schema validation fails: `"Number must be greater than or equal to -90"` or `"Number must be less than or equal to 90"` | [`attendance.dto.ts:L8`](file:///d:/hrms/hrms-backend/src/modules/attendance/dto/attendance.dto.ts#L8) |
| **Longitude Range (`PunchDto`)** | Send longitude < -180 or > 180 | Backend Zod schema validation fails: `"Number must be greater than or equal to -180"` or `"Number must be less than or equal to 180"` | [`attendance.dto.ts:L9`](file:///d:/hrms/hrms-backend/src/modules/attendance/dto/attendance.dto.ts#L9) |

---

#### ❌ Error / Failure Cases

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Duplicate Clock In (400)** | Attempting to clock in when already checked in | Red inline Alert banner displays server error message: `err.response.data.message` (e.g., `"Already checked in for today"`). Button spinner stops and error can be dismissed via `x` icon. | [`DailyPunchCard.tsx:L119-L121`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L119-L121) |
| **Duplicate Clock Out (400)** | Attempting to clock out when session is already closed | Red inline Alert banner displays server error message: `err.response.data.message` (e.g., `"Already checked out for today"`). | [`DailyPunchCard.tsx:L140-L142`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L140-L142) |
| **Shift Window Rejection (400)** | Punching in before allowed shift start time when `rejectEarlyPunch: true` | Red inline Alert banner displays: `"Early check-in not allowed for this shift"`. | [`attendance.service.ts:L142`](file:///d:/hrms/hrms-backend/src/modules/attendance/services/attendance.service.ts#L142) |
| **Hard Profile Lock (403)** | User profile is incomplete (`PROFILE_INCOMPLETE_HARD`) | `useProfileBlockDetect` catches the 403 response (`isBlocked: true`). Punch card replaces clock buttons with a lock screen showing `<LockOutlinedIcon />`, title `"Profile Incomplete"`, pending section chips, and a **`[ Complete Profile ]`** button. | [`DailyPunchCard.tsx:L299-L372`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L299-L372) |
| **Network / Server Error (500)** | Server responds with 500 or connection times out | Red inline Alert banner displays: `"Something went wrong during check-in"` (or `check-out` / `break-out` / `break-in`). | [`DailyPunchCard.tsx:L120`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L120) |
| **Geolocation Unsupported / Denied** | Browser geolocation permission is blocked | `getLocation()` safely returns `null`. Punch request proceeds with `undefined` coordinates without crashing the UI. | [`DailyPunchCard.tsx:L41-L48`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L41-L48) |

---

#### 🛡️ Role-Based Access & Restrictions

| Role Slug | Can Access Punch Card? | Role-Specific Behavior & Restrictions | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Yes | Can view daily punch card on `/dashboard` and record self attendance punches. | [`DailyPunchCard.tsx:L28`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L28) |
| **`HR_ADMIN`** | ✅ Yes | Can view daily punch card on `/dashboard` and record self attendance punches. | [`DailyPunchCard.tsx:L28`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L28) |
| **`BRANCH_ADMIN`** | ✅ Yes | Can view daily punch card on `/dashboard` and record self attendance punches. | [`DailyPunchCard.tsx:L28`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L28) |
| **`LEADERSHIP`** | ✅ Yes | Can view daily punch card on `/dashboard` and record self attendance punches. | [`DailyPunchCard.tsx:L28`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L28) |
| **`MANAGER`** | ✅ Yes | Can view daily punch card on `/dashboard` and record self attendance punches. | [`DailyPunchCard.tsx:L28`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L28) |
| **`PRODUCT_MANAGER`** | ✅ Yes | Can view daily punch card on `/dashboard` and record self attendance punches. | [`DailyPunchCard.tsx:L28`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L28) |
| **`EMPLOYEE`** | ✅ Yes | Can view daily punch card on `/dashboard` and record self attendance punches. Access is strictly self-service (stamped via `req.context.userId`). If profile is incomplete, profile completion lock activates. | [`DailyPunchCard.tsx:L28`](file:///d:/hrms/src/sections/attendance/components/DailyPunchCard.tsx#L28), [`attendance.routes.ts:L37`](file:///d:/hrms/hrms-backend/src/modules/attendance/attendance.routes.ts#L37) |

---

### **4.2 Attendance Reports & Punch Log Table**

* **Route**: `/reports`
* **Source Component**: [`AttendanceReportView.tsx`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx)
* **API Calls**: `GET /api/v1/attendance/report`, `GET /api/v1/departments`, `GET /api/v1/designations`, `GET /api/v1/branches`, `GET /api/v1/attendance/shifts`
* **Permission Guard**: `report.read` (gated via `<RoleGuard permission="report.read">`)

🧭 **How to Get Here**:
After logging in, click **Attendance Report** in the left sidebar (under the main navigation group, icon: `<AssessmentIcon />`). This takes you to `/reports`. Note: This page requires the `report.read` permission. If an Employee without `report.read` attempts to access this page, they are redirected or presented with their personal attendance history (`<AttendanceTab hideTabs={true} />`).

---

#### 📝 Interactive Controls, Filters & Component Guide

The Attendance Report page provides high-level workforce KPIs, trend analytics, multi-select filter bars, and a granular punch log data table. Below is the comprehensive field-by-field breakdown of every filter, visual chart component, and table element:

##### 1. Filter Bar & Search Controls
| Element / Control Label | Expected Format & Type | Required / Optional | Filter Dependencies & Interactive UI Behavior |
| :--- | :--- | :---: | :--- |
| **Search Input** | Text input (`searchPlaceholder="Search employees..."`), e.g. `EMP-001` or `John` | Optional | Typing filters the punch log table live by matching employee code or full name (`searchQuery`). Resets pagination to page 1 (`clientPage: 0`). |
| **Date Range (`fromDate` / `toDate`)** | Date range picker (`YYYY-MM-DD`), e.g. `2026-09-01` to `2026-09-30` | Optional | Defaults `fromDate` to 1st day of current year (`YYYY-01-01`) and `toDate` to today (`todayStr`). Changing dates refetches punch logs from `GET /api/v1/attendance/report`. |
| **Branch Filter** | Multi-select dropdown (`branchId`) | Optional | Populated dynamically from `GET /api/v1/branches`. Defaults to `All Branches`. Selecting specific branches filters punch logs by employee branch ID. |
| **Departments Filter** | Multi-select dropdown (`departmentId`) | Optional | Populated dynamically from `GET /api/v1/departments`. Defaults to `All Departments`. Multi-select dropdown filtering records by department. |
| **Designation Filter** | Multi-select dropdown (`designationId`) | Optional | Populated dynamically from `GET /api/v1/designations`. Defaults to `All Designations`. Multi-select dropdown filtering records by designation. |
| **Status Filter** | Multi-select dropdown (`status`) | Optional | Dropdown options: `Present` (`PRESENT`), `Absent` (`ABSENT`), `Late` (`LATE`), `Half Day` (`HALF_DAY`), `On Leave` (`ON_LEAVE`), `Holiday` (`HOLIDAY`), `Week Off` (`WEEK_OFF`). Defaults to `All Statuses`. |
| **`[ Reset Filters ]` Button** | Action Button | Click Action | Resets search query, clears date ranges, resets all dropdown filters to `ALL`, and resets table pagination to page 1. |
| **`[ Mark Attendance ]` Button** | Primary Action Button (Indigo `#6D5DF6`) | Click Action | **Visible when**: User holds `attendance.create` permission.<br>**Behavior**: Clicking opens **Manual Attendance Dialog** (`ManualAttendanceDialog.tsx`) to manually insert an employee attendance log. |

##### 2. 📊 Weekly Attendance Trend Bar Chart (`WeeklyTrendBarChart.tsx`)
* **Header**: `"Weekly Attendance Trend"`
* **Y-Axis & Scale**: Renders dynamic Y-axis scale ticks (`0`, `25%`, `50%`, `75%`, `effectiveMax`) with dashed horizontal gridlines. Scale maximum is computed dynamically from max present count (`Math.max(...counts)`).
* **Bar Visuals**: Displays 7 vertical columns representing attendance counts for the last 7 days leading up to today (`Today`, `Sep 2`, `Sep 1`, etc.). Bars render in solid red (`#EF4444`) with rounded top corners.
* **Hover & Tooltip Behavior**: Hovering over a bar highlights it in darker red (`#DC2626`) with a scale effect (`transform: scaleY(1.03)`) and reveals an interactive tooltip:
  * **Present Days**: Displays `"[Date]: [Count] Present"` (e.g. `"Today: 32 Present"`).
  * **Weekend / Off Days**: Displays `"[Date]: 0 Present (Sunday - Week Off)"` or `"0 Present (Saturday - Week Off)"`.

##### 3. 📈 Today's Status Breakdown & AI Insight Card (`TodayStatusBreakdownCard.tsx`)
* **Header**: Displays dynamic localized date title (e.g. `"Today – 03 Sep 2026"`).
* **Status Distribution Progress Bars**: Features 5 horizontal MUI `<LinearProgress>` bars showing headcount and percentage distribution for today:
  * **On Time**: Green bar (`#10B981`) showing on-time check-in count.
  * **Late**: Orange bar (`#F59E0B`) showing late check-in count (punched after shift start + grace period).
  * **WFH**: Primary Indigo bar (`#6D5DF6`) showing remote workforce count.
  * **Absent**: Red bar (`#EF4444`) showing absent count.
  * **On Leave**: Purple bar (`#8B5CF6`) showing employees on approved leave.
* **AI Insight Widget**: Displays AI spark icon (`<AutoAwesomeIcon />`), `"Coming Soon"` chip, and analytical trend snippet (*"Attendance dip on Fridays averages 8.2% above weekly average..."*). Includes `Explain`, `Save`, and `Dismiss` chips (`Dismiss` hides the widget).

##### 4. 📋 Employee Attendance Table (`EmployeeAttendanceTable.tsx`)
* **Header & Export Action**: Card title `"Employee Attendance"` with right-aligned **`[ Export ]`** button (`<FileDownloadOutlinedIcon />`) that downloads current client-filtered rows as a CSV file (`Employee_Attendance_Today.csv`).
* **Virtualized Body & Performance**: Rendered using `<VirtualizedTableBody>` with `estimateRowHeight={56}` and `minWidth={650}` for smooth rendering of large punch datasets without vertical scrollbar clutter.
* **Columns**:
  1. `S.NO.`: Continuous 1-based row index calculated across pages (`startIndex + index + 1`).
  2. `EMPLOYEE CODE`: Displays employee code badge (e.g. `EMP-001`) or `--`.
  3. `EMPLOYEE NAME`: Displays employee circular avatar (`CustomAvatar`) + full name.
  4. `PUNCH LOG`: Formatted 12-hour timestamp (e.g. `09:15 AM`) or `--`.
  5. `PUNCH DATE`: Formatted date (e.g. `03 09 26`) or `--`.
* **Row Click Action**: Clicking any row highlights it (`#F9FAFB`) and opens the **Attendance Details Modal** displaying record status badge, check-in, check-out, and worked duration.
* **Pagination Controls**: MUI `<TablePagination>` footer providing `10`, `25`, `50`, `100` rows per page options. Default: `25` rows per page.

---

#### ✅ Success Cases

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Load Attendance Report** | 1. Open `/reports`<br>2. Observe page header, KPI cards, and punch log table. | Page title displays `"Attendance"` with subtitle `"Real-time workforce attendance tracking"`. Top KPI cards calculate workforce Present Rate, Absent Count, Late Count, and WFH Count. | [`AttendanceReportView.tsx:L593-L622`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L593-L622) |
| **Search Employee Punch Logs** | 1. Type `EMP-005` in search bar. | Punch log table filters live to show only rows matching `EMP-005`. Table page resets to 1. | [`AttendanceReportView.tsx:L498-L530`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L498-L530) |
| **Filter by Status & Branch** | 1. Select Status: `Late`<br>2. Select Branch: `Headquarters`. | Table updates to show only `LATE` punch log entries registered under `Headquarters` branch. | [`AttendanceReportView.tsx:L500-L527`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L500-L527) |
| **View Attendance Detail Modal** | 1. Click on any row in the Punch Log table. | Modal title displays `"Attendance Details"`. Renders Status Chip, First Check In, Last Check Out, and Worked Hours. | [`AttendanceReportView.tsx:L750-L790`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L750-L790) |
| **Export CSV Report** | 1. Click **`[ Export ]`** button above table. | Browser downloads `Employee_Attendance_Today.csv` file containing `S.No`, `Employee Code`, `Employee Name`, `Punch Log`, and `Punch Date`. | [`EmployeeAttendanceTable.tsx:L51-L77`](file:///d:/hrms/src/components/table/EmployeeAttendanceTable.tsx#L51-L77) |
| **Change Rows Per Page** | 1. Select `50` in Table Pagination dropdown. | Table expands to display up to 50 rows per page. | [`AttendanceReportView.tsx:L735-L745`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L735-L745) |

---

#### ⚠️ Validation Errors to Test

| Field / Query Constraint | Trigger Condition | Expected Error Message | Code Reference |
| :--- | :--- | :--- | :--- |
| **Date Format (`AttendanceReportQueryDto`)** | Send invalid date string (e.g. `01-09-2026`) in `fromDate` or `toDate` API call | Backend Zod schema validation fails: `"Date must be in YYYY-MM-DD format"` | [`common.validator.ts:L94`](file:///d:/hrms/hrms-backend/src/shared/validators/common.validator.ts#L94) |
| **Branch ID Format (`AttendanceReportQueryDto`)** | Send malformed MongoDB ID string in `branchId` | Backend Zod schema validation fails: `"Invalid ID format"` | [`common.validator.ts:L7`](file:///d:/hrms/hrms-backend/src/shared/validators/common.validator.ts#L7) |
| **Page Size Limit (`AttendanceReportQueryDto`)** | Request `pageSize` > 100 in API query | Backend Zod schema validation fails: `"Page size cannot exceed 100"` | [`common.validator.ts:L24`](file:///d:/hrms/hrms-backend/src/shared/validators/common.validator.ts#L24) |

---

#### ❌ Error / Failure Cases

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Unauthorized Access (403)** | User without `report.read` navigates to `/reports` | Router `<RoleGuard permission="report.read">` blocks access. `AttendanceReportView.tsx` renders fallback employee view `<AttendanceTab hideTabs={true} />` titled `"My Attendance"`. | [`AttendanceReportView.tsx:L577-L587`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L577-L587) |
| **Server Error on Report Fetch (500)** | Backend DB connection failure during `GET /attendance/report` | Red inline Alert banner displays: `err.response.data.message` or `"Failed to load attendance report"`. | [`AttendanceReportView.tsx:L189-L191`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L189-L191) |
| **Empty Table Results** | Filter criteria returns 0 records | Punch Log table renders 0 rows with Table Pagination showing `0 of 0`. | [`AttendanceReportView.tsx:L734`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L734) |
| **Missing Employee Name Fallback** | Attendance record has deleted or unlinked employee | Table displays employee name fallback `"Employee"` or `"N/A"` and employee code `--` without throwing a runtime NullPointerException. | [`AttendanceReportView.tsx:L438`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L438) |

---

#### 🛡️ Role-Based Access & Restrictions

| Role Slug | Can Access `/reports`? | Access Scope & Feature Restrictions | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Full Access | Full access to `/reports`. Can view organization-wide attendance, filter by branch/dept/designation, export CSV, and click **`[ Mark Attendance ]`** (`canMarkAttendance: true`). | [`AttendanceReportView.tsx:L111-L113`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L111-L113) |
| **`HR_ADMIN`** | ✅ Full Access | Full access to `/reports`. Can view organization-wide attendance, filter records, export CSV, and mark manual attendance (`canMarkAttendance: true`). | [`AttendanceReportView.tsx:L113-L117`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L113-L117) |
| **`BRANCH_ADMIN`** | ✅ Branch Scope | Access to `/reports`. Branch filter options are restricted to their assigned branch (`canReadBranches: true`). | [`AttendanceReportView.tsx:L116-L133`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L116-L133) |
| **`LEADERSHIP`** | ✅ Read-Only | Access to `/reports`. Can view attendance KPIs, trends, and punch table. **`[ Mark Attendance ]`** button is hidden (`canMarkAttendance: false`). | [`AttendanceReportView.tsx:L598`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L598) |
| **`MANAGER`** | ✅ Team Scope | Access to `/reports` (via `report.read`). Can view attendance punch logs for team members. Mark Attendance button is visible only if granted `attendance.create`. | [`AttendanceReportView.tsx:L598`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L598) |
| **`PRODUCT_MANAGER`** | ✅ Permission-Based | Access determined by `report.read` and `attendance.create` permissions. | [`AttendanceReportView.tsx:L110-L117`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L110-L117) |
| **`EMPLOYEE`** | ❌ Restricted | **Sidebar Navigation**: `"Attendance Report"` sidebar item is hidden (`permission: "report.read"`).<br>**Direct Route Access**: Navigating to `/reports` triggers `isEmployeeRole = true` fallback, rendering self attendance view (`<AttendanceTab hideTabs={true} />`) titled `"My Attendance"`. Cannot view organization-wide punch logs or mark manual attendance. | [`DashboardLayout.tsx:L74`](file:///d:/hrms/src/layouts/dashboard/DashboardLayout.tsx#L74), [`AttendanceReportView.tsx:L577-L587`](file:///d:/hrms/src/sections/reports/AttendanceReportView.tsx#L577-L587) |

---

### **4.3 Attendance Regularization Requests & HR Approvals**

* **Route**: `/attendance/regularizations`
* **Source Component**: [`RegularizationListPage.tsx`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx), [`ReviewRegularizationDialog.tsx`](file:///d:/hrms/src/sections/attendance/attendance-regularization/components/ReviewRegularizationDialog.tsx), [`RegularizeRequestDialog.tsx`](file:///d:/hrms/src/sections/attendance/components/RegularizeRequestDialog.tsx)
* **API Calls**: `GET /api/v1/attendance/regularizations/pending`, `PATCH /api/v1/attendance/regularizations/:id/review`, `GET /api/v1/attendance/regularizations/me`, `POST /api/v1/attendance/regularizations`

🧭 **How to Get Here**:
After logging in as **HR Admin**, **Branch Admin**, or **Manager**, click **Regularization** in the left sidebar (under top navigation group, icon: `<CalendarMonthIcon />`). This opens `/attendance/regularizations`.
* **Sidebar Menu Permission**: Guarded by `permission: "leave.read"`.
* **HR / Admin / Manager View**: Renders the organization or branch pending regularization review queue (`getPendingRegularizationRequests`).
* **Employee View**: If accessed by an `EMPLOYEE` role, renders their personal regularization request history (`getMyRegularizationRequests`).

---

#### 📝 Step-by-Step HR Review Guide & Interactive Control Breakdown

As an HR Admin or Manager, the Regularization page allows you to inspect pending attendance correction requests submitted by employees, review their requested check-in/out adjustments and reasons, and approve or reject the request. Below is the field-by-field breakdown of the queue table and the review dialog:

##### 1. HR Regularizations Queue Table (`RegularizationListPage.tsx`)

| Element / Column Header | Format & Type | HR Action & Interactive UI Behavior |
| :--- | :--- | :--- |
| **Page Header & `[ Refresh ]` Button** | Header Bar | Displays calendar icon and title **"Attendance Regularizations"**. Clicking the top-right **`[ Refresh ]`** button manually refetches the latest pending request queue. |
| **`EMPLOYEE`** | Avatar + Name | Displays employee circular avatar (with profile picture or colored initials) and full name (e.g. `Uttam Kumar`, `Ajay Reynolds`). |
| **`ATTENDANCE DATE`** | Date (`Medium Format`) | Displays the target shift date requested for correction (e.g. `Aug 17, 2026`). |
| **`REQUESTED CHECK IN`** | 12-Hour Time (Green text) | Displays requested check-in timestamp (e.g. `10:00 AM`) or `—` if unadjusted. |
| **`REQUESTED CHECK OUT`** | 12-Hour Time (Green text) | Displays requested check-out timestamp (e.g. `07:30 PM`) or `—` if unadjusted. |
| **`REASON`** | Text string | Displays the employee's submitted explanation for the correction (e.g. `gdfgdgrgdr`, `sjhfvsjdui`). |
| **`STATUS`** | Status Chip Badge | Displays yellow **`Pending`** chip badge (`#FEF3C7` background) for requests awaiting review. |
| **`ACTIONS`** | Action Icon Button | Renders a blue square review icon button (`<RateReviewOutlinedIcon />`). Hovering displays tooltip `"Review Request"`. Clicking opens the **Review Regularization Request** dialog. |

##### 2. HR Review Regularization Request Modal (`ReviewRegularizationDialog.tsx`)

| Element / Field Label | Expected Format & Type | Required / Optional | HR Reviewer Behavior & Execution Logic |
| :--- | :--- | :---: | :--- |
| **Employee & Attendance Details** | Info Card Grid | Display Only | Displays a shaded summary card containing:<br>• **Employee**: Full name and employee code in parentheses (e.g. `Uttam Kumar (EMP-007)`).<br>• **Attendance Date**: Shift date being regularized (e.g. `Aug 17, 2026`).<br>• **Requested Check In**: Green text timestamp (e.g. `10:00 AM`).<br>• **Requested Check Out**: Green text timestamp (e.g. `07:30 PM`).<br>• **Reason for Correction**: Italicized quote of employee's reason (`"gdfgdgrgdr"`). |
| **Reviewer Comments** | Multiline Text Field (`rows={3}`) | Optional | Text area with placeholder `"Provide comments for approval or rejection..."`. Allows HR to type notes for approval verification or rejection justification. |
| **`[ Cancel ]` Button** | Secondary Text Button | Click Action | Dismisses the review dialog without saving or making changes to the request. |
| **`[ Reject Request ]` Button** | Outlined Danger Button (Red `#FCA5A5`) | Click Action | Sends `PATCH /api/v1/attendance/regularizations/:id/review` with `status: "REJECTED"` and reviewer comments. Updates request status chip to **`Rejected`** (Red) and closes dialog. Attendance record remains unchanged. |
| **`[ Approve Request ]` Button** | Solid Success Button (Green `#10B981`) | Click Action | Sends `PATCH /api/v1/attendance/regularizations/:id/review` with `status: "APPROVED"` and reviewer comments.<br>**Automatic Backend Effects on Approval**:<br>1. Injects manual session punch logs (`SessionType.CHECK_IN` / `CHECK_OUT`, `PunchSource.MANUAL`).<br>2. Recalculates total `workedMinutes` from session pairings.<br>3. Recalculates attendance status (`PRESENT`, `LATE`, `HALF_DAY`), `isLate`, and `isCheckOutEarly`.<br>4. Marks attendance record with `isRegularized: true`.<br>5. Updates request status to **`Approved`** (Green) and refreshes queue table. |

##### 3. Employee Request Submission Dialog (`RegularizeRequestDialog.tsx` — Reference)
*(Note: Used by Employees to submit requests prior to HR review)*
* **Check-In / Check-Out Checkboxes**: Selects which punch time to adjust (`Requested Check-In Time` / `Requested Check-Out Time`).
* **Reason for Regularization**: Multiline text input requiring minimum 10 characters explaining the correction requirement.

---

#### ✅ Success Cases

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Load HR Review Queue** | 1. Log in as **HR Admin** or **Manager**.<br>2. Click **Regularization** in left sidebar. | Navigates to `/attendance/regularizations`. Header displays `"Attendance Regularizations"`. Table lists all pending regularization requests with employee names, dates, requested times, reasons, and yellow `Pending` chips. | [`RegularizationListPage.tsx:L73-L99`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L73-L99) |
| **Open Review Dialog** | 1. Locate employee row (e.g. `Uttam Kumar`).<br>2. Click the blue **Review Request** icon button under **ACTIONS**. | Opens **Review Regularization Request** modal. Summary card displays employee code `Uttam Kumar (EMP-007)`, requested times `10:00 AM` / `07:30 PM`, and reason `"gdfgdgrgdr"`. | [`ReviewRegularizationDialog.tsx:L95-L140`](file:///d:/hrms/src/sections/attendance/attendance-regularization/components/ReviewRegularizationDialog.tsx#L95-L140) |
| **Approve Request (HR Action)** | 1. Inside Review modal, enter optional Reviewer Comments (e.g. `"Approved after shift verification"`).<br>2. Click **`[ Approve Request ]`** (Solid Green button). | Modal closes. Request status updates to **`Approved`** (Green chip). Backend automatically injects manual punch sessions, recalculates worked hours, updates shift status, and sets `isRegularized: true`. | [`ReviewRegularizationDialog.tsx:L40-L54`](file:///d:/hrms/src/sections/attendance/attendance-regularization/components/ReviewRegularizationDialog.tsx#L40-L54), [`regularization.service.ts:L95-L156`](file:///d:/hrms/hrms-backend/src/modules/attendance/services/regularization.service.ts#L95-L156) |
| **Reject Request (HR Action)** | 1. Inside Review modal, enter Reviewer Comments (e.g. `"Biometric log mismatch"`).<br>2. Click **`[ Reject Request ]`** (Outlined Red button). | Modal closes. Request status updates to **`Rejected`** (Red chip). Original employee attendance record remains untouched. | [`ReviewRegularizationDialog.tsx:L40-L54`](file:///d:/hrms/src/sections/attendance/attendance-regularization/components/ReviewRegularizationDialog.tsx#L40-L54) |
| **Manual Queue Refresh** | 1. Click top-right **`[ Refresh ]`** button. | Queue re-fetches immediately, updating table entries and clearance status. | [`RegularizationListPage.tsx:L174-L191`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L174-L191) |
| **Auto Queue Polling** | 1. Leave page open on HR dashboard. | Queue automatically polls backend every **15 seconds** and refetches whenever browser window regains focus, introducing new employee requests in real time. | [`RegularizationListPage.tsx:L115-L127`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L115-L127) |

---

#### ⚠️ Validation Errors to Test

| Field / Constraint | Trigger Condition | Expected Error Message | Code Reference |
| :--- | :--- | :--- | :--- |
| **Already Reviewed Request (400)** | Submitting an approval or rejection for a request that was already reviewed in another session | Red inline Alert displays: `"This request has already been reviewed"` | [`regularization.service.ts:L84-L86`](file:///d:/hrms/hrms-backend/src/modules/attendance/services/regularization.service.ts#L84-L86) |
| **No Time Selected (Employee Submission)** | Employee submits regularization without checking Check-In or Check-Out checkbox | Red inline Alert displays: `"Please select at least one check-in or check-out time to adjust."` | [`RegularizeRequestDialog.tsx:L87-L90`](file:///d:/hrms/src/sections/attendance/components/RegularizeRequestDialog.tsx#L87-L90) |
| **Short Reason (Employee Submission)** | Employee enters reason with fewer than 10 characters | Red inline Alert displays: `"Please provide a detailed reason (minimum 10 characters)."` | [`RegularizeRequestDialog.tsx:L92-L95`](file:///d:/hrms/src/sections/attendance/components/RegularizeRequestDialog.tsx#L92-L95) |
| **Duplicate Pending Request (409)** | Employee submits a second request for an attendance record already pending review | Red inline Alert displays: `"You already have a pending request for this attendance record"` | [`regularization.service.ts:L47-L50`](file:///d:/hrms/hrms-backend/src/modules/attendance/services/regularization.service.ts#L47-L50) |

---

#### ❌ Error / Failure Cases

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Request Not Found (404)** | Regularization request was deleted before HR review | Red inline Alert displays: `"Regularization request not found"`. | [`regularization.service.ts:L83`](file:///d:/hrms/hrms-backend/src/modules/attendance/services/regularization.service.ts#L83) |
| **Server Review Error (500)** | Database failure during review submission | Red inline Alert displays: `err.response.data.message` or `"Failed to submit review"`. | [`ReviewRegularizationDialog.tsx:L55-L60`](file:///d:/hrms/src/sections/attendance/attendance-regularization/components/ReviewRegularizationDialog.tsx#L55-L60) |
| **Empty Pending Queue** | No regularization requests require HR review | Displays empty queue state card with icon `<HistoryEduOutlinedIcon />`, title `"All Caught Up!"`, and subtext `"There are no pending regularization requests requiring your review."` | [`RegularizationListPage.tsx:L220-L228`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L220-L228) |

---

#### 🛡️ Role-Based Access & Restrictions

| Role Slug | Can Access Queue? | HR Review Actions & Access Rights | Code Reference |
| :--- | :---: | :--- | :--- |
| **`HR_ADMIN`** | ✅ Full HR Access | Full access to pending regularization queue (`getPendingRequests`). Can review, approve, or reject any employee request. | [`RegularizationListPage.tsx:L73-L97`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L73-L97) |
| **`ORG_ADMIN`** | ✅ Full Access | Full access to pending regularization queue (`getPendingRequests`). Can review, approve, or reject requests across all branches. | [`RegularizationListPage.tsx:L73-L97`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L73-L97) |
| **`BRANCH_ADMIN`** | ✅ Branch Scope | Views pending regularization queue filtered to their assigned branch (`findPendingForBranch`). Can review, approve, or reject branch requests. | [`RegularizationListPage.tsx:L73-L97`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L73-L97), [`regularization.service.ts:L77`](file:///d:/hrms/hrms-backend/src/modules/attendance/services/regularization.service.ts#L77) |
| **`LEADERSHIP`** | ✅ Review Access | Views pending regularization queue and can review employee requests. | [`RegularizationListPage.tsx:L73-L97`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L73-L97) |
| **`MANAGER`** | ✅ Team Scope | Views pending regularization queue for team members (`findPendingForBranch`). Can review, approve, or reject requests. | [`RegularizationListPage.tsx:L73-L97`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L73-L97) |
| **`PRODUCT_MANAGER`** | ✅ Review Access | Views pending regularization queue and can review requests. | [`RegularizationListPage.tsx:L73-L97`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L73-L97) |
| **`EMPLOYEE`** | ❌ Review Disabled | Views only self-submitted request history (`getMyRegularizationRequests`). Review icon buttons are hidden and replaced with **REQUESTED ON** dates. Cannot approve or reject requests. | [`RegularizationListPage.tsx:L65-L72`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L65-L72), [`RegularizationListPage.tsx:L495-L499`](file:///d:/hrms/src/sections/attendance/attendance-regularization/RegularizationListPage.tsx#L495-L499) |

---

## 5. 🌴 Leave & Approvals Management

* **Routes**: `/leave`, `/leave/approvals`

### **5.1 Leave Dashboard & Request Submission**

* **Route**: `/leave`
* **Source Component**: [`LeaveDashboardView.tsx`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx), [`ApplyLeaveDialog.tsx`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx), [`LeaveBalancesGrid.tsx`](file:///d:/hrms/src/sections/leave/leave-balance/LeaveBalancesGrid.tsx), [`LeaveRequestsTable.tsx`](file:///d:/hrms/src/sections/leave/components/LeaveRequestsTable.tsx)
* **API Calls**: `GET /api/v1/leave/balances/me`, `GET /api/v1/leave/types`, `POST /api/v1/leave/requests`, `GET /api/v1/leave/requests/me`, `GET /api/v1/leave/report`, `GET /api/v1/leave/comp-off/balances/me`

🧭 **How to Get Here**:
After logging in, click **Leave Management** in the left sidebar (under top navigation group, icon: `<PolicyIcon />`). This takes you to `/leave`.
* **Sidebar Menu Permission**: Guarded by `permission: "leave.read"`.
* **Employee View**: Logged in as an `EMPLOYEE` (or user without `leave.approve`/`leave.read`), renders personal leave dashboard (`<LeaveTab isViewingOther={false} user={user} />`) titled `"My Leaves"`.
* **Manager / HR / Admin View**: Logged in as HR, Manager, or Admin, renders full `<LeaveDashboardView />` with header `"Leave Management"`, **`[ + Apply Leave ]`** button, 4 KPI cards, and 4 navigation tabs (`Requests`, `Balances`, `Calendar`, `Policy`). If profile is incomplete (`PROFILE_INCOMPLETE_HARD`), renders Profile Verification lock screen.

---

#### 📝 Interactive Controls, Tabs & Dialog Field Guide

The Leave Dashboard provides workforce leave analytics, leave balance grids, interactive leave calendars, and a leave application modal. Below is the field-by-field breakdown of every control, navigation tab, and modal input:

##### 1. Navigation Tabs Bar (`LeaveDashboardView.tsx`)
| Tab Name | Tab Index | Content & Interactive UI Behavior |
| :--- | :---: | :--- |
| **`Requests`** | `0` (Default) | Renders `<LeaveRequestsTable />` listing all team and personal leave requests with status badges (`PENDING`, `APPROVED`, `REJECTED`), employee details, date periods, total days, and quick action buttons (`Approve`, `Reject`, `View Details`). |
| **`Balances`** | `1` | Renders `<LeaveBalancesGrid />` displaying organization employee leave balance cards with stat columns for **Annual**, **Sick**, and **Casual** leave balances. |
| **`Calendar`** | `2` | Renders `<LeaveCalendarView />` displaying an interactive monthly workforce leave calendar. |
| **`Policy`** | `3` | Renders `<LeavePolicyView />` displaying organization leave policies, accrual rules, and sandwich policy details. |

##### 2. Apply Leave Dialog Modal (`ApplyLeaveDialog.tsx`)

| Element / Control Label | Expected Format & Type | Required / Optional | Selection Dependencies & Interactive UI Behavior |
| :--- | :--- | :---: | :--- |
| **Leave Type** | Select Dropdown (`TextInput select`) | Required | Populated dynamically from employee leave balances (`balances` prop). Displays `${leaveType.name} (${leaveType.code}) — Balance: ${available}` (e.g. `Casual Leave (CL) — Balance: 3`). Defaults to first available balance. |
| **From Date** | Date Input (`type="date"`), e.g. `2026-09-10` | Required | Standard ISO date picker (`YYYY-MM-DD`). |
| **From Session** | Select Dropdown (`TextInput select`) | Optional (Default: `Full Day`) | Options: `Full Day` (`FULL_DAY`), `First Half` (`FIRST_HALF`), `Second Half` (`SECOND_HALF`). |
| **To Date** | Date Input (`type="date"`), e.g. `2026-09-12` | Required | Standard ISO date picker (`YYYY-MM-DD`). Must be greater than or equal to `From Date`. |
| **To Session** | Select Dropdown (`TextInput select`) | Optional (Default: `Full Day`) | Options: `Full Day` (`FULL_DAY`), `First Half` (`FIRST_HALF`), `Second Half` (`SECOND_HALF`). |
| **Reason for Leave** | Multiline Text Field (`rows={2}`) | Required | Text area with placeholder `"Please enter a detailed reason (minimum 5 characters)..."`. Minimum 5 characters required. Displays live error helper string if 1 to 4 chars typed (`"Reason must be at least 5 characters long."`). |
| **`[ Submit ]` Button** | Primary Action Button (Indigo `#6D5DF6`) | Click Action | **Disabled when**: `submitting`, `!leaveTypeId`, `!fromDate`, `!toDate`, or `reason.trim().length < 5`.<br>**Behavior**: Dispatches `applyLeaveRequest()`, sets spinner (`submitting: true`), closes modal on success, and reloads leave balances. |
| **`[ Cancel ]` Button** | Secondary Button (Text button) | Click Action | Dismisses the dialog without submitting changes. |

##### 3. Leave Request Details Modal (`LeaveDetailDialog`)
* **Trigger**: Clicking **View Details** or preview row on `<LeaveRequestsTable />`.
* **Content**: Displays Employee Name, Leave Type Name, Date Period & Total Days, Reason, and Status badge.

---

#### ✅ Success Cases

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Open Apply Leave Dialog** | 1. Open `/leave`<br>2. Click **`[ + Apply Leave ]`** button in page header. | Dialog opens titled `"Apply for Leave"`. Leave Type dropdown populates with active balances (e.g. `Casual Leave (CL) — Balance: 3`). | [`LeaveDashboardView.tsx:L243-L246`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L243-L246), [`ApplyLeaveDialog.tsx:L77-L126`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx#L77-L126) |
| **Submit Leave Request** | 1. Select Leave Type: `Casual Leave`.<br>2. Select From Date: `2026-09-10`, To Date: `2026-09-12`.<br>3. Enter Reason: `"Family function in native place"`.<br>4. Click **`[ Submit ]`**. | Modal closes. Redux dispatches `applyLeaveRequest`. Success toast appears, leave balances reload, and request enters `Leave Requests` table with status `PENDING`. | [`ApplyLeaveDialog.tsx:L56-L67`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx#L56-L67), [`LeaveDashboardView.tsx:L228-L241`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L228-L241) |
| **Switch Navigation Tabs** | 1. Click **Balances** tab.<br>2. Click **Calendar** tab.<br>3. Click **Policy** tab. | Tab indicator glides to selected tab. Renders `<LeaveBalancesGrid />` with employee quota stat columns, `<LeaveCalendarView />` monthly calendar grid, and `<LeavePolicyView />` rule cards respectively. | [`LeaveDashboardView.tsx:L476-L536`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L476-L536) |
| **Quick Approve Leave Request** | 1. On `Requests` tab, locate pending request.<br>2. Click **Approve** action button. | Snackbar alert displays `"Leave request approved for [Employee Name]"`. Request status updates to `APPROVED` (Green) and backend confirms balance deduction. | [`LeaveDashboardView.tsx:L275-L297`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L275-L297) |
| **Preview Request Details** | 1. Click row or details icon on any leave request. | Opens `LeaveDetailDialog` modal showing employee name, leave type, period, total days, reason text, and colored status badge. | [`LeaveDashboardView.tsx:L59-L111`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L59-L111) |

---

#### ⚠️ Validation Errors to Test

| Field / Constraint | Trigger Condition | Expected Error Message | Code Reference |
| :--- | :--- | :--- | :--- |
| **Short Reason (< 5 Chars)** | Enter 1 to 4 characters in Reason field | Helper error string appears below input: `"Reason must be at least 5 characters long."`. Submit button remains disabled. | [`ApplyLeaveDialog.tsx:L189`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx#L189) |
| **Date Order Constraint (`CreateLeaveRequestDto`)** | Select `To Date` prior to `From Date` (e.g. From: `2026-09-10`, To: `2026-09-05`) | Backend Zod/Service validation fails: `"toDate cannot be before fromDate"` | [`leave-request.service.ts:L78`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L78) |
| **Advance Notice Violation** | Apply for a leave type requiring notice without meeting notice days | Backend validation fails: `"This leave type requires at least [X] days advance notice"` | [`leave-request.service.ts:L84-L87`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L84-L87) |
| **Consecutive Days Limit** | Request days exceeding `maxConsecutiveDays` limit for selected leave type | Backend validation fails: `"Maximum [X] consecutive days allowed for this leave type"` | [`leave-request.service.ts:L103-L106`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L103-L106) |

---

#### ❌ Error / Failure Cases

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Hard Profile Lock (403)** | User profile is incomplete (`PROFILE_INCOMPLETE_HARD`) | `useProfileBlockDetect` catches block error (`isProfileBlocked: true`). Page replaces leave dashboard with Profile Verification card featuring `<LockOutlinedIcon />`, title `"Access Restricted — Profile Verification Required"`, pending section chips, and a **`[ Go to Profile Setup ]`** button linking to `/onboarding`. | [`LeaveDashboardView.tsx:L394-L464`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L394-L464) |
| **Unlinked Employee Account (404)** | User account has no linked `employeeId` record in database | Backend returns 404 error: `"No employee record is linked to this account"`. Red inline Alert banner displays error in dialog. | [`leave-request.service.ts:L59`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L59) |
| **Server Error on Submit (500)** | Backend DB connection error during leave application | Red inline Alert displays in dialog: `error` message string. | [`ApplyLeaveDialog.tsx:L104-L108`](file:///d:/hrms/src/sections/leave/leave-apply/ApplyLeaveDialog.tsx#L104-L108) |

---

#### 🛡️ Role-Based Access & Restrictions

| Role Slug | Can Access `/leave`? | Access Scope & Page Behavior | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Full Access | Full access to `/leave`. Views organization-wide leave requests (`getLeaveReport`), employee balances grid, and policy cards. Note: `[ + Apply Leave ]` button is hidden for `ORG_ADMIN` (`role !== "ORG_ADMIN"`). | [`LeaveDashboardView.tsx:L370`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L370) |
| **`HR_ADMIN`** | ✅ Full Access | Full access to `/leave`. Can click **`[ + Apply Leave ]`**, view team requests, manage balances, and approve/reject leave requests (`canApproveLeaves: true`). | [`LeaveDashboardView.tsx:L370-L390`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L370-L390) |
| **`BRANCH_ADMIN`** | ✅ Branch Scope | Access to `/leave`. Can click **`[ + Apply Leave ]`**, view branch employee leave requests, and approve/reject branch requests. | [`LeaveDashboardView.tsx:L370-L390`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L370-L390) |
| **`LEADERSHIP`** | ✅ Read & Approve | Access to `/leave`. Can view leave requests, balances, calendar, and approve/reject team leave applications. | [`LeaveDashboardView.tsx:L134-L136`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L134-L136) |
| **`MANAGER`** | ✅ Team Scope | Access to `/leave`. Can apply for self leave, view team leave requests, and approve/reject team leave applications (`canApproveLeaves: true`). | [`LeaveDashboardView.tsx:L134-L136`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L134-L136) |
| **`PRODUCT_MANAGER`** | ✅ Permission-Based | Access determined by `leave.read` and `leave.approve` permissions. | [`LeaveDashboardView.tsx:L134-L136`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L134-L136) |
| **`EMPLOYEE`** | ✅ Self Service | Page renders personal leave view (`<LeaveTab isViewingOther={false} user={user} />`) titled `"My Leaves"`. Can view personal leave balances and submit self leave applications. Cannot view organization-wide leave reports or approve team requests. | [`LeaveDashboardView.tsx:L349-L359`](file:///d:/hrms/src/sections/leave/leave-list/LeaveDashboardView.tsx#L349-L359) |

---

### **5.2 Leave Approvals Queue (Manager View)**

* **Route**: `/leave/approvals`
* **Source Component**: [`LeaveApprovalsView.tsx`](file:///d:/hrms/src/sections/leave/leave-approvals/LeaveApprovalsView.tsx), [`leave-request.service.ts`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts)
* **API Calls**: `GET /api/v1/leave/requests/pending`, `PATCH /api/v1/leave/requests/:id/review`

🧭 **How to Get Here**:
After logging in as a **Manager**, **HR Admin**, **Branch Admin**, or **Org Admin**:
1. Click **Leave Management** in the left sidebar (under top navigation group, icon: `<PolicyIcon />`).
2. On the Leave Management page, ensure the **`Requests`** tab is selected (default tab). This displays the team leave request table with **`Approve`** and **`Reject`** action buttons.

* **Role Access Restriction**: Users logged in as an `EMPLOYEE` (or without `leave.approve` permission) will not see team approval controls and will only see their own personal leave history.

---

#### 📝 Interactive Controls & Review Modal Field Guide

The Leave Approvals queue allows managers and administrators to review pending workforce leave applications, inspect leave durations and employee reasons, and approve or reject requests with optional reviewer notes. Below is the field-by-field breakdown of the queue table and the review dialog:

##### 1. Pending Leave Approvals Table (`LeaveApprovalsView.tsx`)

| Element / Column Header | Format & Type | Manager Action & Interactive UI Behavior |
| :--- | :--- | :--- |
| **Page Header** | Header Bar | Displays policy icon `<PolicyOutlinedIcon />`, title **"Leave Approvals"**, and subtitle `"Review and process employee leave applications"`. |
| **`Employee`** | Text Block | Displays employee full name (e.g. `Uttam Kumar`) and ID badge code (`ID: EMP-007`). |
| **`Leave Type`** | Chip + Text | Displays a light-blue chip badge with leave type code (e.g. `CL`, `SL`, `EL`) and full name (`Casual Leave`, `Sick Leave`). |
| **`Duration`** | Date Period | Displays start date and end date formatted as `MMM DD, YYYY` (e.g. `Sep 10, 2026 to Sep 12, 2026`). Single-day leaves show only the start date. |
| **`Total Days`** | Count Badge | Displays requested day count (e.g. `1 Day` or `3 Days`). |
| **`Reason`** | Truncated Text | Displays employee's submitted explanation (e.g. `"Family function in native place"`). Hovering displays full text tooltip. |
| **`Approve` Button** | Outlined Green Button (`#10B981`, icon `<CheckIcon />`) | Clicking opens the **Approve Leave Request** confirmation dialog. |
| **`Reject` Button** | Outlined Red Button (`#EF4444`, icon `<CloseIcon />`) | Clicking opens the **Reject Leave Request** confirmation dialog. |
| **Table Pagination** | Pagination Controls | Bottom right controls (`Rows per page: 5, 10, 20`). Allows paging through large pending approval queues. |

##### 2. Review Request Confirmation Modal (`Dialog`)

| Element / Field Label | Expected Format & Type | Required / Optional | Manager Reviewer Behavior & Backend Mechanics |
| :--- | :--- | :---: | :--- |
| **Modal Title** | Header Title | Display Only | Displays **"Approve Leave Request"** (Green) or **"Reject Leave Request"** (Red) based on the clicked action. |
| **Confirmation Prompt** | Body Text | Display Only | Displays prompt: `"Are you sure you want to approve/reject this leave request? You can add review comments below."` |
| **Review Comments** | Multiline Text Field (`rows={3}`) | Optional | Text area with placeholder `"Add comments or notes..."`. Accepts up to 500 characters of manager review feedback. |
| **`[ Cancel ]` Button** | Text Button | Click Action | Dismisses the dialog without submitting changes or altering the request status. |
| **`[ Confirm Approve ]` / `[ Confirm Reject ]` Button** | Solid Action Button (Green `#10B981` / Red `#EF4444`) | Click Action | Submits `PATCH /api/v1/leave/requests/:id/review` with payload `{ status: "APPROVED" | "REJECTED", reviewComments }`.<br>**Automatic Backend Effects**:<br>1. **On Approval**: Converts reserved pending balance to `used` balance, updates request status to `APPROVED`, and automatically upserts daily attendance records as `ON_LEAVE` for the leave date range.<br>2. **On Rejection**: Releases reserved pending balance back to employee's available pool and sets request status to `REJECTED`.<br>3. **On Success**: Closes modal, displays auto-refresh, and updates total pending count. |

---

#### ✅ Success Cases

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Load Pending Approvals Queue** | 1. Log in as **Manager** or **HR Admin**.<br>2. Navigate to `/leave/approvals`. | Page header displays **"Leave Approvals"**. Table populates with all pending employee leave requests displaying names, codes, leave types, date ranges, total days, and reasons. | [`LeaveApprovalsView.tsx:L136-L193`](file:///d:/hrms/src/sections/leave/leave-approvals/LeaveApprovalsView.tsx#L136-L193) |
| **Open Review Dialog** | 1. Locate employee row (e.g. `Uttam Kumar`).<br>2. Click **Approve** or **Reject** button. | Opens confirmation modal. Title displays `"Approve Leave Request"` or `"Reject Leave Request"`. Includes prompt and Review Comments textarea. | [`LeaveApprovalsView.tsx:L117-L120`](file:///d:/hrms/src/sections/leave/leave-approvals/LeaveApprovalsView.tsx#L117-L120), [`LeaveApprovalsView.tsx:L322-L372`](file:///d:/hrms/src/sections/leave/leave-approvals/LeaveApprovalsView.tsx#L322-L372) |
| **Approve Leave Request** | 1. Open Review modal for approval.<br>2. Enter optional comment (e.g. `"Approved by Manager"`).<br>3. Click **`[ Confirm Approve ]`**. | Modal closes. Request disappears from pending queue. Backend converts reserved balance to `used`, marks daily attendance as `ON_LEAVE`, and logs audit action. | [`LeaveApprovalsView.tsx:L121-L132`](file:///d:/hrms/src/sections/leave/leave-approvals/LeaveApprovalsView.tsx#L121-L132), [`leave-request.service.ts:L283-L293`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L283-L293) |
| **Reject Leave Request** | 1. Open Review modal for rejection.<br>2. Enter optional comment (e.g. `"Project deliverable deadline conflict"`).<br>3. Click **`[ Confirm Reject ]`**. | Modal closes. Request status updates to `REJECTED`. Backend releases reserved leave days back to employee's available pool. | [`LeaveApprovalsView.tsx:L121-L132`](file:///d:/hrms/src/sections/leave/leave-approvals/LeaveApprovalsView.tsx#L121-L132), [`leave-request.service.ts:L275-L281`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L275-L281) |
| **Paginate Pending Queue** | 1. Click page navigation arrows or change rows per page dropdown (e.g. `20`). | Table fetches next page of pending leave applications (`getPendingLeaveRequestsRequest`). | [`LeaveApprovalsView.tsx:L308-L316`](file:///d:/hrms/src/sections/leave/leave-approvals/LeaveApprovalsView.tsx#L308-L316) |

---

#### ⚠️ Validation Errors to Test

| Field / Constraint | Trigger Condition | Expected Error Message | Code Reference |
| :--- | :--- | :--- | :--- |
| **Already Processed Request (400)** | Submitting review for a request already approved/rejected in another session | Red Alert inside modal: `"This request is not pending review"` | [`leave-request.service.ts:L245`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L245) |
| **Review Comments Length (> 500 Chars)** | Enter review comments exceeding 500 characters | Backend DTO validation fails: `"String must contain at most 500 character(s)"` | [`leave.dto.ts:L56`](file:///d:/hrms/hrms-backend/src/modules/leave/dto/leave.dto.ts#L56) |

---

#### ❌ Error / Failure Cases

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Unauthorized Approver Role (403)** | Manager attempts to approve a level reserved for a different role | Red inline Alert displays: `"Only a [Role] can act on this approval level"`. | [`leave-request.service.ts:L254-L257`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L254-L257) |
| **Request Not Found (404)** | Leave request was deleted before review submission | Red inline Alert displays: `"Leave request not found"`. | [`leave-request.service.ts:L243`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L243) |
| **Empty Approvals Queue** | No pending employee leave requests require review | Renders empty state card titled `"No Pending Leave Requests"`, subtext `"Excellent! There are no employee leave applications awaiting your review."` | [`LeaveApprovalsView.tsx:L162-L178`](file:///d:/hrms/src/sections/leave/leave-approvals/LeaveApprovalsView.tsx#L162-L178) |

---

#### 🛡️ Role-Based Access & Restrictions

| Role Slug | Can Access `/leave/approvals`? | Access Scope & Review Rights | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Full Access | Full access to `/leave/approvals` (bypasses step approver role checks). Can review and approve/reject leave requests for any employee across all branches. | [`leave-request.service.ts:L253`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/leave-requests/leave-request.service.ts#L253) |
| **`HR_ADMIN`** | ✅ Full Access | Full access to `/leave/approvals` (`permission: "leave.approve"`). Can review, approve, or reject employee leave applications. | [`index.tsx:L150-L156`](file:///d:/hrms/src/routes/index.tsx#L150-L156) |
| **`BRANCH_ADMIN`** | ✅ Branch Scope | Access to `/leave/approvals`. Can review, approve, or reject leave requests within assigned branch. | [`index.tsx:L150-L156`](file:///d:/hrms/src/routes/index.tsx#L150-L156) |
| **`LEADERSHIP`** | ✅ Review Access | Access to `/leave/approvals`. Can review and process pending team leave applications. | [`index.tsx:L150-L156`](file:///d:/hrms/src/routes/index.tsx#L150-L156) |
| **`MANAGER`** | ✅ Team Scope | Access to `/leave/approvals` (`permission: "leave.approve"`). Can review and process pending leave requests for direct report team members. | [`index.tsx:L150-L156`](file:///d:/hrms/src/routes/index.tsx#L150-L156) |
| **`PRODUCT_MANAGER`** | ✅ Permission-Based | Access granted if assigned `permission: "leave.approve"`. | [`index.tsx:L150-L156`](file:///d:/hrms/src/routes/index.tsx#L150-L156) |
| **`EMPLOYEE`** | ❌ Blocked | Route `/leave/approvals` is blocked by `<RoleGuard permission="leave.approve">`. Employees are redirected away from the approvals queue. | [`index.tsx:L150-L156`](file:///d:/hrms/src/routes/index.tsx#L150-L156) |

---

## 6. 📅 Holidays & Branch Calendars

* **Route**: `/holidays`
* **Source Component**: [`HolidayListView.tsx`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx), [`holiday.service.ts`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/holidays/holiday.service.ts), [`holiday-resolution.engine.ts`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/holidays/holiday-resolution.engine.ts)
* **API Calls**: `GET /api/v1/leave/holidays?year=2026`, `POST /api/v1/leave/holidays`, `PATCH /api/v1/leave/holidays/:id`, `DELETE /api/v1/leave/holidays/:id`, `GET /api/v1/leave/holidays/resolve?branchId=:id&year=2026`, `POST /api/v1/leave/holidays/seed-default`

🧭 **How to Get Here**:
After logging in:
1. Click **Holiday** in the left sidebar (under top navigation group, icon: `<CalendarMonthIcon />`). This opens the **Holidays & Branch Calendars** screen (`/holidays`).
2. On the Holidays page, use the top action buttons **`[ Seed Defaults ]`** and **`[ Add Holiday ]`** (visible to Admin/HR roles) or use the Filter Toolbar to switch between master lists, branch-resolved schedules, monthly calendar grids, and personal schedules.
* **Sidebar Menu Permission**: Guarded by `permission: "leave.read"`.

---

#### 📝 Interactive Controls, Filter Bar & Form Field Guide

The Holidays module provides organization-wide statutory holiday management, priority resolution engines (`BRANCH > STATE > COUNTRY > GLOBAL`), interactive monthly branch calendars, and statutory defaults seeding. Below is the field-by-field breakdown of every control, filter, and modal dialog:

##### 1. Top Filter Toolbar Controls (`HolidayListView.tsx`)

| Element / Control Label | Format & Type | Selection Dependencies & Interactive UI Behavior |
| :--- | :--- | :--- |
| **Year Selector** | Select Dropdown (`TextInput select`) | Options: `2024`, `2025`, `2026`, `2027`, `2028`. Defaults to current year (`2026`). Selecting a year refetches holidays for that year (`listHolidaysRequest(selectedYear)`). |
| **View Mode Selector** | Select Dropdown (`TextInput select`) | Visible to authorized roles (`ORG_ADMIN`, `HR_ADMIN`, `isSuperAdmin`).<br>Options:<br>• **`All Organization Master Holidays`** (`ALL`, Default): Renders master holiday table.<br>• **`Resolve Branch List`** (`RESOLVED`): Displays priority-deduplicated branch list.<br>• **`Branch Monthly Calendar Grid`** (`GRID`): Displays interactive month grid (`BranchCalendarGrid`).<br>• **`My Personal Schedule`** (`MY_SCHEDULE`): Displays employee's personal schedule calendar. |
| **Branch Selector** | Select Dropdown (`TextInput select`) | Visible when `viewMode` is set to **`RESOLVED`** or **`GRID`**. Populated dynamically from organization branches (`listBranches()`). Selecting a branch refetches resolved branch holidays or monthly calendar. |

##### 2. Add / Edit Holiday Dialog Modal (`HolidayFormDialog`)

| Element / Control Label | Expected Format & Type | Required / Optional | Selection Dependencies & Interactive UI Behavior |
| :--- | :--- | :---: | :--- |
| **Holiday Name** | Text Field (`TextInput`) | Required | Text input with placeholder `"e.g. Republic Day or Bangalore Office Day Off"`. E.g. `Republic Day`, `Diwali`. |
| **Date** | Date Input (`type="date"`) | Required | Standard ISO date picker (`YYYY-MM-DD`). |
| **Holiday Type** | Select Dropdown (`TextInput select`) | Optional (Default: `NATIONAL`) | Options: `National Holiday` (`NATIONAL`, Red chip `#FEE2E2`), `Restricted Holiday` (`RESTRICTED`, Yellow chip `#FEF3C7`), `Regional Holiday` (`REGIONAL`, Blue chip `#E0F2FE`). |
| **Holiday Scope** | Select Dropdown (`TextInput select`) | Optional (Default: `GLOBAL`) | Options:<br>• `Global (Entire Organization / Tenant)` (`GLOBAL`, Purple chip `#EDE9FE`)<br>• `Country Scope` (`COUNTRY`, Blue chip `#E0F2FE`)<br>• `State Scope` (`STATE`, Teal chip `#CCFBF1`)<br>• `Branch Scope` (`BRANCH`, Indigo chip `#E0E7FF`). |
| **Target Branch** | Select Dropdown (`TextInput select`) | Required when Scope = `BRANCH` | **Cascading Select**: Appears only when `Holiday Scope` is set to **`BRANCH`**. Populated dynamically from active branches. |
| **Country Code** | Text Field (`TextInput`) | Required when Scope = `COUNTRY` or `STATE` | **Cascading Field**: Appears only when Scope is **`COUNTRY`** or **`STATE`**. Placeholder `"e.g. IN or US"`. 2-letter ISO country code. |
| **State Code / State Name** | Text Field (`TextInput`) | Required when Scope = `STATE` | **Cascading Field**: Appears only when Scope is **`STATE`**. Placeholder `"e.g. Karnataka or KA"`. Accepts state code or full state name. |
| **Is Optional Holiday** | MUI Switch Toggle | Optional (Default: `Off`) | Toggle label `"Is Optional Holiday"`, subtext `"Employees can choose to take this leave or not"`. Sets `isOptional: true`. |
| **Description** | Multiline Text Field (`rows={2}`) | Optional | Text area with placeholder `"Brief description or context"`. |
| **`[ Create ]` / `[ Update ]` Button** | Primary Action Button (Indigo `#6D5DF6`) | Click Action | **Disabled when**: `submitting`, `!name.trim()`, `!date`, or scope dependencies missing (`branchId` for `BRANCH`, `countryCode` for `COUNTRY`, `stateCode` for `STATE`).<br>**Behavior**: Dispatches `createHolidayRequest` or `updateHolidayRequest`, sets spinner, closes modal, and refreshes list. |
| **`[ Cancel ]` Button** | Secondary Text Button | Click Action | Dismisses the dialog without saving changes. |

##### 3. Seed Default Statutory Holidays Modal (`SeedHolidaysDialog`)

| Element / Control Label | Expected Format & Type | Required / Optional | Selection Dependencies & Interactive UI Behavior |
| :--- | :--- | :---: | :--- |
| **Modal Header** | Header Title | Display Only | Displays sparkle icon `<AutoAwesomeIcon />` and title **"Seed Default Statutory Holidays"**. |
| **Info Banner** | Blue Alert Card | Display Only | Text: `"Generates statutory national (COUNTRY) & cantonal/regional (STATE) holidays based on your organization's registered locale. Idempotent & safe to execute."` |
| **State / Canton Code** | Text Field (`TextInput`) | Optional | Placeholder `"e.g. ZH (Zurich), GE, KA, NY, CA"`. Specifies regional state/canton code for statutory seeding. |
| **`[ Seed Statutory Holidays ]` Button** | Primary Action Button | Click Action | Submits `POST /api/v1/leave/holidays/seed-default?stateCode=...`. Automatically derives country code from organization settings. |
| **`[ Cancel ]` Button** | Secondary Text Button | Click Action | Dismisses the seed modal without making API calls. |

##### 4. Row Action Context Menu (`Menu`)
* **Trigger**: Clicking `MoreVertIcon` (`⋮`) on any row in the holiday table.
* **Options**:
  - **`Edit`** (Blue icon): Opens `HolidayFormDialog` with pre-filled details.
  - **`Delete`** (Red icon): Opens `ConfirmDialog` titled `"Delete Holiday"`. Clicking **`Delete`** dispatches `deleteHolidayRequest(id)`.

---

#### ✅ Success Cases

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Load Holidays Directory** | 1. Log in to HRMS.<br>2. Click **Holiday** in left sidebar. | Page header displays **"Holidays"**. Filter toolbar and Master Holiday Table populate with active organization holidays for current year. | [`HolidayListView.tsx:L632-L693`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L632-L693) |
| **Add New Master Holiday** | 1. Click **`[ Add Holiday ]`** button.<br>2. Enter Name: `Independence Day`, Date: `2026-08-15`, Type: `NATIONAL`, Scope: `GLOBAL`.<br>3. Click **`[ Create ]`**. | Modal closes. Redux dispatches `createHolidayRequest`. Toast confirms success and new holiday appears with Red `NATIONAL` chip and Purple `GLOBAL` scope chip. | [`HolidayListView.tsx:L127-L150`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L127-L150), [`HolidayListView.tsx:L563-L569`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L563-L569) |
| **Add Branch Local Override Holiday** | 1. Click **`[ Add Holiday ]`** button.<br>2. Select Scope: `BRANCH`. Select Branch: `Bangalore Branch`.<br>3. Enter Name: `Karnataka Rajyotsava`, Date: `2026-11-01`.<br>4. Click **`[ Create ]`**. | Target Branch select field appears. On submission, creates a branch-specific holiday with Indigo `BRANCH` scope chip. Target branch calendar automatically includes this local override. | [`HolidayListView.tsx:L237-L251`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L237-L251) |
| **Seed Default Statutory Holidays** | 1. Click **`[ Seed Defaults ]`** button.<br>2. Optional: Enter State Code `KA`.<br>3. Click **`[ Seed Statutory Holidays ]`**. | Backend generates statutory national and state holidays derived from org locale (e.g. `IN-KA`). Success alert displays `"Statutory holidays for IN-KA seeded successfully"`. | [`HolidayListView.tsx:L330-L424`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L330-L424), [`holiday.controller.ts:L97-L123`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/holidays/holiday.controller.ts#L97-L123) |
| **View Priority-Resolved Branch List** | 1. In View Mode dropdown, select **`Resolve Branch List`**.<br>2. Select Branch: `Bangalore Branch`. | Info banner displays explaining priority order (`BRANCH > STATE > COUNTRY > GLOBAL`). Table displays deduplicated holiday schedule tailored specifically for Bangalore Branch. | [`HolidayListView.tsx:L490-L503`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L490-L503), [`HolidayListView.tsx:L752-L757`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L752-L757) |
| **View Interactive Branch Calendar Grid** | 1. In View Mode dropdown, select **`Branch Monthly Calendar Grid`**.<br>2. Select Branch: `Bangalore Branch`. | Replaces table with `<BranchCalendarGrid />` monthly grid showing working days, weekends, and holiday events. Use `<` and `>` buttons to navigate months. | [`HolidayListView.tsx:L759-L782`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L759-L782) |
| **Edit Existing Holiday** | 1. Click `⋮` action menu on holiday row.<br>2. Click **Edit**.<br>3. Modify description or scope.<br>4. Click **`[ Update ]`**. | Modal pre-fills with existing holiday data. Submitting updates holiday and refreshes list. | [`HolidayListView.tsx:L557-L569`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L557-L569) |
| **Delete Holiday** | 1. Click `⋮` action menu on holiday row.<br>2. Click **Delete**.<br>3. In confirmation modal, click **`Delete`**. | Confirmation dialog asks `"Are you sure you want to delete the holiday [Name]?"`. On confirmation, deletes holiday record and updates table. | [`HolidayListView.tsx:L571-L585`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L571-L585) |

---

#### ⚠️ Validation Errors to Test

| Field / Constraint | Trigger Condition | Expected Error Message | Code Reference |
| :--- | :--- | :--- | :--- |
| **Duplicate Holiday Date & Scope (409 Conflict)** | Creating or updating a holiday with name/date/scope matching an existing record | Red inline Alert inside modal: `"A [SCOPE]-scope holiday (\"[Name]\") already exists on this date"` | [`holiday.service.ts:L42-L46`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/holidays/holiday.service.ts#L42-L46) |
| **Unconfigured Org Country Code (400)** | Clicking Seed Defaults when organization locale country code is missing | Red inline Alert inside modal: `"Organization has no country code configured. Please set a country code in your Organization settings first."` | [`holiday.controller.ts:L103-L108`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/holidays/holiday.controller.ts#L103-L108) |
| **Invalid Year Query (400)** | Providing an invalid year parameter (< 2000 or > 2100) to branch resolution API | Red inline Alert: `"Invalid year parameter"` | [`holiday.controller.ts:L68-L70`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/holidays/holiday.controller.ts#L68-L70) |
| **Missing Branch ID Query (400)** | Accessing branch resolution without specifying branch ID | Red inline Alert: `"branchId query param is required"` | [`holiday.controller.ts:L59-L61`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/holidays/holiday.controller.ts#L59-L61) |

---

#### ❌ Error / Failure Cases

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Holiday Not Found (404)** | Attempting to update or delete a holiday that was removed in another session | Red inline Alert: `"Holiday not found"`. | [`holiday.service.ts:L83`](file:///d:/hrms/hrms-backend/src/modules/leave/sub-modules/holidays/holiday.service.ts#L83) |
| **Server Error on Create (500)** | Database failure during holiday creation | Red inline Alert inside modal: `error` message string. | [`HolidayListView.tsx:L186-L190`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L186-L190) |
| **Empty Holiday Directory** | No master holidays recorded for selected year | Renders empty state paper titled `"No Holidays Found"`, subtext `"Holidays represent organization-wide paid calendar closures."`, and a **`[ Create New Holiday ]`** button. | [`HolidayListView.tsx:L820-L853`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L820-L853) |

---

#### 🛡️ Role-Based Access & Restrictions

| Role Slug | Can Access `/holidays`? | Access Scope & Actions Available | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Full Access | Full access to `/holidays`. Can view all master holidays, seed statutory defaults, create/edit/delete holidays, resolve branch calendars, and switch view modes. | [`HolidayListView.tsx:L439-L440`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L439-L440) |
| **`HR_ADMIN`** | ✅ Full Access | Full access to `/holidays`. Can seed defaults, add/edit/delete holidays, view branch calendar grids, and resolve branch lists (`canCreate: true`). | [`HolidayListView.tsx:L439-L440`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L439-L440) |
| **`BRANCH_ADMIN`** | ✅ Branch Scope | Access to `/holidays`. Can view master holidays and resolve/view calendar grid for assigned branch. `Add Holiday` and `Seed Defaults` buttons visible if granted `holiday.create`. | [`HolidayListView.tsx:L440`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L440) |
| **`LEADERSHIP`** | ✅ Read-Only | Access to `/holidays`. Can view master holidays and branch calendars. Action buttons (`Seed Defaults`, `Add Holiday`, Edit/Delete icons) are hidden. | [`HolidayListView.tsx:L440`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L440) |
| **`MANAGER`** | ✅ Read-Only | Access to `/holidays` (`permission: "leave.read"`). Can view master holidays and team branch calendars. Action buttons hidden unless granted `holiday.create`. | [`HolidayListView.tsx:L440`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L440) |
| **`PRODUCT_MANAGER`** | ✅ Permission-Based | Access determined by `leave.read` and `holiday.create` permissions. | [`HolidayListView.tsx:L440`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L440) |
| **`EMPLOYEE`** | ✅ Read-Only | Access to `/holidays` (`permission: "leave.read"`). Views master holiday table and personal schedule (`MY_SCHEDULE`). Management controls and View Mode selector are hidden (`isAuthorized: false`). | [`HolidayListView.tsx:L720-L733`](file:///d:/hrms/src/sections/holidays/HolidayListView.tsx#L720-L733) |

---

## 7. 📋 Document Verification

* **Route**: `/document-verification`
* **Source Component**: [`DocumentVerificationView.tsx`](file:///d:/hrms/src/sections/hr/documents-verification/DocumentVerificationView.tsx)
* **API Calls**: `GET /api/v1/documents/pending`, `PATCH /api/v1/documents/:id/verify`, `GET /api/v1/documents/:empId/:docId/download`

🧭 **How to Get Here**:
After logging in as **HR Admin**, **Branch Admin**, or **Org Admin**:
1. Click **Document Verification** in the left sidebar (under bottom navigation group, icon: `<FactCheckIcon />`). This opens the **Document Verification Queue** screen (`/document-verification`).
* **Sidebar Menu Permission**: Guarded by `permission: "document.read"`.

---

#### 📝 Interactive Controls & Rejection Modal Field Guide

The Document Verification queue allows HR administrators to review employee identity and education proof documents uploaded during onboarding or profile updates:

##### 1. Pending Verification Table (`DocumentVerificationView.tsx`)

| Element / Column Header | Format & Type | HR Action & Interactive UI Behavior |
| :--- | :--- | :--- |
| **Page Header** | Header Bar | Displays document icon `<DescriptionOutlinedIcon />`, title **"Document Verification"**, and subtitle `"Review and verify employee documents"`. |
| **`EMPLOYEE`** | Avatar + Text Block | Displays employee avatar initials, full name (e.g. `Uttam Kumar`), and Employee Code (`EMP-007`). |
| **`DOCUMENT TYPE`** | Text String | Displays uploaded document category (e.g. `PAN Card`, `Aadhaar Card`, `Degree Certificate`). |
| **`FILE NAME`** | Text String | Displays file name string (e.g. `pan_card_uttam.pdf`). |
| **`UPLOADED ON`** | Date (`MMM DD, YYYY`) | Upload timestamp. |
| **`STATUS`** | Status Chip Badge | Displays yellow **`Pending`** chip badge (`#FEF3C7` background). |
| **`View Document` Button** | Small Eye Icon Button (`<VisibilityOutlinedIcon />`) | Clicking fetches a secure presigned download URL (`getHrDownloadUrl`) and opens the document file in a new browser tab for visual inspection. |
| **`Approve` Button** | Small Green Check Icon Button (`#DCFCE7`, `<CheckIcon />`) | Submits `verifyDocument(id, { isVerified: true })`. On success, removes document from queue and displays toast `"Document approved successfully"`. |
| **`Reject` Button** | Small Red Close Icon Button (`#FEE2E2`, `<CloseIcon />`) | Clicking opens the **Reject Document** dialog modal. |

##### 2. Reject Document Modal (`Dialog`)

| Element / Field Label | Expected Format & Type | Required / Optional | HR Reviewer Behavior & Execution Logic |
| :--- | :--- | :---: | :--- |
| **Modal Title** | Header Title | Display Only | Displays title **"Reject Document"**. |
| **Remarks Field** | Multiline Text Field (`rows={3}`) | Optional | Text area label `"Remarks"`. Allows HR to type rejection notes or resubmission instructions for the employee. |
| **`[ Reject ]` Button** | Danger Action Button (Red `#DC2626`) | Click Action | Sends `PATCH /api/v1/documents/:id/verify` with `{ isVerified: false, remarks }`. Removes document from pending queue, updates document status to **`Rejected`**, and displays toast `"Document rejected"`. |
| **`[ Cancel ]` Button** | Text Button | Click Action | Dismisses the dialog without rejecting the document. |

---

#### ✅ Success Cases

| Action | Steps | Expected Result | Code Reference |
| :--- | :--- | :--- | :--- |
| **Inspect Uploaded Document** | 1. Open `/document-verification`.<br>2. Locate employee row.<br>3. Click **View Document** (Eye icon). | Fetches presigned download URL (`getHrDownloadUrl`) and opens document file in a new browser tab. | [`DocumentVerificationView.tsx:L98-L107`](file:///d:/hrms/src/sections/hr/documents-verification/DocumentVerificationView.tsx#L98-L107) |
| **Approve Document** | 1. Locate pending document row.<br>2. Click **Approve** (Green check icon). | Document status updates to verified. Row disappears from pending queue and toast displays `"Document approved successfully"`. | [`DocumentVerificationView.tsx:L109-L125`](file:///d:/hrms/src/sections/hr/documents-verification/DocumentVerificationView.tsx#L109-L125) |
| **Reject Document** | 1. Click **Reject** (Red close icon).<br>2. Enter Remarks: `"Document image blurry"`.<br>3. Click **`[ Reject ]`**. | Modal closes. Document status updates to rejected. Row disappears from queue and toast displays `"Document rejected"`. | [`DocumentVerificationView.tsx:L133-L155`](file:///d:/hrms/src/sections/hr/documents-verification/DocumentVerificationView.tsx#L133-L155) |

---

#### ⚠️ Validation Errors to Test

| Field / Constraint | Trigger Condition | Expected Error Message | Code Reference |
| :--- | :--- | :--- | :--- |
| **Missing Document ID Query** | Attempting to verify or download without a valid document ID | Backend returns `400 Bad Request` or `404 Not Found`. | [`DocumentVerificationView.tsx:L118`](file:///d:/hrms/src/sections/hr/documents-verification/DocumentVerificationView.tsx#L118) |

---

#### ❌ Error / Failure Cases

| Scenario | Trigger Condition | Expected Behavior | Code Reference |
| :--- | :--- | :--- | :--- |
| **Server Error on Document Verification (500)** | Network or database error during document approval/rejection | Red Alert banner displays: `"Failed to approve document"` or `"Failed to reject document"`. | [`DocumentVerificationView.tsx:L118-L122`](file:///d:/hrms/src/sections/hr/documents-verification/DocumentVerificationView.tsx#L118-L122) |
| **Empty Verification Queue** | No pending employee documents require HR review | Renders empty state card featuring `<HourglassEmptyOutlinedIcon />`, title `"No pending documents to verify"`, subtext `"All documents have been reviewed"`. | [`DocumentVerificationView.tsx:L180-L189`](file:///d:/hrms/src/sections/hr/documents-verification/DocumentVerificationView.tsx#L180-L189) |

---

#### 🛡️ Role-Based Access & Restrictions

| Role Slug | Can Access `/document-verification`? | Access Scope & Actions Available | Code Reference |
| :--- | :---: | :--- | :--- |
| **`ORG_ADMIN`** | ✅ Full Access | Full access to inspect, approve, or reject employee documents. | [`index.tsx:L178-L184`](file:///d:/hrms/src/routes/index.tsx#L178-L184) |
| **`HR_ADMIN`** | ✅ Full Access | Full access to `/document-verification` queue (`permission: "document.read"`) to review employee documents. | [`index.tsx:L178-L184`](file:///d:/hrms/src/routes/index.tsx#L178-L184) |
| **`BRANCH_ADMIN`** | ✅ Branch Scope | Access to `/document-verification` to review branch employee documents. | [`index.tsx:L178-L184`](file:///d:/hrms/src/routes/index.tsx#L178-L184) |
| **`LEADERSHIP`** | ✅ Read Access | Can view employee documents in verification queue. | [`index.tsx:L178-L184`](file:///d:/hrms/src/routes/index.tsx#L178-L184) |
| **`MANAGER`** | ✅ Team Scope | Access to `/document-verification` for team members if assigned `document.read`. | [`index.tsx:L178-L184`](file:///d:/hrms/src/routes/index.tsx#L178-L184) |
| **`PRODUCT_MANAGER`** | ✅ Permission-Based | Access determined by `document.read` permission. | [`index.tsx:L178-L184`](file:///d:/hrms/src/routes/index.tsx#L178-L184) |
| **`EMPLOYEE`** | ❌ Blocked | Route `/document-verification` is blocked by `<RoleGuard permission="document.read">`. Employees cannot verify or reject documents. | [`index.tsx:L178-L184`](file:///d:/hrms/src/routes/index.tsx#L178-L184) |

---

