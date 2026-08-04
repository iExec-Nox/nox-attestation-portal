/* ── StatusBadge ── */
export type Status = 'verified' | 'failed' | 'verifying' | 'pending'

const BADGE_MAP: Record<
  Status,
  { label: string; dot: string; fg: string; bg: string; border: string }
> = {
  verified: {
    label: 'Verified',
    dot: 'var(--ct-success)',
    fg: 'var(--ct-success-light)',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
  },
  failed: {
    label: 'Failed',
    dot: '#F87171',
    fg: '#FCA5A5',
    bg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.30)',
  },
  verifying: {
    label: 'Verifying',
    dot: 'var(--ct-brand)',
    fg: 'var(--ct-indigo-200)',
    bg: 'var(--ct-brand-tint-18)',
    border: 'var(--ct-brand-border)',
  },
  pending: {
    label: 'Pending',
    dot: 'var(--ct-fg-5)',
    fg: 'var(--ct-fg-4)',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.10)',
  },
}

export const StatusBadge = ({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'lg' }) => {
  const s = BADGE_MAP[status] ?? BADGE_MAP.pending
  const big = size === 'lg'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: big ? 8 : 6,
        padding: big ? '6px 12px' : '3px 9px',
        borderRadius: 9999,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.fg,
        font: `700 ${big ? 12 : 11}px/1 var(--ct-font-ui)`,
        letterSpacing: '0.4px',
        textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const,
      }}
    >
      <span
        style={{
          width: big ? 7 : 6,
          height: big ? 7 : 6,
          borderRadius: 9999,
          background: s.dot,
          boxShadow: status === 'verifying' ? undefined : `0 0 0 3px ${s.dot}22`,
          animation: status === 'verifying' ? 'badge-pulse 1.2s ease-in-out infinite' : undefined,
        }}
      />
      {s.label}
    </span>
  )
}
