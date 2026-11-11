import { useMemo, useState } from 'react'
import {
  externalFindingsForCase,
  type EnrichmentCategory,
} from '../data/clientFeedbackDemo'
import type { CyberCase, GapSeverity } from '../types'

const CATEGORIES: EnrichmentCategory[] = [
  'Attack Surface',
  'Vulnerabilities/CVEs',
  'Security Rating',
  'Exposed Services',
  'Third-party Dependencies',
]

function severityScore(severity: GapSeverity) {
  switch (severity) {
    case 'critical':
      return 92
    case 'high':
      return 78
    case 'medium':
      return 58
    case 'info':
      return 42
    default: {
      const neverSeverity: never = severity
      return neverSeverity
    }
  }
}

export function ExternalFindingsPanel({ c }: { c: CyberCase }) {
  const findings = useMemo(() => externalFindingsForCase(c), [c])
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

      {conflicts.length > 0 ? (
        <div className="xf-conflict-block" role="status">
          <header className="xf-conflict-block__bar">
            <h4>Conflicts</h4>
            <span>{conflicts.length} with applicant declarations</span>
          </header>
          <div className="uw-risk-cards">
            {conflicts.map((row) => {
              const score = severityScore(row.severity)
              return (
                <article key={row.id} className="uw-risk-card">
                  <button type="button" className="uw-risk-card__menu" aria-label="Conflict actions">
                    ···
                  </button>
                  <div className="uw-risk-card__icon" aria-hidden>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1b1564" strokeWidth="1.6">
                      <path d="M12 3 3 19h18L12 3Z" />
                      <path d="M12 10v4" />
                      <circle cx="12" cy="16.5" r="0.8" fill="#1b1564" stroke="none" />
                    </svg>
                  </div>
                  <p className="uw-risk-card__label">Declaration conflict</p>
                  <strong className="uw-risk-card__score">{score}</strong>
                  <p className="uw-risk-card__name">{row.source}</p>
                  <div className="uw-risk-card__foot">
                    <span>{row.category}</span>
                    <em>{score}%</em>
                  </div>
                  <i className="uw-risk-card__bar" aria-hidden>
                    <b style={{ width: `${score}%` }} />
                  </i>
                  <p className="uw-risk-card__note">{row.conflictsWithDeclaration}</p>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}

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
