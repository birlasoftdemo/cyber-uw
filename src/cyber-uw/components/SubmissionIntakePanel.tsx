import type { IntakeDocStatus } from '../data/caseNarrative'
import { narrativeForCase } from '../data/caseNarrative'
import type { CyberCase } from '../types'

function statusClass(status: IntakeDocStatus): string {
  switch (status) {
    case 'Extracted':
      return 'cuw-status cuw-status--ok'
    case 'Classified':
    case 'Received':
      return 'cuw-status cuw-status--info'
    case 'Review Required':
      return 'cuw-status cuw-status--warn'
    case 'Missing':
      return 'cuw-status cuw-status--bad'
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

/** Submission register for the five cyber documents, plus completeness and entity match. */
export function SubmissionIntakePanel({ c }: { c: CyberCase }) {
  const story = narrativeForCase(c)

  return (
    <section className="cuw-feedback" id="submission-intake" aria-label="Submission intake">
      <header className="cuw-feedback__head">
        <div>
          <p className="cuw-feedback__kicker">Submission intake</p>
          <h4>Documents received</h4>
        </div>
      </header>

      <dl className="cuw-intake-stats">
        <div>
          <dt>Submission completeness</dt>
          <dd>{story.completeness.pct}%</dd>
        </div>
        <div>
          <dt>Missing documents</dt>
          <dd>{story.completeness.missingCount}</dd>
        </div>
        <div>
          <dt>Broker follow-up</dt>
          <dd>{story.completeness.followUpCount}</dd>
        </div>
      </dl>

      <div className="cuw-table-scroll">
        <table className="cuw-data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {story.documents.map((doc) => (
              <tr key={doc.name}>
                <td>{doc.name}</td>
                <td>
                  <span className={statusClass(doc.status)}>{doc.status}</span>
                </td>
                <td>{doc.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div id="intake-follow-ups">
        <h5 className="cuw-feedback__sub">Questions requiring broker follow-up</h5>
        {story.followUps.length === 0 ? (
          <p className="cuw-feedback__note">No broker follow-up is open on this submission.</p>
        ) : (
          <ol className="cuw-feedback__list">
            {story.followUps.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        )}
      </div>

      <div>
        <h5 className="cuw-feedback__sub">Duplicate and entity match</h5>
        <ul className="cuw-match">
          <li>
            <span className="cuw-status cuw-status--ok">Insured matched</span>
            <span>{story.entityMatch.insuredMatched}</span>
          </li>
          <li>
            <span className="cuw-status cuw-status--ok">Duplicate check completed</span>
            <span>{story.entityMatch.duplicateCheck}</span>
          </li>
          <li>
            <span className="cuw-status cuw-status--ok">Broker identified</span>
            <span>{story.entityMatch.brokerIdentified}</span>
          </li>
        </ul>
      </div>
    </section>
  )
}
