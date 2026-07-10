export interface InstanceInfo {
  instance_id: string
  url: string
  machine_id: string
}

export interface CvmInfo {
  app_id: string
  name: string
  instances: InstanceInfo[]
}

export interface EventLogEntry {
  imr: 0 | 1 | 2 | 3 // IMR registers sont strictement 0-3
  event_type: number
  event: string
  event_payload: string
  digest: string
}

export interface QuoteApiResponse {
  quote: string
  event_log: string | EventLogEntry[]
  rtmrs?: string
  vm_config?: string
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

export interface RtmrValues {
  rtmr0: string
  rtmr1: string
  rtmr2: string
  rtmr3: string
}

export type RtmrValuesRaw = Record<'0' | '1' | '2' | '3', string>

export interface VmConfig {
  os_image_hash: string
  cpu_count: number
  memory_size: number
  qemu_version: string
  pci_hole64_size: number
  hugepages: boolean
  num_gpus: number
  num_nvswitches: number
  hotplug_off: boolean
  image: string
  host_share_mode: string
  spec_version: number
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

export interface AttestationResult {
  status: 'verified' | 'failed'
  steps: StepResult[]
  rtmrValues?: RtmrValues
  composeContent?: string
  challenge?: string
  quoteHex?: string
  failedStep?: number
  errorMessage?: string
}

export type AttestationStatus = 'pending' | 'verifying' | 'verified' | 'failed'

export interface ComponentRecord {
  status: 'verified' | 'failed'
  completedAt: number
  result: AttestationResult
}

export function parseEventLog(raw: string | EventLogEntry[]): EventLogEntry[] {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function parseRtmrs(raw: string): RtmrValues {
  try {
    const parsed = JSON.parse(raw) as RtmrValuesRaw
    return { rtmr0: parsed['0'], rtmr1: parsed['1'], rtmr2: parsed['2'], rtmr3: parsed['3'] }
  } catch {
    throw new Error('Failed to parse RTMR values')
  }
}

export function parseVmConfig(raw: string): VmConfig {
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Failed to parse VM config')
  }
}

export function isValidImr(value: number): value is 0 | 1 | 2 | 3 {
  return [0, 1, 2, 3].includes(value)
}
