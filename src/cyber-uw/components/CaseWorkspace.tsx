import { Tabs, Typography } from '@heroui/react'
import { Lock } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cyberFlowIndex } from '../constants/cyberFlow'
import { CyencePanel } from './CyencePanel'
import { LossRunAnalysis } from './LossRunAnalysis'
import { PolicyAdminSyncPanel } from './PolicyAdminSyncPanel'
import { CytoraPanel } from './CytoraPanel'
import { RiskAnalysisDesk } from './RiskAnalysisDesk'
import {
  RiskEvidenceCitePanel,
  type RiskEvidenceCiteRow,
  type RiskEvidenceCiteSource,
} from './RiskEvidenceCitePanel'
import { SecurityRatingPanel } from './SecurityRatingPanel'
import { cyenceReadingForCase, cytoraReadingForCase } from '../data/enrichmentDemo'
import { carrierExposureForCase } from '../data/riskVizDemo'
import { securityRatingForCase } from '../data/securityRatingDemo'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase, EnrichmentModelId } from '../types'
import { EvidenceVerificationPanel } from './EvidenceVerificationPanel'
import { ExternalFindingsPanel } from './ExternalFindingsPanel'
import { NewSubmissionStage } from './NewSubmissionStage'
import {
  SpecProgressTracker,
  stageForTrackerStep,
  trackerStepForCase,
} from './SpecProgressTracker'
import { TriageAnalysisPanel } from './TriageAnalysisPanel'
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



function RiskInformationStageBody({ c }: { c: CyberCase }) {
  return <TriageAnalysisPanel c={c} />
}

function PolicyAdminSyncCard({
  c,
  onDecide,
}: {
  c: CyberCase
  onDecide: (decision: PendingDecision, rationale: string) => void
}) {
  return (
    <PolicyAdminSyncPanel
      c={c}
      onDecide={onDecide}
      onRequestInfo={() => window.dispatchEvent(new CustomEvent('cuw-open-info-request'))}
    />
  )
}

function UwLockedStage({ title }: { title: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3.5 py-3">
      <Lock size={16} className="mt-0.5 shrink-0 text-slate-400" />
      <div>
        <p className="cuw-type-title">{title} (UW only)</p>
        <p className="cuw-type-caption mt-0.5">
          Ops owns New Submission. Triage, Evidence Verification, Risk Analysis, and Sync to Policy
          Center stay with the underwriter.
        </p>
      </div>
    </div>
  )
}

function PolicyDocumentsStageBody({ c }: { c: CyberCase }) {
  return <NewSubmissionStage c={c} />
}

function useNarrowRail() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(max-width: 960px)')
    const sync = () => setNarrow(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return narrow
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

function RiskAnalysisStageBody({
  c,
  section: sectionProp,
}: {
  c: CyberCase
  section: 'vendor' | 'desk' | 'loss'
}) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)
  const [read, setRead] = useState(false)
  const [citeOpen, setCiteOpen] = useState(false)
  const [citeSource, setCiteSource] = useState<RiskEvidenceCiteSource>('bitsight')
  const [section, setSection] = useState<'vendor' | 'desk' | 'loss'>(sectionProp)
  const [vendor, setVendor] = useState<EnrichmentModelId>('bitsight')
  const narrow = useNarrowRail()
  const consented = c.enrichmentConsent?.models ?? []
  const vendorKey = consented.includes(vendor) ? vendor : consented[0]

  useEffect(() => {
    setSection(sectionProp)
  }, [sectionProp])

  useEffect(() => {
    const onSection = (ev: Event) => {
      const next = (ev as CustomEvent<{ section?: string }>).detail?.section
      if (next === 'vendor' || next === 'desk' || next === 'loss') setSection(next)
    }
    window.addEventListener('cuw-assessment-section', onSection)
    window.dispatchEvent(new CustomEvent('cuw-assessment-query'))
    return () => window.removeEventListener('cuw-assessment-section', onSection)
  }, [])

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
  }, [c.id, section, vendorKey])

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
  const exposure = carrierExposureForCase(c)
  const deskRows: RiskEvidenceCiteRow[] = [
    ...exposure.ingestInputs.map((row, i) => ({
      id: `ingest-${i}-${row.label}`,
      label: `${row.source} · ${row.label}`,
      finding: row.value,
    })),
    ...exposure.scoreCriteria.map((row) => ({
      id: `score-${row.id}`,
      label: row.title,
      finding: `${row.applied} · ${row.formula}`,
    })),
  ]

  const citeRows =
    citeSource === 'bitsight'
      ? bitsightRows
      : citeSource === 'cyence'
        ? cyenceRows
        : citeSource === 'cytora'
          ? cytoraRows
          : deskRows

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

  if (consented.length === 0 || !vendorKey) {
    return (
      <div className="wb-risk-evidence">
        <p className="wb-instrument__note">
          Third-party enrichment needs your consent. Continue from Triage Analysis to choose models.
        </p>
      </div>
    )
  }

  return (
    <div ref={sceneRef} className={sceneClass}>
      <Tabs
        className="wb-enrich-tabs"
        orientation={narrow ? 'horizontal' : 'vertical'}
        selectedKey={section}
        onSelectionChange={(key) => {
          const next = String(key)
          if (next !== 'vendor' && next !== 'desk' && next !== 'loss') return
          setSection(next)
          const step = next === 'vendor' ? 3 : next === 'desk' ? 4 : 5
          window.dispatchEvent(new CustomEvent('cuw-tracker-go', { detail: { step } }))
        }}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Assessment">
            <Tabs.Tab id="vendor">External Risk Enrichment</Tabs.Tab>
            <Tabs.Tab id="desk">Internal Risk Analysis</Tabs.Tab>
            <Tabs.Tab id="loss">Loss Run Analysis</Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="vendor">
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
        </Tabs.Panel>
        <Tabs.Panel id="desk">
          <RiskAnalysisDesk c={c} />
        </Tabs.Panel>
        <Tabs.Panel id="loss">
          <LossRunAnalysis c={c} />
        </Tabs.Panel>
      </Tabs>
      <RiskEvidenceCitePanel
        open={citeOpen}
        onClose={() => setCiteOpen(false)}
        source={citeSource}
        rows={citeRows}
      />
    </div>
  )
}

function assessmentSectionForStep(step: number): 'vendor' | 'desk' | 'loss' {
  if (step === 4) return 'desk'
  if (step === 5) return 'loss'
  return 'vendor'
}

function WorkflowTab({
  c,
  step,
  onDecide,
}: {
  c: CyberCase
  step: number
  onDecide: (decision: PendingDecision, rationale: string) => void
}) {
  const role = useAuthStore((s) => s.user?.role)
  const isOps = role === 'ops'
  const idx = cyberFlowIndex(c)
  const stage = stageForTrackerStep(step)
  const dossierFocusId = useCyberUwStore((s) => s.dossierFocusId)
  const clearDossierFocus = useCyberUwStore((s) => s.clearDossierFocus)

  useEffect(() => {
    if (!dossierFocusId) return
    if (stage !== 0) {
      window.dispatchEvent(new CustomEvent('cuw-tracker-go', { detail: { step: 0 } }))
      return
    }
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
  }, [dossierFocusId, clearDossierFocus, c.id, stage])

  return (
    <div className="space-y-4 pb-8">
      <div>
        {isOps && stage === 0 ? (
          <p className="text-xs text-slate-600">
            Ops view: New Submission only. Use Ready for UW when the package is complete.
          </p>
        ) : null}
        {c.opsHandoffAt && !isOps ? (
          <p className="mt-1 text-xs font-medium text-emerald-800">
            Ops handed off {new Date(c.opsHandoffAt).toLocaleString()}
          </p>
        ) : null}
      </div>

      {stage === 0 ? (
        <StageSection stageIndex={0} currentIndex={idx}>
          <PolicyDocumentsStageBody c={c} />
        </StageSection>
      ) : null}

      {stage === 1 && step === 1 ? (
        <StageSection stageIndex={1} currentIndex={idx}>
          {isOps ? <UwLockedStage title="Triage Analysis" /> : <RiskInformationStageBody c={c} />}
        </StageSection>
      ) : null}

      {stage === 1 && step === 2 ? (
        <StageSection stageIndex={1} currentIndex={idx}>
          {isOps ? (
            <UwLockedStage title="Evidence Verification" />
          ) : (
            <EvidenceVerificationPanel c={c} />
          )}
        </StageSection>
      ) : null}

      {stage === 2 ? (
        <StageSection stageIndex={2} currentIndex={idx}>
          {isOps ? (
            <UwLockedStage title="Risk Analysis" />
          ) : (
            <RiskAnalysisStageBody c={c} section={assessmentSectionForStep(step)} />
          )}
        </StageSection>
      ) : null}

      {stage === 3 ? (
        <StageSection stageIndex={3} currentIndex={idx}>
          {isOps ? (
            <UwLockedStage title="Sync to Policy Center" />
          ) : (
            <PolicyAdminSyncCard c={c} onDecide={onDecide} />
          )}
        </StageSection>
      ) : null}
    </div>
  )
}

export function CaseWorkspace() {
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
  const [trackerStep, setTrackerStep] = useState(() => (c ? trackerStepForCase(c) : 0))
  const [trackerCaseId, setTrackerCaseId] = useState(c?.id ?? null)
  const paneRef = useRef<HTMLDivElement>(null)
  const onTrackerStep = useCallback((step: number) => {
    setTrackerStep(step)
  }, [])
  if (c && trackerCaseId !== c.id) {
    setTrackerCaseId(c.id)
    setTrackerStep(trackerStepForCase(c))
  }

  useEffect(() => {
    if (listDecisionPrompt) {
      setPendingDecision(listDecisionPrompt)
    }
  }, [listDecisionPrompt, selectedId])

  useLayoutEffect(() => {
    paneRef.current?.scrollTo({ top: 0 })
  }, [trackerStep, c?.id])

  if (!c) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <Typography.Paragraph size="sm" color="muted">
          Select a case from Open cases to open the workflow.
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
        <SpecProgressTracker c={c} onStepChange={onTrackerStep} />

        <div className="cuw-case-workflow-pane min-h-0 flex-1">
          <div
            ref={paneRef}
            className="case-drawer-surface cuw-case-shell__pane min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 md:px-6 md:py-5"
          >
            <div id="cuw-workbench-root" className="cuw-workbench-section">
              <WorkflowTab c={c} step={trackerStep} onDecide={lockDecision} />
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
