import { useState } from 'react'
import {
  MatIcon,
  PrimaryCTA,
  SecondaryButton,
  StatusBadge,
  Eyebrow,
  formatAgo,
  getComponentIcon,
  getComponentDescription,
  type Status,
} from '../../shared/ui/index.tsx'
import type { CvmInfo } from '../types/index.ts'

interface ComponentDetailProps {
  cvm: CvmInfo
  status: Status
  lastVerified: number | null
  onVerify: () => void
}

export function ComponentDetail({
  cvm,
  status,
  lastVerified,
  onVerify,
}: Readonly<ComponentDetailProps>) {
  const [urlCopied, setUrlCopied] = useState(false)
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(cvm.url).catch(() => {})
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 1100)
  }

  const icon = getComponentIcon(cvm.name)
  const description = getComponentDescription(cvm.name)

  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Top row: icon + info + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--ct-brand-tint-18)',
            border: '1px solid var(--ct-brand-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ct-brand)',
            flexShrink: 0,
          }}
        >
          <MatIcon name={icon} size={26} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow>Component detail</Eyebrow>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 6,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                font: '700 22px/28px var(--ct-font-display)',
                color: 'var(--ct-fg-1)',
                letterSpacing: '-0.3px',
              }}
            >
              {cvm.name}
            </span>
            <StatusBadge status={status} size="lg" />
          </div>
          <div
            style={{
              font: '400 13px/19px var(--ct-font-ui)',
              color: 'var(--ct-fg-4)',
              marginTop: 6,
            }}
          >
            {description}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingTop: 4 }}>
          {status === 'pending' && (
            <PrimaryCTA icon="verified_user" onClick={onVerify} size="md">
              Verify now
            </PrimaryCTA>
          )}
          {status === 'verifying' && (
            <PrimaryCTA icon="verified_user" loading size="md">
              Verifying
            </PrimaryCTA>
          )}
          {(status === 'verified' || status === 'failed') && (
            <SecondaryButton icon="refresh" onClick={onVerify} size="md">
              Re-verify
            </SecondaryButton>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          paddingTop: 4,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            font: '500 12px/1 var(--ct-font-ui)',
            color: 'var(--ct-fg-4)',
          }}
        >
          <MatIcon name="schedule" size={14} color="var(--ct-fg-5)" />
          {lastVerified ? `Last verified ${formatAgo(lastVerified)}` : 'Not yet verified'}
        </span>
        {cvm.instance && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.15)', font: '400 12px/1 var(--ct-font-ui)' }}>
              ·
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                font: '500 12px/1 var(--ct-font-mono)',
                color: 'var(--ct-fg-4)',
              }}
            >
              <MatIcon name="dns" size={14} color="var(--ct-fg-5)" />
              {cvm.instance}
            </span>
          </>
        )}
        <span style={{ color: 'rgba(255,255,255,0.15)', font: '400 12px/1 var(--ct-font-ui)' }}>
          ·
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            font: '500 12px/1 var(--ct-font-mono)',
            color: 'var(--ct-fg-4)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <MatIcon name="fingerprint" size={14} color="var(--ct-fg-5)" />
          {cvm.app_id.slice(0, 24)}…
        </span>
      </div>

      {/* Quote URL row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <MatIcon name="cloud" size={15} color="var(--ct-fg-5)" />
        <span
          style={{
            font: '500 11px/1 var(--ct-font-ui)',
            color: 'var(--ct-fg-5)',
            flexShrink: 0,
          }}
        >
          Quote · Attestation Service
        </span>
        <span
          style={{
            font: '500 12px/1 var(--ct-font-mono)',
            color: 'var(--ct-fg-3)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={cvm.url}
        >
          {cvm.url}
        </span>
        <button
          type="button"
          onClick={handleCopyUrl}
          title="Copy URL"
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: urlCopied ? 'var(--ct-brand-tint-18)' : 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            color: urlCopied ? 'var(--ct-brand)' : 'var(--ct-fg-4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MatIcon name={urlCopied ? 'check' : 'content_copy'} size={13} />
        </button>
        <a
          href={cvm.url}
          target="_blank"
          rel="noreferrer"
          title="Open in new tab"
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--ct-fg-4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <MatIcon name="open_in_new" size={13} />
        </a>
      </div>
    </div>
  )
}
