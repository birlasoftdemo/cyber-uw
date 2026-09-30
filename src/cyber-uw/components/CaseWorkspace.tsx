import { Accordion, Button, Typography } from '@heroui/react'
import {
  CalendarCheck2,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  AlertCircle,
  Check,
  FileStack,
  FileText,
  Landmark,
  Layers,
  Lock,
  Network,
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
  triageFindingsForCase,
  questionFieldMatchers,
  APP_SECTIONS,
  type SectionField,
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
import type { CyberCase, RiskJudgmentStatus } from '../types'
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
} from './QuestionFields'
import {
  DiscussionReferModal,
  type DiscussionReferDraft,
} from './DiscussionReferModal'
import { parseMoneyish, formatCompactMoney, type ValueCompareStatus } from './ValueCompareCard'

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

function sectionTabLabel(sectionId: string): string {
  return APP_SECTIONS.find((s) => s.id === sectionId)?.tabLabel ?? sectionId
}

const SEVERITY_RANK: Record<TriageFinding['severity'], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

type QueueFilter = 'all' | 'required' | 'suggested'

const SOURCE_FIELD_CAP = 8

function sourceFieldsForFinding(
  finding: TriageFinding,
  reports: ReturnType<typeof riskSectionReportsForCase>,
): SectionField[] {
  const report = reports.find((r) => r.section.id === finding.sourceSectionId)
  if (!report?.fields.length) return []
  const matchers = questionFieldMatchers(finding.questionRef)
  const matched = report.fields.filter((f) =>
    matchers.some((m) => f.label.toLowerCase().startsWith(m.toLowerCase())),
  )
  if (matched.length) return matched
  return report.fields.slice(0, SOURCE_FIELD_CAP)
}

function riskBannerTitle(status: ValueCompareStatus): string {
  if (status === 'meets') return 'Meets requirement'
  if (status === 'below') return 'Does not meet requirement'
  return 'Needs review'
}

function TriageFindingCard({
  caseId,
  finding,
  status,
  expanded,
  onToggle,
  sectionLabel,
  sourceFields,
  sourceOpen,
  onViewSource,
}: {
  caseId: string
  finding: TriageFinding
  status: RiskJudgmentStatus | undefined
  expanded: boolean
  onToggle: () => void
  sectionLabel?: string
  sourceFields?: SectionField[]
  sourceOpen?: boolean
  onViewSource?: () => void
}) {
  const signRiskItem = useCyberUwStore((s) => s.signRiskItem)
  const answersRef = useRef<HTMLDivElement | null>(null)
  const signed = status && status !== 'pending'

  const compareStatus: ValueCompareStatus =
    finding.suggested === 'approve'
      ? 'meets'
      : finding.suggested === 'escalate' || finding.severity === 'high'
        ? 'below'
        : 'watch'

  const extractedMoney =
    parseMoneyish(finding.attested) ?? parseMoneyish(finding.detected)
  const receivedValue = finding.attested
  const permittedValue =
    extractedMoney != null
      ? formatCompactMoney(extractedMoney)
      : finding.required
        ? `Required · ${finding.chartLabel}`
        : `Policy band · ${finding.chartLabel}`

  const approvePrimary = finding.suggested === 'approve'

  useEffect(() => {
    if (!sourceOpen || !answersRef.current) return
    const cells = answersRef.current.querySelectorAll('.wb-risk-card__answer')
    cells.forEach((el) => {
      el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2')
    })
    const t = window.setTimeout(() => {
      cells.forEach((el) => {
        el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2')
      })
    }, 2200)
    return () => window.clearTimeout(t)
  }, [sourceOpen, finding.id])

  return (
    <li
      id={`risk-item-${finding.id}`}
      className={`wb-risk-card wb-risk-card--${compareStatus}${expanded ? ' wb-risk-card--open' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="wb-risk-card__head"
      >
        <span className="wb-risk-card__icon" aria-hidden>
          {finding.required ? (
            <ShieldAlert size={16} strokeWidth={1.75} />
          ) : (
            <Scale size={16} strokeWidth={1.75} />
          )}
        </span>
        <div className="wb-risk-card__identity">
          <p className="wb-risk-card__eyebrow">Policy check</p>
          <p className="wb-risk-card__title">{finding.title}</p>
          {finding.questionRef ? (
            <p className="wb-risk-card__qref">
              Question <span>{finding.questionRef}</span>
            </p>
          ) : null}
          {!expanded ? (
            <p className="wb-risk-card__summary">{finding.summary}</p>
          ) : null}
        </div>
        <div className="wb-risk-card__chips">
          {sectionLabel ? (
            <span className="wb-risk-card__chip wb-risk-card__chip--section">
              <Network size={12} strokeWidth={2} aria-hidden />
              {sectionLabel}
            </span>
          ) : null}
          <span className={`wb-gap-severity wb-gap-severity--${finding.severity}`}>
            {finding.severity}
          </span>
          {signed ? (
            <span className="wb-risk-card__chip wb-risk-card__chip--signed">
              {judgmentLabel(status)}
            </span>
          ) : null}
          <ChevronDown
            size={14}
            className={`wb-risk-card__chevron${expanded ? ' wb-risk-card__chevron--open' : ''}`}
            aria-hidden
          />
        </div>
      </button>

      {expanded ? (
        <div className="wb-risk-card__body">
          <p className="wb-risk-card__summary wb-risk-card__summary--body">{finding.summary}</p>

          <div className="wb-risk-card__panes" role="group" aria-label="Received versus permitted">
            <div className="wb-risk-card__pane">
              <div className="wb-risk-card__pane-meta">
                <FileText size={14} strokeWidth={1.75} aria-hidden />
                <span>Received</span>
              </div>
              <p className="wb-risk-card__pane-value">{receivedValue}</p>
            </div>
            <div
              className={`wb-risk-card__eq wb-risk-card__eq--${compareStatus}`}
              aria-hidden
            >
              {compareStatus === 'meets' ? '=' : '≠'}
            </div>
            <div className="wb-risk-card__pane">
              <div className="wb-risk-card__pane-meta">
                <Layers size={14} strokeWidth={1.75} aria-hidden />
                <span>Permitted</span>
              </div>
              <p className="wb-risk-card__pane-value">{permittedValue}</p>
            </div>
          </div>

          <div className={`wb-risk-card__banner wb-risk-card__banner--${compareStatus}`}>
            <span className="wb-risk-card__banner-icon" aria-hidden>
              {compareStatus === 'meets' ? (
                <Check size={14} strokeWidth={2.25} />
              ) : (
                <AlertCircle size={14} strokeWidth={2} />
              )}
            </span>
            <div>
              <p className="wb-risk-card__banner-title">{riskBannerTitle(compareStatus)}</p>
              <p className="wb-risk-card__banner-detail">{finding.summary}</p>
            </div>
          </div>

          {onViewSource ? (
            <div className="wb-risk-card__source-row">
              <button type="button" className="wb-risk-card__source" onClick={onViewSource}>
                <FileText size={14} strokeWidth={1.75} aria-hidden />
                View source
                <ChevronRight size={14} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          ) : null}

          {sourceOpen ? (
            <div className="wb-risk-card__answers" ref={answersRef}>
              <p className="wb-risk-card__answers-title">Application answers</p>
              {sourceFields && sourceFields.length ? (
                <ul className="wb-risk-card__answers-list">
                  {sourceFields.map((f) => (
                    <li key={f.key ?? f.label} className="wb-risk-card__answer">
                      <span className="wb-risk-card__answer-label">{f.label}</span>
                      <span className="wb-risk-card__answer-value">{f.value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="wb-risk-card__answers-empty">
                  No structured answers for this check.
                </p>
              )}
            </div>
          ) : null}

          {!signed ? (
            <div className="wb-risk-card__actions">
              <Button
                size="sm"
                variant={approvePrimary ? 'primary' : 'secondary'}
                onPress={() => signRiskItem(caseId, finding.id, 'accepted')}
              >
                Approve
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
    </li>
  )
}

function RiskInformationStageBody({ c }: { c: CyberCase }) {
  const reports = riskSectionReportsForCase(c)
  const documentsComplete = Boolean(c.packageSignOff?.signedOffAt)
  const signRiskItems = useCyberUwStore((s) => s.signRiskItems)
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showSourceForId, setShowSourceForId] = useState<string | null>(null)

  useEffect(() => {
    setQueueFilter('all')
    setExpandedId(null)
    setShowSourceForId(null)
  }, [c.id])

  useEffect(() => {
    const onFocusFinding = (ev: Event) => {
      const id = (ev as CustomEvent<{ id: string }>).detail?.id
      if (!id) return
      setQueueFilter('all')
      setExpandedId(id)
      setShowSourceForId(null)
      window.requestAnimationFrame(() => {
        document.getElementById(`risk-item-${id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    }
    window.addEventListener('cuw-focus-risk-finding', onFocusFinding)
    return () => window.removeEventListener('cuw-focus-risk-finding', onFocusFinding)
  }, [])

  const pendingFindings = triageFindingsForCase(c)
    .filter((f) => {
      const j = c.riskJudgments?.[f.id]
      return !j || j.status === 'pending'
    })
    .sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1
      const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
      if (sev !== 0) return sev
      return a.sourceSectionId.localeCompare(b.sourceSectionId)
    })

  const filteredQueue = pendingFindings.filter((f) => {
    if (queueFilter === 'required') return f.required
    if (queueFilter === 'suggested') return f.suggested === 'approve'
    return true
  })

  const suggestedApproveIds = pendingFindings
    .filter((f) => f.suggested === 'approve')
    .map((f) => f.id)

  const toggleSource = (findingId: string) => {
    setShowSourceForId((cur) => (cur === findingId ? null : findingId))
    setExpandedId(findingId)
  }

  return (
    <div className="wb-risk-review space-y-4">
      <details className="cuw-type-caption">
        <summary className="cursor-pointer font-semibold">Eligibility exclusions</summary>
        <p className="mt-1">{INELIGIBLE_ORGANIZATION_ACTIVITIES.join('; ')}</p>
      </details>

      {!documentsComplete ? (
        <div className="wb-risk-review__locked">
          <p className="cuw-type-body font-semibold text-slate-800">
            Risk review locked
          </p>
          <p className="cuw-type-caption mt-1 text-slate-500">
            Mark Documents Complete on Policy Documents to unlock the open risks queue.
          </p>
        </div>
      ) : (
        <div className="wb-risk-review__panel">
          <div className="wb-risk-review__toolbar">
            <div className="wb-risk-review__heading">
              <p className="wb-risk-review__title">Open risks</p>
              <span className="wb-risk-review__count">{pendingFindings.length} open</span>
            </div>
            <div className="wb-risk-review__filters">
              <Button
                size="sm"
                variant={queueFilter === 'all' ? 'primary' : 'secondary'}
                onPress={() => setQueueFilter('all')}
              >
                All pending
              </Button>
              <Button
                size="sm"
                variant={queueFilter === 'required' ? 'primary' : 'secondary'}
                onPress={() => setQueueFilter('required')}
              >
                Required only
              </Button>
              <Button
                size="sm"
                variant={queueFilter === 'suggested' ? 'primary' : 'secondary'}
                onPress={() => setQueueFilter('suggested')}
              >
                Suggested approve
              </Button>
              <Button
                size="sm"
                variant="primary"
                isDisabled={suggestedApproveIds.length === 0}
                onPress={() => signRiskItems(c.id, suggestedApproveIds, 'accepted')}
                className="wb-risk-review__bulk"
              >
                Approve all suggested
                {suggestedApproveIds.length ? ` (${suggestedApproveIds.length})` : ''}
              </Button>
            </div>
          </div>

          {filteredQueue.length ? (
            <ul className="wb-risk-review__list space-y-2">
              {filteredQueue.map((finding) => (
                <TriageFindingCard
                  key={finding.id}
                  caseId={c.id}
                  finding={finding}
                  status={c.riskJudgments[finding.id]?.status}
                  expanded={expandedId === finding.id}
                  onToggle={() => {
                    setExpandedId((cur) => {
                      const next = cur === finding.id ? null : finding.id
                      if (next !== finding.id) setShowSourceForId(null)
                      return next
                    })
                  }}
                  sectionLabel={sectionTabLabel(finding.sourceSectionId)}
                  sourceFields={sourceFieldsForFinding(finding, reports)}
                  sourceOpen={showSourceForId === finding.id}
                  onViewSource={() => toggleSource(finding.id)}
                />
              ))}
            </ul>
          ) : pendingFindings.length === 0 ? (
            <div className="wb-open-risks-empty px-4 py-8 text-center">
              <p className="cuw-type-body font-semibold text-slate-800">
                Open risks queue is clear
              </p>
              <p className="cuw-type-caption mt-1 text-slate-500">
                Required findings are dispositioned. Continue when ready.
              </p>
            </div>
          ) : (
            <div className="wb-open-risks-empty px-4 py-6 text-center">
              <p className="cuw-type-caption text-slate-500">
                No findings match this filter.
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onPress={() => setQueueFilter('all')}
              >
                Clear filter
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


function policyAdminSignOffStatus(c: CyberCase): string {
  if (c.pasStatus === 'synced') return 'Synced to PAS'
  if (isFinancialSignOffComplete(c.financialSignOff) && c.decision === 'pending') {
    return 'Ready for policy admin'
  }
  if (isFinancialSignOffComplete(c.financialSignOff) && c.decision !== 'pending') {
    return 'Ready for policy admin'
  }
  return 'Pending financial sign-off'
}

function FinancialSignOffPanel({ c }: { c: CyberCase }) {
  const saveFinancialSignOff = useCyberUwStore((s) => s.saveFinancialSignOff)
  const existing = c.financialSignOff
  const [limitUsd, setLimitUsd] = useState(existing?.limitUsd ?? c.limitRequestedUsd)
  const [sirUsd, setSirUsd] = useState(existing?.sirUsd ?? 100_000)
  const [stubPremiumUsd, setStubPremiumUsd] = useState(
    existing?.stubPremiumUsd ?? Math.round(c.limitRequestedUsd * 0.012),
  )
  const [managerCosign, setManagerCosign] = useState(existing?.managerCosign ?? false)
  const [cosignReason, setCosignReason] = useState(existing?.cosignReason ?? '')

  const criticalOpen = c.gaps.filter(
    (g) => g.severity === 'critical' && g.disposition === 'open',
  ).length
  const pricingTier = c.tier
  const within = isWithinJuniorAuthority(limitUsd, pricingTier)
  const needsCosign = needsManagerCosign({
    limitUsd,
    pricingTier,
    criticalOpenGaps: criticalOpen,
  })
  const locked = Boolean(existing?.signedOffAt) && c.decision !== 'pending'
  const pasStatusLabel = policyAdminSignOffStatus(c)

  if (isFinancialSignOffComplete(existing) && c.decision !== 'pending') {
    return (
      <div className="wb-fin-signoff space-y-3 rounded-lg p-3.5">
        <p className="wb-fin-signoff__title text-sm font-semibold">Financial sign off</p>
        <QuestionMetaGrid
          items={[
            { label: 'Aggregate limit', value: money(existing!.limitUsd), icon: Landmark },
            { label: 'SIR / retention', value: money(existing!.sirUsd), icon: CircleDollarSign },
            {
              label: 'Stub premium',
              value: money(
                existing!.stubPremiumUsd ?? Math.round(existing!.limitUsd * 0.012),
              ),
              icon: CircleDollarSign,
            },
            { label: 'Policy Admin Sign-off', value: pasStatusLabel, icon: ClipboardCheck },
          ]}
        />
        {existing!.managerCosign ? (
          <p className="text-xs text-emerald-800">Manager approved</p>
        ) : null}
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
        Confirm aggregate limit, SIR, and stub premium before Quote (PAS-style delegated authority).
      </p>
      <div className="wb-q-grid wb-q-grid--meta">
        <label className="wb-q-cell">
          <span className="wb-q-cell__glyph" aria-hidden>
            <Landmark size={15} strokeWidth={1.75} />
          </span>
          <span className="wb-q-cell__label">Aggregate limit</span>
          <input
            type="number"
            className="wb-q-cell__input mt-0.5"
            value={limitUsd}
            disabled={locked}
            aria-label="Aggregate limit (USD)"
            onChange={(e) => setLimitUsd(Number(e.target.value) || 0)}
          />
        </label>
        <label className="wb-q-cell">
          <span className="wb-q-cell__glyph" aria-hidden>
            <CircleDollarSign size={15} strokeWidth={1.75} />
          </span>
          <span className="wb-q-cell__label">SIR / retention</span>
          <input
            type="number"
            className="wb-q-cell__input mt-0.5"
            value={sirUsd}
            disabled={locked}
            aria-label="SIR / retention (USD)"
            onChange={(e) => setSirUsd(Number(e.target.value) || 0)}
          />
        </label>
        <label className="wb-q-cell">
          <span className="wb-q-cell__glyph" aria-hidden>
            <CircleDollarSign size={15} strokeWidth={1.75} />
          </span>
          <span className="wb-q-cell__label">Stub premium</span>
          <input
            type="number"
            className="wb-q-cell__input mt-0.5"
            value={stubPremiumUsd}
            disabled={locked}
            aria-label="Stub premium (USD)"
            onChange={(e) => setStubPremiumUsd(Number(e.target.value) || 0)}
          />
        </label>
        <div className="wb-q-cell">
          <span className="wb-q-cell__glyph" aria-hidden>
            <ClipboardCheck size={15} strokeWidth={1.75} />
          </span>
          <p className="wb-q-cell__label">Policy Admin Sign-off</p>
          <p className="wb-q-cell__value">{pasStatusLabel}</p>
        </div>
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
        <Accordion
          allowsMultipleExpanded
          defaultExpandedKeys={[]}
          hideSeparator
          className="wb-extract-accordion w-full"
        >
          {reports.map((report) => {
            const editing = Boolean(editingSections[report.section.id])
            const fieldCount = report.fields.length
            return (
              <Accordion.Item
                key={report.section.id}
                id={report.section.id}
                className="wb-extract-accordion__item"
              >
                <Accordion.Heading className="wb-extract-accordion__heading">
                  <div className="wb-extract-accordion__head">
                    <Accordion.Trigger className="wb-extract-accordion__trigger">
                      <Accordion.Indicator className="wb-extract-accordion__indicator">
                        <ChevronDown size={16} strokeWidth={2} />
                      </Accordion.Indicator>
                      <span className="wb-extract-accordion__title-wrap">
                        <span className="wb-extract-accordion__title">{report.section.title}</span>
                        <span className="wb-extract-accordion__sub">
                          {fieldCount} {fieldCount === 1 ? 'field' : 'fields'} · Q
                          {report.section.questions}
                        </span>
                      </span>
                    </Accordion.Trigger>
                    <button
                      type="button"
                      className="wb-q-pen"
                      aria-pressed={editing}
                      aria-label={
                        editing ? `Lock ${report.section.title}` : `Edit ${report.section.title}`
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingSections((cur) => ({
                          ...cur,
                          [report.section.id]: !cur[report.section.id],
                        }))
                      }}
                    >
                      {editing ? <PencilOff size={14} /> : <Pencil size={14} />}
                    </button>
                  </div>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="wb-extract-accordion__body">
                    <IngestQuestionGrid
                      caseId={c.id}
                      sectionId={report.section.id}
                      fields={report.fields}
                      editing={editing}
                    />
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            )
          })}
        </Accordion>
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

export function CaseWorkspace() {
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
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const c = cases.find((x) => x.id === selectedId)
  const caseId = c?.id

  useEffect(() => {
    if (listDecisionPrompt) {
      setPendingDecision(listDecisionPrompt)
    }
  }, [listDecisionPrompt, selectedId])

  // Sync Insights / Submission Workbench tabs with continuous scroll position.
  useEffect(() => {
    if (!caseId) return
    const root = scrollRootRef.current
    const workbench = document.getElementById('cuw-workbench-root')
    if (!root || !workbench) return

    let ticking = false
    const syncFromScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        ticking = false
        const rootRect = root.getBoundingClientRect()
        const wbRect = workbench.getBoundingClientRect()
        const mid = rootRect.top + rootRect.height * 0.35
        const inWorkbench = wbRect.top <= mid
        const dismissed =
          useCyberUwStore.getState().cases.find((x) => x.id === caseId)?.customer360Dismissed ===
          true
        if (inWorkbench && !dismissed) dismissCustomer360(caseId)
        else if (!inWorkbench && dismissed) showCustomer360(caseId)
      })
    }

    root.addEventListener('scroll', syncFromScroll, { passive: true })
    const dismissedOnOpen =
      useCyberUwStore.getState().cases.find((x) => x.id === caseId)?.customer360Dismissed === true
    if (dismissedOnOpen) {
      workbench.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    syncFromScroll()
    return () => root.removeEventListener('scroll', syncFromScroll)
  }, [caseId, dismissCustomer360, showCustomer360])

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

  const scrollToInsights = () => {
    showCustomer360(c.id)
    document.getElementById('cuw-c360-root')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const scrollToWorkbench = () => {
    dismissCustomer360(c.id)
    document.getElementById('cuw-workbench-root')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

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
            onClick={scrollToInsights}
          >
            Birlasoft Customer Insights
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={onWorkflow}
            className={`cuw-case-view-tabs__tab${onWorkflow ? ' cuw-case-view-tabs__tab--active' : ''}`}
            onClick={scrollToWorkbench}
          >
            Submission Workbench
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
            <Customer360Panel c={c} />
            <div
              id="cuw-workbench-root"
              className="cuw-workbench-section mt-8 scroll-mt-4 border-t border-slate-200/80 pt-8"
            >
              <WorkflowTab c={c} onRequestDocumentsComplete={() => setDocsCompleteOpen(true)} />
            </div>
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
