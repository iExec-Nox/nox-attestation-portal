import { useCallback, useReducer } from 'react'
import type { CvmInfo, InstanceInfo, AttestationResult } from '../types/index.ts'
import { AttestationVerifier, STEP_DEFINITIONS } from '../services/verifier.ts'
import { attestationReducer, makeInitialState } from './attestation-state.ts'
import type { AttestationState } from './attestation-state.ts'

export interface UseAttestationReturn {
  state: AttestationState
  selectCvm: (cvm: CvmInfo) => void
  run: (instance: InstanceInfo | undefined, challenge: string) => Promise<AttestationResult | null>
  reset: () => void
}

export function useAttestation(): UseAttestationReturn {
  const [state, dispatch] = useReducer(attestationReducer, makeInitialState())

  const selectCvm = useCallback((cvm: CvmInfo) => {
    dispatch({ type: 'SELECT_CVM', cvm })
  }, [])

  const run = useCallback(
    async (
      instance: InstanceInfo | undefined,
      challenge: string,
    ): Promise<AttestationResult | null> => {
      const target = instance ?? state.selectedInstance
      if (!target || state.status === 'verifying') return null

      if (instance) {
        dispatch({ type: 'SELECT_INSTANCE', instance })
      }
      dispatch({ type: 'START' })

      const verifier = new AttestationVerifier((steps) => {
        dispatch({ type: 'STEPS_UPDATE', steps })
      })

      let result: AttestationResult
      try {
        result = await verifier.verify(target, challenge)
      } catch (err) {
        result = {
          status: 'failed',
          steps: STEP_DEFINITIONS.map((s, i) => ({
            step: i + 1,
            name: s.name,
            description: s.description,
            status: 'pending' as const,
          })),
          errorMessage: err instanceof Error ? err.message : String(err),
        }
      }
      dispatch({ type: 'COMPLETE', result })
      return result
    },
    [state.selectedInstance, state.status],
  )

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return { state, selectCvm, run, reset }
}
