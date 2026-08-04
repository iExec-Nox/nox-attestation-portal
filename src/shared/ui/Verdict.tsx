import { MatIcon } from './MatIcon.tsx'

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
