import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://yeochoi.github.io/stay-counter/
export default defineConfig({
  base: '/stay-counter/',
  plugins: [react()],
})
