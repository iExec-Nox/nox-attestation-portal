import type { ReactNode } from 'react'

/* ── Eyebrow ── */
export const Eyebrow = ({
  children,
  color = 'var(--ct-fg-5)',
}: {
  children: ReactNode
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
