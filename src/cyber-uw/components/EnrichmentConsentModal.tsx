import { Button, Checkbox, Description, Modal, Typography, useOverlayState } from '@heroui/react'
import { ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DESK_ENRICHMENT_MODELS } from '../data/enrichmentDemo'
import type { CyberCase, EnrichmentModelId } from '../types'

interface Props {
  caseItem: CyberCase | null
  open: boolean
  onCancel: () => void
  onConfirm: (models: EnrichmentModelId[]) => void
}

export function EnrichmentConsentModal({ caseItem, open, onCancel, onConfirm }: Props) {
  const [selected, setSelected] = useState<EnrichmentModelId[]>(
    DESK_ENRICHMENT_MODELS.map((model) => model.id),
  )
  const overlay = useOverlayState({
    isOpen: open && Boolean(caseItem),
    onOpenChange: (next) => {
      if (!next) onCancel()
    },
  })

  useEffect(() => {
    if (open) setSelected(DESK_ENRICHMENT_MODELS.map((model) => model.id))
  }, [open])

  if (!caseItem || !open) return null

  const toggle = (id: EnrichmentModelId, on: boolean) => {
    setSelected((current) => {
      const next = new Set(current)
      if (on) next.add(id)
      else next.delete(id)
      return DESK_ENRICHMENT_MODELS.map((model) => model.id).filter((modelId) => next.has(modelId))
    })
  }

  return (
    <Modal state={overlay}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Icon className="bg-sky-100 text-sky-800">
                <ShieldCheck size={18} />
              </Modal.Icon>
              <Modal.Heading>Use third-party enrichment?</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Typography.Paragraph size="sm" className="text-slate-700">
                Risk Analysis for {caseItem.insured} can read Bitsight, Cyence, and Cytora. Choose
                the models this desk may run. Decline leaves the case on Risk Information.
              </Typography.Paragraph>
              <div className="mt-3 flex flex-col gap-3" role="group" aria-label="Enrichment models">
                {DESK_ENRICHMENT_MODELS.map((model) => (
                  <Checkbox
                    key={model.id}
                    id={`enrichment-${model.id}`}
                    name={model.id}
                    isSelected={selected.includes(model.id)}
                    onChange={(on) => toggle(model.id, on)}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      {model.label}
                    </Checkbox.Content>
                    <Description>{model.caption}</Description>
                  </Checkbox>
                ))}
              </div>
              {selected.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">Select at least one model.</p>
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                Decline
              </Button>
              <Button
                variant="primary"
                isDisabled={selected.length === 0}
                onPress={() => onConfirm(selected)}
              >
                Continue to Risk Analysis
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
