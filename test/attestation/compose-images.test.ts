import { extractComposeImages, parseImageRef } from '@/attestation/services/compose-images'

const SHA_A = 'a'.repeat(64)
const SHA_B = 'b'.repeat(64)
const SHA_C = 'c'.repeat(64)

// Mirrors the real NOX app_compose: an anchor + services (digest-pinned iExec
// images and a third-party one) + a trailing configs block whose literal
// content must NOT be parsed as an image.
const COMPOSE_YAML = `x-logging: &default-logging
  driver: "json-file"

services:

  nox-kms:
    image: docker-regis.iex.ec/nox-kms@sha256:${SHA_A}
    container_name: nox-kms
    logging: *default-logging

  quote-service:
    image: docker-regis.iex.ec/dstack-quote-service@sha256:${SHA_B}

  fluent-bit:
    image: fluent/fluent-bit@sha256:${SHA_C}

configs:
  fluent-bit-config:
    content: |
      image: should-not-be-parsed
`

describe('parseImageRef', () => {
  it('splits a digest-pinned image with no tag', () => {
    expect(parseImageRef(`docker-regis.iex.ec/nox-kms@sha256:${SHA_A}`)).toEqual({
      registryPath: 'docker-regis.iex.ec/nox-kms',
      tag: undefined,
      digest: `sha256:${SHA_A}`,
    })
  })

  it('keeps a registry port and reads both tag and digest', () => {
    expect(parseImageRef(`registry:5000/foo/bar:1.2@sha256:${SHA_A}`)).toEqual({
      registryPath: 'registry:5000/foo/bar',
      tag: '1.2',
      digest: `sha256:${SHA_A}`,
    })
  })

  it('reads a plain tag', () => {
    expect(parseImageRef('nginx:latest')).toEqual({
      registryPath: 'nginx',
      tag: 'latest',
      digest: undefined,
    })
  })

  it('handles a bare name', () => {
    expect(parseImageRef('nginx')).toEqual({
      registryPath: 'nginx',
      tag: undefined,
      digest: undefined,
    })
  })
})

describe('extractComposeImages', () => {
  it('extracts one entry per service, in order', () => {
    const images = extractComposeImages(COMPOSE_YAML)
    expect(images.map((i) => i.service)).toEqual(['nox-kms', 'quote-service', 'fluent-bit'])
  })

  it('reads the digest of each image', () => {
    const images = extractComposeImages(COMPOSE_YAML)
    expect(images.map((i) => i.digest)).toEqual([
      `sha256:${SHA_A}`,
      `sha256:${SHA_B}`,
      `sha256:${SHA_C}`,
    ])
  })

  it('classifies mapped iExec images as verifiable with resolved repos', () => {
    const [kms, sidecar] = extractComposeImages(COMPOSE_YAML)
    expect(kms.verifiability).toBe('verifiable')
    expect(kms.attestation).toEqual({
      attestationRepo: 'iExec-Nox/nox-kms',
      signingRepo: 'iExecBlockchainComputing/github-actions-workflows',
    })
    expect(sidecar.attestation?.attestationRepo).toBe('iExec-Nox/dstack-quote-service')
  })

  it('classifies unmapped images as third-party with no attestation', () => {
    const fluent = extractComposeImages(COMPOSE_YAML).find((i) => i.service === 'fluent-bit')
    expect(fluent?.verifiability).toBe('third-party')
    expect(fluent?.attestation).toBeUndefined()
  })

  it('does not parse image-looking lines outside the services block', () => {
    const images = extractComposeImages(COMPOSE_YAML)
    expect(images).toHaveLength(3)
    expect(images.some((i) => i.ref.includes('should-not-be-parsed'))).toBe(false)
  })

  it('unwraps the JSON app_compose envelope', () => {
    const wrapped = JSON.stringify({ docker_compose_file: COMPOSE_YAML })
    expect(extractComposeImages(wrapped).map((i) => i.service)).toEqual([
      'nox-kms',
      'quote-service',
      'fluent-bit',
    ])
  })

  it('returns an empty list when there is no services block', () => {
    expect(extractComposeImages('version: "3"\nname: foo\n')).toEqual([])
  })
})
