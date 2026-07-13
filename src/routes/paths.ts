export const paths = {
  auth: {
    login: "/login",
    signup: "/signup",
    checkEmail: "/check-email",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    activateAccount: "/activate-account",
  },

  dashboard: "/dashboard",

  settings: "/settings",

  departments: "/departments",
  designations: "/designations", // ✅
  branches: "/branches",
  holidays: "/holidays",

  employees: {
    directory: "/employees/directory",
    create: "/employees/create",
    list: "/employees/list",
  },

  attendance: "/attendance",
  leave: "/leave",
  payroll: "/payroll",

  profile: "/profile",
  attendanceRegularizations: "/attendance/regularizations",
  leaveApprovals: "/leave-approvals",

  unauthorized: "/unauthorized",
  notFound: "/404",
} as const;