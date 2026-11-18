import { Typography } from '@heroui/react'
import { formatWhen } from '../../../components/console-v2/consoleToast'
import {
  CellText,
  InlineWorkbenchTable,
  WorkbenchTableBody,
  WorkbenchTableHead,
  WorkbenchTd,
  WorkbenchTh,
} from '../../../components/workbench/ui/WorkbenchTable'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

export function AuditScreen() {
  const audit = useConsoleV2Store((s) => s.audit)

  const sorted = [...audit].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="space-y-4">
      <Typography.Paragraph size="sm" color="muted">
        Chronological who / what / when from seed data and console mutations (session-local).
      </Typography.Paragraph>

      <InlineWorkbenchTable minWidth={680}>
        <WorkbenchTableHead>
          <tr>
            <WorkbenchTh>When</WorkbenchTh>
            <WorkbenchTh>Who</WorkbenchTh>
            <WorkbenchTh>What</WorkbenchTh>
            <WorkbenchTh>Detail</WorkbenchTh>
          </tr>
        </WorkbenchTableHead>
        <WorkbenchTableBody>
          {sorted.map((entry) => (
            <tr key={entry.id}>
              <WorkbenchTd>
                <CellText color="muted">{formatWhen(entry.timestamp)}</CellText>
              </WorkbenchTd>
              <WorkbenchTd primary>
                <CellText>{entry.actor}</CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <CellText>{entry.action}</CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <CellText color="muted">{entry.detail}</CellText>
              </WorkbenchTd>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <WorkbenchTd colSpan={4}>
                <CellText color="muted">No audit entries.</CellText>
              </WorkbenchTd>
            </tr>
          )}
        </WorkbenchTableBody>
      </InlineWorkbenchTable>
    </div>
  )
}