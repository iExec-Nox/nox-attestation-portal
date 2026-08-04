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
