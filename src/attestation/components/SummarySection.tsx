import { MatIcon } from '../../shared/ui/index.tsx'
import type { AttestationResult } from '../types/index.ts'

interface SummarySectionProps {
  result: AttestationResult
}

export function SummarySection({ result }: Readonly<SummarySectionProps>) {
  return (
    <>
      {result.status === 'failed' && result.errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 14,
            border: '1px solid rgba(248,113,113,0.30)',
            background: 'rgba(248,113,113,0.08)',
          }}
        >
          <MatIcon
            name="error"
            size={18}
            style={{ color: '#F87171', flexShrink: 0, marginTop: 1 }}
          />
          <div>
            <p style={{ font: '700 13px/18px var(--ct-font-display)', color: '#FCA5A5' }}>
              Attestation Failed
            </p>
            <p
              style={{
                font: '400 12px/18px var(--ct-font-ui)',
                color: 'rgba(252,165,165,0.75)',
                marginTop: 3,
              }}
            >
              {result.errorMessage}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
