import { MatIcon } from '../../shared/ui/index.tsx'

export function EmptyState() {
  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
      }}
    >
      {/* Hero */}
      <div
        style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--ct-brand-tint-18)',
            border: '1px solid var(--ct-brand-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ct-brand)',
            flexShrink: 0,
          }}
        >
          <MatIcon name="verified_user" size={26} />
        </div>
        <div>
          <span
            style={{
              font: '700 20px/26px var(--ct-font-display)',
              color: 'var(--ct-fg-1)',
              letterSpacing: '-0.2px',
              display: 'block',
            }}
          >
            Intel TDX Attestation
          </span>
          <span
            style={{
              font: '400 13px/20px var(--ct-font-ui)',
              color: 'var(--ct-fg-4)',
              display: 'block',
              marginTop: 4,
            }}
          >
            NOX components run inside Intel TDX secure enclaves. This portal lets you verify their
            attestation — cryptographic proof, signed by Intel, that the right application is
            running in a genuine TDX environment.
          </span>
        </div>
      </div>

      {/* CTA banner */}
      <div
        style={{
          borderTop: '1px solid rgba(116,142,255,0.14)',
          background: 'rgba(116,142,255,0.04)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--ct-brand-tint-18)',
            border: '1px solid var(--ct-brand-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ct-brand)',
            flexShrink: 0,
          }}
        >
          <MatIcon name="arrow_back" size={14} />
        </div>
        <span style={{ font: '500 13px/1 var(--ct-font-ui)', color: 'var(--ct-fg-3)' }}>
          Select a component from the left panel to begin
        </span>
      </div>
    </div>
  )
}
