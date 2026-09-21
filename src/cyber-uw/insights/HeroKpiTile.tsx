import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import type { KpiStatus } from './types'

interface Delta {
  pct: number
  label: string
}

interface Props {
  eyebrow?: string
  title: string
  value: string
  caption?: string
  status: KpiStatus
  spark: number[]
  delta: Delta
  invertDelta?: boolean
  toggle?: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }
  highlight?: boolean
  onClick?: () => void
}

const STATUS_LABEL: Record<KpiStatus, string> = {
  'on-track': 'On track',
  watch: 'Watch',
  action: 'Action needed',
}

const SPARK_STROKE: Record<KpiStatus, string> = {
  'on-track': '#059669',
  watch: '#2563eb',
  action: '#f87171',
}

export function HeroKpiTile({
  eyebrow,
  title,
  value,
  caption,
  status,
  spark,
  delta,
  invertDelta,
  toggle,
  highlight,
  onClick,
}: Props) {
  const points = spark.map((v, i) => ({ i, value: v }))
  const min = Math.min(...spark)
  const max = Math.max(...spark)
  const pad = Math.max(1, (max - min) * 0.15)
  const fillId = `spark-${eyebrow ?? title}`.replace(/\s/g, '-')
  const isUp = delta.pct > 0
  const isDown = delta.pct < 0
  const good = invertDelta ? isDown : isUp
  const bad = invertDelta ? isUp : isDown
  const trendClass =
    delta.pct === 0 ? 'trend-pill--flat' : good ? 'trend-pill--up' : bad ? 'trend-pill--down' : 'trend-pill--flat'
  const stroke = SPARK_STROKE[status]

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={`kpi-tile kpi-tile--${status} p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : ''
      } ${highlight ? 'ring-2 ring-blue-500/25' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {eyebrow ? <p className="kpi-tile__eyebrow">{eyebrow}</p> : null}
          <p className="kpi-tile__title">{title}</p>
        </div>
        <span className={`kpi-status kpi-status--${status}`}>
          <span className="kpi-status__dot" aria-hidden />
          {STATUS_LABEL[status]}
        </span>
      </div>
      <p className="kpi-tile__value mt-3">{value}</p>
      {caption ? <p className="kpi-tile__caption">{caption}</p> : null}
      <div className="kpi-tile__spark-band mt-3 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={status === 'action' ? 0.45 : 0.35} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[min - pad, max + pad]} hide />
            <Area type="monotone" dataKey="value" stroke={stroke} fill={`url(#${fillId})`} strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="kpi-tile__footer mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className={`trend-pill ${trendClass}`}>
          {delta.pct === 0 ? '—' : `${delta.pct > 0 ? '+' : ''}${delta.pct}%`} vs {delta.label}
        </span>
        {toggle ? (
          <button
            type="button"
            id={toggle.id}
            role="switch"
            aria-checked={toggle.checked}
            className={`metric-toggle ${toggle.checked ? 'metric-toggle--on' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              toggle.onChange(!toggle.checked)
            }}
          >
            <span className="metric-toggle__label">{toggle.label}</span>
            <span className="metric-toggle__track" aria-hidden>
              <span className="metric-toggle__thumb" />
            </span>
          </button>
        ) : null}
      </div>
    </article>
  )
}
