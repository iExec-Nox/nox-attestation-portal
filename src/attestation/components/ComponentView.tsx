import { ComponentDetail } from './ComponentDetail.tsx'
import { VerificationSteps } from './VerificationSteps.tsx'
import { AttestationReport } from './AttestationReport.tsx'
import { type Status } from '../../shared/ui/index.tsx'
import type { AttestationResult, ComponentRecord, CvmInfo, StepResult } from '../types/index.ts'

interface ComponentViewProps {
  cvm: CvmInfo
  steps: StepResult[]
  prevRecord: ComponentRecord | null
  displayedResult: AttestationResult | null
  status: Status
  lastVerified: number | null
  onVerify: () => void
}

export function ComponentView({
  cvm,
  steps,
  prevRecord,
  displayedResult,
  status,
  lastVerified,
  onVerify,
}: Readonly<ComponentViewProps>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ComponentDetail cvm={cvm} status={status} lastVerified={lastVerified} onVerify={onVerify} />
      <VerificationSteps
        status={status}
        steps={steps}
        prevRecord={prevRecord}
        onVerify={onVerify}
      />
      {displayedResult && <AttestationReport result={displayedResult} cvm={cvm} />}
    </div>
  )
}
