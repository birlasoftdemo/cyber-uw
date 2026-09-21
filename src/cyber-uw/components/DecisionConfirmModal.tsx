import { Button, Modal, Typography, useOverlayState } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { AiBadge } from '../../shared/workbench/AiBadge'
import type { CyberCase, CyberDecision } from '../types'
import { decisionLabel, decisionTitle, TierBadge } from './CyberPrimitives'

export type PendingDecision = Exclude<CyberDecision, 'pending'>

interface Props {
  caseItem: CyberCase | null
  pending: PendingDecision | null
  onCancel: () => void
  onConfirm: () => void
}

/** Same confirm pattern as BindConfirmModal — intentional friction before capital-adjacent actions. */
export function DecisionConfirmModal({ caseItem, pending, onCancel, onConfirm }: Props) {
  const isOpen = Boolean(caseItem && pending)
  const critical = caseItem?.gaps.filter((g) => g.severity === 'critical') ?? []
  const quotingWithCritical = pending === 'quote' && critical.length > 0

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
        ? 'Quote despite critical gaps?'
        : 'Confirm quote'
      : pending === 'refer'
        ? 'Confirm escalation'
        : 'Confirm decline'

  const body =
    pending === 'decline'
      ? 'Decline removes this risk from the competitive soft market chase. You can undo before PAS sync if needed.'
      : pending === 'refer'
        ? 'Escalation routes this to specialist review with an auditable rationale.'
        : quotingWithCritical
          ? 'Signal shows critical control gaps. Quoting now must be intentional, with the same discipline as bind confirm in the submission workbench.'
          : 'Confirm human in the loop quote. Tier assist is not a binding premium.'

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
                <AiBadge label={`AI ${decisionLabel(caseItem.recommendation)}`} />
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
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                Cancel
              </Button>
              <Button
                variant={pending === 'decline' || quotingWithCritical ? 'danger' : 'primary'}
                onPress={onConfirm}
              >
                {pending === 'quote' && quotingWithCritical
                  ? 'Quote anyway'
                  : `Confirm ${decisionTitle(pending).toLowerCase()}`}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
