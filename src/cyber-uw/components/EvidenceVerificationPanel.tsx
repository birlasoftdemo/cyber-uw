import {
  evidenceControlsForCase,
  type VerificationStatus,
} from '../data/clientFeedbackDemo'
import type { CyberCase } from '../types'

function resultClass(result: VerificationStatus) {
  switch (result) {
    case 'Verified':
      return 'ev-result ev-result--ok'
    case 'Partially Verified':
      return 'ev-result ev-result--mid'
    case 'Contradicted':
      return 'ev-result ev-result--bad'
    case 'Missing Evidence':
      return 'ev-result ev-result--miss'
    case 'Not Applicable':
      return 'ev-result ev-result--na'
    default: {
      const neverResult: never = result
      return neverResult
    }
  }
}

export function EvidenceVerificationPanel({ c }: { c: CyberCase }) {
  const rows = evidenceControlsForCase(c)

  return (
    <section className="ev-panel" aria-label="Evidence verification">
      <header className="ev-panel__head">
        <div>
          <h3>Evidence Verification</h3>
          <p>
            Key controls: MFA, EDR, backups, privileged access, patching, and incident response.
            Statuses: Verified · Partially Verified · Contradicted · Missing Evidence · Not Applicable.
          </p>
        </div>
      </header>

      <div className="ev-table-wrap">
        <table className="ev-table">
          <thead>
            <tr>
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
                className={row.contradiction ? 'ev-table__row--conflict' : undefined}
              >
                <td>
                  <strong>{row.control}</strong>
                  {row.contradiction ? <span className="ev-flag">Conflict</span> : null}
                </td>
                <td>{row.declaration}</td>
                <td>{row.documentEvidence}</td>
                <td>{row.externalObservation}</td>
                <td>
                  <span className={resultClass(row.result)}>{row.result}</span>
                </td>
                <td>{row.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
