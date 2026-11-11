import type { ExternalCategory, FindingSeverity } from '../data/caseNarrative'
import { narrativeForCase } from '../data/caseNarrative'
import type { CyberCase } from '../types'

const CATEGORIES: ExternalCategory[] = [
  'Attack Surface',
  'Vulnerabilities/CVEs',
  'Security Rating',
  'Exposed Services',
  'Third-party Dependencies',
]

function severityClass(severity: FindingSeverity): string {
  switch (severity) {
    case 'Critical':
    case 'High':
      return 'cuw-status cuw-status--bad'
    case 'Medium':
      return 'cuw-status cuw-status--warn'
    case 'Low':
    case 'Info':
      return 'cuw-status cuw-status--info'
    default: {
      const neverSeverity: never = severity
      return neverSeverity
    }
  }
}

function RatingTrend({ c }: { c: CyberCase }) {
  const story = narrativeForCase(c)
  const points = story.ratingTrend
  if (points.length === 0) return null
  const width = 560
  const height = 120
  const pad = 16
  const ratings = points.map((point) => point.rating)
  const min = Math.min(...ratings, ...points.map((point) => point.industryAvg)) - 20
  const max = Math.max(...ratings, ...points.map((point) => point.industryAvg)) + 20
  const span = Math.max(max - min, 1)
  const xFor = (index: number) => pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2)
  const yFor = (value: number) => pad + (1 - (value - min) / span) * (height - pad * 2)
  const line = (values: number[]) =>
    values
      .map((value, index) => `${index === 0 ? 'M' : 'L'}${xFor(index).toFixed(1)},${yFor(value).toFixed(1)}`)
      .join(' ')

  return (
    <figure className="cuw-trend" aria-label="Security rating trend">
      <figcaption>
        Security rating trend · latest {story.rating} · floor {story.ratingFloor} · 12 months, not a single score
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <path d={line(points.map((point) => point.industryAvg))} className="cuw-trend__peer" />
        <path d={line(ratings)} className="cuw-trend__rating" />
        {points.map((point, index) => (
          <g key={`${point.month}-${index}`}>
            <circle cx={xFor(index)} cy={yFor(point.rating)} r="2.5" className="cuw-trend__dot" />
            <text x={xFor(index)} y={height - 2} textAnchor="middle" className="cuw-trend__label">
              {point.month}
            </text>
          </g>
        ))}
      </svg>
      <p className="cuw-feedback__note">Solid line is the insured. Dashed line is the industry average. Provider: BitSight (Simulated).</p>
    </figure>
  )
}

export function ExternalFindingsPanel({ c }: { c: CyberCase }) {
  const story = narrativeForCase(c)

  return (
    <section className="cuw-feedback" id="external-enrichment" aria-label="External cyber-risk enrichment">
      <header className="cuw-feedback__head">
        <div>
          <p className="cuw-feedback__kicker">External cyber-risk enrichment</p>
          <h4>Outside-in findings</h4>
          <p className="cuw-feedback__note">
            No live provider API is connected. BitSight, Cyence, Cytora, and the exposure scan are marked Simulated.
          </p>
        </div>
      </header>

      <div className="cuw-conflict" id="external-declaration-conflict">
        <h5>Conflicts with applicant declarations</h5>
        {story.conflicts.length === 0 ? (
          <p>No material conflict between external signals and applicant declarations.</p>
        ) : (
          <ul>
            {story.conflicts.map((conflict) => (
              <li key={conflict.id}>
                <strong>{conflict.title}</strong>
                <span>Declaration: {conflict.declaration}</span>
                <span>External: {conflict.external}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {CATEGORIES.map((category) => {
        const rows = story.externalFindings.filter((row) => row.category === category)
        return (
          <section key={category} aria-label={category}>
            <h5 className="cuw-feedback__sub">{category}</h5>
            {category === 'Security Rating' ? <RatingTrend c={c} /> : null}
            <div className="cuw-table-scroll">
              <table className="cuw-data-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Finding</th>
                    <th>Severity</th>
                    <th>Observed Date</th>
                    <th>Freshness</th>
                    <th>Entity Match</th>
                    <th>Underwriting Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} id={`external-finding-${row.id}`}>
                      <td>{row.source}</td>
                      <td>{row.finding}</td>
                      <td>
                        <span className={severityClass(row.severity)}>{row.severity}</span>
                      </td>
                      <td>{row.observedDate}</td>
                      <td>{row.freshness}</td>
                      <td>{row.entityMatch}</td>
                      <td>{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </section>
  )
}
