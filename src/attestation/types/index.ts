import type { ResolvedImageAttestation } from '../config/image-attestation-map.ts'

export interface InstanceInfo {
  instance_id: string
  machine_id: string
  /** Attestation quote fetched by the aggregator, bound to our challenge. */
  quote: QuoteData
  /** Docker-compose manifest, provided by the aggregator (from the CVM `/info`). */
  app_compose: string
}

export interface CvmInfo {
  app_id: string
  name: string
  instances: InstanceInfo[]
}

/**
 * Extraction-time classification of a compose image:
 * - `verifiable`: in the attestation mapping AND digest-pinned → can be checked.
 * - `tag-pin`: in the mapping but referenced by a tag, not a sha256 digest.
 * - `third-party`: not in the attestation mapping (external image).
 */
export type ImageVerifiability = 'verifiable' | 'tag-pin' | 'third-party'

/**
 * SLSA provenance extracted from a verified attestation — the chain-of-trust
 * links shown per image. All fields are `null` when the attestation payload
 * does not carry them.
 */
export interface SlsaProvenance {
  /** Verified image digest, "sha256:…". */
  image: string
  /** Source repo in `owner/name` form. */
  sourceRepo: string | null
  /** Source commit sha. */
  commit: string | null
  /** GitHub tree URL pinned at the source commit. */
  commitUrl: string | null
  /** Triggering workflow file URL, pinned at the source commit. */
  workflowUrl: string | null
  /** Builder / reusable workflow URL. */
  builderUrl: string | null
  /** Sigstore/Rekor transparency-log search URL for this digest. */
  rekorUrl: string
  /** GitHub attestation page URL. */
  attestationUrl: string
  /** Trigger event name (e.g. "push"). */
  trigger: string | null
}

/** Why a SLSA verification did not succeed. */
export type SlsaFailureReason =
  | 'no-attestation' // no attestation found on GitHub for this digest (unsigned image?)
  | 'verification-failed' // an attestation exists but failed a crypto/identity/binding check
  | 'request-failed' // could not complete the request (network, timeout, bad input)

/** Result of a SLSA verification attempt for one image. */
export type CheckSlsaResult =
  | { verified: true; provenance: SlsaProvenance }
  | { verified: false; reason: SlsaFailureReason; error: string }

/** A container image referenced by a service in the attested docker-compose. */
export interface AttestedImage {
  /** Compose service name, e.g. "nox-kms", "quote-service". */
  service: string
  /** Full image reference as written in the compose (with tag and/or digest). */
  ref: string
  /** Normalized registry path without tag/digest — the mapping key. */
  registryPath: string
  /** Tag if present (usually absent: NOX images are digest-pinned). */
  tag?: string
  /** sha256 digest (e.g. "sha256:abc…"), when the image is digest-pinned. */
  digest?: string
  /** Classification: `verifiable`, `tag-pin`, or `third-party` (see ImageVerifiability). */
  verifiability: ImageVerifiability
  /** Attestation repos resolved from the mapping when the image is mapped (`verifiable` or `tag-pin`). */
  attestation?: ResolvedImageAttestation
}

export interface EventLogEntry {
  imr: 0 | 1 | 2 | 3 // IMR registers sont strictement 0-3
  event_type: number
  event: string
  event_payload: string
  digest: string
}

export interface QuoteData {
  quote: string
  event_log: string | EventLogEntry[]
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
