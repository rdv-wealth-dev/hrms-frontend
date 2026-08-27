# 🚀 Enterprise HRMS — UI Navigation & Feature Testing Guide

Welcome to the **Enterprise HRMS User Operating & Testing Guide**. This document provides a step-by-step walkthrough for operating, navigating, and testing every module and feature within the application's user interface.

---

## 🌐 Local Environment & Access
* **Dev Server URL**: `http://localhost:5174/` (or `http://localhost:5173/`)
* **Framework**: React 19 + Vite + MUI v6

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

### **1.1 Login Page**
* **Route**: `/auth/login`
* **Features**: Email & Password Login, Remember Me, Forgot Password trigger.
* **Testing Steps**:
  1. Navigate to `/auth/login`.
  2. Enter valid credentials (e.g. `admin@company.com` / `Password123`).
  3. Click **Sign In**.
* **Expected Result**: Authenticates successfully and redirects to `/dashboard`. Validation messages appear if fields are empty.

### **1.2 Sign Up / User Registration**
* **Route**: `/auth/sign-up`
* **Features**: Multi-field registration form with company domain assignment.
* **Testing Steps**:
  1. Click **Create an Account** on the Login screen.
  2. Fill in First Name, Last Name, Work Email, Phone Number, and Password.
  3. Click **Register**.
* **Expected Result**: Account is created and confirmation screen/email prompt is displayed.

### **1.3 Password Recovery & Account Activation**
* **Routes**: `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/activate`
* **Testing Steps**:
  1. Click **Forgot Password?** on the login page.
  2. Enter your registered email address and submit.
* **Expected Result**: Password reset email simulation screen displays confirmation.

---

## 2. 📊 Main Dashboard & Quick Widgets

* **Route**: `/dashboard`
* **Overview**: Centralized command center for HR managers and employees.

### **Features & Testing**:
1. **KPI Metric Cards**:
   * View live top-level metrics: *Total Employees*, *Present Today*, *Leave Requests Pending*, *Upcoming Celebrations*.
   * Verify that KPI icons are compact and subtext trends are properly colored (green positive / red negative).
2. **Weekly Attendance Trend Chart**:
   * View bar charts comparing daily present vs. absent vs. late counts.
3. **Today's Status Breakdown Widget**:
   * Inspect visual pie chart/breakdown of workforce status (On Time, Late, WFH, On Leave, Absent).
4. **Celebrations Card**:
   * Displays upcoming birthdays and work anniversaries for the current week.

---

## 3. 👥 Employee Directory & People Hub

* **Route**: `/employees/directory`
* **Overview**: Complete workforce management hub with dual view modes (Table & Card Grid).

### **Features & Testing**:
1. **View Mode Switcher**:
   * Click **Grid View** icon to display employee cards with profile avatars, department tags, and direct email buttons.
   * Click **Table View** icon to display the high-performance **Virtualized Table**.
2. **Search & Multi-Filtering**:
   * Type any employee name or code in the **Search** input.
   * Click the **Filter Bar** to filter by Department, Designation, or Status (Active, Probation, Terminated).
3. **Add New Employee**:
   * Click **+ Add Employee** (`/employees/create`).
   * Complete Personal Details, Employment Information, Department/Designation assignment, and Emergency Contacts.
   * Click **Save Employee**.
4. **Employee Profile Tabs (`/employees/profile/:id`)**:
   * Click on any employee row to open their 360-degree profile.
   * Test tab navigation:
     - **Overview**: Personal summary & reporting hierarchy.
     - **Personal Info**: Contact details & emergency contacts.
     - **Attendance Log**: Individual check-in/out records.
     - **Leave History**: Leave balances & past applications.
     - **Documents**: Uploaded ID proofs & contracts.
     - **Payroll**: Salary structure & pay slips.

---

## 4. ⏰ Attendance & Time Tracking

* **Routes**: `/attendance`, `/reports`, `/attendance/regularizations`

### **4.1 Real-Time Check-In / Check-Out**
* **Route**: `/attendance`
* **Testing Steps**:
  1. Click the **Punch In** button.
  2. Observe current timestamp and location log update.
  3. Click **Punch Out** at end of test.

### **4.2 Attendance Reports & Punch Log Table**
* **Route**: `/reports`
* **Features & Testing**:
  1. **Date Range Filter**: Select **From Date** and **To Date** to filter attendance entries.
  2. **Punch Log Data Table**:
     * Verify table headers: `S.NO.`, `EMPLOYEE CODE`, `EMPLOYEE NAME`, `PUNCH LOG`, `PUNCH DATE`.
     * Verify **NO internal vertical scrollbar** (smooth natural height with 10 rows per page).
     * Click **Export** to download the CSV report.
  3. **Row Detail Modal**:
     * Click on any row to open the **Attendance Details** modal.

### **4.3 Attendance Regularization Requests**
* **Route**: `/attendance/regularizations`
* **Features & Testing**:
  1. Click **+ Request Regularization** to apply for missed punch adjustments.
  2. Managers can review pending regularization requests and click **Approve** or **Reject**.

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

### **7.2 Designations Management (`/designations`)**
* **Testing Steps**:
  1. View designations directory.
  2. Click **+ Add Designation** to configure job titles and pay bands.

### **7.3 Branch Management (`/branches`)**
* **Testing Steps**:
  1. View office branch locations (e.g. Headquarters, Regional Offices).
  2. Add new branch address, timezone, and working hours.

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

---

## 9. 📋 Onboarding & Document Verification

* **Route**: `/onboarding`

### **Features & Testing**:
1. **Onboarding Pipeline**:
   * Track status of new hires (*Pending Documents*, *Verification in Progress*, *Completed*).
2. **Document Verification Modal**:
   * Click on any new joiner record to preview submitted ID proofs (Aadhaar, PAN, Passport).
   * Click **Verify** or **Request Resubmission**.

---

## 💡 Quick Tips for Testers
> [!TIP]
> **Performance Verification**: All major data tables (Employee Directory, Attendance Log, Leave Requests) use **Virtualization**. Open Chrome DevTools (`F12` $\rightarrow$ `Elements`) while scrolling to verify sub-16ms frame rates and zero DOM bloat.

> [!NOTE]
> **Responsive Layouts**: Resize your browser window or switch to mobile view (`< 600px`). The app automatically switches table views into compact mobile cards.
