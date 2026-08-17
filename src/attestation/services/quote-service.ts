import type { AttestationTarget, CvmInfo } from '../types/index.ts'

const CVMS_URL = '/api/cvms'
const ATTESTATIONS_URL = '/api/cvms/attestations'

/**
 * Fetches the lightweight CVM listing from the aggregator: active CVMs grouped by
 * app, each instance carrying only its `instance_id` and `machine_id` — no quote
 * or compose manifest. This keeps the initial page load small; attestation data
 * is fetched on demand via `fetchAttestations` when the user verifies.
 */
export async function fetchCvms(): Promise<CvmInfo[]> {
  const res = await fetch(CVMS_URL)
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
