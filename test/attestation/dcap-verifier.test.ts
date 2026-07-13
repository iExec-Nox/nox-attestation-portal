import { getCollateralAndVerify, Quote } from '@phala/dcap-qvl'

import { verifyQuoteWithDcap } from '@/attestation/services/dcap-verifier'

vi.mock('@phala/dcap-qvl', () => ({
  getCollateralAndVerify: vi.fn(),
  PHALA_PCCS_URL: 'https://mock-pccs.example',
  Quote: { parse: vi.fn() },
}))

const tdReportFixture = {
  mrTd: new Uint8Array([1]),
  mrConfigId: new Uint8Array([2]),
  mrOwner: new Uint8Array([3]),
  mrOwnerConfig: new Uint8Array([4]),
  mrSeam: new Uint8Array([5]),
  mrSignerSeam: new Uint8Array([6]),
  seamAttributes: new Uint8Array([7]),
  tdAttributes: new Uint8Array([8]),
  xfam: new Uint8Array([9]),
  reportData: new Uint8Array([10]),
  rtMr0: new Uint8Array([11]),
  rtMr1: new Uint8Array([12]),
  rtMr2: new Uint8Array([13]),
  rtMr3: new Uint8Array([14]),
  teeTcbSvn: new Uint8Array([15]),
}

function mockQuoteParse(report: typeof tdReportFixture | null = tdReportFixture) {
  vi.mocked(Quote.parse).mockReturnValue({
    report: { asTd10: () => report },
  } as unknown as Quote)
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('verifyQuoteWithDcap', () => {
  it('accepts every "up to date"-family TCB status as verified', async () => {
    mockQuoteParse()
    for (const status of [
      'UpToDate',
      'SWHardeningNeeded',
      'ConfigurationNeeded',
      'ConfigurationAndSWHardeningNeeded',
    ]) {
      vi.mocked(getCollateralAndVerify).mockResolvedValue({
        status,
        advisory_ids: [],
      } as never)
      const result = await verifyQuoteWithDcap('deadbeef')
      expect(result.verified).toBe(true)
      expect(result.tcb_status).toBe(status)
    }
  })

  it('rejects TCB statuses outside the accepted set', async () => {
    mockQuoteParse()
    vi.mocked(getCollateralAndVerify).mockResolvedValue({
      status: 'Revoked',
      advisory_ids: [],
    } as never)

    const result = await verifyQuoteWithDcap('deadbeef')

    expect(result.verified).toBe(false)
    expect(result.tcb_status).toBe('Revoked')
  })

  it('extracts and hex-encodes the TD10 report body', async () => {
    mockQuoteParse()
    vi.mocked(getCollateralAndVerify).mockResolvedValue({
      status: 'UpToDate',
      advisory_ids: ['INTEL-SA-1234'],
    } as never)

    const result = await verifyQuoteWithDcap('deadbeef')

    expect(result.advisory_ids).toEqual(['INTEL-SA-1234'])
    expect(result.quote?.body).toEqual({
      mrtd: '0x01',
      mrconfig: '0x02',
      mrowner: '0x03',
      mrownerconfig: '0x04',
      mrseam: '0x05',
      mrsignerseam: '0x06',
      seamattributes: '0x07',
      tdattributes: '0x08',
      xfam: '0x09',
      reportdata: '0x0a',
      rtmr0: '0x0b',
      rtmr1: '0x0c',
      rtmr2: '0x0d',
      rtmr3: '0x0e',
      tee_tcb_svn: '0x0f',
    })
  })

  it('accepts a 0x-prefixed quote and treats it the same as bare hex', async () => {
    mockQuoteParse()
    vi.mocked(getCollateralAndVerify).mockResolvedValue({
      status: 'UpToDate',
      advisory_ids: [],
    } as never)

    await verifyQuoteWithDcap('0xdeadbeef')

    const passedBuffer = vi.mocked(getCollateralAndVerify).mock.calls[0][0]
    expect(Array.from(passedBuffer as Uint8Array)).toEqual([0xde, 0xad, 0xbe, 0xef])
  })

  it.each([
    ['odd-length hex', 'abc'],
    ['non-hex characters', 'zzzz'],
    ['empty string', ''],
    ['just the 0x prefix', '0x'],
  ])('rejects an invalid quote hex string (%s)', async (_label, badHex) => {
    await expect(verifyQuoteWithDcap(badHex)).rejects.toThrow(/DCAP verification failed/)
    expect(getCollateralAndVerify).not.toHaveBeenCalled()
  })

  it('wraps a collateral/verification failure in a descriptive error', async () => {
    mockQuoteParse()
    vi.mocked(getCollateralAndVerify).mockRejectedValue(new Error('PCCS unreachable'))

    await expect(verifyQuoteWithDcap('deadbeef')).rejects.toThrow(
      'DCAP verification failed: PCCS unreachable',
    )
  })

  it('degrades gracefully when the quote cannot be parsed for its body', async () => {
    vi.mocked(Quote.parse).mockImplementation(() => {
      throw new Error('bad quote structure')
    })
    vi.mocked(getCollateralAndVerify).mockResolvedValue({
      status: 'UpToDate',
      advisory_ids: [],
    } as never)

    const result = await verifyQuoteWithDcap('deadbeef')

    expect(result.verified).toBe(true)
    expect(result.quote?.body).toBeUndefined()
  })

  it('leaves the body undefined when the report is not a TD10 report', async () => {
    mockQuoteParse(null)
    vi.mocked(getCollateralAndVerify).mockResolvedValue({
      status: 'UpToDate',
      advisory_ids: [],
    } as never)

    const result = await verifyQuoteWithDcap('deadbeef')

    expect(result.quote?.body).toBeUndefined()
  })
})
