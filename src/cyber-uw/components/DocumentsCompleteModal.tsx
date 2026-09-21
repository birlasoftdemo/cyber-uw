import { Button, Modal, Typography, useOverlayState } from '@heroui/react'
import { FileCheck } from 'lucide-react'
import type { CyberCase } from '../types'

interface Props {
  caseItem: CyberCase | null
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DocumentsCompleteModal({ caseItem, open, onCancel, onConfirm }: Props) {
  const overlay = useOverlayState({
    isOpen: open && Boolean(caseItem),
    onOpenChange: (next) => {
      if (!next) onCancel()
    },
  })

  if (!caseItem || !open) return null

  return (
    <Modal state={overlay}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Icon className="bg-emerald-100 text-emerald-800">
                <FileCheck size={18} />
              </Modal.Icon>
              <Modal.Heading>Documents Complete?</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Typography.Paragraph size="sm" className="text-slate-700">
                Confirm the ingested package for {caseItem.insured} is ready. This unlocks Continue
                to Risk Information and Risk Analysis. Extracted answers can still be edited after.
              </Typography.Paragraph>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                Cancel
              </Button>
              <Button variant="primary" onPress={onConfirm}>
                Confirm Documents Complete
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
