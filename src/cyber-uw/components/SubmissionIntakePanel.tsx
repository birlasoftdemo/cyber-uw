import {
  entityMatchForCase,
  intakeMetricsForCase,
  type IntakeDocStatus,
} from '../data/clientFeedbackDemo'
import type { CyberCase } from '../types'

function statusClass(status: IntakeDocStatus) {
  switch (status) {
    case 'Extracted':
      return 'spec-grid-status spec-grid-status--ok'
    case 'Classified':
    case 'Received':
      return 'spec-grid-status spec-grid-status--mid'
    case 'Review Required':
      return 'spec-grid-status spec-grid-status--watch'
    case 'Missing':
      return 'spec-grid-status spec-grid-status--miss'
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

/** Cyber document checklist + completeness / match metrics for Submission intake. */
export function SubmissionIntakePanel({ c }: { c: CyberCase }) {
  const metrics = intakeMetricsForCase(c)
  const match = entityMatchForCase(c)

  return (
    <section className="spec-info-panel" aria-label="Submission intake">
      <header className="spec-info-panel__bar">
        <h3>Cyber documents received</h3>
        <p>Document package status · duplicate and entity match</p>
      </header>

      <div className="intake-panel__metrics">
        <div>
          <span>Submission completeness</span>
          <strong>{metrics.completenessPct}%</strong>
        </div>
        <div>
          <span>Missing documents</span>
          <strong>{metrics.missingDocs}</strong>
        </div>
        <div>
          <span>Broker follow-up questions</span>
          <strong>{metrics.brokerFollowUps}</strong>
        </div>
      </div>

      <div className="spec-grid-wrap">
        <table className="spec-grid">
          <thead>
            <tr className="spec-grid__groups">
              <th colSpan={2}>Document details</th>
              <th colSpan={2}>General details</th>
            </tr>
            <tr className="spec-grid__cols">
              <th>Document</th>
              <th>Status</th>
              <th>Insured</th>
              <th>Broker</th>
            </tr>
          </thead>
          <tbody>
            {metrics.docs.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <strong>{doc.name}</strong>
                </td>
                <td>
                  <span className={statusClass(doc.status)}>{doc.status}</span>
                </td>
                <td>{c.insured}</td>
                <td>{c.broker}</td>
              </tr>
            ))}
            <tr className="spec-grid__total">
              <td colSpan={2}>
                <strong>Package</strong>
              </td>
              <td colSpan={2}>
                {match.insuredMatched ? 'Insured matched' : 'Insured unmatched'} ·{' '}
                {match.duplicateCheckCompleted ? 'Duplicate check completed' : 'Duplicate check pending'} ·{' '}
                {match.brokerIdentified ? `Broker identified (${match.broker})` : 'Broker not identified'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
