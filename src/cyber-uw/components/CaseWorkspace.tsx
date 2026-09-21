import { Button, Tabs, Typography } from '@heroui/react'
import {
  CalendarCheck2,
  CalendarRange,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileStack,
  Landmark,
  Lock,
  Pencil,
  PencilOff,
  Percent,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  CYBER_FLOW_STAGES,
  cyberFlowIndex,
  isFinancialSignOffComplete,
  isWithinJuniorAuthority,
  needsManagerCosign,
} from '../constants/cyberFlow'
import {
  INELIGIBLE_ORGANIZATION_ACTIVITIES,
  riskSectionReportsForCase,
  sectionReportsForCase,
  type TriageFinding,
} from '../data/cyberTriageRules'
import { PACKAGE_DOC_KINDS, openPackageDocument } from '../data/dossierPackage'
import { Customer360Panel } from './Customer360Panel'
import { RiskVizPanel } from './RiskVizCharts'
import {
  RiskEvidenceCitePanel,
  type RiskEvidenceCiteRow,
  type RiskEvidenceCiteSource,
} from './RiskEvidenceCitePanel'
import { SecurityRatingPanel } from './SecurityRatingPanel'
import { carrierExposureForCase } from '../data/riskVizDemo'
import { securityRatingForCase } from '../data/securityRatingDemo'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase, CyberTier, RiskJudgmentStatus } from '../types'
import { checklistStatusForCase, missingDocsForCase } from '../utils/missingDocs'
import { formatPolicyDate, policyPeriodForCase } from '../utils/policyPeriod'
import { money } from './CyberPrimitives'
import { CyberProgressStepper } from './CyberWorkbenchDesk'
import { FloatingWorkflowBar } from './FloatingWorkflowBar'
import { DecisionConfirmModal, type PendingDecision } from './DecisionConfirmModal'
import { DocumentsCompleteModal } from './DocumentsCompleteModal'
import {
  IngestQuestionGrid,
  QuestionMetaGrid,
  ReviewQuestionGrid,
} from './QuestionFields'
import {
  DiscussionReferModal,
  type DiscussionReferDraft,
} from './DiscussionReferModal'
import { ValueCompareCard, parseMoneyish, formatCompactMoney, type ValueCompareStatus } from './ValueCompareCard'

function StageSection({
  title,
  icon: Icon,
  stageIndex,
  currentIndex,
  forceExpand,
  stayOpen,
  children,
}: {
  title: string
  icon?: LucideIcon
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
    <section className={cardClass} id={`cuw-stage-${stageIndex}`}>
      <button
        type="button"
        onClick={() => setExpandedOverride(!expanded)}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center gap-2 text-left"
      >
        <span className="wb-stage-card__index">{stageIndex + 1}</span>
        {Icon ? (
          <span className="cuw-stage-glyph" aria-hidden>
            <Icon size={15} strokeWidth={1.75} />
          </span>
        ) : null}
        <h3 className="cuw-type-title text-[1.05rem]">{title}</h3>
        {isPast ? (
          <span className="cuw-type-kicker" style={{ color: 'var(--cuw-ink-pass)' }}>
            Completed
          </span>
        ) : null}
        <ChevronDown
          size={16}
          className={`ml-auto shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--cuw-ink-tertiary)' }}
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
  const openDossierFocus = useCyberUwStore((s) => s.openDossierFocus)
  const [draft, setDraft] = useState<DiscussionReferDraft | null>(null)
  const signed = status && status !== 'pending'

  const compareStatus: ValueCompareStatus =
    finding.suggested === 'approve'
      ? 'meets'
      : finding.suggested === 'escalate' || finding.severity === 'high'
        ? 'below'
        : 'watch'

  /** Detected = package extract; Permitted = control / policy requirement. */
  const extractedMoney =
    parseMoneyish(finding.attested) ?? parseMoneyish(finding.detected)
  const detectedValue = finding.attested
  const permittedValue =
    extractedMoney != null
      ? formatCompactMoney(extractedMoney)
      : finding.required
        ? `Required · ${finding.chartLabel}`
        : `Policy band · ${finding.chartLabel}`
  const capacityValue =
    extractedMoney != null ? formatCompactMoney(extractedMoney * 2) : undefined

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
        <span className="cuw-glyph" aria-hidden>
          {finding.required ? (
          <ShieldAlert size={14} strokeWidth={1.75} />
        ) : (
          <Scale size={14} strokeWidth={1.75} />
        )}
        </span>
        <p className="cuw-type-title min-w-0 flex-1 text-[0.9375rem]">{finding.title}</p>
        <span className="cuw-type-label font-mono">{finding.ruleId}</span>
        <span className={`wb-gap-severity wb-gap-severity--${finding.severity}`}>
          {finding.severity}
        </span>
        {signed ? (
          <span className="cuw-type-caption font-semibold">{judgmentLabel(status)}</span>
        ) : null}
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--cuw-ink-tertiary)' }}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div className="mt-2 border-t border-slate-100 pt-2">
          <p className="cuw-type-body">{finding.summary}</p>
          <p className="cuw-type-caption mt-1">{finding.detail}</p>
          <div className="mt-3">
            <ValueCompareCard
              showHeader={false}
              title={finding.title}
              category={finding.chartLabel}
              detectedValue={detectedValue}
              permittedValue={permittedValue}
              capacityValue={capacityValue}
              detectedSource={`${finding.sourceDocName}`}
              status={compareStatus}
              statusDetail={finding.summary}
              onViewSource={
                finding.sourceDocId
                  ? () => openDossierFocus(finding.sourceDocId)
                  : undefined
              }
            />
            <p className="cuw-type-caption mt-2 text-slate-600">
              Signal · {finding.detected}
            </p>
          </div>
          <p className="cuw-type-caption mt-2">
            Suggested · {finding.suggested === 'approve' ? 'Approve' : finding.suggested === 'escalate' ? 'Escalate' : 'Ignore'}
          </p>

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
  const documentsComplete = Boolean(c.packageSignOff?.signedOffAt)
  const [sectionKey, setSectionKey] = useState(reports[0]?.section.id ?? '')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setSectionKey(reports[0]?.section.id ?? '')
    setExpandedId(null)
  }, [c.id])

  useEffect(() => {
    const onFocusFinding = (ev: Event) => {
      const id = (ev as CustomEvent<{ id: string }>).detail?.id
      if (!id) return
      const report = reports.find((r) => r.findings.some((f) => f.id === id))
      if (report) setSectionKey(report.section.id)
      setExpandedId(id)
      window.requestAnimationFrame(() => {
        document.getElementById(`risk-item-${id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    }
    window.addEventListener('cuw-focus-risk-finding', onFocusFinding)
    return () => window.removeEventListener('cuw-focus-risk-finding', onFocusFinding)
  }, [reports])

  const selected = reports.find((r) => r.section.id === sectionKey) ?? reports[0]
  const findings = selected?.findings ?? []

  return (
    <div className="space-y-4">
      <details className="cuw-type-caption">
        <summary className="cursor-pointer font-semibold">Eligibility exclusions</summary>
        <p className="mt-1">{INELIGIBLE_ORGANIZATION_ACTIVITIES.join('; ')}</p>
      </details>

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
        <div className="cuw-panel">
          {documentsComplete ? null : (
            <p className="cuw-type-caption mb-3">
              Mark Documents Complete on Policy Documents to unlock this section.
            </p>
          )}

          {selected.fields.length ? (
            <ReviewQuestionGrid
              sectionId={selected.section.id}
              fields={selected.fields}
              showTriage={documentsComplete}
            />
          ) : (
            <p className="cuw-type-caption">No structured answers extracted for this section.</p>
          )}
        </div>
      ) : null}

      {documentsComplete && findings.length ? (
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
      <div className="wb-fin-signoff wb-fin-signoff--done rounded-lg px-3.5 py-3 text-sm">
        Financial sign off recorded · {money(existing!.limitUsd)} limit · SIR{' '}
        {money(existing!.sirUsd)} · Tier {existing!.pricingTier}
        {existing!.managerCosign ? ' · Manager approved' : ''}
      </div>
    )
  }

  return (
    <div className="wb-fin-signoff space-y-3 rounded-lg p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="wb-fin-signoff__title text-sm font-semibold">Financial sign off</p>
        <span
          className={`wb-fin-signoff__status text-xs font-semibold ${within ? 'wb-fin-signoff__status--ok' : 'wb-fin-signoff__status--warn'}`}
        >
          {within ? 'Within junior UW authority' : 'Over authority. Manager approval needed.'}
        </span>
      </div>
      <p className="wb-fin-signoff__hint text-xs">
        Confirm limit, SIR, and pricing tier before Quote (PAS-style delegated authority).
      </p>
      <div className="wb-q-grid">
        <label className="wb-q-cell text-xs font-medium">
          Aggregate limit (USD)
          <input
            type="number"
            className="wb-q-cell__input mt-1"
            value={limitUsd}
            disabled={locked}
            onChange={(e) => setLimitUsd(Number(e.target.value) || 0)}
          />
        </label>
        <label className="wb-q-cell text-xs font-medium">
          SIR / retention (USD)
          <input
            type="number"
            className="wb-q-cell__input mt-1"
            value={sirUsd}
            disabled={locked}
            onChange={(e) => setSirUsd(Number(e.target.value) || 0)}
          />
        </label>
        <label className="wb-q-cell text-xs font-medium">
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
        <label className="wb-q-cell text-xs font-medium">
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
          Signed {new Date(existing.signedOffAt).toLocaleString()}. Quote enabled.
        </p>
      ) : null}
    </div>
  )
}

function QuoteReadyCard({ c }: { c: CyberCase }) {
  const finOk = isFinancialSignOffComplete(c.financialSignOff)

  return (
    <div className="space-y-4">
      <FinancialSignOffPanel c={c} />

      {finOk ? (
        <p className="text-xs text-emerald-800">
          Financial authority recorded. Quote / Escalate / Decline are enabled in the bar above.
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          Record financial sign off, then lock Quote, Escalate, or Decline in the bar above.
        </p>
      )}

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
      <div>
        <p className="cuw-type-title">{title} (UW only)</p>
        <p className="cuw-type-caption mt-0.5">
          Ops owns Policy Documents. Risk Information, Risk Analysis, and Getting Ready to Quote stay with
          the underwriter.
        </p>
      </div>
    </div>
  )
}

function PolicyDocumentsStageBody({
  c,
  onRequestDocumentsComplete,
}: {
  c: CyberCase
  onRequestDocumentsComplete: () => void
}) {
  const missing = missingDocsForCase(c)
  const checklist = checklistStatusForCase(c)
  const runMockSignal = useCyberUwStore((s) => s.runMockSignal)
  const submitDiscussionReferral = useCyberUwStore((s) => s.submitDiscussionReferral)
  const setPackageDocKind = useCyberUwStore((s) => s.setPackageDocKind)
  const scanning = c.signalStatus === 'scanning'
  const [ingestReferDraft, setIngestReferDraft] = useState<DiscussionReferDraft | null>(null)
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({})
  const reports = sectionReportsForCase(c)
  const documentsComplete = Boolean(c.packageSignOff?.signedOffAt)
  const canComplete = missing.length === 0 && c.completenessPct >= 80 && !documentsComplete
  const period = policyPeriodForCase(c)

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
          { label: 'Proposed start date', value: formatPolicyDate(period.startIso), icon: CalendarRange },
          { label: 'Proposed end date', value: formatPolicyDate(period.endIso), icon: CalendarCheck2 },
          { label: 'Completeness', value: `${c.completenessPct}%`, icon: Percent },
          { label: 'Requested limit', value: money(c.limitRequestedUsd), icon: Landmark },
        ]}
      />

      <section>
        <h4 className="text-sm font-semibold text-slate-900">Required document checklist</h4>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {checklist.map((row) => (
            <li
              key={row.required}
              className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm ${
                row.present
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                  : 'border-amber-200 bg-amber-50/70 text-amber-950'
              }`}
            >
              <span
                className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  row.present ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}
                aria-hidden
              >
                {row.present ? '✓' : '!'}
              </span>
              <span className="font-medium text-inherit">{row.required}</span>
              <span
                className={`ml-auto text-[11px] font-semibold ${
                  row.present ? 'text-emerald-900' : 'text-amber-950'
                }`}
              >
                {row.present ? 'Present' : 'Missing'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-slate-900">Package documents</h4>
        {c.packageDocs.length ? (
          <div className="wb-pkg-table-wrap mt-2">
            <table className="wb-pkg-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type of doc</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {c.packageDocs.map((doc) => {
                  const kinds = PACKAGE_DOC_KINDS.includes(
                    doc.kind as (typeof PACKAGE_DOC_KINDS)[number],
                  )
                    ? PACKAGE_DOC_KINDS
                    : ([doc.kind, ...PACKAGE_DOC_KINDS] as readonly string[])
                  return (
                    <tr key={doc.id} id={`dossier-anchor-${doc.id}`}>
                      <td className="font-medium text-slate-900" title={doc.name}>
                        {doc.name}
                      </td>
                      <td>
                        <select
                          className="wb-q-cell__input"
                          value={doc.kind}
                          aria-label={`Type of ${doc.name}`}
                          onChange={(e) => setPackageDocKind(c.id, doc.id, e.target.value)}
                        >
                          {kinds.map((kind) => (
                            <option key={kind} value={kind}>
                              {kind}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="wb-pkg-view"
                          onClick={() => openPackageDocument(doc)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No documents attached.</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {documentsComplete ? (
            <p className="text-xs font-medium text-emerald-800">
              Documents complete
              {c.packageSignOff?.signedOffBy ? ` · ${c.packageSignOff.signedOffBy}` : ''}
              {c.packageSignOff?.signedOffAt
                ? ` · ${formatPolicyDate(c.packageSignOff.signedOffAt)}`
                : ''}
            </p>
          ) : (
            <Button
              size="sm"
              variant="primary"
              isDisabled={!canComplete}
              onPress={onRequestDocumentsComplete}
            >
              Documents Complete
            </Button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">Extracted fields</h4>
        {reports.map((report) => {
          const editing = Boolean(editingSections[report.section.id])
          return (
            <div key={report.section.id} className="wb-qual-bucket">
              <div className="wb-qual-bucket__head">
                <h5 className="text-sm font-semibold text-slate-900">{report.section.title}</h5>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500">Q{report.section.questions}</span>
                  <button
                    type="button"
                    className="wb-q-pen"
                    aria-pressed={editing}
                    aria-label={editing ? `Lock ${report.section.title}` : `Edit ${report.section.title}`}
                    onClick={() =>
                      setEditingSections((cur) => ({
                        ...cur,
                        [report.section.id]: !cur[report.section.id],
                      }))
                    }
                  >
                    {editing ? <PencilOff size={14} /> : <Pencil size={14} />}
                  </button>
                </div>
              </div>
              <div className="p-3">
                <IngestQuestionGrid
                  caseId={c.id}
                  sectionId={report.section.id}
                  fields={report.fields}
                  editing={editing}
                />
              </div>
            </div>
          )
        })}
      </section>

      {missing.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Missing documents
          </p>
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
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <p className="text-sm text-slate-700">
            Package is incomplete ({c.completenessPct}%). Run ingest again or escalate the chase to
            the broker.
          </p>
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
  const [citeOpen, setCiteOpen] = useState(false)
  const [citeSource, setCiteSource] = useState<RiskEvidenceCiteSource>('market')

  const marketRows: RiskEvidenceCiteRow[] = securityRatingForCase(c).citeBacks.map((row) => ({
    id: row.id,
    label: row.bucketLabel,
    finding: row.finding,
  }))

  const exposure = carrierExposureForCase(c)
  const capacityRows: RiskEvidenceCiteRow[] = [
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

  const openCites = (source: RiskEvidenceCiteSource) => {
    setCiteSource(source)
    setCiteOpen(true)
  }

  return (
    <div className="wb-risk-evidence space-y-3">
      <div className="wb-risk-evidence__split">
        <div className="wb-risk-evidence__market">
          <SecurityRatingPanel c={c} onOpenCites={() => openCites('market')} />
        </div>
        <div className="wb-risk-evidence__capacity">
          <RiskVizPanel
            c={c}
            activeThreatId={null}
            onSelectThreat={() => {}}
            onOpenCites={() => openCites('capacity')}
          />
        </div>
      </div>
      <RiskEvidenceCitePanel
        open={citeOpen}
        onClose={() => setCiteOpen(false)}
        source={citeSource}
        rows={citeSource === 'market' ? marketRows : capacityRows}
      />
    </div>
  )
}

function WorkflowTab({
  c,
  onRequestDocumentsComplete,
}: {
  c: CyberCase
  onRequestDocumentsComplete: () => void
}) {
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
    <div className="space-y-4 pb-8">
      <div>
        {isOps ? (
          <p className="text-xs text-slate-600">
            Ops view: Policy Documents only. Use Ready for UW when the package is complete.
          </p>
        ) : null}
        {c.opsHandoffAt && !isOps ? (
          <p className="mt-1 text-xs font-medium text-emerald-800">
            Ops handed off {new Date(c.opsHandoffAt).toLocaleString()}
          </p>
        ) : null}
      </div>

      <StageSection
        title={CYBER_FLOW_STAGES[0].title}
        icon={FileStack}
        stageIndex={0}
        currentIndex={idx}
        stayOpen
        forceExpand={Boolean(dossierFocusId)}
      >
        <PolicyDocumentsStageBody c={c} onRequestDocumentsComplete={onRequestDocumentsComplete} />
      </StageSection>

      {isOps ? (
        <>
          <StageSection title={CYBER_FLOW_STAGES[1].title} icon={ClipboardCheck} stageIndex={1} currentIndex={idx}>
            <UwLockedStage title="Risk Information" />
          </StageSection>
          <StageSection title={CYBER_FLOW_STAGES[2].title} icon={ShieldCheck} stageIndex={2} currentIndex={idx}>
            <UwLockedStage title="Risk Analysis" />
          </StageSection>
          <StageSection title={CYBER_FLOW_STAGES[3].title} icon={CircleDollarSign} stageIndex={3} currentIndex={idx}>
            <UwLockedStage title="Getting Ready to Quote" />
          </StageSection>
        </>
      ) : (
        <>
          <StageSection title={CYBER_FLOW_STAGES[1].title} icon={ClipboardCheck} stageIndex={1} currentIndex={idx}>
            <RiskInformationStageBody c={c} />
          </StageSection>
          <StageSection title={CYBER_FLOW_STAGES[2].title} icon={ShieldCheck} stageIndex={2} currentIndex={idx}>
            <RiskAnalysisStageBody c={c} />
          </StageSection>
          <StageSection title={CYBER_FLOW_STAGES[3].title} icon={CircleDollarSign} stageIndex={3} currentIndex={idx}>
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
    signOffPackage,
    dismissCustomer360,
    showCustomer360,
  } = useCyberUwStore()
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)
  const [docsCompleteOpen, setDocsCompleteOpen] = useState(false)
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

  const onWorkflow = c.customer360Dismissed === true
  const scrollRootRef = useRef<HTMLDivElement>(null)

  return (
    <div className="cuw-case-shell flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="cuw-case-view-tabs shrink-0 px-3 pt-2 md:px-4"
          role="tablist"
          aria-label="Case view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!onWorkflow}
            className={`cuw-case-view-tabs__tab${!onWorkflow ? ' cuw-case-view-tabs__tab--active' : ''}`}
            onClick={() => showCustomer360(c.id)}
          >
            Customer 360
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={onWorkflow}
            className={`cuw-case-view-tabs__tab${onWorkflow ? ' cuw-case-view-tabs__tab--active' : ''}`}
            onClick={() => dismissCustomer360(c.id)}
          >
            Proceed to Closure
          </button>
        </div>

        {onWorkflow ? (
          <div className="wb-cyber-journey-rail shrink-0 border-b border-slate-200/80 px-3 py-2 md:px-4">
            <div className="wb-cyber-journey-rail__shell">
              <div className="wb-cyber-journey-rail__stepper min-w-0 flex-1">
                <CyberProgressStepper c={c} />
              </div>
            </div>
          </div>
        ) : null}

        <div className="cuw-case-workflow-pane min-h-0 flex-1">
          <div
            ref={scrollRootRef}
            className="case-drawer-surface cuw-case-shell__pane case-drawer-surface--float-pad min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5"
          >
            {!onWorkflow ? (
              <Customer360Panel c={c} />
            ) : (
              <WorkflowTab c={c} onRequestDocumentsComplete={() => setDocsCompleteOpen(true)} />
            )}
          </div>

          <FloatingWorkflowBar
            c={c}
            surface={onWorkflow ? 'workflow' : 'c360'}
            scrollRootRef={scrollRootRef}
            onRequestDecision={(d) => setPendingDecision(d)}
            onSignal={() => runMockSignal(c.id)}
            onRequestDocumentsComplete={() => setDocsCompleteOpen(true)}
          />
        </div>
      </div>

      <DocumentsCompleteModal
        caseItem={c}
        open={docsCompleteOpen}
        onCancel={() => setDocsCompleteOpen(false)}
        onConfirm={() => {
          signOffPackage(c.id)
          setDocsCompleteOpen(false)
        }}
      />
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
