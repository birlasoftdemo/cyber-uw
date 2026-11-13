import { ChevronDown } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  intakeMetricsForCase,
  type BrokerFollowUp,
  type IntakeDocStatus,
} from '../data/clientFeedbackDemo'
import type { CyberCase } from '../types'
import { DocSheetExtractedFields } from './SubmissionDocumentsPanel'
import { ScoreExplainModal, type ScoreExplainKind } from './ScoreExplainModal'
import {
  SpecStatusPill,
  followUpIcon,
  intakeStatusIcon,
  type SpecStatusTone,
} from './SpecStatusPill'

function statusTone(status: IntakeDocStatus): SpecStatusTone {
  switch (status) {
    case 'Extracted':
      return 'ok'
    case 'Classified':
    case 'Received':
      return 'mid'
    case 'Review Required':
    case 'Missing':
      return 'miss'
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

function followUpTone(value: BrokerFollowUp): SpecStatusTone {
  switch (value) {
    case 'Required':
      return 'miss'
    case 'Not Required':
      return 'ok'
    default: {
      const neverValue: never = value
      return neverValue
    }
  }
}

function MetricIcon() {
  return (
    <span className="intake-metric__icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
        <rect x="5.5" y="3.5" width="9" height="12" rx="1.4" stroke="#fff" strokeWidth="1.4" />
        <rect x="3.5" y="5.5" width="9" height="12" rx="1.4" fill="#1b1564" stroke="#fff" strokeWidth="1.4" />
      </svg>
    </span>
  )
}

function HeaderHelp({
  label,
  tip,
  onOpen,
}: {
  label: string
  tip: string
  onOpen: () => void
}) {
  return (
    <span className="spec-grid__th-help">
      <span>{label}</span>
      <button
        type="button"
        className="spec-grid__th-tip"
        title={tip}
        aria-label={`Explain ${label}`}
        onClick={(event) => {
          event.stopPropagation()
          onOpen()
        }}
      >
        i
      </button>
      <span className="spec-grid__th-tip-bubble" role="tooltip">
        {tip}
      </span>
    </span>
  )
}

/** Cyber document checklist + missing-docs / duplicate-check metrics for Submission intake. */
export function SubmissionIntakePanel({ c }: { c: CyberCase }) {
  const metrics = intakeMetricsForCase(c)
  const firstAttentionId = useMemo(
    () =>
      metrics.docs.find((doc) => doc.status === 'Missing' || doc.status === 'Review Required')?.id ??
      null,
    [metrics.docs],
  )
  const [expandedId, setExpandedId] = useState<string | null>(firstAttentionId)
  const [scoreExplain, setScoreExplain] = useState<ScoreExplainKind | null>(null)

  useEffect(() => {
    setExpandedId(firstAttentionId)
  }, [c.id, firstAttentionId])

  const toggleDoc = (docId: string) => {
    setExpandedId((current) => (current === docId ? null : docId))
  }

  return (
    <section className="spec-info-panel" aria-label="Intake">
      <header className="spec-info-panel__bar">
        <h3>Intake</h3>
        
      </header>

      <div className="intake-panel__metrics intake-panel__metrics--two" aria-label="Intake metrics">
        <article className="intake-metric">
          <MetricIcon />
          <span className="intake-metric__label">Missing Documents</span>
          <strong className="intake-metric__value">{metrics.missingDocs}</strong>
        </article>
        <article className="intake-metric">
          <MetricIcon />
          <span className="intake-metric__label">Duplicate Docs Check</span>
          <strong className="intake-metric__value intake-metric__value--complete">
            {metrics.duplicateCheckLabel}
          </strong>
        </article>
      </div>

      <div className="spec-grid-wrap">
        <table className="spec-grid">
          <thead>
            <tr className="spec-grid__groups">
              <th colSpan={3}>Document details</th>
              <th colSpan={2}>Quality checks</th>
            </tr>
            <tr className="spec-grid__cols">
              <th>Document</th>
              <th>Status</th>
              <th>Broker Follow-up</th>
              <th>
                <HeaderHelp
                  label="Confidence"
                  tip="How much we can trust the extracted value. Click for scoring detail."
                  onOpen={() => setScoreExplain('confidence')}
                />
              </th>
              <th>
                <HeaderHelp
                  label="Completeness"
                  tip="How full this document is for intake. Click for scoring detail."
                  onOpen={() => setScoreExplain('completeness')}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.docs.map((doc) => {
              const expanded = expandedId === doc.id
              return (
                <Fragment key={doc.id}>
                  <tr
                    className={`spec-grid__row--toggle${expanded ? ' spec-grid__row--open' : ''}`}
                    aria-expanded={expanded}
                    tabIndex={0}
                    onClick={() => toggleDoc(doc.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        toggleDoc(doc.id)
                      }
                    }}
                  >
                    <td>
                      <span className="spec-grid__doc-cell">
                        <button
                          type="button"
                          className="spec-grid__doc-toggle"
                          aria-label={expanded ? `Hide ${doc.name} details` : `Show ${doc.name} details`}
                          aria-expanded={expanded}
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleDoc(doc.id)
                          }}
                        >
                          <ChevronDown
                            size={16}
                            className={expanded ? 'is-open' : ''}
                            aria-hidden
                          />
                        </button>
                        <a
                          className="spec-grid__doc-link"
                          href={`#ref-doc/${encodeURIComponent(doc.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open reference document (demo link)"
                          onClick={(event) => {
                            event.stopPropagation()
                            event.preventDefault()
                          }}
                        >
                          {doc.name}
                        </a>
                      </span>
                    </td>
                    <td>
                      <SpecStatusPill tone={statusTone(doc.status)} icon={intakeStatusIcon[doc.status]}>
                        {doc.status}
                      </SpecStatusPill>
                    </td>
                    <td>
                      <SpecStatusPill
                        tone={followUpTone(doc.brokerFollowUp)}
                        icon={followUpIcon[doc.brokerFollowUp]}
                      >
                        {doc.brokerFollowUp}
                      </SpecStatusPill>
                    </td>
                    <td className="spec-grid__num">{doc.confidence}%</td>
                    <td className="spec-grid__num">{doc.completenessPct}%</td>
                  </tr>
                  {expanded ? (
                    <tr className="spec-grid__expand">
                      <td colSpan={5}>
                        <DocSheetExtractedFields c={c} docId={doc.id} docStatus={doc.status} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <ScoreExplainModal
        kind={scoreExplain}
        open={scoreExplain != null}
        onClose={() => setScoreExplain(null)}
      />
    </section>
  )
}
