import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pouchdb-browser', 'events'],
    exclude: ['pouchdb'],
  },
  resolve: {
    dedupe: ['events'],
  },
  define: {
    global: 'window',
  },
})
