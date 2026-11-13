import { Button, Modal, Typography, useOverlayState } from '@heroui/react'
import { Check, CircleHelp } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  hitlBundleForCase,
  storeDecisionFromHitl,
  type HitlDecisionLabel,
} from '../data/clientFeedbackDemo'
import type { CyberCase, CyberDecision } from '../types'
import { IntegrationStatusTable } from './IntegrationStatusTable'

const ACTIONS: HitlDecisionLabel[] = ['Approve', 'Refer', 'Decline']

interface Props {
  c: CyberCase
  onDecide: (decision: Exclude<CyberDecision, 'pending'>, rationale: string) => void
}

export function HitlDecisionPanel({ c, onDecide }: Props) {
  const bundle = useMemo(() => hitlBundleForCase(c), [c])
  const [selected, setSelected] = useState<HitlDecisionLabel | null>(null)
  const [rationale, setRationale] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const locked = c.decision !== 'pending'

  const isOverride = selected != null && selected !== bundle.aiLabel
  const isMaterialException =
    selected === 'Approve' &&
    c.gaps.some((g) => g.severity === 'critical' && g.disposition === 'open')
  const rationaleRequired = Boolean(selected && (isOverride || isMaterialException))
  const canSubmit =
    selected != null &&
    !locked &&
    (!rationaleRequired || rationale.trim().length >= 8)

  const confirmOverlay = useOverlayState({
    isOpen: confirmOpen,
    onOpenChange: (open) => {
      if (!open) setConfirmOpen(false)
    },
  })

  const openConfirm = () => {
    if (!selected || !canSubmit) return
    setConfirmOpen(true)
  }

  const confirmSubmit = () => {
    if (!selected || !canSubmit) return
    const mapped = storeDecisionFromHitl(selected)
    setConfirmOpen(false)
    onDecide(mapped, rationale.trim() || `UW decision: ${selected}`)
  }

  return (
    <section className="hitl-panel" aria-label="Decision">
      <header className="hitl-panel__head">
        <h3>Decision</h3>
      </header>

      <div className="hitl-ai">
        <div className="hitl-ai__title-row">
          <h4>AI Summary</h4>
          <strong className={`hitl-pill hitl-pill--${bundle.aiLabel.replace(/\s+/g, '-').toLowerCase()}`}>
            {bundle.aiLabel}
          </strong>
        </div>
        <div className="hitl-ai__card">
          <ol className="hitl-ai__points">
            {bundle.reasons.map((reason, index) => (
              <li key={reason.id} className="hitl-ai__point">
                <span className="hitl-ai__point-n" aria-hidden>
                  {index + 1}
                </span>
                <div className="hitl-ai__point-body">
                  <p>{reason.text}</p>
                  <a className="hitl-ai__point-link" href={`#${reason.evidenceAnchor}`}>
                    {reason.evidenceLabel}
                  </a>
                </div>
              </li>
            ))}
          </ol>
          <p className="hitl-ai__rule">
            Referral rule: <strong>{bundle.referralRule}</strong>
          </p>
        </div>
      </div>

      <div className="hitl-controls-panel" aria-label="Human decision controls">
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
          <button
            type="button"
            className={`hitl-submit__btn${locked ? ' hitl-submit__btn--saved' : ''}`}
            disabled={!canSubmit}
            onClick={openConfirm}
          >
            {locked ? (
              <>
                <Check size={16} strokeWidth={2.5} aria-hidden />
                Saved
              </>
            ) : (
              'Submit Decision'
            )}
          </button>
          {selected && rationaleRequired && !canSubmit ? (
            <span className="hitl-submit__hint">Mandatory rationale required before submit.</span>
          ) : null}
        </div>
      </div>

      {locked ? (
        <div className="hitl-integration">
          <IntegrationStatusTable c={c} />
        </div>
      ) : null}

      {confirmOpen && selected ? (
        <Modal state={confirmOverlay}>
          <Modal.Backdrop isDismissable>
            <Modal.Container size="md">
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Icon className="bg-slate-100 text-slate-800">
                    <CircleHelp size={18} />
                  </Modal.Icon>
                  <Modal.Heading>
                    {selected === 'Approve'
                      ? 'Record Underwriter Approval?'
                      : `Confirm ${selected.toLowerCase()}`}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <Typography.Paragraph size="sm" className="text-slate-700">
                    {selected === 'Approve' ? (
                      <>
                        You are about to record Underwriter Approval for submission #{c.id}{' '}
                        {c.insured} with policy centre and communication systems. Check
                        integration status in the integration table below after you confirm.
                      </>
                    ) : (
                      <>
                        You are about to record <strong>{selected}</strong> for {c.insured}. Check
                        integration status in the integration table below after you confirm.
                      </>
                    )}
                  </Typography.Paragraph>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onPress={() => setConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onPress={confirmSubmit}>
                    Confirm {selected.toLowerCase()}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      ) : null}
    </section>
  )
}
