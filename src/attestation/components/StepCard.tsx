import { useState } from 'react'
import { MatIcon, StepStatusIcon, Verdict, HashRow, CopyButton } from '../../shared/ui/index.tsx'
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

/* ── RTMR descriptions ── */
const RTMR_TOOLTIP: Record<string, string> = {
  rtmr0:
    'RTMR0 — Firmware layer: measures UEFI/BIOS code loaded during early boot, ensuring hardware initialization integrity.',
  rtmr1:
    'RTMR1 — Kernel layer: measures the OS kernel, initrd image, and kernel command-line parameters.',
  rtmr2: 'RTMR2 — OS runtime layer: measures the container image and OS runtime environment.',
  rtmr3:
    'RTMR3 — Workload layer: measures application config and compose files, replayed from the event log to verify integrity.',
}

/* ── Inline tooltip with hover + keyboard ── */
function InfoTooltip({ text }: Readonly<{ text: string }>) {
  const [show, setShow] = useState(false)
  return (
    <button
      type="button"
      aria-label="More information"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'help',
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <MatIcon name="info" size={12} style={{ color: 'var(--ct-fg-5)', cursor: 'help' }} />
      {show && (
        <span
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 230,
            padding: '7px 10px',
            borderRadius: 8,
            background: '#1a1f2e',
            border: '1px solid rgba(255,255,255,0.15)',
            font: '400 11px/16px var(--ct-font-ui)',
            color: 'var(--ct-fg-3)',
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'normal',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {text}
        </span>
      )}
    </button>
  )
}

/* ── Hash row with optional tooltip (RTMR values, OS hash) ── */
function HashDataRow({
  label,
  value,
  tooltip,
}: Readonly<{ label: string; value: string; tooltip?: string }>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr auto auto',
        gap: 12,
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          font: '700 10px/16px var(--ct-font-ui)',
          letterSpacing: '0.6px',
          textTransform: 'uppercase' as const,
          color: 'var(--ct-fg-5)',
        }}
      >
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div
        title={value}
        style={{
          font: '500 12px/19px var(--ct-font-mono)',
          color: 'var(--ct-fg-2)',
          fontVariantNumeric: 'tabular-nums' as const,
          whiteSpace: 'nowrap' as const,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
      <Verdict ok />
      <CopyButton text={value} label={label} />
    </div>
  )
}

/* ── Proof-of-cloud colored badge row ── */
function ProofOfCloudRow({ value }: Readonly<{ value: string }>) {
  const isTrue = value === 'true'

  const badgeColor = isTrue ? 'var(--ct-success-light)' : '#FB923C'
  const badgeBg = isTrue ? 'rgba(16,185,129,0.10)' : 'rgba(251,146,60,0.10)'
  const badgeBorder = isTrue ? 'rgba(16,185,129,0.25)' : 'rgba(251,146,60,0.30)'
  const badgeIcon = isTrue ? 'verified' : 'warning'
  const badgeLabel = isTrue ? 'Verified' : 'Not verified'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr',
        gap: 12,
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
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
        proof of cloud
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 9999,
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
            color: badgeColor,
            font: '700 11px/1 var(--ct-font-ui)',
            letterSpacing: '0.4px',
          }}
        >
          <MatIcon name={badgeIcon} size={12} />
          {badgeLabel}
        </span>
        {!isTrue && (
          <span
            style={{
              font: '400 11px/16px var(--ct-font-ui)',
              color: '#FB923C',
            }}
          >
            Non-blocking — hardware attestation still valid
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Per-step data row dispatcher ── */
function DataRow({
  stepNum,
  dataKey,
  value,
}: Readonly<{ stepNum: number; dataKey: string; value: string }>) {
  if (stepNum === 3 && ['rtmr0', 'rtmr1', 'rtmr2', 'rtmr3'].includes(dataKey)) {
    return <HashDataRow label={dataKey} value={value} tooltip={RTMR_TOOLTIP[dataKey]} />
  }
  if (stepNum === 1 && dataKey === 'proof of cloud') {
    return <ProofOfCloudRow value={value} />
  }
  if (stepNum === 5 && dataKey === 'OS hash') {
    return <HashDataRow label={dataKey} value={value} />
  }
  return <HashRow label={dataKey} value={value} ok compact />
}

export function StepCard({ step, isLast, isExpanded, onToggle }: Readonly<StepCardProps>) {
  const { status, data } = step
  const hasData = !!data && Object.keys(data).length > 0
  const canExpand = !!step.description || !!step.detail || !!step.error || hasData

  const osHashRaw = step.step === 5 ? data?.['OS hash'] : null
  const osImageDownloadUrl =
    typeof osHashRaw === 'string'
      ? `https://download.dstack.org/os-images/mr_${osHashRaw.replace(/^0x/i, '')}.tar.gz`
      : null

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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ flex: 1 }}>{step.description}</span>
                  {osImageDownloadUrl && (
                    <a
                      href={osImageDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px 3px 7px',
                        borderRadius: 7,
                        background: 'var(--ct-brand-tint-18)',
                        border: '1px solid var(--ct-brand-border)',
                        color: 'var(--ct-brand)',
                        font: '600 11px/1 var(--ct-font-display)',
                        textDecoration: 'none',
                        letterSpacing: '0.2px',
                        flexShrink: 0,
                      }}
                    >
                      <MatIcon name="download" size={13} />
                      Download OS image
                    </a>
                  )}
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
              <DataRow key={key} stepNum={step.step} dataKey={key} value={String(value)} />
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
