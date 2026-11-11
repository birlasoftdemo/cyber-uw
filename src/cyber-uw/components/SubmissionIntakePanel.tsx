import {
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

function MetricIcon() {
  return (
    <span className="intake-metric__icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
        <rect x="5.5" y="3.5" width="9" height="12" rx="1.4" stroke="#fff" strokeWidth="1.4" />
        <rect x="3.5" y="5.5" width="9" height="12" rx="1.4" fill="#1b1564" stroke="#fff" strokeWidth="1.4" />
      </svg>
    </span>
  )
}

/** Cyber document checklist + completeness metrics for Submission intake. */
export function SubmissionIntakePanel({ c }: { c: CyberCase }) {
  const metrics = intakeMetricsForCase(c)

  return (
    <section className="spec-info-panel" aria-label="Submission intake">
      <header className="spec-info-panel__bar">
        <h3>Cyber documents received</h3>
        <p>Document package status</p>
      </header>

      <div className="intake-panel__metrics" aria-label="Intake metrics">
        <article className="intake-metric">
          <MetricIcon />
          <span className="intake-metric__label">Submission Completeness</span>
          <strong className="intake-metric__value">{metrics.completenessPct}%</strong>
        </article>
        <article className="intake-metric">
          <MetricIcon />
          <span className="intake-metric__label">Missing Documents</span>
          <strong className="intake-metric__value">{metrics.missingDocs}</strong>
        </article>
        <article className="intake-metric">
          <MetricIcon />
          <span className="intake-metric__label">Broker Follow-ups</span>
          <strong className="intake-metric__value">{metrics.brokerFollowUps}</strong>
        </article>
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
          </tbody>
        </table>
      </div>
    </section>
  )
}
