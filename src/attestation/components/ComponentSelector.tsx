import { useEffect, useState } from 'react'
import type { CvmInfo } from '../types/index.ts'
import { fetchCvms } from '../services/quote-service.ts'
import {
  MatIcon,
  StatusBadge,
  Eyebrow,
  PrimaryCTA,
  formatAgo,
  getComponentIcon,
  getComponentDescription,
  type Status,
} from '../../shared/ui/index.tsx'

interface ComponentsListProps {
  selected: CvmInfo | null
  onSelect: (cvm: CvmInfo) => void
  onVerifyAll: (cvms: CvmInfo[]) => void
  isVerifying: boolean
  getStatus: (appId: string) => Status
  getProgress: (appId: string) => number
  getLastVerified: (appId: string) => number | null
}

interface ComponentCardProps {
  cvm: CvmInfo
  selected: boolean
  status: Status
  verifyProgress: number
  lastVerified: number | null
  disabled: boolean
  onClick: () => void
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
}: Readonly<ComponentCardProps>) {
  const isFail = status === 'failed'
  const accent = isFail ? '#F87171' : 'var(--ct-brand)'
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
            <StatusBadge status={status} />
          </div>

          <div
            style={{
              font: '400 12px/18px var(--ct-font-ui)',
              color: 'var(--ct-fg-4)',
              marginTop: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
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
            }}
          >
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

export function ComponentsList({
  selected,
  onSelect,
  onVerifyAll,
  isVerifying,
  getStatus,
  getProgress,
  getLastVerified,
}: Readonly<ComponentsListProps>) {
  const [cvms, setCvms] = useState<CvmInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCvms()
      .then(setCvms)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

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
        <div>
          <Eyebrow>NOX Components</Eyebrow>
          <div
            style={{
              font: '700 22px/28px var(--ct-font-display)',
              color: 'var(--ct-fg-1)',
              letterSpacing: '-0.4px',
              marginTop: 4,
            }}
          >
            {loading ? '…' : `${cvms.length} service${cvms.length === 1 ? '' : 's'} attested`}
          </div>
        </div>
        <PrimaryCTA
          icon="verified_user"
          onClick={() => onVerifyAll(cvms)}
          loading={isVerifying}
          disabled={selected === null}
          size="md"
        >
          Verify all
        </PrimaryCTA>
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
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.25)',
            color: '#FCA5A5',
            font: '500 13px/20px var(--ct-font-ui)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <MatIcon name="error" size={16} />
          {error}
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
            />
          ))}
        </div>
      )}
    </aside>
  )
}
