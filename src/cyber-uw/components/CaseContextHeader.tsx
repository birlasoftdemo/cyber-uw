import type { CyberCase } from '../types'
import { narrativeForCase } from '../data/caseNarrative'
import { formatCompactUsd } from '../../shared/workbench/CaseMetaFields'

function toneClass(value: string): string {
  if (value === 'High' || value === 'Decline' || value === 'Contradicted') return 'cuw-case-header__value--bad'
  if (value === 'Elevated' || value === 'Refer' || value === 'Moderate') return 'cuw-case-header__value--warn'
  if (value === 'Within Appetite' || value === 'Low') return 'cuw-case-header__value--ok'
  return ''
}

/** Persistent case facts. Stays on screen while the case file scrolls and when the case is open on other desks. */
export function CaseContextHeader({ c }: { c: CyberCase }) {
  const story = narrativeForCase(c)
  const fields: { label: string; value: string; tone?: string }[] = [
    { label: 'Insured', value: c.insured },
    { label: 'Industry', value: c.sector },
    { label: 'Revenue', value: formatCompactUsd(c.revenueUsd) },
    { label: 'Requested Limit', value: formatCompactUsd(c.limitRequestedUsd) },
    { label: 'Cyber Risk', value: story.cyberRisk.label, tone: toneClass(story.cyberRisk.label) },
    { label: 'Appetite', value: story.appetite.result, tone: toneClass(story.appetite.result) },
    { label: 'Completeness', value: `${story.completeness.pct}%` },
  ]

  return (
    <section className="cuw-case-header" id="cuw-case-header" aria-label="Case header" data-case-id={c.id}>
      <dl>
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd className={field.tone}>{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
