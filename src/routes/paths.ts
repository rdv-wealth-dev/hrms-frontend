export const paths = {
  auth: {
    login: "/login",
    signup: "/signup",
    checkEmail: "/check-email",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    activateAccount: "/activate-account",
    changePassword: "/change-password",
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
    detail: "/employees/:id",
  },

  attendance: "/attendance",
  leave: "/leave",
  payroll: {
    root: "/payroll",
    dashboard: "/payroll/dashboard",
    salaryComponents: "/payroll/salary-components",
    professionalTaxSlabs: "/payroll/professional-tax-slabs",
    structureTemplates: "/payroll/structure-templates",
    payCalendar: "/payroll/pay-calendar",
    bankPayoutFormat: "/payroll/bank-payout-format",
    payslipTemplates: "/payroll/payslip-templates",
    glMapping: "/payroll/gl-mapping",
    structureAssignment: "/payroll/structure-assignment",
    salaryStructureView: "/payroll/salary-structure-view",
  },

  profile: "/profile",
  onboarding: "/onboarding",
  attendanceRegularizations: "/attendance/regularizations",
  leaveApprovals: "/leave-approvals",
  reports: "/reports",
  documentVerification: "/hr/documents-verification",

  unauthorized: "/unauthorized",
  notFound: "/404",
} as const;