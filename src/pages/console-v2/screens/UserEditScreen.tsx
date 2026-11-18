import { Button, Checkbox, Input, Label, Typography } from '@heroui/react'
import { useEffect, useState, type ReactNode } from 'react'
import { stubToast } from '../../../components/console-v2/consoleToast'
import {
  CONSOLE_LOBS,
  CONSOLE_ROLES,
  type ConsoleRoleId,
  type ConsoleUser,
  type RoleAssignment,
  type UserStatus,
} from '../../../data/consoleV2Seed'
import { useAuthStore } from '../../../store/authStore'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

type UserDraft = Omit<ConsoleUser, 'id' | 'createdAt'> & { id?: string }

export function UserEditScreen() {
  const actor = useAuthStore((s) => s.user?.name ?? 'System Admin')
  const getUserDraft = useConsoleV2Store((s) => s.getUserDraft)
  const editingUserId = useConsoleV2Store((s) => s.editingUserId)
  const saveUser = useConsoleV2Store((s) => s.saveUser)
  const setScreen = useConsoleV2Store((s) => s.setScreen)
  const appendAudit = useConsoleV2Store((s) => s.appendAudit)

  const [draft, setDraft] = useState<UserDraft>(() => getUserDraft())

  useEffect(() => {
    setDraft(getUserDraft())
  }, [editingUserId, getUserDraft])

  const isEdit = Boolean(draft.id)

  const toggleRole = (roleId: ConsoleRoleId, checked: boolean) => {
    setDraft((prev) => {
      if (checked) {
        if (prev.roles.some((r) => r.roleId === roleId)) return prev
        return { ...prev, roles: [...prev.roles, { roleId, lobs: [] }] }
      }
      return { ...prev, roles: prev.roles.filter((r) => r.roleId !== roleId) }
    })
  }

  const toggleLob = (roleId: ConsoleRoleId, lob: string, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => {
        if (r.roleId !== roleId) return r
        const lobs = checked ? [...r.lobs, lob] : r.lobs.filter((l) => l !== lob)
        return { ...r, lobs }
      }),
    }))
  }

  const onSave = () => {
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim()) {
      stubToast('Missing required fields', 'First name, last name, and email are required.')
      return
    }
    saveUser(draft, actor)
    stubToast('Save & Notify', 'Prototype only — no email sent; user is not a real login account.')
  }

  const onResend = () => {
    appendAudit(actor, 'Resend credentials', `${draft.email} — stub`)
    stubToast('Resend Credentials', 'Prototype stub — no credentials emailed.')
  }

  const onReset = () => {
    appendAudit(actor, 'Password reset requested', `${draft.email} — stub`)
    stubToast('Send password reset', 'Prototype stub — no reset email sent.')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Typography.Paragraph size="sm" color="muted">
        {isEdit ? 'Edit console user profile' : 'Create a console user profile'} — does not create a
        real login account.
      </Typography.Paragraph>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First Name">
          <Input
            value={draft.firstName}
            onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
            aria-label="First Name"
          />
        </Field>
        <Field label="Last Name">
          <Input
            value={draft.lastName}
            onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
            aria-label="Last Name"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            aria-label="Email"
          />
        </Field>
        <Field label="Employee ID">
          <Input
            value={draft.employeeId}
            onChange={(e) => setDraft((d) => ({ ...d, employeeId: e.target.value }))}
            aria-label="Employee ID"
          />
        </Field>
        <Field label="Team">
          <Input
            value={draft.team}
            onChange={(e) => setDraft((d) => ({ ...d, team: e.target.value }))}
            aria-label="Team"
          />
        </Field>
        <Field label="Status">
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={draft.status}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as UserStatus }))}
            aria-label="Status"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-800">Roles (R01–R05)</p>
        <div className="space-y-4">
          {CONSOLE_ROLES.map((role) => {
            const assignment = draft.roles.find((r) => r.roleId === role.id)
            return (
              <RoleBlock
                key={role.id}
                roleCode={role.code}
                roleLabel={role.label}
                assignment={assignment}
                checked={Boolean(assignment)}
                onToggleRole={(checked) => toggleRole(role.id, checked)}
                onToggleLob={(lob, checked) => toggleLob(role.id, lob, checked)}
              />
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" onPress={onSave}>
          Save & Notify
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            stubToast('Cancelled', 'No changes saved.')
            setScreen('users')
          }}
        >
          Cancel
        </Button>
        {isEdit && (
          <>
            <Button size="sm" variant="secondary" onPress={onResend}>
              Resend Credentials
            </Button>
            <Button size="sm" variant="secondary" onPress={onReset}>
              Send password reset
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  )
}

function RoleBlock({
  roleCode,
  roleLabel,
  assignment,
  checked,
  onToggleRole,
  onToggleLob,
}: {
  roleCode: string
  roleLabel: string
  assignment: RoleAssignment | undefined
  checked: boolean
  onToggleRole: (checked: boolean) => void
  onToggleLob: (lob: string, checked: boolean) => void
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
      <Checkbox isSelected={checked} onChange={onToggleRole}>
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <span className="text-sm font-medium text-slate-800">
            {roleCode} — {roleLabel}
          </span>
        </Checkbox.Content>
      </Checkbox>
      {checked && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CONSOLE_LOBS.map((lob) => (
            <Checkbox
              key={lob}
              isSelected={assignment?.lobs.includes(lob) ?? false}
              onChange={(v) => onToggleLob(lob, v)}
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <span className="text-xs text-slate-700">{lob}</span>
              </Checkbox.Content>
            </Checkbox>
          ))}
        </div>
      )}
    </div>
  )
}