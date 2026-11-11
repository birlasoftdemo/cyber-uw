import { Button, Modal, Typography, useOverlayState } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AiBadge } from '../../shared/workbench/AiBadge'
import { narrativeForCase } from '../data/caseNarrative'
import type { CyberCase, CyberDecision } from '../types'
import { decisionTitle, TierBadge } from './CyberPrimitives'

export type PendingDecision = Exclude<CyberDecision, 'pending'>

interface Props {
  caseItem: CyberCase | null
  pending: PendingDecision | null
  onCancel: () => void
  onConfirm: (rationale: string) => void
}

/** Confirm step. Overrides and material exceptions cannot submit until a rationale is written. */
export function DecisionConfirmModal({ caseItem, pending, onCancel, onConfirm }: Props) {
  const isOpen = Boolean(caseItem && pending)
  const [rationale, setRationale] = useState('')
  const critical = caseItem?.gaps.filter((g) => g.severity === 'critical') ?? []
  const quotingWithCritical = pending === 'quote' && critical.length > 0
  const story = caseItem ? narrativeForCase(caseItem) : null
  const isOverride = Boolean(story && pending && pending !== story.ai.action)
  const materialException = Boolean(
    pending === 'quote' && story && (story.appetite.result !== 'Within Appetite' || critical.length > 0),
  )
  const rationaleRequired = isOverride || materialException
  const blocked = rationaleRequired && rationale.trim().length === 0

  useEffect(() => {
    setRationale('')
  }, [caseItem?.id, pending])

  const overlay = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onCancel()
    },
  })

  if (!caseItem || !pending || !story) return null

  const title =
    pending === 'quote'
      ? quotingWithCritical
        ? 'Approve despite critical gaps?'
        : 'Confirm Approve'
      : pending === 'refer'
        ? 'Confirm Refer'
        : pending === 'request_info'
          ? 'Confirm Request Information'
          : 'Confirm Decline'

  const body =
    pending === 'decline'
      ? 'Decline removes this risk from the chase. The rationale is stored on the case.'
      : pending === 'refer'
        ? 'Refer routes this file to the referral owner with the rationale you enter.'
        : pending === 'request_info'
          ? 'Request Information sends the open questions back to the broker and keeps the file off the quote path.'
          : quotingWithCritical
            ? 'Critical control gaps are still open. Approving now is a material exception and needs a rationale.'
            : 'Confirm the human decision. The AI recommendation is not a bind.'

  return (
    <Modal state={overlay}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Icon
                className={
                  pending === 'decline' || quotingWithCritical
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }
              >
                <AlertTriangle size={18} />
              </Modal.Icon>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Typography.Paragraph size="sm" className="font-semibold text-slate-900">
                  {caseItem.insured}
                </Typography.Paragraph>
                <span className="wb-ref-pill">{caseItem.id}</span>
                <TierBadge tier={caseItem.tier} />
                <AiBadge label={`AI ${story.ai.label}`} />
              </div>
              <Typography.Paragraph size="sm" className="text-slate-700">
                {body}
              </Typography.Paragraph>
              <ol className="cuw-reasons mt-3">
                {story.ai.reasons.map((reason) => (
                  <li key={reason.id}>
                    <p>{reason.text}</p>
                    <button
                      type="button"
                      className="cuw-why__btn"
                      onClick={() => {
                        const href = reason.href
                        onCancel()
                        window.setTimeout(() => {
                          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }, 60)
                      }}
                    >
                      {reason.evidenceLabel}
                    </button>
                  </li>
                ))}
              </ol>
              {quotingWithCritical ? (
                <ul className="mt-3 list-disc space-y-1 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
                  {critical.map((g) => (
                    <li key={g.id}>
                      <strong>{g.control}:</strong> {g.signal}
                    </li>
                  ))}
                </ul>
              ) : null}
              <label className="cuw-rationale" htmlFor="decision-rationale">
                <span>
                  Decision rationale
                  {rationaleRequired ? ' (required for this override or material exception)' : ' (optional when you accept the AI recommendation)'}
                </span>
                <textarea
                  id="decision-rationale"
                  value={rationale}
                  aria-required={rationaleRequired}
                  aria-invalid={blocked}
                  onChange={(event) => setRationale(event.target.value)}
                  placeholder={
                    rationaleRequired
                      ? 'Write why this decision differs from the AI recommendation or why the exception is acceptable.'
                      : 'Optional note for the file.'
                  }
                />
                {blocked ? (
                  <p id="decision-rationale-error" className="cuw-rationale__error" role="alert">
                    A decision rationale is required before this override or material exception can be submitted.
                  </p>
                ) : null}
              </label>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                Cancel
              </Button>
              <Button
                variant={pending === 'decline' || quotingWithCritical ? 'danger' : 'primary'}
                isDisabled={blocked}
                aria-label="Confirm decision"
                onPress={() => {
                  if (blocked) return
                  const text = rationale.trim()
                  onConfirm(text || `Accepted AI recommendation: ${story.ai.label}.`)
                }}
              >
                {`Confirm ${decisionTitle(pending)}`}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
