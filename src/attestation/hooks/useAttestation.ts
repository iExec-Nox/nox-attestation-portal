import { useCallback, useReducer } from 'react'
import type { CvmInfo, AttestationResult } from '../types/index.ts'
import { AttestationVerifier } from '../services/verifier.ts'
import { attestationReducer, makeInitialState } from './attestation-state.ts'
import type { AttestationState } from './attestation-state.ts'

export interface UseAttestationReturn {
  state: AttestationState
  selectCvm: (cvm: CvmInfo) => void
  run: () => Promise<AttestationResult | null>
  reset: () => void
}

export function useAttestation(): UseAttestationReturn {
  const [state, dispatch] = useReducer(attestationReducer, makeInitialState())

  const selectCvm = useCallback((cvm: CvmInfo) => {
    dispatch({ type: 'SELECT_CVM', cvm })
  }, [])

  const run = useCallback(async (): Promise<AttestationResult | null> => {
    if (!state.selectedCvm || state.status === 'verifying') return null

    dispatch({ type: 'START' })

    const verifier = new AttestationVerifier((steps) => {
      dispatch({ type: 'STEPS_UPDATE', steps })
    })

    const result = await verifier.verify(state.selectedCvm.url)
    dispatch({ type: 'COMPLETE', result })
    return result
  }, [state.selectedCvm, state.status])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return { state, selectCvm, run, reset }
}
