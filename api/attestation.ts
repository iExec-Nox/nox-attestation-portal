import os from 'node:os'
import path from 'node:path'

// Vercel runs this file as compiled JS via Node's own ESM loader (no Vite/esbuild
// bundling step), which resolves imports against what's actually on disk after
// transpilation — so this must reference the .js output, not the .ts source
// (unlike src/, which Vite bundles and can use .ts specifiers directly).
import { checkSlsa } from './_lib/check-slsa.js'

// sigstore-js needs Node (node:crypto, on-disk TUF cache), so this function
// runs on the Node.js runtime rather than the edge runtime used by the others.
export const config = { runtime: 'nodejs' }

// TUF trusted-root cache. Serverless filesystems are read-only except the temp
// dir, so keep the cache there (persists for the lifetime of a warm instance).
const TUF_CACHE_PATH = path.join(os.tmpdir(), 'sigstore-tuf')

// sigstore-js pulls in a heavy fetch/cache stack (tuf-js, make-fetch-happen)
// that isn't designed for ephemeral serverless filesystems. A promise
// rejecting outside our own try/catch (e.g. a background retry) would
// otherwise crash the whole function process (Node's default for unhandled
// rejections) instead of surfacing as a normal 500 response. Log and survive.
process.on('unhandledRejection', (reason) => {
  console.error('[api/attestation] Unhandled rejection:', reason)
})

interface AttestationRequestBody {
  digest?: unknown
  attestationRepo?: unknown
  signingRepo?: unknown
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let body: AttestationRequestBody
  try {
    body = (await request.json()) as AttestationRequestBody
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { digest, attestationRepo, signingRepo } = body
  if (
    typeof digest !== 'string' ||
    typeof attestationRepo !== 'string' ||
    typeof signingRepo !== 'string'
  ) {
    return Response.json(
      { error: 'Missing or invalid fields: digest, attestationRepo, signingRepo are required' },
      { status: 400 },
    )
  }

  try {
    const result = await checkSlsa({
      digest,
      attestationRepo,
      signingRepo,
      token: process.env.GITHUB_TOKEN,
      tufCachePath: TUF_CACHE_PATH,
    })
    // The verification ran: return 200 with { verified: true|false, … }.
    return Response.json(result, { status: 200 })
  } catch (e) {
    return Response.json(
      { verified: false, reason: 'request-failed', error: `Verification crashed: ${(e as Error).message}` },
      { status: 500 },
    )
  }
}

// Vercel's Node.js runtime (unlike its edge runtime) only recognizes the Web
// fetch-style handler through this `{ fetch }` object shape or named HTTP-method
// exports (e.g. `export function POST`) — a bare `export default function`, which
// works fine under runtime: 'edge', is silently treated as the legacy Node
// `(req, res) => void` signature here, so our returned Response is discarded and
// the request hangs until Vercel's own function timeout.
export default { fetch: handler }
