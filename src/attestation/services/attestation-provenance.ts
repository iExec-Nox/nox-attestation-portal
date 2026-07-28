import type { AttestedImage, CheckSlsaResult } from '../types/index.ts'

const ATTESTATION_URL = '/api/attestation'
// sigstore verification can be slow on a cold serverless start (TUF download).
const TIMEOUT_MS = 30000

/**
 * Cache of in-flight and resolved verifications, keyed by repos+digest. Since
 * the same image appears across every instance of a CVM (and across CVMs, e.g.
 * the shared sidecars), this collapses them to a single network request.
 * Failures are evicted so a later render can retry.
 */
const cache = new Map<string, Promise<CheckSlsaResult>>()

function cacheKey(attestationRepo: string, signingRepo: string, digest: string): string {
  return `${attestationRepo}|${signingRepo}|${digest}`
}

/**
 * Verifies the SLSA provenance of one image via the `/api/attestation` backend.
 * Never throws. Short-circuits third-party / non-digest-pinned images without a
 * network call. Deduplicates and caches successful results by repos+digest.
 */
export function fetchImageProvenance(image: AttestedImage): Promise<CheckSlsaResult> {
  if (image.verifiability !== 'verifiable' || !image.attestation) {
    return Promise.resolve({
      verified: false,
      reason: 'verification-failed',
      error: 'Image not covered by the attestation mapping',
    })
  }
  if (!image.digest) {
    return Promise.resolve({
      verified: false,
      reason: 'verification-failed',
      error: 'Image is not digest-pinned',
    })
  }

  const { attestationRepo, signingRepo } = image.attestation
  const key = cacheKey(attestationRepo, signingRepo, image.digest)

  const cached = cache.get(key)
  if (cached) return cached

  const promise = requestProvenance(attestationRepo, signingRepo, image.digest)
  cache.set(key, promise)
  // Keep only successful verifications cached; drop failures so they can retry.
  void promise.then((result) => {
    if (!result.verified) cache.delete(key)
  })
  return promise
}

/** Clears the provenance cache (used in tests). */
export function clearProvenanceCache(): void {
  cache.clear()
}

async function requestProvenance(
  attestationRepo: string,
  signingRepo: string,
  digest: string,
): Promise<CheckSlsaResult> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(ATTESTATION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digest, attestationRepo, signingRepo }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    const data = (await res.json().catch(() => null)) as CheckSlsaResult | { error?: string } | null

    if (!res.ok) {
      const message =
        data && 'error' in data && typeof data.error === 'string'
          ? data.error
          : `HTTP ${res.status}`
      return { verified: false, reason: 'request-failed', error: message }
    }
    if (!data || typeof (data as CheckSlsaResult).verified !== 'boolean') {
      return {
        verified: false,
        reason: 'request-failed',
        error: 'Malformed response from attestation endpoint',
      }
    }
    return data as CheckSlsaResult
  } catch (e) {
    const timedOut = e instanceof Error && e.name === 'AbortError'
    return {
      verified: false,
      reason: 'request-failed',
      error: timedOut ? 'Verification timed out' : 'Verification request failed',
    }
  }
}
