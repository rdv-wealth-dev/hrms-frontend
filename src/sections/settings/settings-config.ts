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
};

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  { id: "master-data", label: "Master Data" },
  // future: { id: "company",       label: "Company Settings" },
  // future: { id: "roles",         label: "Roles & Permissions" },
  // future: { id: "notifications", label: "Notification Templates" },
  // future: { id: "security",      label: "Security Settings" },
  // future: { id: "audit",         label: "Audit Logs" },
];

export const SETTINGS_SUB_ITEMS: SettingsSubItem[] = [
  { id: "departments",  label: "Departments",  categoryId: "master-data" },
  { id: "designations", label: "Designations", categoryId: "master-data" },
  // future: { id: "grades",       label: "Grades / Bands",      categoryId: "master-data" },
  // future: { id: "locations",    label: "Locations",           categoryId: "master-data" },
  // future: { id: "branches",     label: "Business Units",      categoryId: "master-data" },
  // future: { id: "leave-types",  label: "Leave Types",         categoryId: "master-data" },
  // future: { id: "shift-master", label: "Shift Master",        categoryId: "master-data" },
];
