import { caseHeaderMetrics } from '../data/clientFeedbackDemo'
import type { CyberCase } from '../types'

/** Persistent case strip: Insured | Industry | Revenue | Limit | Cyber Risk | Appetite | Completeness. */
export function CaseContextHeader({ c }: { c: CyberCase }) {
  const m = caseHeaderMetrics(c)
  const cells: { label: string; value: string }[] = [
    { label: 'Insured', value: m.insured },
    { label: 'Industry', value: m.industry },
    { label: 'Revenue', value: m.revenue },
    { label: 'Requested Limit', value: m.requestedLimit },
    { label: 'Cyber Risk', value: m.cyberRisk },
    { label: 'Appetite', value: m.appetite },
    { label: 'Completeness', value: m.completeness },
  ]

  return (
    <div className="case-ctx-header" role="group" aria-label="Case context">
      {cells.map((cell) => (
        <div key={cell.label} className="case-ctx-header__cell">
          <span className="case-ctx-header__label">{cell.label}</span>
          <strong className="case-ctx-header__value" title={cell.value}>
            {cell.value}
          </strong>
        </div>
      ))}
    </div>
  )
}
