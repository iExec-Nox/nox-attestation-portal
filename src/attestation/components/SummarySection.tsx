import { MatIcon, SummaryRow, Verdict, Eyebrow } from '../../shared/ui/index.tsx'
import type { AttestationResult, CvmInfo } from '../types/index.ts'

interface SummarySectionProps {
  result: AttestationResult
  cvm: CvmInfo
  ok: boolean
  osImageHash: string
  composeHash: string
}

export function SummarySection({
  result,
  cvm,
  ok,
  osImageHash,
  composeHash,
}: Readonly<SummarySectionProps>) {
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

      <div
        style={{
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          padding: '18px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            <Eyebrow>Attestation Summary</Eyebrow>
            <div
              style={{
                font: '700 18px/24px var(--ct-font-display)',
                color: ok ? 'var(--ct-fg-1)' : '#FCA5A5',
                marginTop: 4,
              }}
            >
              Resolved values · {ok ? 'all matched' : 'verification failed'}
            </div>
          </div>
          <Verdict ok={ok} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SummaryRow label="App ID" value={cvm.app_id} ok={ok} />
          {cvm.instance && <SummaryRow label="Instance" value={cvm.instance} ok={ok} />}
          <SummaryRow label="Component" value={cvm.name} ok={ok} />
          <SummaryRow label="Provider" value="Phala Cloud · Intel TDX" ok={ok} />
          <SummaryRow label="Quote URL" value={cvm.url} ok={ok} link href={cvm.url} />
          {osImageHash && <SummaryRow label="OS Image Hash" value={osImageHash} ok={ok} copyable />}
          {composeHash && <SummaryRow label="Compose Hash" value={composeHash} ok={ok} copyable />}
        </div>
      </div>
    </>
  )
}
