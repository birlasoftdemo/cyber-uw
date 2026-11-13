/** Desk model — loss composition and coverage KPIs. */

import {
  carrierExposureForCase,
  formatExposureUsd,
  type CoverageAdequacy,
} from '../data/riskVizDemo'
import type { CyberCase } from '../types'
import { toScoreExplainContent, type ScoreExplainContent } from './ScoreExplainModal'

type AleSliceId = 'privacy' | 'extortion' | 'bi'

type AleSlice = {
  id: AleSliceId
  label: string
  usd: number
  share: number
}

function adequacyWord(adequacy: CoverageAdequacy): string {
  switch (adequacy) {
    case 'adequate':
      return 'Adequate'
    case 'tight':
      return 'Tight'
    case 'shortfall':
      return 'Shortfall'
    default: {
      const neverAdequacy: never = adequacy
      return neverAdequacy
    }
  }
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function pieSlicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 359.9) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`
  }
  const start = polar(cx, cy, r, startAngle)
  const end = polar(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

function AleCompositionPie({ slices }: { slices: AleSlice[] }) {
  const cx = 36
  const cy = 36
  const r = 32
  let angle = 0
  const arcs = slices
    .filter((slice) => slice.share > 0)
    .map((slice) => {
      const sweep = slice.share * 360
      const start = angle
      const end = angle + sweep
      angle = end
      return { ...slice, d: pieSlicePath(cx, cy, r, start, end) }
    })

  return (
    <div className="dk-pie">
      <svg className="dk-pie__chart" viewBox="0 0 72 72" role="img" aria-label="Annual Loss Expectancy">
        {arcs.length === 0 ? (
          <circle cx={cx} cy={cy} r={r} className="dk-pie__empty" />
        ) : (
          arcs.map((slice) => (
            <path key={slice.id} className={`dk-pie__slice dk-pie__slice--${slice.id}`} d={slice.d} />
          ))
        )}
      </svg>
      <ul className="dk-pie__legend">
        {slices.map((slice) => (
          <li key={slice.id}>
            <i className={`dk-swatch dk-swatch--${slice.id === 'bi' ? 'bi' : slice.id}`} />
            <span>{slice.label}</span>
            <b className="tabular-nums">{Math.round(slice.share * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function deskModelExplainContent(c: CyberCase): ScoreExplainContent {
  const exposure = carrierExposureForCase(c)
  const parts = exposure.lossParts
  return toScoreExplainContent({
    title: 'How the desk model works',
    points: [
      'Annual loss (ALE) is how often a loss happens, times how large each one is.',
      `Composition — Privacy ${formatExposureUsd(parts.privacyAleUsd)}, Extortion ${formatExposureUsd(parts.extortionAleUsd)}, Interruption ${formatExposureUsd(parts.biAleUsd)}.`,
      `Adequacy is ${adequacyWord(exposure.adequacy)}: ${exposure.adequacyDetail}`,
    ],
    explainer:
      'Carrier desk figures come from the ingested application package (limits, revenue, control posture). They are illustrative — not a live actuarial engine or vendor enrichment feed.',
  })
}

export function RiskVizPanel({ c }: { c: CyberCase }) {
  const exposure = carrierExposureForCase(c)
  const parts = exposure.lossParts

  const aleTotal = Math.max(parts.privacyAleUsd + parts.biAleUsd + parts.extortionAleUsd, 1)
  const slices: AleSlice[] = [
    {
      id: 'privacy',
      label: 'Privacy',
      usd: parts.privacyAleUsd,
      share: parts.privacyAleUsd / aleTotal,
    },
    {
      id: 'extortion',
      label: 'Extortion',
      usd: parts.extortionAleUsd,
      share: parts.extortionAleUsd / aleTotal,
    },
    {
      id: 'bi',
      label: 'Interruption',
      usd: parts.biAleUsd,
      share: parts.biAleUsd / aleTotal,
    },
  ]

  return (
    <section className="dk-report dk-report--embedded" aria-label="Desk model figures">
      <div className="dk-body">
        <div className="dk-kpis dk-kpis--composition">
          <article className="dk-kpi dk-kpi--pie" aria-label="Annual Loss Expectancy">
            <p>Annual Loss Expectancy</p>
            <AleCompositionPie slices={slices} />
          </article>
        </div>
      </div>
    </section>
  )
}
