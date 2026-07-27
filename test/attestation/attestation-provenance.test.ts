import {
  clearProvenanceCache,
  fetchImageProvenance,
} from '@/attestation/services/attestation-provenance'
import type { AttestedImage } from '@/attestation/types/index'

const DIGEST = `sha256:${'a'.repeat(64)}`

function verifiableImage(overrides: Partial<AttestedImage> = {}): AttestedImage {
  return {
    service: 'nox-kms',
    ref: `docker-regis.iex.ec/nox-kms@${DIGEST}`,
    registryPath: 'docker-regis.iex.ec/nox-kms',
    digest: DIGEST,
    verifiability: 'verifiable',
    attestation: {
      attestationRepo: 'iExec-Nox/nox-kms',
      signingRepo: 'iExecBlockchainComputing/github-actions-workflows',
    },
    ...overrides,
  }
}

const VERIFIED_BODY = {
  verified: true,
  provenance: { image: DIGEST, sourceRepo: 'iExec-Nox/nox-kms' },
}

beforeEach(() => {
  clearProvenanceCache()
  vi.useRealTimers()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('fetchImageProvenance', () => {
  it('short-circuits third-party images without any network call', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchImageProvenance(
      verifiableImage({ verifiability: 'third-party', attestation: undefined }),
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.verified).toBe(false)
  })

  it('short-circuits images with no digest', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchImageProvenance(verifiableImage({ digest: undefined }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result).toEqual({ verified: false, error: 'Image is not digest-pinned' })
  })

  it('posts repos+digest and returns the verified provenance', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => VERIFIED_BODY })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchImageProvenance(verifiableImage())

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/attestation',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          digest: DIGEST,
          attestationRepo: 'iExec-Nox/nox-kms',
          signingRepo: 'iExecBlockchainComputing/github-actions-workflows',
        }),
      }),
    )
    expect(result).toEqual(VERIFIED_BODY)
  })

  it('deduplicates concurrent calls for the same digest into one request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => VERIFIED_BODY })
    vi.stubGlobal('fetch', fetchMock)

    const [a, b] = await Promise.all([
      fetchImageProvenance(verifiableImage()),
      fetchImageProvenance(verifiableImage()),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(a.verified && b.verified).toBe(true)
  })

  it('caches a successful result so later calls do not refetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => VERIFIED_BODY })
    vi.stubGlobal('fetch', fetchMock)

    await fetchImageProvenance(verifiableImage())
    await fetchImageProvenance(verifiableImage())

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('evicts failures so a later call retries', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ verified: false, error: 'boom' }) })
    vi.stubGlobal('fetch', fetchMock)

    await fetchImageProvenance(verifiableImage())
    await fetchImageProvenance(verifiableImage())

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('surfaces the endpoint error message on a non-OK response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 502, json: async () => ({ error: 'upstream down' }) })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchImageProvenance(verifiableImage())).resolves.toEqual({
      verified: false,
      error: 'upstream down',
    })
  })

  it('returns a failure instead of throwing when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect(fetchImageProvenance(verifiableImage())).resolves.toEqual({
      verified: false,
      error: 'Verification request failed',
    })
  })

  it('returns a failure on a malformed response body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ foo: 'bar' }) })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchImageProvenance(verifiableImage())
    expect(result.verified).toBe(false)
  })

  it('times out and returns a failure when the endpoint never responds', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, opts: RequestInit) =>
          new Promise((_resolve, reject) => {
            opts.signal?.addEventListener('abort', () => {
              const err = new Error('aborted')
              err.name = 'AbortError'
              reject(err)
            })
          }),
      ),
    )

    const promise = fetchImageProvenance(verifiableImage())
    await vi.advanceTimersByTimeAsync(30000)

    await expect(promise).resolves.toEqual({ verified: false, error: 'Verification timed out' })
  })
})
