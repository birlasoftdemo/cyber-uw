import { Button, Chip } from '@heroui/react'
import { AlertTriangle, ArrowDown, Check } from 'lucide-react'
import {
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  canLeavePolicyDocuments,
  canLeaveRiskInformation,
  canOpsMarkReadyForUw,
  CYBER_FLOW_STAGES,
  cyberFlowIndex,
  nextFlowStageTitle,
  unsignedRequiredFindingIds,
} from '../constants/cyberFlow'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase, CyberDecision } from '../types'

const SCROLL_BOTTOM_PX = 64

function WorkflowStatus({
  title,
  tone = 'neutral',
}: {
  title: ReactNode
  tone?: 'neutral' | 'warn' | 'ok'
}) {
  return (
    <div className={`cuw-float-bar__status cuw-float-bar__status--${tone}`}>
      <p className="cuw-float-bar__status-title">{title}</p>
    </div>
  )
}

function PrimaryWorkflowCTA({
  label,
  onPress,
  disabled = false,
  ready = false,
  ariaLabel,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  ready?: boolean
  ariaLabel?: string
}) {
  return (
    <div
      className={`cuw-float-cta${ready && !disabled ? ' cuw-float-cta--ready' : ''}${
        disabled ? ' cuw-float-cta--disabled' : ''
      }`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <span className="cuw-float-cta__depth" aria-hidden />
      <Button
        variant="primary"
        className="cuw-float-cta__btn"
        isDisabled={disabled}
        aria-disabled={disabled}
        aria-label={ariaLabel ?? label}
        onPress={() => {
          if (disabled) return
          onPress()
        }}
      >
        {label}
      </Button>
    </div>
  )
}

function useNearBottom(scrollRoot: RefObject<HTMLElement | null>, enabled: boolean) {
  const [nearBottom, setNearBottom] = useState(!enabled)

  useEffect(() => {
    if (!enabled) {
      setNearBottom(true)
      return
    }
    const el = scrollRoot.current
    if (!el) {
      setNearBottom(false)
      return
    }

    const check = () => {
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
      // Short content that fits without scrolling counts as reviewed.
      if (el.scrollHeight <= el.clientHeight + SCROLL_BOTTOM_PX) {
        setNearBottom(true)
        return
      }
      setNearBottom(remaining <= SCROLL_BOTTOM_PX)
    }

    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null
    ro?.observe(el)
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      ro?.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [scrollRoot, enabled])

  return nearBottom
}

function scrollToFirstUnsigned(ids: string[]) {
  const id = ids[0]
  if (!id) return
  window.dispatchEvent(new CustomEvent('cuw-focus-risk-finding', { detail: { id } }))
  window.setTimeout(() => {
    document.getElementById(`risk-item-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, 80)
}

interface FloatingWorkflowBarProps {
  c: CyberCase
  scrollRootRef: RefObject<HTMLElement | null>
  /** Birlasoft Customer Insights summary vs workflow stages. */
  surface?: 'c360' | 'workflow'
  onRequestDecision: (d: Exclude<CyberDecision, 'pending'>) => void
  onSignal: () => void
  onRequestDocumentsComplete: () => void
}

export function FloatingWorkflowBar({
  c,
  scrollRootRef,
  surface = 'workflow',
  onRequestDecision,
  onSignal,
  onRequestDocumentsComplete,
}: FloatingWorkflowBarProps) {
  const role = useAuthStore((s) => s.user?.role)
  const isOps = role === 'ops'
  const advanceWorkflowStage = useCyberUwStore((s) => s.advanceWorkflowStage)
  const dismissCustomer360 = useCyberUwStore((s) => s.dismissCustomer360)
  const markReadyForUw = useCyberUwStore((s) => s.markReadyForUw)
  const markPackageComplete = useCyberUwStore((s) => s.markPackageComplete)
  const scanning = c.signalStatus === 'scanning'
  const pending = c.decision === 'pending'
  const idx = cyberFlowIndex(c)
  const nextTitle = nextFlowStageTitle(idx)
  const scrollGate = surface === 'workflow' && idx === 1 && pending
  const nearBottom = useNearBottom(scrollRootRef, scrollGate)
  const unsignedIds = unsignedRequiredFindingIds(c)
  const riClear = canLeaveRiskInformation(c)

  let body: ReactNode = null

  if (surface === 'c360') {
    body = (
      <>
        <WorkflowStatus
          title="Birlasoft Customer Insights"
        />
        <PrimaryWorkflowCTA
          label="Continue to Submission Workbench →"
          onPress={() => {
            dismissCustomer360(c.id)
            document.getElementById('cuw-workbench-root')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }}
          ready
        />
      </>
    )
  } else if (c.pasStatus === 'synced' || !pending) {
    body = (
      <WorkflowStatus
        title="Decision locked"
      />
    )
  } else if (isOps) {
    if (c.opsHandoffAt) {
      body = (
        <>
          <WorkflowStatus
            title="Handed off"
            tone="ok"
          />
          <Chip size="sm" variant="soft" color="success">
            Handed off
          </Chip>
        </>
      )
    } else if (c.completenessPct < 80) {
      body = (
        <>
          <WorkflowStatus
            title="Package incomplete"
            tone="warn"
          />
          <PrimaryWorkflowCTA
            label="Mark package complete"
            onPress={() => markPackageComplete(c.id)}
            ready
          />
        </>
      )
    } else if (canOpsMarkReadyForUw(c)) {
      body = (
        <>
          <WorkflowStatus
            title="Package complete"
            tone="ok"
          />
          <PrimaryWorkflowCTA label="Ready for UW" onPress={() => markReadyForUw(c.id)} ready />
        </>
      )
    } else {
      body = (
        <WorkflowStatus
          title="Ops owns Policy Documents"
        />
      )
    }
  } else if (idx === 0 && c.completenessPct < 80) {
    body = (
      <>
        <WorkflowStatus
          title="Package incomplete"
          tone="warn"
        />
        <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" isDisabled={scanning} onPress={onSignal}>
            {scanning ? 'Scanning…' : 'Run ingest again'}
          </Button>
        </span>
      </>
    )
  } else if (idx === 0 && !canLeavePolicyDocuments(c)) {
    body = (
      <>
        <WorkflowStatus
          title="Documents not signed off"
          tone="warn"
        />
        <PrimaryWorkflowCTA
          label="Documents Complete"
          onPress={onRequestDocumentsComplete}
          ready
        />
      </>
    )
  } else if (idx === 1) {
    if (!nearBottom) {
      body = (
        <>
          <WorkflowStatus
            title={
              <span className="cuw-float-bar__status-row">
                <ArrowDown size={14} strokeWidth={2.25} aria-hidden />
                Review remaining information
              </span>
            }
          />
          <PrimaryWorkflowCTA
            label={`Continue to ${nextTitle ?? 'Risk Analysis'} →`}
            onPress={() => {}}
            disabled
          />
        </>
      )
    } else if (!riClear) {
      body = (
        <>
          <WorkflowStatus
            title={
              <span className="cuw-float-bar__status-row">
                <AlertTriangle size={14} strokeWidth={2.25} aria-hidden />
                Items need attention
              </span>
            }
            tone="warn"
          />
          <PrimaryWorkflowCTA
            label="Review items →"
            onPress={() => scrollToFirstUnsigned(unsignedIds)}
            ready
            ariaLabel="Review items that need attention"
          />
        </>
      )
    } else {
      body = (
        <>
          <WorkflowStatus
            title={
              <span className="cuw-float-bar__status-row">
                <Check size={14} strokeWidth={2.5} aria-hidden />
                Risk Information complete
              </span>
            }
            tone="ok"
          />
          <PrimaryWorkflowCTA
            label={`Continue to ${nextTitle ?? 'Risk Analysis'} →`}
            onPress={() => advanceWorkflowStage(c.id)}
            ready
          />
        </>
      )
    }
  } else if (idx < 3 && nextTitle) {
    body = (
      <>
        <WorkflowStatus
          title={`Next: ${nextTitle}`}
        />
        <PrimaryWorkflowCTA
          label={`Continue to ${nextTitle} →`}
          onPress={() => advanceWorkflowStage(c.id)}
          ready
        />
      </>
    )
  } else {
    const finOk = Boolean(c.financialSignOff?.signedOffAt)
    body = (
      <>
        <WorkflowStatus
          title={
            finOk
              ? `AI recommends ${c.recommendation.toUpperCase()}`
              : 'Complete financial sign off before Quote'
          }
          tone={finOk ? 'ok' : 'warn'}
        />
        <div className="cuw-float-bar__decide" onClick={(e) => e.stopPropagation()}>
          <PrimaryWorkflowCTA
            label="Quote"
            onPress={() => onRequestDecision('quote')}
            disabled={scanning || !finOk}
            ready={finOk}
          />
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
        </div>
      </>
    )
  }

  const scrollToCurrentStage = () => {
    if (surface === 'c360') {
      document.getElementById('cuw-c360-root')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      return
    }
    const el = document.getElementById(`cuw-stage-${idx}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const focusLabel =
    surface === 'c360'
      ? 'Focus Birlasoft Customer Insights summary'
      : `Focus ${CYBER_FLOW_STAGES[Math.min(idx, CYBER_FLOW_STAGES.length - 1)]?.title ?? 'current'} stage`

  return (
    <div className="cuw-float-bar" role="region" aria-label="Workflow actions">
      <div
        className="cuw-float-bar__inner cuw-float-bar__inner--scrollable"
        role="button"
        tabIndex={0}
        aria-label={focusLabel}
        onClick={scrollToCurrentStage}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            scrollToCurrentStage()
          }
        }}
      >
        {body}
      </div>
    </div>
  )
}
