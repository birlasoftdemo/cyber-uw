import {
  entityMatchForCase,
  intakeMetricsForCase,
  type IntakeDocStatus,
} from '../data/clientFeedbackDemo'
import type { CyberCase } from '../types'

function statusClass(status: IntakeDocStatus) {
  switch (status) {
    case 'Extracted':
      return 'intake-doc__status intake-doc__status--ok'
    case 'Classified':
    case 'Received':
      return 'intake-doc__status intake-doc__status--mid'
    case 'Review Required':
      return 'intake-doc__status intake-doc__status--watch'
    case 'Missing':
      return 'intake-doc__status intake-doc__status--miss'
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
    <section className="intake-panel" aria-label="Submission intake">
      <header className="intake-panel__head">
        <h3>Cyber documents received</h3>
        <p>Statuses: Received · Classified · Extracted · Missing · Review Required</p>
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

      <ul className="intake-doc-list">
        {metrics.docs.map((doc) => (
          <li key={doc.id}>
            <span className="intake-doc__name">{doc.name}</span>
            <span className={statusClass(doc.status)}>{doc.status}</span>
          </li>
        ))}
      </ul>

      <div className="intake-match" aria-label="Duplicate and entity match">
        <h4>Duplicate and entity match</h4>
        <ul>
          <li className={match.insuredMatched ? 'is-ok' : 'is-bad'}>
            Insured matched{match.insuredMatched ? ` · ${match.insured}` : ''}
          </li>
          <li className={match.duplicateCheckCompleted ? 'is-ok' : 'is-bad'}>
            Duplicate check completed
          </li>
          <li className={match.brokerIdentified ? 'is-ok' : 'is-bad'}>
            Broker identified{match.brokerIdentified ? ` · ${match.broker}` : ''}
          </li>
        </ul>
      </div>
    </section>
  )
}
