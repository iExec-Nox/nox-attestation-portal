import { useCallback, useState } from 'react'
import { useAttestation } from '../hooks/useAttestation.ts'
import { AttestationVerifier } from '../services/verifier.ts'
import { ComponentsList } from './ComponentSelector.tsx'
import { ComponentView } from './ComponentView.tsx'
import { EmptyState } from './EmptyState.tsx'
import { TopBar } from '../../shared/layout/TopBar.tsx'
import { type Status } from '../../shared/ui/index.tsx'
import type { ComponentRecord, CvmInfo, StepResult } from '../types/index.ts'

function buildStepUpdateCb(
  appId: string,
  setBg: (fn: (prev: Record<string, number>) => Record<string, number>) => void,
) {
  return (steps: StepResult[]) => {
    const done = steps.filter((s) => s.status === 'verified').length
    setBg((prev) => ({ ...prev, [appId]: done }))
  }
}

export function AttestationPortal() {
  const { state, selectCvm, run, reset } = useAttestation()
  const { status, selectedCvm, steps, result } = state

  const [history, setHistory] = useState<Record<string, ComponentRecord>>({})
  const [lastChecked, setLastChecked] = useState<number | null>(null)
  const [verifyingAll, setVerifyingAll] = useState(false)
  const [bgProgress, setBgProgress] = useState<Record<string, number>>({})

  const getStatus = useCallback(
    (appId: string): Status => {
      if (selectedCvm?.app_id === appId) {
        if (status === 'verifying') return 'verifying'
        const rec = history[appId]
        if (rec) return rec.status
        return status
      }
      if (appId in bgProgress) return 'verifying'
      const rec = history[appId]
      if (rec) return rec.status
      return 'pending'
    },
    [selectedCvm, status, history, bgProgress],
  )

  const getProgress = useCallback(
    (appId: string): number => {
      if (selectedCvm?.app_id === appId) {
        return steps.filter((s) => s.status === 'verified').length
      }
      return bgProgress[appId] ?? -1
    },
    [selectedCvm, steps, bgProgress],
  )

  const getLastVerified = useCallback(
    (appId: string): number | null => history[appId]?.completedAt ?? null,
    [history],
  )

  const handleHome = useCallback(() => reset(), [reset])

  const handleSelect = useCallback(
    (cvm: CvmInfo) => {
      if (status === 'verifying') return
      reset()
      selectCvm(cvm)
    },
    [status, reset, selectCvm],
  )

  const handleVerify = useCallback(async () => {
    if (!selectedCvm) return
    const attestResult = await run()
    if (!attestResult) return
    const now = Date.now()
    setHistory((prev) => ({
      ...prev,
      [selectedCvm.app_id]: {
        status: attestResult.status,
        completedAt: now,
        result: attestResult,
      },
    }))
    setLastChecked(now)
  }, [run, selectedCvm])

  const handleVerifyAll = useCallback(
    async (allCvms: CvmInfo[]) => {
      if (status === 'verifying' || verifyingAll) return
      setVerifyingAll(true)
      const otherCvms = allCvms.filter((c) => c.app_id !== selectedCvm?.app_id)
      const selectedPromise = selectedCvm ? handleVerify() : Promise.resolve()
      const otherPromises = otherCvms.map(async (cvm) => {
        setBgProgress((prev) => ({ ...prev, [cvm.app_id]: 0 }))
        const verifier = new AttestationVerifier(buildStepUpdateCb(cvm.app_id, setBgProgress))
        const attestResult = await verifier.verify(cvm.url)
        setBgProgress((prev) => {
          const next = { ...prev }
          delete next[cvm.app_id]
          return next
        })
        const now = Date.now()
        setHistory((prev) => ({
          ...prev,
          [cvm.app_id]: {
            status: attestResult.status,
            completedAt: now,
            result: attestResult,
          },
        }))
      })
      await Promise.all([selectedPromise, ...otherPromises])
      setLastChecked(Date.now())
      setVerifyingAll(false)
    },
    [status, verifyingAll, selectedCvm, handleVerify],
  )

  const prevRecord = selectedCvm ? (history[selectedCvm.app_id] ?? null) : null
  const showAnalytics =
    status === 'verified' || status === 'failed' || (status === 'pending' && !!prevRecord)
  const displayedResult = showAnalytics ? (result ?? prevRecord?.result ?? null) : null
  const globalStatus: 'verified' | 'pending' = status === 'verified' ? 'verified' : 'pending'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ct-bg-1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopBar
        globalStatus={globalStatus}
        lastChecked={lastChecked}
        onRefresh={handleVerify}
        refreshing={status === 'verifying'}
        onHome={handleHome}
      />

      <div
        style={{
          flex: 1,
          padding: '28px 28px 40px',
          maxWidth: 1560,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: 24,
          alignItems: 'start',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ position: 'sticky', top: 70, alignSelf: 'start' }}>
          <ComponentsList
            selected={selectedCvm}
            onSelect={handleSelect}
            onVerifyAll={handleVerifyAll}
            isVerifying={status === 'verifying' || verifyingAll}
            getStatus={getStatus}
            getProgress={getProgress}
            getLastVerified={getLastVerified}
          />
        </div>

        <main style={{ minWidth: 0, overflowX: 'hidden' }}>
          {selectedCvm === null ? (
            <EmptyState />
          ) : (
            <ComponentView
              cvm={selectedCvm}
              steps={steps}
              prevRecord={prevRecord}
              displayedResult={displayedResult}
              status={getStatus(selectedCvm.app_id)}
              lastVerified={getLastVerified(selectedCvm.app_id)}
              onVerify={handleVerify}
            />
          )}
        </main>
      </div>
    </div>
  )
}
