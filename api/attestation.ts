import os from 'node:os'
import path from 'node:path'

import { checkSlsa } from './_lib/check-slsa.ts'

// sigstore-js needs Node (node:crypto, on-disk TUF cache), so this function
// runs on the Node.js runtime rather than the edge runtime used by the others.
export const config = { runtime: 'nodejs' }

// TUF trusted-root cache. Serverless filesystems are read-only except the temp
// dir, so keep the cache there (persists for the lifetime of a warm instance).
const TUF_CACHE_PATH = path.join(os.tmpdir(), 'sigstore-tuf')

interface AttestationRequestBody {
  digest?: unknown
  attestationRepo?: unknown
  signingRepo?: unknown
}

export default async function handler(request: Request): Promise<Response> {
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
      { verified: false, error: `Verification crashed: ${(e as Error).message}` },
      { status: 500 },
    )
  }
}
