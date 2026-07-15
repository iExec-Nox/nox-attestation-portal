import { verifyQuoteWithDcap } from '@/attestation/services/dcap-verifier'
import { checkProofOfCloud } from '@/attestation/services/proof-of-cloud'
import { replayRtmr3 } from '@/attestation/services/rtmr-replay'
import { AttestationVerifier } from '@/attestation/services/verifier'
import { bytesToHex } from '@/shared/lib/utils'
import type { DcapVerifyResult } from '@/attestation/services/dcap-verifier'
import type { EventLogEntry, TdxQuoteBody, InstanceInfo, QuoteData } from '@/attestation/types/index'

vi.mock('@/attestation/services/dcap-verifier', () => ({
  verifyQuoteWithDcap: vi.fn(),
}))
vi.mock('@/attestation/services/proof-of-cloud', () => ({
  checkProofOfCloud: vi.fn(),
}))
vi.mock('@/attestation/services/rtmr-replay', () => ({
  replayRtmr3: vi.fn(),
}))

const CHALLENGE = 'test-challenge'
const COMPUTED_RTMR3 = new Uint8Array([0xde, 0xad, 0xbe, 0xef])
const COMPOSE_CONTENT = 'version: "3"\nservices:\n  app:\n    image: example'

/** Builds the instance passed to `verify`, carrying the quote and compose. */
function makeInstance(quote: QuoteData, appCompose: string = COMPOSE_CONTENT): InstanceInfo {
  return { instance_id: 'i1', machine_id: 'm1', quote, app_compose: appCompose }
}

function expectedReportDataHex(): string {
  const expectedBytes = new Uint8Array(64)
  expectedBytes.set(new TextEncoder().encode(CHALLENGE))
  return bytesToHex(expectedBytes)
}

async function composeHashHex(content: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
  return bytesToHex(new Uint8Array(digest))
}

function baseQuoteBody(overrides: Partial<TdxQuoteBody> = {}): TdxQuoteBody {
  return {
    mrconfig: '0x00',
    mrowner: '0x00',
    mrownerconfig: '0x00',
    mrseam: '0x00',
    mrsignerseam: '0x00',
    mrtd: '0x00',
    reportdata: `0x${expectedReportDataHex()}`,
    rtmr0: '0xaa',
    rtmr1: '0xbb',
    rtmr2: '0xcc',
    rtmr3: `0x${bytesToHex(COMPUTED_RTMR3)}`,
    seamattributes: '0x00',
    tdattributes: '0x00',
    tee_tcb_svn: '0x00',
    xfam: '0x00',
    ...overrides,
  }
}

function baseEventLog(declaredComposeHash: string): EventLogEntry[] {
  return [
    { imr: 3, event_type: 1, event: 'os-image-hash', event_payload: '0xosimagehash', digest: '' },
    { imr: 3, event_type: 1, event: 'os-image-ref', event_payload: 'docker.io/example', digest: '' },
    { imr: 3, event_type: 1, event: 'compose-hash', event_payload: declaredComposeHash, digest: '' },
  ]
}

async function setupHappyPath(quoteBodyOverrides: Partial<TdxQuoteBody> = {}) {
  const declaredComposeHash = await composeHashHex(COMPOSE_CONTENT)

  vi.mocked(verifyQuoteWithDcap).mockResolvedValue({
    verified: true,
    tcb_status: 'UpToDate',
    advisory_ids: [],
    quote: { body: baseQuoteBody(quoteBodyOverrides) },
  } satisfies DcapVerifyResult)
  vi.mocked(checkProofOfCloud).mockResolvedValue(true)
  vi.mocked(replayRtmr3).mockResolvedValue(COMPUTED_RTMR3)

  return {
    quoteData: { quote: 'deadbeef', event_log: baseEventLog(declaredComposeHash) } as QuoteData,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('AttestationVerifier.verify', () => {
  it('verifies all six steps end-to-end on the happy path', async () => {
    const { quoteData } = await setupHappyPath()
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('verified')
    expect(result.steps.every((s) => s.status === 'verified')).toBe(true)
    expect(result.rtmrValues?.rtmr3).toBe(bytesToHex(COMPUTED_RTMR3))
    expect(result.composeContent).toBe(COMPOSE_CONTENT)
  })

  it('fails at step 1 when the DCAP verifier rejects (e.g. timeout)', async () => {
    const { quoteData } = await setupHappyPath()
    vi.mocked(verifyQuoteWithDcap).mockRejectedValue(new Error('Timeout'))
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(1)
    expect(result.errorMessage).toBe('Timeout')
  })

  it('fails at step 1 when the quote signature is not verified', async () => {
    const { quoteData } = await setupHappyPath()
    vi.mocked(verifyQuoteWithDcap).mockResolvedValue({
      verified: false,
      tcb_status: 'Revoked',
      advisory_ids: [],
      quote: { body: baseQuoteBody() },
    })
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(1)
    expect(result.steps[0].error).toContain('Revoked')
  })

  it('fails at step 2 when the DCAP result is missing a quote body', async () => {
    const { quoteData } = await setupHappyPath()
    vi.mocked(verifyQuoteWithDcap).mockResolvedValue({
      verified: true,
      tcb_status: 'UpToDate',
      advisory_ids: [],
      quote: { body: undefined },
    })
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(2)
  })

  it('fails at step 2 when the report data does not embed the challenge', async () => {
    const { quoteData } = await setupHappyPath({ reportdata: '0xffffffff' })
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(2)
  })

  it('fails at step 4 when the replayed RTMR3 does not match the attested value', async () => {
    const { quoteData } = await setupHappyPath()
    vi.mocked(replayRtmr3).mockResolvedValue(new Uint8Array([0x00]))
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(4)
  })

  it('fails at step 4 when the event log replay itself throws', async () => {
    const { quoteData } = await setupHappyPath()
    vi.mocked(replayRtmr3).mockRejectedValue(new Error('malformed event log'))
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(4)
  })

  it('fails at step 5 when the os-image-hash event is missing from the log', async () => {
    const { quoteData } = await setupHappyPath()
    quoteData.event_log = (quoteData.event_log as EventLogEntry[]).filter(
      (e) => e.event !== 'os-image-hash',
    )
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(5)
  })

  it('fails at step 6 when the compose-hash event is missing from the log', async () => {
    const { quoteData } = await setupHappyPath()
    quoteData.event_log = (quoteData.event_log as EventLogEntry[]).filter(
      (e) => e.event !== 'compose-hash',
    )
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(6)
  })

  it('fails at step 6 when the app manifest is missing from the response', async () => {
    const { quoteData } = await setupHappyPath()
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(makeInstance(quoteData, ''), CHALLENGE)

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(6)
  })

  it('fails at step 6 when the computed compose hash does not match the declared one', async () => {
    const { quoteData } = await setupHappyPath()
    const verifier = new AttestationVerifier(() => {})

    const result = await verifier.verify(
      makeInstance(quoteData, 'a different compose file'),
      CHALLENGE,
    )

    expect(result.status).toBe('failed')
    expect(result.failedStep).toBe(6)
  })

  it('reports each step transition through the update callback', async () => {
    const { quoteData } = await setupHappyPath()
    const updates: string[][] = []
    const verifier = new AttestationVerifier((steps) => {
      updates.push(steps.map((s) => s.status))
    })

    await verifier.verify(makeInstance(quoteData), CHALLENGE)

    expect(updates.length).toBeGreaterThan(0)
    expect(updates.at(-1)).toEqual(Array(6).fill('verified'))
  })
})
