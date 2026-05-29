import { ComponentDetail } from './ComponentDetail.tsx'
import { type Status } from '../../shared/ui/index.tsx'
import type { AttestationResult, CvmInfo, InstanceInfo, StepResult } from '../types/index.ts'

interface ComponentViewProps {
  cvm: CvmInfo
  selectedInstance: InstanceInfo | null
  getInstanceStatus: (instanceId: string) => Status
  getInstanceLastVerified: (instanceId: string) => number | null
  getInstanceQuote: (instanceId: string) => string | undefined
  getInstanceSteps: (instanceId: string) => StepResult[] | null
  getInstanceResult: (instanceId: string) => AttestationResult | null
  isInstanceQuoteLoading: (instanceId: string) => boolean
  onVerifyInstance: (instance: InstanceInfo) => void
}

export function ComponentView({
  cvm,
  selectedInstance,
  getInstanceStatus,
  getInstanceLastVerified,
  getInstanceQuote,
  getInstanceSteps,
  getInstanceResult,
  isInstanceQuoteLoading,
  onVerifyInstance,
}: Readonly<ComponentViewProps>) {
  return (
    <ComponentDetail
      cvm={cvm}
      selectedInstance={selectedInstance}
      getInstanceStatus={getInstanceStatus}
      getInstanceLastVerified={getInstanceLastVerified}
      getInstanceQuote={getInstanceQuote}
      getInstanceSteps={getInstanceSteps}
      getInstanceResult={getInstanceResult}
      isInstanceQuoteLoading={isInstanceQuoteLoading}
      onVerifyInstance={onVerifyInstance}
    />
  )
}
