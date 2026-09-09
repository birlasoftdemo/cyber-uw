import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SECURITY_RATING_BANDS, securityRatingForCase } from '../data/securityRatingDemo'
import type { CyberCase } from '../types'

function RatingTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const insured = payload.find((p) => p.dataKey === 'rating')
  const industry = payload.find((p) => p.dataKey === 'industryAvg')
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="text-slate-600">
        Insured {insured?.value ?? '—'} · Industry {industry?.value ?? '—'}
      </p>
    </div>
  )
}

export function SecurityRatingPanel({ c }: { c: CyberCase }) {
  const snap = securityRatingForCase(c)
  const delta = snap.rating - snap.industryAvg
  const deltaLabel = `${delta >= 0 ? '+' : ''}${delta}`
  const thresholds = SECURITY_RATING_BANDS.slice(1).map((b) => b.floor)

  return (
    <section className="wb-qual-bucket">
      <div className="wb-qual-bucket__head">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900">Partner security rating</h4>
          <p className="text-[11px] font-medium text-slate-500">Partner feed · illustrative</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-2xl font-semibold tabular-nums text-slate-900">{snap.rating}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {snap.band}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-3">
        <div className="wb-q-grid">
          <div className="wb-q-cell">
            <p className="wb-q-cell__label">Industry average</p>
            <p className="wb-q-cell__value wb-q-cell__value--measured">{snap.industryAvg}</p>
          </div>
          <div className="wb-q-cell">
            <p className="wb-q-cell__label">vs industry average</p>
            <p className="wb-q-cell__value">{deltaLabel}</p>
          </div>
          <div className="wb-q-cell">
            <p className="wb-q-cell__label">Peer cohort</p>
            <p className="wb-q-cell__value">{snap.peerCohortLabel}</p>
          </div>
          <div className="wb-q-cell">
            <p className="wb-q-cell__label">Peer percentile</p>
            <p className="wb-q-cell__value wb-q-cell__value--measured">{snap.peerPercentile}th</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/90 bg-white p-3">
          <p className="mb-1 text-xs font-semibold text-slate-700">12-month rating trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={snap.trend}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={0} />
              <YAxis
                domain={[250, 900]}
                tick={{ fontSize: 11 }}
                width={36}
              />
              {thresholds.map((y) => (
                <ReferenceLine
                  key={y}
                  y={y}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                />
              ))}
              <Tooltip content={<RatingTooltip />} />
              <Line
                type="monotone"
                dataKey="rating"
                name="Insured"
                stroke="#0f172a"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="industryAvg"
                name="Industry avg"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="wb-q-grid">
          {snap.vectors.map((v) => (
            <div key={v.id} className="wb-q-cell">
              <p className="wb-q-cell__label">{v.label}</p>
              <p className="wb-q-cell__value">
                {v.grade} · {v.score}
              </p>
              <p className="wb-q-cell__note">{v.detail}</p>
            </div>
          ))}
        </div>

        <ul className="space-y-1.5 text-xs text-slate-600">
          {snap.multipliers.map((m) => (
            <li key={m.label}>
              <span className="font-semibold text-slate-800">
                {m.label} · {m.factor.toFixed(2)}×
              </span>
              {' — '}
              {m.note}
            </li>
          ))}
        </ul>

        {snap.citeBacks.length ? (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-700">Qualification cite-backs</p>
            <ul className="space-y-1 text-xs text-slate-600">
              {snap.citeBacks.map((row) => (
                <li key={row.id}>
                  <span className="font-medium text-slate-800">{row.bucketLabel}</span>
                  {' — '}
                  {row.finding}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
