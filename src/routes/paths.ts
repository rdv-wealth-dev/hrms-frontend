export const paths = {
  auth: {
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },

  dashboard: '/dashboard',
  employees: '/employees',
  attendance: '/attendance',
  leave: '/leave',
  payroll: '/payroll',

  unauthorized: '/unauthorized',
  notFound: '/404',
} as const