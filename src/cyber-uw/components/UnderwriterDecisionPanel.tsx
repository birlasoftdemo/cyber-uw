import { Button } from '@heroui/react'
import { narrativeForCase } from '../data/caseNarrative'
import { isFinancialSignOffComplete } from '../constants/cyberFlow'
import type { CyberCase, CyberDecision } from '../types'

type HumanDecision = Exclude<CyberDecision, 'pending'>

const ACTIONS: { action: HumanDecision; label: string; variant: 'primary' | 'secondary' | 'danger' }[] = [
  { action: 'quote', label: 'Approve', variant: 'primary' },
  { action: 'refer', label: 'Refer', variant: 'secondary' },
  { action: 'request_info', label: 'Request Information', variant: 'secondary' },
  { action: 'decline', label: 'Decline', variant: 'danger' },
]

export function UnderwriterDecisionPanel({
  c,
  onRequestDecision,
}: {
  c: CyberCase
  onRequestDecision: (decision: HumanDecision) => void
}) {
  const story = narrativeForCase(c)
  const pending = c.decision === 'pending'
  const finOk = isFinancialSignOffComplete(c.financialSignOff)

  return (
    <section className="cuw-feedback cuw-decision" id="uw-decision" aria-label="Underwriter decision">
      <header className="cuw-feedback__head">
        <div>
          <p className="cuw-feedback__kicker">Underwriter decision</p>
          <h4>Human in the loop</h4>
        </div>
        <p className="cuw-decision__ai">
          AI recommendation: <strong>{story.ai.label}</strong>
        </p>
      </header>

      <ol className="cuw-reasons">
        {story.ai.reasons.map((reason, index) => (
          <li key={reason.id}>
            <span>Reason {index + 1}</span>
            <p>{reason.text}</p>
            <a href={reason.href}>{reason.evidenceLabel}</a>
          </li>
        ))}
      </ol>

      <div className={`cuw-authority${story.authority.exceeds ? ' cuw-authority--over' : ''}`}>
        <p>{story.authority.exceeds ? 'Exceeds delegated authority' : 'Inside delegated authority'}</p>
        <p>{story.authority.summary}</p>
        <p>
          <strong>{story.authority.exceeds ? 'Referral owner' : 'Approval authority'}: </strong>
          {story.authority.owner}
        </p>
      </div>

      {pending ? (
        <>
          <div className="cuw-decision__actions" role="group" aria-label="Human decision">
            {ACTIONS.map((item) => {
              const approveBlocked = item.action === 'quote' && !finOk
              return (
                <Button
                  key={item.action}
                  variant={item.variant}
                  isDisabled={approveBlocked}
                  onPress={() => onRequestDecision(item.action)}
                  data-testid={`decision-${item.action}`}
                  aria-label={`${item.label} decision`}
                >
                  {item.label}
                </Button>
              )
            })}
          </div>
          {!finOk ? (
            <p className="cuw-feedback__note">
              Approve stays unavailable until financial sign off is recorded below. Refer, Request Information, and Decline are available now.
            </p>
          ) : null}
          <p className="cuw-feedback__note">
            Overrides and material exceptions need a written rationale in the confirm step before they can be submitted.
          </p>
        </>
      ) : (
        <p className="cuw-feedback__note">
          Decision recorded: {c.decisionReason || 'No rationale stored.'}
        </p>
      )}
    </section>
  )
}
