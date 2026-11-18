import { Checkbox, Typography } from '@heroui/react'
import {
  accessToFlags,
  flagsToAccess,
  CONSOLE_FEATURES,
  CONSOLE_ROLES,
  type ConsoleRoleId,
  type FeatureAccess,
  type FeatureId,
  type PermissionFlag,
} from '../../../data/consoleV2Seed'
import { useAuthStore } from '../../../store/authStore'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

const FLAG_COLS: { key: PermissionFlag; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'execute', label: 'Execute' },
  { key: 'approve', label: 'Approve' },
]

export function PermissionsScreen() {
  const actor = useAuthStore((s) => s.user?.name ?? 'System Admin')
  const matrix = useConsoleV2Store((s) => s.matrix)
  const selectedRoleId = useConsoleV2Store((s) => s.selectedRoleId)
  const setSelectedRoleId = useConsoleV2Store((s) => s.setSelectedRoleId)
  const setMatrixAccess = useConsoleV2Store((s) => s.setMatrixAccess)

  const selectedRole = CONSOLE_ROLES.find((r) => r.id === selectedRoleId) ?? CONSOLE_ROLES[0]

  const onToggle = (featureId: FeatureId, flag: PermissionFlag, checked: boolean) => {
    const current = accessToFlags(matrix[featureId][selectedRoleId])
    const nextFlags = { ...current, [flag]: checked }
    if (flag === 'edit' && checked) {
      nextFlags.view = true
      nextFlags.create = true
    }
    if (flag === 'approve' && checked) {
      nextFlags.view = true
      nextFlags.execute = true
    }
    if (flag === 'view' && !checked) {
      nextFlags.create = false
      nextFlags.edit = false
      nextFlags.execute = false
      nextFlags.approve = false
    }
    const access: FeatureAccess = flagsToAccess(nextFlags)
    setMatrixAccess(featureId, selectedRoleId, access, actor)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Typography.Paragraph size="sm" color="muted">
          Feature × permission grid for the selected role. Seeded from the F01–F17 RBAC matrix.
        </Typography.Paragraph>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span className="shrink-0 font-medium">Role</span>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value as ConsoleRoleId)}
            aria-label="Select role"
          >
            {CONSOLE_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} — {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm font-medium text-slate-800">
        Editing: {selectedRole.code} {selectedRole.label}
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="wb-table min-w-[720px]">
          <thead className="wb-table-head">
            <tr>
              <th className="wb-table-th wb-table-th--left">Function</th>
              <th className="wb-table-th wb-table-th--left">Module</th>
              {FLAG_COLS.map((col) => (
                <th key={col.key} className="wb-table-th wb-table-th--center">
                  {col.label}
                </th>
              ))}
              <th className="wb-table-th wb-table-th--left">Access</th>
            </tr>
          </thead>
          <tbody className="wb-table-body">
            {CONSOLE_FEATURES.map((feature) => {
              const access = matrix[feature.id][selectedRoleId]
              const flags = accessToFlags(access)
              return (
                <tr key={feature.id}>
                  <td className="wb-table-td wb-table-td--left wb-table-td--primary">
                    <span className="text-xs font-medium text-slate-800">
                      {feature.code} {feature.label}
                    </span>
                  </td>
                  <td className="wb-table-td wb-table-td--left">
                    <span className="text-xs text-slate-500">{feature.module}</span>
                  </td>
                  {FLAG_COLS.map((col) => (
                    <td key={col.key} className="wb-table-td wb-table-td--center">
                      <Checkbox
                        isSelected={flags[col.key]}
                        onChange={(on) => onToggle(feature.id, col.key, on)}
                        aria-label={`${feature.code} ${col.label}`}
                      >
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Content>
                      </Checkbox>
                    </td>
                  ))}
                  <td className="wb-table-td wb-table-td--left">
                    <span className="text-xs capitalize text-slate-600">{access}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}