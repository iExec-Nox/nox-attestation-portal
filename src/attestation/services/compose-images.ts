import { resolveImageAttestation } from '../config/image-attestation-map.ts'
import type { AttestedImage } from '../types/index.ts'

/**
 * Extracts the container images (one per compose service) from an attested
 * docker-compose manifest, and classifies each as `verifiable` or
 * `third-party` using the static attestation mapping.
 *
 * The compose is parsed line-by-line (no YAML dependency, consistent with the
 * rest of the app). NOX images are digest-pinned (`image: repo@sha256:…`), so
 * the digest needed for SLSA verification comes straight from the manifest.
 */

/**
 * Unwraps the raw `app_compose` envelope. The aggregator sends a JSON object
 * whose `docker_compose_file` field holds the actual YAML; older/other shapes
 * may already be raw YAML, so we fall back to the input unchanged.
 */
function unwrapCompose(composeContent: string): string {
  try {
    const parsed = JSON.parse(composeContent) as { docker_compose_file?: unknown }
    if (parsed && typeof parsed.docker_compose_file === 'string') {
      return parsed.docker_compose_file
    }
  } catch {
    // Not JSON — assume it is already raw YAML.
  }
  return composeContent
}

/**
 * Splits a Docker image reference into its parts.
 * `registry[:port]/name[:tag][@sha256:…]` — the tag is the last `:` that comes
 * after the last `/`, so a registry port is not mistaken for a tag.
 */
export function parseImageRef(ref: string): {
  registryPath: string
  tag?: string
  digest?: string
} {
  let rest = ref.trim()
  let digest: string | undefined

  const at = rest.indexOf('@')
  if (at !== -1) {
    digest = rest.slice(at + 1)
    rest = rest.slice(0, at)
  }

  let tag: string | undefined
  const lastSlash = rest.lastIndexOf('/')
  const lastColon = rest.lastIndexOf(':')
  if (lastColon > lastSlash) {
    tag = rest.slice(lastColon + 1)
    rest = rest.slice(0, lastColon)
  }

  return { registryPath: rest, tag, digest }
}

const indentOf = (line: string): number => line.length - line.trimStart().length

/**
 * Parses the docker-compose manifest and returns one entry per service that
 * declares an `image:`. Order follows the manifest.
 */
export function extractComposeImages(composeContent: string): AttestedImage[] {
  const yaml = unwrapCompose(composeContent)
  const images: AttestedImage[] = []

  let inServices = false
  let serviceIndent = -1
  let currentService: string | null = null

  for (const raw of yaml.split('\n')) {
    if (raw.trim() === '' || raw.trimStart().startsWith('#')) continue

    const indent = indentOf(raw)
    const trimmed = raw.trim()

    if (!inServices) {
      if (/^services:\s*$/.test(trimmed)) inServices = true
      continue
    }

    // A top-level key ends the services block.
    if (indent === 0) {
      inServices = /^services:\s*$/.test(trimmed)
      serviceIndent = -1
      currentService = null
      continue
    }

    // The first child under `services:` sets the service-name indent level.
    if (serviceIndent === -1) serviceIndent = indent

    // A key at the service-name level with no inline value is a service name.
    if (indent === serviceIndent) {
      const nameMatch = /^([A-Za-z0-9_.-]+):\s*$/.exec(trimmed)
      if (nameMatch) currentService = nameMatch[1]
      continue
    }

    // Any deeper `image:` line belongs to the current service.
    const imageMatch = /^image:\s*["']?([^"'\s]+)["']?\s*$/.exec(trimmed)
    if (imageMatch && currentService) {
      const ref = imageMatch[1]
      const { registryPath, tag, digest } = parseImageRef(ref)
      const resolved = resolveImageAttestation(registryPath)
      images.push({
        service: currentService,
        ref,
        registryPath,
        tag,
        digest,
        verifiability: resolved ? 'verifiable' : 'third-party',
        attestation: resolved ?? undefined,
      })
    }
  }

  return images
}
