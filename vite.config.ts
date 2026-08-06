import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('@fullcalendar')) {
              return 'vendor-calendar';
            }
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('@reduxjs') || id.includes('redux')) {
              return 'vendor-redux';
            }
            if (id.includes('axios') || id.includes('zod') || id.includes('react-hook-form') || id.includes('sonner')) {
              return 'vendor-utils';
            }
          }
        }
      }
    }
  },
  server: {
    watch: {
      ignored: ['**/hrms-backend/**'],
    },
    proxy: {},
  },
});