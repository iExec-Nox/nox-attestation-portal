/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cvmsUrlRaw = env.CVMS_URL || env.VITE_CVMS_URL
  const cvmsUrl = cvmsUrlRaw ? new URL(cvmsUrlRaw) : null

  const pocUrlRaw = env.PROOF_OF_CLOUD_URL || env.VITE_PROOF_OF_CLOUD_URL
  const pocUrl = pocUrlRaw ? new URL(pocUrlRaw) : null

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
      fs: {
        deny: ['api'],
      },
      proxy: {
        ...(cvmsUrl && {
          '/api/cvms': {
            target: cvmsUrl.origin,
            changeOrigin: true,
            // Preserve the incoming query string (e.g. `?challenge=…`) — only the
            // path is rewritten to the configured CVMS endpoint.
            rewrite: (path) => {
              const queryIndex = path.indexOf('?')
              const query = queryIndex === -1 ? '' : path.slice(queryIndex)
              return cvmsUrl.pathname + query
            },
          },
        }),
        ...(pocUrl && {
          '/api/proof-of-cloud': {
            target: pocUrl.origin,
            changeOrigin: true,
            rewrite: () => pocUrl.pathname,
          },
        }),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./test/setup.ts'],
    },
  }
})
