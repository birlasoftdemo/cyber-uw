import { Tabs, Typography } from '@heroui/react'
import { Lock } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { type JourneyStepId } from '../constants/journeyNav'
import { CyencePanel } from './CyencePanel'
import { CytoraPanel } from './CytoraPanel'
import { RiskAnalysisDesk } from './RiskAnalysisDesk'
import {
  RiskEvidenceCitePanel,
  type RiskEvidenceCiteRow,
  type RiskEvidenceCiteSource,
} from './RiskEvidenceCitePanel'
import { SecurityRatingPanel } from './SecurityRatingPanel'
import { cyenceReadingForCase, cytoraReadingForCase } from '../data/enrichmentDemo'
import { securityRatingForCase } from '../data/securityRatingDemo'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase, EnrichmentModelId } from '../types'
import { AuditTrailPanel } from './AuditTrailPanel'
import { EvidenceVerificationPanel } from './EvidenceVerificationPanel'
import { ExternalFindingsPanel } from './ExternalFindingsPanel'
import { HitlDecisionPanel } from './HitlDecisionPanel'
import { NewSubmissionStage } from './NewSubmissionStage'
import { DecisionConfirmModal, type PendingDecision } from './DecisionConfirmModal'

function StageSection({
  stageIndex,
  currentIndex,
  children,
}: {
  stageIndex: number
  currentIndex: number
  children: ReactNode
}) {
  const isCurrent = stageIndex === currentIndex
  const isPast = stageIndex < currentIndex
  const cardClass = isCurrent
    ? 'wb-stage-card wb-stage-card--current'
    : isPast
      ? 'wb-stage-card wb-stage-card--past'
      : 'wb-stage-card wb-stage-card--upcoming'

  return (
    <section className={cardClass} id={`cuw-stage-${stageIndex}`}>
      {children}
    </section>
  )
}



function UwLockedStage({ title }: { title: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3.5 py-3">
      <Lock size={16} className="mt-0.5 shrink-0 text-slate-400" />
      <div>
        <p className="cuw-type-title">{title} (UW only)</p>
        <p className="cuw-type-caption mt-0.5">
          Ops owns Intake. Risk Analysis, Enrichment, Evidence, Decision, and Audit stay with the
          underwriter.
        </p>
      </div>
    </div>
  )
}

function PolicyDocumentsStageBody({ c }: { c: CyberCase }) {
  return <NewSubmissionStage c={c} />
}

function VendorReading({
  model,
  c,
  onOpenCites,
}: {
  model: EnrichmentModelId
  c: CyberCase
  onOpenCites: () => void
}) {
  switch (model) {
    case 'bitsight':
      return <SecurityRatingPanel c={c} onOpenCites={onOpenCites} />
    case 'cyence':
      return <CyencePanel c={c} onOpenCites={onOpenCites} />
    case 'cytora':
      return <CytoraPanel c={c} onOpenCites={onOpenCites} />
    default: {
      const neverModel: never = model
      return neverModel
    }
  }
}

function RiskAnalysisStageBody({ c }: { c: CyberCase }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)
  const [read, setRead] = useState(false)
  const [citeOpen, setCiteOpen] = useState(false)
  const [citeSource, setCiteSource] = useState<RiskEvidenceCiteSource>('bitsight')
  const [vendor, setVendor] = useState<EnrichmentModelId>('bitsight')
  const consented = c.enrichmentConsent?.models ?? []
  const vendorKey = consented.includes(vendor) ? vendor : consented[0]

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setArmed(false)
      setRead(false)
      return
    }
    setRead(false)
    setArmed(true)
    const el = sceneRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRead(true)
          observer.disconnect()
        }
      },
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [c.id, vendorKey])

  const bitsightRows: RiskEvidenceCiteRow[] = securityRatingForCase(c).citeBacks.map((row) => ({
    id: row.id,
    label: row.bucketLabel,
    finding: row.finding,
  }))
  const cyence = cyenceReadingForCase(c)
  const cyenceRows: RiskEvidenceCiteRow[] = [
    ...cyence.scenarios.map((row) => ({
      id: row.id,
      label: row.label,
      finding: `${row.evidence} · ${row.lossUsd}`,
    })),
    {
      id: 'pml',
      label: 'Probable maximum loss',
      finding: cyence.positionSentence,
    },
  ]
  const cytora = cytoraReadingForCase(c)
  const cytoraRows: RiskEvidenceCiteRow[] = [
    ...cytora.factors.map((row) => ({
      id: row.id,
      label: row.name,
      finding: row.evidence,
    })),
    ...cytora.evidence.map((row, index) => ({
      id: `evidence-${index}`,
      label: row.section,
      finding: row.line,
    })),
  ]

  const citeRows =
    citeSource === 'bitsight'
      ? bitsightRows
      : citeSource === 'cyence'
        ? cyenceRows
        : cytoraRows

  const openCites = (source: RiskEvidenceCiteSource) => {
    setCiteSource(source)
    setCiteOpen(true)
  }

  const sceneClass = [
    'wb-risk-evidence',
    armed ? 'wb-risk-evidence--arm' : '',
    read ? 'wb-risk-evidence--read' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={sceneRef} className={sceneClass}>
      {consented.length === 0 || !vendorKey ? (
        <p className="wb-instrument__note">
          Third-party enrichment needs your consent. Choose models to unlock external findings.
        </p>
      ) : (
        <>
          <ExternalFindingsPanel c={c} />
          <Tabs
            className="wb-vendor-tabs"
            variant="secondary"
            selectedKey={vendorKey}
            onSelectionChange={(key) => {
              const next = String(key)
              if (next === 'bitsight' || next === 'cyence' || next === 'cytora') setVendor(next)
            }}
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="External Risk Enrichment">
                {consented.map((model) => (
                  <Tabs.Tab key={model} id={model}>
                    {model === 'bitsight'
                      ? 'Bitsight (Simulated)'
                      : model === 'cyence'
                        ? 'Cyence (Simulated)'
                        : 'Cytora (Simulated)'}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id={vendorKey}>
              <VendorReading model={vendorKey} c={c} onOpenCites={() => openCites(vendorKey)} />
            </Tabs.Panel>
          </Tabs>
        </>
      )}
      <RiskEvidenceCitePanel
        open={citeOpen}
        onClose={() => setCiteOpen(false)}
        source={citeSource}
        rows={citeRows}
      />
    </div>
  )
}

function WorkflowTab({
  c,
  journeyStep,
  onDecide,
}: {
  c: CyberCase
  journeyStep: JourneyStepId
  onDecide: (decision: PendingDecision, rationale: string) => void
}) {
  const role = useAuthStore((s) => s.user?.role)
  const isOps = role === 'ops'
  const dossierFocusId = useCyberUwStore((s) => s.dossierFocusId)
  const clearDossierFocus = useCyberUwStore((s) => s.clearDossierFocus)

  useEffect(() => {
    if (!dossierFocusId) return
    if (journeyStep !== 'intake') return
    const el = document.getElementById(`dossier-anchor-${dossierFocusId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2')
      const t = window.setTimeout(() => {
        el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2')
        clearDossierFocus()
      }, 2200)
      return () => window.clearTimeout(t)
    }
    clearDossierFocus()
  }, [dossierFocusId, clearDossierFocus, c.id, journeyStep])

  return (
    <div className="space-y-4 pb-8">
      <div>
        {isOps && journeyStep === 'intake' ? (
          <p className="text-xs text-slate-600">
            Ops view: Intake only. Use Ready for UW when the package is complete.
          </p>
        ) : null}
        {c.opsHandoffAt && !isOps ? (
          <p className="mt-1 text-xs font-medium text-emerald-800">
            Ops handed off {new Date(c.opsHandoffAt).toLocaleString()}
          </p>
        ) : null}
      </div>

      {journeyStep === 'intake' ? (
        <StageSection stageIndex={0} currentIndex={0}>
          <PolicyDocumentsStageBody c={c} />
        </StageSection>
      ) : null}

      {journeyStep === 'risk' ? (
        <StageSection stageIndex={1} currentIndex={1}>
          {isOps ? <UwLockedStage title="Risk Analysis" /> : <RiskAnalysisDesk c={c} />}
        </StageSection>
      ) : null}

      {journeyStep === 'enrichment' ? (
        <StageSection stageIndex={2} currentIndex={2}>
          {isOps ? (
            <UwLockedStage title="Enrichment" />
          ) : (
            <RiskAnalysisStageBody c={c} />
          )}
        </StageSection>
      ) : null}

      {journeyStep === 'evidence' ? (
        <StageSection stageIndex={1} currentIndex={1}>
          {isOps ? <UwLockedStage title="Evidence" /> : <EvidenceVerificationPanel c={c} />}
        </StageSection>
      ) : null}

      {journeyStep === 'decision' ? (
        <StageSection stageIndex={3} currentIndex={3}>
          {isOps ? (
            <UwLockedStage title="Decision" />
          ) : (
            <HitlDecisionPanel c={c} onDecide={onDecide} />
          )}
        </StageSection>
      ) : null}

      {journeyStep === 'audit' ? (
        <StageSection stageIndex={3} currentIndex={3}>
          <AuditTrailPanel c={c} />
        </StageSection>
      ) : null}
    </div>
  )
}

export function CaseWorkspace({ journeyStep }: { journeyStep: JourneyStepId }) {
  const {
    cases,
    selectedId,
    applyDecision,
    saveFinancialSignOff,
    listDecisionPrompt,
    clearListDecisionPrompt,
  } = useCyberUwStore()
  const c = cases.find((x) => x.id === selectedId)
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)
  const [decisionRationale, setDecisionRationale] = useState('')
  const paneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listDecisionPrompt) {
      setPendingDecision(listDecisionPrompt)
    }
  }, [listDecisionPrompt, selectedId])

  useLayoutEffect(() => {
    paneRef.current?.scrollTo({ top: 0 })
  }, [journeyStep, c?.id])

  if (!c) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <Typography.Paragraph size="sm" color="muted">
          Select a case from the dashboard to open Adaptive Cyber Underwriting Intelligence.
        </Typography.Paragraph>
      </div>
    )
  }

  const reasonFor = (d: PendingDecision) => {
    if (decisionRationale.trim().length >= 8) return decisionRationale.trim()
    if (d === 'quote') return 'Aligned attestation/signal; within appetite; Tier acceptable.'
    if (d === 'refer') return 'Material gap or rule hit. Specialist review before bind.'
    return 'Hard control floor failed at the requested limit. Decline or restructure.'
  }

  const closeConfirm = () => {
    setPendingDecision(null)
    setDecisionRationale('')
    clearListDecisionPrompt()
  }

  const lockDecision = (decision: PendingDecision, rationale: string) => {
    if (decision === 'quote' && !c.financialSignOff?.signedOffAt) {
      saveFinancialSignOff(c.id, {
        limitUsd: c.limitRequestedUsd,
        sirUsd: Math.round(c.limitRequestedUsd * 0.02),
        pricingTier: c.tier,
        stubPremiumUsd: Math.round(c.limitRequestedUsd * 0.012),
        managerCosign: true,
        cosignReason: rationale || 'Manager co-sign for HITL approve with material exception.',
        withinAuthority: false,
      })
    }
    applyDecision(c.id, decision, rationale)
    closeConfirm()
  }

  return (
    <div className="cuw-case-shell flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="cuw-case-workflow-pane min-h-0 flex-1">
          <div
            ref={paneRef}
            className="case-drawer-surface cuw-case-shell__pane min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 md:px-6 md:py-5"
          >
            <div id="cuw-workbench-root" className="cuw-workbench-section">
              <WorkflowTab c={c} journeyStep={journeyStep} onDecide={lockDecision} />
            </div>
          </div>
        </div>
      </div>

      <DecisionConfirmModal
        caseItem={c}
        pending={pendingDecision}
        rationale={decisionRationale}
        onRationaleChange={setDecisionRationale}
        onCancel={closeConfirm}
        onConfirm={() => {
          if (!pendingDecision) return
          lockDecision(pendingDecision, reasonFor(pendingDecision))
        }}
      />
    </div>
  )
}
