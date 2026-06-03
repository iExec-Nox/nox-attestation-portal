import { useEffect, useState } from 'react'
import type { CvmInfo } from '../types/index.ts'
import { fetchCvms } from '../services/quote-service.ts'
import {
  MatIcon,
  PrimaryCTA,
  SecondaryButton,
  Eyebrow,
  formatAgo,
  getComponentIcon,
  getComponentDescription,
  type Status,
} from '../../shared/ui/index.tsx'

interface ComponentsListProps {
  selected: CvmInfo | null
  onSelect: (cvm: CvmInfo) => void
  onCvmsLoaded: (cvms: CvmInfo[]) => void
  isVerifying: boolean
  getStatus: (appId: string) => Status
  getProgress: (appId: string) => number
  getLastVerified: (appId: string) => number | null
  getInstanceStatus: (instanceId: string) => Status
  onVerifyAll: () => void
}

interface ComponentCardProps {
  cvm: CvmInfo
  selected: boolean
  status: Status
  verifyProgress: number
  lastVerified: number | null
  disabled: boolean
  onClick: () => void
  getInstanceStatus: (instanceId: string) => Status
}

function getSegmentColor(done: boolean, active: boolean): string {
  if (done) return 'var(--ct-success-light)'
  if (active) return 'var(--ct-brand)'
  return 'rgba(255,255,255,0.07)'
}

function ComponentCard({
  cvm,
  selected,
  status,
  verifyProgress,
  lastVerified,
  disabled,
  onClick,
  getInstanceStatus,
}: Readonly<ComponentCardProps>) {
  const isFail = status === 'failed'
  const accent = isFail ? '#F87171' : 'var(--ct-brand)'
  const verifiedCount = cvm.instances.filter(
    (i) => getInstanceStatus(i.instance_id) === 'verified',
  ).length
  const totalCount = cvm.instances.length
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        textAlign: 'left',
        width: '100%',
        position: 'relative',
        padding: '16px 18px 16px 20px',
        borderRadius: 16,
        background: selected ? 'var(--ct-brand-tint-12)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${selected ? 'var(--ct-brand-border)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: selected ? 'var(--ct-shadow-glow-soft)' : 'none',
        color: 'var(--ct-fg-2)',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 150ms ease, border-color 150ms ease',
        display: 'block',
        overflow: 'hidden',
        opacity: disabled && !selected ? 0.6 : 1,
      }}
    >
      {/* Left accent strip */}
      {selected && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 14,
            bottom: 14,
            width: 3,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 12px ${accent}`,
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon tile */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: selected ? 'var(--ct-brand)' : 'rgba(255,255,255,0.05)',
            border: selected
              ? '1px solid var(--ct-brand-border)'
              : '1px solid rgba(255,255,255,0.08)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selected ? '#fff' : 'var(--ct-fg-3)',
            flexShrink: 0,
          }}
        >
          <MatIcon name={getComponentIcon(cvm.name)} size={18} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                font: '700 14px/20px var(--ct-font-mono)',
                color: 'var(--ct-fg-1)',
                letterSpacing: '-0.1px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {cvm.name}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                height: 20,
                padding: '0 8px',
                borderRadius: 6,
                background:
                  verifiedCount === totalCount && totalCount > 0
                    ? 'var(--ct-brand-tint-18)'
                    : 'rgba(255,255,255,0.06)',
                border: `1px solid ${verifiedCount === totalCount && totalCount > 0 ? 'var(--ct-brand-border)' : 'rgba(255,255,255,0.1)'}`,
                font: '600 11px/1 var(--ct-font-ui)',
                color:
                  verifiedCount === totalCount && totalCount > 0
                    ? 'var(--ct-brand)'
                    : 'var(--ct-fg-4)',
              }}
            >
              <MatIcon
                name="verified"
                size={11}
                color={
                  verifiedCount === totalCount && totalCount > 0
                    ? 'var(--ct-brand)'
                    : 'var(--ct-fg-5)'
                }
              />
              {verifiedCount}/{totalCount}
            </span>
          </div>

          <div
            style={{
              font: '400 12px/18px var(--ct-font-ui)',
              color: 'var(--ct-fg-4)',
              marginTop: 4,
            }}
          >
            {getComponentDescription(cvm.name)}
          </div>

          <div
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  font: '500 11px/16px var(--ct-font-ui)',
                  color: 'var(--ct-fg-5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <MatIcon name="schedule" size={12} color="var(--ct-fg-6)" />
                {lastVerified ? `Verified ${formatAgo(lastVerified)}` : 'Not yet verified'}
              </span>
              <span
                style={{
                  font: '500 11px/16px var(--ct-font-ui)',
                  color: 'var(--ct-fg-5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <MatIcon name="layers" size={12} color="var(--ct-fg-6)" />
                {cvm.instances.length}
              </span>
            </div>
            <span
              style={{
                font: '500 11px/16px var(--ct-font-mono)',
                color: 'var(--ct-fg-5)',
                letterSpacing: '0.1px',
              }}
            >
              {cvm.app_id.slice(0, 8)}
            </span>
          </div>

          {/* Mini progress bar while verifying */}
          {status === 'verifying' && (
            <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const done = verifyProgress > i
                const active = verifyProgress === i
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 999,
                      background: getSegmentColor(done, active),
                      boxShadow: active ? '0 0 8px var(--ct-brand)' : 'none',
                      transition: 'background 200ms ease',
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function friendlyError(raw: string): string {
  if (/500/.test(raw) || /connection refused/i.test(raw) || /ECONNREFUSED/i.test(raw))
    return 'Cannot reach the NOX components service. The server may be temporarily unavailable.'
  if (/fetch/i.test(raw) || /network/i.test(raw) || /failed to fetch/i.test(raw))
    return 'Network error — check your connection and try again.'
  if (/404/.test(raw)) return 'Components endpoint not found (404).'
  if (/401/.test(raw) || /403/.test(raw)) return 'Access denied — check your credentials.'
  return raw
}

export function ComponentSelector({
  selected,
  onSelect,
  onCvmsLoaded,
  isVerifying,
  getStatus,
  getProgress,
  getLastVerified,
  getInstanceStatus,
  onVerifyAll,
}: Readonly<ComponentsListProps>) {
  const [cvms, setCvms] = useState<CvmInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    fetchCvms()
      .then((data) => {
        setCvms(data)
        onCvmsLoaded(data)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [onCvmsLoaded, retryKey])

  const noPendingInstances =
    !loading &&
    cvms.length > 0 &&
    !cvms.some((cvm) => cvm.instances.some((i) => getInstanceStatus(i.instance_id) === 'pending'))

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '0 2px',
        }}
      >
        <Eyebrow>NOX Components</Eyebrow>

        {!loading &&
          !error &&
          (noPendingInstances ? (
            <SecondaryButton icon="refresh" onClick={onVerifyAll} disabled={isVerifying} size="sm">
              Re-verify all
            </SecondaryButton>
          ) : (
            <PrimaryCTA icon="verified_user" onClick={onVerifyAll} disabled={isVerifying} size="sm">
              Verify all
            </PrimaryCTA>
          ))}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 116,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                animation: 'badge-pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '16px 18px',
            borderRadius: 16,
            background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.20)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#F87171',
              }}
            >
              <MatIcon name="cloud_off" size={16} />
            </div>
            <div>
              <div
                style={{
                  font: '600 13px/18px var(--ct-font-display)',
                  color: '#FCA5A5',
                  marginBottom: 4,
                }}
              >
                Service unavailable
              </div>
              <div
                style={{
                  font: '400 12px/18px var(--ct-font-ui)',
                  color: 'rgba(252,165,165,0.7)',
                }}
              >
                {friendlyError(error)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null)
              setLoading(true)
              setRetryKey((k) => k + 1)
            }}
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 30,
              padding: '0 12px',
              borderRadius: 8,
              background: 'rgba(248,113,113,0.10)',
              border: '1px solid rgba(248,113,113,0.25)',
              color: '#FCA5A5',
              font: '600 12px/1 var(--ct-font-display)',
              cursor: 'pointer',
              letterSpacing: '0.1px',
            }}
          >
            <MatIcon name="refresh" size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Component cards */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cvms.map((cvm) => (
            <ComponentCard
              key={cvm.app_id}
              cvm={cvm}
              selected={selected?.app_id === cvm.app_id}
              status={getStatus(cvm.app_id)}
              verifyProgress={getProgress(cvm.app_id)}
              lastVerified={getLastVerified(cvm.app_id)}
              disabled={isVerifying && selected?.app_id !== cvm.app_id}
              onClick={() => onSelect(cvm)}
              getInstanceStatus={getInstanceStatus}
            />
          ))}
        </div>
      )}
    </aside>
  )
}
