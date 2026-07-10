import { getCollateralAndVerify, PHALA_PCCS_URL, Quote } from '@phala/dcap-qvl'
import type { TdxQuoteBody } from '../types/index.ts'

export interface DcapVerifyResult {
  verified: boolean
  tcb_status?: string
  advisory_ids?: string[]
  quote?: {
    body?: TdxQuoteBody
  }
}

const bytesToHex = (arr: Uint8Array | Buffer | undefined): string => {
  if (!arr) return '0x'
  return (
    '0x' +
    Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

export async function verifyQuoteWithDcap(quoteHex: string): Promise<DcapVerifyResult> {
  try {
    const quoteBuffer = hexToBytes(quoteHex)
    const result = await getCollateralAndVerify(quoteBuffer, PHALA_PCCS_URL)
    const quoteData = extractQuoteData(quoteBuffer)

    const acceptedStatuses = [
      'UpToDate',
      'SWHardeningNeeded',
      'ConfigurationNeeded',
      'ConfigurationAndSWHardeningNeeded',
    ]
    const verified = acceptedStatuses.includes(result.status)

    return {
      verified,
      tcb_status: result.status,
      advisory_ids: result.advisory_ids,
      quote: quoteData,
    }
  } catch (err) {
    throw new Error(`DCAP verification failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}

function hexToBytes(quoteHex: string): Uint8Array {
  const cleanHex = quoteHex.replace(/^0x/i, '')
  const quoteBuffer = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    quoteBuffer[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16)
  }
  return quoteBuffer
}

function extractQuoteData(quoteBuffer: Uint8Array): { body?: TdxQuoteBody } {
  let parsedQuote: Quote
  try {
    parsedQuote = Quote.parse(quoteBuffer)
  } catch {
    return { body: undefined }
  }

  const quoteBody = parseQuoteBody(parsedQuote)

  return {
    body: quoteBody,
  }
}

function parseQuoteBody(quote: Quote): TdxQuoteBody | undefined {
  const tdReport = quote.report.asTd10()
  if (!tdReport) return undefined

  return {
    mrtd: bytesToHex(tdReport.mrTd),
    mrconfig: bytesToHex(tdReport.mrConfigId),
    mrowner: bytesToHex(tdReport.mrOwner),
    mrownerconfig: bytesToHex(tdReport.mrOwnerConfig),
    mrseam: bytesToHex(tdReport.mrSeam),
    mrsignerseam: bytesToHex(tdReport.mrSignerSeam),
    seamattributes: bytesToHex(tdReport.seamAttributes),
    tdattributes: bytesToHex(tdReport.tdAttributes),
    xfam: bytesToHex(tdReport.xfam),
    reportdata: bytesToHex(tdReport.reportData),
    rtmr0: bytesToHex(tdReport.rtMr0),
    rtmr1: bytesToHex(tdReport.rtMr1),
    rtmr2: bytesToHex(tdReport.rtMr2),
    rtmr3: bytesToHex(tdReport.rtMr3),
    tee_tcb_svn: bytesToHex(tdReport.teeTcbSvn),
  }
}
