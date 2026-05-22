import { useState } from 'react'
import type { StepResult } from '../types/index.ts'
import { StepCard } from './StepCard.tsx'
import { MatIcon, Eyebrow } from '../../shared/ui/index.tsx'

interface StepListProps {
  steps: StepResult[]
}

function stepsCaption(passed: number, failed: number, total: number) {
  if (failed > 0)
    return { label: `${failed} check${failed === 1 ? '' : 's'} failed`, color: '#FCA5A5' }
  if (passed === total)
    return { label: `All ${total} checks passed`, color: 'var(--ct-success-light)' }
  return { label: `${passed} / ${total} checks passed`, color: 'var(--ct-fg-2)' }
}

export function StepList({ steps }: Readonly<StepListProps>) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  const passed = steps.filter((s) => s.status === 'verified').length
  const failed = steps.filter((s) => s.status === 'failed').length
  const activeSteps = steps.filter((s) => s.status !== 'pending')
  const hasResults = activeSteps.length > 0
  const allExpanded = hasResults && expandedSteps.size === activeSteps.length
  const { label: summaryLabel, color: summaryColor } = stepsCaption(passed, failed, steps.length)

  const toggleStep = (stepNum: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepNum)) next.delete(stepNum)
      else next.add(stepNum)
      return next
    })
  }

  const toggleAll = () => {
    setExpandedSteps(allExpanded ? new Set() : new Set(activeSteps.map((s) => s.step)))
  }

  return (
    <div
      className="step-list"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        padding: '16px 20px',
      }}
    >
      <div
        className="step-list__header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div className="step-list__summary">
          <Eyebrow>Verification steps</Eyebrow>
          <div
            className="step-list__summary-label"
            style={{
              font: '700 18px/24px var(--ct-font-display)',
              color: summaryColor,
              marginTop: 4,
              transition: 'color 300ms ease',
            }}
          >
            {summaryLabel}
          </div>
        </div>

        {hasResults && (
          <button
            type="button"
            className="step-list__toggle-all"
            onClick={toggleAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ct-fg-4)',
              font: '600 12px/1 var(--ct-font-ui)',
              padding: '4px 0',
              flexShrink: 0,
            }}
          >
            <MatIcon name={allExpanded ? 'unfold_less' : 'unfold_more'} size={16} />
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>

      <div className="step-list__steps">
        {steps.map((step, i) => (
          <StepCard
            key={step.step}
            step={step}
            isLast={i === steps.length - 1}
            isExpanded={expandedSteps.has(step.step)}
            onToggle={() => toggleStep(step.step)}
          />
        ))}
      </div>
    </div>
  )
}
