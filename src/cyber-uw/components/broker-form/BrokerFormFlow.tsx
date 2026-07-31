import { useEffect, useMemo, useState } from 'react'
import {
  buildBrokerPath,
  demoAnswersForPath,
  type BrokerStepDef,
} from '../../constants/brokerFormSteps'
import { BrokerFormShell } from './BrokerFormShell'

export type BrokerFormMode = 'live' | 'review'

interface Props {
  moduleIds: string[]
  insuredHint?: string
  brokerName?: string
  brokerFirm?: string
  packageLabel?: string
  mode?: BrokerFormMode
  compact?: boolean
  /** When true, start on first question with dossier prefills available. */
  dossierReady?: boolean
}

type PrefillState = 'proposed' | 'confirmed' | 'cleared' | null

export function BrokerFormFlow({
  moduleIds,
  insuredHint,
  brokerName = 'Alex Morgan',
  brokerFirm = 'Meridian Risk Brokers',
  packageLabel,
  mode = 'live',
  compact,
  dossierReady = true,
}: Props) {
  const path = useMemo(() => buildBrokerPath(moduleIds), [moduleIds])
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [view, setView] = useState<'question' | 'review'>(mode === 'review' ? 'review' : 'question')
  const [prefillState, setPrefillState] = useState<PrefillState>(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setStepIndex(0)
    setView(mode === 'review' ? 'review' : 'question')
    if (mode === 'review') {
      setAnswers(demoAnswersForPath(path))
    } else {
      setAnswers({})
    }
  }, [moduleIds.join('|'), mode, path])

  const step: BrokerStepDef | undefined = path[stepIndex]
  const total = Math.max(path.length, 1)

  useEffect(() => {
    if (!step || view !== 'question') {
      setPrefillState(null)
      return
    }
    if (dossierReady && step.proposal && answers[step.id] == null) {
      setPrefillState('proposed')
      setAnswers((prev) => ({ ...prev, [step.id]: step.proposal!.value }))
    } else if (answers[step.id] != null && prefillState == null) {
      setPrefillState(null)
    } else if (!step.proposal) {
      setPrefillState(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset gate when step changes
  }, [step?.id, view, dossierReady])

  useEffect(() => {
    setPulse(true)
    const t = window.setTimeout(() => setPulse(false), 450)
    return () => window.clearTimeout(t)
  }, [stepIndex, view])

  const progressPct =
    view === 'review' ? 100 : path.length === 0 ? 0 : Math.round(((stepIndex + 1) / total) * 100)
  const counterLabel =
    view === 'review' ? 'Review' : path.length === 0 ? '—' : `${stepIndex + 1} / ${total}`

  const currentValue = step ? (answers[step.id] ?? '') : ''
  const blockedByPrefill = Boolean(step?.proposal && prefillState === 'proposed')
  const canContinue =
    path.length > 0 &&
    view === 'question' &&
    Boolean(currentValue.trim()) &&
    !blockedByPrefill

  const goNext = () => {
    if (view === 'review') return
    if (stepIndex >= path.length - 1) {
      setView('review')
      return
    }
    setStepIndex((i) => i + 1)
  }

  const goBack = () => {
    if (view === 'review') {
      setView('question')
      setStepIndex(Math.max(path.length - 1, 0))
      return
    }
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  const setValue = (value: string) => {
    if (!step) return
    setAnswers((prev) => ({ ...prev, [step.id]: value }))
    if (prefillState === 'proposed') setPrefillState('confirmed')
  }

  const renderControl = () => {
    if (!step) {
      return (
        <p className="cuw-broker__sub">Turn on at least one module to preview the broker path.</p>
      )
    }

    const fieldClass =
      prefillState === 'proposed'
        ? 'cuw-broker__field cuw-broker__field--proposed'
        : prefillState === 'confirmed'
          ? 'cuw-broker__field cuw-broker__field--confirmed'
          : 'cuw-broker__field'

    if (step.type === 'choice') {
      return (
        <div className="cuw-broker__control">
          {(step.options ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              className="cuw-broker__choice"
              aria-pressed={currentValue === opt}
              onClick={() => setValue(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )
    }

    if (step.type === 'multi') {
      const selected = new Set(currentValue ? currentValue.split(' · ') : [])
      return (
        <div className="cuw-broker__control">
          {(step.options ?? []).map((opt) => {
            const on = selected.has(opt)
            return (
              <button
                key={opt}
                type="button"
                className="cuw-broker__choice"
                aria-pressed={on}
                onClick={() => {
                  const next = new Set(selected)
                  if (on) next.delete(opt)
                  else next.add(opt)
                  setValue([...next].join(' · '))
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )
    }

    if (step.type === 'textarea') {
      return (
        <textarea
          className={fieldClass}
          rows={4}
          value={currentValue}
          onChange={(e) => setValue(e.target.value)}
        />
      )
    }

    const inputType =
      step.type === 'url' ? 'url' : step.type === 'number' ? 'number' : step.type === 'date' ? 'date' : 'text'

    return (
      <input
        className={fieldClass}
        type={inputType}
        value={currentValue}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canContinue) goNext()
        }}
      />
    )
  }

  return (
    <BrokerFormShell
      compact={compact}
      brokerName={brokerName}
      brokerFirm={brokerFirm}
      progressPct={progressPct}
      counterLabel={counterLabel}
      counterPulse={pulse}
      footerHint={
        view === 'question' && step && step.type !== 'textarea' && !blockedByPrefill
          ? 'Press Enter to continue'
          : blockedByPrefill
            ? 'Confirm or clear the proposed answer'
            : undefined
      }
      footerLeft={
        <button
          type="button"
          className="cuw-broker__btn"
          disabled={view === 'question' && stepIndex === 0}
          onClick={goBack}
        >
          Back
        </button>
      }
      footerRight={
        view === 'review' ? (
          <button type="button" className="cuw-broker__btn cuw-broker__btn--primary" disabled>
            Submitted
          </button>
        ) : (
          <button
            type="button"
            className="cuw-broker__btn cuw-broker__btn--primary"
            disabled={!canContinue}
            onClick={goNext}
          >
            {stepIndex >= path.length - 1 ? 'Review' : 'Continue'}
          </button>
        )
      }
    >
      <section key={`${view}-${step?.id ?? 'empty'}`} className="cuw-broker__section">
        {view === 'review' ? (
          <>
            <h1 className="cuw-broker__q">Review &amp; submit</h1>
            <p className="cuw-broker__sub">
              {packageLabel ? `${packageLabel} · ` : ''}
              {insuredHint ? `Applicant: ${insuredHint}` : 'Answers attested for underwriter review.'}
            </p>
            <ul className="cuw-broker__review-list">
              {path.map((s) => (
                <li key={s.id}>
                  <div>
                    <div className="cuw-broker__review-q">{s.q}</div>
                    <div className="cuw-broker__review-v">{answers[s.id] || '—'}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cuw-broker__submit-panel">
              <div className="cuw-broker__user-card">
                <span className="cuw-broker__avatar">
                  {brokerName
                    .split(/\s+/)
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div>
                  <strong>{brokerName}</strong>
                  <span>
                    {brokerFirm}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="cuw-broker__q">
              {step?.q ?? 'Select modules to build the broker path'}
            </h1>
            {step?.proposal && prefillState === 'proposed' ? (
              <div className="cuw-broker__provenance">
                <div className="cuw-broker__provenance-icon" aria-hidden>
                  PDF
                </div>
                <div>
                  <strong>{step.proposal.source}</strong>
                  <span>{step.proposal.loc}</span>
                  <div className="cuw-broker__link-arrow">Filled into this question</div>
                </div>
              </div>
            ) : null}
            {renderControl()}
            {step?.proposal && prefillState === 'proposed' ? (
              <div className="cuw-broker__prefill-actions">
                <button
                  type="button"
                  className="cuw-broker__btn cuw-broker__btn--primary"
                  onClick={() => setPrefillState('confirmed')}
                >
                  Confirm answer
                </button>
                <button
                  type="button"
                  className="cuw-broker__btn cuw-broker__btn--ghost"
                  onClick={() => {
                    setPrefillState('cleared')
                    if (step) setAnswers((prev) => ({ ...prev, [step.id]: '' }))
                  }}
                >
                  Clear and enter my own
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </BrokerFormShell>
  )
}
