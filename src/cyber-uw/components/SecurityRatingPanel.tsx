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
import { Activity, Layers, ShieldCheck } from 'lucide-react'
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
    <div className="rounded-md border px-2.5 py-1.5" style={{ borderColor: 'var(--cuw-hairline)', background: '#fff' }}>
      <p className="cuw-type-title text-[0.8125rem]">{label}</p>
      <p className="cuw-type-caption">
        {insured?.value ?? '—'} · industry {industry?.value ?? '—'}
      </p>
    </div>
  )
}

const BAND_TONE: Record<string, string> = {
  Basic: 'wb-rating__band--basic',
  Intermediate: 'wb-rating__band--mid',
  Advanced: 'wb-rating__band--adv',
}

const GRADE_TONE: Record<string, string> = {
  A: 'wb-rating__grade--a',
  B: 'wb-rating__grade--b',
  C: 'wb-rating__grade--c',
  D: 'wb-rating__grade--d',
  E: 'wb-rating__grade--e',
  F: 'wb-rating__grade--f',
}

/** Map 250–900 rating onto 0–100% track position. */
function scalePct(rating: number): number {
  return Math.max(0, Math.min(100, ((rating - 250) / 650) * 100))
}

export function SecurityRatingPanel({
  c,
  onOpenCites,
}: {
  c: CyberCase
  onOpenCites?: () => void
}) {
  const snap = securityRatingForCase(c)
  const delta = snap.rating - snap.industryAvg
  const thresholds = SECURITY_RATING_BANDS.slice(1).map((b) => b.floor)
  const insuredPct = scalePct(snap.rating)
  const industryPct = scalePct(snap.industryAvg)

  return (
    <section className="wb-rating" aria-label="Security rating">
      <div className="cuw-panel__head mb-0">
        <span className="cuw-glyph" aria-hidden>
          <ShieldCheck size={16} strokeWidth={1.75} />
        </span>
        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <h4 className="cuw-type-title">Security rating</h4>
          {onOpenCites ? (
            <button type="button" className="wb-risk-cite-open" onClick={onOpenCites}>
              View sources
            </button>
          ) : null}
        </div>
      </div>

      <ul className="wb-rating__multipliers">
        {snap.multipliers.map((m) => (
          <li key={m.label}>
            <span className="tabular-nums">{m.factor.toFixed(1)}×</span>
            <span>{m.label}</span>
          </li>
        ))}
      </ul>

      <div className="wb-rating__hero">
        <div className="wb-rating__score-block">
          <p className="wb-rating__score-label">Overall</p>
          <p className="wb-rating__score">{snap.rating}</p>
          <span className={`wb-rating__band ${BAND_TONE[snap.band] ?? ''}`}>{snap.band}</span>
          <div className="wb-rating__scale" aria-hidden>
            <span
              className="wb-rating__scale-fill"
              style={{ width: `${((snap.rating - 250) / 650) * 100}%` }}
            />
          </div>
          <p className="wb-rating__scale-ends">
            <span>250</span>
            <span>900</span>
          </p>
        </div>

        {/* Comparative peer space — spatial figure, not four identical KPI tiles */}
        <div className="wb-rating__compare">
          <p className="wb-rating__slot-label wb-rating__slot-label--inline">Market placement</p>
          <div className="wb-rating__compare-track" aria-hidden>
            <span className="wb-rating__compare-mark wb-rating__compare-mark--industry" style={{ left: `${industryPct}%` }} />
            <span className="wb-rating__compare-mark wb-rating__compare-mark--insured" style={{ left: `${insuredPct}%` }} />
          </div>
          <div className="wb-rating__compare-ends">
            <span>250</span>
            <span>Industry {snap.industryAvg}</span>
            <span>900</span>
          </div>
          <dl className="wb-rating__compare-meta">
            <div>
              <dt>vs industry</dt>
              <dd className="tabular-nums">
                {delta >= 0 ? '+' : ''}
                {delta}
              </dd>
            </div>
            <div>
              <dt>Percentile</dt>
              <dd className="tabular-nums">{snap.peerPercentile}th</dd>
            </div>
            <div>
              <dt>Cohort</dt>
              <dd>{snap.peerCohortLabel}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="wb-rating__body">
        <div className="wb-rating__chart">
          <p className="wb-rating__slot-label">
            <Activity size={12} strokeWidth={2} className="mr-1 inline" aria-hidden />
            12 mo
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={snap.trend} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={0} />
              <YAxis domain={[250, 900]} tick={{ fontSize: 10 }} width={32} />
              {thresholds.map((y) => (
                <ReferenceLine key={y} y={y} stroke="#94a3b8" strokeDasharray="4 4" />
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
                name="Industry"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="wb-rating__vectors-wrap">
          <p className="cuw-type-caption mb-2">
            <Layers size={12} strokeWidth={2} className="mr-1 inline" aria-hidden />
            Detailed Ratings
          </p>
          <ul className="wb-rating__vectors">
            {snap.vectors.map((v) => (
              <li key={v.id}>
                <span className={`wb-rating__grade ${GRADE_TONE[v.grade] ?? ''}`}>{v.grade}</span>
                <span className="wb-rating__vector-meta">
                  <span className="wb-rating__vector-score tabular-nums">{v.score}</span>
                  <span className="wb-rating__vector-name">{v.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
