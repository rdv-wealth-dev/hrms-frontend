// ===========================================
// Role slugs — must match backend RoleModel.slug exactly
// ===========================================

export const ROLES = {
  ORG_ADMIN: "ORG_ADMIN",
  HR_ADMIN: "HR_ADMIN",
  BRANCH_ADMIN: "BRANCH_ADMIN", // ✅ not yet seeded on backend — add here once it exists
  LEADERSHIP: "LEADERSHIP",
  MANAGER: "MANAGER",
  PRODUCT_MANAGER: "PRODUCT_MANAGER",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type RoleSlug = (typeof ROLES)[keyof typeof ROLES];

// ===========================================
// Common role groupings — reusable shortcuts
// Add more groups here as new shared permission patterns emerge
// ===========================================

export const ADMIN_ROLES: RoleSlug[] = [ROLES.ORG_ADMIN, ROLES.HR_ADMIN];

export const MANAGEMENT_ROLES: RoleSlug[] = [
  ROLES.ORG_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.BRANCH_ADMIN,
  ROLES.LEADERSHIP,
  ROLES.MANAGER,
  ROLES.PRODUCT_MANAGER,
];

export const ALL_ROLES: RoleSlug[] = Object.values(ROLES);