import { auditTrailForCase } from '../data/auditTrailDemo'
import type { CyberCase } from '../types'

export function AuditTrailPanel({ c }: { c: CyberCase }) {
  const rows = auditTrailForCase(c)

  return (
    <section className="spec-info-panel" aria-label="Audit trail">
      <header className="spec-info-panel__bar">
        <h3>Audit Trail</h3>
        <p>Timestamp · user/agent · action · evidence · rule/model · confidence · override</p>
      </header>

      <div className="spec-grid-wrap">
        <table className="spec-grid">
          <thead>
            <tr className="spec-grid__groups">
              <th colSpan={3}>Event</th>
              <th colSpan={4}>Provenance</th>
            </tr>
            <tr className="spec-grid__cols">
              <th>Timestamp</th>
              <th>User / Agent</th>
              <th>Action</th>
              <th>Evidence source</th>
              <th>Rule / model</th>
              <th>Confidence</th>
              <th>Human override</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.at}-${index}`}>
                <td className="spec-grid__num">{new Date(row.at).toLocaleString()}</td>
                <td>{row.actor}</td>
                <td>{row.action}</td>
                <td>{row.evidenceSource ?? '—'}</td>
                <td>{row.ruleModel ?? '—'}</td>
                <td className="spec-grid__num">
                  {row.confidence == null ? '—' : `${row.confidence}%`}
                </td>
                <td>
                  {row.humanOverride ? (
                    <span className="spec-grid-status spec-grid-status--watch">Yes</span>
                  ) : (
                    <span className="spec-grid-status spec-grid-status--ok">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
