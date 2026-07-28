/*
 * check-slsa — verifies the SLSA provenance attestation bound to a container
 * image, in pure JS via sigstore-js, with NO registry access. Node-only
 * (uses node:crypto + sigstore + the on-disk TUF cache), so it runs behind the
 * `api/attestation` serverless function, never in the browser.
 *
 * Ported from test-sigstore/verify-js/verify-provenance.js: same 5 steps, but
 * it RETURNS a result object instead of printing and calling process.exit.
 *
 * Steps:
 *   1. fetch the bundle from the GitHub API (by digest, not via the registry)
 *   2. verify it cryptographically: signature + Fulcio chain + Rekor + OIDC issuer
 *   3. verify the signer identity (cert SAN) against the signing repo
 *   4. confirm the attestation subject == the supplied digest (binding)
 *   5. extract the source repo, commit, workflows and links
 */
import { X509Certificate } from 'node:crypto'
import type { Bundle } from 'sigstore'
import { verify } from 'sigstore'

import type { CheckSlsaResult, SlsaProvenance } from '../../src/attestation/types/index.ts'

// GitHub Actions keyless OIDC issuer (SLSA v1).
const ISSUER = 'https://token.actions.githubusercontent.com'

export interface CheckSlsaInput {
  /** Repo that owns the attestation, `owner/name` (queried on GitHub). */
  attestationRepo: string
  /** Repo whose workflow signed it, `owner/name` (constrains the cert identity). */
  signingRepo: string
  /** Image digest, "sha256:abc…" or bare "abc…". */
  digest: string
  /** Optional GitHub token (private repos / anonymous rate limit). */
  token?: string
  /**
   * Directory for the Sigstore TUF cache. On serverless (read-only FS) point
   * this at a writable path such as `/tmp`. Defaults to sigstore's own path.
   */
  tufCachePath?: string
}

/** Minimal view of the SLSA v1 in-toto statement this module reads. */
interface SlsaStatement {
  subject?: Array<{ digest?: { sha256?: string } }>
  predicate?: {
    buildDefinition?: {
      resolvedDependencies?: Array<{ uri?: string; digest?: { gitCommit?: string } }>
      externalParameters?: { workflow?: { repository?: string; path?: string } }
      internalParameters?: { github?: { event_name?: string } }
    }
    runDetails?: { builder?: { id?: string } }
  }
}

interface GithubAttestation {
  bundle?: Bundle
  bundle_url?: string
}

const REPO_RE = /^[^/]+\/[^/]+$/

function fail(error: string): CheckSlsaResult {
  return { verified: false, error }
}

/** Escapes regex metacharacters so untrusted input can't alter a RegExp's meaning. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}

function decodePayload(bundle: Bundle): SlsaStatement {
  const payload = bundle.dsseEnvelope?.payload
  if (!payload) throw new Error('Bundle has no DSSE envelope')
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
}

/** Certificate SAN -> "URI:https://github.com/<repo>/.github/workflows/<file>@<ref>". */
function certSAN(bundle: Bundle): string {
  const vm = bundle.verificationMaterial
  const der = vm.certificate?.rawBytes ?? vm.x509CertificateChain?.certificates?.[0]?.rawBytes
  if (!der) throw new Error('No certificate in bundle')
  const cert = new X509Certificate(Buffer.from(der, 'base64'))
  return cert.subjectAltName ?? ''
}

export async function checkSlsa(input: CheckSlsaInput): Promise<CheckSlsaResult> {
  const { attestationRepo, signingRepo, token } = input

  if (!REPO_RE.test(attestationRepo)) {
    return fail(`Invalid attestationRepo, expected 'owner/name': ${attestationRepo}`)
  }
  if (!REPO_RE.test(signingRepo)) {
    return fail(`Invalid signingRepo, expected 'owner/name': ${signingRepo}`)
  }

  const D = input.digest.replace(/^sha256:/, '')
  if (!/^[a-f0-9]{64}$/.test(D)) {
    return fail(`Invalid digest, expected 64 hex (sha256): ${input.digest}`)
  }

  // --- 1) fetch the bundle from GitHub BY DIGEST (no registry) ---
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let data: { attestations?: GithubAttestation[]; message?: string }
  try {
    const resp = await fetch(
      `https://api.github.com/repos/${attestationRepo}/attestations/sha256:${D}`,
      { headers },
    )
    data = (await resp.json().catch(() => ({}))) as {
      attestations?: GithubAttestation[]
      message?: string
    }
    if (!resp.ok) {
      return fail(`GitHub API ${resp.status}: ${data.message ?? resp.statusText}`)
    }
  } catch (e) {
    return fail(`Failed to reach GitHub: ${(e as Error).message}`)
  }

  const attestation = data.attestations?.[0]
  const bundle = attestation?.bundle
  if (!bundle) {
    return fail(`No attestation found for sha256:${D} in ${attestationRepo}`)
  }

  // --- 2) cryptographic verification: signature + Fulcio + Rekor + OIDC issuer ---
  try {
    await verify(bundle, {
      certificateIssuer: ISSUER,
      tufCachePath: input.tufCachePath,
    })
  } catch (e) {
    return fail(`Signature verification failed: ${(e as Error).message}`)
  }

  // --- 3) signer identity (cert SAN) against the SIGNING repo ---
  let san: string
  try {
    san = certSAN(bundle)
  } catch (e) {
    return fail((e as Error).message)
  }
  const identityRe = new RegExp(`^URI:https://github\\.com/${escapeRegExp(signingRepo)}/\\.github/workflows/`)
  if (!identityRe.test(san)) {
    return fail(
      `Signer identity mismatch. expected ^URI:https://github.com/${signingRepo}/.github/workflows/ , got: ${san}`,
    )
  }

  // --- 4) binding: attestation subject == supplied digest ---
  const payload = decodePayload(bundle)
  const subject = payload.subject?.find((s) => s.digest?.sha256)?.digest?.sha256
  if (subject !== D) {
    return fail(`Attestation is bound to a different image: expected ${D}, got ${subject}`)
  }

  // --- 5) extract the source ---
  const buildDef = payload.predicate?.buildDefinition ?? {}
  const dep = buildDef.resolvedDependencies?.[0] ?? {}
  const entryWf = buildDef.externalParameters?.workflow ?? {} // triggering workflow
  const builderId = payload.predicate?.runDetails?.builder?.id // builder (reusable) workflow
  const trigger = buildDef.internalParameters?.github?.event_name ?? null

  const commit = dep.digest?.gitCommit ?? null
  const repoUrl = (dep.uri ?? '').replace(/^git\+/, '').replace(/@.*$/, '')
  const sourceRepo = repoUrl.replace(/^https:\/\/github\.com\//, '') || null
  const commitUrl = repoUrl && commit ? `${repoUrl}/tree/${commit}` : null

  const workflowUrl =
    entryWf.repository && entryWf.path && commit
      ? `${entryWf.repository}/blob/${commit}/${entryWf.path}`
      : null

  let builderUrl = builderId ?? null
  const bMatch = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(.+)@([^@]+)$/.exec(builderId ?? '')
  if (bMatch) builderUrl = `https://github.com/${bMatch[1]}/blob/${bMatch[3]}/${bMatch[2]}`

  const rekorUrl = `https://search.sigstore.dev/?hash=${D}`

  // The exact attestation id is not exposed by the API; deduce it from the
  // (undocumented) bundle_url, best-effort. Fallback: the attestations page.
  const attId = /\/(\d+)\.json/.exec(attestation.bundle_url ?? '')?.[1]
  const attestationUrl = attId
    ? `https://github.com/${attestationRepo}/attestations/${attId}`
    : `https://github.com/${attestationRepo}/attestations`

  const provenance: SlsaProvenance = {
    image: `sha256:${D}`,
    sourceRepo,
    commit,
    commitUrl,
    workflowUrl,
    builderUrl,
    rekorUrl,
    attestationUrl,
    trigger,
  }
  return { verified: true, provenance }
}
