import type { CyberCase, ReferralStatus, ReferralTicket } from '../types'

export const SUBMISSION_STATUSES = [
  'New',
  'Processing',
  'Broker Follow-up',
  'Under Review',
  'Referred',
  'Approved',
  'Declined',
] as const

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

const INFO_REQUEST: ReadonlySet<ReferralStatus> = new Set(['awaiting_broker'])

export function submissionStatus(
  c: Pick<CyberCase, 'id' | 'decision' | 'workflowStage' | 'pasStatus' | 'missingDocs' | 'completenessPct'>,
  referrals: Pick<ReferralTicket, 'caseId' | 'status'>[],
): SubmissionStatus {
  if (c.decision === 'decline') return 'Declined'
  if (c.decision === 'quote') return 'Approved'
  if (c.decision === 'refer') return 'Referred'

  const awaitingBroker = referrals.some(
    (ticket) => ticket.caseId === c.id && INFO_REQUEST.has(ticket.status),
  )
  const missing = (c.missingDocs?.length ?? 0) > 0 || c.completenessPct < 80
  const stage = c.workflowStage ?? 0

  if (awaitingBroker || (stage >= 1 && missing && stage < 3)) return 'Broker Follow-up'
  if (stage <= 0) return 'New'
  if (stage === 1) return 'Processing'
  return 'Under Review'
}

/** Dashboard counter buckets from the ACUI feedback. */
export type DashboardCounter =
  | 'newSubmissions'
  | 'inProgress'
  | 'referred'
  | 'awaitingBroker'

export function dashboardCounterForCase(
  c: Pick<CyberCase, 'id' | 'decision' | 'workflowStage' | 'pasStatus' | 'missingDocs' | 'completenessPct'>,
  referrals: Pick<ReferralTicket, 'caseId' | 'status'>[],
): DashboardCounter | null {
  const status = submissionStatus(c, referrals)
  switch (status) {
    case 'New':
      return 'newSubmissions'
    case 'Processing':
    case 'Under Review':
      return 'inProgress'
    case 'Referred':
      return 'referred'
    case 'Broker Follow-up':
      return 'awaitingBroker'
    case 'Approved':
    case 'Declined':
      return null
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

export function isDecisionReady(
  c: Pick<CyberCase, 'id' | 'decision' | 'workflowStage' | 'pasStatus' | 'missingDocs' | 'completenessPct'>,
  referrals: Pick<ReferralTicket, 'caseId' | 'status'>[],
): boolean {
  if (c.decision !== 'pending') return false
  if (dashboardCounterForCase(c, referrals) === 'awaitingBroker') return false
  const stage = c.workflowStage ?? 0
  return stage >= 2 && (c.missingDocs?.length ?? 0) === 0 && c.completenessPct >= 80
}
