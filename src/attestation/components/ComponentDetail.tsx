import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MatIcon,
  PrimaryCTA,
  SecondaryButton,
  StatusBadge,
  Eyebrow,
  formatAgo,
  getComponentIcon,
  getComponentDescription,
  type Status,
} from '../../shared/ui/index.tsx'
import type { AttestationResult, CvmInfo, InstanceInfo, StepResult } from '../types/index.ts'
import { StepList } from './StepList.tsx'
import { AttestationReport } from './AttestationReport.tsx'

interface ComponentDetailProps {
  cvm: CvmInfo
  selectedInstance: InstanceInfo | null
  getInstanceStatus: (instanceId: string) => Status
  getInstanceLastVerified: (instanceId: string) => number | null
  getInstanceQuote: (instanceId: string) => string | undefined
  getInstanceSteps: (instanceId: string) => StepResult[] | null
  getInstanceResult: (instanceId: string) => AttestationResult | null
  isInstanceQuoteLoading: (instanceId: string) => boolean
  onVerifyInstance: (instance: InstanceInfo) => void
}

interface InstanceCardProps {
  instance: InstanceInfo
  isExpanded: boolean
  hasExpandable: boolean
  status: Status
  lastVerified: number | null
  quoteHex?: string
  quoteLoading?: boolean
  instanceSteps: StepResult[] | null
  instanceResult: AttestationResult | null
  onVerify: () => void
  onToggleExpand: () => void
}

function InstanceCard({
  instance,
  isExpanded,
  hasExpandable,
  status,
  lastVerified,
  quoteHex,
  quoteLoading = false,
  instanceSteps,
  instanceResult,
  onVerify,
  onToggleExpand,
}: Readonly<InstanceCardProps>) {
  const [quoteCopied, setQuoteCopied] = useState(false)
  const [quoteVisible, setQuoteVisible] = useState(false)
  const [quoteFullExpanded, setQuoteFullExpanded] = useState(false)

  // Auto-expand this card when verification transitions verifying → failed
  const prevStatus = useRef<typeof status>(status)
  const onToggleExpandRef = useRef(onToggleExpand)
  // Update the ref after render — never during render (react-hooks/refs)
  useEffect(() => {
    onToggleExpandRef.current = onToggleExpand
  }, [onToggleExpand])
  useEffect(() => {
    if (prevStatus.current === 'verifying' && status === 'failed' && !isExpanded) {
      onToggleExpandRef.current()
    }
    prevStatus.current = status
  }, [status, isExpanded])

  const hasActiveSteps = instanceSteps?.some((s) => s.status !== 'pending') ?? false

  const handleCopyQuote = () => {
    if (quoteHex) navigator.clipboard.writeText(quoteHex).catch(() => {})
    setQuoteCopied(true)
    setTimeout(() => setQuoteCopied(false), 1100)
  }

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${status === 'failed' ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.07)'}`,
        background: status === 'failed' ? 'rgba(248,113,113,0.03)' : 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
        transition: 'border-color 200ms ease, background 200ms ease',
      }}
    >
      {/* Header row */}
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {/* Machine ID — most relevant identity for operators */}
        <span
          style={{
            font: '600 12px/1 var(--ct-font-mono)',
            color: 'var(--ct-fg-2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            flex: 1,
            minWidth: 100,
          }}
        >
          <MatIcon name="dns" size={13} color="var(--ct-fg-5)" />
          {instance.machine_id}
        </span>

        <span
          style={{
            font: '500 10px/1 var(--ct-font-mono)',
            color: 'var(--ct-fg-5)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {instance.instance_id.slice(0, 12)}…
        </span>

        <StatusBadge status={status} />

        {status === 'pending' && (
          <PrimaryCTA icon="verified_user" onClick={onVerify} size="sm">
            Verify
          </PrimaryCTA>
        )}
        {status === 'verifying' && (
          <PrimaryCTA icon="verified_user" loading size="sm">
            Verifying
          </PrimaryCTA>
        )}
        {(status === 'verified' || status === 'failed') && (
          <SecondaryButton icon="refresh" onClick={onVerify} size="sm">
            Re-verify
          </SecondaryButton>
        )}

        {hasExpandable && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={
              isExpanded ? 'Collapse verification results' : 'Expand verification results'
            }
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: isExpanded ? 'var(--ct-brand-tint-18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isExpanded ? 'var(--ct-brand-border)' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer',
              color: isExpanded ? 'var(--ct-brand)' : 'var(--ct-fg-4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MatIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={16} />
          </button>
        )}
      </div>

      {/* Last verified */}
      {lastVerified && (
        <div
          style={{
            padding: '0 14px 10px',
            font: '500 11px/1 var(--ct-font-ui)',
            color: 'var(--ct-fg-5)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <MatIcon name="schedule" size={12} color="var(--ct-fg-6)" />
          Verified {formatAgo(lastVerified)}
        </div>
      )}

      {/* Quote — collapsed by default, shown on demand */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
          }}
        >
          <MatIcon name="lock" size={13} color="var(--ct-fg-5)" />
          <span
            style={{
              font: '700 10px/1 var(--ct-font-ui)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--ct-fg-5)',
              whiteSpace: 'nowrap',
            }}
          >
            TDX Quote
          </span>

          {!quoteHex && quoteLoading && (
            <span
              style={{
                height: 7,
                width: 80,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.07)',
                animation: 'badge-pulse 1.5s ease-in-out infinite',
                display: 'inline-block',
              }}
            />
          )}

          <div style={{ flex: 1 }} />

          {!quoteHex && !quoteLoading && (
            <span
              style={{
                font: '400 11px/1 var(--ct-font-ui)',
                color: 'var(--ct-fg-6)',
                fontStyle: 'italic',
              }}
            >
              Unavailable
            </span>
          )}
          {quoteHex && (
            <button
              type="button"
              onClick={() => setQuoteVisible((v) => !v)}
              aria-label={quoteVisible ? 'Hide TDX quote' : 'Show TDX quote'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                height: 22,
                padding: '0 8px',
                borderRadius: 6,
                background: quoteVisible ? 'var(--ct-brand-tint-18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${quoteVisible ? 'var(--ct-brand-border)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                color: quoteVisible ? 'var(--ct-brand)' : 'var(--ct-fg-4)',
                font: '600 11px/1 var(--ct-font-ui)',
                flexShrink: 0,
              }}
            >
              <MatIcon name={quoteVisible ? 'visibility_off' : 'visibility'} size={12} />
              {quoteVisible ? 'Hide' : 'Show'}
            </button>
          )}
        </div>

        {quoteHex && quoteVisible && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px 8px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span
                title={quoteHex}
                style={{
                  font: '500 11px/1 var(--ct-font-mono)',
                  color: 'var(--ct-fg-3)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {quoteHex}
              </span>
              <button
                type="button"
                onClick={handleCopyQuote}
                aria-label="Copy TDX quote"
                title="Copy full quote"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: quoteCopied ? 'var(--ct-brand-tint-18)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  color: quoteCopied ? 'var(--ct-brand)' : 'var(--ct-fg-4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MatIcon name={quoteCopied ? 'check' : 'content_copy'} size={13} />
              </button>
              <button
                type="button"
                onClick={() => setQuoteFullExpanded((v) => !v)}
                aria-label={quoteFullExpanded ? 'Collapse full quote' : 'Expand full quote hex'}
                title={quoteFullExpanded ? 'Collapse' : 'Expand full hex'}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  color: 'var(--ct-fg-4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MatIcon name={quoteFullExpanded ? 'expand_less' : 'expand_more'} size={13} />
              </button>
            </div>

            {quoteFullExpanded && (
              <pre
                style={{
                  margin: 0,
                  padding: '10px 14px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  font: '500 11px/18px var(--ct-font-mono)',
                  color: 'var(--ct-fg-3)',
                  background: 'rgba(0,0,0,0.15)',
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {quoteHex}
              </pre>
            )}
          </>
        )}
      </div>

      {/* Expanded: verification steps + docker compose */}
      {isExpanded && (hasActiveSteps || instanceResult) && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '14px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {hasActiveSteps && instanceSteps && <StepList steps={instanceSteps} />}
          {instanceResult && <AttestationReport result={instanceResult} />}
        </div>
      )}
    </div>
  )
}

export function ComponentDetail({
  cvm,
  selectedInstance,
  getInstanceStatus,
  getInstanceLastVerified,
  getInstanceQuote,
  getInstanceSteps,
  getInstanceResult,
  isInstanceQuoteLoading,
  onVerifyInstance,
}: Readonly<ComponentDetailProps>) {
  // Selected instance auto-expands unless the user explicitly collapsed it
  const [userExpanded, setUserExpanded] = useState<Set<string>>(new Set())
  const [userCollapsed, setUserCollapsed] = useState<Set<string>>(new Set())

  const expandedInstances = useMemo(() => {
    const set = new Set(userExpanded)
    if (selectedInstance && !userCollapsed.has(selectedInstance.instance_id)) {
      set.add(selectedInstance.instance_id)
    }
    return set
  }, [userExpanded, userCollapsed, selectedInstance])

  const toggleExpand = (instanceId: string) => {
    if (expandedInstances.has(instanceId)) {
      setUserExpanded((prev) => {
        const n = new Set(prev)
        n.delete(instanceId)
        return n
      })
      setUserCollapsed((prev) => new Set([...prev, instanceId]))
    } else {
      setUserExpanded((prev) => new Set([...prev, instanceId]))
      setUserCollapsed((prev) => {
        const n = new Set(prev)
        n.delete(instanceId)
        return n
      })
    }
  }

  const icon = getComponentIcon(cvm.name)
  const description = getComponentDescription(cvm.name)

  const instanceStatuses = cvm.instances.map((i) => getInstanceStatus(i.instance_id))
  const statusSet = new Set(instanceStatuses)
  let overallStatus: Status = 'pending'
  if (statusSet.has('verifying')) overallStatus = 'verifying'
  else if (statusSet.has('failed')) overallStatus = 'failed'
  else if (statusSet.has('verified')) overallStatus = 'verified'

  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
      }}
    >
      {/* Component header */}
      <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--ct-brand-tint-18)',
            border: '1px solid var(--ct-brand-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ct-brand)',
            flexShrink: 0,
          }}
        >
          <MatIcon name={icon} size={26} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow>Component detail</Eyebrow>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 6,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                font: '700 22px/28px var(--ct-font-display)',
                color: 'var(--ct-fg-1)',
                letterSpacing: '-0.3px',
              }}
            >
              {cvm.name}
            </span>
            <StatusBadge status={overallStatus} size="lg" />
          </div>
          <div
            style={{
              font: '400 13px/20px var(--ct-font-ui)',
              color: 'var(--ct-fg-4)',
              marginTop: 6,
            }}
          >
            {description}
          </div>
        </div>
      </div>

      {/* Instances section — inside the same card */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 22px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <Eyebrow>Instances ({cvm.instances.length})</Eyebrow>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
          {cvm.instances.map((instance) => {
            const instanceSteps = getInstanceSteps(instance.instance_id)
            const instanceResult = getInstanceResult(instance.instance_id)
            const hasActiveSteps = instanceSteps?.some((s) => s.status !== 'pending') ?? false
            const hasExpandable = hasActiveSteps || instanceResult !== null
            const isExpanded = expandedInstances.has(instance.instance_id)

            return (
              <InstanceCard
                key={instance.instance_id}
                instance={instance}
                isExpanded={isExpanded}
                hasExpandable={hasExpandable}
                status={getInstanceStatus(instance.instance_id)}
                lastVerified={getInstanceLastVerified(instance.instance_id)}
                quoteHex={getInstanceQuote(instance.instance_id)}
                quoteLoading={isInstanceQuoteLoading(instance.instance_id)}
                instanceSteps={instanceSteps}
                instanceResult={instanceResult}
                onVerify={() => onVerifyInstance(instance)}
                onToggleExpand={() => toggleExpand(instance.instance_id)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
