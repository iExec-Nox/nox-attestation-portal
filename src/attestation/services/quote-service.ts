import type { CvmInfo } from '../types/index.ts'

const CVMS_URL = '/api/cvms'

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
