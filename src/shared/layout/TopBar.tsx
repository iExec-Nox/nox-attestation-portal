import { MatIcon, formatAgo } from '../ui/index.tsx'

interface TopBarProps {
  globalStatus: 'verified' | 'pending'
  lastChecked: number | null
  onRefresh: () => void
  refreshing: boolean
  onHome: () => void
}

export function TopBar({
  globalStatus,
  lastChecked,
  onRefresh,
  refreshing,
  onHome,
}: Readonly<TopBarProps>) {
  const allVerified = globalStatus === 'verified'

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

        {/* Global status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              lineHeight: 1.1,
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 9999,
                  background: allVerified ? 'var(--ct-success)' : 'var(--ct-warn)',
                  boxShadow: `0 0 0 4px ${allVerified ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)'}`,
                }}
              />
              <span
                style={{
                  font: '700 14px/18px var(--ct-font-display)',
                  color: 'var(--ct-fg-1)',
                  letterSpacing: '0.1px',
                }}
              >
                {allVerified ? 'All components verified' : 'Re-verification needed'}
              </span>
            </div>
            <span
              style={{
                font: '500 12px/16px var(--ct-font-ui)',
                color: 'var(--ct-fg-5)',
                marginTop: 3,
              }}
            >
              Last checked <span style={{ color: 'var(--ct-fg-3)' }}>{formatAgo(lastChecked)}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Re-verify selected component"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--ct-fg-3)',
              cursor: refreshing ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MatIcon
              name="refresh"
              size={18}
              style={{ animation: refreshing ? 'spin 0.9s linear infinite' : 'none' }}
            />
          </button>
        </div>
      </div>
    </header>
  )
}
