import { ShieldAlert } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { riskMeasuresForCase } from '../data/clientFeedbackDemo'
import { carrierExposureForCase, formatExposureUsd } from '../data/riskVizDemo'
import type { CyberCase } from '../types'
import { InfoTip } from './InfoTip'
import { LossRunAnalysis } from './LossRunAnalysis'
import { deskModelExplainContent, RiskVizPanel } from './RiskVizCharts'
import {
  ScoreExplainModal,
  toScoreExplainContent,
  type ScoreExplainContent,
  type ScoreExplainKind,
} from './ScoreExplainModal'

const RATE_FLOOR = 15_000
const LIMIT_REFER = 10_000_000

function money(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function premiumFor(c: CyberCase) {
  return c.financialSignOff?.stubPremiumUsd ?? Math.round(c.limitRequestedUsd * 0.012)
}

function ratePerMillion(c: CyberCase) {
  if (c.limitRequestedUsd <= 0) return 0
  return Math.round((premiumFor(c) * 1_000_000) / c.limitRequestedUsd)
}

/** Composite fill: red (low) → amber (mid) → green (high). */
function compositeSpectrumColor(score: number): string {
  const t = clamp(score) / 100
  const mix = (a: [number, number, number], b: [number, number, number], p: number) =>
    `rgb(${Math.round(a[0] + (b[0] - a[0]) * p)} ${Math.round(a[1] + (b[1] - a[1]) * p)} ${Math.round(a[2] + (b[2] - a[2]) * p)})`
  const bad: [number, number, number] = [0xaf, 0x29, 0x22]
  const mid: [number, number, number] = [0xb5, 0x47, 0x08]
  const good: [number, number, number] = [0x3c, 0x92, 0x3c]
  if (t < 0.5) return mix(bad, mid, t / 0.5)
  return mix(mid, good, (t - 0.5) / 0.5)
}

function AdequacyGauge({ label }: { label: string }) {
  const tone = label === 'Adequate' ? 82 : label === 'Tight' ? 55 : 28
  const fill = compositeSpectrumColor(tone)

  return (
    <div
      className="ra-gauge"
      style={{ '--ra-gauge-fill': fill } as CSSProperties}
      aria-label={`Coverage adequacy ${label}`}
    >
      <svg className="ra-gauge__svg" viewBox="0 0 140 78" role="img" aria-hidden>
        <path
          className="ra-gauge__track"
          d="M 16 62 A 54 54 0 0 1 124 62"
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          className="ra-gauge__value"
          d="M 16 62 A 54 54 0 0 1 124 62"
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${tone} 100`}
        />
      </svg>
      <strong className="ra-gauge__readout">{label}</strong>
    </div>
  )
}

function measureWhyNote(measure: {
  id: string
  label: string
  score: number
  tone: 'ok' | 'watch' | 'action'
  statusLabel?: string
}): string {
  switch (measure.id) {
    case 'cyber-risk':
      if (measure.tone === 'action') {
        return `${measure.score}/100 means elevated document risk load — triage fails, findings, or open gaps are pushing this file into the action band (≥70).`
      }
      if (measure.tone === 'watch') {
        return `${measure.score}/100 is a watch-band document risk load (45–69). Review the drivers before pricing.`
      }
      return `${measure.score}/100 is within band (<45). Document risk load from the package is not elevated.`
    case 'control-eff':
      if (measure.tone === 'action') {
        return `${measure.score}/100 means control posture is weak (<55) — open gaps, contradicted attestations, or failed application floors are dragging effectiveness down.`
      }
      if (measure.tone === 'watch') {
        return `${measure.score}/100 is a watch-band control score (55–74). Controls are only partially affirmed by the package.`
      }
      return `${measure.score}/100 means strong control effectiveness (≥75). Attested controls hold up against extracted evidence.`
    case 'appetite':
      if (measure.statusLabel === 'Decline' || measure.tone === 'action') {
        return `${measure.score}/100 maps to Decline — a hard appetite or package rule failed on this submission.`
      }
      if (measure.statusLabel === 'Refer' || measure.tone === 'watch') {
        return `${measure.score}/100 maps to Refer — at least one appetite or control rule needs escalation.`
      }
      return `${measure.score}/100 maps to Within Appetite — no refer/decline rule fired on the extracted package.`
    default:
      return `${measure.label} is ${measure.score}/100 on this submission.`
  }
}

type BrandKey = 'e' | 'c' | 'cr' | 'le' | 'l'

function brandForMeasure(id: string): BrandKey {
  if (id === 'cyber-risk') return 'cr'
  if (id === 'control-eff') return 'c'
  if (id === 'appetite') return 'l'
  return 'e'
}

function brandLabel(key: BrandKey) {
  switch (key) {
    case 'e':
      return 'E'
    case 'c':
      return 'C'
    case 'cr':
      return 'CR'
    case 'le':
      return 'LE'
    case 'l':
      return 'L'
    default: {
      const neverKey: never = key
      return neverKey
    }
  }
}

function toneClass(tone: 'ok' | 'watch' | 'action'): string {
  switch (tone) {
    case 'ok':
      return 'ra-measure--ok'
    case 'watch':
      return 'ra-measure--watch'
    case 'action':
      return 'ra-measure--action'
    default: {
      const neverTone: never = tone
      return neverTone
    }
  }
}

function explainKindForMeasure(id: string): ScoreExplainKind | null {
  switch (id) {
    case 'cyber-risk':
      return 'cyberRisk'
    case 'control-eff':
      return 'controlEffectiveness'
    case 'appetite':
      return 'appetiteResult'
    default:
      return null
  }
}

export function RiskAnalysisDesk({ c }: { c: CyberCase }) {
  const [whyExplain, setWhyExplain] = useState<ScoreExplainContent | null>(null)
  const [methodKind, setMethodKind] = useState<ScoreExplainKind | null>(null)

  const measures = riskMeasuresForCase(c)
  const rate = ratePerMillion(c)
  const exposure = carrierExposureForCase(c)
  const appetiteMeasure = measures.find((m) => m.id === 'appetite')
  const hasLossRun = c.packageDocs.some(
    (doc) => /loss/i.test(doc.name) || /loss/i.test(doc.kind),
  )

  const lossAdequacyLabel =
    exposure.adequacy === 'adequate'
      ? 'Acceptable'
      : exposure.adequacy === 'tight'
        ? 'Tight'
        : 'Shortfall'

  const bullets: { line: string; tip: string; severity: 'high' | 'neutral' }[] = [
    {
      line: `Requested limit ${money(c.limitRequestedUsd)} ${c.limitRequestedUsd > LIMIT_REFER ? 'sits above' : 'is inside'} the ${money(LIMIT_REFER)} platform referral line.`,
      tip: `Compares the requested limit with the ${money(LIMIT_REFER)} referral line.`,
      severity: c.limitRequestedUsd > LIMIT_REFER ? 'high' : 'neutral',
    },
    {
      line: appetiteMeasure
        ? `Appetite score ${appetiteMeasure.value}${appetiteMeasure.statusLabel ? ` (${appetiteMeasure.statusLabel})` : ''}.`
        : 'Appetite result is pending assessment.',
      tip: 'Numeric appetite fit 0–100 from Within Appetite / Refer / Decline rules on this submission.',
      severity: appetiteMeasure?.tone === 'ok' ? 'neutral' : 'high',
    },
    {
      line: `Loss Adequacy is ${lossAdequacyLabel} · worst-case ${formatExposureUsd(exposure.worstCaseTotalUsd)} vs limit ${formatExposureUsd(exposure.limitRequestedUsd)}.`,
      tip: 'Loss adequacy from the document-fed desk model (privacy, extortion, interruption).',
      severity: exposure.adequacy === 'adequate' ? 'neutral' : 'high',
    },
    {
      line: `Rate per million is ${money(rate)} against a ${money(RATE_FLOOR)} triage floor.`,
      tip: `Rate per million of limit against the ${money(RATE_FLOOR)} triage floor.`,
      severity: rate > 0 && rate < RATE_FLOOR ? 'high' : 'neutral',
    },
  ]

  const adequacyLabel = lossAdequacyLabel

  return (
    <section className="ra-sheet" aria-label="Risk Analysis">
      <header className="spec-info-panel__bar ra-sheet__bar">
        <h3>Risk Analysis</h3>
        <button
          type="button"
          className="ra-sheet__method"
          onClick={() => setWhyExplain(deskModelExplainContent(c))}
        >
          How this model works
        </button>
      </header>

      <div className="uw-risk-cards ra-measures ra-measures--with-ale" aria-label="Risk and appetite measures">
        <div className="ra-block ra-block--desk">
          <RiskVizPanel c={c} />
        </div>
        {measures.map((measure) => {
          const brand = brandForMeasure(measure.id)
          const bar = measure.score
          const method = explainKindForMeasure(measure.id)
          const openWhy = () =>
            setWhyExplain(
              toScoreExplainContent({
                title: `Why this score - ${measure.label}`,
                points: [measure.why.evidence, ...measure.why.rules],
                explainer: measureWhyNote(measure),
              }),
            )
          return (
            <article
              key={measure.id}
              className={`uw-risk-card ra-measure ${toneClass(measure.tone)}`}
              id={measure.id === 'appetite' ? 'appetite-rule' : undefined}
            >
              <button
                type="button"
                className="uw-risk-card__glyph"
                aria-label={`About ${measure.label}`}
                onClick={() => (method ? setMethodKind(method) : openWhy())}
              >
                <ShieldAlert size={15} strokeWidth={2.25} aria-hidden />
              </button>
              <div className="uw-risk-card__icon uw-risk-card__icon--badge" aria-hidden>
                <span className={`uw-brand-badge uw-brand-badge--${brand}`}>{brandLabel(brand)}</span>
              </div>
              <strong className="uw-risk-card__score">{measure.value}</strong>
              <p className="uw-risk-card__name">{measure.label}</p>
              <div className="uw-risk-card__foot">
                <button type="button" className="uw-risk-card__why" onClick={openWhy}>
                  Why this score?
                </button>
                <em>{bar}/100</em>
              </div>
              <i className="uw-risk-card__bar" aria-hidden>
                <b style={{ width: `${bar}%` }} />
              </i>
            </article>
          )
        })}
      </div>

      <div className="ra-scoreline">
        <div className="ra-score">
          <p>
            Coverage adequacy
            <InfoTip text="From the document-fed desk model: requested limit versus worst-case privacy, extortion, and interruption stack." />
          </p>
          <AdequacyGauge label={adequacyLabel} />
        </div>
        <div className="ra-summary">
          <p>High Level Summary</p>
          <ul>
            {bullets.map((item) => (
              <li key={item.line} className={`ra-summary__item ra-summary__item--${item.severity}`}>
                <InfoTip text={item.tip} />
                <span>{item.line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {hasLossRun ? (
        <div className="ra-block ra-block--loss">
          <LossRunAnalysis c={c} />
        </div>
      ) : null}

      <ScoreExplainModal
        content={whyExplain}
        open={whyExplain != null}
        onClose={() => setWhyExplain(null)}
      />
      <ScoreExplainModal
        kind={methodKind}
        open={methodKind != null}
        onClose={() => setMethodKind(null)}
      />

      {c.vendors.length ? (
        <div className="ra-block">
          <h5>Exposure summary</h5>
          <div className="spec-grid-wrap spec-grid-wrap--nested">
            <table className="spec-grid spec-grid--exposure">
              <thead>
                <tr className="spec-grid__groups">
                  <th colSpan={2}>Vendor</th>
                  <th>Book</th>
                </tr>
                <tr className="spec-grid__cols">
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Book</th>
                </tr>
              </thead>
              <tbody>
                {c.vendors.map((vendor) => (
                  <tr key={vendor.vendor}>
                    <td>
                      <strong>{vendor.vendor}</strong>
                    </td>
                    <td>{vendor.category}</td>
                    <td className="spec-grid__num">{vendor.bookCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  )
}
