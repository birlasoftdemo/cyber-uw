import { narrativeForCase, type AppetiteResult } from '../data/caseNarrative'
import type { CyberCase } from '../types'
import { WhyThisResult } from './WhyThisResult'

function appetiteClass(result: AppetiteResult): string {
  switch (result) {
    case 'Within Appetite':
      return 'cuw-measure__value cuw-measure__value--ok'
    case 'Refer':
      return 'cuw-measure__value cuw-measure__value--warn'
    case 'Decline':
      return 'cuw-measure__value cuw-measure__value--bad'
    default: {
      const neverResult: never = result
      return neverResult
    }
  }
}

export function UnderwritingMeasures({ c }: { c: CyberCase }) {
  const story = narrativeForCase(c)
  const measures: {
    key: string
    label: string
    value: string
    valueClass?: string
    whyId: string
    why: string[]
  }[] = [
    {
      key: 'cyber-risk',
      label: 'Cyber Risk',
      value: story.cyberRisk.label,
      whyId: 'why-cyber-risk',
      why: story.cyberRisk.why,
    },
    {
      key: 'control-effectiveness',
      label: 'Control Effectiveness',
      value: `${story.controlEffectiveness.label} · ${story.controlEffectiveness.pct}%`,
      whyId: 'why-control-effectiveness',
      why: story.controlEffectiveness.why,
    },
    {
      key: 'evidence-confidence',
      label: 'Evidence Confidence',
      value: `${story.evidenceConfidence.label} · ${story.evidenceConfidence.pct}%`,
      whyId: 'why-evidence-confidence',
      why: story.evidenceConfidence.why,
    },
    {
      key: 'submission-completeness',
      label: 'Submission Completeness',
      value: `${story.completeness.pct}%`,
      whyId: 'why-completeness',
      why: story.completeness.why,
    },
    {
      key: 'appetite-result',
      label: 'Appetite Result',
      value: story.appetite.result,
      valueClass: appetiteClass(story.appetite.result),
      whyId: 'why-appetite',
      why: story.appetite.why,
    },
  ]

  return (
    <section className="cuw-feedback" id="underwriting-measures" aria-label="Risk analysis and appetite">
      <header className="cuw-feedback__head">
        <div>
          <p className="cuw-feedback__kicker">Risk analysis and appetite</p>
          <h4>Separate underwriting measures</h4>
          <p className="cuw-feedback__note">
            These five readings replace a single composite risk score. Each one can be opened on its own evidence.
          </p>
        </div>
      </header>
      <ul className="cuw-measures">
        {measures.map((measure) => (
          <li key={measure.key} className="cuw-measure">
            <div className="cuw-measure__top">
              <p>{measure.label}</p>
              <p className={measure.valueClass ?? 'cuw-measure__value'}>{measure.value}</p>
            </div>
            <WhyThisResult id={measure.whyId} evidence={measure.why} />
          </li>
        ))}
      </ul>
      <div className="cuw-rule" id="appetite-rules">
        <h5>Appetite rules</h5>
        {story.appetite.result === 'Within Appetite' ? (
          <p>Within Appetite. No referral or decline rule is triggered.</p>
        ) : (
          <p>
            Appetite result: <strong>{story.appetite.result}</strong>
            {story.appetite.triggerRule ? (
              <>
                . Triggered rule: <strong>{story.appetite.triggerRule}</strong>
              </>
            ) : null}
          </p>
        )}
        <ul>
          {story.appetite.rules.map((rule) => (
            <li key={rule.id} id={`appetite-rule-${rule.id}`}>
              <span className="cuw-status cuw-status--info">{rule.outcome}</span>
              <span>
                <strong>{rule.label}</strong>
                <em>{rule.detail}</em>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
