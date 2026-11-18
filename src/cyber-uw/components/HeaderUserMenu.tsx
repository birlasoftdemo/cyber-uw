import { LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/authStore'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function HeaderUserMenu({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null

  const roleLabel = user.role === 'ops' ? 'OPERATIONS' : 'UNDERWRITER'

  return (
    <div className={`spec-user${tone === 'dark' ? ' spec-user--dark' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="spec-user__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="spec-home__avatar">{initials(user.name)}</span>
        <span>
          {tone === 'dark' ? <strong>{roleLabel}</strong> : null}
          {user.name}
        </span>
      </button>
      {open ? (
        <div className="spec-user__menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logout()
            }}
          >
            <LogOut size={14} aria-hidden />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  )
}
