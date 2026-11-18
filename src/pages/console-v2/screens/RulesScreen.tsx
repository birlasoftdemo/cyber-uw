import { Button } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusChip } from '../../../components/workbench/ui/StatusChip'
import {
  CellText,
  InlineWorkbenchTable,
  WorkbenchTableBody,
  WorkbenchTableHead,
  WorkbenchTd,
  WorkbenchTh,
} from '../../../components/workbench/ui/WorkbenchTable'
import { CONSOLE_APPS, CONSOLE_LOBS, type RuleStatus } from '../../../data/consoleV2Seed'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

function ruleTone(status: RuleStatus): 'complete' | 'warning' | 'neutral' {
  switch (status) {
    case 'active':
      return 'complete'
    case 'draft':
      return 'warning'
    case 'inactive':
      return 'neutral'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

export function RulesScreen() {
  const rules = useConsoleV2Store((s) => s.rules)
  const openCreateRule = useConsoleV2Store((s) => s.openCreateRule)
  const openEditRule = useConsoleV2Store((s) => s.openEditRule)

  const [appFilter, setAppFilter] = useState<string>('all')
  const [lobFilter, setLobFilter] = useState<string>('all')

  const counts = useMemo(() => {
    return {
      active: rules.filter((r) => r.status === 'active').length,
      draft: rules.filter((r) => r.status === 'draft').length,
      inactive: rules.filter((r) => r.status === 'inactive').length,
    }
  }, [rules])

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      if (appFilter !== 'all' && r.app !== appFilter) return false
      if (lobFilter !== 'all' && r.lob !== lobFilter) return false
      return true
    })
  }, [rules, appFilter, lobFilter])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            { label: 'Active', value: counts.active, tone: 'complete' as const },
            { label: 'Draft', value: counts.draft, tone: 'warning' as const },
            { label: 'Inactive', value: counts.inactive, tone: 'neutral' as const },
          ] as const
        ).map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
              <StatusChip tone={card.tone}>{card.label}</StatusChip>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            aria-label="Filter by app"
          >
            <option value="all">All apps</option>
            {CONSOLE_APPS.map((app) => (
              <option key={app} value={app}>
                {app}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={lobFilter}
            onChange={(e) => setLobFilter(e.target.value)}
            aria-label="Filter by LOB"
          >
            <option value="all">All LOBs</option>
            {CONSOLE_LOBS.map((lob) => (
              <option key={lob} value={lob}>
                {lob}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" variant="primary" onPress={() => openCreateRule()}>
          <Plus size={14} />
          New Rule
        </Button>
      </div>

      <InlineWorkbenchTable minWidth={760}>
        <WorkbenchTableHead>
          <tr>
            <WorkbenchTh>Rule Name</WorkbenchTh>
            <WorkbenchTh>App</WorkbenchTh>
            <WorkbenchTh>LOB</WorkbenchTh>
            <WorkbenchTh>Version</WorkbenchTh>
            <WorkbenchTh>Status</WorkbenchTh>
            <WorkbenchTh align="right">Edit</WorkbenchTh>
          </tr>
        </WorkbenchTableHead>
        <WorkbenchTableBody>
          {filtered.map((rule) => (
            <tr key={rule.id}>
              <WorkbenchTd primary>
                <CellText>{rule.name}</CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <CellText color="muted">{rule.app}</CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <CellText>{rule.lob}</CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <CellText color="muted">v{rule.version}</CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <StatusChip tone={ruleTone(rule.status)}>{rule.status}</StatusChip>
              </WorkbenchTd>
              <WorkbenchTd align="right">
                <Button size="sm" variant="secondary" onPress={() => openEditRule(rule.id)}>
                  Edit
                </Button>
              </WorkbenchTd>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <WorkbenchTd colSpan={6}>
                <CellText color="muted">No rules match the current filters.</CellText>
              </WorkbenchTd>
            </tr>
          )}
        </WorkbenchTableBody>
      </InlineWorkbenchTable>
    </div>
  )
}