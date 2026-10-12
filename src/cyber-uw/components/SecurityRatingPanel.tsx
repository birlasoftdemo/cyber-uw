/** Outside-in security rating, drawn in the same card language as internal risk insights. */

import { securityRatingForCase, type SecurityRatingSnapshot } from '../data/securityRatingDemo'
import type { CyberCase } from '../types'

const VECTOR_COLORS = ['#312e81', '#0891b2', '#7c3aed', '#a78bfa'] as const

const MULTIPLIER_ROWS = [
  { chip: '#312e81', text: '#fff', dot: '#312e81', pale: '#e0e7ff' },
  { chip: '#0891b2', text: '#fff', dot: '#0891b2', pale: '#cffafe' },
  { chip: '#7c3aed', text: '#fff', dot: '#7c3aed', pale: '#ede9fe' },
] as const

function meterFill(score: number): number {
  return Math.round(Math.max(0, Math.min(1, (score - 250) / 650)) * 10)
}

function factorFill(factor: number): number {
  return Math.round(Math.max(0, Math.min(1, factor / 2)) * 10)
}

function ScoreCard({ snap }: { snap: SecurityRatingSnapshot }) {
  const yearAgo = snap.trend[0]?.rating ?? snap.rating
  const bars = [
    { label: '12 months ago', value: yearAgo, color: '#312e81' },
    { label: 'Today', value: snap.rating, color: '#0891b2' },
    { label: 'Industry', value: snap.industryAvg, color: '#818cf8' },
  ]
  const max = Math.max(...bars.map((bar) => bar.value), 251)
  return (
    <article className="wb-expo-card">
      <h3 className="wb-expo-card__title">Outside-in score</h3>
      <p className="wb-expo-pill-row">
        <span className="wb-expo-pill-row__label">Rating band</span>
        <span className="wb-expo-pill">{snap.band}</span>
      </p>
      <div
        className="wb-expo-bars"
        role="img"
        aria-label={bars.map((bar) => `${bar.label} ${bar.value}`).join(', ')}
      >
        {bars.map((bar) => (
          <div key={bar.label} className="wb-expo-bars__col">
            <span className="wb-expo-bars__value">{bar.value}</span>
            <div className="wb-expo-bars__track">
              <div
                className="wb-expo-bars__bar"
                style={{
                  height: `${Math.max(8, ((bar.value - 250) / (max - 250)) * 100)}%`,
                  background: bar.color,
                }}
              />
            </div>
            <span className="wb-expo-bars__name">{bar.label}</span>
          </div>
        ))}
      </div>
      <p className="wb-expo-note">{snap.peerPercentile}th percentile of the peer cohort.</p>
    </article>
  )
}

function MultiplierCard({ snap }: { snap: SecurityRatingSnapshot }) {
  return (
    <article className="wb-expo-card">
      <h3 className="wb-expo-card__title">Loss multipliers</h3>
      <div className="wb-expo-scale wb-expo-scale--wide" aria-hidden>
        <span className="wb-expo-scale__meter">
          <span>LOW</span>
          <span>MED</span>
          <span>HIGH</span>
        </span>
      </div>
      <ul className="wb-expo-rows wb-expo-rows--wide">
        {snap.multipliers.map((row, index) => {
          const tone = MULTIPLIER_ROWS[index % MULTIPLIER_ROWS.length]
          const filled = factorFill(row.factor)
          return (
            <li key={row.label} className="wb-expo-row">
              <span className="wb-expo-chip" style={{ background: tone.chip, color: tone.text }}>
                {row.label}
              </span>
              <span className="wb-expo-row__pct">{row.factor.toFixed(1)}×</span>
              <span className="wb-expo-meter" aria-hidden>
                {Array.from({ length: 10 }, (_, dot) => (
                  <span key={dot} style={{ background: dot < filled ? tone.dot : tone.pale }} />
                ))}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="wb-expo-note">Guidance versus the 750-plus cohort. Not a bind rule.</p>
    </article>
  )
}

function PeerCard({ snap }: { snap: SecurityRatingSnapshot }) {
  const delta = snap.rating - snap.industryAvg
  const rows = [
    { label: 'Insured', value: snap.rating, color: '#312e81' },
    { label: 'Industry', value: snap.industryAvg, color: '#0891b2' },
  ]
  return (
    <article className="wb-expo-card">
      <h3 className="wb-expo-card__title">Vs industry</h3>
      <div className="wb-expo-stacks">
        {rows.map((row) => (
          <div key={row.label} className="wb-expo-stack">
            <span className="wb-expo-stack__name">{row.label}</span>
            <div
              className="wb-expo-stack__track"
              role="img"
              aria-label={`${row.label} rating ${row.value} on a 250 to 900 scale`}
            >
              <div className="wb-expo-stack__bar" style={{ width: `${meterFill(row.value) * 10}%` }}>
                <span style={{ width: '100%', background: row.color }} />
              </div>
            </div>
            <span className="wb-expo-stack__total">{row.value}</span>
          </div>
        ))}
      </div>
      <ul className="wb-expo-legend">
        {rows.map((row) => (
          <li key={row.label}>
            <span style={{ background: row.color }} aria-hidden />
            {row.label}
          </li>
        ))}
      </ul>
      <p className="wb-expo-note">
        {delta >= 0 ? '+' : ''}
        {delta} vs industry · {snap.peerPercentile}th percentile · {snap.peerCohortLabel}
      </p>
    </article>
  )
}

function VectorCard({ snap }: { snap: SecurityRatingSnapshot }) {
  const total = snap.vectors.reduce((sum, vector) => sum + vector.score, 0)
  let cursor = 0
  const stops =
    total <= 0
      ? ['#e5e7eb 0% 100%']
      : snap.vectors.map((vector, index) => {
          const start = (cursor / total) * 100
          cursor += vector.score
          const end = (cursor / total) * 100
          return `${VECTOR_COLORS[index % VECTOR_COLORS.length]} ${start}% ${end}%`
        })
  return (
    <article className="wb-expo-card">
      <h3 className="wb-expo-card__title">Rating vectors</h3>
      <div className="wb-expo-donut-row">
        <div
          className="wb-expo-donut"
          style={{ background: `conic-gradient(${stops.join(', ')})` }}
          role="img"
          aria-label={snap.vectors
            .map((vector) => `${vector.label} grade ${vector.grade}, score ${vector.score}`)
            .join(', ')}
        >
          <div className="wb-expo-donut__hole">
            <span>Score</span>
            <strong>{snap.rating}</strong>
          </div>
        </div>
        <ul className="wb-expo-legend wb-expo-legend--donut">
          {snap.vectors.map((vector, index) => (
            <li key={vector.id}>
              <span style={{ background: VECTOR_COLORS[index % VECTOR_COLORS.length] }} aria-hidden />
              {vector.label}
              <em>
                {vector.grade} {total > 0 ? `${Math.round((vector.score / total) * 100)}%` : ''}
              </em>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function SecurityRatingPanel({
  c,
  onOpenCites,
}: {
  c: CyberCase
  onOpenCites?: () => void
}) {
  const snap = securityRatingForCase(c)

  return (
    <section className="wb-expo-board" aria-label="External risk outlook">
      <div className="wb-expo-head">
        <h3 className="cuw-type-title">External risk outlook</h3>
        {onOpenCites ? (
          <button type="button" className="wb-risk-cite-open" onClick={onOpenCites}>
            View sources
          </button>
        ) : null}
      </div>
      <div className="wb-expo">
        <ScoreCard snap={snap} />
        <MultiplierCard snap={snap} />
        <PeerCard snap={snap} />
        <VectorCard snap={snap} />
      </div>
    </section>
  )
}
