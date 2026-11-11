import { useMemo, useState } from 'react'
import {
  externalFindingsForCase,
  type EnrichmentCategory,
} from '../data/clientFeedbackDemo'
import { securityRatingForCase } from '../data/securityRatingDemo'
import type { CyberCase } from '../types'

const CATEGORIES: EnrichmentCategory[] = [
  'Attack Surface',
  'Vulnerabilities/CVEs',
  'Security Rating',
  'Exposed Services',
  'Third-party Dependencies',
]

export function ExternalFindingsPanel({ c }: { c: CyberCase }) {
  const findings = useMemo(() => externalFindingsForCase(c), [c])
  const rating = securityRatingForCase(c)
  const [category, setCategory] = useState<EnrichmentCategory | 'All'>('All')
  const visible =
    category === 'All' ? findings : findings.filter((row) => row.category === category)
  const conflicts = findings.filter((row) => row.conflictsWithDeclaration)

  return (
    <section className="spec-info-panel" aria-label="External cyber-risk enrichment findings" id="enrichment-rating">
      <header className="spec-info-panel__bar">
        <h3>External findings</h3>
        <p>Simulated providers · conflicts with applicant declarations highlighted</p>
      </header>

      <div className="spec-info-panel__summary">
        <div className="xf-trend" aria-label="Security rating trend">
          <div className="xf-trend__meta">
            <span>Security rating trend (BitSight · Simulated)</span>
            <strong>
              {rating.rating} · industry {rating.industryAvg}
            </strong>
          </div>
          <svg className="xf-trend__chart" viewBox="0 0 320 72" role="img" aria-label="Rating trend">
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              points={rating.trend
                .map((point, i) => {
                  const x = (i / Math.max(1, rating.trend.length - 1)) * 300 + 10
                  const y = 62 - ((point.industryAvg - 250) / 650) * 52
                  return `${x},${y}`
                })
                .join(' ')}
            />
            <polyline
              fill="none"
              stroke="#1b1564"
              strokeWidth="2"
              points={rating.trend
                .map((point, i) => {
                  const x = (i / Math.max(1, rating.trend.length - 1)) * 300 + 10
                  const y = 62 - ((point.rating - 250) / 650) * 52
                  return `${x},${y}`
                })
                .join(' ')}
            />
          </svg>
          <p className="xf-trend__legend">
            <i className="xf-trend__swatch xf-trend__swatch--co" /> Company
            <i className="xf-trend__swatch xf-trend__swatch--ind" /> Industry avg
          </p>
        </div>

        {conflicts.length > 0 ? (
          <div className="xf-conflicts" role="status">
            <strong>{conflicts.length} conflict(s) with applicant declarations</strong>
            <ul>
              {conflicts.map((row) => (
                <li key={row.id}>
                  {row.source} (Simulated): {row.conflictsWithDeclaration}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="xf-cats" role="tablist" aria-label="Finding categories">
        <button
          type="button"
          role="tab"
          aria-selected={category === 'All'}
          className={category === 'All' ? 'is-on' : undefined}
          onClick={() => setCategory('All')}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            className={category === cat ? 'is-on' : undefined}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="spec-grid-wrap">
        <table className="spec-grid">
          <thead>
            <tr className="spec-grid__groups">
              <th colSpan={2}>Source details</th>
              <th colSpan={3}>Finding details</th>
              <th colSpan={2}>Underwriting</th>
            </tr>
            <tr className="spec-grid__cols">
              <th>Source</th>
              <th>Category</th>
              <th>Finding</th>
              <th>Severity</th>
              <th>Observed / Freshness</th>
              <th>Entity Match</th>
              <th>Underwriting Impact</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                className={row.conflictsWithDeclaration ? 'spec-grid__row--conflict' : undefined}
              >
                <td>
                  {row.source}
                  {row.simulated ? <span className="spec-grid-flag spec-grid-flag--sim">Simulated</span> : null}
                </td>
                <td>{row.category}</td>
                <td>{row.finding}</td>
                <td className={`xf-sev xf-sev--${row.severity}`}>{row.severity}</td>
                <td>
                  {row.observedDate}
                  <div className="spec-grid__sub">{row.freshness}</div>
                </td>
                <td>{row.entityMatch}</td>
                <td>
                  {row.underwritingImpact}
                  {row.conflictsWithDeclaration ? (
                    <div className="xf-conflict-note">{row.conflictsWithDeclaration}</div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
