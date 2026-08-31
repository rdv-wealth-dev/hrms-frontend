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
* **Route**: `/auth/sign-up`
* **Features**: Multi-field registration form with company domain assignment and country-based phone validation.
* **Testing Steps**:
  1. Click **Create an Account** on the Login screen.
  2. Fill in Company Name, Workspace URL, Team Size, Name, Email, Phone Number, and Password.
  3. Click **Register**.
* **Expected Result**: Account is created and confirmation screen/email prompt is displayed.
* **⚠️ Validation Errors to Test**:
  | Field | Trigger Condition | Expected Error Message |
  | :--- | :--- | :--- |
  | **Company Name** | Less than 2 chars | `"Company name must be at least 2 characters"` |
  | **Workspace URL** | Invalid characters or starts with hyphen | `"Only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen."` |
  | **Team Size** | Unselected dropdown | `"Please select your team size"` |
  | **First / Last Name** | Less than 2 chars | `"First name must be at least 2 characters"` |
  | **Phone** | Non-digits or > 10 digits | `"Phone number must contain digits only"` / `"Invalid phone number for the selected country"` |
  | **Password** | Less than 8 chars | `"Password must be at least 8 characters"` |
  | **Confirm Password** | Mismatched with Password | `"Passwords do not match"` |

---

### **1.2 Login Page**
* **Route**: `/auth/login`
* **Features**: Email & Password Login, Remember Me toggle, Forgot Password trigger.
* **Testing Steps**:
  1. Navigate to `/auth/login`.
  2. Enter valid credentials (e.g. `admin@company.com` / `Password123`).
  3. Click **Sign In**.
* **Expected Result**: Authenticates successfully and redirects to `/dashboard`.
* **⚠️ Validation Errors to Test**:
  | Field | Trigger Condition | Expected Error Message |
  | :--- | :--- | :--- |
  | **Email** | Leave blank | `"Email is required"` |
  | **Email** | Enter invalid format (e.g. `admin@com`) | `"Please enter a valid email"` |
  | **Password** | Leave blank | `"Password is required"` |

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

* **Route**: `/dashboard`
* **Overview**: Centralized command center for HR managers and employees.

### **Features & Testing**:
1. **KPI Metric Cards**:
   * View live top-level metrics: *Total Employees*, *Present Today*, *Leave Requests Pending*, *Upcoming Celebrations*.
   * Verify that KPI icons are compact (`26px` $\times$ `26px`) and subtext trends are properly colored.
2. **Weekly Attendance Trend Chart**:
   * View bar charts comparing daily present vs. absent vs. late counts.
3. **Today's Status Breakdown Widget**:
   * Inspect visual pie chart/breakdown of workforce status (On Time, Late, WFH, On Leave, Absent).
4. **Celebrations Card**:
   * Displays upcoming birthdays and work anniversaries for the current week.

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
