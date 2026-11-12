import { caseHeaderMetrics } from '../data/clientFeedbackDemo'
import type { CyberCase } from '../types'

/** Persistent case strip — grouped columns with label above value (spec layout). */
export function CaseContextHeader({ c }: { c: CyberCase }) {
  const m = caseHeaderMetrics(c)
  const columns: { label: string; value: string }[][] = [
    [
      { label: 'Insured', value: m.insured },
      { label: 'Industry', value: m.industry },
    ],
    [
      { label: 'Revenue', value: m.revenue },
      { label: 'Requested Limit', value: m.requestedLimit },
    ],
    [
      { label: 'Cyber Risk', value: m.cyberRisk },
      { label: 'Appetite', value: m.appetite },
    ],
    [
      { label: 'Completeness', value: m.completeness },
      { label: 'Submission ID', value: c.id },
    ],
  ]

  return (
    <div className="case-ctx-header" role="group" aria-label="Case context">
      {columns.map((pairs, index) => (
        <div key={pairs[0]?.label ?? index} className="case-ctx-header__col">
          {pairs.map((cell) => (
            <div key={cell.label} className="case-ctx-header__pair">
              <span className="case-ctx-header__label">{cell.label}</span>
              <span
                className={`case-ctx-header__value${
                  cell.label === 'Appetite'
                    ? m.appetite === 'Within Appetite'
                      ? ' appetite-tone--pass'
                      : m.appetite === 'Refer'
                        ? ' appetite-tone--refer'
                        : ' appetite-tone--decline'
                    : ''
                }`}
                title={cell.value}
              >
                {cell.value}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
