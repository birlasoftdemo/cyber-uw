import type { ReferralTarget } from '../types'

/** Fixed demo roster for gap Refer / Escalate discussion. */
export const GAP_REFER_ASSIGNEES = [
  {
    id: 'alex-chen',
    label: 'Alex Chen — Senior UW',
    target: 'senior_uw' as const satisfies ReferralTarget,
  },
  {
    id: 'priya-nair',
    label: 'Priya Nair — Cyber specialist',
    target: 'specialist' as const satisfies ReferralTarget,
  },
  {
    id: 'jordan-lee',
    label: 'Jordan Lee — Portfolio risk',
    target: 'specialist' as const satisfies ReferralTarget,
  },
  {
    id: 'aon-desk',
    label: 'Aon Cyber Desk — Broker',
    target: 'broker' as const satisfies ReferralTarget,
  },
  {
    id: 'marsh-desk',
    label: 'Marsh Cyber Desk — Broker',
    target: 'broker' as const satisfies ReferralTarget,
  },
] as const

export type GapReferAssigneeId = (typeof GAP_REFER_ASSIGNEES)[number]['id']

export const REFERRAL_TARGET_LABELS: Record<ReferralTarget, string> = {
  specialist: 'Specialist',
  broker: 'Broker',
  senior_uw: 'Senior UW',
}
