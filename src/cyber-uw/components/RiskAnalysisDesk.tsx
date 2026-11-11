import { useState } from 'react'
import { riskMeasuresForCase } from '../data/clientFeedbackDemo'
import type { CyberCase, GapSeverity } from '../types'
import { InfoTip } from './InfoTip'

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

function severityWeight(severity: GapSeverity) {
  switch (severity) {
    case 'critical':
      return 34
    case 'high':
      return 22
    case 'medium':
      return 12
    case 'info':
      return 6
    default: {
      const neverSeverity: never = severity
      return neverSeverity
    }
  }
}

function tone(score: number): 'high' | 'mid' | 'low' {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

type BrandKey = 'e' | 'c' | 'cr' | 'le' | 'l'

function brandForMeasure(id: string): BrandKey {
  if (id === 'cyber-risk') return 'cr'
  if (id === 'control-eff') return 'c'
  if (id === 'evidence-conf') return 'e'
  if (id === 'completeness') return 'c'
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

export function RiskAnalysisDesk({ c }: { c: CyberCase }) {
  const [whyId, setWhyId] = useState<string | null>(null)
  const measures = riskMeasuresForCase(c)
  const rate = ratePerMillion(c)
  const unresolved = c.gaps.filter((gap) => gap.disposition !== 'resolved')
  const gapLoad = unresolved.reduce((sum, gap) => sum + severityWeight(gap.severity), 0)
  const peakVendor = c.vendors.reduce<(typeof c.vendors)[number] | null>(
    (peak, vendor) => (peak == null || vendor.bookCount > peak.bookCount ? vendor : peak),
    null,
  )
  const attachment = clamp(28 + (c.limitRequestedUsd / LIMIT_REFER) * 26)
  const rateScore = clamp(rate <= 0 ? 50 : (RATE_FLOOR / Math.max(rate, 1)) * 72)
  const exposure = clamp((peakVendor?.bookCount ?? 0) * 2.1)
  const economics = clamp(100 - (attachment + rateScore) / 2.4)
  const attributes = clamp(100 - gapLoad * 0.7)
  const lossExperience = unresolved.some((gap) => /loss|claim/i.test(gap.control)) ? 60 : 100
  const submission = clamp(c.signalScore * 0.55 + c.completenessPct * 0.25 + (100 - gapLoad) * 0.2)

  const risks = [
    {
      score: attachment,
      title: 'Attachment Point',
      brand: 'l' as BrandKey,
      detail: `${money(c.limitRequestedUsd)} requested`,
      tip: `Higher means more concern. This score rises as the requested limit moves above the ${money(LIMIT_REFER)} referral line.`,
    },
    {
      score: rateScore,
      title: 'Rate on Line',
      brand: 'c' as BrandKey,
      detail: `${money(rate)} per million`,
      tip: `Higher means more concern. This score rises as the premium per million falls further under the ${money(RATE_FLOOR)} triage floor.`,
    },
    {
      score: exposure,
      title: 'Exposure Scale',
      brand: 'le' as BrandKey,
      detail: peakVendor ? `${peakVendor.vendor} · book ${peakVendor.bookCount}` : 'No vendor book',
      tip: 'Higher means more concern. This score rises with the number of policies already written on the busiest vendor.',
    },
  ]

  const categories = [
    {
      title: 'Economics',
      brand: 'e' as BrandKey,
      score: economics,
      note:
        rate >= RATE_FLOOR
          ? 'Rate clears the triage floor and the limit is inside the referral line.'
          : `Rate ${money(rate)} is under the ${money(RATE_FLOOR)} floor. Limit ${money(c.limitRequestedUsd)} is ${c.limitRequestedUsd > LIMIT_REFER ? 'above' : 'inside'} the ${money(LIMIT_REFER)} referral line.`,
      tip: `Higher is a cleaner fit. The score falls when the rate is under the ${money(RATE_FLOOR)} floor or the limit is over the ${money(LIMIT_REFER)} referral line.`,
    },
    {
      title: 'Risk Attributes',
      brand: 'c' as BrandKey,
      score: attributes,
      note:
        unresolved.length === 0
          ? 'No open control findings on this submission.'
          : unresolved
              .slice(0, 2)
              .map((gap) => gap.control)
              .join('; '),
      tip: 'Higher is cleaner. Each open control finding pulls this score down. Dispositioned findings leave it at the top of the scale.',
    },
    {
      title: 'Loss Experience',
      brand: 'le' as BrandKey,
      score: lossExperience,
      note:
        lossExperience === 100
          ? 'No loss or claim contradiction is on the submission.'
          : 'A loss or claim finding is still open against the attachment.',
      tip: '100 means no open loss or claim contradiction. An open loss finding drops the score.',
    },
  ]

  const bullets = [
    {
      line: `Requested limit ${money(c.limitRequestedUsd)} ${c.limitRequestedUsd > LIMIT_REFER ? 'sits above' : 'is inside'} the ${money(LIMIT_REFER)} platform referral line.`,
      tip: `Compares the requested limit with the ${money(LIMIT_REFER)} referral line. A limit above that line raises the attachment score.`,
    },
    {
      line: `Rate per million is ${money(rate)} against a ${money(RATE_FLOOR)} triage floor.`,
      tip: `Rate per million of limit against the ${money(RATE_FLOOR)} triage floor. A rate under the floor raises the rate-on-line score.`,
    },
    {
      line: peakVendor
        ? `Vendor concentration peaks at ${peakVendor.vendor} (${peakVendor.bookCount} on the book, ${peakVendor.limitHint}).`
        : 'No vendor concentration is on the submission.',
      tip: 'Names the vendor with the most policies already on the book. A larger book count raises the exposure score.',
    },
    {
      line: unresolved.length
        ? `Open findings: ${unresolved.map((gap) => gap.control).join('; ')}.`
        : 'Control findings are dispositioned.',
      tip: 'Open control findings lower the risk-attributes score. Dispositioned findings leave that score at the top of the scale.',
    },
  ]

  return (
    <section className="ra-sheet" aria-label="Risk Analysis">
      <header className="ra-sheet__head">
        <h4>Risk assessment</h4>
      </header>
      <div className="ra-measures" aria-label="Risk and appetite measures">
        {measures.map((measure) => {
          const brand = brandForMeasure(measure.id)
          return (
          <article key={measure.id} className={`ra-measure ra-measure--${measure.tone} ra-measure--brand-${brand}`} id={measure.id === 'appetite' ? 'appetite-rule' : undefined}>
            <header>
              <p>
                <span className={`uw-brand-badge uw-brand-badge--sm uw-brand-badge--${brand}`} aria-hidden="true">
                  {brandLabel(brand)}
                </span>
                <span>{measure.label}</span>
              </p>
              <strong>{measure.value}</strong>
            </header>
            <button
              type="button"
              className="ra-measure__why"
              aria-expanded={whyId === measure.id}
              onClick={() => setWhyId((cur) => (cur === measure.id ? null : measure.id))}
            >
              Why this result?
            </button>
            {whyId === measure.id ? (
              <div className="ra-measure__detail">
                <p>{measure.why.evidence}</p>
                <ul>
                  {measure.why.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
          )
        })}
      </div>
      <div className="ra-scoreline">
        <div className="ra-score">
          <p>
            Composite (legacy)
            <InfoTip text="Kept for continuity. Prefer the five measures above for underwriting judgment." />
          </p>
          <strong>{submission}</strong>
          <span>/ 100</span>
        </div>
        <div className="ra-summary">
          <p>High level summary</p>
          <ul>
            {bullets.map((item) => (
              <li key={item.line}>
                <InfoTip text={item.tip} />
                <span>{item.line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ra-block">
        <header className="ra-block__bar">
          <h5>Top risk</h5>
        </header>
        <div className="uw-risk-cards ra-risks">
          {risks.map((risk) => (
            <article
              key={risk.title}
              className={`uw-risk-card ra-risk ra-risk--${tone(risk.score)} uw-risk-card--${risk.brand}`}
            >
              <button type="button" className="uw-risk-card__menu" aria-label={`${risk.title} actions`}>
                ···
              </button>
              <div className={`uw-risk-card__icon uw-risk-card__icon--badge`} aria-hidden>
                <span className={`uw-brand-badge uw-brand-badge--${risk.brand}`}>{brandLabel(risk.brand)}</span>
              </div>
              <p className="uw-risk-card__label">
                Highest Risk Factor
                <InfoTip text={risk.tip} />
              </p>
              <strong className="uw-risk-card__score">{risk.score}</strong>
              <p className="uw-risk-card__name">{risk.title}</p>
              <div className="uw-risk-card__foot">
                <span>{risk.detail}</span>
                <em>{risk.score}%</em>
              </div>
              <i className="uw-risk-card__bar" aria-hidden>
                <b style={{ width: `${risk.score}%` }} />
              </i>
            </article>
          ))}
        </div>
      </div>
      <div className="ra-block">
        <h5>Category scores</h5>
        <div className="ra-cats">
          {categories.map((category) => (
            <article key={category.title} className={`ra-cat ra-cat--${category.brand}`}>
              <header>
                <p>
                  <span className={`uw-brand-badge uw-brand-badge--sm uw-brand-badge--${category.brand}`} aria-hidden="true">
                    {brandLabel(category.brand)}
                  </span>
                  <span>{category.title}</span>
                  <InfoTip text={category.tip} />
                </p>
                <strong>
                  {category.score}
                  <span>/ 100</span>
                </strong>
              </header>
              <p>{category.note}</p>
            </article>
          ))}
        </div>
      </div>
      {c.vendors.length ? (
        <div className="ra-block">
          <h5>Exposure summary</h5>
          <table className="ra-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Category</th>
                <th>Book</th>
              </tr>
            </thead>
            <tbody>
              {c.vendors.map((vendor) => (
                <tr key={vendor.vendor}>
                  <td>{vendor.vendor}</td>
                  <td>{vendor.category}</td>
                  <td>{vendor.bookCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
