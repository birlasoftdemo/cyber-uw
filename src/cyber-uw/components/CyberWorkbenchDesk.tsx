import { Button, Chip } from '@heroui/react'
import { Check, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  CYBER_FLOW_STAGES,
  canLeavePolicyDocuments,
  canOpsMarkReadyForUw,
  cyberFlowIndex,
  flowStageTitle,
  nextFlowStageTitle,
} from '../constants/cyberFlow'
import {
  filterCyberCases,
  useCyberUwStore,
} from '../store/cyberUwStore'
import { useAuthStore } from '../store/authStore'
import type { CyberCase, CyberDecision } from '../types'
import {
  CaseMetaChip,
  decisionLabel,
  money,
  UwDecisionChip,
} from './CyberPrimitives'

function receivedLabel(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function CyberCasesListPage({ onSelect }: { onSelect: (id: string) => void }) {
  const {
    cases,
    searchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
    filterSubmissionKind,
  } = useCyberUwStore()

  const items = filterCyberCases(cases, {
    searchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
    filterSubmissionKind,
  })

  return (
    <div className="wb-panel flex h-full min-h-0 flex-col overflow-hidden">
      <div className="cuw-table-wrap min-h-0 flex-1">
        <table className="cuw-table min-w-[860px]">
          <thead>
            <tr>
              <th>Case</th>
              <th>Insured</th>
              <th>Broker</th>
              <th>Sector</th>
              <th>Kind</th>
              <th>Limit</th>
              <th>Received</th>
              <th>Stage</th>
              <th>Status</th>
              <th className="w-8">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-500">
                  No records match the current filters.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => onSelect(c.id)}
                >
                  <td>
                    <span className="wb-ref-pill">{c.id}</span>
                  </td>
                  <td className="cuw-table__primary">{c.insured}</td>
                  <td className="cuw-table__muted">{c.broker}</td>
                  <td className="cuw-table__muted">{c.sector}</td>
                  <td className="cuw-table__muted">
                    {c.submissionKind === 'renewal' ? 'Renewal' : 'New business'}
                  </td>
                  <td className="cuw-table__muted">{money(c.limitRequestedUsd)}</td>
                  <td className="cuw-table__muted">{receivedLabel(c.receivedAt)}</td>
                  <td>
                    <Chip size="sm" variant="soft">
                      {flowStageTitle(c)}
                    </Chip>
                  </td>
                  <td>
                    {c.decision !== 'pending' ? (
                      <UwDecisionChip value={c.decision} />
                    ) : (
                      <Chip size="sm" variant="soft">
                        UW Pending
                      </Chip>
                    )}
                  </td>
                  <td>
                    <ChevronRight size={16} className="text-slate-400" aria-hidden />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CyberProgressStepper({ c }: { c: CyberCase }) {
  const currentIdx = cyberFlowIndex(c)
  return (
    <ol
      aria-label="Case progress"
      className="wb-progress-stepper wb-progress-stepper--enlarged flex w-full flex-wrap items-center gap-x-1.5 gap-y-1.5"
    >
      {CYBER_FLOW_STAGES.map((step, i) => {
        const isComplete = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <li key={step.key} className="flex items-center gap-1">
            <span
              className={`wb-progress-stepper__node inline-flex min-h-8 items-center gap-2 rounded-full border px-2.5 py-1 text-[0.8625rem] font-semibold ${
                isCurrent
                  ? 'wb-stepper-node--current border'
                  : isComplete
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              <span
                className={`flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isComplete ? <Check size={10} strokeWidth={3} /> : i + 1}
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
  onRequestDecision,
  onSignal,
  onRequestDocumentsComplete,
  compact = false,
  inline = false,
}: {
  c: CyberCase
  onRequestDecision: (d: Exclude<CyberDecision, 'pending'>) => void
  onSignal: () => void
  onRequestDocumentsComplete: () => void
  /** Quiet strip under case tabs — not a full-bleed hero banner. */
  compact?: boolean
  /** Trailing actions only — parent journey rail owns chrome. */
  inline?: boolean
}) {
  const role = useAuthStore((s) => s.user?.role)
  const isOps = role === 'ops'
  const advanceWorkflowStage = useCyberUwStore((s) => s.advanceWorkflowStage)
  const markReadyForUw = useCyberUwStore((s) => s.markReadyForUw)
  const markPackageComplete = useCyberUwStore((s) => s.markPackageComplete)
  const scanning = c.signalStatus === 'scanning'
  const pending = c.decision === 'pending'
  const idx = cyberFlowIndex(c)
  const nextTitle = nextFlowStageTitle(idx)
  const shell = inline
    ? 'wb-cyber-journey-rail__actions'
    : compact
      ? 'wb-action-card wb-action-card--compact wb-advance-row !mt-0'
      : 'wb-action-card !mt-0'
  const wrap = (kind: 'action' | 'status' | 'plain', body: ReactNode) => {
    if (inline) {
      return <div className={shell}>{body}</div>
    }
    const kindClass =
      kind === 'action' ? ' wb-advance-row--action' : kind === 'status' ? ' wb-advance-row--status' : ''
    return (
      <div className={`${shell}${kindClass}`}>
        <div className="wb-advance-row__inner">{body}</div>
      </div>
    )
  }

  if (c.pasStatus === 'synced' || (!pending && c.decision !== 'pending')) {
    return wrap(
      'plain',
      <p className="wb-action-card__lead !mb-0">
        Decision locked (
        {c.decision === 'pending' ? 'complete' : decisionLabel(c.decision)}).
      </p>,
    )
  }

  if (!pending) {
    return wrap(
      'plain',
      <p className="wb-action-card__lead !mb-0">
        Decision locked ({decisionLabel(c.decision)}).
      </p>,
    )
  }

  // —— Ops strip: package complete + Ready for UW (no Quote/Risk advance) ——
  if (isOps) {
    if (c.opsHandoffAt) {
      return wrap(
        'status',
        <>
          <Chip size="sm" variant="soft" color="success" className="shrink-0">
            Handed off
          </Chip>
          <p className="wb-action-card__lead !mb-0 min-w-0 font-medium text-slate-800">
            Ready for UW. Decision Desk owns risk and financial sign off.
          </p>
        </>,
      )
    }

    if (c.completenessPct < 80) {
      return wrap(
        'action',
        <>
          {!inline ? (
            <p className="wb-action-card__lead !mb-0 min-w-0 flex-1 font-medium text-slate-800">
              Package incomplete ({c.completenessPct}%). See Missing documents in Policy Documents, then mark
              complete.
            </p>
          ) : null}
          <Button
            variant="primary"
            size="sm"
            className="wb-advance-cta wb-advance-cta--emphasis shrink-0"
            onPress={() => markPackageComplete(c.id)}
          >
            Mark package complete
          </Button>
        </>,
      )
    }

    if (canOpsMarkReadyForUw(c)) {
      return wrap(
        'action',
        <>
          {!inline ? (
            <p className="wb-action-card__lead !mb-0 min-w-0 flex-1 font-medium text-slate-800">
              Package complete. Hand off to underwriter for risk analysis and financial authority.
            </p>
          ) : null}
          <Button
            variant="primary"
            size="sm"
            className="wb-advance-cta wb-advance-cta--emphasis shrink-0"
            onPress={() => markReadyForUw(c.id)}
          >
            Ready for UW
          </Button>
        </>,
      )
    }

    return wrap(
      'status',
      <p className="wb-action-card__lead !mb-0 min-w-0 font-medium text-slate-800">
        Ops owns Policy Documents. Risk analysis and Quote stay with UW.
      </p>,
    )
  }

  if (idx === 0 && c.completenessPct < 80) {
    return wrap(
      'status',
      <>
        <p className="wb-action-card__lead !mb-0 min-w-0 font-medium text-slate-800">
          Package incomplete ({c.completenessPct}%). Finish Policy Documents before Risk Information.
        </p>
        <Button size="sm" variant="ghost" isDisabled={scanning} onPress={onSignal}>
          {scanning ? 'Scanning…' : 'Run ingest again'}
        </Button>
      </>,
    )
  }

  if (idx === 0 && !canLeavePolicyDocuments(c)) {
    return wrap(
      'action',
      <>
        {!inline ? (
          <p className="wb-action-card__lead !mb-0 min-w-0 flex-1 font-medium text-slate-800">
            Mark Documents Complete to continue to Risk Analysis.
          </p>
        ) : null}
        <Button
          variant="primary"
          size="sm"
          className="wb-advance-cta wb-advance-cta--emphasis shrink-0"
          onPress={onRequestDocumentsComplete}
        >
          Documents Complete
        </Button>
      </>,
    )
  }

  if (idx < 3 && nextTitle) {
    return wrap(
      'action',
      <>
        {!inline ? (
          <p className="wb-action-card__lead !mb-0 min-w-0 flex-1 font-medium text-slate-800">
            Next: {nextTitle}
          </p>
        ) : null}
        <Button
          variant="primary"
          size="sm"
          className="wb-advance-cta wb-advance-cta--emphasis shrink-0"
          onPress={() => advanceWorkflowStage(c.id)}
        >
          Continue to {nextTitle}
        </Button>
      </>,
    )
  }

  const finOk = Boolean(c.financialSignOff?.signedOffAt)

  return wrap(
    'action',
    <>
      {!inline ? (
        <p className="wb-action-card__lead !mb-0 min-w-0 flex-1 font-medium text-slate-800">
          {finOk
            ? `AI recommends ${c.recommendation.toUpperCase()}`
            : 'Complete financial sign off in Getting Ready to Quote before Quote.'}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <Button
          variant="primary"
          size="sm"
          className="wb-advance-cta wb-advance-cta--emphasis"
          isDisabled={scanning || !finOk}
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
          Escalate
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
          {scanning ? 'Scanning…' : 'Run ingest again'}
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
    </>,
  )
}
