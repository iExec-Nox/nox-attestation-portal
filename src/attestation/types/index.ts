export interface CvmInfo {
  app_id: string
  name: string
  url: string
  instance?: string
}

export interface EventLogEntry {
  imr: number
  event_type: number
  event: string
  event_payload: string
  digest: string
}

export interface QuoteApiResponse {
  quote: string
  event_log: EventLogEntry[]
}

export interface AppInfoApiResponse {
  app_compose?: string
}

export interface TdxQuoteBody {
  mrconfig: string
  mrowner: string
  mrownerconfig: string
  mrseam: string
  mrsignerseam: string
  mrtd: string
  reportdata: string
  rtmr0: string
  rtmr1: string
  rtmr2: string
  rtmr3: string
  seamattributes: string
  tdattributes: string
  tee_tcb_svn: string
  xfam: string
}

export interface TdxQuoteHeader {
  ak_type: string
  qe_vendor: string
  tee_type: 'TEE_TDX' | string
  user_data: string
  version: number
}

export interface PhalaVerifyResponse {
  success: boolean
  verified: boolean
  quote?: {
    body?: TdxQuoteBody
    header?: TdxQuoteHeader
    cert_data?: string
    fmspc?: string
    tcb_level?: string
    sig_type?: string
    sig_version?: number
  }
}

export type StepStatus = 'pending' | 'verifying' | 'verified' | 'failed'

export interface StepResult {
  step: number
  name: string
  description: string
  status: StepStatus
  detail?: string
  error?: string
  data?: Record<string, unknown>
}

export interface RtmrValues {
  rtmr0: string
  rtmr1: string
  rtmr2: string
  rtmr3: string
}

export interface AttestationResult {
  status: 'verified' | 'failed'
  steps: StepResult[]
  rtmrValues?: RtmrValues
  composeContent?: string
  challenge?: string
  failedStep?: number
  errorMessage?: string
}

export type AttestationStatus = 'pending' | 'verifying' | 'verified' | 'failed'

export interface ComponentRecord {
  status: 'verified' | 'failed'
  completedAt: number
  result: AttestationResult
}
