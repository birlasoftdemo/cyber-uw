import { Button, Chip, Typography } from '@heroui/react'
import { ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'
import { CYBER_FLOW_STAGES, cyberFlowIndex, nextFlowStageTitle } from '../constants/cyberFlow'
import {
  filterCyberCases,
  useCyberUwStore,
} from '../store/cyberUwStore'
import type { CyberCase, CyberDecision } from '../types'
import { openMaterialGaps } from '../utils/gapDisposition'
import { CaseMetaChip, CaseMetaChips, money, UwDecisionChip } from './CyberPrimitives'
import { CyberQueueToolbar } from './CyberQueueToolbar'

type StripFilter = 'all' | 'pending' | 'decided'

/** Queue card body — id + insured + LOB/desk/limit + UW status (same stats as case chrome). */
function CyberQueueCardStats({ c }: { c: CyberCase }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <span className="wb-ref-pill">{c.id}</span>
      <p className="truncate text-xs font-semibold leading-snug text-slate-900">{c.insured}</p>
      <CaseMetaChips
        lob={c.sector}
        name={c.broker}
        limitUsd={c.limitRequestedUsd}
        className="wb-meta-fields--queue"
      />
      <div className="pt-0.5">
        {c.pasStatus === 'synced' ? (
          <Chip size="sm" variant="soft" color="success">
            Synced
          </Chip>
        ) : c.decision === 'pending' ? (
          <Chip size="sm" variant="soft">
            UW Pending
          </Chip>
        ) : (
          <UwDecisionChip value={c.decision} />
        )}
      </div>
    </div>
  )
}

export function CyberWorkbenchStrip({
  selectedId,
  onSelect,
  onBackToQueue,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
  onBackToQueue: () => void
}) {
  const {
    cases,
    searchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
  } = useCyberUwStore()
  const [stripFilter, setStripFilter] = useState<StripFilter>('pending')

  const filtered = filterCyberCases(cases, {
    searchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
  })

  const items = filtered.filter((c) => {
    if (stripFilter === 'pending') return c.decision === 'pending'
    if (stripFilter === 'decided') return c.decision !== 'pending'
    return true
  })

  return (
    <div className="wb-panel flex h-full flex-col overflow-hidden">
      <div className="border-b border-slate-200 px-3 py-3">
        <button
          type="button"
          onClick={onBackToQueue}
          className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft size={12} aria-hidden />
          Back to queue
        </button>
        <p className="wb-eyebrow">Decision Workbench</p>
        <Typography.Heading level={6} className="font-display text-slate-900">
          In-flight cases
        </Typography.Heading>
        <div className="mt-2 flex flex-wrap gap-1">
          {(
            [
              { id: 'pending' as const, label: 'In-flight' },
              { id: 'decided' as const, label: 'Decided' },
              { id: 'all' as const, label: 'All' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStripFilter(t.id)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                stripFilter === t.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <CyberQueueToolbar />
      <ul className="flex-1 space-y-1.5 overflow-y-auto p-2" role="listbox" aria-label="In-flight cases">
        {items.length === 0 ? (
          <li className="px-2 py-8 text-center text-xs text-slate-500">No cases in this filter.</li>
        ) : (
          items.map((c) => {
            const active = selectedId === c.id
            return (
              <li key={c.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={`wb-inflight-row w-full rounded-lg border px-2.5 py-2.5 text-left transition ${
                    active
                      ? 'wb-inflight-row--active border-blue-300 bg-blue-50/80'
                      : 'border-transparent hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <CyberQueueCardStats c={c} />
                </button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

/** Prefer proper import — fix below */
export function CyberProgressStepper({ c }: { c: CyberCase }) {
  const currentIdx = cyberFlowIndex(c)
  return (
    <ol aria-label="Case progress" className="flex w-full flex-wrap items-center gap-x-1 gap-y-2">
      {CYBER_FLOW_STAGES.map((step, i) => {
        const isComplete = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <li key={step.key} className="flex items-center gap-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                isCurrent
                  ? 'wb-stepper-node--current border-2'
                  : isComplete
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isComplete ? <Check size={9} strokeWidth={3} /> : i + 1}
              </span>
              {step.title}
            </span>
            {i < CYBER_FLOW_STAGES.length - 1 && (
              <span
                className={`h-px w-3 shrink-0 ${isComplete ? 'bg-emerald-300' : 'bg-slate-200'}`}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function CyberStageAdvanceCard({
  c,
  onOpenGaps,
  onRequestDecision,
  onPas,
  onSignal,
  compact = false,
  activeTab = 'workflow',
}: {
  c: CyberCase
  onOpenGaps: () => void
  onRequestDecision: (d: Exclude<CyberDecision, 'pending'>) => void
  onPas: () => void
  onSignal: () => void
  /** Quiet strip under case tabs — not a full-bleed hero banner. */
  compact?: boolean
  /** Current case canvas tab — avoids redundant CTAs on Gap board. */
  activeTab?: 'workflow' | 'gaps' | 'dossier' | 'pas'
}) {
  const advanceWorkflowStage = useCyberUwStore((s) => s.advanceWorkflowStage)
  const materialOpen = openMaterialGaps(c.gaps)
  const scanning = c.signalStatus === 'scanning'
  const pending = c.decision === 'pending'
  const idx = cyberFlowIndex(c)
  const nextTitle = nextFlowStageTitle(idx)
  const onGapsTab = activeTab === 'gaps'
  const shell = compact
    ? 'wb-action-card wb-action-card--compact wb-advance-row !mt-0'
    : 'wb-action-card !mt-0'

  if (c.pasStatus === 'synced') {
    return (
      <div className={shell}>
        <p className="wb-action-card__lead !mb-0">Case complete — policy admin synced.</p>
      </div>
    )
  }

  if (!pending) {
    return (
      <div className={shell}>
        <div className="wb-advance-row__inner">
          <p className="wb-action-card__lead !mb-0 min-w-0 flex-1">
            Decision locked ({c.decision}). Push to policy admin when ready.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="wb-advance-cta shrink-0"
            isDisabled={c.pasStatus === 'pushing'}
            onPress={onPas}
          >
            {c.pasStatus === 'pushing' ? 'Pushing…' : 'Proceed to policy admin'}
          </Button>
        </div>
      </div>
    )
  }

  if (materialOpen.length > 0) {
    /* Already on Gap board — status only; primary actions live on the card below. */
    if (onGapsTab) {
      return (
        <div className={`${shell} wb-advance-row--status`}>
          <div className="wb-advance-row__inner">
            <Chip size="sm" variant="soft" color="danger" className="shrink-0 capitalize">
              {materialOpen.length} open
            </Chip>
            <p className="wb-action-card__lead !mb-0 min-w-0 flex-1 font-medium text-slate-800">
              Sign off below — Resolve or Refer each material gap.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className={`${shell} wb-advance-row--action`}>
        <div className="wb-advance-row__inner">
          <div className="min-w-0 flex-1">
            <p className="wb-action-card__lead !mb-0 font-semibold text-slate-900">
              {materialOpen.length} material gap{materialOpen.length === 1 ? '' : 's'} need sign-off
            </p>
            {!compact ? (
              <p className="wb-action-card__hint !mt-1">
                Resolve or Refer on the Gap board before Risk Review.
              </p>
            ) : null}
          </div>
          <Button
            variant="primary"
            size="sm"
            className="wb-advance-cta wb-advance-cta--emphasis shrink-0"
            onPress={onOpenGaps}
          >
            Review focused gaps
          </Button>
        </div>
      </div>
    )
  }

  if (idx < 4 && nextTitle) {
    return (
      <div className={`${shell} wb-advance-row--action`}>
        <div className="wb-advance-row__inner">
          <p className="wb-action-card__lead !mb-0 min-w-0 flex-1 font-medium text-slate-800">
            Next: {nextTitle}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="wb-advance-cta wb-advance-cta--emphasis shrink-0"
            onPress={() => advanceWorkflowStage(c.id)}
          >
            Continue to {nextTitle}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${shell} wb-advance-row--action`}>
      <div className="wb-advance-row__inner">
        <p className="wb-action-card__lead !mb-0 min-w-0 flex-1 font-medium text-slate-800">
          AI recommends {c.recommendation.toUpperCase()}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            className="wb-advance-cta wb-advance-cta--emphasis"
            isDisabled={scanning}
            onPress={() => onRequestDecision('quote')}
          >
            Quote
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={scanning}
            onPress={() => onRequestDecision('refer')}
          >
            Refer
          </Button>
          <Button
            variant="danger"
            size="sm"
            isDisabled={scanning}
            onPress={() => onRequestDecision('decline')}
          >
            Decline
          </Button>
          <Button size="sm" variant="ghost" isDisabled={scanning} onPress={onSignal}>
            {scanning ? 'Scanning…' : 'Re-ingest'}
          </Button>
          {!compact ? (
            <>
              <Chip size="sm" variant="soft">
                Tier {c.tier} assist
              </Chip>
              <CaseMetaChip kind="limit">{money(c.limitRequestedUsd)}</CaseMetaChip>
            </>
          ) : (
            <Chip size="sm" variant="soft">
              Tier {c.tier}
            </Chip>
          )}
        </div>
      </div>
    </div>
  )
}
: {
  c: CyberCase
  onOpenGaps: () => void
  onRequestDecision: (d: Exclude<CyberDecision, 'pending'>) => void
  onPas: () => void
  onSignal: () => void
  /** Quiet strip under tabs — not a full-bleed hero banner. */
  compact?: boolean
}) {
  const advanceWorkflowStage = useCyberUwStore((s) => s.advanceWorkflowStage)
  const materialOpen = openMaterialGaps(c.gaps)
  const scanning = c.signalStatus === 'scanning'
  const pending = c.decision === 'pending'
  const idx = cyberFlowIndex(c)
  const nextTitle = nextFlowStageTitle(idx)
  const shell = compact ? 'wb-action-card wb-action-card--compact !mt-0' : 'wb-action-card !mt-0'

  if (c.pasStatus === 'synced') {
    return (
      <div className={shell}>
        <p className="wb-action-card__lead !mb-0">Case complete — policy admin synced.</p>
      </div>
    )
  }

  if (!pending) {
    return (
      <div className={shell}>
        <div className={compact ? 'flex flex-wrap items-center gap-2' : undefined}>
          <p className={`wb-action-card__lead ${compact ? '!mb-0 min-w-0 flex-1' : ''}`}>
            Decision locked ({c.decision}). Push to policy admin when ready.
          </p>
          <Button
            variant="primary"
            size="sm"
            fullWidth={!compact}
            className="wb-advance-cta shrink-0"
            isDisabled={c.pasStatus === 'pushing'}
            onPress={onPas}
          >
            {c.pasStatus === 'pushing' ? 'Pushing…' : 'Proceed to policy admin'}
          </Button>
        </div>
      </div>
    )
  }

  if (materialOpen.length > 0) {
    return (
      <div className={shell}>
        <div className={compact ? 'flex flex-wrap items-center gap-2' : undefined}>
          <div className={compact ? 'min-w-0 flex-1' : undefined}>
            <p className={`wb-action-card__lead ${compact ? '!mb-0' : ''}`}>
              Finish focused sign-offs — {materialOpen.length} material gap
              {materialOpen.length === 1 ? '' : 's'} open.
            </p>
            {!compact ? (
              <p className="wb-action-card__hint">
                Resolve or Refer each gap, then continue to Risk Review.
              </p>
            ) : null}
          </div>
          <Button
            variant="primary"
            size="sm"
            fullWidth={!compact}
            className="wb-advance-cta shrink-0"
            onPress={onOpenGaps}
          >
            Review focused gaps
          </Button>
        </div>
      </div>
    )
  }

  if (idx < 4 && nextTitle) {
    return (
      <div className={shell}>
        <div className={compact ? 'flex flex-wrap items-center gap-2' : undefined}>
          <p className={`wb-action-card__lead ${compact ? '!mb-0 min-w-0 flex-1' : ''}`}>
            {CYBER_FLOW_STAGES[idx]?.title ?? 'Stage'} — continue to {nextTitle}.
          </p>
          <Button
            variant="primary"
            size="sm"
            fullWidth={!compact}
            className="wb-advance-cta shrink-0"
            onPress={() => advanceWorkflowStage(c.id)}
          >
            Continue to {nextTitle}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={shell}>
      <div className={compact ? 'flex flex-wrap items-center gap-2' : undefined}>
        <p className={`wb-action-card__lead ${compact ? '!mb-0 min-w-0 flex-1' : ''}`}>
          AI recommends {c.recommendation.toUpperCase()}. Apply HITL disposition when ready.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            className="wb-advance-cta"
            isDisabled={scanning}
            onPress={() => onRequestDecision('quote')}
          >
            Quote
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={scanning}
            onPress={() => onRequestDecision('refer')}
          >
            Refer
          </Button>
          <Button
            variant="danger"
            size="sm"
            isDisabled={scanning}
            onPress={() => onRequestDecision('decline')}
          >
            Decline
          </Button>
          <Button size="sm" variant="ghost" isDisabled={scanning} onPress={onSignal}>
            {scanning ? 'Scanning…' : 'Re-ingest'}
          </Button>
          {!compact ? (
            <>
              <Chip size="sm" variant="soft">
                Tier {c.tier} assist
              </Chip>
              <CaseMetaChip kind="limit">{money(c.limitRequestedUsd)}</CaseMetaChip>
            </>
          ) : (
            <Chip size="sm" variant="soft">
              Tier {c.tier}
            </Chip>
          )}
        </div>
      </div>
    </div>
  )
}
