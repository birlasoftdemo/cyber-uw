import type { ReactNode } from 'react'

/** Accessible solid status tones — see `--wb-status-*` in index.css */
export type StatusTone =
  | 'neutral'
  | 'human'
  | 'info'
  | 'pending'
  | 'warning'
  | 'danger'
  | 'current'
  | 'complete'

interface Props {
  tone?: StatusTone
  children: ReactNode
  className?: string
  title?: string
}

export function StatusChip({
  tone = 'neutral',
  children,
  className = '',
  title,
}: Props) {
  return (
    <span
      className={`wb-status wb-status--${tone}${className ? ` ${className}` : ''}`}
      title={title}
    >
      {children}
    </span>
  )
}
