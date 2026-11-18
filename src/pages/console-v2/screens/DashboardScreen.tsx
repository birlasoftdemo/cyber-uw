import { Accordion, Button, Typography } from '@heroui/react'
import { ChevronDown, Plus, ScrollText, UserPlus } from 'lucide-react'
import { LegacyPolicyTools } from '../../../components/console-v2/LegacyPolicyTools'
import { formatWhen } from '../../../components/console-v2/consoleToast'
import { DashboardCard } from '../../../components/dashboard/DashboardCard'
import { CONSOLE_ROLES } from '../../../data/consoleV2Seed'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

export function DashboardScreen() {
  const users = useConsoleV2Store((s) => s.users)
  const approvals = useConsoleV2Store((s) => s.approvals)
  const rules = useConsoleV2Store((s) => s.rules)
  const audit = useConsoleV2Store((s) => s.audit)
  const setScreen = useConsoleV2Store((s) => s.setScreen)
  const openCreateUser = useConsoleV2Store((s) => s.openCreateUser)
  const openCreateRule = useConsoleV2Store((s) => s.openCreateRule)

  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length
  const activeRules = rules.filter((r) => r.status === 'active').length

  const kpis = [
    { label: 'Total Users', value: users.length },
    { label: 'Predefined Roles', value: CONSOLE_ROLES.length },
    { label: 'Pending Approvals', value: pendingApprovals },
    { label: 'Active Rules', value: activeRules },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <DashboardCard title="Quick actions" dense minHeight="min-h-0">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary" onPress={() => openCreateUser()}>
            <UserPlus size={14} />
            Add User
          </Button>
          <Button size="sm" variant="secondary" onPress={() => setScreen('approvals')}>
            Review Approvals
          </Button>
          <Button size="sm" variant="secondary" onPress={() => openCreateRule()}>
            <Plus size={14} />
            New Rule
          </Button>
          <Button size="sm" variant="secondary" onPress={() => setScreen('audit')}>
            <ScrollText size={14} />
            Audit log
          </Button>
        </div>
      </DashboardCard>

      <DashboardCard title="Recent activity" dense minHeight="min-h-0">
        {audit.length === 0 ? (
          <Typography.Paragraph size="sm" color="muted">
            No activity yet.
          </Typography.Paragraph>
        ) : (
          <ul className="divide-y divide-slate-100">
            {audit.slice(0, 6).map((entry) => (
              <li key={entry.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{entry.action}</p>
                  <p className="text-xs text-slate-500">
                    {entry.actor} — {entry.detail}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-slate-400">{formatWhen(entry.timestamp)}</p>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <Accordion className="w-full" variant="surface">
        <Accordion.Item id="legacy-policy-tools">
          <Accordion.Heading>
            <Accordion.Trigger className="text-sm font-medium text-slate-800">
              Legacy policy tools
              <Accordion.Indicator>
                <ChevronDown size={16} />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="pt-2 pb-4">
              <Typography.Paragraph size="sm" color="muted" className="mb-4">
                Policy Copilot, impersonation, and write-access controls from the previous console —
                parked here for the wireframe prototype. Workbench F01–F13 enforcement is unchanged.
              </Typography.Paragraph>
              <LegacyPolicyTools />
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}