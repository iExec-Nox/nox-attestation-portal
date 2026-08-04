import { CopyButton } from './CopyButton.tsx'
import { MatIcon } from './MatIcon.tsx'
import { Verdict } from './Verdict.tsx'

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
