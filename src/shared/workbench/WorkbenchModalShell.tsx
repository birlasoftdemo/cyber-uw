import type { ReactNode } from 'react'

interface Props {
  eyebrow?: string
  title: string
  meta?: ReactNode
  children: ReactNode
  footer: ReactNode
  maxWidthClass?: string
}

export function WorkbenchModalShell({
  eyebrow,
  title,
  meta,
  children,
  footer,
  maxWidthClass = 'max-w-lg',
}: Props) {
  return (
    <div className="wb-modal-backdrop">
      <div className={`wb-modal ${maxWidthClass}`}>
        <header className="wb-modal-header">
          {eyebrow && <p className="wb-eyebrow">{eyebrow}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="wb-modal-header__title">{title}</h2>
            {meta}
          </div>
        </header>
        <div className="wb-modal-body">{children}</div>
        <footer className="wb-modal-footer">{footer}</footer>
      </div>
    </div>
  )
}
