import type { EventLogEntry } from '../types/index.ts'

const DSTACK_RUNTIME_EVENT_TYPE = 0x08000001

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex
  const len = Math.floor(normalized.length / 2)
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

async function sha384(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.digest('SHA-384', data))
}

function concat(...arrays: Uint8Array<ArrayBuffer>[]): Uint8Array<ArrayBuffer> {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const arr of arrays) {
    out.set(arr, offset)
    offset += arr.length
  }
  return out
}

function padTo48(digest: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  if (digest.length === 48) return digest
  const padded = new Uint8Array(48)
  padded.set(digest.slice(0, 48))
  return padded
}

function encodeString(enc: TextEncoder, str: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(enc.encode(str))
}

export async function computeRuntimeEventDigest(
  event: EventLogEntry,
): Promise<Uint8Array<ArrayBuffer>> {
  const enc = new TextEncoder()
  const typeBytes = new Uint8Array(4)
  new DataView(typeBytes.buffer).setUint32(0, event.event_type, true)
  const colon = encodeString(enc, ':')
  const data = concat(
    typeBytes,
    colon,
    encodeString(enc, event.event),
    colon,
    hexToBytes(event.event_payload),
  )
  return sha384(data)
}

export async function replayRtmr3(events: EventLogEntry[]): Promise<Uint8Array<ArrayBuffer>> {
  let rtmr: Uint8Array<ArrayBuffer> = new Uint8Array(48)

  for (const event of events.filter((e) => e.imr === 3)) {
    const digest =
      event.event_type === DSTACK_RUNTIME_EVENT_TYPE
        ? await computeRuntimeEventDigest(event)
        : hexToBytes(event.digest)

    rtmr = await sha384(concat(rtmr, padTo48(digest)))
  }

  return rtmr
}
