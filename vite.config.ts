import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Short commit SHA on Vercel builds (attached to Report a problem reports), 'dev' locally.
    __APP_VERSION__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'),
  },
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
