/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cvmsUrl = env.CVMS_URL ? new URL(env.CVMS_URL) : null

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
      proxy: {
        ...(cvmsUrl && {
          '/api/cvms': {
            target: cvmsUrl.origin,
            changeOrigin: true,
            rewrite: () => cvmsUrl.pathname,
          },
        }),
        '/api/phala/verify': {
          target: 'https://cloud-api.phala.network',
          changeOrigin: true,
          rewrite: () => '/api/v1/attestations/verify',
        },
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
