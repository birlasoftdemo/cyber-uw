import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase } from '../types'
import { EnrichmentConsentModal } from './EnrichmentConsentModal'

const GROUPS = [
  { title: 'Review', steps: ['New Submission', 'Triage Analysis', 'Evidence Verification'] },
  { title: 'Assessment', steps: ['External Risk Enrichment', 'Internal Risk Analysis', 'Loss Run Analysis'] },
  { title: 'Policy center', steps: ['Sync to Policy Center'] },
] as const

const STEPS = GROUPS.flatMap((group) => group.steps)
const STEP_COUNT = STEPS.length

export function stageForTrackerStep(step: number): number {
  if (step <= 0) return 0
  if (step <= 2) return 1
  if (step <= 5) return 2
  return 3
}

export function trackerStepForCase(c: CyberCase): number {
  if (c.pasStatus === 'synced') return STEP_COUNT - 1
  const stage = c.workflowStage ?? 0
  if (stage <= 0) return 0
  if (stage === 1) return 1
  if (stage === 2) return 3
  return STEP_COUNT - 1
}

export function SpecProgressTracker({
  c,
  onStepChange,
}: {
  c: CyberCase
  onStepChange: (step: number) => void
}) {
  const user = useAuthStore((s) => s.user)
  const setWorkflowStage = useCyberUwStore((s) => s.setWorkflowStage)
  const recordEnrichmentConsent = useCyberUwStore((s) => s.recordEnrichmentConsent)
  const [step, setStep] = useState(() => trackerStepForCase(c))
  const [consentOpen, setConsentOpen] = useState(false)
  const [pendingStep, setPendingStep] = useState<number | null>(null)

  useEffect(() => {
    setStep((current) => {
      const actual = c.pasStatus === 'synced' ? 3 : (c.workflowStage ?? 0)
      if (stageForTrackerStep(current) === actual) return current
      return trackerStepForCase(c)
    })
  }, [c.id, c.workflowStage, c.pasStatus])

  const commitStep = (nextStep: number) => {
    setStep(nextStep)
  }

  useEffect(() => {
    onStepChange(step)
  }, [onStepChange, step])

  useEffect(() => {
    const publish = () => {
      if (step < 3 || step > 5) return
      const section = step === 5 ? 'loss' : step === 4 ? 'desk' : 'vendor'
      window.dispatchEvent(
        new CustomEvent('cuw-assessment-section', {
          detail: { section },
        }),
      )
    }
    publish()
    window.addEventListener('cuw-assessment-query', publish)
    return () => window.removeEventListener('cuw-assessment-query', publish)
  }, [step])

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(STEP_COUNT - 1, next))
    if (clamped === step) return
    const targetStage = stageForTrackerStep(clamped)
    const currentStage = c.workflowStage ?? 0

    if (
      targetStage >= 2 &&
      currentStage < 2 &&
      !(c.enrichmentConsent?.models.length)
    ) {
      setPendingStep(clamped)
      setConsentOpen(true)
      return
    }
    if (targetStage > currentStage) {
      setWorkflowStage(c.id, targetStage)
    }
    commitStep(clamped)
  }

  useEffect(() => {
    const onGo = (ev: Event) => {
      const next = (ev as CustomEvent<{ step?: number }>).detail?.step
      if (typeof next === 'number') go(next)
    }
    window.addEventListener('cuw-tracker-go', onGo)
    return () => window.removeEventListener('cuw-tracker-go', onGo)
  })

  let cursor = 0

  return (
    <section className="spec-tracker" aria-label="Progress tracker">
      <div className="spec-tracker__bar">
        <h2 className="spec-tracker__title">Progress Tracker</h2>
        <div className="spec-tracker__nav">
          <button
            type="button"
            className="spec-tracker__prev"
            disabled={step === 0}
            onClick={() => go(step - 1)}
          >
            ‹ Previous
          </button>
          <span className="spec-tracker__count">
            {step + 1} / {STEP_COUNT}
          </span>
          <button
            type="button"
            className="spec-tracker__next"
            disabled={step === STEP_COUNT - 1}
            onClick={() => go(step + 1)}
          >
            Next ›
          </button>
        </div>
      </div>
      <div className="spec-tracker__groups">
        {GROUPS.map((group) => {
          const start = cursor
          cursor += group.steps.length
          const end = cursor
          const done = step >= end
          const active = step >= start && step < end
          const fill = done ? 100 : active ? ((step - start + 0.45) / group.steps.length) * 100 : 0
          return (
            <div key={group.title} className="spec-tracker__group">
              <p className="spec-tracker__group-title">{group.title}</p>
              <div className="spec-tracker__track" aria-hidden>
                <span className="spec-tracker__fill" style={{ width: `${fill}%` }} />
              </div>
              <div className="spec-tracker__steps">
                {group.steps.map((label, i) => {
                  const index = start + i
                  const state = index < step ? 'done' : index === step ? 'current' : 'upcoming'
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`spec-tracker__step spec-tracker__step--${state}`}
                      aria-current={state === 'current' ? 'step' : undefined}
                      onClick={() => go(index)}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <EnrichmentConsentModal
        caseItem={c}
        open={consentOpen}
        onCancel={() => {
          setConsentOpen(false)
          setPendingStep(null)
        }}
        onConfirm={(models) => {
          recordEnrichmentConsent(c.id, models, {
            userId: user?.email ?? 'underwriter',
            userName: user?.name ?? 'Underwriter',
          })
          setConsentOpen(false)
          const nextStep = pendingStep
          setPendingStep(null)
          if (nextStep == null) return
          const stage = stageForTrackerStep(nextStep)
          setWorkflowStage(c.id, stage)
          commitStep(nextStep)
        }}
      />
    </section>
  )
}
