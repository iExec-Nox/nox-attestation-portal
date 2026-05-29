import { useState } from 'react'
import type { CSSProperties } from 'react'

/* ── MatIcon: Material Symbols Rounded helper ── */
export const MatIcon = ({
  name,
  size = 20,
  color,
  style = {},
}: {
  name: string
  size?: number
  color?: string
  style?: CSSProperties
}) => (
  <span className="mi" style={{ fontSize: size, color, lineHeight: 1, ...style }}>
    {name}
  </span>
)

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
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1100)
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

/* ── Time helpers ── */
export function formatAgo(ts: number | null | undefined): string {
  if (!ts) return '—'
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'Just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function truncHash(h: string | undefined, head = 6, tail = 4): string {
  if (!h) return ''
  if (h.length <= head + tail + 2) return h
  return h.slice(0, head + 2) + '…' + h.slice(-tail)
}

/* ── StatusBadge ── */
export type Status = 'verified' | 'failed' | 'verifying' | 'pending'

const BADGE_MAP: Record<
  Status,
  { label: string; dot: string; fg: string; bg: string; border: string }
> = {
  verified: {
    label: 'Verified',
    dot: 'var(--ct-success)',
    fg: 'var(--ct-success-light)',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
  },
  failed: {
    label: 'Failed',
    dot: '#F87171',
    fg: '#FCA5A5',
    bg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.30)',
  },
  verifying: {
    label: 'Verifying',
    dot: 'var(--ct-brand)',
    fg: 'var(--ct-indigo-200)',
    bg: 'var(--ct-brand-tint-18)',
    border: 'var(--ct-brand-border)',
  },
  pending: {
    label: 'Pending',
    dot: 'var(--ct-fg-5)',
    fg: 'var(--ct-fg-4)',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.10)',
  },
}

export const StatusBadge = ({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'lg' }) => {
  const s = BADGE_MAP[status] ?? BADGE_MAP.pending
  const big = size === 'lg'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: big ? 8 : 6,
        padding: big ? '6px 12px' : '3px 9px',
        borderRadius: 9999,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.fg,
        font: `700 ${big ? 12 : 11}px/1 var(--ct-font-ui)`,
        letterSpacing: '0.4px',
        textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const,
      }}
    >
      <span
        style={{
          width: big ? 7 : 6,
          height: big ? 7 : 6,
          borderRadius: 9999,
          background: s.dot,
          boxShadow: status === 'verifying' ? undefined : `0 0 0 3px ${s.dot}22`,
          animation: status === 'verifying' ? 'badge-pulse 1.2s ease-in-out infinite' : undefined,
        }}
      />
      {s.label}
    </span>
  )
}

/* ── StepStatusIcon ── */
const STEP_STATUS_MAP: Record<
  string,
  { bg: string; border: string; color: string; icon: string; scale: number }
> = {
  verified: {
    bg: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.40)',
    color: 'var(--ct-success-light)',
    icon: 'check',
    scale: 0.62,
  },
  failed: {
    bg: 'rgba(248,113,113,0.12)',
    border: '1px solid rgba(248,113,113,0.45)',
    color: '#FCA5A5',
    icon: 'close',
    scale: 0.62,
  },
  verifying: {
    bg: 'var(--ct-brand-tint-18)',
    border: '1px solid var(--ct-brand)',
    color: 'var(--ct-brand)',
    icon: 'bolt',
    scale: 0.5,
  },
  pending: {
    bg: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'var(--ct-fg-5)',
    icon: 'schedule',
    scale: 0.52,
  },
}

export const StepStatusIcon = ({ status, size = 28 }: { status: string; size?: number }) => {
  const s = STEP_STATUS_MAP[status] ?? STEP_STATUS_MAP.pending
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        flexShrink: 0,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: s.bg,
        border: s.border,
        color: s.color,
      }}
    >
      {status === 'verifying' && (
        <span
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 9999,
            border: '2px solid transparent',
            borderTopColor: 'var(--ct-brand)',
            borderRightColor: 'var(--ct-brand)',
            animation: 'spin 0.9s linear infinite',
          }}
        />
      )}
      <MatIcon name={s.icon} size={size * s.scale} />
    </span>
  )
}

/* ── Verdict ── */
function verdictStyle(ok: boolean, mute?: boolean) {
  if (mute) return { bg: 'transparent', border: '1px solid rgba(255,255,255,0.10)' }
  if (ok) return { bg: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.30)' }
  return { bg: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.32)' }
}

export const Verdict = ({ ok, mute }: { ok: boolean; mute?: boolean }) => {
  const { bg, border } = verdictStyle(ok, mute)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        borderRadius: 9999,
        background: bg,
        border,
        color: ok ? 'var(--ct-success-light)' : '#FCA5A5',
        font: '700 10px/1 var(--ct-font-ui)',
        letterSpacing: '0.4px',
        textTransform: 'uppercase' as const,
      }}
    >
      <MatIcon name={ok ? 'check' : 'close'} size={11} />
      {ok ? 'Matched' : 'Mismatch'}
    </span>
  )
}

/* ── HashRow: label + mono hash + verdict + copy ── */
export const HashRow = ({
  label,
  value,
  ok = true,
  compact = false,
}: {
  label: string
  value: string
  ok?: boolean
  compact?: boolean
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '80px 1fr auto auto',
      gap: 12,
      alignItems: 'center',
      padding: compact ? '6px 10px' : '10px 12px',
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
        textTransform: 'uppercase' as const,
        color: 'var(--ct-fg-5)',
      }}
    >
      {label}
    </div>
    <div
      title={value}
      style={{
        font: '500 12px/19px var(--ct-font-mono)',
        color: ok ? 'var(--ct-fg-2)' : '#FCA5A5',
        fontVariantNumeric: 'tabular-nums' as const,
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {value}
    </div>
    <Verdict ok={ok} />
    <CopyButton text={value} label={label} />
  </div>
)

/* ── PrimaryCTA ── */
export const PrimaryCTA = ({
  children,
  icon,
  onClick,
  size = 'md',
  disabled = false,
  loading = false,
  full = false,
  style = {},
}: {
  children: React.ReactNode
  icon?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  full?: boolean
  style?: CSSProperties
}) => {
  const sz = {
    sm: { h: 32, fs: 13, px: 14 },
    md: { h: 40, fs: 14, px: 18 },
    lg: { h: 48, fs: 15, px: 22 },
  }[size]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        height: sz.h,
        padding: `0 ${sz.px}px`,
        width: full ? '100%' : 'auto',
        borderRadius: 12,
        background: 'var(--ct-brand)',
        border: 0,
        boxShadow: disabled ? 'none' : 'var(--ct-shadow-glow)',
        color: '#fff',
        font: `700 ${sz.fs}px/1 var(--ct-font-display)`,
        letterSpacing: '0.2px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: disabled || loading ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 150ms ease',
        flexShrink: 0,
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            width: sz.fs,
            height: sz.fs,
            borderRadius: 9999,
            border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: '#fff',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        icon && <MatIcon name={icon} size={sz.fs + 3} />
      )}
      {loading ? 'Verifying…' : children}
    </button>
  )
}

/* ── SecondaryButton ── */
export const SecondaryButton = ({
  children,
  icon,
  onClick,
  size = 'md',
  disabled = false,
  loading = false,
  style = {},
}: {
  children: React.ReactNode
  icon?: string
  onClick?: () => void
  size?: 'sm' | 'md'
  disabled?: boolean
  loading?: boolean
  style?: CSSProperties
}) => {
  const sz = { sm: { h: 30, fs: 12, px: 12 }, md: { h: 36, fs: 13, px: 14 } }[size]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        height: sz.h,
        padding: `0 ${sz.px}px`,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'var(--ct-fg-2)',
        font: `700 ${sz.fs}px/1 var(--ct-font-display)`,
        letterSpacing: '0.2px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: disabled || loading ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            width: sz.fs,
            height: sz.fs,
            borderRadius: 9999,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'var(--ct-brand)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        icon && <MatIcon name={icon} size={sz.fs + 3} />
      )}
      {loading ? 'Verifying…' : children}
    </button>
  )
}

/* ── Eyebrow ── */
export const Eyebrow = ({
  children,
  color = 'var(--ct-fg-5)',
}: {
  children: React.ReactNode
  color?: string
}) => (
  <div
    style={{
      font: '700 11px/16px var(--ct-font-ui)',
      letterSpacing: '1.4px',
      textTransform: 'uppercase' as const,
      color,
    }}
  >
    {children}
  </div>
)

/* ── Component meta: icons + descriptions per NOX service type ── */
const COMPONENT_META = [
  {
    key: 'nox-gateway-journal',
    icon: 'menu_book',
    desc: 'Append-only audit journal mirroring the gateway in the NOX Protocol.',
  },
  {
    key: 'nox-gateway',
    icon: 'hub',
    desc: 'REST gateway for encrypted value storage and delegation in the NOX Protocol.',
  },
  {
    key: 'nox-kms',
    icon: 'key',
    desc: 'Key Management Service for ECIES delegation in the NOX Protocol.',
  },
  {
    key: 'nox-runner',
    icon: 'settings_suggest',
    desc: 'Off-chain computation worker for confidential operations in the NOX Protocol.',
  },
] as const

export function getComponentIcon(name: string): string {
  return COMPONENT_META.find(({ key }) => name.includes(key))?.icon ?? 'memory'
}

export function getComponentDescription(name: string): string {
  return COMPONENT_META.find(({ key }) => name.includes(key))?.desc ?? 'NOX Protocol CVM component.'
}

/* ── SummaryRow: label + value + optional actions + Verdict ── */
export function SummaryRow({
  label,
  value,
  ok = true,
  link = false,
  copyable = false,
  href,
}: Readonly<{
  label: string
  value: string
  ok?: boolean
  link?: boolean
  copyable?: boolean
  href?: string
}>) {
  function valueColor() {
    if (link) return 'var(--ct-brand)'
    if (ok) return 'var(--ct-fg-2)'
    return '#FCA5A5'
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr auto',
        gap: 12,
        alignItems: 'center',
        padding: '9px 12px',
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
          textTransform: 'uppercase' as const,
          color: 'var(--ct-fg-5)',
        }}
      >
        {label}
      </div>
      <div
        title={value}
        style={{
          font: '500 12px/19px var(--ct-font-mono)',
          color: valueColor(),
          fontVariantNumeric: 'tabular-nums' as const,
          whiteSpace: 'nowrap' as const,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {copyable && <CopyButton text={value} size={24} label={label} />}
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            title="Open in new tab"
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
            }}
          >
            <MatIcon name="open_in_new" size={12} />
          </a>
        )}
        <Verdict ok={ok} />
      </div>
    </div>
  )
}
