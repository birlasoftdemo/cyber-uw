import { Button, Typography } from '@heroui/react'
import {
  ArrowLeft,
  Bell,
  ClipboardCheck,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Search,
  Shield,
  SlidersHorizontal,
  Users,
  Workflow,
} from 'lucide-react'
import { useEffect } from 'react'
import { StatusChip } from '../../components/workbench/ui/StatusChip'
import { WorkbenchPageHeader } from '../../components/workbench/ui/WorkbenchPageHeader'
import {
  screenTitle,
  type ConsoleScreen,
} from '../../data/consoleV2Seed'
import { useAuthStore } from '../../store/authStore'
import { useConsoleV2Store } from '../../store/consoleV2Store'
import { ApprovalsScreen } from './screens/ApprovalsScreen'
import { AuditScreen } from './screens/AuditScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { FunctionsScreen } from './screens/FunctionsScreen'
import { PermissionsScreen } from './screens/PermissionsScreen'
import { RolesScreen } from './screens/RolesScreen'
import { RuleEditorScreen } from './screens/RuleEditorScreen'
import { RulesScreen } from './screens/RulesScreen'
import { UserEditScreen } from './screens/UserEditScreen'
import { UsersScreen } from './screens/UsersScreen'

const NAV_ITEMS: { id: ConsoleScreen; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'permissions', label: 'Permissions', icon: KeyRound },
  { id: 'functions', label: 'Functions', icon: Workflow },
  { id: 'rules', label: 'Rules', icon: SlidersHorizontal },
  { id: 'audit', label: 'Audit', icon: ScrollText },
]

function isNavActive(screen: ConsoleScreen, itemId: ConsoleScreen): boolean {
  if (itemId === 'users') return screen === 'users' || screen === 'user_edit'
  if (itemId === 'rules') return screen === 'rules' || screen === 'rule_editor'
  return screen === itemId
}

function renderScreen(screen: ConsoleScreen) {
  switch (screen) {
    case 'dashboard':
      return <DashboardScreen />
    case 'users':
      return <UsersScreen />
    case 'user_edit':
      return <UserEditScreen />
    case 'approvals':
      return <ApprovalsScreen />
    case 'roles':
      return <RolesScreen />
    case 'permissions':
      return <PermissionsScreen />
    case 'functions':
      return <FunctionsScreen />
    case 'rules':
      return <RulesScreen />
    case 'rule_editor':
      return <RuleEditorScreen />
    case 'audit':
      return <AuditScreen />
    default: {
      const _exhaustive: never = screen
      return _exhaustive
    }
  }
}

export function ConsoleV2Shell() {
  const user = useAuthStore((s) => s.user)
  const leaveAdminConsole = useAuthStore((s) => s.leaveAdminConsole)
  const screen = useConsoleV2Store((s) => s.screen)
  const setScreen = useConsoleV2Store((s) => s.setScreen)
  const hydrate = useConsoleV2Store((s) => s.hydrate)
  const editingUserId = useConsoleV2Store((s) => s.editingUserId)
  const editingRuleId = useConsoleV2Store((s) => s.editingRuleId)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const title =
    screen === 'user_edit'
      ? editingUserId
        ? 'Edit User'
        : 'Add User'
      : screen === 'rule_editor'
        ? editingRuleId
          ? 'Edit Rule'
          : 'New Rule'
        : screenTitle(screen)

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <img
              src={`${import.meta.env.BASE_URL}birlasoft-logo.png`}
              alt="Birlasoft"
              className="h-7 w-auto object-contain"
            />
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Submission Automation
          </p>
          <p className="text-sm font-semibold text-slate-900">Console v2</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3" aria-label="Console navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isNavActive(screen, item.id)
            return (
              <Button
                key={item.id}
                size="sm"
                variant={active ? 'primary' : 'secondary'}
                className="w-full justify-start"
                onPress={() => setScreen(item.id)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={14} className="shrink-0" aria-hidden />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Button size="sm" variant="secondary" className="w-full justify-start" onPress={() => leaveAdminConsole()}>
            <ArrowLeft size={14} />
            Back to app
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">Submission Automation</p>
            <p className="truncate text-xs text-slate-500">RBAC console prototype</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Search"
              onClick={() => undefined}
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Notifications"
              onClick={() => undefined}
            >
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e7f4f2] text-xs font-medium text-[#146970]">
                  SA
                </span>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-slate-800">{user?.name ?? 'Admin'}</p>
                <StatusChip tone="human" className="mt-0.5">
                  System Admin
                </StatusChip>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <WorkbenchPageHeader
              eyebrow="Console v2"
              title={title}
              meta={
                <StatusChip tone="info">
                  Wireframe prototype
                </StatusChip>
              }
            />
            {(screen === 'user_edit' || screen === 'rule_editor') && (
              <Typography.Paragraph size="sm" color="muted">
                Nested editor — changes stay in session storage only.
              </Typography.Paragraph>
            )}
            {renderScreen(screen)}
          </div>
        </main>
      </div>
    </div>
  )
}