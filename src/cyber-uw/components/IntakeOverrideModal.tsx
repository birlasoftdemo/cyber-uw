import { Button, Modal, Typography, useOverlayState } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import type { CyberCase } from '../types'

interface Props {
  caseItem: CyberCase | null
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function IntakeOverrideModal({ caseItem, open, onCancel, onConfirm }: Props) {
  const overlay = useOverlayState({
    isOpen: open && Boolean(caseItem),
    onOpenChange: (next) => {
      if (!next) onCancel()
    },
  })

  if (!caseItem || !open) return null

  const missing = caseItem.missingDocs?.length
    ? caseItem.missingDocs.join(', ')
    : 'Required package documents'

  return (
    <Modal state={overlay}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Icon className="bg-red-100 text-red-800">
                <AlertTriangle size={18} />
              </Modal.Icon>
              <Modal.Heading>Manual override required</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Typography.Paragraph size="sm" className="text-slate-700">
                {caseItem.insured} still has an incomplete package ({missing}). Leaving Intake needs
                an explicit override.
              </Typography.Paragraph>
              <Typography.Paragraph size="sm" className="mt-3 text-slate-700">
                Affirmative Risk Analysis scores stay withheld while documents are missing. Override
                only unlocks navigation so you can inspect the rest of the journey.
              </Typography.Paragraph>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                Stay on Intake
              </Button>
              <Button variant="primary" onPress={onConfirm}>
                Confirm Manual Override
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
