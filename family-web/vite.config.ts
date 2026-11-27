/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/bidovce/family/',
  plugins: [react(), tailwindcss()],
  test: { include: ['src/**/*.test.ts'] },
})
