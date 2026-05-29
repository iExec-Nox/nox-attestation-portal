import type {
  AttestationResult,
  AttestationStatus,
  StepResult,
  CvmInfo,
  InstanceInfo,
} from '../types/index.ts'
import { STEP_DEFINITIONS } from '../services/verifier.ts'

export interface AttestationState {
  status: AttestationStatus
  selectedCvm: CvmInfo | null
  selectedInstance: InstanceInfo | null
  steps: StepResult[]
  result: AttestationResult | null
  error: string | null
}

export function makeInitialState(): AttestationState {
  return {
    status: 'pending',
    selectedCvm: null,
    selectedInstance: null,
    steps: STEP_DEFINITIONS.map((s, i) => ({
      step: i + 1,
      name: s.name,
      description: s.description,
      status: 'pending',
    })),
    result: null,
    error: null,
  }
}

export type AttestationAction =
  | { type: 'SELECT_CVM'; cvm: CvmInfo }
  | { type: 'SELECT_INSTANCE'; instance: InstanceInfo }
  | { type: 'START' }
  | { type: 'STEPS_UPDATE'; steps: StepResult[] }
  | { type: 'COMPLETE'; result: AttestationResult }
  | { type: 'RESET' }

export function attestationReducer(
  state: AttestationState,
  action: AttestationAction,
): AttestationState {
  switch (action.type) {
    case 'SELECT_CVM':
      return { ...makeInitialState(), selectedCvm: action.cvm }
    case 'SELECT_INSTANCE':
      return {
        ...makeInitialState(),
        selectedCvm: state.selectedCvm,
        selectedInstance: action.instance,
      }
    case 'START':
      return {
        ...state,
        status: 'verifying',
        error: null,
        result: null,
        steps: STEP_DEFINITIONS.map((s, i) => ({
          step: i + 1,
          name: s.name,
          description: s.description,
          status: 'pending' as const,
        })),
      }
    case 'STEPS_UPDATE':
      return { ...state, steps: action.steps }
    case 'COMPLETE':
      return {
        ...state,
        status: action.result.status,
        result: action.result,
        steps: action.result.steps,
        error: action.result.errorMessage ?? null,
      }
    case 'RESET':
      return makeInitialState()
  }
}
