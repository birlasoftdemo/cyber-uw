import type { CyberCase, RiskJudgment } from '../types'
import { triageFindingsForCase } from '../data/cyberTriageRules'
import { missingDocsForCase } from '../utils/missingDocs'

/** Cyber UW stages — singular, progressive labels for the underwriter. */
export const CYBER_FLOW_STAGES = [
  {
    key: 'intake',
    title: 'Policy Documents',
    subtext: 'Extracted package fields',
    pain: 'P2.1 · P2.6 · P2.7',
  },
  {
    key: 'triage',
    title: 'Risk Information',
    subtext: 'Triage rules from ingested documents',
    pain: 'P1.2 · P1.4 · P2.11',
  },
  {
    key: 'appetite',
    title: 'Risk Analysis',
    subtext: 'ALE and exposure graphs',
    pain: 'P3.4 · P3.5 · P3.7',
  },
  {
    key: 'decide',
    title: 'Getting Ready to Quote',
    subtext: 'Financial sign off and disposition',
    pain: 'P2.4 · P2.5 · P2.12',
  },
] as const

export type CyberFlowKey = (typeof CYBER_FLOW_STAGES)[number]['key']

export function riskReviewUnsignedCount(
  requiredIds: string[],
  judgments: Record<string, RiskJudgment> | undefined,
): number {
  return requiredIds.filter((id) => {
    const j = judgments?.[id]
    return !j || j.status === 'pending'
  }).length
}

/** Incomplete packages stay on Policy Documents. */
export function cyberFlowFloor(c: {
  completenessPct: number
  decision: string
  pasStatus: string
}): number {
  if (c.pasStatus === 'synced') return CYBER_FLOW_STAGES.length
  if (c.decision !== 'pending') return 3
  if (c.completenessPct < 80) return 0
  return 0
}

/**
 * Current stage index for stepper / cards.
 * Policy Documents → Risk Information → Risk Analysis → Getting Ready to Quote.
 */
export function cyberFlowIndex(c: {
  completenessPct: number
  decision: string
  pasStatus: string
  workflowStage?: number
}): number {
  if (c.pasStatus === 'synced') return CYBER_FLOW_STAGES.length
  if (c.decision !== 'pending') return 3
  const floor = cyberFlowFloor(c)
  const stage = c.workflowStage ?? 0
  return Math.min(3, Math.max(floor, stage))
}

export function flowStageTitle(c: {
  completenessPct: number
  decision: string
  pasStatus: string
  workflowStage?: number
}): string {
  const idx = cyberFlowIndex(c)
  if (idx >= CYBER_FLOW_STAGES.length) return CYBER_FLOW_STAGES[CYBER_FLOW_STAGES.length - 1].title
  return CYBER_FLOW_STAGES[idx].title
}

export function nextFlowStageTitle(currentIndex: number): string | null {
  if (currentIndex < 0 || currentIndex >= CYBER_FLOW_STAGES.length - 1) return null
  return CYBER_FLOW_STAGES[currentIndex + 1].title
}

export function canLeaveReviewRisk(
  requiredIds: string[],
  judgments: Record<string, RiskJudgment> | undefined,
): boolean {
  return riskReviewUnsignedCount(requiredIds, judgments) === 0
}

export function canLeaveRiskInformation(c: CyberCase): boolean {
  if (!c.packageSignOff?.signedOffAt) return false
  const requiredIds = triageFindingsForCase(c)
    .filter((f) => f.required)
    .map((f) => f.id)
  if (requiredIds.length === 0) return true
  return canLeaveReviewRisk(requiredIds, c.riskJudgments)
}

/** Ids of required triage findings still pending judgment. */
export function unsignedRequiredFindingIds(c: CyberCase): string[] {
  if (!c.packageSignOff?.signedOffAt) return []
  return triageFindingsForCase(c)
    .filter((f) => f.required)
    .filter((f) => {
      const j = c.riskJudgments?.[f.id]
      return !j || j.status === 'pending'
    })
    .map((f) => f.id)
}

/** Documents Complete CTA is the only Policy Documents gate. Answer sign-off is optional. */
export function canLeavePolicyDocuments(c: Pick<CyberCase, 'completenessPct' | 'packageSignOff' | 'missingDocs'>): boolean {
  if (c.completenessPct < 80) return false
  if (missingDocsForCase(c as CyberCase).length > 0) return false
  return Boolean(c.packageSignOff?.signedOffAt)
}

/** Ops may hand off when the package is complete enough. */
export function canOpsMarkReadyForUw(c: {
  completenessPct: number
  opsHandoffAt?: string
  decision: string
}): boolean {
  if (c.decision !== 'pending') return false
  if (c.opsHandoffAt) return false
  return c.completenessPct >= 80
}

export function isWithinJuniorAuthority(limitUsd: number, pricingTier: number): boolean {
  return limitUsd <= 5_000_000 && pricingTier <= 3
}

export function needsManagerCosign(opts: {
  limitUsd: number
  pricingTier: number
  criticalOpenGaps: number
}): boolean {
  if (!isWithinJuniorAuthority(opts.limitUsd, opts.pricingTier)) return true
  if (opts.criticalOpenGaps > 0) return true
  return false
}

export function isFinancialSignOffComplete(
  signOff: { signedOffAt?: string; withinAuthority: boolean; managerCosign: boolean } | undefined,
): boolean {
  if (!signOff?.signedOffAt) return false
  if (!signOff.withinAuthority && !signOff.managerCosign) return false
  return true
}
