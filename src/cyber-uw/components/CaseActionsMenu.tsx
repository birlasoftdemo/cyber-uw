import { Bookmark, ChevronDown, Copy, Download, MessageSquarePlus, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Props {
  fromTasks: boolean
  referredBy: string | null
  bookmarked: boolean
  onRefer: () => void
  onInfo: () => void
  onCopy: () => void
  onDownload: () => void
  onBookmark: () => void
}

export function CaseActionsMenu({
  fromTasks,
  referredBy,
  bookmarked,
  onRefer,
  onInfo,
  onCopy,
  onDownload,
  onBookmark,
}: Props) {
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

  const run = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <div className="spec-actions" ref={rootRef}>
      <button
        type="button"
        className="spec-actions__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Actions
        <ChevronDown size={14} aria-hidden />
      </button>
      {open ? (
        <div className="spec-actions__menu" role="menu">
          {fromTasks ? (
            <p className="spec-actions__note">Referred by {referredBy}</p>
          ) : (
            <button type="button" role="menuitem" onClick={() => run(onRefer)}>
              <UserRound size={15} aria-hidden />
              Referral
            </button>
          )}
          <button type="button" role="menuitem" onClick={() => run(onInfo)}>
            <MessageSquarePlus size={15} aria-hidden />
            Broker Follow-up
          </button>
          <button type="button" role="menuitem" onClick={() => run(onCopy)}>
            <Copy size={15} aria-hidden />
            Copy
          </button>
          <button type="button" role="menuitem" onClick={() => run(onDownload)}>
            <Download size={15} aria-hidden />
            Download
          </button>
          <button type="button" role="menuitem" aria-pressed={bookmarked} onClick={() => run(onBookmark)}>
            <Bookmark size={15} aria-hidden fill={bookmarked ? 'currentColor' : 'none'} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
