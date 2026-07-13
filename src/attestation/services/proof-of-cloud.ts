const PROOF_OF_CLOUD_URL = '/api/proof-of-cloud'

/**
 * Check whether the attested machine is whitelisted by the Proof of Cloud
 * trust-server. Non-blocking: returns false if the server is unavailable or
 * the request times out, never throws.
 */
export async function checkProofOfCloud(quoteHex: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(PROOF_OF_CLOUD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote: quoteHex }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    if (!res.ok) return false
    const data = await res.json()
    return data.whitelisted === true
  } catch {
    return false
  }
}
