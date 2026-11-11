import { useMemo, useState } from 'react'
import {
  hitlBundleForCase,
  storeDecisionFromHitl,
  type HitlDecisionLabel,
} from '../data/clientFeedbackDemo'
import type { CyberCase, CyberDecision } from '../types'

const ACTIONS: HitlDecisionLabel[] = ['Approve', 'Refer', 'Request Information', 'Decline']

interface Props {
  c: CyberCase
  onDecide: (decision: Exclude<CyberDecision, 'pending'>, rationale: string) => void
  onRequestInfo: () => void
}

export function HitlDecisionPanel({ c, onDecide, onRequestInfo }: Props) {
  const bundle = useMemo(() => hitlBundleForCase(c), [c])
  const [selected, setSelected] = useState<HitlDecisionLabel | null>(null)
  const [rationale, setRationale] = useState('')
  const locked = c.decision !== 'pending'

  const isOverride =
    selected != null &&
    selected !== 'Request Information' &&
    selected !== bundle.aiLabel
  const isMaterialException =
    selected === 'Approve' &&
    c.gaps.some((g) => g.severity === 'critical' && g.disposition === 'open')
  const rationaleRequired = Boolean(selected && (isOverride || isMaterialException))
  const canSubmit =
    selected != null &&
    !locked &&
    (!rationaleRequired || rationale.trim().length >= 8)

  const submit = () => {
    if (!selected || !canSubmit) return
    const mapped = storeDecisionFromHitl(selected)
    if (mapped === 'request_info') {
      onRequestInfo()
      return
    }
    onDecide(mapped, rationale.trim() || `UW decision: ${selected}`)
  }

  return (
    <section className="hitl-panel" aria-label="Underwriter decision">
      <header className="hitl-panel__head">
        <h3>Underwriter decision / human in the loop</h3>
        <p>AI recommendation and human controls use Approve · Refer · Request Information · Decline.</p>
      </header>

      <div className="hitl-ai">
        <div className="hitl-ai__rec">
          <span>AI recommendation</span>
          <strong className={`hitl-pill hitl-pill--${bundle.aiLabel.replace(/\s+/g, '-').toLowerCase()}`}>
            {bundle.aiLabel}
          </strong>
        </div>
        <ol className="hitl-reasons" id="appetite-rule">
          {bundle.reasons.map((reason, index) => (
            <li key={reason.id}>
              <span className="hitl-reasons__n">{index + 1}</span>
              <div>
                <p>{reason.text}</p>
                <a className="hitl-reasons__link" href={`#${reason.evidenceAnchor}`}>
                  {reason.evidenceLabel}
                </a>
              </div>
            </li>
          ))}
        </ol>
        <p className="hitl-rule">
          Referral rule: <strong>{bundle.referralRule}</strong>
        </p>
      </div>

      {bundle.authority.exceeds ? (
        <div className="hitl-authority" role="status">
          <strong>Exceeds delegated authority</strong>
          <p>{bundle.authority.detail}</p>
          <dl>
            <div>
              <dt>Approval authority</dt>
              <dd>{bundle.authority.approvalAuthority}</dd>
            </div>
            <div>
              <dt>Referral owner</dt>
              <dd>{bundle.authority.referralOwner}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      <div className="hitl-controls" role="group" aria-label="Human decision">
        <p className="hitl-controls__label">Your decision</p>
        <div className="hitl-controls__btns">
          {ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              className={`hitl-action${selected === action ? ' is-on' : ''}${
                action === bundle.aiLabel ? ' is-ai' : ''
              }`}
              disabled={locked}
              aria-pressed={selected === action}
              onClick={() => setSelected(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {rationaleRequired ? (
        <label className="hitl-rationale">
          <span>
            Decision rationale <em>(required for overrides and material exceptions)</em>
          </span>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={3}
            placeholder="Explain why you are overriding the AI recommendation or accepting a material exception…"
            aria-required
          />
          {rationale.trim().length > 0 && rationale.trim().length < 8 ? (
            <small>Enter at least 8 characters.</small>
          ) : null}
        </label>
      ) : null}

      <div className="hitl-submit">
        <button type="button" className="hitl-submit__btn" disabled={!canSubmit} onClick={submit}>
          {locked ? `Decision locked · ${c.decision}` : 'Submit decision'}
        </button>
        {selected && rationaleRequired && !canSubmit ? (
          <span className="hitl-submit__hint">Mandatory rationale required before submit.</span>
        ) : null}
      </div>
    </section>
  )
}
