export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  const cvmsUrl = process.env.VITE_CVMS_URL
  if (!cvmsUrl) {
    return Response.json({ error: 'CVMS_URL not configured' }, { status: 500 })
  }

  try {
    const { search } = new URL(request.url)
    const upstream = await fetch(`${cvmsUrl}${search}`, { signal: request.signal })
    const data = await upstream.arrayBuffer()
    return new Response(data, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
    })
  } catch {
    return Response.json({ error: 'Failed to reach CVMS' }, { status: 502 })
  }
}
