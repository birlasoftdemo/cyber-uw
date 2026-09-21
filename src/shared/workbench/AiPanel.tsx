import type { ReactNode } from 'react'
import { AiBadge } from './AiBadge'

interface Props {
  title: ReactNode
  hint?: string
  badgeLabel?: string
  showBadge?: boolean
  titleClassName?: string
  children: ReactNode
  className?: string
}

export function AiPanel({
  title,
  hint,
  badgeLabel,
  showBadge = true,
  titleClassName = '',
  children,
  className = '',
}: Props) {
  return (
    <div className={`ai-panel ${className}`.trim()}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`text-sm font-semibold text-slate-800 ${titleClassName}`.trim()}>{title}</span>
        {showBadge && <AiBadge label={badgeLabel} />}
      </div>
      {hint && <p className="ai-panel__hint">{hint}</p>}
      {children}
    </div>
  )
}
