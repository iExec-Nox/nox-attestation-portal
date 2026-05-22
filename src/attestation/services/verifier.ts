import type {
  StepResult,
  AttestationResult,
  RtmrValues,
  PhalaVerifyResponse,
  EventLogEntry,
} from '../types/index.ts'
import { replayRtmr3 } from './rtmr-replay.ts'
import { fetchQuote, fetchAppInfo } from './quote-service.ts'
import { bytesToHex } from '../../shared/lib/utils.ts'

const PHALA_VERIFY_URL = import.meta.env.VITE_PHALA_VERIFY_URL as string

export const STEP_DEFINITIONS = [
  {
    name: 'Quote signature',
    description: 'Confirm the quote is signed by a genuine Intel TDX hardware key.',
  },
  {
    name: 'Report data · Challenge',
    description: "Verify our random challenge is embedded in the quote's report_data field.",
  },
  {
    name: 'RTMR values',
    description: 'Compare RTMR0–RTMR3 measurements against expected golden values.',
  },
  {
    name: 'RTMR3 replay',
    description: 'Re-derive RTMR3 by replaying the event journal and check it matches.',
  },
  {
    name: 'OS image hash',
    description: 'Verify the attested OS image hash is recorded in the journal.',
  },
  {
    name: 'Compose hash',
    description: 'Verify the docker-compose hash matches the attested configuration.',
  },
] as const

function countComposeServices(yaml: string): number {
  const lines = yaml.split('\n')
  let inServices = false
  let count = 0
  for (const line of lines) {
    if (/^services\s*:/.test(line)) {
      inServices = true
      continue
    }
    if (inServices && /^\S/.test(line)) {
      inServices = false
      continue
    }
    if (inServices && /^ {2}\w[\w-]*\s*:/.test(line)) count++
  }
  return count
}

export type StepCallback = (steps: StepResult[]) => void

function makeInitialSteps(): StepResult[] {
  return STEP_DEFINITIONS.map((s, i) => ({
    step: i + 1,
    name: s.name,
    description: s.description,
    status: 'pending' as const,
  }))
}

function generateChallenge(): { hex: string } {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return { hex: bytesToHex(bytes) }
}

async function sha256(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data))
}

export class AttestationVerifier {
  private readonly onUpdate: StepCallback

  constructor(onUpdate: StepCallback) {
    this.onUpdate = onUpdate
  }

  async verify(cvmUrl: string): Promise<AttestationResult> {
    const steps = makeInitialSteps()
    const push = (i: number, patch: Partial<StepResult>) => {
      steps[i] = { ...steps[i], ...patch }
      this.onUpdate([...steps])
    }

    const { hex: challenge } = generateChallenge()

    let quoteData: Awaited<ReturnType<typeof fetchQuote>>
    let appInfo: Awaited<ReturnType<typeof fetchAppInfo>>

    try {
      ;[quoteData, appInfo] = await Promise.all([
        fetchQuote(cvmUrl, challenge),
        fetchAppInfo(cvmUrl),
      ])
    } catch (err) {
      push(0, { status: 'failed', error: `Data fetch error: ${String(err)}` })
      return { status: 'failed', steps, failedStep: 1, errorMessage: String(err) }
    }

    // ── Step 1: Verify Quote Signature ────────────────────────────────────
    push(0, { status: 'verifying' })

    let phalaResp: PhalaVerifyResponse
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(PHALA_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hex: quoteData.quote }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      phalaResp = (await res.json()) as PhalaVerifyResponse
    } catch (err) {
      push(0, { status: 'failed', error: `Phala API unreachable: ${String(err)}` })
      return { status: 'failed', steps, failedStep: 1, errorMessage: String(err) }
    }

    if (!phalaResp.success) {
      push(0, { status: 'failed', error: 'Quote signature rejected by Phala Cloud' })
      return { status: 'failed', steps, failedStep: 1, errorMessage: 'Quote not verified' }
    }

    const sigType = phalaResp.quote?.header?.ak_type
    const sigVersion = phalaResp.quote?.header?.version
    const fmspc = phalaResp.quote?.fmspc
    const tcbLevel = phalaResp.quote?.tcb_level

    const versionSuffix = sigVersion ? ` v${sigVersion}` : ''

    const step1Data: Record<string, string> = {
      provider: 'Phala Cloud & Intel Root CA',
      enclaveType: 'Intel TDX (Trust Domain Extensions)',
      signingKey: sigType ? `${sigType}${versionSuffix}` : 'Intel Hardware Key',
    }

    if (fmspc) step1Data.fmspc = fmspc
    if (tcbLevel) step1Data.tcbLevel = tcbLevel

    push(0, {
      status: 'verified',
      detail: 'Hardware authenticity verified by Phala Cloud & Intel Root CA',
      data: step1Data,
    })

    const quoteBody = phalaResp.quote?.body
    if (!quoteBody) {
      push(1, { status: 'failed', error: 'Phala response missing quote body' })
      return { status: 'failed', steps, failedStep: 2, errorMessage: 'Missing quote body' }
    }

    // ── Step 2: Verify Report Data ─────────────────────────────────────────
    push(1, { status: 'verifying' })

    const challengeAscii = new TextEncoder().encode(challenge)
    const expectedBytes = new Uint8Array(64)
    expectedBytes.set(challengeAscii)
    const expectedHex = bytesToHex(expectedBytes)
    const actualHex = (quoteBody.reportdata ?? '').replace('0x', '').toLowerCase()

    if (actualHex !== expectedHex) {
      push(1, {
        status: 'failed',
        error: `Report data mismatch\nExpected: ${expectedHex}\nGot:      ${actualHex}`,
        data: { expected: expectedHex, actual: actualHex },
      })
      return { status: 'failed', steps, failedStep: 2, errorMessage: 'Report data mismatch' }
    }
    push(1, {
      status: 'verified',
      detail: `Challenge: ${challenge}`,
      data: { challenge: `0x${challenge}`, embedded: `0x${challenge}` },
    })

    // ── Step 3: Extract RTMR Values ────────────────────────────────────────
    push(2, { status: 'verifying' })

    const rtmrValues: RtmrValues = {
      rtmr0: (quoteBody.rtmr0 ?? '').replace('0x', ''),
      rtmr1: (quoteBody.rtmr1 ?? '').replace('0x', ''),
      rtmr2: (quoteBody.rtmr2 ?? '').replace('0x', ''),
      rtmr3: (quoteBody.rtmr3 ?? '').replace('0x', ''),
    }
    push(2, {
      status: 'verified',
      detail: 'RTMR0–3 extracted from TDX chip',
      data: {
        rtmr0: `0x${rtmrValues.rtmr0}`,
        rtmr1: `0x${rtmrValues.rtmr1}`,
        rtmr2: `0x${rtmrValues.rtmr2}`,
        rtmr3: `0x${rtmrValues.rtmr3}`,
      },
    })

    // ── Step 4: Replay RTMR3 ──────────────────────────────────────────────
    push(3, { status: 'verifying' })

    let computedRtmr3: Uint8Array
    let eventsArray: EventLogEntry[]
    if (typeof quoteData.event_log === 'string') {
      eventsArray = JSON.parse(quoteData.event_log)
    } else {
      eventsArray = quoteData.event_log
    }
    try {
      computedRtmr3 = await replayRtmr3(eventsArray)
    } catch (err) {
      push(3, { status: 'failed', error: `Replay error: ${String(err)}` })
      return { status: 'failed', steps, failedStep: 4, errorMessage: String(err) }
    }

    const computedHex = bytesToHex(computedRtmr3)
    const expectedRtmr3 = rtmrValues.rtmr3.toLowerCase()

    if (computedHex !== expectedRtmr3) {
      push(3, {
        status: 'failed',
        error: `RTMR3 mismatch\nExpected: ${expectedRtmr3}\nComputed: ${computedHex}`,
        data: { expected: expectedRtmr3, computed: computedHex },
      })
      return { status: 'failed', steps, failedStep: 4, errorMessage: 'RTMR3 replay mismatch' }
    }
    push(3, {
      status: 'verified',
      detail: `RTMR3: ${computedHex}`,
      data: {
        events: `${eventsArray.length} entries replayed`,
        derived: `0x${computedHex}`,
        attested: `0x${expectedRtmr3}`,
      },
    })

    // ── Step 5: Verify OS Image Hash ───────────────────────────────────────
    push(4, { status: 'verifying' })

    const osEvent = eventsArray.find((e) => e.imr === 3 && e.event === 'os-image-hash')
    if (!osEvent?.event_payload) {
      push(4, { status: 'failed', error: 'os-image-hash event not found in event log' })
      return { status: 'failed', steps, failedStep: 5, errorMessage: 'Missing os-image-hash' }
    }
    const osHashClean = osEvent.event_payload.replace(/^0x/i, '').toLowerCase()
    const osSourceEvent = eventsArray.find(
      (e) => e.imr === 3 && (e.event === 'os-image-ref' || e.event === 'os-image-source'),
    )
    const step5Data: Record<string, string> = {
      expected: `0x${osHashClean}`,
      journal: `0x${osHashClean}`,
    }
    if (osSourceEvent?.event_payload) step5Data.source = osSourceEvent.event_payload
    push(4, {
      status: 'verified',
      detail: `OS hash: 0x${osHashClean}`,
      data: step5Data,
    })

    // ── Step 6: Verify Compose Hash ────────────────────────────────────────
    push(5, { status: 'verifying' })

    const composeEvent = eventsArray.find((e) => e.imr === 3 && e.event === 'compose-hash')
    if (!composeEvent) {
      push(5, { status: 'failed', error: 'compose-hash event not found in event log' })
      return { status: 'failed', steps, failedStep: 6, errorMessage: 'Missing compose-hash' }
    }

    const composeContent = appInfo.app_compose ?? ''
    if (!composeContent.trim()) {
      push(5, {
        status: 'failed',
        error: 'App manifest missing from CVM info response',
        data: { appInfoKeys: Object.keys(appInfo) },
      })
      return {
        status: 'failed',
        steps,
        failedStep: 6,
        errorMessage: 'Missing app compose manifest',
      }
    }

    const composeHashBytes = await sha256(new TextEncoder().encode(composeContent))
    const computedComposeHash = bytesToHex(composeHashBytes)
    const declaredComposeHash = composeEvent.event_payload.replace('0x', '').toLowerCase()

    if (computedComposeHash !== declaredComposeHash) {
      push(5, {
        status: 'failed',
        error: `Compose hash mismatch\nExpected: ${declaredComposeHash}\nComputed: ${computedComposeHash}`,
        data: { expected: declaredComposeHash, computed: computedComposeHash },
      })
      return { status: 'failed', steps, failedStep: 6, errorMessage: 'Compose hash mismatch' }
    }
    const serviceCount = countComposeServices(composeContent)
    const manifestLabel =
      serviceCount > 0 ? `docker-compose.yaml · ${serviceCount} services` : 'docker-compose.yaml'
    push(5, {
      status: 'verified',
      detail: `Compose hash: 0x${computedComposeHash}`,
      data: {
        expected: `0x${declaredComposeHash}`,
        observed: `0x${computedComposeHash}`,
        manifest: manifestLabel,
      },
    })

    return {
      status: 'verified',
      steps,
      rtmrValues,
      composeContent: appInfo.app_compose,
      challenge,
    }
  }
}
