import type { CSSProperties, ReactNode } from 'react'
import { MatIcon } from './MatIcon.tsx'
import { Spinner } from './Spinner.tsx'

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
  children: ReactNode
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
        <Spinner size={sz.fs} color="#fff" track="rgba(255,255,255,0.4)" />
      ) : (
        icon && <MatIcon name={icon} size={sz.fs + 3} />
      )}
      {loading ? 'Verifying…' : children}
    </button>
  )
}
