import { Dropdown, Typography } from '@heroui/react'
import { buttonVariants } from '@heroui/styles'
import { LogOut } from 'lucide-react'
import type { AuthUser } from '../store/authStore'
import { useAuthStore } from '../store/authStore'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function UserAvatar({ user, size = 'sm' }: { user: AuthUser; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-9 w-9' : 'h-7 w-7'
  const textSize = size === 'md' ? 'text-sm' : 'text-xs'

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className={`${dim} shrink-0 rounded-full object-cover ring-2 ring-slate-200`}
      />
    )
  }

  return (
    <span
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full bg-blue-100 ${textSize} font-semibold text-blue-700 ring-2 ring-slate-200`}
    >
      {initials(user.name)}
    </span>
  )
}

export function UserMenuDropdown({ compact = false }: { compact?: boolean }) {
  const { user, logout } = useAuthStore()

  if (!user) return null

  return (
    <Dropdown>
      <Dropdown.Trigger
        className={buttonVariants({
          variant: 'secondary',
          size: 'sm',
          className: compact
            ? 'wb-sidebar-profile wb-sidebar-profile--compact inline-flex h-9 w-9 items-center justify-center p-0'
            : 'wb-sidebar-profile inline-flex w-full items-center gap-2.5 px-1 py-1',
        })}
        aria-label={user.name}
      >
        <UserAvatar user={user} />
        {!compact ? (
          <div className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold text-slate-900">{user.name}</span>
            <span className="mt-0.5 block truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {user.role}
            </span>
          </div>
        ) : null}
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-[220px]">
        <Dropdown.Menu
          onAction={(key) => {
            if (key === 'logout') logout()
          }}
        >
          <Dropdown.Item id="profile" textValue="Profile" isDisabled>
            <div className="flex items-center gap-2.5 py-1">
              <UserAvatar user={user} size="md" />
              <div className="min-w-0">
                <Typography.Paragraph size="sm" weight="medium">
                  {user.name}
                </Typography.Paragraph>
                <Typography.Paragraph color="muted" size="xs">
                  {user.email}
                </Typography.Paragraph>
              </div>
            </div>
          </Dropdown.Item>
          <Dropdown.Item id="logout" textValue="Logout">
            <div className="flex items-center gap-2 text-rose-600">
              <LogOut size={14} />
              Log out
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
