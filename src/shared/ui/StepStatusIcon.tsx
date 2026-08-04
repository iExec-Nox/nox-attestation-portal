import { MatIcon } from './MatIcon.tsx'

/* ── StepStatusIcon ── */
const STEP_STATUS_MAP: Record<
  string,
  { bg: string; border: string; color: string; icon: string; scale: number }
> = {
  verified: {
    bg: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.40)',
    color: 'var(--ct-success-light)',
    icon: 'check',
    scale: 0.62,
  },
  failed: {
    bg: 'rgba(248,113,113,0.12)',
    border: '1px solid rgba(248,113,113,0.45)',
    color: '#FCA5A5',
    icon: 'close',
    scale: 0.62,
  },
  verifying: {
    bg: 'var(--ct-brand-tint-18)',
    border: '1px solid var(--ct-brand)',
    color: 'var(--ct-brand)',
    icon: 'bolt',
    scale: 0.5,
  },
  pending: {
    bg: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'var(--ct-fg-5)',
    icon: 'schedule',
    scale: 0.52,
  },
}

export const StepStatusIcon = ({ status, size = 28 }: { status: string; size?: number }) => {
  const s = STEP_STATUS_MAP[status] ?? STEP_STATUS_MAP.pending
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        flexShrink: 0,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: s.bg,
        border: s.border,
        color: s.color,
      }}
    >
      {status === 'verifying' && (
        <span
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 9999,
            border: '2px solid transparent',
            borderTopColor: 'var(--ct-brand)',
            borderRightColor: 'var(--ct-brand)',
            animation: 'spin 0.9s linear infinite',
          }}
        />
      )}
      <MatIcon name={s.icon} size={size * s.scale} />
    </span>
  )
}
