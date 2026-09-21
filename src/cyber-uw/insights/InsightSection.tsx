interface Props {
  title: string
  children: React.ReactNode
}

export function InsightSection({ title, children }: Props) {
  return (
    <section className="mt-8">
      <h2 className="dashboard-section-title">{title}</h2>
      <div className="mt-4 grid gap-4 xl:grid-cols-12">{children}</div>
    </section>
  )
}

export function ChartCard({
  title,
  badge,
  className = '',
  children,
}: {
  title: string
  badge: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <article className={`dashboard-card flex min-h-[280px] flex-col overflow-hidden ${className}`}>
      <header className="dashboard-card-header flex items-center justify-between gap-2 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {badge}
        </span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col p-3">{children}</div>
    </article>
  )
}
