import type { AttestationTarget, CvmInfo } from '../types/index.ts'

const CVMS_URL = '/api/cvms'
const ATTESTATIONS_URL = '/api/cvms/attestations'

/**
 * Fetches the CVM list from the aggregator. The `challenge` (verifier nonce) is
 * relayed by the aggregator to each CVM's `/quote` endpoint, so the quotes
 * embedded in the response are bound to it. The response already carries each
 * instance's quote and compose manifest, so the UI never contacts the CVMs.
 */
export async function fetchCvms(challenge: string): Promise<CvmInfo[]> {
  const res = await fetch(`${CVMS_URL}?challenge=${encodeURIComponent(challenge)}`)
  if (!res.ok) throw new Error(`Failed to fetch CVMs: ${res.status} ${res.statusText}`)
  return res.json() as Promise<CvmInfo[]>
}

/**
 * Fetches attestation data (quote + compose manifest) for a caller-selected set
 * of instances. A **fresh** `challenge` (verifier nonce) is relayed by the
 * aggregator to each targeted CVM's `/quote` endpoint, binding the returned
 * quotes to it. Returns the same `CvmInfo[]` shape as the listing, grouped by
 * app, with each instance's `quote` and `app_compose` now populated.
 */
export async function fetchAttestations(
  challenge: string,
  instances: AttestationTarget[],
): Promise<CvmInfo[]> {
  const res = await fetch(ATTESTATIONS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challenge, instances }),
  })
  if (!res.ok) throw new Error(`Failed to fetch attestations: ${res.status} ${res.statusText}`)
  return res.json() as Promise<CvmInfo[]>
}
