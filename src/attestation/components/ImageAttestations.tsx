import { useEffect, useMemo, useState } from 'react'

import {
  CopyButton,
  Eyebrow,
  MatIcon,
  StatusBadge,
  getComponentIcon,
  truncHash,
} from '../../shared/ui/index.tsx'
import { fetchImageProvenance } from '../services/attestation-provenance.ts'
import { extractComposeImages } from '../services/compose-images.ts'
import type { AttestedImage, CheckSlsaResult, SlsaProvenance } from '../types/index.ts'

type ProvenanceState = { status: 'verifying' } | { status: 'done'; result: CheckSlsaResult }

/** React list key: service names are unique within a compose. */
const imageKey = (img: AttestedImage): string => img.service

/** Verification-state key: by digest, so images sharing one digest share state. */
const stateKey = (img: AttestedImage): string => img.digest ?? img.service

/* ── External-link icon button (mirrors SummaryRow's link affordance) ── */
function ExtLink({ href, title }: Readonly<{ href: string; title: string }>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      style={{
        width: 24,
        height: 24,
        borderRadius: 7,
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'var(--ct-fg-4)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      <MatIcon name="open_in_new" size={12} />
    </a>
  )
}

/* ── One label/value row, value optionally a link, optionally copyable ── */
function InfoRow({
  label,
  value,
  href,
  copyText,
}: Readonly<{ label: string; value: string; href?: string | null; copyText?: string }>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '104px 1fr auto',
        gap: 12,
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          font: '700 10px/16px var(--ct-font-ui)',
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: 'var(--ct-fg-5)',
        }}
      >
        {label}
      </div>
      <div
        title={value}
        style={{
          font: '500 12px/19px var(--ct-font-mono)',
          color: href ? 'var(--ct-brand)' : 'var(--ct-fg-2)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {copyText && <CopyButton text={copyText} size={24} label={label} />}
        {href && <ExtLink href={href} title={`Open ${label} in new tab`} />}
      </div>
    </div>
  )
}

/** Human-readable workflow path from a `…/blob/<sha>/<path>` GitHub URL. */
function workflowPath(url: string | null): string | null {
  if (!url) return null
  const after = url.split('/blob/')[1]
  if (!after) return url
  return after.split('/').slice(1).join('/') || url
}

/* ── Chain-of-trust links for a verified image ── */
function ProvenanceLinks({ provenance }: Readonly<{ provenance: SlsaProvenance }>) {
  const p = provenance
  const source =
    p.sourceRepo && p.commit ? `${p.sourceRepo}@${p.commit.slice(0, 7)}` : (p.sourceRepo ?? '—')
  const wfPath = workflowPath(p.workflowUrl)
  const builderPath = workflowPath(p.builderUrl)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {p.commitUrl && (
        <InfoRow
          label="Source"
          value={source}
          href={p.commitUrl}
          copyText={p.commit ?? undefined}
        />
      )}
      {wfPath && p.workflowUrl && (
        <InfoRow label="Build workflow" value={wfPath} href={p.workflowUrl} />
      )}
      {builderPath && p.builderUrl && (
        <InfoRow label="Builder" value={builderPath} href={p.builderUrl} />
      )}
      <InfoRow
        label="SLSA attestation"
        value={p.attestationUrl.replace('https://github.com/', '')}
        href={p.attestationUrl}
      />
      <InfoRow label="Rekor record" value="search.sigstore.dev" href={p.rekorUrl} />
      {p.trigger && <InfoRow label="Trigger" value={p.trigger} />}
    </div>
  )
}

/* ── Small neutral pill for the third-party badge ── */
function ThirdPartyBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 9999,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'var(--ct-fg-4)',
        font: '700 11px/1 var(--ct-font-ui)',
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <MatIcon name="public" size={12} />
      Third-party
    </span>
  )
}

function CardBadge({ image, state }: Readonly<{ image: AttestedImage; state?: ProvenanceState }>) {
  if (image.verifiability === 'third-party') return <ThirdPartyBadge />
  if (!state || state.status === 'verifying') return <StatusBadge status="verifying" />
  return <StatusBadge status={state.result.verified ? 'verified' : 'failed'} />
}

/* ── One image card ── */
function ImageCard({ image, state }: Readonly<{ image: AttestedImage; state?: ProvenanceState }>) {
  const hex = image.digest?.replace(/^sha256:/, '')
  const result = state?.status === 'done' ? state.result : null
  const provenance = result?.verified ? result.provenance : null
  const error = result && !result.verified ? result.error : null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 14,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ct-brand-tint-18)',
            border: '1px solid var(--ct-brand-border)',
            color: 'var(--ct-brand)',
          }}
        >
          <MatIcon name={getComponentIcon(image.registryPath)} size={17} />
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 1 }}>
          <span
            style={{
              font: '700 13px/17px var(--ct-font-display)',
              color: 'var(--ct-fg-1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {image.service}
          </span>
          <span
            title={image.registryPath}
            style={{
              font: '500 11px/15px var(--ct-font-mono)',
              color: 'var(--ct-fg-5)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {image.registryPath}
          </span>
        </div>
        <CardBadge image={image} state={state} />
      </div>

      {/* digest */}
      {hex && (
        <InfoRow label="Digest" value={`sha256:${truncHash(hex, 10, 8)}`} copyText={image.digest} />
      )}

      {/* provenance / states */}
      {provenance && <ProvenanceLinks provenance={provenance} />}

      {image.verifiability === 'third-party' && (
        <p
          style={{
            font: '400 12px/18px var(--ct-font-ui)',
            color: 'var(--ct-fg-5)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <MatIcon name="info" size={14} />
          External image — no iExec SLSA attestation to verify.
        </p>
      )}

      {error && (
        <p
          style={{
            font: '500 12px/18px var(--ct-font-mono)',
            color: '#FCA5A5',
            margin: 0,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
          }}
        >
          <MatIcon name="error" size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Supply-chain section: lists every image (and iexec-sidecar) in the attested
 * docker-compose and, per image, verifies and shows its SLSA attestation,
 * Rekor record, source repo:commit and build workflow.
 */
export function ImageAttestations({ composeContent }: Readonly<{ composeContent: string }>) {
  const images = useMemo(() => extractComposeImages(composeContent), [composeContent])
  const [states, setStates] = useState<Record<string, ProvenanceState>>({})

  useEffect(() => {
    let cancelled = false
    // No initial setState here (a missing entry already renders as "verifying");
    // we only record results as they resolve, off the synchronous effect path.
    for (const img of images) {
      if (img.verifiability !== 'verifiable') continue
      fetchImageProvenance(img).then((result) => {
        if (cancelled) return
        setStates((prev) => ({ ...prev, [stateKey(img)]: { status: 'done', result } }))
      })
    }

    return () => {
      cancelled = true
    }
  }, [images])

  if (images.length === 0) return null

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MatIcon name="account_tree" size={16} style={{ color: 'var(--ct-brand)' }} />
        <Eyebrow>Supply chain · {images.length} images</Eyebrow>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {images.map((img) => (
          <ImageCard key={imageKey(img)} image={img} state={states[stateKey(img)]} />
        ))}
      </div>
    </div>
  )
}
