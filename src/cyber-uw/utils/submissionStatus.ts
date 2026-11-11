import type { CyberCase, ReferralStatus, ReferralTicket } from '../types'

export const SUBMISSION_STATUSES = [
  'New',
  'In Progress',
  'Completed',
  'Rejected',
  'More Info Required',
] as const

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

const INFO_REQUEST: ReadonlySet<ReferralStatus> = new Set(['awaiting_broker'])

export function submissionStatus(
  c: Pick<CyberCase, 'id' | 'decision' | 'workflowStage' | 'pasStatus'>,
  referrals: Pick<ReferralTicket, 'caseId' | 'status'>[],
): SubmissionStatus {
  if (c.decision === 'decline') return 'Rejected'
  if (c.decision === 'quote' || c.pasStatus === 'synced') return 'Completed'
  const waitingOnInfo =
    c.decision === 'refer' ||
    referrals.some((ticket) => ticket.caseId === c.id && INFO_REQUEST.has(ticket.status))
  if (waitingOnInfo) return 'More Info Required'
  if ((c.workflowStage ?? 0) <= 0) return 'New'
  return 'In Progress'
}
