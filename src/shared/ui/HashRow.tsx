import { CopyButton } from './CopyButton.tsx'
import { Verdict } from './Verdict.tsx'

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
