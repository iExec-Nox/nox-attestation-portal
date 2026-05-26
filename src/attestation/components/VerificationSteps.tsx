import { StepList } from './StepList.tsx'
import { MatIcon, PrimaryCTA, type Status } from '../../shared/ui/index.tsx'
import type { ComponentRecord, StepResult } from '../types/index.ts'

function IdlePrompt({ onVerify }: Readonly<{ onVerify?: () => void }>) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 280,
        borderRadius: 18,
        border: '1px dashed rgba(116,142,255,0.20)',
        background: 'rgba(116,142,255,0.03)',
        gap: 14,
      }}
    >
      <MatIcon name="shield" size={36} style={{ color: 'var(--ct-brand)', opacity: 0.5 }} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ font: '600 15px/22px var(--ct-font-display)', color: 'var(--ct-fg-3)' }}>
          Ready to attest
        </p>
        <p
          style={{ font: '400 13px/19px var(--ct-font-ui)', color: 'var(--ct-fg-5)', marginTop: 4 }}
        >
          Click &ldquo;Verify now&rdquo; to start the 6-step TDX verification pipeline
        </p>
      </div>
      {onVerify && (
        <PrimaryCTA icon="verified_user" onClick={onVerify} size="md">
          Verify now
        </PrimaryCTA>
      )}
    </div>
  )
}

export function VerificationSteps({
  status,
  steps,
  prevRecord,
  onVerify,
}: Readonly<{
  status: Status
  steps: StepResult[]
  prevRecord: ComponentRecord | null
  onVerify?: () => void
}>) {
  if (status === 'pending' && !prevRecord) return <IdlePrompt onVerify={onVerify} />
  const displaySteps = status === 'verifying' ? steps : (prevRecord?.result.steps ?? steps)
  return <StepList steps={displaySteps} />
}
