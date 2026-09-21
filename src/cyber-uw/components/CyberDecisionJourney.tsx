import { Button, Typography } from '@heroui/react'
import { ArrowRight, Check } from 'lucide-react'
import { CYBER_FLOW_STAGES, cyberFlowIndex } from '../constants/cyberFlow'
import type { CyberCase } from '../types'

/** Mirrors CaseProgressStepper — vertical rail only (case-detail pattern). */
export function CyberDecisionJourney({
  c,
  onJump,
}: {
  c: CyberCase
  onJump?: (stageIndex: number) => void
}) {
  const currentIdx = cyberFlowIndex(c)

  return (
    <nav aria-label="Cyber underwriting progress" className="min-w-[200px]">
      <ol className="flex flex-col">
        {CYBER_FLOW_STAGES.map((step, i) => {
          const isComplete = i < currentIdx
          const isCurrent = i === currentIdx
          const isUpcoming = i > currentIdx

          return (
            <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
              {i < CYBER_FLOW_STAGES.length - 1 && (
                <span
                  className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-px border-l-2 border-dotted ${
                    isComplete ? 'border-emerald-300' : 'border-slate-200'
                  }`}
                  aria-hidden
                />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isComplete
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isCurrent
                      ? 'wb-stepper-node--current border-2'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {isComplete ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <span className="text-[11px] font-semibold">{i + 1}</span>
                )}
              </span>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Typography.Paragraph
                    size="sm"
                    weight={isCurrent ? 'semibold' : 'medium'}
                    className={isUpcoming ? 'text-slate-400' : 'text-slate-900'}
                  >
                    {step.title}
                  </Typography.Paragraph>
                  {isCurrent && <span className="wb-stepper-badge--current">Current</span>}
                </div>
                {isCurrent && onJump ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onPress={() => onJump(i)}
                  >
                    Open stage
                    <ArrowRight size={12} />
                  </Button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
