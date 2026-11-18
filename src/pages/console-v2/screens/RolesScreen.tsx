import { Button, Typography } from '@heroui/react'
import { StatusChip } from '../../../components/workbench/ui/StatusChip'
import {
  CellText,
  InlineWorkbenchTable,
  WorkbenchTableBody,
  WorkbenchTableHead,
  WorkbenchTd,
  WorkbenchTh,
} from '../../../components/workbench/ui/WorkbenchTable'
import { CONSOLE_ROLES } from '../../../data/consoleV2Seed'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

export function RolesScreen() {
  const users = useConsoleV2Store((s) => s.users)
  const setScreen = useConsoleV2Store((s) => s.setScreen)
  const setSelectedRoleId = useConsoleV2Store((s) => s.setSelectedRoleId)

  const counts = CONSOLE_ROLES.map((role) => ({
    ...role,
    count: users.filter((u) => u.roles.some((r) => r.roleId === role.id)).length,
  }))

  return (
    <div className="space-y-4">
      <Typography.Paragraph size="sm" color="muted">
        Roles are predefined (R01–R05) for this prototype. Custom role creation is out of scope —
        manage feature access on the Permissions screen.
      </Typography.Paragraph>

      <InlineWorkbenchTable minWidth={640}>
        <WorkbenchTableHead>
          <tr>
            <WorkbenchTh>Code</WorkbenchTh>
            <WorkbenchTh>Role</WorkbenchTh>
            <WorkbenchTh>Description</WorkbenchTh>
            <WorkbenchTh align="center">Users</WorkbenchTh>
            <WorkbenchTh align="right">Permissions</WorkbenchTh>
          </tr>
        </WorkbenchTableHead>
        <WorkbenchTableBody>
          {counts.map((role) => (
            <tr key={role.id}>
              <WorkbenchTd>
                <StatusChip tone="info">{role.code}</StatusChip>
              </WorkbenchTd>
              <WorkbenchTd primary>
                <CellText>{role.label}</CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <CellText color="muted">{role.description}</CellText>
              </WorkbenchTd>
              <WorkbenchTd align="center">
                <CellText>{role.count}</CellText>
              </WorkbenchTd>
              <WorkbenchTd align="right">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => {
                    setSelectedRoleId(role.id)
                    setScreen('permissions')
                  }}
                >
                  Permissions
                </Button>
              </WorkbenchTd>
            </tr>
          ))}
        </WorkbenchTableBody>
      </InlineWorkbenchTable>
    </div>
  )
}