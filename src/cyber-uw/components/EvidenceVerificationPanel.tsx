import type { VerificationResult } from '../data/caseNarrative'
import { narrativeForCase } from '../data/caseNarrative'
import type { CyberCase } from '../types'

function resultClass(result: VerificationResult): string {
  switch (result) {
    case 'Verified':
      return 'cuw-status cuw-status--ok'
    case 'Partially Verified':
      return 'cuw-status cuw-status--warn'
    case 'Contradicted':
      return 'cuw-status cuw-status--bad'
    case 'Missing Evidence':
      return 'cuw-status cuw-status--bad'
    case 'Not Applicable':
      return 'cuw-status cuw-status--info'
    default: {
      const neverResult: never = result
      return neverResult
    }
  }
}

export function EvidenceVerificationPanel({ c }: { c: CyberCase }) {
  const story = narrativeForCase(c)

  return (
    <section className="cuw-feedback" id="evidence-verification" aria-label="Evidence verification">
      <header className="cuw-feedback__head">
        <div>
          <p className="cuw-feedback__kicker">Evidence verification</p>
          <h4>Applicant declaration against documents and external observation</h4>
        </div>
      </header>
      <div className="cuw-table-scroll">
        <table className="cuw-data-table">
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
            {story.controls.map((row) => (
              <tr key={row.id} id={`evidence-control-${row.id}`}>
                <td>{row.control}</td>
                <td>{row.declaration}</td>
                <td>{row.documentEvidence}</td>
                <td>{row.externalObservation}</td>
                <td>
                  <span className={resultClass(row.result)}>{row.result}</span>
                </td>
                <td>{row.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
