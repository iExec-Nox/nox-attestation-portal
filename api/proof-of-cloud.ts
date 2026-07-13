export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const pocUrl = process.env.PROOF_OF_CLOUD_URL || process.env.VITE_PROOF_OF_CLOUD_URL
  if (!pocUrl) {
    return Response.json({ error: 'PROOF_OF_CLOUD_URL not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { quote } = body

    if (!quote) {
      return Response.json({ error: 'Missing quote' }, { status: 400 })
    }

    const upstream = await fetch(pocUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote }),
      signal: request.signal,
    })

    const data = await upstream.json()
    return Response.json(data, { status: upstream.status })
  } catch {
    return Response.json({ error: 'Failed to reach Proof of Cloud server' }, { status: 502 })
  }
}
