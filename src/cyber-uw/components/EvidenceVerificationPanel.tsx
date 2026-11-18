import { useState } from 'react'
import {
  evidenceControlsForCase,
  type VerificationStatus,
} from '../data/clientFeedbackDemo'
import type { CyberCase } from '../types'
import { ScoreExplainModal } from './ScoreExplainModal'
import { SpecStatusPill, verificationIcon, type SpecStatusTone } from './SpecStatusPill'

function resultTone(result: VerificationStatus): SpecStatusTone {
  switch (result) {
    case 'Verified':
      return 'ok'
    case 'Partially Verified':
      return 'mid'
    case 'Contradicted':
      return 'bad'
    case 'Missing Evidence':
      return 'miss'
    case 'Not Applicable':
      return 'na'
    default: {
      const neverResult: never = result
      return neverResult
    }
  }
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

export function EvidenceVerificationPanel({ c }: { c: CyberCase }) {
  const rows = evidenceControlsForCase(c)
  const [explainOpen, setExplainOpen] = useState(false)

  return (
    <section className="spec-info-panel" aria-label="Evidence">
      <header className="spec-info-panel__bar">
        <h3>Evidence</h3>
        
      </header>

      <div className="spec-grid-wrap">
        <table className="spec-grid">
          <thead>
            <tr className="spec-grid__groups">
              <th colSpan={1}>Control</th>
              <th colSpan={2}>Evidence</th>
              <th colSpan={2}>Assessment</th>
            </tr>
            <tr className="spec-grid__cols">
              <th>Control</th>
              <th>Document Evidence</th>
              <th>External Observation</th>
              <th>Verification Result</th>
              <th>
                <HeaderHelp
                  label="Confidence"
                  tip="How much we can trust this field’s value from document and external sources. Click for scoring detail."
                  onOpen={() => setExplainOpen(true)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                id={row.control === 'MFA' ? 'evidence-mfa' : undefined}
                className={row.contradiction ? 'spec-grid__row--conflict' : undefined}
              >
                <td>
                  <strong>{row.control}</strong>
                  {row.contradiction ? <span className="spec-grid-flag">Conflict</span> : null}
                </td>
                <td>{row.documentEvidence}</td>
                <td>{row.externalObservation}</td>
                <td>
                  <SpecStatusPill tone={resultTone(row.result)} icon={verificationIcon[row.result]}>
                    {row.result}
                  </SpecStatusPill>
                </td>
                <td className="spec-grid__num">{row.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ScoreExplainModal
        kind="evidenceConfidence"
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
      />
    </section>
  )
}
