import { Checkbox, Typography } from '@heroui/react'
import { CONSOLE_FEATURES, CONSOLE_ROLES, type ConsoleRoleId, type FeatureId } from '../../../data/consoleV2Seed'
import { useAuthStore } from '../../../store/authStore'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

export function FunctionsScreen() {
  const actor = useAuthStore((s) => s.user?.name ?? 'System Admin')
  const functionEnablement = useConsoleV2Store((s) => s.functionEnablement)
  const setFunctionEnabled = useConsoleV2Store((s) => s.setFunctionEnabled)

  const onToggle = (featureId: FeatureId, roleId: ConsoleRoleId, enabled: boolean) => {
    setFunctionEnabled(featureId, roleId, enabled, actor)
  }

  return (
    <div className="space-y-4">
      <Typography.Paragraph size="sm" color="muted">
        Function × role enablement. Unchecking a role removes access for that feature; checking
        restores at least View.
      </Typography.Paragraph>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="wb-table min-w-[800px]">
          <thead className="wb-table-head">
            <tr>
              <th className="wb-table-th wb-table-th--left">Function</th>
              {CONSOLE_ROLES.map((role) => (
                <th key={role.id} className="wb-table-th wb-table-th--center">
                  {role.code}
                  <div className="normal-case tracking-normal text-[10px] font-normal text-slate-500">
                    {role.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="wb-table-body">
            {CONSOLE_FEATURES.map((feature) => (
              <tr key={feature.id}>
                <td className="wb-table-td wb-table-td--left wb-table-td--primary">
                  <span className="text-xs font-medium text-slate-800">
                    {feature.code} {feature.label}
                  </span>
                  <div className="text-[10px] text-slate-500">{feature.module}</div>
                </td>
                {CONSOLE_ROLES.map((role) => (
                  <td key={role.id} className="wb-table-td wb-table-td--center">
                    <Checkbox
                      isSelected={functionEnablement[feature.id]?.[role.id] ?? false}
                      onChange={(on) => onToggle(feature.id, role.id, on)}
                      aria-label={`${feature.code} ${role.code}`}
                    >
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox.Content>
                    </Checkbox>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}