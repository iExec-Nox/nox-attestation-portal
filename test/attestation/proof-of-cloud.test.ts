import { checkProofOfCloud } from '@/attestation/services/proof-of-cloud'

beforeEach(() => {
  vi.useRealTimers()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('checkProofOfCloud', () => {
  it('returns true when the server reports the machine as whitelisted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ whitelisted: true }) }),
    )

    await expect(checkProofOfCloud('deadbeef')).resolves.toBe(true)
  })

  it('posts the quote hex to the proof-of-cloud endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ whitelisted: true }) })
    vi.stubGlobal('fetch', fetchMock)

    await checkProofOfCloud('deadbeef')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/proof-of-cloud',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: 'deadbeef' }),
      }),
    )
  })

  it('returns false when the server reports the machine as not whitelisted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ whitelisted: false }) }),
    )

    await expect(checkProofOfCloud('deadbeef')).resolves.toBe(false)
  })

  it('returns false when the response body is missing the whitelisted flag', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))

    await expect(checkProofOfCloud('deadbeef')).resolves.toBe(false)
  })

  it('returns false on a non-OK HTTP response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ whitelisted: true }) }),
    )

    await expect(checkProofOfCloud('deadbeef')).resolves.toBe(false)
  })

  it('returns false instead of throwing when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect(checkProofOfCloud('deadbeef')).resolves.toBe(false)
  })

  it('returns false instead of throwing when the response body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('invalid json')
        },
      }),
    )

    await expect(checkProofOfCloud('deadbeef')).resolves.toBe(false)
  })

  it('aborts and returns false when the server never responds within the timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, opts: RequestInit) =>
          new Promise((_resolve, reject) => {
            opts.signal?.addEventListener('abort', () => reject(new Error('aborted')))
          }),
      ),
    )

    const promise = checkProofOfCloud('deadbeef')
    await vi.advanceTimersByTimeAsync(15000)

    await expect(promise).resolves.toBe(false)
  })
})
