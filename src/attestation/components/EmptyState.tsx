import { MatIcon } from '../../shared/ui/index.tsx'

const FEATURES = [
  { icon: 'draw', label: 'Quote signature', desc: 'Verified by Intel' },
  { icon: 'memory', label: 'RTMR replay', desc: 'SHA-384 chain' },
  { icon: 'tag', label: 'Image hash', desc: 'OS + Compose' },
]

export function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 32,
        textAlign: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(116,142,255,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: 72,
            height: 72,
            borderRadius: 20,
            background:
              'linear-gradient(135deg, rgba(116,142,255,0.14) 0%, rgba(116,142,255,0.06) 100%)',
            border: '1px solid rgba(116,142,255,0.22)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ct-brand)',
          }}
        >
          <MatIcon name="verified_user" size={32} />
        </div>
      </div>

      <div style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p
          style={{
            font: '700 22px/28px var(--ct-font-display)',
            color: 'var(--ct-fg-1)',
            letterSpacing: '-0.3px',
            margin: 0,
          }}
        >
          Intel TDX Attestation
        </p>
        <p style={{ font: '400 14px/22px var(--ct-font-ui)', color: 'var(--ct-fg-5)', margin: 0 }}>
          NOX components run inside Intel TDX secure enclaves. This portal lets you verify their
          attestation — cryptographic proof, signed by Intel, that the right application is running
          in a genuine TDX environment.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {FEATURES.map((f) => (
          <div
            key={f.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <MatIcon name={f.icon} size={14} style={{ color: 'var(--ct-brand)' }} />
            <span style={{ font: '600 12px/1 var(--ct-font-ui)', color: 'var(--ct-fg-3)' }}>
              {f.label}
            </span>
            <span
              style={{
                font: '500 11px/1 var(--ct-font-ui)',
                color: 'var(--ct-fg-6)',
                paddingLeft: 2,
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                marginLeft: 2,
              }}
            >
              {f.desc}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          borderRadius: 999,
          background: 'rgba(116,142,255,0.06)',
          border: '1px solid rgba(116,142,255,0.14)',
        }}
      >
        <MatIcon name="arrow_back" size={14} style={{ color: 'var(--ct-brand)' }} />
        <span style={{ font: '500 13px/1 var(--ct-font-ui)', color: 'var(--ct-fg-4)' }}>
          Select a component from the left panel to begin
        </span>
      </div>
    </div>
  )
}
