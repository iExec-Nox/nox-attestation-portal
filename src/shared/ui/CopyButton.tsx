import { useState } from 'react'
import { MatIcon } from './MatIcon.tsx'

/* ── CopyButton: self-contained copy-to-clipboard ── */
export const CopyButton = ({
  text,
  size = 26,
  label,
}: {
  text: string
  size?: number
  label?: string
}) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1100)
      })
      .catch(() => {})
  }
  const suffix = label ? ` ${label}` : ''
  const ariaLabel = copied ? `Copied${suffix}` : `Copy${suffix}`
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: copied ? 'var(--ct-brand-tint-18)' : 'transparent',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        color: copied ? 'var(--ct-brand)' : 'var(--ct-fg-4)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MatIcon name={copied ? 'check' : 'content_copy'} size={Math.round(size * 0.5)} />
    </button>
  )
}
