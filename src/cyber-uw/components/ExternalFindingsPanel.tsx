import { ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  externalFindingsForCase,
  type EnrichmentCategory,
} from '../data/clientFeedbackDemo'
import type { CyberCase, GapSeverity } from '../types'

const CATEGORIES: EnrichmentCategory[] = [
  'Vulnerabilities/CVEs',
  'Security Rating',
  'Third-party Dependencies',
]

function titleCaseSeverity(severity: GapSeverity): string {
  switch (severity) {
    case 'critical':
      return 'Critical'
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'info':
      return 'Info'
    default: {
      const neverSeverity: never = severity
      return neverSeverity
    }
  }
}

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
  const [whyId, setWhyId] = useState<string | null>(null)
  const visible =
    category === 'All' ? findings : findings.filter((row) => row.category === category)
  const conflicts = findings.filter((row) => row.conflictsWithDeclaration)

  return (
    <section className="spec-info-panel" aria-label="Enrichment" id="enrichment-rating">
      <header className="spec-info-panel__bar">
        <h3>Enrichment</h3>
        
      </header>

      {conflicts.length > 0 ? (
        <div className="xf-conflict-block" role="status">
          <header className="xf-conflict-block__bar">
            <h4>Conflicts</h4>
            
          </header>
          <div className="uw-risk-cards">
            {conflicts.map((row) => {
              const score = severityScore(row.severity)
              const open = whyId === row.id
              return (
                <article key={row.id} className="uw-risk-card uw-risk-card--le">
                  <button
                    type="button"
                    className="uw-risk-card__glyph"
                    aria-label={`About ${row.category} conflict`}
                    aria-expanded={open}
                    onClick={() => setWhyId((cur) => (cur === row.id ? null : row.id))}
                  >
                    <ShieldAlert size={15} strokeWidth={2.25} aria-hidden />
                  </button>
                  <div className="uw-risk-card__icon uw-risk-card__icon--badge" aria-hidden>
                    <span className="uw-brand-badge uw-brand-badge--le">LE</span>
                  </div>
                  <strong className="uw-risk-card__score">{score}</strong>
                  <p className="uw-risk-card__name">{row.category}</p>
                  <div className="uw-risk-card__foot">
                    <button
                      type="button"
                      className="uw-risk-card__why"
                      aria-expanded={open}
                      onClick={() => setWhyId((cur) => (cur === row.id ? null : row.id))}
                    >
                      Why this result?
                    </button>
                    <em>{score}%</em>
                  </div>
                  <i className="uw-risk-card__bar" aria-hidden>
                    <b style={{ width: `${score}%` }} />
                  </i>
                  {open && row.conflictsWithDeclaration ? (
                    <p className="uw-risk-card__note">{row.conflictsWithDeclaration}</p>
                  ) : null}
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
              <tr key={row.id}>
                <td>{row.source}</td>
                <td>{row.category}</td>
                <td>{row.finding}</td>
                <td className={`xf-sev xf-sev--${row.severity}`}>{titleCaseSeverity(row.severity)}</td>
                <td>{row.observedDate}</td>
                <td>{row.entityMatch}</td>
                <td>
                  <strong className="xf-impact">{row.underwritingImpact}</strong>
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
