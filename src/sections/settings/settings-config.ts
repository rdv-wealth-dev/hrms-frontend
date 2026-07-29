// =============================================================
// Settings navigation config — single source of truth.
// To add a new settings section: add 1 entry here + 1 line in
// SettingsView's contentMap. Zero other files need to change.
// =============================================================

export type SettingsCategory = {
  id: string;
  label: string;
};

export type SettingsSubItem = {
  id: string;
  label: string;
  categoryId: string;
  permission?: string;
};

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  { id: "company", label: "Company Settings" },
  { id: "master-data", label: "Master Data" },
  // future: { id: "roles",         label: "Roles & Permissions" },
  // future: { id: "notifications", label: "Notification Templates" },
  // future: { id: "security",      label: "Security Settings" },
  // future: { id: "audit",         label: "Audit Logs" },
];

export const SETTINGS_SUB_ITEMS: SettingsSubItem[] = [
  { id: "org-profile",   label: "Organization Profile", categoryId: "company",     permission: "settings.read" },
  { id: "org-modules",   label: "Modules Activation",   categoryId: "company",     permission: "settings.read" },
  { id: "org-statutory", label: "Statutory Settings",   categoryId: "company",     permission: "settings.read" },
  { id: "org-documents", label: "Mandatory Documents",  categoryId: "company",     permission: "settings.read" },
  { id: "branches",      label: "Branches",             categoryId: "company",     permission: "branch.read"   },
  { id: "departments",   label: "Departments",          categoryId: "master-data", permission: "department.read" },
  { id: "designations", label: "Designations", categoryId: "master-data", permission: "designation.read" },
  // future: { id: "grades",       label: "Grades / Bands",      categoryId: "master-data" },
  // future: { id: "locations",    label: "Locations",           categoryId: "master-data" },
  // future: { id: "branches",     label: "Business Units",      categoryId: "master-data" },
  { id: "leave-types",  label: "Leave Types",         categoryId: "master-data", permission: "leave.read" },
  { id: "shift-master", label: "Shift Master",        categoryId: "master-data", permission: "attendance.read" },
];
