import {
  evidenceControlsForCase,
  type VerificationStatus,
} from '../data/clientFeedbackDemo'
import type { CyberCase } from '../types'

function resultClass(result: VerificationStatus) {
  switch (result) {
    case 'Verified':
      return 'spec-grid-status spec-grid-status--ok'
    case 'Partially Verified':
      return 'spec-grid-status spec-grid-status--mid'
    case 'Contradicted':
      return 'spec-grid-status spec-grid-status--bad'
    case 'Missing Evidence':
      return 'spec-grid-status spec-grid-status--miss'
    case 'Not Applicable':
      return 'spec-grid-status spec-grid-status--na'
    default: {
      const neverResult: never = result
      return neverResult
    }
  }
}

export function EvidenceVerificationPanel({ c }: { c: CyberCase }) {
  const rows = evidenceControlsForCase(c)

  return (
    <section className="spec-info-panel" aria-label="Evidence verification">
      <header className="spec-info-panel__bar">
        <h3>Evidence Verification</h3>
        <p>Applicant declaration vs document evidence vs external observation</p>
      </header>

      <div className="spec-grid-wrap">
        <table className="spec-grid">
          <thead>
            <tr className="spec-grid__groups">
              <th colSpan={1}>Control</th>
              <th colSpan={3}>Evidence</th>
              <th colSpan={2}>Assessment</th>
            </tr>
            <tr className="spec-grid__cols">
              <th>Control</th>
              <th>Applicant Declaration</th>
              <th>Document Evidence</th>
              <th>External Observation</th>
              <th>Verification Result</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                id={row.control === 'MFA' ? 'evidence-mfa' : undefined}
                className={row.contradiction ? 'spec-grid__row--conflict' : undefined}
              >
                <td>
                  <strong>{row.control}</strong>
                  {row.contradiction ? <span className="spec-grid-flag">Conflict</span> : null}
                </td>
                <td>{row.declaration}</td>
                <td>{row.documentEvidence}</td>
                <td>{row.externalObservation}</td>
                <td>
                  <span className={resultClass(row.result)}>{row.result}</span>
                </td>
                <td className="spec-grid__num">{row.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
