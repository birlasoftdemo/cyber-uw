import { Button, Input } from '@heroui/react'
import { Plus, Search } from 'lucide-react'
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
import { CONSOLE_ROLES, roleLabel, type ConsoleRoleId, type UserStatus } from '../../../data/consoleV2Seed'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

function statusTone(status: UserStatus): 'complete' | 'warning' | 'neutral' {
  switch (status) {
    case 'active':
      return 'complete'
    case 'pending':
      return 'warning'
    case 'inactive':
      return 'neutral'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

export function UsersScreen() {
  const users = useConsoleV2Store((s) => s.users)
  const openCreateUser = useConsoleV2Store((s) => s.openCreateUser)
  const openEditUser = useConsoleV2Store((s) => s.openEditUser)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<ConsoleRoleId | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && !u.roles.some((r) => r.roleId === roleFilter)) return false
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (!q) return true
      const hay = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase()
      return hay.includes(q)
    })
  }, [users, query, roleFilter, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
              className="pl-9"
              aria-label="Search users"
            />
          </div>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as ConsoleRoleId | 'all')}
            aria-label="Filter by role"
          >
            <option value="all">All roles</option>
            {CONSOLE_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} {r.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Button size="sm" variant="primary" onPress={() => openCreateUser()}>
          <Plus size={14} />
          Add User
        </Button>
      </div>

      <InlineWorkbenchTable minWidth={720}>
        <WorkbenchTableHead>
          <tr>
            <WorkbenchTh>Name</WorkbenchTh>
            <WorkbenchTh>Email</WorkbenchTh>
            <WorkbenchTh>Roles</WorkbenchTh>
            <WorkbenchTh>Status</WorkbenchTh>
            <WorkbenchTh align="right">Edit</WorkbenchTh>
          </tr>
        </WorkbenchTableHead>
        <WorkbenchTableBody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <WorkbenchTd primary>
                <CellText>
                  {user.firstName} {user.lastName}
                </CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <CellText color="muted">{user.email}</CellText>
              </WorkbenchTd>
              <WorkbenchTd>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((r) => (
                    <StatusChip key={`${user.id}-${r.roleId}`} tone="human">
                      {roleLabel(r.roleId)}
                    </StatusChip>
                  ))}
                </div>
              </WorkbenchTd>
              <WorkbenchTd>
                <StatusChip tone={statusTone(user.status)}>{user.status}</StatusChip>
              </WorkbenchTd>
              <WorkbenchTd align="right">
                <Button size="sm" variant="secondary" onPress={() => openEditUser(user.id)}>
                  Edit
                </Button>
              </WorkbenchTd>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <WorkbenchTd colSpan={5}>
                <CellText color="muted">No users match the current filters.</CellText>
              </WorkbenchTd>
            </tr>
          )}
        </WorkbenchTableBody>
      </InlineWorkbenchTable>
    </div>
  )
}