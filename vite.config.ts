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
          // More specific first: the on-demand attestation endpoint keeps its
          // `/attestations` suffix. It must precede `/api/cvms` (a prefix of it),
          // whose rewrite would otherwise strip the suffix. Dev-only — `vite build`
          // ignores `server`, so this has no effect on the Vercel deployment.
          '/api/cvms/attestations': {
            target: cvmsUrl.origin,
            changeOrigin: true,
            rewrite: () => `${cvmsUrl.pathname.replace(/\/$/, '')}/attestations`,
          },
          '/api/cvms': {
            target: cvmsUrl.origin,
            changeOrigin: true,
            // Preserve the incoming query string — only the path is rewritten to
            // the configured CVMS endpoint.
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
