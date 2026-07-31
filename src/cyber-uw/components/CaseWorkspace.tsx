import { Button, Chip, Tabs, Typography } from '@heroui/react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { AiBadge } from '../../shared/workbench/AiBadge'
import { CYBER_FLOW_STAGES, cyberFlowIndex } from '../constants/cyberFlow'
import { GAP_REFER_ASSIGNEES } from '../constants/gapReferAssignees'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase } from '../types'
import { isOpenMaterialGap, openMaterialGaps } from '../utils/gapDisposition'
import {
  CaseMetaChips,
  gapBorder,
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
  research,
  children,
}: {
  title: string
  stageIndex: number
  currentIndex: number
  research: string
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
      {expanded ? (
        <div className="mt-3">
          <p className="mb-3 text-xs font-medium text-slate-500">{research}</p>
          {children}
        </div>
      ) : null}
    </section>
  )
}

function WorkflowTab({
  c,
  onOpenGaps,
  onOpenPas,
}: {
  c: CyberCase
  onOpenGaps: () => void
  onOpenPas: () => void
}) {
  const idx = cyberFlowIndex(c)
  const materialOpen = openMaterialGaps(c.gaps)
  const hotVendors = c.vendors.filter((v) => v.bookCount >= 25)

  return (
    <div className="space-y-4 pb-8">
      <CyberProgressStepper c={c} />

      <div>
        <p className="wb-eyebrow">Underwriter workflow</p>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          Stages
        </h2>
      </div>

      <StageSection
        title={CYBER_FLOW_STAGES[0].title}
        stageIndex={0}
        currentIndex={idx}
        research={CYBER_FLOW_STAGES[0].subtext}
      >
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Broker</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{c.broker}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Completeness</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{c.completenessPct}%</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Revenue</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{money(c.revenueUsd)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Limit</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{money(c.limitRequestedUsd)}</dd>
          </div>
        </dl>
      </StageSection>

      <StageSection
        title={CYBER_FLOW_STAGES[1].title}
        stageIndex={1}
        currentIndex={idx}
        research={CYBER_FLOW_STAGES[1].subtext}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="sm" variant="soft" color={materialOpen.length ? 'danger' : 'success'}>
            {materialOpen.length} open material gap{materialOpen.length === 1 ? '' : 's'}
          </Chip>
          <span className="text-sm text-slate-600">Signal score {c.signalScore}/100 (mock)</span>
        </div>
        {materialOpen.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {materialOpen.slice(0, 3).map((g) => (
              <li
                key={g.id}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950"
              >
                <strong>{g.control}:</strong> attested “{g.attested}” vs signal “{g.signal}”
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            No open material gaps — focused sign-off complete.
          </p>
        )}
        <Button size="sm" variant="secondary" className="mt-3" onPress={onOpenGaps}>
          Open Gap board
          <ArrowRight size={14} />
        </Button>
      </StageSection>

      <StageSection
        title={CYBER_FLOW_STAGES[2].title}
        stageIndex={2}
        currentIndex={idx}
        research={CYBER_FLOW_STAGES[2].subtext}
      >
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={c.tier} />
          <AiBadge label={`AI ${c.recommendation}`} />
          <Chip size="sm" variant="soft" color="warning">
            Tier ≠ premium
          </Chip>
        </div>
        <ul className="mt-3 space-y-2">
          {c.appetiteHits.map((h) => (
            <li key={h.ruleId} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{h.label}</span>
                <Chip
                  size="sm"
                  variant="soft"
                  color={h.outcome === 'pass' ? 'success' : h.outcome === 'refer' ? 'warning' : 'danger'}
                  className="capitalize"
                >
                  {h.outcome}
                </Chip>
              </div>
              <p className="mt-1 text-xs text-slate-500">{h.ruleId}</p>
              <p className="mt-1 text-slate-700">{h.detail}</p>
            </li>
          ))}
        </ul>
      </StageSection>

      <StageSection
        title={CYBER_FLOW_STAGES[3].title}
        stageIndex={3}
        currentIndex={idx}
        research={CYBER_FLOW_STAGES[3].subtext}
      >
        {hotVendors.length ? (
          <ul className="space-y-2">
            {c.vendors.map((v) => (
              <li
                key={v.vendor}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                  v.bookCount >= 25 ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-slate-200 bg-white'
                }`}
              >
                <span>
                  <strong>{v.vendor}</strong>
                  <span className="text-slate-500"> · {v.category}</span>
                </span>
                <span className="font-semibold">{v.bookCount} on book</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">No vendor above watch threshold (≥25).</p>
        )}
      </StageSection>

      <StageSection
        title={CYBER_FLOW_STAGES[4].title}
        stageIndex={4}
        currentIndex={idx}
        research={CYBER_FLOW_STAGES[4].subtext}
      >
        <DecisionAidCard c={c} onOpenPas={onOpenPas} />
      </StageSection>
    </div>
  )
}

function DecisionAidCard({ c, onOpenPas }: { c: CyberCase; onOpenPas: () => void }) {
  const critical = c.gaps.filter((g) => g.severity === 'critical')
  const high = c.gaps.filter((g) => g.severity === 'high')
  const hotVendors = c.vendors.filter((v) => v.bookCount >= 25)
  const blockingRules = c.appetiteHits.filter((h) => h.outcome !== 'pass')
  const aligned = c.decision !== 'pending' && c.decision === c.recommendation

  const quoteMeans = [
    critical.length === 0
      ? 'No critical control gaps on the board'
      : `You accept ${critical.length} critical gap(s) despite AI caution`,
    `Tier ${c.tier} assist is guidance only — not a bound premium`,
    hotVendors.length
      ? `Book watch: ${hotVendors.map((v) => v.vendor).join(', ')}`
      : 'No shared-vendor watch above threshold',
  ]

  const referMeans = [
    ...blockingRules.filter((h) => h.outcome === 'refer').map((h) => h.label),
    ...critical.map((g) => `Gap: ${g.control}`),
    ...high.slice(0, 2).map((g) => `Gap: ${g.control}`),
  ].slice(0, 4)

  const declineMeans = blockingRules
    .filter((h) => h.outcome === 'decline')
    .map((h) => h.detail)
    .concat(critical.map((g) => g.control))
    .slice(0, 4)

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-700">{c.dossierSummary}</p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Score</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{c.signalScore}</p>
          <p className="text-xs text-slate-500">Mock posture / 100</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Gaps</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {critical.length}
            <span className="text-base font-medium text-slate-500"> crit</span>
          </p>
          <p className="text-xs text-slate-500">{high.length} high · Tier {c.tier}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Book</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{hotVendors.length}</p>
          <p className="text-xs text-slate-500">Shared-vendor watches</p>
        </div>
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-900">Decision aid</p>
          <AiBadge label={`AI ${c.recommendation}`} />
          <UwDecisionChip value={c.decision} />
          {c.decision !== 'pending' ? (
            <Chip size="sm" variant="soft" color={aligned ? 'success' : 'warning'}>
              {aligned ? 'Matches AI' : 'Overrides AI'}
            </Chip>
          ) : null}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-emerald-800">If you Quote</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-700">
              {quoteMeans.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-900">If you Refer</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-700">
              {(referMeans.length ? referMeans : ['No forced referral rules — use for judgment calls']).map(
                (line) => (
                  <li key={line}>{line}</li>
                ),
              )}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-800">If you Decline</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-700">
              {(declineMeans.length
                ? declineMeans
                : ['No hard decline floor fired — decline only with clear rationale']
              ).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip size="sm" variant="soft" color="default" className="capitalize">
          Policy admin system {c.pasStatus}
        </Chip>
        {c.decision !== 'pending' ? (
          <Button size="sm" variant="secondary" className="ai-cta" onPress={onOpenPas}>
            Sync to policy admin system
            <ArrowRight size={14} />
          </Button>
        ) : (
          <p className="text-xs text-slate-500">
            Use Quote / Refer / Decline in the toolbar, or the purple AI pill in the queue.
          </p>
        )}
      </div>
    </div>
  )
}

function GapsTab({ c }: { c: CyberCase }) {
  const resolveGap = useCyberUwStore((s) => s.resolveGap)
  const referGap = useCyberUwStore((s) => s.referGap)
  const [referring, setReferring] = useState(false)
  const [assignee, setAssignee] = useState<(typeof GAP_REFER_ASSIGNEES)[number]['label']>(
    GAP_REFER_ASSIGNEES[0].label,
  )

  const materialOpen = openMaterialGaps(c.gaps)
  const focus = materialOpen[0]
  const focusIndex = focus ? 1 : 0
  const aiNote =
    focus?.rfiDraft?.trim() ||
    (focus
      ? `Attested “${focus.attested}” does not match signal “${focus.signal}”.`
      : '')

  return (
    <div className="space-y-4 pb-8">
      <div>
        <p className="wb-eyebrow">Stage · One gap at a time</p>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          Verify · Focused sign-off
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Agentic focus clears each material gap before Proceed unlocks.
        </p>
      </div>

      {focus ? (
        <section className={`wb-stage-card wb-stage-card--current border ${gapBorder(focus.severity)}`}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Chip size="sm" variant="soft" color={gapChipColor(focus.severity)} className="capitalize">
              {focus.severity} · {focusIndex} of {materialOpen.length}
            </Chip>
          </div>
          <h3 className="dashboard-section-title text-base text-slate-900">{focus.control}</h3>

          <div className="ai-panel mt-3 p-4 text-sm">
            <p className="ai-panel__hint mb-0 text-xs font-semibold uppercase tracking-wide">AI note</p>
            <p className="mt-2 text-slate-900">{aiNote}</p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attested</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{focus.attested}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signal</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{focus.signal}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:items-end">
            <p className="w-full text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sign off
            </p>
            <Button
              size="sm"
              variant="primary"
              onPress={() => {
                setReferring(false)
                resolveGap(c.id, focus.id)
              }}
            >
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
                      referGap(c.id, focus.id, assignee)
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
        </section>
      ) : (
        <section className="wb-stage-card wb-stage-card--past border border-emerald-200 bg-emerald-50/40">
          <Chip size="sm" variant="soft" color="success">
            All material gaps signed
          </Chip>
          <h3 className="dashboard-section-title mt-2 text-base text-slate-900">
            Proceed unlocked
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Focused sign-off is complete. Use the advance strip to continue to Tier / Decide.
          </p>
        </section>
      )}
    </div>
  )
}

function DossierTab({ c }: { c: CyberCase }) {
  const critical = c.gaps.filter((g) => g.severity === 'critical' || g.severity === 'high')
  const hotVendors = c.vendors.filter((v) => v.bookCount >= 25)
  const ruleHits = c.appetiteHits.filter((h) => h.outcome !== 'pass')
  const openRequests = c.gaps.filter((g) => g.rfiDraft).length
  const aligned = c.decision !== 'pending' && c.decision === c.recommendation

  return (
    <div className="space-y-4 pb-8">
      <div>
        <p className="wb-eyebrow">Decision artifact</p>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          Underwriter dossier
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          One place to defend Quote, Refer, or Decline — evidence, rules, and next step.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="wb-panel p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Disposition</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <AiBadge label={`AI ${c.recommendation}`} />
            <UwDecisionChip value={c.decision} />
          </div>
          {c.decision !== 'pending' ? (
            <p className="mt-2 text-xs text-slate-600">
              {aligned ? 'UW locked in line with AI.' : 'UW overrode AI — rationale required below.'}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">No UW lock yet.</p>
          )}
        </div>
        <div className="wb-panel p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Why it matters</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {critical.length} material gap{critical.length === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-slate-500">{ruleHits.length} appetite pressures · Tier {c.tier}</p>
        </div>
        <div className="wb-panel p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Broker follow-ups
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {openRequests} request{openRequests === 1 ? '' : 's'} for information
          </p>
          <p className="text-xs text-slate-500">Drafted on the Gap board</p>
        </div>
        <div className="wb-panel p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Book risk</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {hotVendors.length ? hotVendors.map((v) => v.vendor).join(', ') : 'None above watch'}
          </p>
          <p className="text-xs text-slate-500">Shared vendors ≥ 25 on book</p>
        </div>
      </div>

      <div className="wb-panel space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={c.tier} />
          <Chip size="sm" variant="soft" color="warning">
            Tier is assist — not premium
          </Chip>
        </div>
        <p className="text-base leading-relaxed text-slate-800">{c.dossierSummary}</p>
        {c.decisionReason ? (
          <div className="ai-panel text-sm text-slate-800">
            <p className="ai-panel__hint">UW rationale (locked)</p>
            {c.decisionReason}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Confirm Quote / Refer / Decline to lock rationale into this dossier.
          </p>
        )}
        {critical.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Material gaps to cite
            </p>
            <ul className="mt-2 space-y-1.5">
              {critical.map((g) => (
                <li key={g.id} className="rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 text-sm text-red-950">
                  <strong>{g.control}</strong>
                  <span className="text-red-800/80"> — {g.signal}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {ruleHits.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Appetite rules to cite
            </p>
            <ul className="mt-2 space-y-1.5">
              {ruleHits.map((h) => (
                <li key={h.ruleId} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-semibold text-slate-900">{h.label}</span>
                  <span className="text-slate-600"> — {h.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="wb-panel p-5">
        <p className="wb-eyebrow mb-3">Audit trail</p>
        <ul className="space-y-2">
          {[...c.audit].reverse().map((a, i) => (
            <li key={`${a.at}-${i}`} className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
              <p className="font-medium text-slate-900">{a.action}</p>
              <p className="text-xs text-slate-500">
                {a.actor} · {new Date(a.at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PasTab({ c }: { c: CyberCase }) {
  return (
    <div className="space-y-4 pb-8">
      <div>
        <p className="wb-eyebrow">Integration</p>
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          Policy admin system (mock)
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Approve-before-send — same discipline as broker outbound in the submission workbench.
        </p>
      </div>
      <div className="wb-panel space-y-4 p-5">
        {c.decision === 'pending' ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Policy admin sync locked until Quote / Refer / Decline is confirmed.
          </div>
        ) : null}
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">UW decision</dt>
            <dd className="mt-2 text-lg font-semibold capitalize text-slate-900">{c.decision}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Adapter status</dt>
            <dd className="mt-2 text-lg font-semibold capitalize text-slate-900">{c.pasStatus}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Payload preview</dt>
            <dd className="mt-2 font-mono text-sm leading-relaxed text-slate-700">
              {`{ "submissionId": "${c.id}", "status": "${c.decision}", "tier": ${c.tier}, "signalScore": ${c.signalScore} }`}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

function TabLabel({
  children,
  count,
  danger,
}: {
  children: string
  count?: number
  danger?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      {count != null && count > 0 ? (
        <span
          className={`inline-flex min-w-[1.15rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
            danger ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-900'
          }`}
        >
          {count}
        </span>
      ) : null}
    </span>
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
    pushToPas,
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

  const criticalCount = c.gaps.filter((g) => g.severity === 'critical').length

  const closeConfirm = () => {
    setPendingDecision(null)
    clearListDecisionPrompt()
  }

  const dispositionLabel =
    c.pasStatus === 'synced'
      ? 'Synced'
      : c.decision === 'pending'
        ? 'UW Pending'
        : `UW ${c.decision.charAt(0).toUpperCase()}${c.decision.slice(1)}`

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setTab(String(key) as typeof activeTab)}
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
              <Tabs.Tab id="gaps">
                <TabLabel count={criticalCount} danger>
                  Gap board
                </TabLabel>
              </Tabs.Tab>
              <Tabs.Tab id="dossier">Dossier</Tabs.Tab>
              <Tabs.Tab id="pas">Policy admin</Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </div>

        <div className="wb-cyber-advance-strip shrink-0 border-b border-slate-200/80 bg-slate-50/90 px-3 py-2 md:px-4">
          <CyberStageAdvanceCard
            compact
            c={c}
            onOpenGaps={() => setTab('gaps')}
            onRequestDecision={(d) => setPendingDecision(d)}
            onPas={() => pushToPas(c.id)}
            onSignal={() => runMockSignal(c.id)}
          />
        </div>

        <div className="case-drawer-surface min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <Tabs.Panel id="workflow" className="pt-1">
            <WorkflowTab
              c={c}
              onOpenGaps={() => setTab('gaps')}
              onOpenPas={() => setTab('pas')}
            />
          </Tabs.Panel>
          <Tabs.Panel id="gaps" className="pt-1">
            <GapsTab c={c} />
          </Tabs.Panel>
          <Tabs.Panel id="dossier" className="pt-1">
            <DossierTab c={c} />
          </Tabs.Panel>
          <Tabs.Panel id="pas" className="pt-1">
            <PasTab c={c} />
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
