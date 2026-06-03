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
  onVerifyAllInstances: () => void
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
        }}
      >
        {/* Identity: instance id + machine on one line */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              font: '600 12px/1 var(--ct-font-mono)',
              color: 'var(--ct-fg-2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
            }}
            title={instance.instance_id}
          >
            <MatIcon name="fingerprint" size={13} color="var(--ct-fg-5)" />
            {instance.instance_id.slice(0, 8)}…{instance.instance_id.slice(-5)}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
            }}
          >
            <MatIcon name="dns" size={11} color="var(--ct-fg-6)" />
            <span style={{ font: '500 10px/1 var(--ct-font-mono)', color: 'var(--ct-fg-6)' }}>
              {instance.machine_id}
            </span>
          </span>
        </div>

        <span
          title={lastVerified ? `Verified ${formatAgo(lastVerified)}` : undefined}
          style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
        >
          <StatusBadge status={status} />
        </span>

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

      {/* Quote — single line */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            minWidth: 0,
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
              flexShrink: 0,
            }}
          >
            TDX Quote
          </span>

          {!quoteHex && quoteLoading && (
            <span
              style={{
                flex: 1,
                height: 7,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.07)',
                animation: 'badge-pulse 1.5s ease-in-out infinite',
                display: 'inline-block',
              }}
            />
          )}

          {!quoteHex && !quoteLoading && (
            <span
              style={{
                flex: 1,
                font: '400 11px/1 var(--ct-font-ui)',
                color: 'var(--ct-fg-6)',
                fontStyle: 'italic',
              }}
            >
              Unavailable
            </span>
          )}

          {quoteHex && (
            <span
              title={quoteHex}
              style={{
                flex: 1,
                minWidth: 0,
                font: '500 11px/1 var(--ct-font-mono)',
                color: 'var(--ct-fg-4)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {quoteHex}
            </span>
          )}

          {quoteHex && (
            <button
              type="button"
              onClick={handleCopyQuote}
              aria-label="Copy TDX quote"
              title="Copy full quote"
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: quoteCopied ? 'var(--ct-brand-tint-18)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                color: quoteCopied ? 'var(--ct-brand)' : 'var(--ct-fg-5)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MatIcon name={quoteCopied ? 'check' : 'content_copy'} size={12} />
            </button>
          )}

          {quoteHex && (
            <button
              type="button"
              onClick={() => setQuoteFullExpanded((v) => !v)}
              aria-label={quoteFullExpanded ? 'Collapse full quote' : 'Expand full quote hex'}
              title={quoteFullExpanded ? 'Collapse' : 'Expand full hex'}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: quoteFullExpanded ? 'var(--ct-brand-tint-18)' : 'transparent',
                border: `1px solid ${quoteFullExpanded ? 'var(--ct-brand-border)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                color: quoteFullExpanded ? 'var(--ct-brand)' : 'var(--ct-fg-5)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MatIcon name={quoteFullExpanded ? 'expand_less' : 'expand_more'} size={12} />
            </button>
          )}
        </div>

        {quoteHex && quoteFullExpanded && (
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
  onVerifyAllInstances,
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
  const verifiedCount = instanceStatuses.filter((s) => s === 'verified').length
  const totalCount = cvm.instances.length
  const noPendingInstances = totalCount > 0 && !instanceStatuses.includes('pending')

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
      <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
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
            {totalCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  height: 24,
                  padding: '0 10px',
                  borderRadius: 8,
                  background:
                    verifiedCount === totalCount
                      ? 'var(--ct-brand-tint-18)'
                      : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${verifiedCount === totalCount ? 'var(--ct-brand-border)' : 'rgba(255,255,255,0.1)'}`,
                  font: '600 12px/1 var(--ct-font-ui)',
                  color: verifiedCount === totalCount ? 'var(--ct-brand)' : 'var(--ct-fg-4)',
                }}
              >
                <MatIcon
                  name="verified"
                  size={13}
                  color={verifiedCount === totalCount ? 'var(--ct-brand)' : 'var(--ct-fg-5)'}
                />
                {verifiedCount}/{totalCount}
              </span>
            )}
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

        {noPendingInstances ? (
          <SecondaryButton icon="refresh" onClick={onVerifyAllInstances} size="sm">
            Re-verify all
          </SecondaryButton>
        ) : (
          <PrimaryCTA icon="verified_user" onClick={onVerifyAllInstances} size="sm">
            Verify all
          </PrimaryCTA>
        )}
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <Eyebrow>Instances ({cvm.instances.length})</Eyebrow>
          {totalCount > 1 && (
            <SecondaryButton
              icon={noPendingInstances ? 'refresh' : 'verified_user'}
              onClick={onVerifyAllInstances}
              disabled={instanceStatuses.every((s) => s === 'verifying')}
              size="sm"
            >
              {noPendingInstances ? 'Re-verify all' : 'Verify all'}
            </SecondaryButton>
          )}
        </div>

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
