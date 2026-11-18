import { Modal, useOverlayState } from '@heroui/react'
import { useEffect, useState } from 'react'
import { GAP_REFER_ASSIGNEES } from '../constants/gapReferAssignees'
import {
  composeReferralNote,
  defaultReferralFormValues,
  ReferralFormSheet,
  type ReferralFormValues,
} from './ReferralFormSheet'

export interface InfoRequestDraft {
  caseId: string
  insured: string
  broker: string
}

interface Props {
  draft: InfoRequestDraft | null
  onCancel: () => void
  onConfirm: (note: string) => void
}

function brokerAssigneeId(broker: string): string {
  const lower = broker.toLowerCase()
  if (lower.includes('marsh')) return 'marsh-desk'
  if (lower.includes('aon')) return 'aon-desk'
  return GAP_REFER_ASSIGNEES.find((a) => a.target === 'broker')?.id ?? GAP_REFER_ASSIGNEES[0].id
}

export function InfoRequiredModal({ draft, onCancel, onConfirm }: Props) {
  const isOpen = Boolean(draft)
  const [values, setValues] = useState<ReferralFormValues>(() =>
    defaultReferralFormValues('info', 'marsh-desk'),
  )

  const overlay = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onCancel()
    },
  })

  useEffect(() => {
    if (!draft) return
    setValues(defaultReferralFormValues('info', brokerAssigneeId(draft.broker)))
  }, [draft])

  if (!draft) return null

  const assignees = GAP_REFER_ASSIGNEES.filter((a) => a.target === 'broker')
  const canSave = Boolean(values.comment.trim() && values.dueDate && values.assignTo)

  return (
    <Modal state={overlay}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="lg" scroll="inside" className="refer-sheet-modal">
          <Modal.Dialog aria-label="Broker Follow-up" className="refer-sheet-dialog">
            <ReferralFormSheet
              mode="info"
              values={values}
              assignees={assignees}
              onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
              onClose={onCancel}
              onSave={() => onConfirm(composeReferralNote(values))}
              saveDisabled={!canSave}
              saveLabel="Save"
            />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
