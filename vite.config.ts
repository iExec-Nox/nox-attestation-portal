/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cvmsUrlRaw = env.CVMS_URL || env.VITE_CVMS_URL
  const cvmsUrl = cvmsUrlRaw ? new URL(cvmsUrlRaw) : null

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
            rewrite: () => cvmsUrl.pathname,
          },
        }),
        '/api/phala': {
          target: 'https://cloud-api.phala.network',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/phala/, '/api/v1/attestations'),
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
