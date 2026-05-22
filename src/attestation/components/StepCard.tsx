import { MatIcon, StepStatusIcon, Verdict, HashRow } from '../../shared/ui/index.tsx'
import type { StepResult } from '../types/index.ts'

interface StepCardProps {
  step: StepResult
  isLast: boolean
  isExpanded: boolean
  onToggle: () => void
}

const LINE_COLOR: Record<StepResult['status'], string> = {
  verified: 'rgba(16,185,129,0.35)',
  verifying: 'rgba(116,142,255,0.35)',
  failed: 'rgba(255,255,255,0.08)',
  pending: 'rgba(255,255,255,0.08)',
}

const NAME_COLOR: Record<StepResult['status'], string> = {
  verifying: 'var(--ct-brand)',
  verified: 'var(--ct-fg-1)',
  failed: '#FCA5A5',
  pending: 'var(--ct-fg-4)',
}

export function StepCard({ step, isLast, isExpanded, onToggle }: Readonly<StepCardProps>) {
  const { status, data } = step
  const hasData = !!data && Object.keys(data).length > 0
  const canExpand = !!step.description || !!step.detail || !!step.error || hasData

  return (
    <div className="step-card" style={{ display: 'flex' }}>
      <div
        className="step-card__rail"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 36,
          flexShrink: 0,
        }}
      >
        <StepStatusIcon status={status} size={30} />
        {!isLast && (
          <div
            className="step-card__connector"
            style={{
              width: 2,
              flex: 1,
              minHeight: 24,
              background: LINE_COLOR[status],
              margin: '4px 0',
              transition: 'background 300ms ease',
            }}
          />
        )}
      </div>

      <div
        className="step-card__body"
        style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 20 }}
      >
        <div
          className="step-card__header-card"
          style={{
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            overflow: 'hidden',
          }}
        >
          <button
            className="step-card__toggle"
            type="button"
            onClick={onToggle}
            disabled={!canExpand}
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              padding: '9px 14px',
              cursor: canExpand ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              className="step-card__number"
              style={{
                font: '700 11px/1 var(--ct-font-mono)',
                color: 'var(--ct-fg-5)',
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}
            >
              {String(step.step).padStart(2, '0')}
            </span>

            <span
              className="step-card__name"
              style={{
                font: '700 15px/1 var(--ct-font-display)',
                color: NAME_COLOR[status],
                flex: 1,
                letterSpacing: '0.1px',
                transition: 'color 200ms ease',
              }}
            >
              {step.name}
            </span>

            {(status === 'verified' || status === 'failed') && (
              <Verdict ok={status === 'verified'} />
            )}

            {canExpand && status !== 'pending' && (
              <MatIcon
                name={isExpanded ? 'expand_less' : 'expand_more'}
                size={18}
                style={{ color: 'var(--ct-fg-5)', flexShrink: 0 }}
              />
            )}
          </button>

          {isExpanded && (step.description ?? step.detail) && (
            <div
              className="step-card__description"
              style={{ padding: '8px 14px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {step.description && (
                <p
                  style={{
                    font: '400 13px/20px var(--ct-font-ui)',
                    color: 'var(--ct-fg-4)',
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              )}
              {step.detail && (
                <p
                  style={{
                    font: '500 12px/18px var(--ct-font-ui)',
                    color: 'var(--ct-fg-3)',
                    margin: step.description ? '6px 0 0' : 0,
                  }}
                >
                  {step.detail}
                </p>
              )}
            </div>
          )}
        </div>

        {isExpanded && hasData && (
          <div
            className="step-card__data"
            style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            {Object.entries(data).map(([key, value]) => (
              <HashRow key={key} label={key} value={String(value)} ok compact />
            ))}
          </div>
        )}

        {isExpanded && step.error && (
          <pre
            className="step-card__error"
            style={{
              marginTop: 6,
              overflow: 'auto',
              borderRadius: 8,
              border: '1px solid rgba(248,113,113,0.20)',
              background: 'rgba(248,113,113,0.06)',
              padding: '8px 10px',
              font: '500 11px/17px var(--ct-font-mono)',
              color: '#FCA5A5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: '6px 0 0',
            }}
          >
            {step.error}
          </pre>
        )}
      </div>
    </div>
  )
}
