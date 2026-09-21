import { Accordion, Chip, Typography } from '@heroui/react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  getThinkingDurationMs,
  resolveThinkingSteps,
  type StageThinkingKind,
  type ThinkingStep,
} from '../utils/agentThinkingUtils'
import { AiPanel } from './AiPanel'

interface Props {
  fromStatus?: string
  label: string
  namedInsured: string
  kind?: StageThinkingKind
  steps?: ThinkingStep[]
  headerText?: string
}

/** Compact agent-thinking strip — stage card or upload modal. */
export function StageAgentThinking({
  fromStatus = 'Policy Documents',
  label,
  namedInsured,
  kind = 'workflow',
  steps: stepsProp,
  headerText = 'Agent working this stage',
}: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(getThinkingDurationMs() / 1000))
  const steps = useMemo(
    () =>
      stepsProp ??
      resolveThinkingSteps({ kind, fromStatus, label, namedInsured }),
    [stepsProp, kind, fromStatus, label, namedInsured],
  )

  useEffect(() => {
    setActiveStep(0)
    setSecondsLeft(Math.ceil(getThinkingDurationMs() / 1000))

    const stepInterval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, Math.max(steps.length - 1, 0)))
    }, getThinkingDurationMs() / Math.max(steps.length, 1))

    const countdown = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)

    return () => {
      clearInterval(stepInterval)
      clearInterval(countdown)
    }
  }, [steps.length, fromStatus, label, namedInsured, kind])

  return (
    <div
      className="rounded-xl border border-violet-200 bg-violet-50/40 p-3"
      role="status"
      aria-busy="true"
      aria-label="Agent thinking"
    >
      <AiPanel
        title={
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin text-violet-600" />
            <span className="wb-shimmer-text">{headerText}</span>
          </span>
        }
        hint={`${label} · ~${secondsLeft}s · please wait`}
        showBadge
      >
        <Accordion variant="surface" className="smart-feedback-accordion">
          {steps.map((step, i) => (
            <Accordion.Item key={`${step.title}-${i}`} id={`stage-inline-think-${i}-${kind}`}>
              <Accordion.Heading>
                <div className="flex w-full items-center gap-2 py-1 text-left">
                  <Chip size="sm" variant="soft" color={i <= activeStep ? 'accent' : 'default'}>
                    {step.agent}
                  </Chip>
                  <Typography.Paragraph size="sm" weight="medium" className="flex-1 text-slate-800">
                    {step.title}
                  </Typography.Paragraph>
                  {i < activeStep && (
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-600" aria-hidden />
                  )}
                  {i === activeStep && (
                    <Loader2 size={14} className="shrink-0 animate-spin text-violet-600" aria-hidden />
                  )}
                </div>
              </Accordion.Heading>
              <Accordion.Panel>
                <Typography.Paragraph size="xs" className="text-slate-600">
                  {step.detail.replace(/\*\*/g, '')}
                </Typography.Paragraph>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </AiPanel>
    </div>
  )
}
