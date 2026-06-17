/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcovonly'],
      reportsDirectory: './coverage',

      include: ['src/**/*.{ts,tsx}'],

      exclude: [
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/assets/**',
        'src/components/*Page.tsx',
        'src/components/*Modal.tsx',
        'src/components/BuildingDetails.tsx',
        'src/components/BuildingFinances.tsx',
        'src/components/BuildingFinancesReal.tsx',
        'src/components/Sidebar.tsx',
        'src/components/TopBar.tsx',
        'src/components/ItemDetailsModal.tsx',
        'src/App.tsx',
        'src/services/api.ts',
        'src/services/authService.ts',
        'src/services/condominiumService.ts',
        'src/services/reportService.ts',
        'src/services/attachmentService.ts',
        'src/utils/customAlert.ts',
        'src/data/**',
      ],

      thresholds: {
        lines: 30,
        functions: 30,
        branches: 30,
        statements: 30,
      },
    },
  },
})