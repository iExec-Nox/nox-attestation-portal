import { useEffect, useMemo, useState } from 'react'

import {
  CopyButton,
  MatIcon,
  StatusBadge,
  getComponentIcon,
  truncHash,
} from '../../shared/ui/index.tsx'
import { fetchImageProvenance } from '../services/attestation-provenance.ts'
import { extractComposeImages } from '../services/compose-images.ts'
import type { AttestedImage, CheckSlsaResult, SlsaProvenance } from '../types/index.ts'

export type ProvenanceState = { status: 'verifying' } | { status: 'done'; result: CheckSlsaResult }

/** React list key: service names are unique within a compose. */
const imageKey = (img: AttestedImage): string => img.service

/** Verification-state key: by digest, so images sharing one digest share state. */
export const stateKey = (img: AttestedImage): string => img.digest ?? img.service

/**
 * Extracts the images referenced by a compose manifest and verifies each
 * one's SLSA provenance. Lifted out of the list component so the parent
 * section can also read `images`/`states` to render an at-a-glance summary.
 */
export function useWorkloadImages(composeContent: string) {
  const images = useMemo(() => extractComposeImages(composeContent), [composeContent])
  const [states, setStates] = useState<Record<string, ProvenanceState>>({})

  useEffect(() => {
    let cancelled = false
    // No initial setState here (a missing entry already renders as "verifying");
    // we only record results as they resolve, off the synchronous effect path.
    for (const img of images) {
      if (img.verifiability !== 'verifiable') continue
      fetchImageProvenance(img)
        .catch(
          (err: unknown): CheckSlsaResult => ({
            // An unexpected rejection would otherwise leave the card on
            // "Verifying" forever — degrade it to a visible failure instead.
            verified: false,
            reason: 'request-failed',
            error: err instanceof Error ? err.message : 'Verification request failed',
          }),
        )
        .then((result) => {
          if (cancelled) return
          setStates((prev) => ({ ...prev, [stateKey(img)]: { status: 'done', result } }))
        })
    }

    return () => {
      cancelled = true
    }
  }, [images])

  return { images, states }
}

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
        <InfoRow label="Triggering workflow" value={wfPath} href={p.workflowUrl} />
      )}
      {builderPath && p.builderUrl && (
        <InfoRow label="Signer workflow" value={builderPath} href={p.builderUrl} />
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

/* ── Small status pill, for the states StatusBadge doesn't cover ── */
function Pill({
  label,
  icon,
  fg,
  bg,
  border,
}: Readonly<{ label: string; icon: string; fg: string; bg: string; border: string }>) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 9999,
        background: bg,
        border: `1px solid ${border}`,
        color: fg,
        font: '700 11px/1 var(--ct-font-ui)',
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <MatIcon name={icon} size={12} />
      {label}
    </span>
  )
}

const THIRDPARTY_PILL = {
  fg: 'var(--ct-fg-4)',
  bg: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
}
const TAGPIN_PILL = { fg: '#FDBA74', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.32)' }
const NOATT_PILL = { fg: '#FCD34D', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.30)' }

function CardBadge({ image, state }: Readonly<{ image: AttestedImage; state?: ProvenanceState }>) {
  if (image.verifiability === 'third-party')
    return <Pill label="Third-party" icon="public" {...THIRDPARTY_PILL} />
  if (image.verifiability === 'tag-pin')
    return <Pill label="Tag pin" icon="sell" {...TAGPIN_PILL} />

  // verifiable → the badge follows the async verification result
  if (!state || state.status === 'verifying') return <StatusBadge status="verifying" />
  const result = state.result
  if (result.verified) return <StatusBadge status="verified" />
  if (result.reason === 'no-attestation')
    return <Pill label="No attestation" icon="gpp_maybe" {...NOATT_PILL} />
  return <StatusBadge status="failed" />
}

/* ── Explanatory note under a card, for non-verified states ── */
function Note({
  icon,
  color,
  mono,
  children,
}: Readonly<{ icon: string; color: string; mono?: boolean; children: string }>) {
  return (
    <p
      style={{
        font: `${mono ? 500 : 400} 12px/18px var(--ct-font-${mono ? 'mono' : 'ui'})`,
        color,
        margin: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
      }}
    >
      <MatIcon name={icon} size={14} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </p>
  )
}

function CardNote({
  image,
  result,
}: Readonly<{ image: AttestedImage; result: CheckSlsaResult | null }>) {
  if (image.verifiability === 'third-party')
    return (
      <Note icon="public" color="var(--ct-fg-5)">
        External image — no iExec SLSA attestation to verify.
      </Note>
    )
  if (image.verifiability === 'tag-pin')
    return (
      <Note icon="sell" color="#FDBA74">
        {`Pinned by tag${image.tag ? ` (${image.tag})` : ''}, not by digest — a sha256 pin is required to verify SLSA provenance.`}
      </Note>
    )
  if (!result || result.verified) return null
  if (result.reason === 'no-attestation')
    return (
      <Note icon="gpp_maybe" color="#FCD34D">
        No SLSA attestation found for this digest — the image may be unsigned.
      </Note>
    )
  return (
    <Note icon="error" color="#FCA5A5" mono>
      {result.error}
    </Note>
  )
}

/* ── One image card (collapsible) ── */
function ImageCard({ image, state }: Readonly<{ image: AttestedImage; state?: ProvenanceState }>) {
  const [collapsed, setCollapsed] = useState(true)
  const hex = image.digest?.replace(/^sha256:/, '')
  const result = state?.status === 'done' ? state.result : null
  const provenance = result?.verified ? result.provenance : null

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
      {/* header (click to collapse/expand) */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
        }}
      >
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
        <MatIcon
          name={collapsed ? 'expand_more' : 'expand_less'}
          size={18}
          color="var(--ct-fg-5)"
        />
      </button>

      {!collapsed && (
        <>
          {hex && (
            <InfoRow
              label="Digest"
              value={`sha256:${truncHash(hex, 10, 8)}`}
              copyText={image.digest}
            />
          )}

          {provenance && <ProvenanceLinks provenance={provenance} />}

          <CardNote image={image} result={result} />
        </>
      )}
    </div>
  )
}

/**
 * Component list: one collapsible card per image (or iexec-sidecar) in the
 * attested docker-compose, each showing its SLSA attestation, Rekor record,
 * source repo:commit and build workflow. Pure rendering — `images`/`states`
 * come from `useWorkloadImages` so the parent section can also read them to
 * render an at-a-glance summary.
 */
export function ImageAttestations({
  images,
  states,
}: Readonly<{ images: AttestedImage[]; states: Record<string, ProvenanceState> }>) {
  if (images.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {images.map((img) => (
        <ImageCard key={imageKey(img)} image={img} state={states[stateKey(img)]} />
      ))}
    </div>
  )
}
