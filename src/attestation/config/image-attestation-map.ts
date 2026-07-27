/**
 * Static supply-chain configuration: maps each Docker image (by its registry
 * path, without tag or digest) to the GitHub repositories needed to verify its
 * SLSA attestation.
 *
 * This is injected into the UI at build time. To onboard a new image, add an
 * entry here — no other code change is required.
 *
 * Each verification needs two repos (see verify-js / `sigstore`):
 *  - `attestationRepo`: the repo that OWNS the attestation (queried on GitHub).
 *  - signing repo: the repo whose workflow SIGNED it (constrains the cert
 *    identity). It is the same for every iExec image, so it lives in
 *    `defaultSigningRepo` and can be overridden per image if ever needed.
 */

/** GitHub repository in `owner/name` form. */
export type GithubRepo = string

export interface ImageAttestationEntry {
  /** Repo that owns the SLSA attestation, queried via the GitHub API. */
  attestationRepo: GithubRepo
  /** Optional override of `defaultSigningRepo` for this image. */
  signingRepo?: GithubRepo
}

export interface ImageAttestationConfig {
  /** Signing (reusable) workflow repo shared by all images unless overridden. */
  defaultSigningRepo: GithubRepo
  /** Keyed by normalized image path: registry + name, without tag/digest. */
  images: Record<string, ImageAttestationEntry>
}

export const IMAGE_ATTESTATION_MAP: ImageAttestationConfig = {
  defaultSigningRepo: 'iExecBlockchainComputing/github-actions-workflows',
  images: {
    'docker-regis.iex.ec/nox-kms': {
      attestationRepo: 'iExec-Nox/nox-kms',
    },
    'docker-regis.iex.ec/nox-runner': {
      attestationRepo: 'iExec-Nox/nox-runner',
    },
    'docker-regis.iex.ec/nox-handle-gateway': {
      attestationRepo: 'iExec-Nox/nox-handle-gateway',
    },
    'docker-regis.iex.ec/nox-ingestor': {
      attestationRepo: 'iExec-Nox/nox-ingestor',
    },
    'docker-regis.iex.ec/dstack-quote-service': {
      attestationRepo: 'iExec-Nox/dstack-quote-service',
    },
  },
}

/** Resolved repos for one image, ready to hand to the verifier. */
export interface ResolvedImageAttestation {
  attestationRepo: GithubRepo
  signingRepo: GithubRepo
}

/**
 * Looks up the attestation repos for a normalized image path (e.g.
 * `docker-regis.iex.ec/nox-kms`, without tag/digest). Returns `null` for images
 * not covered by the mapping (e.g. third-party images like `fluent/fluent-bit`),
 * which the UI should mark as unverifiable / third-party.
 */
export function resolveImageAttestation(
  registryPath: string,
  config: ImageAttestationConfig = IMAGE_ATTESTATION_MAP,
): ResolvedImageAttestation | null {
  const entry = config.images[registryPath]
  if (!entry) return null
  return {
    attestationRepo: entry.attestationRepo,
    signingRepo: entry.signingRepo ?? config.defaultSigningRepo,
  }
}
