import { Check } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { JOURNEY_STEPS, type JourneyStepId } from '../constants/journeyNav'

type StepState = 'completed' | 'current' | 'pending'

/** Dark → light green progression across the journey rail. */
const STAGE_GREENS = [
  '#065f46',
  '#047857',
  '#059669',
  '#10b981',
  '#34d399',
  '#6ee7b7',
  '#a7f3d0',
] as const

function stageGreen(index: number): string {
  return STAGE_GREENS[Math.min(index, STAGE_GREENS.length - 1)] ?? STAGE_GREENS[0]
}

function stateForIndex(index: number, currentIndex: number): StepState {
  if (index < currentIndex) return 'completed'
  if (index === currentIndex) return 'current'
  return 'pending'
}

function statusLabel(state: StepState): string {
  switch (state) {
    case 'completed':
      return 'Completed'
    case 'current':
      return 'In Progress'
    case 'pending':
      return 'Pending'
    default: {
      const _exhaustive: never = state
      return _exhaustive
    }
  }
}

function connectorState(index: number, currentIndex: number): 'done' | 'active' | 'todo' {
  if (index < currentIndex) return 'done'
  if (index === currentIndex) return 'active'
  return 'todo'
}

/** Vertical stage journey for the case sidebar — circle nodes, connectors, status. */
export function StageJourneyStepper({
  journeyStep,
  onJourney,
}: {
  journeyStep: JourneyStepId
  onJourney: (step: JourneyStepId) => void
}) {
  const currentIndex = Math.max(
    0,
    JOURNEY_STEPS.findIndex((step) => step.id === journeyStep),
  )

  return (
    <ol className="stage-journey stage-journey--rail">
      {JOURNEY_STEPS.map((step, index) => {
        const state = stateForIndex(index, currentIndex)
        const connector = connectorState(index, currentIndex)
        const isLast = index === JOURNEY_STEPS.length - 1
        const green = stageGreen(index)
        const nextGreen = stageGreen(index + 1)
        const itemStyle = {
          '--sj-green': green,
          '--sj-green-next': nextGreen,
        } as CSSProperties

        return (
          <li
            key={step.id}
            className={`stage-journey__item stage-journey__item--${state}`}
            style={itemStyle}
          >
            <button
              type="button"
              className="stage-journey__hit"
              aria-label={step.label}
              aria-current={state === 'current' ? 'step' : undefined}
              onClick={() => onJourney(step.id)}
            >
              <span className={`stage-journey__node stage-journey__node--${state}`} aria-hidden>
                {state === 'completed' ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              <span className="stage-journey__copy">
                <span className="stage-journey__title">{step.label}</span>
                <span className={`stage-journey__status stage-journey__status--${state}`}>
                  {statusLabel(state)}
                </span>
              </span>
            </button>
            {isLast ? null : (
              <span
                className={`stage-journey__connector stage-journey__connector--${connector}`}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Case chrome strip — prev/next left, actions right. */
export function JourneyPrevNextBar({
  journeyStep,
  onJourney,
  actions,
}: {
  journeyStep: JourneyStepId
  onJourney: (step: JourneyStepId) => void
  actions?: ReactNode
}) {
  const currentIndex = Math.max(
    0,
    JOURNEY_STEPS.findIndex((step) => step.id === journeyStep),
  )
  const count = JOURNEY_STEPS.length
  const atStart = currentIndex <= 0
  const atEnd = currentIndex >= count - 1

  return (
    <section className="spec-tracker" aria-label="Case stage navigation">
      <div className="spec-tracker__bar spec-tracker__bar--nav-only">
        <div className="spec-tracker__nav" role="group" aria-label="Stage previous and next">
          <button
            type="button"
            className="spec-tracker__prev"
            disabled={atStart}
            onClick={() => {
              if (atStart) return
              onJourney(JOURNEY_STEPS[currentIndex - 1].id)
            }}
          >
            ‹ Previous
          </button>
          <span className="spec-tracker__count">
            {currentIndex + 1} / {count}
          </span>
          <button
            type="button"
            className="spec-tracker__next"
            disabled={atEnd}
            onClick={() => {
              if (atEnd) return
              onJourney(JOURNEY_STEPS[currentIndex + 1].id)
            }}
          >
            Next ›
          </button>
        </div>
        <div className="spec-tracker__actions">{actions}</div>
      </div>
    </section>
  )
}
