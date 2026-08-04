/* ── Time helpers ── */
export function formatAgo(ts: number | null | undefined): string {
  if (!ts) return '—'
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'Just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function truncHash(h: string | undefined, head = 6, tail = 4): string {
  if (!h) return ''
  if (h.length <= head + tail + 2) return h
  return h.slice(0, head + 2) + '…' + h.slice(-tail)
}
