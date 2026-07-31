import { Button, Chip, Tabs, Typography } from '@heroui/react'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { AiBadge } from '../../shared/workbench/AiBadge'
import {
  CYBER_FLOW_STAGES,
  canLeaveReviewPlatform,
  canLeaveReviewRisk,
  cyberFlowIndex,
} from '../constants/cyberFlow'
import { GAP_REFER_ASSIGNEES } from '../constants/gapReferAssignees'
import {
  QUALIFICATION_BUCKETS,
  bucketLabel,
  type QualificationBucketId,
} from '../constants/qualificationBuckets'
import {
  platformOutcomeFromCards,
  platformOutcomeLabel,
} from '../data/platformDemo'
import { moduleLabel } from '../data/dossierPackage'
import {
  exposureChipColor,
  judgmentChipColor,
  requiredRiskItemIds,
  riskReviewForCase,
  type RiskActionItem,
} from '../data/riskReviewDemo'
import { useCyberUwStore } from '../store/cyberUwStore'
import type {
  ControlGap,
  CyberCase,
  PlatformCard,
  PlatformSignOff,
  RiskJudgmentStatus,
} from '../types'
import { isOpenMaterialGap, openMaterialGaps } from '../utils/gapDisposition'
import {
  CaseMetaChips,
  gapChipColor,
  money,
  TierBadge,
  UwDecisionChip,
} from './CyberPrimitives'
import {
  CyberProgressStepper,
  CyberStageAdvanceCard,
} from './CyberWorkbenchDesk'
import { DecisionConfirmModal, type PendingDecision } from './DecisionConfirmModal'

function StageSection({
  title,
  stageIndex,
  currentIndex,
  children,
}: {
  title: string
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

  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null)
  useEffect(() => {
    setExpandedOverride(null)
  }, [isPast, isCurrent, stageIndex])
  const expanded = expandedOverride ?? !isPast

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
        {isCurrent && <span className="wb-stepper-badge--current">Current stage</span>}
        {isPast && (
          <Chip size="sm" variant="soft" color="success">
            Complete
          </Chip>
        )}
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

function GapInlineActions({ caseId, gap }: { caseId: string; gap: ControlGap }) {
  const resolveGap = useCyberUwStore((s) => s.resolveGap)
  const referGap = useCyberUwStore((s) => s.referGap)
  const [referring, setReferring] = useState(false)
  const [assignee, setAssignee] = useState<(typeof GAP_REFER_ASSIGNEES)[number]['label']>(
    GAP_REFER_ASSIGNEES[0].label,
  )

  if (gap.disposition !== 'open') {
    return (
      <Chip size="sm" variant="soft" color={gap.disposition === 'resolved' ? 'success' : 'warning'}>
        {gap.disposition === 'resolved' ? 'Resolved' : `Referred · ${gap.referredTo ?? ''}`}
      </Chip>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:flex-wrap sm:items-end">
      <Button size="sm" variant="primary" onPress={() => resolveGap(caseId, gap.id)}>
        Resolve
      </Button>
      {referring ? (
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Refer to
            <select
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
              value={assignee}
              onChange={(e) =>
                setAssignee(e.target.value as (typeof GAP_REFER_ASSIGNEES)[number]['label'])
              }
            >
              {GAP_REFER_ASSIGNEES.map((a) => (
                <option key={a.id} value={a.label}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onPress={() => {
                referGap(caseId, gap.id, assignee)
                setReferring(false)
              }}
            >
              Confirm refer
            </Button>
            <Button size="sm" variant="ghost" onPress={() => setReferring(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            setAssignee(GAP_REFER_ASSIGNEES[0].label)
            setReferring(true)
          }}
        >
          Refer
        </Button>
      )}
    </div>
  )
}

/** Feedback — gaps by qualification bucket; Resolve / Refer inline. */
function FeedbackStageBody({ c }: { c: CyberCase }) {
  const materialOpen = openMaterialGaps(c.gaps)
  const hasOpen = materialOpen.length > 0
  const [expandedBuckets, setExpandedBuckets] = useState<Record<string, boolean>>({})

  const byBucket = QUALIFICATION_BUCKETS.map((b) => {
    const all = c.gaps.filter((g) => g.qualificationBucket === b.id)
    const materialInBucket = all.filter(isOpenMaterialGap)
    const cleared = all.filter((g) => g.disposition !== 'open')
    return {
      bucket: b,
      all,
      openMaterial: materialInBucket,
      pendingPreview: materialInBucket.slice(0, 2),
      cleared,
      restOpen: materialInBucket.slice(2),
    }
  }).filter((row) => row.all.length > 0)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <Chip size="sm" variant="soft" color={hasOpen ? 'danger' : 'success'}>
          {hasOpen
            ? `${materialOpen.length} open material gap${materialOpen.length === 1 ? '' : 's'}`
            : 'No open material gaps'}
        </Chip>
      </div>

      {byBucket.map(({ bucket, openMaterial, pendingPreview, cleared, restOpen }) => {
        const expanded = expandedBuckets[bucket.id] ?? false
        const showRest = expanded ? restOpen : []
        const pendingShown = [...pendingPreview, ...showRest]
        const met = cleared.length + (openMaterial.length === 0 ? c.gaps.filter((g) => g.qualificationBucket === bucket.id && g.disposition === 'open' && !isOpenMaterialGap(g)).length : 0)

        return (
          <div key={bucket.id} className="wb-qual-bucket">
            <div className="wb-qual-bucket__head">
              <h4 className="text-sm font-semibold text-slate-900">{bucket.label}</h4>
              <div className="flex flex-wrap gap-1.5">
                {openMaterial.length ? (
                  <Chip size="sm" variant="soft" color="danger">
                    {openMaterial.length} pending
                  </Chip>
                ) : (
                  <Chip size="sm" variant="soft" color="success">
                    Clear
                  </Chip>
                )}
                {met > 0 && openMaterial.length === 0 ? (
                  <Chip size="sm" variant="soft" color="success">
                    {cleared.length || 'Signed'} cleared
                  </Chip>
                ) : null}
              </div>
            </div>

            {pendingShown.length ? (
              <ul className="wb-qual-bucket__list">
                {pendingShown.map((g) => (
                  <li key={g.id} className="wb-qual-row">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip size="sm" variant="soft" color={gapChipColor(g.severity)} className="capitalize">
                        {g.severity}
                      </Chip>
                      <span className="text-sm font-semibold text-slate-900">{g.control}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-700">
                      Attested “{g.attested}” vs signal “{g.signal}”
                    </p>
                    {g.rfiDraft ? (
                      <p className="mt-1 text-xs text-slate-500">{g.rfiDraft}</p>
                    ) : null}
                    <GapInlineActions caseId={c.id} gap={g} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3.5 py-2.5 text-sm text-emerald-900">
                All cleared in this bucket — attestation and signal aligned for material controls.
              </p>
            )}

            {restOpen.length > 0 ? (
              <button
                type="button"
                className="wb-qual-bucket__more"
                onClick={() =>
                  setExpandedBuckets((s) => ({ ...s, [bucket.id]: !expanded }))
                }
              >
                {expanded ? 'Show fewer' : `Show ${restOpen.length} more in this bucket`}
              </button>
            ) : null}

            {cleared.length > 0 && openMaterial.length > 0 ? (
              <p className="border-t border-slate-100 px-3.5 py-2 text-xs text-slate-500">
                {cleared.length} previously signed in this bucket
              </p>
            ) : null}
          </div>
        )
      })}

      {!hasOpen ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3.5 py-3 text-sm text-emerald-950">
          Feedback complete — continue to Review Risk when ready.
        </p>
      ) : null}
    </div>
  )
}

function RiskItemCard({
  caseId,
  item,
  status,
}: {
  caseId: string
  item: RiskActionItem
  status: RiskJudgmentStatus | undefined
}) {
  const signRiskItem = useCyberUwStore((s) => s.signRiskItem)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const signed = status && status !== 'pending'

  return (
    <li className="wb-risk-item">
      <div className="flex flex-wrap items-center gap-2">
        <Chip size="sm" variant="soft" color="accent">
          {bucketLabel(item.bucket)}
        </Chip>
        <Chip
          size="sm"
          variant="soft"
          color={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'success'}
          className="capitalize"
        >
          {item.severity}
        </Chip>
        {item.required ? (
          <Chip size="sm" variant="soft" color="warning">
            Required
          </Chip>
        ) : null}
        {signed ? (
          <Chip size="sm" variant="soft" color={judgmentChipColor(status)} className="capitalize">
            {status}
          </Chip>
        ) : null}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
      <p className="mt-1 text-sm text-slate-700">{item.summary}</p>
      <p className="mt-1.5 text-xs text-slate-500">{item.detail}</p>

      {!signed ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Button
            size="sm"
            variant="primary"
            onPress={() => signRiskItem(caseId, item.id, 'accepted')}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => signRiskItem(caseId, item.id, 'escalated')}
          >
            Escalate
          </Button>
          {noteOpen ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
                Note
                <input
                  className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional rationale"
                />
              </label>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => {
                  signRiskItem(caseId, item.id, 'noted', note.trim() || undefined)
                  setNoteOpen(false)
                  setNote('')
                }}
              >
                Save note
              </Button>
              <Button size="sm" variant="ghost" onPress={() => setNoteOpen(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onPress={() => setNoteOpen(true)}>
              Note
            </Button>
          )}
        </div>
      ) : null}
    </li>
  )
}

function groupByBucket(items: RiskActionItem[]): { bucket: QualificationBucketId; items: RiskActionItem[] }[] {
  const map = new Map<QualificationBucketId, RiskActionItem[]>()
  for (const item of items) {
    const list = map.get(item.bucket) ?? []
    list.push(item)
    map.set(item.bucket, list)
  }
  return QUALIFICATION_BUCKETS.filter((b) => map.has(b.id)).map((b) => ({
    bucket: b.id,
    items: map.get(b.id)!,
  }))
}

function RiskReviewPanel({ c }: { c: CyberCase }) {
  const demo = riskReviewForCase(c)
  const [riskTab, setRiskTab] = useState<'threats' | 'impacts'>('threats')
  const required = requiredRiskItemIds(demo)
  const unsigned = required.filter((id) => {
    const j = c.riskJudgments[id]
    return !j || j.status === 'pending'
  }).length

  const threatGroups = groupByBucket(demo.threats)
  const impactGroups = groupByBucket(demo.impacts)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <TierBadge tier={c.tier} />
        <AiBadge label={`AI ${c.recommendation}`} />
        <Chip size="sm" variant="soft" color={exposureChipColor(demo.exposure)} className="capitalize">
          {demo.exposure} exposure
        </Chip>
        <Chip size="sm" variant="soft" color={unsigned ? 'warning' : 'success'}>
          {unsigned ? `${unsigned} required unsigned` : 'Required judgments signed'}
        </Chip>
      </div>
      <p className="text-sm text-slate-700">{demo.summary}</p>

      <Tabs
        selectedKey={riskTab}
        onSelectionChange={(k) => setRiskTab(k as 'threats' | 'impacts')}
        className="case-drawer-tabs"
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Review Risk">
            <Tabs.Tab id="threats">Assess threats</Tabs.Tab>
            <Tabs.Tab id="impacts">Assess impacts</Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {(riskTab === 'threats' ? threatGroups : impactGroups).map((group) => (
        <div key={group.bucket} className="wb-qual-bucket">
          <div className="wb-qual-bucket__head">
            <h4 className="text-sm font-semibold text-slate-900">{bucketLabel(group.bucket)}</h4>
          </div>
          <ul className="space-y-2 p-2.5">
            {group.items.map((item) => (
              <RiskItemCard
                key={item.id}
                caseId={c.id}
                item={item}
                status={c.riskJudgments[item.id]?.status}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function PlatformStageBody({ c }: { c: CyberCase }) {
  const signPlatformCard = useCyberUwStore((s) => s.signPlatformCard)
  const outcome = platformOutcomeFromCards(c.platformCards)

  const actions: Exclude<PlatformSignOff, 'pending'>[] = ['watch', 'terms', 'block', 'escalate']

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Interrelated and concentration risk — sign each dependency before Closure. Not a raw vendor count.
      </p>

      <ul className="space-y-3">
        {c.platformCards.map((card: PlatformCard) => {
          const pending = card.signOff === 'pending'
          return (
            <li key={card.id} className="wb-platform-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{card.label}</span>
                {!pending ? (
                  <Chip size="sm" variant="soft" color={card.signOff === 'block' ? 'danger' : 'warning'} className="capitalize">
                    {card.signOff}
                  </Chip>
                ) : (
                  <Chip size="sm" variant="soft" color="accent">
                    Needs sign-off
                  </Chip>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-800">{card.finding}</p>
              <p className="mt-1 text-xs text-slate-500">{card.portfolioMeaning}</p>
              {card.termEffect ? (
                <p className="mt-1 text-xs font-medium text-amber-900">Terms: {card.termEffect}</p>
              ) : null}

              {pending ? (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {actions.map((a) => (
                    <Button
                      key={a}
                      size="sm"
                      variant={a === 'block' ? 'danger' : a === 'watch' ? 'primary' : 'secondary'}
                      className="capitalize"
                      onPress={() =>
                        signPlatformCard(
                          c.id,
                          card.id,
                          a,
                          a === 'terms' ? 'Contingent BI / waiting period discuss with broker' : undefined,
                        )
                      }
                    >
                      {a === 'watch' ? 'Watch' : a === 'terms' ? 'Terms' : a === 'block' ? 'Block' : 'Escalate'}
                    </Button>
                  ))}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <p className="text-sm font-medium text-slate-800">{platformOutcomeLabel(outcome)}</p>
    </div>
  )
}

function ClosureCard({ c }: { c: CyberCase }) {
  const materialOpen = openMaterialGaps(c.gaps)
  const demo = riskReviewForCase(c)
  const required = requiredRiskItemIds(demo)
  const riskOk = canLeaveReviewRisk(required, c.riskJudgments)
  const platformOk = canLeaveReviewPlatform(c.platformCards)
  const platformOutcome = platformOutcomeFromCards(c.platformCards)
  const blockingRules = c.appetiteHits.filter((h) => h.outcome !== 'pass')
  const topRule = blockingRules[0]
  const aligned = c.decision !== 'pending' && c.decision === c.recommendation

  const checklist: { id: string; label: string; ok: boolean; detail: string }[] = [
    {
      id: 'floors',
      label: 'Control floors',
      ok: materialOpen.length === 0,
      detail:
        materialOpen.length === 0
          ? 'Access / endpoint / recoverability signed in Feedback'
          : `${materialOpen.length} material gap(s) still open`,
    },
    {
      id: 'ransom',
      label: 'Ransomware readiness',
      ok: riskOk || materialOpen.length === 0,
      detail: riskOk ? 'Threat / impact judgments owned' : 'Required Review Risk items unsigned',
    },
    {
      id: 'appetite',
      label: 'Appetite & limit fit',
      ok: true,
      detail: topRule ? `${topRule.outcome.toUpperCase()} — ${topRule.ruleId}` : 'Appetite clear',
    },
    {
      id: 'threats',
      label: 'Review Risk · threats',
      ok: demo.threats.filter((t) => t.required).every((t) => {
        const j = c.riskJudgments[t.id]
        return j && j.status !== 'pending'
      }),
      detail: 'Accept / Escalate / Note on required threats',
    },
    {
      id: 'impacts',
      label: 'Review Risk · impacts',
      ok: demo.impacts.filter((t) => t.required).every((t) => {
        const j = c.riskJudgments[t.id]
        return j && j.status !== 'pending'
      }),
      detail: 'Accept / Escalate / Note on required impacts',
    },
    {
      id: 'platform',
      label: 'Review Platform',
      ok: platformOk,
      detail: platformOutcomeLabel(platformOutcome),
    },
  ]

  const reasonCodes = [
    ...materialOpen.map((g) => `GAP:${g.id}`),
    ...blockingRules.map((h) => h.ruleId),
    platformOutcome !== 'clear' && platformOutcome !== 'pending' ? `PLT:${platformOutcome}` : null,
  ]
    .filter(Boolean)
    .slice(0, 5) as string[]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <AiBadge label={`AI ${c.recommendation}`} />
        <UwDecisionChip value={c.decision} />
        {c.decision !== 'pending' ? (
          <Chip size="sm" variant="soft" color={aligned ? 'success' : 'warning'}>
            {aligned ? 'Matches AI' : 'Overrides AI'}
          </Chip>
        ) : null}
      </div>

      <ul className="wb-closure-checklist">
        {checklist.map((row) => (
          <li key={row.id} className={`wb-closure-row ${row.ok ? 'wb-closure-row--ok' : 'wb-closure-row--open'}`}>
            <Chip size="sm" variant="soft" color={row.ok ? 'success' : 'warning'}>
              {row.ok ? 'Signed' : 'Open'}
            </Chip>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{row.label}</p>
              <p className="text-xs text-slate-600">{row.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      {reasonCodes.length ? (
        <div>
          <p className="text-sm font-semibold text-slate-900">Reason codes</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {reasonCodes.map((code) => (
              <Chip key={code} size="sm" variant="soft">
                {code}
              </Chip>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600">No blocking reason codes — floors and platform clear.</p>
      )}

      {c.decision !== 'pending' ? (
        <div className="space-y-2">
          {c.decisionReason ? (
            <p className="text-sm text-slate-700">{c.decisionReason}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          Lock Quote, Refer, or Decline in the bar above when the checklist is ready.
        </p>
      )}
    </div>
  )
}

function WorkflowTab({ c }: { c: CyberCase }) {
  const idx = cyberFlowIndex(c)

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          Stages
        </h2>
      </div>

      <StageSection title={CYBER_FLOW_STAGES[0].title} stageIndex={0} currentIndex={idx}>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs font-medium text-slate-500">Broker</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{c.broker}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Completeness</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{c.completenessPct}%</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Revenue</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{money(c.revenueUsd)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Limit</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{money(c.limitRequestedUsd)}</dd>
          </div>
        </dl>
      </StageSection>

      <StageSection title={CYBER_FLOW_STAGES[1].title} stageIndex={1} currentIndex={idx}>
        <FeedbackStageBody c={c} />
      </StageSection>

      <StageSection title={CYBER_FLOW_STAGES[2].title} stageIndex={2} currentIndex={idx}>
        <RiskReviewPanel c={c} />
      </StageSection>

      <StageSection title={CYBER_FLOW_STAGES[3].title} stageIndex={3} currentIndex={idx}>
        <PlatformStageBody c={c} />
      </StageSection>

      <StageSection title={CYBER_FLOW_STAGES[4].title} stageIndex={4} currentIndex={idx}>
        <ClosureCard c={c} />
      </StageSection>
    </div>
  )
}

function DossierTab({ c }: { c: CyberCase }) {
  const demo = riskReviewForCase(c)
  const riskItems = [...demo.threats, ...demo.impacts]

  const signalsByModule = new Map<string, typeof c.formSignals>()
  for (const row of c.formSignals) {
    const list = signalsByModule.get(row.moduleId) ?? []
    list.push(row)
    signalsByModule.set(row.moduleId, list)
  }

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          Dossier
        </h2>
        <p className="mt-1 text-sm text-slate-600">Ingested package — form, signals, and references.</p>
      </div>

      <section className="wb-panel p-5">
        <h3 className="text-sm font-semibold text-slate-900">Package documents</h3>
        {c.packageDocs.length ? (
          <ul className="mt-3 divide-y divide-slate-100">
            {c.packageDocs.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="font-medium text-slate-900">{doc.name}</span>
                <Chip size="sm" variant="soft">
                  {doc.kind}
                </Chip>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No documents attached.</p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Form signals</h3>
        {[...signalsByModule.entries()].map(([moduleId, rows]) => (
          <div key={moduleId} className="wb-qual-bucket">
            <div className="wb-qual-bucket__head">
              <h4 className="text-sm font-semibold text-slate-900">{moduleLabel(moduleId)}</h4>
            </div>
            <ul className="wb-qual-bucket__list">
              {rows.map((row) => (
                <li key={row.id} className="wb-qual-row">
                  <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                  <p className="mt-1 text-sm text-slate-800">
                    <span className="text-slate-500">Attested · </span>
                    {row.answer}
                  </p>
                  {row.signal ? (
                    <p className="mt-1 text-sm text-amber-950">
                      <span className="font-medium">Signal · </span>
                      {row.signal}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="wb-panel p-5">
        <h3 className="text-sm font-semibold text-slate-900">Threats & impacts</h3>
        <p className="mt-1 text-xs text-slate-500">Referenced against form modules and platform deps.</p>
        <ul className="mt-3 space-y-2">
          {riskItems.map((item) => {
            const status = c.riskJudgments[item.id]?.status
            return (
              <li key={item.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip size="sm" variant="soft" className="capitalize">
                    {item.kind}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'success'}
                    className="capitalize"
                  >
                    {item.severity}
                  </Chip>
                  {status && status !== 'pending' ? (
                    <Chip size="sm" variant="soft" color={judgmentChipColor(status)} className="capitalize">
                      {status}
                    </Chip>
                  ) : null}
                </div>
                <p className="mt-1.5 font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">Referenced in · {item.cite}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Platform dependencies</h3>
        <ul className="space-y-2">
          {c.platformCards.map((card) => (
            <li key={card.id} className="wb-platform-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{card.label}</span>
                {card.signOff !== 'pending' ? (
                  <Chip size="sm" variant="soft" color={card.signOff === 'block' ? 'danger' : 'warning'} className="capitalize">
                    {card.signOff}
                  </Chip>
                ) : (
                  <Chip size="sm" variant="soft">
                    Unsigned
                  </Chip>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-800">{card.finding}</p>
              <p className="mt-1 text-xs text-slate-500">{card.portfolioMeaning}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="wb-panel p-5">
        <h3 className="text-sm font-semibold text-slate-900">Audit trail</h3>
        <ul className="mt-3 space-y-2">
          {[...c.audit].reverse().map((a, i) => (
            <li key={`${a.at}-${i}`} className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
              <p className="font-medium text-slate-900">{a.action}</p>
              <p className="text-xs text-slate-500">
                {a.actor} · {new Date(a.at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function CaseWorkspace() {
  const {
    cases,
    selectedId,
    activeTab,
    setTab,
    runMockSignal,
    applyDecision,
    listDecisionPrompt,
    clearListDecisionPrompt,
  } = useCyberUwStore()
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)
  const [saved, setSaved] = useState(false)
  const c = cases.find((x) => x.id === selectedId)

  useEffect(() => {
    if (listDecisionPrompt) {
      setPendingDecision(listDecisionPrompt)
    }
  }, [listDecisionPrompt, selectedId])

  useEffect(() => {
    setSaved(false)
  }, [selectedId])

  if (!c) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <Typography.Paragraph size="sm" color="muted">
          Select a case from the in-flight strip to open the canvas.
        </Typography.Paragraph>
      </div>
    )
  }

  const reasonFor = (d: PendingDecision) => {
    if (d === 'quote') return 'Aligned attestation/signal; within appetite; Tier acceptable.'
    if (d === 'refer') return 'Material gap or rule hit — specialist review before bind.'
    return 'Hard control floor failed at requested limit; decline or restructure.'
  }

  const closeConfirm = () => {
    setPendingDecision(null)
    clearListDecisionPrompt()
  }

  const dispositionLabel =
    c.decision === 'pending'
      ? 'UW Pending'
      : `UW ${c.decision.charAt(0).toUpperCase()}${c.decision.slice(1)}`

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setTab(String(key) as 'workflow' | 'dossier')}
        className="case-drawer-tabs flex min-h-0 flex-1 flex-col"
      >
        <div className="shrink-0 border-b border-slate-200 bg-white/80 px-4 pt-3 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3">
            <div className="min-w-0">
              <p className="wb-eyebrow">Decision Workbench</p>
              <Typography.Heading level={5} className="font-display text-slate-900">
                {c.insured}
              </Typography.Heading>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="wb-ref-pill">{c.id}</span>
                <CaseMetaChips lob={c.sector} name={c.broker} limitUsd={c.limitRequestedUsd} />
                <Chip size="sm" variant="soft">
                  {dispositionLabel}
                </Chip>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setSaved((v) => !v)}
              className={saved ? 'text-amber-600' : 'text-blue-600'}
            >
              {saved ? 'Bookmarked' : 'Save for later'}
            </Button>
          </div>
          <Tabs.ListContainer>
            <Tabs.List aria-label="Cyber case sections">
              <Tabs.Tab id="workflow">Workflow</Tabs.Tab>
              <Tabs.Tab id="dossier">Dossier</Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </div>

        <div className="wb-cyber-advance-strip shrink-0 border-b border-slate-200/80 px-3 py-2.5 md:px-4">
          {activeTab === 'workflow' ? (
            <div className="wb-progress-stepper-chrome wb-progress-stepper-chrome--inline mb-2.5">
              <CyberProgressStepper c={c} />
            </div>
          ) : null}
          <CyberStageAdvanceCard
            compact
            activeTab={activeTab}
            c={c}
            onRequestDecision={(d) => setPendingDecision(d)}
            onSignal={() => runMockSignal(c.id)}
          />
        </div>

        <div className="case-drawer-surface min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <Tabs.Panel id="workflow" className="pt-1">
            <WorkflowTab c={c} />
          </Tabs.Panel>
          <Tabs.Panel id="dossier" className="pt-1">
            <DossierTab c={c} />
          </Tabs.Panel>
        </div>
      </Tabs>

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
