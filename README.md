# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

folder structure 
src/
│
├── api/
│   ├── axios.ts
│   ├── auth.api.ts
│   ├── employee.api.ts
│   ├── leave.api.ts
│   ├── attendance.api.ts
│   └── payroll.api.ts
│
├── assets/
│   ├── icons/
│   ├── images/
│   ├── logos/
│   └── fonts/
│
├── auth/
│   ├── components/
│   ├── context/
│   ├── guards/
│   ├── hooks/
│   ├── utils/
│   ├── views/
│   └── types.ts
│
├── components/
│   ├── button/
│   ├── input/
│   ├── modal/
│   ├── table/
│   ├── drawer/
│   ├── datepicker/
│   ├── upload/
│   ├── snackbar/
│   ├── loader/
│   ├── pagination/
│   ├── tooltip/
│   ├── avatar/
│   ├── breadcrumbs/
│   └── charts/
│
├── hooks/
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   ├── usePermissions.ts
│   └── useTenant.ts
│
├── layouts/
│   ├── auth/
│   ├── dashboard/
│   ├── simple/
│   ├── public/
│   ├── components/
│   └── nav/
│
├── pages/
│
│   ├── auth/
│   │   ├── Login/
│   │   ├── ForgotPassword/
│   │   └── ResetPassword/
│   │
│   ├── dashboard/
│   │
│   ├── employees/
│   │
│   ├── attendance/
│   │
│   ├── leave/
│   │
│   ├── payroll/
│   │
│   ├── branches/
│   │
│   ├── departments/
│   │
│   ├── designations/
│   │
│   ├── holidays/
│   │
│   ├── shifts/
│   │
│   ├── reports/
│   │
│   ├── settings/
│   │
│   ├── profile/
│   │
│   ├── unauthorized/
│   │
│   └── not-found/
│
├── routes/
│   ├── components/
│   ├── guards/
│   ├── paths.ts
│   └── index.tsx
│
├── sections/
│
│   ├── dashboard/
│
│   ├── employees/
│   │   ├── employee-list/
│   │   ├── employee-create/
│   │   ├── employee-edit/
│   │   ├── employee-details/
│   │   └── components/
│   │
│   ├── attendance/
│   │   ├── attendance-list/
│   │   ├── attendance-regularization/
│   │   └── components/
│   │
│   ├── leave/
│   │   ├── leave-list/
│   │   ├── leave-apply/
│   │   ├── leave-policy/
│   │   ├── leave-balance/
│   │   ├── leave-approval/
│   │   └── components/
│   │
│   ├── payroll/
│   │   ├── salary-structure/
│   │   ├── payroll-run/
│   │   ├── payslips/
│   │   └── components/
│   │
│   ├── branches/
│   │
│   ├── departments/
│   │
│   ├── designations/
│   │
│   ├── holidays/
│   │
│   ├── shifts/
│   │
│   ├── reports/
│   │
│   ├── settings/
│   │
│   └── profile/
│
├── services/
│   ├── token.service.ts
│   ├── storage.service.ts
│   └── permission.service.ts
│
├── store/
│
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── authThunk.ts
│   │   └── index.ts
│   │
│   ├── employee/
│   │   ├── employeeSlice.ts
│   │   ├── employeeThunk.ts
│   │   └── index.ts
│   │
│   ├── leave/
│   │   ├── leaveSlice.ts
│   │   ├── leaveThunk.ts
│   │   └── index.ts
│   │
│   ├── attendance/
│   │   ├── attendanceSlice.ts
│   │   ├── attendanceThunk.ts
│   │   └── index.ts
│   │
│   ├── payroll/
│   │   ├── payrollSlice.ts
│   │   ├── payrollThunk.ts
│   │   └── index.ts
│   │
│   ├── store.ts
│   └── rootReducer.ts
│
├── theme/
│   ├── create-theme.ts
│   ├── theme-provider.tsx
│   ├── theme-config.ts
│   └── overrides/
│
├── types/
│   ├── common.ts
│   ├── api.ts
│   ├── auth.ts
│   └── tenant.ts
│
├── utils/
│   ├── constants.ts
│   ├── regex.ts
│   ├── permissions.ts
│   ├── format-date.ts
│   ├── format-currency.ts
│   └── handle-api-error.ts
│
├── App.tsx
├── main.tsx
├── global.css
└── vite-env.d.ts
```