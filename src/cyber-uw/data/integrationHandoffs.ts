import type { CyberCase, IntegrationHandoff } from '../types'

export function integrationHandoffsForCase(c: CyberCase): IntegrationHandoff[] {
  if (c.integrationHandoffs?.length) return c.integrationHandoffs

  const synced = c.pasStatus === 'synced'
  const decided = c.decision !== 'pending'
  const baseAt = c.receivedAt

  return [
    {
      target: 'policy_admin',
      label: 'Policy Administration',
      status: synced ? 'Success' : decided ? 'Submitted' : 'Pending Approval',
      updatedAt: baseAt,
    },
    {
      target: 'rating_pricing',
      label: 'Rating / Pricing',
      status: synced ? 'Success' : decided ? 'Validated' : 'Pending Approval',
      updatedAt: baseAt,
    },
    {
      target: 'broker_crm',
      label: 'Broker CRM',
      status:
        c.decision === 'refer'
          ? 'Submitted'
          : synced
            ? 'Success'
            : decided
              ? 'Validated'
              : 'Pending Approval',
      updatedAt: baseAt,
    },
  ]
}
