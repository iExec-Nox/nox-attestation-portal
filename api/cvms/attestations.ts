export const config = { runtime: 'edge' }

/**
 * Relays `POST /api/cvms/attestations` to the aggregator's
 * `POST <VITE_CVMS_URL>/attestations`, forwarding the JSON body verbatim.
 * `VITE_CVMS_URL` points at the aggregator's `/cvms` endpoint, so the
 * attestation endpoint is derived by suffixing `/attestations`.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const cvmsUrl = process.env.VITE_CVMS_URL
  if (!cvmsUrl) {
    return Response.json({ error: 'CVMS_URL not configured' }, { status: 500 })
  }

  try {
    const body = await request.text()
    const upstream = await fetch(`${cvmsUrl}/attestations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: request.signal,
    })
    const data = await upstream.arrayBuffer()
    return new Response(data, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
    })
  } catch {
    return Response.json({ error: 'Failed to reach CVMS' }, { status: 502 })
  }
}
