import { useCallback, useEffect, useState } from 'react'
import { useAttestation } from '../hooks/useAttestation.ts'
import { AttestationVerifier, type PrefetchedQuote } from '../services/verifier.ts'
import { fetchQuote } from '../services/quote-service.ts'
import { bytesToHex } from '../../shared/lib/utils.ts'
import { ComponentSelector } from './ComponentSelector.tsx'
import { ComponentView } from './ComponentView.tsx'
import { EmptyState } from './EmptyState.tsx'
import { TopBar } from '../../shared/layout/TopBar.tsx'
import { type Status } from '../../shared/ui/index.tsx'
import type {
  AttestationResult,
  ComponentRecord,
  CvmInfo,
  InstanceInfo,
  StepResult,
} from '../types/index.ts'

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 800)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 800)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function fetchAndCacheQuote(
  instance: InstanceInfo,
  setCache: (
    fn: (prev: Record<string, PrefetchedQuote>) => Record<string, PrefetchedQuote>,
  ) => void,
  setFetched: (fn: (prev: Set<string>) => Set<string>) => void,
) {
  const challenge = bytesToHex(crypto.getRandomValues(new Uint8Array(32)))
  fetchQuote(instance.url, challenge)
    .then((quoteData) =>
      setCache((prev) => ({ ...prev, [instance.instance_id]: { quoteData, challenge } })),
    )
    .catch(() => {})
    .finally(() => setFetched((prev) => new Set([...prev, instance.instance_id])))
}

function buildStepUpdateCb(
  instanceId: string,
  setBg: (fn: (prev: Record<string, number>) => Record<string, number>) => void,
  setBgSteps: (fn: (prev: Record<string, StepResult[]>) => Record<string, StepResult[]>) => void,
) {
  return (updatedSteps: StepResult[]) => {
    const done = updatedSteps.filter((s) => s.status === 'verified').length
    setBg((prev) => ({ ...prev, [instanceId]: done }))
    setBgSteps((prev) => ({ ...prev, [instanceId]: updatedSteps }))
  }
}

export function AttestationPortal() {
  const isMobile = useIsMobile()
  const { state, selectCvm, run, reset } = useAttestation()
  const { status, selectedCvm, selectedInstance, steps, result } = state

  const [cvms, setCvms] = useState<CvmInfo[]>([])
  const [history, setHistory] = useState<Record<string, ComponentRecord>>({})
  const [verifyingAll, setVerifyingAll] = useState(false)
  const [bgProgress, setBgProgress] = useState<Record<string, number>>({})
  const [bgSteps, setBgSteps] = useState<Record<string, StepResult[]>>({})
  const [quoteCache, setQuoteCache] = useState<Record<string, PrefetchedQuote>>({})
  const [quoteFetched, setQuoteFetched] = useState<Set<string>>(new Set())

  const getInstanceStatus = useCallback(
    (instanceId: string): Status => {
      if (selectedInstance?.instance_id === instanceId) {
        if (status === 'verifying') return 'verifying'
        const rec = history[instanceId]
        if (rec) return rec.status
        return status
      }
      if (instanceId in bgProgress) return 'verifying'
      const rec = history[instanceId]
      if (rec) return rec.status
      return 'pending'
    },
    [selectedInstance, status, history, bgProgress],
  )

  const getStatus = useCallback(
    (appId: string): Status => {
      const cvm = cvms.find((c) => c.app_id === appId)
      if (!cvm) return 'pending'

      const anyVerifying = cvm.instances.some(
        (i) =>
          (selectedCvm?.app_id === appId &&
            selectedInstance?.instance_id === i.instance_id &&
            status === 'verifying') ||
          i.instance_id in bgProgress,
      )
      if (anyVerifying) return 'verifying'

      const statuses = new Set(cvm.instances.map((i) => history[i.instance_id]?.status))
      if (statuses.has('failed')) return 'failed'
      if (statuses.has('verified')) return 'verified'
      return 'pending'
    },
    [selectedCvm, selectedInstance, status, history, bgProgress, cvms],
  )

  const getProgress = useCallback(
    (appId: string): number => {
      if (selectedCvm?.app_id === appId && selectedInstance) {
        return steps.filter((s) => s.status === 'verified').length
      }
      const cvm = cvms.find((c) => c.app_id === appId)
      if (!cvm) return -1
      const progresses = cvm.instances
        .filter((i) => i.instance_id in bgProgress)
        .map((i) => bgProgress[i.instance_id] ?? -1)
      return progresses.length > 0 ? Math.max(...progresses) : -1
    },
    [selectedCvm, selectedInstance, steps, bgProgress, cvms],
  )

  const getLastVerified = useCallback(
    (appId: string): number | null => {
      const cvm = cvms.find((c) => c.app_id === appId)
      if (!cvm) return null
      const times = cvm.instances
        .map((i) => history[i.instance_id]?.completedAt)
        .filter((t): t is number => t !== undefined)
      return times.length > 0 ? Math.max(...times) : null
    },
    [history, cvms],
  )

  const getInstanceLastVerified = useCallback(
    (instanceId: string): number | null => history[instanceId]?.completedAt ?? null,
    [history],
  )

  const getInstanceQuote = useCallback(
    (instanceId: string): string | undefined => {
      if (selectedInstance?.instance_id === instanceId && result?.quoteHex) {
        return result.quoteHex
      }
      return quoteCache[instanceId]?.quoteData.quote
    },
    [selectedInstance, result, quoteCache],
  )

  const isInstanceQuoteLoading = useCallback(
    (instanceId: string): boolean => !quoteFetched.has(instanceId),
    [quoteFetched],
  )

  const getInstanceSteps = useCallback(
    (instanceId: string): StepResult[] | null => {
      if (instanceId === selectedInstance?.instance_id) return steps
      if (instanceId in bgSteps) return bgSteps[instanceId]
      return history[instanceId]?.result.steps ?? null
    },
    [selectedInstance, steps, bgSteps, history],
  )

  const handleCvmsLoaded = useCallback((loaded: CvmInfo[]) => {
    setCvms(loaded)
    loaded.forEach((cvm) => {
      cvm.instances.forEach((instance) => {
        fetchAndCacheQuote(instance, setQuoteCache, setQuoteFetched)
      })
    })
  }, [])

  const handleHome = useCallback(() => reset(), [reset])

  const handleSelect = useCallback(
    (cvm: CvmInfo) => {
      if (status === 'verifying') return
      reset()
      selectCvm(cvm)
    },
    [status, reset, selectCvm],
  )

  const handleVerifyInstance = useCallback(
    async (instance: InstanceInfo) => {
      const attestResult = await run(instance, quoteCache[instance.instance_id])
      if (!attestResult) return
      const now = Date.now()
      setHistory((prev) => ({
        ...prev,
        [instance.instance_id]: {
          status: attestResult.status,
          completedAt: now,
          result: attestResult,
        },
      }))
    },
    [run, quoteCache],
  )

  const handleVerifyAll = useCallback(
    async (allCvms: CvmInfo[]) => {
      if (status === 'verifying' || verifyingAll) return
      setVerifyingAll(true)

      const allInstances = allCvms.flatMap((cvm) => cvm.instances)
      const promises = allInstances.map(async (instance) => {
        setBgProgress((prev) => ({ ...prev, [instance.instance_id]: 0 }))
        const verifier = new AttestationVerifier(
          buildStepUpdateCb(instance.instance_id, setBgProgress, setBgSteps),
        )
        try {
          const attestResult = await verifier.verify(instance.url, quoteCache[instance.instance_id])
          const now = Date.now()
          setHistory((prev) => ({
            ...prev,
            [instance.instance_id]: {
              status: attestResult.status,
              completedAt: now,
              result: attestResult,
            },
          }))
        } catch {
          // unexpected throw (e.g. JSON.parse error) — cleanup still runs below
        } finally {
          setBgProgress((prev) => {
            const next = { ...prev }
            delete next[instance.instance_id]
            return next
          })
          setBgSteps((prev) => {
            const next = { ...prev }
            delete next[instance.instance_id]
            return next
          })
        }
      })

      try {
        await Promise.all(promises)
      } finally {
        setVerifyingAll(false)
      }
    },
    [status, verifyingAll, quoteCache],
  )

  const handleVerifyAllInstances = useCallback(() => {
    if (selectedCvm) void handleVerifyAll([selectedCvm])
  }, [handleVerifyAll, selectedCvm])

  const getInstanceResult = useCallback(
    (instanceId: string): AttestationResult | null => {
      if (instanceId === selectedInstance?.instance_id && result) return result
      return history[instanceId]?.result ?? null
    },
    [selectedInstance, result, history],
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ct-bg-1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopBar onHome={handleHome} />

      <div
        style={{
          flex: 1,
          padding: isMobile ? '16px 16px 32px' : '28px 28px 40px',
          maxWidth: 1560,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '360px 1fr',
          gap: isMobile ? 16 : 24,
          alignItems: 'start',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ position: isMobile ? 'static' : 'sticky', top: 70, alignSelf: 'start' }}>
          <ComponentSelector
            selected={selectedCvm}
            onSelect={handleSelect}
            onCvmsLoaded={handleCvmsLoaded}
            isVerifying={status === 'verifying' || verifyingAll}
            getStatus={getStatus}
            getProgress={getProgress}
            getLastVerified={getLastVerified}
            getInstanceStatus={getInstanceStatus}
            onVerifyAll={() => void handleVerifyAll(cvms)}
          />
        </div>

        <main style={{ minWidth: 0, overflowX: 'hidden' }}>
          {selectedCvm === null ? (
            <EmptyState />
          ) : (
            <ComponentView
              cvm={selectedCvm}
              selectedInstance={selectedInstance}
              getInstanceStatus={getInstanceStatus}
              getInstanceLastVerified={getInstanceLastVerified}
              getInstanceQuote={getInstanceQuote}
              getInstanceSteps={getInstanceSteps}
              getInstanceResult={getInstanceResult}
              isInstanceQuoteLoading={isInstanceQuoteLoading}
              onVerifyInstance={handleVerifyInstance}
              onVerifyAllInstances={handleVerifyAllInstances}
            />
          )}
        </main>
      </div>
    </div>
  )
}
