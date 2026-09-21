import type { ReactNode } from 'react'

interface Props {
  eyebrow?: string
  title: string
  count?: number
  countLabel?: string
  meta?: ReactNode
  leading?: ReactNode
  /** Compact controls clustered with the title (search, filters, upload). */
  actions?: ReactNode
  subtitle?: ReactNode
}

export function WorkbenchPageHeader({
  eyebrow,
  title,
  count,
  countLabel = 'submission',
  meta,
  leading,
  actions,
  subtitle,
}: Props) {
  return (
    <header className="wb-page-header wb-toolbar-chrome">
      {leading ? <div className="shrink-0 self-center">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="wb-eyebrow">{eyebrow}</p> : null}
        <div className={`${eyebrow ? 'mt-1 ' : ''}flex flex-wrap items-center gap-x-2 gap-y-1.5`}>
          <h1 className="wb-page-header__title">{title}</h1>
          {count != null && (
            <span className="wb-page-header__count">
              {count} {countLabel}
              {count === 1 ? '' : 's'}
            </span>
          )}
          {meta}
          {actions ? (
            <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1.5">
              {actions}
            </div>
          ) : null}
        </div>
        {subtitle ? <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{subtitle}</div> : null}
      </div>
    </header>
  )
}
