import { useState } from 'react'
import type { CSSProperties } from 'react'
import { SummarySection } from './SummarySection.tsx'
import { CodePreviewContainer } from './CodePreviewContainer.tsx'
import { ImageAttestations, stateKey, useWorkloadImages } from './ImageAttestations.tsx'
import type { ProvenanceState } from './ImageAttestations.tsx'
import { Eyebrow, MatIcon, Verdict } from '../../shared/ui/index.tsx'
import type { AttestationResult, AttestedImage } from '../types/index.ts'

function chipStyle(color: string, bg: string, border: string): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 9px',
    borderRadius: 9999,
    background: bg,
    border: `1px solid ${border}`,
    color,
    font: '700 11px/1 var(--ct-font-ui)',
    whiteSpace: 'nowrap',
  }
}

/**
 * At-a-glance verdict for the whole workload: are there failed image
 * attestations (needs attention), are images still being checked, or is
 * everything accounted for (attested + third-party breakdown).
 */
function WorkloadStats({
  images,
  states,
}: Readonly<{ images: AttestedImage[]; states: Record<string, ProvenanceState> }>) {
  let verified = 0
  let failed = 0
  let pending = 0
  let thirdParty = 0
  for (const img of images) {
    if (img.verifiability === 'third-party') {
      thirdParty++
      continue
    }
    const s = states[stateKey(img)]
    if (!s || s.status === 'verifying') pending++
    else if (s.result.verified) verified++
    else failed++
  }

  if (failed > 0) {
    return (
      <span style={chipStyle('#FCA5A5', 'rgba(248,113,113,0.12)', 'rgba(248,113,113,0.32)')}>
        <MatIcon name="error" size={12} />
        {failed} attestation{failed > 1 ? 's' : ''} failed
      </span>
    )
  }

  if (pending > 0) {
    return (
      <span
        style={chipStyle('var(--ct-brand)', 'var(--ct-brand-tint-18)', 'var(--ct-brand-border)')}
      >
        <MatIcon name="bolt" size={12} />
        Verifying {pending} image{pending > 1 ? 's' : ''}…
      </span>
    )
  }

  const verifiableTotal = verified
  const parts: string[] = []
  if (verifiableTotal > 0)
    parts.push(`${verifiableTotal} image${verifiableTotal > 1 ? 's' : ''} attested`)
  if (thirdParty > 0) parts.push(`${thirdParty} third-party`)

  return (
    <span
      style={chipStyle('var(--ct-success-light)', 'rgba(16,185,129,0.10)', 'rgba(16,185,129,0.25)')}
    >
      <MatIcon name="verified" size={12} />
      {parts.join(' · ') || 'No images'}
    </span>
  )
}

/**
 * Attested Workload: the docker-compose that was run, plus the supply-chain
 * (SLSA) provenance for every image it references — one artifact, one card.
 *
 * Ordered as the trust chain reads: the manifest is the thing whose hash is
 * bound to the hardware quote (top, primary evidence); the images it
 * references are that manifest's components, each independently traced back
 * to a source commit and build (below, supporting evidence).
 */
function AttestedWorkload({
  composeContent,
  dockerComposeContent,
  hash,
  ok,
}: Readonly<{
  composeContent: string
  dockerComposeContent: string
  hash: string
  ok: boolean
}>) {
  const [collapsed, setCollapsed] = useState(false)
  const { images, states } = useWorkloadImages(composeContent)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        background: 'var(--ct-surface-1, rgba(255,255,255,0.015))',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <MatIcon name="deployed_code" size={16} style={{ color: 'var(--ct-brand)' }} />
        <Eyebrow>Attested Workload</Eyebrow>
        <Verdict ok={ok} />
        {images.length > 0 && <WorkloadStats images={images} states={states} />}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ct-fg-4)',
            font: '600 12px/1 var(--ct-font-ui)',
            padding: '2px 0',
          }}
        >
          {collapsed ? 'Expand' : 'Collapse'}
          <MatIcon name={collapsed ? 'expand_more' : 'expand_less'} size={16} />
        </button>
      </div>
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CodePreviewContainer
            content={dockerComposeContent}
            filename="docker-compose.yaml"
            hash={hash || undefined}
            verdictOk={ok}
          />
          <ImageAttestations images={images} states={states} />
        </div>
      )}
    </div>
  )
}

export function AttestationReport({ result }: Readonly<{ result: AttestationResult }>) {
  const rawComposeHash = result.steps[5]?.data?.expected
  const composeHash = typeof rawComposeHash === 'string' ? rawComposeHash : ''
  const ok = result.status === 'verified'

  let dockerComposeContent: string
  try {
    dockerComposeContent =
      JSON.parse(result.composeContent || '{}').docker_compose_file ?? result.composeContent ?? ''
  } catch {
    dockerComposeContent = result.composeContent ?? ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SummarySection result={result} />
      {result.composeContent && (
        <AttestedWorkload
          composeContent={result.composeContent}
          dockerComposeContent={dockerComposeContent}
          hash={composeHash}
          ok={ok}
        />
      )}
    </div>
  )
}
