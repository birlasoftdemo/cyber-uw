import { Modal, useOverlayState } from '@heroui/react'
import { useEffect, useState } from 'react'
import {
  GAP_REFER_ASSIGNEES,
  SUBMISSION_REFER_ASSIGNEES,
} from '../constants/gapReferAssignees'
import type { DiscussionReferralInput } from '../store/cyberUwStore'
import type { ReferralKind, ReferralTarget } from '../types'
import {
  composeReferralNote,
  defaultReferralFormValues,
  ReferralFormSheet,
  type ReferralFormValues,
} from './ReferralFormSheet'

export interface DiscussionReferDraft {
  caseId: string
  kind: ReferralKind
  sourceId: string
  sourceLabel: string
  insured?: string
  broker?: string
}

interface Props {
  draft: DiscussionReferDraft | null
  onCancel: () => void
  onConfirm: (input: DiscussionReferralInput) => void
}

export function DiscussionReferModal({ draft, onCancel, onConfirm }: Props) {
  const isOpen = Boolean(draft)
  const [values, setValues] = useState<ReferralFormValues>(() =>
    defaultReferralFormValues('referral', SUBMISSION_REFER_ASSIGNEES[0]?.id ?? GAP_REFER_ASSIGNEES[0].id),
  )

  const overlay = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onCancel()
    },
  })

  useEffect(() => {
    if (!draft) return
    let preferredId: string = GAP_REFER_ASSIGNEES[0].id
    if (draft.kind === 'submission') {
      preferredId = SUBMISSION_REFER_ASSIGNEES[0]?.id ?? GAP_REFER_ASSIGNEES[0].id
    } else if (draft.kind === 'ingest') {
      const broker = (draft.broker ?? '').toLowerCase()
      const match =
        GAP_REFER_ASSIGNEES.find((a) =>
          broker.includes('marsh')
            ? a.id === 'marsh-desk'
            : broker.includes('aon')
              ? a.id === 'aon-desk'
              : a.target === 'broker',
        ) ?? GAP_REFER_ASSIGNEES.find((a) => a.target === 'broker')
      preferredId = match?.id ?? GAP_REFER_ASSIGNEES[0].id
    } else if (draft.kind === 'gap') {
      preferredId =
        GAP_REFER_ASSIGNEES.find((a) => a.target === 'specialist')?.id ?? GAP_REFER_ASSIGNEES[0].id
    }
    setValues(defaultReferralFormValues('referral', preferredId))
  }, [draft])

  if (!draft) return null

  const assigneeOptions =
    draft.kind === 'submission' ? SUBMISSION_REFER_ASSIGNEES : GAP_REFER_ASSIGNEES
  const assignee =
    assigneeOptions.find((a) => a.id === values.assignTo) ?? assigneeOptions[0] ?? GAP_REFER_ASSIGNEES[0]

  const handleConfirm = () => {
    onConfirm({
      caseId: draft.caseId,
      kind: draft.kind,
      sourceId: draft.sourceId,
      sourceLabel: draft.sourceLabel,
      target: assignee.target as ReferralTarget,
      assigneeLabel: assignee.label,
      note: composeReferralNote(values),
    })
  }

  return (
    <Modal state={overlay}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="lg" scroll="inside" className="refer-sheet-modal">
          <Modal.Dialog aria-label="Referral Details" className="refer-sheet-dialog">
            <ReferralFormSheet
              mode="referral"
              values={values}
              assignees={assigneeOptions}
              onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
              onClose={onCancel}
              onSave={handleConfirm}
              saveLabel="Save"
              footerNote={draft.insured ? `${draft.insured} · ${draft.sourceLabel}` : draft.sourceLabel}
            />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
