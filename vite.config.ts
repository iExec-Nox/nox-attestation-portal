/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import os from 'node:os'
import type { IncomingMessage, ServerResponse } from 'node:http'
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev-only middleware that serves POST /api/attestation by running the SLSA
 * verifier in-process. In production this route is a Vercel serverless function
 * (api/attestation.ts); vite does not run serverless functions, and this route
 * has no upstream to proxy to (it is compute, not a relay). Both paths call the
 * same api/_lib/check-slsa.ts, so dev and prod behave identically. This hook
 * only runs under `vite dev` — it is inert during build and never ships.
 */
function slsaDevApi(): Plugin {
  return {
    name: 'dev-api-attestation',
    configureServer(server) {
      server.middlewares.use('/api/attestation', (req: IncomingMessage, res: ServerResponse) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (req.method !== 'POST') {
          send(405, { error: 'Method not allowed' })
          return
        }

        let raw = ''
        req.on('data', (chunk) => (raw += chunk))
        req.on('end', () => {
          void (async () => {
            let body: { digest?: unknown; attestationRepo?: unknown; signingRepo?: unknown }
            try {
              body = raw ? JSON.parse(raw) : {}
            } catch {
              send(400, { error: 'Invalid JSON body' })
              return
            }

            const { digest, attestationRepo, signingRepo } = body
            if (
              typeof digest !== 'string' ||
              typeof attestationRepo !== 'string' ||
              typeof signingRepo !== 'string'
            ) {
              send(400, { error: 'Missing or invalid fields: digest, attestationRepo, signingRepo' })
              return
            }

            try {
              const { checkSlsa } = await import('./api/_lib/check-slsa.ts')
              const result = await checkSlsa({
                digest,
                attestationRepo,
                signingRepo,
                token: process.env.GITHUB_TOKEN,
                tufCachePath: resolve(os.tmpdir(), 'sigstore-tuf'),
              })
              send(200, result)
            } catch (e) {
              send(500, { verified: false, error: `Verification crashed: ${(e as Error).message}` })
            }
          })()
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cvmsUrlRaw = env.CVMS_URL || env.VITE_CVMS_URL
  const cvmsUrl = cvmsUrlRaw ? new URL(cvmsUrlRaw) : null

  const pocUrlRaw = env.PROOF_OF_CLOUD_URL || env.VITE_PROOF_OF_CLOUD_URL
  const pocUrl = pocUrlRaw ? new URL(pocUrlRaw) : null

  return {
    plugins: [react(), tailwindcss(), slsaDevApi()],
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
