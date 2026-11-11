import { Button, Modal, Typography, useOverlayState } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { AiBadge } from '../../shared/workbench/AiBadge'
import { hitlBundleForCase, hitlLabelFromDecision } from '../data/clientFeedbackDemo'
import type { CyberCase, CyberDecision } from '../types'
import { TierBadge } from './CyberPrimitives'

export type PendingDecision = Exclude<CyberDecision, 'pending'>

interface Props {
  caseItem: CyberCase | null
  pending: PendingDecision | null
  rationale: string
  onRationaleChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

/** Same confirm pattern as BindConfirmModal — intentional friction before capital-adjacent actions. */
export function DecisionConfirmModal({
  caseItem,
  pending,
  rationale,
  onRationaleChange,
  onCancel,
  onConfirm,
}: Props) {
  const isOpen = Boolean(caseItem && pending)
  const critical = caseItem?.gaps.filter((g) => g.severity === 'critical') ?? []
  const quotingWithCritical = pending === 'quote' && critical.length > 0
  const aiLabel = caseItem ? hitlBundleForCase(caseItem).aiLabel : 'Refer'
  const humanLabel = pending ? hitlLabelFromDecision(pending) : 'Approve'
  const isOverride = pending != null && humanLabel !== aiLabel
  const rationaleRequired = isOverride || quotingWithCritical
  const canConfirm = !rationaleRequired || rationale.trim().length >= 8

  const overlay = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onCancel()
    },
  })

  if (!caseItem || !pending) return null

  const title =
    pending === 'quote'
      ? quotingWithCritical
        ? 'Approve despite critical gaps?'
        : 'Confirm approve'
      : pending === 'refer'
        ? 'Confirm refer'
        : 'Confirm decline'

  const body =
    pending === 'decline'
      ? 'Decline removes this risk from the competitive soft market chase. You can undo before PAS sync if needed.'
      : pending === 'refer'
        ? 'Refer routes this to specialist review with an auditable rationale.'
        : quotingWithCritical
          ? 'Signal shows critical control gaps. Approving now is a material exception and requires rationale.'
          : 'Confirm human-in-the-loop approve. Tier assist is not a binding premium.'

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
                <AiBadge label={`AI ${aiLabel}`} />
              </div>
              <Typography.Paragraph size="sm" className="text-slate-700">
                {body}
              </Typography.Paragraph>
              {quotingWithCritical ? (
                <ul className="mt-3 list-disc space-y-1 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
                  {critical.map((g) => (
                    <li key={g.id}>
                      <strong>{g.control}:</strong> {g.signal}
                    </li>
                  ))}
                </ul>
              ) : null}
              {rationaleRequired ? (
                <label className="mt-4 block text-sm text-slate-700">
                  <span className="mb-1 block font-semibold">
                    Decision rationale <em className="font-normal text-slate-500">(required)</em>
                  </span>
                  <textarea
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                    value={rationale}
                    onChange={(e) => onRationaleChange(e.target.value)}
                    placeholder="Explain the override or material exception…"
                    aria-required
                  />
                  {rationale.trim().length > 0 && rationale.trim().length < 8 ? (
                    <span className="mt-1 block text-xs text-amber-700">Enter at least 8 characters.</span>
                  ) : null}
                </label>
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                Cancel
              </Button>
              <Button
                variant={pending === 'decline' || quotingWithCritical ? 'danger' : 'primary'}
                isDisabled={!canConfirm}
                onPress={() => {
                  if (!canConfirm) return
                  onConfirm()
                }}
              >
                {pending === 'quote' && quotingWithCritical
                  ? 'Approve anyway'
                  : `Confirm ${humanLabel.toLowerCase()}`}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
