import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ============================================================================
// Vite Configuration
// ============================================================================
//
// 🎓 LEARNING: The `proxy` setting is critical for full-stack development.
// Without it, the frontend (localhost:5173) can't talk to the backend (localhost:3000)
// because the browser blocks cross-origin requests (CORS).
//
// The proxy works by intercepting requests to /api/* and forwarding them to
// the backend server. The browser thinks it's talking to localhost:5173,
// but Vite secretly relays the request to localhost:3000.
//
// In production, you'd serve the frontend from the backend directly
// (or use a reverse proxy like Nginx), so this is dev-only.
// ============================================================================
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api will be forwarded to the Express backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Forward uploaded file requests to the backend too
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
