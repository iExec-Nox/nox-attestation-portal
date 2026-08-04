import { MatIcon } from './MatIcon.tsx'

/* ── ErrorState: red card for failed loads, with optional retry ── */
export const ErrorState = ({
  title = 'Something went wrong',
  message,
  icon = 'error',
  onRetry,
  retryLabel = 'Retry',
}: {
  title?: string
  message: string
  icon?: string
  onRetry?: () => void
  retryLabel?: string
}) => (
  <div
    role="alert"
    style={{
      padding: '16px 18px',
      borderRadius: 16,
      background: 'rgba(248,113,113,0.06)',
      border: '1px solid rgba(248,113,113,0.20)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
  >
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'rgba(248,113,113,0.12)',
          border: '1px solid rgba(248,113,113,0.25)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#F87171',
        }}
      >
        <MatIcon name={icon} size={16} />
      </div>
      <div>
        <div
          style={{
            font: '600 13px/18px var(--ct-font-display)',
            color: '#FCA5A5',
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            font: '400 12px/18px var(--ct-font-ui)',
            color: 'rgba(252,165,165,0.7)',
            overflowWrap: 'anywhere',
          }}
        >
          {message}
        </div>
      </div>
    </div>

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 30,
          padding: '0 12px',
          borderRadius: 8,
          background: 'rgba(248,113,113,0.10)',
          border: '1px solid rgba(248,113,113,0.25)',
          color: '#FCA5A5',
          font: '600 12px/1 var(--ct-font-display)',
          cursor: 'pointer',
          letterSpacing: '0.1px',
        }}
      >
        <MatIcon name="refresh" size={14} />
        {retryLabel}
      </button>
    )}
  </div>
)
