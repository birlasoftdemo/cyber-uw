import { Button, Chip, Typography } from '@heroui/react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Radar,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  CaseMetaChip,
  CaseMetaChips,
  formatCompactUsd,
} from '../../shared/workbench/CaseMetaFields'
import type { CyberCase, CyberDecision, GapDisposition, GapSeverity } from '../types'

/** User-facing label for decision enums (`refer` → escalate). */
export function decisionLabel(value: CyberDecision | string): string {
  if (value === 'refer') return 'escalate'
  return value
}

/** Title-case decision label (`refer` → Escalate). */
export function decisionTitle(value: CyberDecision | string): string {
  const label = decisionLabel(value)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** User-facing gap disposition (`referred` → escalated). */
export function gapDispositionLabel(value: GapDisposition | string): string {
  if (value === 'referred') return 'escalated'
  return value
}
import {
  filterCyberCases,
  useCyberUwStore,
} from '../store/cyberUwStore'
import { CyberQueueToolbar } from './CyberQueueToolbar'

/** @deprecated Prefer formatCompactUsd — kept for cyber call sites. */
export function money(n: number) {
  return formatCompactUsd(n)
}

export type { CaseMetaChipKind } from '../../shared/workbench/CaseMetaFields'
export { CaseMetaChip, CaseMetaChips }

export function gapBorder(s: GapSeverity) {
  if (s === 'critical') return 'border-red-600/40 bg-red-50/60'
  if (s === 'high') return 'border-orange-400/50 bg-orange-50/50'
  if (s === 'medium') return 'border-blue-300/60 bg-blue-50/40'
  return 'border-emerald-300/50 bg-emerald-50/30'
}

export function gapChipColor(s: GapSeverity): 'danger' | 'warning' | 'accent' | 'default' {
  if (s === 'critical') return 'danger'
  if (s === 'high') return 'warning'
  if (s === 'medium') return 'accent'
  return 'default'
}

export function UwDecisionChip({ value }: { value: CyberDecision | 'pending' }) {
  if (value === 'quote') {
    return (
      <Chip size="sm" variant="soft" color="success">
        UW Quote
      </Chip>
    )
  }
  if (value === 'refer') {
    return (
      <Chip size="sm" variant="soft" color="warning">
        UW Escalate
      </Chip>
    )
  }
  if (value === 'decline') {
    return (
      <Chip size="sm" variant="soft" color="danger">
        UW Decline
      </Chip>
    )
  }
  return (
    <Chip size="sm" variant="soft" color="default">
      UW Pending
    </Chip>
  )
}

export function TierBadge({ tier }: { tier: number }) {
  return (
    <Chip size="sm" variant="soft" color="accent">
      Tier {tier}
    </Chip>
  )
}

/** Purple AI pill — CTA from list: opens case + confirm for that disposition. */
export function AiDecisionCta({
  recommendation,
  onPress,
  disabled,
}: {
  recommendation: Exclude<CyberDecision, 'pending'>
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onPress()
      }}
      className="ai-badge ai-cta inline-flex cursor-pointer items-center gap-1 border-0 px-2.5 py-1 text-[10px] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`Act on AI ${recommendation === 'refer' ? 'escalate' : recommendation} recommendation`}
    >
      <Sparkles size={10} aria-hidden />
      AI {recommendation === 'refer' ? 'escalate' : recommendation}
    </button>
  )
}

export function CaseQueue({
  selectedId,
  onSelect,
  dimmed,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
  dimmed?: boolean
}) {
  const {
    cases,
    searchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
    filterSubmissionKind,
    actOnAiRecommendation,
  } = useCyberUwStore()

  const visible = filterCyberCases(cases, {
    searchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
    filterSubmissionKind,
  })

  return (
    <div
      className={`wb-panel flex h-full flex-col overflow-hidden transition-[opacity,filter] duration-200 ${
        dimmed ? 'pointer-events-none opacity-40 grayscale-[0.35]' : ''
      }`}
      aria-hidden={dimmed || undefined}
    >
      <div className="border-b border-slate-200 px-4 py-3">
        <Typography.Heading level={6} className="font-display text-slate-900">
          Cyber submissions
        </Typography.Heading>
      </div>
      <CyberQueueToolbar />
      <ul className="flex-1 space-y-1 overflow-y-auto p-2" role="listbox" aria-label="Cyber submissions">
        {visible.length === 0 ? (
          <li className="px-3 py-8 text-center text-sm text-slate-500">No submissions match filters.</li>
        ) : (
          visible.map((c) => {
            const active = selectedId === c.id
            const critical = c.gaps.some((g) => g.severity === 'critical')
            return (
              <li key={c.id} role="option" aria-selected={active}>
                <div
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                    active
                      ? 'border-blue-300 bg-blue-50/80 ring-1 ring-blue-200'
                      : 'border-transparent hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <button type="button" className="w-full text-left" onClick={() => onSelect(c.id)}>
                    <div className="min-w-0 space-y-1.5">
                      <span className="wb-ref-pill">{c.id}</span>
                      <p className="truncate text-sm font-semibold text-slate-900">{c.insured}</p>
                      <CaseMetaChips
                        lob={c.sector}
                        name={c.broker}
                        limitUsd={c.limitRequestedUsd}
                        className="wb-meta-fields--queue"
                      />
                      <div>
                        {c.pasStatus === 'synced' || c.decision !== 'pending' ? (
                          <Chip size="sm" variant="soft" color="success">
                            {c.decision !== 'pending'
                              ? `Locked · ${decisionLabel(c.decision)}`
                              : 'Locked'}
                          </Chip>
                        ) : (
                          <Chip size="sm" variant="soft">
                            UW Pending
                          </Chip>
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {c.recommendation !== 'pending' ? (
                      <AiDecisionCta
                        recommendation={c.recommendation}
                        disabled={c.decision !== 'pending'}
                        onPress={() => actOnAiRecommendation(c.id)}
                      />
                    ) : null}
                    {critical ? (
                      <span className="cuw-critical-chip">
                        <AlertTriangle size={12} aria-hidden />
                        critical
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

export function ActionBar({
  c,
  onSignal,
  onRequestDecision,
  onUndo,
}: {
  c: CyberCase
  onSignal: () => void
  onRequestDecision: (d: Exclude<CyberDecision, 'pending'>) => void
  onUndo: () => void
}) {
  const scanning = c.signalStatus === 'scanning'
  const pending = c.decision === 'pending'
  const [expanded, setExpanded] = useState(pending)

  useEffect(() => {
    setExpanded(pending)
  }, [c.id, pending])

  return (
    <div className="wb-toolbar-chrome shrink-0">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition hover:bg-slate-50/80"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Actions
        </span>
        {!pending ? <UwDecisionChip value={c.decision} /> : null}
        {pending ? (
          <span className="text-[11px] text-slate-400">Quote · Escalate · Decline</span>
        ) : null}
        <ChevronDown
          size={14}
          className={`ml-auto shrink-0 text-slate-400 transition ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {expanded ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100/80 px-3 py-1.5">
          <Button
            size="sm"
            variant="secondary"
            className={scanning ? 'opacity-80' : ''}
            isDisabled={scanning}
            onPress={onSignal}
            aria-busy={scanning}
          >
            <Radar size={14} aria-hidden />
            {scanning ? 'Scanning…' : 'Run ingest again'}
          </Button>
          <div className="mx-0.5 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
          <Button
            size="sm"
            variant="primary"
            isDisabled={!pending || scanning}
            onPress={() => onRequestDecision('quote')}
          >
            <CheckCircle2 size={14} aria-hidden /> Quote
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={!pending || scanning}
            onPress={() => onRequestDecision('refer')}
          >
            Escalate
          </Button>
          <Button
            size="sm"
            variant="danger"
            isDisabled={!pending || scanning}
            onPress={() => onRequestDecision('decline')}
          >
            Decline
          </Button>
          {!pending ? (
            <Button size="sm" variant="ghost" onPress={onUndo}>
              <RotateCcw size={14} aria-hidden /> Undo
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
