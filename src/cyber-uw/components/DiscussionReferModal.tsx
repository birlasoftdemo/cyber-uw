import { Button, Modal, Typography, useOverlayState } from '@heroui/react'
import { MessageSquareWarning } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  GAP_REFER_ASSIGNEES,
  REFERRAL_TARGET_LABELS,
  SUBMISSION_REFER_ASSIGNEES,
} from '../constants/gapReferAssignees'
import type { DiscussionReferralInput } from '../store/cyberUwStore'
import type { ReferralKind, ReferralTarget } from '../types'

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
  const [assigneeId, setAssigneeId] = useState<string>(GAP_REFER_ASSIGNEES[0].id)
  const [note, setNote] = useState('')

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
    setAssigneeId(preferredId)
    setNote(
      draft.kind === 'ingest'
        ? `Please provide missing package items so we can re-ingest:\n${draft.sourceLabel}`
        : '',
    )
  }, [draft])

  if (!draft) return null

  const assigneeOptions =
    draft.kind === 'submission' ? SUBMISSION_REFER_ASSIGNEES : GAP_REFER_ASSIGNEES
  const assignee =
    assigneeOptions.find((a) => a.id === assigneeId) ?? assigneeOptions[0] ?? GAP_REFER_ASSIGNEES[0]
  const title =
    draft.kind === 'submission'
      ? 'Refer submission'
      : draft.kind === 'gap'
        ? 'Escalate gap for discussion'
        : draft.kind === 'risk'
          ? 'Escalate risk for discussion'
          : draft.kind === 'ingest'
            ? 'Escalate missing package to broker'
            : 'Escalate platform finding'

  const handleConfirm = () => {
    onConfirm({
      caseId: draft.caseId,
      kind: draft.kind,
      sourceId: draft.sourceId,
      sourceLabel: draft.sourceLabel,
      target: assignee.target as ReferralTarget,
      assigneeLabel: assignee.label,
      note: note.trim(),
    })
  }

  return (
    <Modal state={overlay}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Icon className="bg-amber-100 text-amber-700">
                <MessageSquareWarning size={18} />
              </Modal.Icon>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3 space-y-1">
                {draft.insured ? (
                  <Typography.Paragraph size="sm" className="font-semibold text-slate-900">
                    {draft.insured}
                  </Typography.Paragraph>
                ) : null}
                <p className="text-sm text-slate-700">{draft.sourceLabel}</p>
                <p className="text-xs text-slate-500">
                  {draft.kind === 'submission'
                    ? `Transfers the full submission · ${REFERRAL_TARGET_LABELS[assignee.target]}`
                    : `Creates an Escalation Inbox item · ${REFERRAL_TARGET_LABELS[assignee.target]}`}
                </p>
              </div>

              <label className="mb-3 flex flex-col gap-1 text-xs font-medium text-slate-600">
                {draft.kind === 'submission' ? 'Refer to' : 'Escalate to'}
                <select
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  {assigneeOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                {draft.kind === 'submission' ? 'Transfer note' : 'Discussion note'}
                <textarea
                  className="min-h-[88px] rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    draft.kind === 'ingest'
                      ? 'List missing docs, broker chase ask, or deadline for re-ingest…'
                      : draft.kind === 'submission'
                        ? 'Why transfer this submission? Context for the receiving underwriter…'
                        : 'What needs to be resolved? Evidence, chase ask, or specialist question…'
                  }
                />
              </label>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={onCancel}>
                Cancel
              </Button>
              <Button variant="primary" onPress={handleConfirm}>
                {draft.kind === 'ingest'
                  ? 'Escalate to Broker'
                  : draft.kind === 'submission'
                    ? 'Transfer submission'
                    : 'Send to Inbox'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
