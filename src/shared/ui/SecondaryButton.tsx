import type { CSSProperties, ReactNode } from 'react'
import { MatIcon } from './MatIcon.tsx'
import { Spinner } from './Spinner.tsx'

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
  children: ReactNode
  icon?: string
  onClick?: () => void
  size?: 'sm' | 'md'
  disabled?: boolean
  loading?: boolean
  style?: CSSProperties
}) => {
  const sz = { sm: { h: 30, fs: 12, px: 12 }, md: { h: 36, fs: 13, px: 14 } }[size]
  const isDisabled = disabled || loading
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
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
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        flexShrink: 0,
        ...style,
      }}
    >
      {loading ? (
        <Spinner size={sz.fs} track="rgba(255,255,255,0.3)" />
      ) : (
        icon && <MatIcon name={icon} size={sz.fs + 3} />
      )}
      {loading ? 'Verifying…' : children}
    </button>
  )
}
