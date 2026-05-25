import { MatIcon } from '../ui/index.tsx'

type GlobalStatus = 'idle' | 'verifying' | 'verified' | 'partial' | 'failed'

interface TopBarProps {
  total: number
  verifiedCount: number
  failedCount: number
  firstFailedName?: string
  verifying: boolean
  onRefresh: () => void
  onHome: () => void
}

const DOT: Record<GlobalStatus, { bg: string; glow: string }> = {
  idle: { bg: 'var(--ct-fg-6)', glow: 'rgba(255,255,255,0.08)' },
  verifying: { bg: 'var(--ct-brand)', glow: 'rgba(116,142,255,0.18)' },
  verified: { bg: 'var(--ct-success)', glow: 'rgba(16,185,129,0.18)' },
  partial: { bg: '#F59E0B', glow: 'rgba(245,158,11,0.18)' },
  failed: { bg: '#F87171', glow: 'rgba(248,113,113,0.18)' },
}

const LABEL_COLOR: Record<GlobalStatus, string> = {
  idle: 'var(--ct-fg-4)',
  verifying: 'var(--ct-brand)',
  verified: 'var(--ct-success-light)',
  partial: '#FCD34D',
  failed: '#FCA5A5',
}

function computeStatus(
  total: number,
  verifiedCount: number,
  failedCount: number,
  verifying: boolean,
): GlobalStatus {
  if (verifying) return 'verifying'
  if (!total) return 'idle'
  if (failedCount > 0) return 'failed'
  if (verifiedCount === total) return 'verified'
  if (verifiedCount > 0) return 'partial'
  return 'idle'
}

function statusLabel(
  s: GlobalStatus,
  total: number,
  verifiedCount: number,
  failedCount: number,
  firstFailedName?: string,
): string {
  switch (s) {
    case 'idle':
      return 'Not yet verified'
    case 'verifying':
      return 'Verifying…'
    case 'verified':
      return `All ${total} verified`
    case 'partial':
      return `${verifiedCount} of ${total} verified`
    case 'failed': {
      if (failedCount === 1 && firstFailedName) return `${firstFailedName} failed`
      const plural = failedCount > 1 ? 's' : ''
      return `${failedCount} component${plural} failed`
    }
  }
}

function refreshLabel(s: GlobalStatus): string {
  switch (s) {
    case 'idle':
      return 'Verify all'
    case 'verifying':
      return 'Verifying…'
    case 'verified':
      return 'Re-verify all'
    case 'partial':
      return 'Re-verify all'
    case 'failed':
      return 'Retry all'
  }
}

export function TopBar({
  total,
  verifiedCount,
  failedCount,
  firstFailedName,
  verifying,
  onRefresh,
  onHome,
}: Readonly<TopBarProps>) {
  const gs = computeStatus(total, verifiedCount, failedCount, verifying)
  const dot = DOT[gs]
  const disabled = gs === 'verifying' || total === 0

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(29,29,36,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          padding: '12px 28px',
          maxWidth: 1640,
          margin: '0 auto',
        }}
      >
        {/* Brand */}
        <button
          type="button"
          onClick={onHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--ct-brand-tint-18)',
              border: '1px solid var(--ct-brand-border)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ct-brand)',
              flexShrink: 0,
            }}
          >
            <MatIcon name="verified_user" size={18} />
          </div>
          <span
            style={{
              font: '800 15px/18px var(--ct-font-display)',
              letterSpacing: '0.1px',
              color: 'var(--ct-fg-1)',
            }}
          >
            Nox <span style={{ color: 'var(--ct-fg-5)', fontWeight: 600 }}>·</span> Attestation
            portal
          </span>
        </button>

        {/* Global status + action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              lineHeight: 1.1,
            }}
          >
            {/* Status row */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 9999,
                  background: dot.bg,
                  boxShadow: `0 0 0 4px ${dot.glow}`,
                  animation: gs === 'verifying' ? 'badge-pulse 1.2s ease-in-out infinite' : 'none',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  font: '700 14px/18px var(--ct-font-display)',
                  color: LABEL_COLOR[gs],
                  letterSpacing: '0.1px',
                }}
              >
                {statusLabel(gs, total, verifiedCount, failedCount, firstFailedName)}
              </span>
            </div>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={disabled}
            title={refreshLabel(gs)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'var(--ct-fg-2)',
              font: '600 13px/1 var(--ct-font-display)',
              letterSpacing: '0.1px',
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            <MatIcon
              name="refresh"
              size={16}
              style={{ animation: gs === 'verifying' ? 'spin 0.9s linear infinite' : 'none' }}
            />
            {refreshLabel(gs)}
          </button>
        </div>
      </div>
    </header>
  )
}
