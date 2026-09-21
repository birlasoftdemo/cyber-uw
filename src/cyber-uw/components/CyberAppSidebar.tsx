import { Button } from '@heroui/react'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LayoutGrid,
  Package,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore, type AuthRole } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberShellView } from './CyberShellToolbar'
import { UserMenuDropdown } from './UserMenuDropdown'
import { BirlasoftLogo } from './BirlasoftLogo'

interface Props {
  shellView: CyberShellView
  onShellViewChange: (view: CyberShellView) => void
  focusMode?: boolean
}

function navForRole(role: AuthRole | undefined): {
  view: CyberShellView
  label: string
  icon: typeof Package
}[] {
  if (role === 'ops') {
    return [
      { view: 'workbench', label: 'Cases', icon: LayoutGrid },
      { view: 'insights', label: 'Insights', icon: BarChart3 },
      { view: 'shipping', label: 'Manage Submissions', icon: Package },
      { view: 'referrals', label: 'Escalation Inbox', icon: Inbox },
    ]
  }
  return [
    { view: 'workbench', label: 'Cases', icon: LayoutGrid },
    { view: 'insights', label: 'Insights', icon: BarChart3 },
    { view: 'referrals', label: 'Escalations', icon: Inbox },
  ]
}

function NavButton({
  expanded,
  active,
  label,
  icon: Icon,
  badge,
  onPress,
}: {
  expanded: boolean
  active?: boolean
  label: string
  icon: typeof Package
  badge?: number
  onPress: () => void
}) {
  return (
    <Button
      variant={active ? 'primary' : 'secondary'}
      size="sm"
      className={`relative ${expanded ? 'w-full justify-start' : 'w-9 justify-center px-0'}`}
      onPress={onPress}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={14} className="shrink-0" />
      {expanded ? <span className="truncate">{label}</span> : null}
      {badge && badge > 0 ? (
        <span
          className={`absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white ${
            expanded ? 'right-2' : 'right-0.5 top-0.5'
          }`}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Button>
  )
}

function SidebarNav({
  expanded,
  shellView,
  onShellViewChange,
}: {
  expanded: boolean
  shellView: CyberShellView
  onShellViewChange: (view: CyberShellView) => void
}) {
  const role = useAuthStore((s) => s.user?.role)
  const referrals = useCyberUwStore((s) => s.referrals)
  const clearCaseSelection = useCyberUwStore((s) => s.clearCaseSelection)
  const activeCount = referrals.filter((r) => r.status !== 'resolved').length
  const items = navForRole(role)

  return (
    <nav className={`flex flex-1 flex-col gap-1 ${expanded ? 'p-3' : 'p-1.5'}`} aria-label="Main">
      {items.map((item) => (
        <div key={item.view} className="relative">
          <NavButton
            expanded={expanded}
            active={shellView === item.view}
            label={item.label}
            icon={item.icon}
            badge={item.view === 'referrals' ? activeCount : undefined}
            onPress={() => {
              if (item.view === 'workbench') clearCaseSelection()
              onShellViewChange(item.view)
            }}
          />
        </div>
      ))}
    </nav>
  )
}

export function CyberAppSidebar({ shellView, onShellViewChange, focusMode }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (focusMode) return null

  return (
    <aside
      className={`cuw-sidebar group/sidebar relative flex shrink-0 flex-col transition-[width] duration-200 ${
        expanded ? 'w-56' : 'w-12'
      }`}
    >
      <div className={`border-b ${expanded ? 'px-3 py-3' : 'flex justify-center px-1.5 py-2'}`}>
        <BirlasoftLogo compact={!expanded} />
      </div>
      <div className={`border-b ${expanded ? 'px-3 py-3' : 'px-1.5 py-2'}`}>
        <div className={expanded ? 'w-full' : 'flex justify-center'}>
          <UserMenuDropdown compact={!expanded} />
        </div>
      </div>

      <SidebarNav
        expanded={expanded}
        shellView={shellView}
        onShellViewChange={onShellViewChange}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={expanded}
        className="cuw-sidebar__expand absolute right-0 top-1/2 z-20 flex h-12 w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-r border border-l-0 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {expanded ? (
          <ChevronLeft size={16} strokeWidth={2.5} aria-hidden />
        ) : (
          <ChevronRight size={16} strokeWidth={2.5} aria-hidden />
        )}
      </button>

      {!expanded ? (
        <div
          className="cuw-sidebar__flyout pointer-events-none absolute inset-y-0 left-0 z-30 flex w-56 -translate-x-2 flex-col border-r opacity-0 transition-all duration-200 group-hover/sidebar:pointer-events-auto group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100"
          aria-label="Sidebar navigation preview"
        >
          <div className="border-b px-3 py-3">
            <BirlasoftLogo />
          </div>
          <div className="border-b px-3 py-3">
            <UserMenuDropdown compact={false} />
          </div>
          <SidebarNav expanded shellView={shellView} onShellViewChange={onShellViewChange} />
        </div>
      ) : null}
    </aside>
  )
}
