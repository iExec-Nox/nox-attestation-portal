import { MatIcon } from '../../shared/ui/index.tsx'
import type { AttestationResult } from '../types/index.ts'

interface SummarySectionProps {
  result: AttestationResult
}

function getRemediationHint(msg: string): string {
  if (/rtmr3.*mismatch|replay mismatch/i.test(msg))
    return 'The event log does not reproduce the attested RTMR3 value. This may indicate the workload configuration changed after the last boot, or that the event log was tampered with.'
  if (/compose.*hash.*mismatch/i.test(msg))
    return 'The docker-compose manifest hash does not match the attested value. Verify that no unauthorized changes were made to the workload definition.'
  if (/report.*data.*mismatch/i.test(msg))
    return 'The freshness challenge was not found in the quote. This could indicate a replay attack or a proxy intercepting the quote request.'
  if (/os-image-hash|os.*image/i.test(msg))
    return 'The OS image hash was not found in the event log. Ensure the CVM was booted with the expected DStack OS image.'
  if (/quote.*rejected|not verified|success.*false/i.test(msg))
    return 'The hardware quote was rejected by the remote verifier. The machine may not be running genuine Intel TDX hardware, or the TCB level may require a firmware update.'
  if (/fetch|network|connection|ECONNREFUSED/i.test(msg))
    return 'The CVM endpoint could not be reached. Verify the component is running and the network path is open.'
  return 'Review the step details below to locate the exact failure point. Contact the NOX team if the issue persists.'
}

export function SummarySection({ result }: Readonly<SummarySectionProps>) {
  if (result.status !== 'failed' || !result.errorMessage) return null

  const hint = getRemediationHint(result.errorMessage)

  return (
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
      <MatIcon name="error" size={18} style={{ color: '#F87171', flexShrink: 0, marginTop: 2 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ font: '700 13px/18px var(--ct-font-display)', color: '#FCA5A5', margin: 0 }}>
          Attestation Failed
        </p>
        <p
          style={{
            font: '500 12px/18px var(--ct-font-mono)',
            color: 'rgba(252,165,165,0.85)',
            margin: 0,
          }}
        >
          {result.errorMessage}
        </p>
        <p
          style={{
            font: '400 12px/18px var(--ct-font-ui)',
            color: 'rgba(252,165,165,0.6)',
            margin: 0,
          }}
        >
          {hint}
        </p>
      </div>
    </div>
  )
}
