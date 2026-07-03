export const paths = {
  auth: {
    login: "/login",
    signup: "/signup",
    checkEmail: "/check-email",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },

  dashboard: "/dashboard",

  settings: "/settings",

  departments: "/departments",
  designations: "/designations", // ✅

  employees: {
    directory: "/employees/directory",
  },

  attendance: "/attendance",
  leave: "/leave",
  payroll: "/payroll",

  unauthorized: "/unauthorized",
  notFound: "/404",
} as const;