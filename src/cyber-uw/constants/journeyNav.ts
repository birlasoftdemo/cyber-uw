/** In-case left-nav journey for Adaptive Cyber Underwriting Intelligence. */
export const JOURNEY_STEPS = [
  { id: 'intake', label: 'Intake' },
  { id: 'risk', label: 'Risk Analysis' },
  { id: 'enrichment', label: 'Enrichment' },
  { id: 'evidence', label: 'Evidence Validation' },
  { id: 'decision', label: 'Decision' },
  { id: 'audit', label: 'Audit' },
] as const

export type JourneyStepId = (typeof JOURNEY_STEPS)[number]['id']

export const PRODUCT_NAME = 'Adaptive Cyber Underwriting Intelligence'

/** Map journey step → legacy workflowStage for store continuity. */
export function workflowStageForJourney(step: JourneyStepId): number {
  switch (step) {
    case 'intake':
      return 0
    case 'evidence':
      return 1
    case 'risk':
    case 'enrichment':
      return 2
    case 'decision':
    case 'audit':
      return 3
    default: {
      const neverStep: never = step
      return neverStep
    }
  }
}

export function journeyStepForCase(input: {
  decision: string
  pasStatus: string
  workflowStage?: number
}): JourneyStepId {
  if (input.pasStatus === 'synced' || input.decision !== 'pending') return 'decision'
  const stage = input.workflowStage ?? 0
  if (stage <= 0) return 'intake'
  if (stage === 1) return 'evidence'
  if (stage === 2) return 'risk'
  return 'decision'
}
