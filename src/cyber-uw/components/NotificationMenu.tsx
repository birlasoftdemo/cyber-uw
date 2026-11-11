import { Bell } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase, ReferralTicket } from '../types'
import { submissionStatus, type SubmissionStatus } from '../utils/submissionStatus'

type StatusUpdate = {
  id: string
  caseId: string
  insured: string
  status: SubmissionStatus
  action: string
  at: string
}

function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function collectUpdates(cases: CyberCase[], referrals: ReferralTicket[]): StatusUpdate[] {
  const updates: StatusUpdate[] = []
  for (const c of cases) {
    const status = submissionStatus(c, referrals)
    const latest = [...c.audit].sort((a, b) => b.at.localeCompare(a.at))[0]
    if (!latest) continue
    updates.push({
      id: `${c.id}:${latest.at}`,
      caseId: c.id,
      insured: c.insured,
      status,
      action: latest.action,
      at: latest.at,
    })
  }
  return updates.sort((a, b) => b.at.localeCompare(a.at))
}

export function NotificationMenu({
  onSelect,
}: {
  onSelect: (id: string) => void
}) {
  const cases = useCyberUwStore((s) => s.cases)
  const referrals = useCyberUwStore((s) => s.referrals)
  const [open, setOpen] = useState(false)
  const [seenIds, setSeenIds] = useState<Record<string, boolean>>({})
  const rootRef = useRef<HTMLDivElement>(null)

  const updates = useMemo(() => collectUpdates(cases, referrals), [cases, referrals])
  const unread = updates.filter((item) => !seenIds[item.id]).length

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

  const markAllRead = () => {
    setSeenIds((current) => {
      const next = { ...current }
      for (const item of updates) next[item.id] = true
      return next
    })
  }

  return (
    <div className="spec-notify" ref={rootRef}>
      <button
        type="button"
        className="spec-home__tool"
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
        }
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={18} />
        {unread > 0 ? <span className="spec-home__badge">{unread}</span> : null}
      </button>
      {open ? (
        <div className="spec-notify__menu" role="menu" aria-label="Submission status updates">
          <div className="spec-notify__head">
            <strong>Status updates</strong>
            {unread > 0 ? (
              <button type="button" className="spec-notify__mark" onClick={markAllRead}>
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="spec-notify__list">
            {updates.length === 0 ? (
              <p className="spec-notify__empty">No status updates yet.</p>
            ) : (
              updates.map((item) => {
                const unreadItem = !seenIds[item.id]
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className={`spec-notify__item${unreadItem ? ' spec-notify__item--unread' : ''}`}
                    onClick={() => {
                      setSeenIds((current) => ({ ...current, [item.id]: true }))
                      setOpen(false)
                      onSelect(item.caseId)
                    }}
                  >
                    <span className="spec-notify__meta">
                      <span className="spec-notify__title">
                        {item.insured}
                        <em>{item.status}</em>
                      </span>
                      <span className="spec-notify__time">{formatWhen(item.at)}</span>
                    </span>
                    <span className="spec-notify__body">
                      {item.caseId} · {item.action}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
