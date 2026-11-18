import { CheckCircle2, AlertCircle } from 'lucide-react'
import { auditTrailForCase } from '../data/auditTrailDemo'
import type { CyberCase } from '../types'
import { SpecStatusPill } from './SpecStatusPill'

export function AuditTrailPanel({ c }: { c: CyberCase }) {
  const rows = auditTrailForCase(c)

  return (
    <section className="spec-info-panel" aria-label="Audit">
      <header className="spec-info-panel__bar">
        <h3>Audit</h3>
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
                    <SpecStatusPill tone="watch" icon={AlertCircle}>
                      Yes
                    </SpecStatusPill>
                  ) : (
                    <SpecStatusPill tone="ok" icon={CheckCircle2}>
                      No
                    </SpecStatusPill>
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
