import { Button, Checkbox, Tabs, Typography } from '@heroui/react'
import { ChevronDown, Lock, RefreshCw } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import {
  CYBER_FLOW_STAGES,
  cyberFlowIndex,
  isFinancialSignOffComplete,
  isWithinJuniorAuthority,
  needsManagerCosign,
} from '../constants/cyberFlow'
import {
  allAnswerKeysForCase,
  answersSignedForCase,
  riskSectionReportsForCase,
  sectionReportsForCase,
  type TriageFinding,
} from '../data/cyberTriageRules'
import { RiskVizPanel } from './RiskVizCharts'
import { SecurityRatingPanel } from './SecurityRatingPanel'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase, CyberTier, RiskJudgmentStatus } from '../types'
import { missingDocsForCase } from '../utils/missingDocs'
import { money } from './CyberPrimitives'
import {
  CyberProgressStepper,
  CyberStageAdvanceCard,
} from './CyberWorkbenchDesk'
import { DecisionConfirmModal, type PendingDecision } from './DecisionConfirmModal'
import {
  IngestQuestionGrid,
  QuestionMetaGrid,
  ReviewQuestionGrid,
  SignSectionButton,
  TriageRuleBanner,
} from './QuestionFields'
import {
  DiscussionReferModal,
  type DiscussionReferDraft,
} from './DiscussionReferModal'

function StageSection({
  title,
  stageIndex,
  currentIndex,
  forceExpand,
  stayOpen,
  children,
}: {
  title: string
  stageIndex: number
  currentIndex: number
  forceExpand?: boolean
  /** Keep extracted package visible after the stage is no longer current. */
  stayOpen?: boolean
  children: ReactNode
}) {
  const isCurrent = stageIndex === currentIndex
  const isPast = stageIndex < currentIndex
  const cardClass = isCurrent
    ? 'wb-stage-card wb-stage-card--current'
    : isPast
      ? 'wb-stage-card wb-stage-card--past'
      : 'wb-stage-card wb-stage-card--upcoming'

  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null)
  useEffect(() => {
    setExpandedOverride(null)
  }, [isPast, isCurrent, stageIndex])
  const expanded = forceExpand || (expandedOverride ?? (stayOpen || !isPast))

  return (
    <section className={cardClass}>
      <button
        type="button"
        onClick={() => setExpandedOverride(!expanded)}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center gap-2 text-left"
      >
        <span className="wb-stage-card__index">{stageIndex + 1}</span>
        <h3 className="dashboard-section-title text-base text-slate-900">{title}</h3>
        {isCurrent ? (
          <span className="text-xs font-semibold text-slate-500">Active</span>
        ) : null}
        {isPast ? (
          <span className="text-xs font-semibold text-emerald-700">Completed</span>
        ) : null}
        <ChevronDown
          size={16}
          className={`ml-auto shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {expanded ? <div className="mt-4">{children}</div> : null}
    </section>
  )
}



function judgmentLabel(status: RiskJudgmentStatus | undefined) {
  if (status === 'accepted') return 'Approved'
  if (status === 'escalated') return 'Escalated'
  if (status === 'noted') return 'Ignored'
  return 'Pending'
}

function TriageFindingCard({
  caseId,
  insured,
  finding,
  status,
  expanded,
  onToggle,
}: {
  caseId: string
  insured: string
  finding: TriageFinding
  status: RiskJudgmentStatus | undefined
  expanded: boolean
  onToggle: () => void
}) {
  const signRiskItem = useCyberUwStore((s) => s.signRiskItem)
  const submitDiscussionReferral = useCyberUwStore((s) => s.submitDiscussionReferral)
  const [draft, setDraft] = useState<DiscussionReferDraft | null>(null)
  const signed = status && status !== 'pending'

  return (
    <li
      id={`risk-item-${finding.id}`}
      className={`wb-risk-item overflow-hidden ${expanded ? 'ring-2 ring-blue-400/70 ring-offset-1' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-left"
      >
        <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{finding.title}</p>
        <span className="font-mono text-[10px] font-semibold text-slate-500">{finding.ruleId}</span>
        <span className="text-xs capitalize text-slate-500">{finding.severity}</span>
        {finding.required ? (
          <span className="text-xs font-medium text-slate-500">Required</span>
        ) : null}
        <span className="text-xs font-semibold text-slate-600">{judgmentLabel(status)}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div className="mt-2 border-t border-slate-100 pt-2">
          <p className="text-sm text-slate-700">{finding.summary}</p>
          <div className="wb-gap-compare mt-3" role="group" aria-label="Attested versus detected">
            <div className="wb-gap-pane wb-gap-pane--ideal">
              <div className="wb-gap-pane__meta">
                <span className="wb-gap-pane__label">Attested</span>
              </div>
              <p className="wb-gap-pane__value">{finding.attested}</p>
            </div>
            <div className="wb-gap-pane wb-gap-pane--watch">
              <div className="wb-gap-pane__meta">
                <span className="wb-gap-pane__label">Detected</span>
              </div>
              <p className="wb-gap-pane__value">{finding.detected}</p>
            </div>
          </div>

          {!signed ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="primary"
                onPress={() => signRiskItem(caseId, finding.id, 'accepted')}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onPress={() =>
                  setDraft({
                    caseId,
                    kind: 'risk',
                    sourceId: finding.id,
                    sourceLabel: finding.title,
                    insured,
                  })
                }
              >
                Escalate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => signRiskItem(caseId, finding.id, 'noted')}
              >
                Ignore
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <DiscussionReferModal
        draft={draft}
        onCancel={() => setDraft(null)}
        onConfirm={(input) => {
          submitDiscussionReferral(input)
          setDraft(null)
        }}
      />
    </li>
  )
}

function RiskInformationStageBody({ c }: { c: CyberCase }) {
  const reports = riskSectionReportsForCase(c)
  const answersSigned = Boolean(c.packageSignOff?.signedOffAt) && answersSignedForCase(c, allAnswerKeysForCase(c))
  const [sectionKey, setSectionKey] = useState(reports[0]?.section.id ?? '')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setSectionKey(reports[0]?.section.id ?? '')
    setExpandedId(null)
  }, [c.id])
  const selected = reports.find((r) => r.section.id === sectionKey) ?? reports[0]
  const findings = selected?.findings ?? []

  return (
    <div className="space-y-4">
      {reports.length ? (
        <Tabs
          selectedKey={sectionKey}
          onSelectionChange={(k) => {
            setSectionKey(String(k))
            setExpandedId(null)
          }}
          className="wb-segmented-tabs wb-section-tabs"
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Application sections">
              {reports.map((r) => (
                <Tabs.Tab key={r.section.id} id={r.section.id}>
                  {r.section.tabLabel}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      ) : null}

      {selected ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-900">{selected.section.title}</h4>
          {answersSigned ? (
            <TriageRuleBanner fields={selected.fields} findings={findings} />
          ) : null}
          {selected.fields.length ? (
            <div className="mt-3">
              <ReviewQuestionGrid
                sectionId={selected.section.id}
                fields={selected.fields}
                showTriage={answersSigned}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {answersSigned && findings.length ? (
        <ul className="space-y-2">
          {findings.map((finding) => (
            <TriageFindingCard
              key={finding.id}
              caseId={c.id}
              insured={c.insured}
              finding={finding}
              status={c.riskJudgments[finding.id]?.status}
              expanded={expandedId === finding.id}
              onToggle={() => setExpandedId((cur) => (cur === finding.id ? null : finding.id))}
            />
          ))}
        </ul>
      ) : null}
    </div>
  )
}


function FinancialSignOffPanel({ c }: { c: CyberCase }) {
  const saveFinancialSignOff = useCyberUwStore((s) => s.saveFinancialSignOff)
  const existing = c.financialSignOff
  const [limitUsd, setLimitUsd] = useState(existing?.limitUsd ?? c.limitRequestedUsd)
  const [sirUsd, setSirUsd] = useState(existing?.sirUsd ?? 100_000)
  const [pricingTier, setPricingTier] = useState<CyberTier>(
    existing?.pricingTier ?? c.tier,
  )
  const [stubPremiumUsd, setStubPremiumUsd] = useState(
    existing?.stubPremiumUsd ?? Math.round(c.limitRequestedUsd * 0.012),
  )
  const [managerCosign, setManagerCosign] = useState(existing?.managerCosign ?? false)
  const [cosignReason, setCosignReason] = useState(existing?.cosignReason ?? '')

  const criticalOpen = c.gaps.filter(
    (g) => g.severity === 'critical' && g.disposition === 'open',
  ).length
  const within = isWithinJuniorAuthority(limitUsd, pricingTier)
  const needsCosign = needsManagerCosign({
    limitUsd,
    pricingTier,
    criticalOpenGaps: criticalOpen,
  })
  const locked = Boolean(existing?.signedOffAt) && c.decision !== 'pending'

  if (isFinancialSignOffComplete(existing) && c.decision !== 'pending') {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3.5 py-3 text-sm text-emerald-950">
        Financial sign off recorded · {money(existing!.limitUsd)} limit · SIR{' '}
        {money(existing!.sirUsd)} · Tier {existing!.pricingTier}
        {existing!.managerCosign ? ' · Manager approved' : ''}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Financial sign off</p>
        <span
          className={`text-xs font-semibold ${within ? 'text-emerald-700' : 'text-amber-800'}`}
        >
          {within ? 'Within junior UW authority' : 'Over authority. Manager approval needed.'}
        </span>
      </div>
      <div className="wb-q-grid">
        <label className="wb-q-cell text-xs font-medium text-slate-600">
          Aggregate limit (USD)
          <input
            type="number"
            className="wb-q-cell__input mt-1"
            value={limitUsd}
            disabled={locked}
            onChange={(e) => setLimitUsd(Number(e.target.value) || 0)}
          />
        </label>
        <label className="wb-q-cell text-xs font-medium text-slate-600">
          SIR / retention (USD)
          <input
            type="number"
            className="wb-q-cell__input mt-1"
            value={sirUsd}
            disabled={locked}
            onChange={(e) => setSirUsd(Number(e.target.value) || 0)}
          />
        </label>
        <label className="wb-q-cell text-xs font-medium text-slate-600">
          Pricing tier
          <select
            className="wb-q-cell__input mt-1"
            value={pricingTier}
            disabled={locked}
            onChange={(e) => setPricingTier(Number(e.target.value) as CyberTier)}
          >
            {[1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>
                Tier {t}
              </option>
            ))}
          </select>
        </label>
        <label className="wb-q-cell text-xs font-medium text-slate-600">
          Stub premium (USD)
          <input
            type="number"
            className="wb-q-cell__input mt-1"
            value={stubPremiumUsd}
            disabled={locked}
            onChange={(e) => setStubPremiumUsd(Number(e.target.value) || 0)}
          />
        </label>
      </div>
      {needsCosign ? (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={managerCosign}
              disabled={locked}
              onChange={(e) => setManagerCosign(e.target.checked)}
            />
            Manager approval (over authority or soft concession on critical gaps)
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
            placeholder="Approval rationale"
            value={cosignReason}
            disabled={locked}
            onChange={(e) => setCosignReason(e.target.value)}
          />
        </div>
      ) : null}
      {c.decision === 'pending' ? (
        <Button
          size="sm"
          variant="primary"
          onPress={() =>
            saveFinancialSignOff(c.id, {
              limitUsd,
              sirUsd,
              pricingTier,
              stubPremiumUsd,
              managerCosign,
              cosignReason: cosignReason.trim() || undefined,
            })
          }
        >
          {existing?.signedOffAt ? 'Update financial sign off' : 'Record financial sign off'}
        </Button>
      ) : null}
      {existing?.signedOffAt ? (
        <p className="text-xs text-emerald-800">
          Signed {new Date(existing.signedOffAt).toLocaleString()}
        </p>
      ) : null}
    </div>
  )
}

function QuoteReadyCard({ c }: { c: CyberCase }) {
  return (
    <div className="space-y-4">
      <FinancialSignOffPanel c={c} />

      {c.decision !== 'pending' && c.decisionReason ? (
        <p className="text-sm text-slate-700">{c.decisionReason}</p>
      ) : null}
    </div>
  )
}

function UwLockedStage({ title }: { title: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3.5 py-3">
      <Lock size={16} className="mt-0.5 shrink-0 text-slate-400" />
      <p className="text-sm font-semibold text-slate-800">{title} (UW only)</p>
    </div>
  )
}

function formatPolicyDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function policyPeriod(c: CyberCase): { start: string; end: string } {
  const startIso = c.policyStartAt ?? c.receivedAt
  const start = new Date(startIso)
  const end = c.policyEndAt
    ? new Date(c.policyEndAt)
    : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate())
  return { start: startIso, end: end.toISOString() }
}

function PolicyDocumentsStageBody({ c }: { c: CyberCase }) {
  const missing = missingDocsForCase(c)
  const runMockSignal = useCyberUwStore((s) => s.runMockSignal)
  const submitDiscussionReferral = useCyberUwStore((s) => s.submitDiscussionReferral)
  const togglePackageDocAccepted = useCyberUwStore((s) => s.togglePackageDocAccepted)
  const signOffPackage = useCyberUwStore((s) => s.signOffPackage)
  const signSectionAnswers = useCyberUwStore((s) => s.signSectionAnswers)
  const scanning = c.signalStatus === 'scanning'
  const [ingestReferDraft, setIngestReferDraft] = useState<DiscussionReferDraft | null>(null)
  const reports = sectionReportsForCase(c)
  const accepted = new Set(c.packageSignOff?.acceptedDocIds ?? [])
  const allChecked = c.packageDocs.length > 0 && c.packageDocs.every((d) => accepted.has(d.id))
  const signed = Boolean(c.packageSignOff?.signedOffAt)
  const answerKeys = allAnswerKeysForCase(c)
  const answersOk = answersSignedForCase(c, answerKeys)
  const canSign = allChecked && missing.length === 0 && c.completenessPct >= 80 && answersOk && !signed
  const period = policyPeriod(c)

  const openIngestRefer = () => {
    const label =
      missing.length > 0
        ? `Missing docs: ${missing.join('; ')}`
        : `Incomplete package (${c.completenessPct}% complete)`
    setIngestReferDraft({
      caseId: c.id,
      kind: 'ingest',
      sourceId: 'package-missing',
      sourceLabel: label,
      insured: c.insured,
      broker: c.broker,
    })
  }

  return (
    <div className="space-y-4">
      <QuestionMetaGrid
        items={[
          { label: 'Start date', value: formatPolicyDate(period.start) },
          { label: 'End date', value: formatPolicyDate(period.end) },
          { label: 'Completeness', value: `${c.completenessPct}%` },
          { label: 'Requested limit', value: money(c.limitRequestedUsd) },
        ]}
      />

      <section>
        <h4 className="text-sm font-semibold text-slate-900">Package documents</h4>
        {c.packageDocs.length ? (
          <ul className="mt-2 divide-y divide-slate-100">
            {c.packageDocs.map((doc) => (
              <li
                key={doc.id}
                id={`dossier-anchor-${doc.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md py-2 text-sm transition"
              >
                <Checkbox
                  isSelected={accepted.has(doc.id)}
                  isDisabled={signed}
                  onChange={(selected) => togglePackageDocAccepted(c.id, doc.id, selected)}
                  aria-label={`Accept ${doc.name}`}
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <span className="font-medium text-slate-900">{doc.name}</span>
                  </Checkbox.Content>
                </Checkbox>
                <span className="text-xs capitalize text-slate-500">{doc.kind}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No documents attached.</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {signed ? (
            <p className="text-xs font-medium text-emerald-800">
              Package signed off
              {c.packageSignOff?.signedOffBy ? ` · ${c.packageSignOff.signedOffBy}` : ''}
              {c.packageSignOff?.signedOffAt
                ? ` · ${formatPolicyDate(c.packageSignOff.signedOffAt)}`
                : ''}
            </p>
          ) : (
            <Button size="sm" variant="primary" isDisabled={!canSign} onPress={() => signOffPackage(c.id)}>
              Sign off ingested package
            </Button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900">Extracted fields</h4>
          {!answersOk ? (
            <Button size="sm" variant="secondary" onPress={() => signSectionAnswers(c.id, answerKeys)}>
              Sign all answers
            </Button>
          ) : null}
        </div>
        {reports.map((report) => {
          const keys = report.fields.map((f) => f.key ?? `${report.section.id}::${f.label}`)
          const sectionSigned = answersSignedForCase(c, keys)
          return (
            <div key={report.section.id} className="wb-qual-bucket">
              <div className="wb-qual-bucket__head">
                <h5 className="text-sm font-semibold text-slate-900">{report.section.title}</h5>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500">Q{report.section.questions}</span>
                  <SignSectionButton caseId={c.id} keys={keys} allSigned={sectionSigned} />
                </div>
              </div>
              <div className="p-3">
                <IngestQuestionGrid
                  caseId={c.id}
                  sectionId={report.section.id}
                  fields={report.fields}
                  c={c}
                />
              </div>
            </div>
          )
        })}
      </section>

      {missing.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <h4 className="text-sm font-semibold text-slate-900">Missing documents</h4>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-800">
            {missing.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              isDisabled={scanning}
              onPress={() => runMockSignal(c.id)}
            >
              <RefreshCw size={14} />
              {scanning ? 'Scanning…' : 'Run ingest again'}
            </Button>
            <Button size="sm" variant="primary" onPress={openIngestRefer}>
              Escalate to Broker
            </Button>
          </div>
        </div>
      ) : c.completenessPct < 80 ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            isDisabled={scanning}
            onPress={() => runMockSignal(c.id)}
          >
            <RefreshCw size={14} />
            {scanning ? 'Scanning…' : 'Run ingest again'}
          </Button>
          <Button size="sm" variant="primary" onPress={openIngestRefer}>
            Escalate to Broker
          </Button>
        </div>
      ) : null}

      <DiscussionReferModal
        draft={ingestReferDraft}
        onCancel={() => setIngestReferDraft(null)}
        onConfirm={(input) => {
          submitDiscussionReferral(input)
          setIngestReferDraft(null)
        }}
      />
    </div>
  )
}

function RiskAnalysisStageBody({ c }: { c: CyberCase }) {
  return (
    <div className="space-y-3">
      <SecurityRatingPanel c={c} />
      <RiskVizPanel c={c} activeThreatId={null} onSelectThreat={() => {}} />
    </div>
  )
}

function WorkflowTab({ c }: { c: CyberCase }) {
  const role = useAuthStore((s) => s.user?.role)
  const isOps = role === 'ops'
  const idx = cyberFlowIndex(c)
  const dossierFocusId = useCyberUwStore((s) => s.dossierFocusId)
  const clearDossierFocus = useCyberUwStore((s) => s.clearDossierFocus)

  useEffect(() => {
    if (!dossierFocusId) return
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
  }, [dossierFocusId, clearDossierFocus, c.id])

  return (
    <div className="space-y-3 pb-6">
      {c.opsHandoffAt && !isOps ? (
        <p className="text-xs font-medium text-emerald-800">
          Ops handed off {new Date(c.opsHandoffAt).toLocaleString()}
        </p>
      ) : null}

      <StageSection
        title={CYBER_FLOW_STAGES[0].title}
        stageIndex={0}
        currentIndex={idx}
        stayOpen
        forceExpand={Boolean(dossierFocusId)}
      >
        <PolicyDocumentsStageBody c={c} />
      </StageSection>

      {isOps ? (
        <>
          <StageSection title={CYBER_FLOW_STAGES[1].title} stageIndex={1} currentIndex={idx}>
            <UwLockedStage title="Risk Information" />
          </StageSection>
          <StageSection title={CYBER_FLOW_STAGES[2].title} stageIndex={2} currentIndex={idx}>
            <UwLockedStage title="Risk Analysis" />
          </StageSection>
          <StageSection title={CYBER_FLOW_STAGES[3].title} stageIndex={3} currentIndex={idx}>
            <UwLockedStage title="Get Quote Ready" />
          </StageSection>
        </>
      ) : (
        <>
          <StageSection title={CYBER_FLOW_STAGES[1].title} stageIndex={1} currentIndex={idx}>
            <RiskInformationStageBody c={c} />
          </StageSection>
          <StageSection title={CYBER_FLOW_STAGES[2].title} stageIndex={2} currentIndex={idx}>
            <RiskAnalysisStageBody c={c} />
          </StageSection>
          <StageSection title={CYBER_FLOW_STAGES[3].title} stageIndex={3} currentIndex={idx}>
            <QuoteReadyCard c={c} />
          </StageSection>
        </>
      )}
    </div>
  )
}

type CaseWorkspaceProps = {
  focusMode?: boolean
}

export function CaseWorkspace(_props: CaseWorkspaceProps = {}) {
  const {
    cases,
    selectedId,
    runMockSignal,
    applyDecision,
    listDecisionPrompt,
    clearListDecisionPrompt,
  } = useCyberUwStore()
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)
  const c = cases.find((x) => x.id === selectedId)

  useEffect(() => {
    if (listDecisionPrompt) {
      setPendingDecision(listDecisionPrompt)
    }
  }, [listDecisionPrompt, selectedId])

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
    if (d === 'quote') return 'Aligned attestation/signal; within appetite; Tier acceptable.'
    if (d === 'refer') return 'Material gap or rule hit. Specialist review before bind.'
    return 'Hard control floor failed at the requested limit. Decline or restructure.'
  }

  const closeConfirm = () => {
    setPendingDecision(null)
    clearListDecisionPrompt()
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="wb-cyber-advance-strip wb-cyber-advance-strip--stages shrink-0 border-b border-slate-200/80 px-3 py-2.5 md:px-4">
          <div className="wb-progress-stepper-chrome wb-progress-stepper-chrome--inline mb-2">
            <CyberProgressStepper c={c} />
          </div>
          <CyberStageAdvanceCard
            compact
            c={c}
            onRequestDecision={(d) => setPendingDecision(d)}
            onSignal={() => runMockSignal(c.id)}
          />
        </div>

        <div className="case-drawer-surface min-h-0 flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4">
          <WorkflowTab c={c} />
        </div>
      </div>

      <DecisionConfirmModal
        caseItem={c}
        pending={pendingDecision}
        onCancel={closeConfirm}
        onConfirm={() => {
          if (!pendingDecision) return
          applyDecision(c.id, pendingDecision, reasonFor(pendingDecision))
          closeConfirm()
        }}
      />
    </div>
  )
}
