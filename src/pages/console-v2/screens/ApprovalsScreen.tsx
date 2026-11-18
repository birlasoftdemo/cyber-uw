import { Button, Typography } from '@heroui/react'
import { useState } from 'react'
import { stubToast, formatWhen } from '../../../components/console-v2/consoleToast'
import { StatusChip } from '../../../components/workbench/ui/StatusChip'
import {
  CellText,
  InlineWorkbenchTable,
  WorkbenchTableBody,
  WorkbenchTableHead,
  WorkbenchTd,
  WorkbenchTh,
} from '../../../components/workbench/ui/WorkbenchTable'
import { roleLabel, type RegistrationRequest } from '../../../data/consoleV2Seed'
import { useAuthStore } from '../../../store/authStore'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

export function ApprovalsScreen() {
  const actor = useAuthStore((s) => s.user?.name ?? 'System Admin')
  const approvals = useConsoleV2Store((s) => s.approvals)
  const resolveApproval = useConsoleV2Store((s) => s.resolveApproval)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const pending = approvals.filter((a) => a.status === 'pending')
  const preview = approvals.find((a) => a.id === previewId) ?? pending[0] ?? null

  const onApprove = (req: RegistrationRequest) => {
    resolveApproval(req.id, 'approved', actor)
    stubToast('Approve & Notify', `${req.firstName} ${req.lastName} approved — no email sent (prototype).`)
  }

  const onReject = (req: RegistrationRequest) => {
    resolveApproval(req.id, 'rejected', actor)
    stubToast('Rejected', `${req.firstName} ${req.lastName} rejected — stub only.`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <InlineWorkbenchTable minWidth={640}>
          <WorkbenchTableHead>
            <tr>
              <WorkbenchTh>Applicant</WorkbenchTh>
              <WorkbenchTh>Team</WorkbenchTh>
              <WorkbenchTh>Roles</WorkbenchTh>
              <WorkbenchTh>Submitted</WorkbenchTh>
              <WorkbenchTh align="right">Actions</WorkbenchTh>
            </tr>
          </WorkbenchTableHead>
          <WorkbenchTableBody>
            {pending.map((req) => (
              <tr
                key={req.id}
                className={preview?.id === req.id ? 'bg-slate-50' : undefined}
                onClick={() => setPreviewId(req.id)}
              >
                <WorkbenchTd primary>
                  <CellText>
                    {req.firstName} {req.lastName}
                  </CellText>
                  <CellText color="muted">{req.email}</CellText>
                </WorkbenchTd>
                <WorkbenchTd>
                  <CellText>{req.team}</CellText>
                </WorkbenchTd>
                <WorkbenchTd>
                  <div className="flex flex-wrap gap-1">
                    {req.requestedRoles.map((r) => (
                      <StatusChip key={r} tone="human">
                        {roleLabel(r)}
                      </StatusChip>
                    ))}
                  </div>
                </WorkbenchTd>
                <WorkbenchTd>
                  <CellText color="muted">{formatWhen(req.submittedAt)}</CellText>
                </WorkbenchTd>
                <WorkbenchTd align="right">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => onApprove(req)}
                    >
                      Approve & Notify
                    </Button>
                    <Button size="sm" variant="secondary" onPress={() => onReject(req)}>
                      Reject
                    </Button>
                  </div>
                </WorkbenchTd>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr>
                <WorkbenchTd colSpan={5}>
                  <CellText color="muted">No pending registration requests.</CellText>
                </WorkbenchTd>
              </tr>
            )}
          </WorkbenchTableBody>
        </InlineWorkbenchTable>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Self-registration preview</p>
          {preview ? (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="text-slate-500">Name:</span> {preview.firstName} {preview.lastName}
              </p>
              <p>
                <span className="text-slate-500">Email:</span> {preview.email}
              </p>
              <p>
                <span className="text-slate-500">Employee ID:</span> {preview.employeeId}
              </p>
              <p>
                <span className="text-slate-500">Team:</span> {preview.team}
              </p>
              <p>
                <span className="text-slate-500">Requested roles:</span>{' '}
                {preview.requestedRoles.map(roleLabel).join(', ')}
              </p>
              <p>
                <span className="text-slate-500">Requested LOBs:</span>{' '}
                {preview.requestedLobs.join(', ')}
              </p>
              {preview.notes && (
                <p>
                  <span className="text-slate-500">Notes:</span> {preview.notes}
                </p>
              )}
              <StatusChip tone="warning">{preview.status}</StatusChip>
            </div>
          ) : (
            <Typography.Paragraph size="sm" color="muted" className="mt-3">
              Select a pending request to preview the self-registration payload.
            </Typography.Paragraph>
          )}
        </div>
      </div>
    </div>
  )
}