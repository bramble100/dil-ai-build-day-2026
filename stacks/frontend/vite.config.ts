import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // API_PROXY_TARGET is intentionally not VITE_-prefixed: it's only needed
  // by the dev server (Node.js), never exposed to the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.API_PROXY_TARGET

  return {
    plugins: [react()],
    server: apiProxyTarget
      ? {
          proxy: {
            '/api-proxy': {
              target: apiProxyTarget,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api-proxy/, ''),
            },
          },
        }
      : undefined,
  }
})
