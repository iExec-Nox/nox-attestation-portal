import { MatIcon } from '../ui/index.tsx'

interface TopBarProps {
  onHome: () => void
}

export function TopBar({ onHome }: Readonly<TopBarProps>) {
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
      </div>
    </header>
  )
}
