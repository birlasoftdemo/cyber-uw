import { Typography } from '@heroui/react'

/**
 * Placeholder for UA Policy Copilot / impersonation / write-access controls.
 * Full legacy admin tooling is not ported into cyber-uw; Console v2 wireframes
 * remain the review surface.
 */
export function LegacyPolicyTools() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
      <Typography.Paragraph size="sm" weight="medium" className="text-slate-800">
        Legacy policy tools
      </Typography.Paragraph>
      <Typography.Paragraph size="sm" color="muted" className="mt-1">
        Policy Copilot, impersonation, and write-access toggles from the previous admin console are
        parked here for the wireframe walkthrough. They are not required for RBAC screen approval
        in cyber-uw.
      </Typography.Paragraph>
    </div>
  )
}
