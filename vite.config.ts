import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Run `vercel dev` (defaults to port 3000) alongside `npm run dev` to
    // serve /api locally — vite dev alone can't execute the serverless functions.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
