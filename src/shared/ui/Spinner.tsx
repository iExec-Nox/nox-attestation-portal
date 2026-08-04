/* ── Spinner: rotating border-arc loading indicator ──
   Decorative by default; pass `label` when it is the only loading signal. */
export const Spinner = ({
  size = 14,
  color = 'var(--ct-brand)',
  track = 'rgba(255,255,255,0.15)',
  label,
}: {
  size?: number
  color?: string
  track?: string
  label?: string
}) => (
  <span
    role={label ? 'status' : undefined}
    aria-hidden={label ? undefined : true}
    style={label ? { display: 'inline-flex', alignItems: 'center' } : undefined}
  >
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        border: `${Math.max(2, Math.round(size / 12))}px solid ${track}`,
        borderTopColor: color,
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
    {label && (
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {label}
      </span>
    )}
  </span>
)
