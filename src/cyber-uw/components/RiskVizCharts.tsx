/** Desk model — loss composition, coverage, and an open actuarial recomputation. */

import { useEffect, useState } from 'react'
import {
  carrierExposureForCase,
  formatExposureUsd,
  inherentRiskPointsForCase,
  type ActuarialCheckStatus,
  type CoverageAdequacy,
  type ExceedancePoint,
} from '../data/riskVizDemo'
import type { CyberCase } from '../types'

type DeskThreat = {
  threatId: string
  label: string
  likelihoodPct: number
  impactUsd: number
}

type DeskAreaId = 'privacy' | 'extortion' | 'interruption' | 'other'

function deskAreaForLabel(label: string): DeskAreaId {
  const text = label.toLowerCase()
  if (
    text.includes('hipaa') ||
    text.includes('privacy') ||
    text.includes('pci') ||
    text.includes('phi') ||
    text.includes('exfil') ||
    text.includes('encrypt')
  ) {
    return 'privacy'
  }
  if (text.includes('extort') || text.includes('ransom')) return 'extortion'
  if (
    text.includes('backup') ||
    text.includes('rto') ||
    text.includes('restor') ||
    text.includes('interruption') ||
    text.includes('continuity') ||
    /\bir\b/.test(text)
  ) {
    return 'interruption'
  }
  return 'other'
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

function adequacyTone(adequacy: CoverageAdequacy): 'ok' | 'tight' | 'short' {
  switch (adequacy) {
    case 'adequate':
      return 'ok'
    case 'tight':
      return 'tight'
    case 'shortfall':
      return 'short'
    default: {
      const neverAdequacy: never = adequacy
      return neverAdequacy
    }
  }
}

function checkStatusLabel(status: ActuarialCheckStatus): string {
  switch (status) {
    case 'matches':
      return 'Matches'
    case 'reported':
      return 'Reported'
    case 'withheld':
      return 'Withheld'
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

function formatChance(probability: number): string {
  const pct = probability * 100
  if (pct > 0 && pct < 0.1) return '<0.1%'
  return `${pct.toFixed(1)}%`
}

function EpCurve({
  curve,
  domainUsd,
  limitUsd,
  yMax,
  gradientId,
}: {
  curve: ExceedancePoint[]
  domainUsd: number
  limitUsd: number
  yMax: number
  gradientId: string
}) {
  const width = 640
  const height = 176
  const padL = 40
  const padR = 10
  const padT = 14
  const padB = 26
  const innerW = width - padL - padR
  const innerH = height - padT - padB
  const safeDomain = Math.max(domainUsd, 1)
  const safeY = Math.max(yMax, 0.001)
  const xOf = (loss: number) => padL + (Math.min(loss, safeDomain) / safeDomain) * innerW
  const yOf = (probability: number) => padT + (1 - Math.min(probability, safeY) / safeY) * innerH
  const line = curve
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command}${xOf(point.lossUsd).toFixed(1)},${yOf(point.exceedance).toFixed(1)}`
    })
    .join(' ')
  const first = curve[0]
  const last = curve[curve.length - 1]
  const area =
    first && last
      ? `${line} L${xOf(last.lossUsd).toFixed(1)},${yOf(0).toFixed(1)} L${xOf(first.lossUsd).toFixed(1)},${yOf(0).toFixed(1)} Z`
      : ''
  const limitX = xOf(Math.min(limitUsd, safeDomain))
  const limitAnchor = limitX > width - 90 ? 'end' : limitX < 110 ? 'start' : 'middle'

  return (
    <svg
      className="dk-curve"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Exceedance curve from zero to ${formatExposureUsd(domainUsd)}. Limit marker at ${formatExposureUsd(limitUsd)}.`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <line className="dk-curve__axis" x1={padL} y1={yOf(0)} x2={width - padR} y2={yOf(0)} />
      <line className="dk-curve__axis" x1={padL} y1={padT} x2={padL} y2={yOf(0)} />
      {area ? <path d={area} fill={`url(#${gradientId})`} /> : null}
      {line ? <path d={line} className="dk-curve__line" /> : null}
      <line className="dk-curve__limit" x1={limitX} y1={padT} x2={limitX} y2={yOf(0)} />
      <text className="dk-curve__label" x={padL - 6} y={padT + 4} textAnchor="end">
        {formatChance(safeY)}
      </text>
      <text className="dk-curve__label" x={padL - 6} y={yOf(0)} textAnchor="end">
        0%
      </text>
      <text className="dk-curve__label" x={limitX} y={padT + 11} textAnchor={limitAnchor}>
        {`Limit ${formatExposureUsd(limitUsd)}`}
      </text>
      <text className="dk-curve__label" x={padL} y={height - 6} textAnchor="start">
        $0
      </text>
      <text className="dk-curve__label" x={width - padR} y={height - 6} textAnchor="end">
        {formatExposureUsd(safeDomain)}
      </text>
    </svg>
  )
}

function ThreatList({
  points,
  activeId,
  onSelect,
}: {
  points: DeskThreat[]
  activeId: string | null
  onSelect: (threatId: string) => void
}) {
  if (points.length === 0) return null
  return (
    <ul className="dk-threats">
      {points.map((point) => (
        <li key={point.threatId}>
          <button
            type="button"
            className="dk-threat"
            aria-pressed={activeId === point.threatId}
            onClick={() => onSelect(point.threatId)}
          >
            <span>{point.label}</span>
            <span className="tabular-nums">
              {point.likelihoodPct}% · {formatExposureUsd(point.impactUsd)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function RiskVizPanel({
  c,
  activeThreatId,
  onSelectThreat,
  onOpenCites,
}: {
  c: CyberCase
  activeThreatId: string | null
  onSelectThreat: (threatId: string) => void
  onOpenCites?: () => void
}) {
  const points = inherentRiskPointsForCase(c)
  const exposure = carrierExposureForCase(c)
  const parts = exposure.lossParts
  const actuarial = exposure.actuarial
  const [activeId, setActiveId] = useState<string | null>(activeThreatId)

  useEffect(() => {
    setActiveId(activeThreatId)
  }, [activeThreatId, c.id])

  const select = (threatId: string) => {
    setActiveId(threatId)
    onSelectThreat(threatId)
  }

  const status = adequacyWord(exposure.adequacy)
  const tone = adequacyTone(exposure.adequacy)
  const aleTotal = Math.max(parts.privacyAleUsd + parts.biAleUsd + parts.extortionAleUsd, 1)
  const privacyShare = parts.privacyAleUsd / aleTotal
  const biShare = parts.biAleUsd / aleTotal
  const extortionShare = parts.extortionAleUsd / aleTotal
  const coverScale = Math.max(exposure.limitRequestedUsd, exposure.worstCaseTotalUsd, 1)
  const yMax = Math.max(...actuarial.curve.map((point) => point.exceedance), 0.05) * 1.08

  const privacyThreats = points.filter((point) => deskAreaForLabel(point.label) === 'privacy')
  const extortionThreats = points.filter((point) => deskAreaForLabel(point.label) === 'extortion')
  const interruptionThreats = points.filter((point) => deskAreaForLabel(point.label) === 'interruption')
  const otherThreats = points.filter((point) => deskAreaForLabel(point.label) === 'other')
  const activeArea = points.find((point) => point.threatId === activeId)
  const activeAreaId = activeArea ? deskAreaForLabel(activeArea.label) : null

  const perils: {
    id: DeskAreaId
    title: string
    sle: string
    ale: string
    share: number
    detail: string
    threats: DeskThreat[]
  }[] = [
    {
      id: 'privacy',
      title: 'Privacy',
      sle: formatExposureUsd(parts.privacySleUsd),
      ale: formatExposureUsd(parts.privacyAleUsd),
      share: privacyShare,
      detail: `${parts.recordsBand} records · $${parts.costPerRecord} per record · encryption factor ${parts.encryptionEf}`,
      threats: privacyThreats,
    },
    {
      id: 'extortion',
      title: 'Extortion',
      sle: formatExposureUsd(parts.extortionSleUsd),
      ale: formatExposureUsd(parts.extortionAleUsd),
      share: extortionShare,
      detail: 'Single loss is the lesser of 15% of the limit and 1.2% of revenue. Frequency is 0.6 × ARO.',
      threats: extortionThreats,
    },
    {
      id: 'interruption',
      title: 'Business interruption',
      sle: formatExposureUsd(parts.biSleUsd),
      ale: formatExposureUsd(parts.biAleUsd),
      share: biShare,
      detail: `Restoration ${parts.rtoBand} · ${parts.rtoHours} hours · 55% of revenue treated as critical operations.`,
      threats: interruptionThreats,
    },
  ]

  return (
    <section className="dk-report" aria-label="Desk model">
      <header className="dk-banner">
        <div>
          <p className="dk-kicker">Carrier desk</p>
          <h4>Desk model</h4>
          <p>
            Annual loss is loss event frequency times loss magnitude, the Open FAIR identity, recomputed
            here as a compound Poisson mean.
          </p>
        </div>
        <div className="dk-banner__side">
          <p className={`dk-seal dk-seal--${actuarial.seal}`}>
            {actuarial.seal === 'matches' ? 'Mean matches' : 'Withheld'}
          </p>
          {onOpenCites ? (
            <button type="button" className="dk-sources" onClick={onOpenCites}>
              View sources
            </button>
          ) : null}
        </div>
      </header>

      <div className="dk-body">
        <div className="dk-kpis">
          <article className="dk-kpi dk-kpi--ale">
            <p>Est. ALE</p>
            <strong className="tabular-nums">{formatExposureUsd(exposure.aleUsd)}</strong>
          </article>
          <article className="dk-kpi dk-kpi--worst">
            <p>Worst-case stack</p>
            <strong className="tabular-nums">{formatExposureUsd(exposure.worstCaseTotalUsd)}</strong>
          </article>
          <article className="dk-kpi dk-kpi--limit">
            <p>Requested limit</p>
            <strong className="tabular-nums">{formatExposureUsd(exposure.limitRequestedUsd)}</strong>
          </article>
          <article className={`dk-kpi dk-kpi--${tone}`}>
            <p>Adequacy</p>
            <strong>{status}</strong>
          </article>
        </div>
        <p className="dk-adequacy">{exposure.adequacyDetail}</p>

        <section className="dk-block" aria-label="Annual loss composition">
          <div className="dk-block__head">
            <h5>Where the annual loss comes from</h5>
            <p>Privacy, extortion, and business interruption shares of estimated ALE.</p>
          </div>
          <div className="dk-stack" aria-hidden>
            <span className="dk-stack--privacy" style={{ width: `${privacyShare * 100}%` }} />
            <span className="dk-stack--extortion" style={{ width: `${extortionShare * 100}%` }} />
            <span className="dk-stack--bi" style={{ width: `${biShare * 100}%` }} />
          </div>
          <ul className="dk-legend">
            <li>
              <i className="dk-swatch dk-swatch--privacy" />
              Privacy
              <b className="tabular-nums">{formatExposureUsd(parts.privacyAleUsd)}</b>
            </li>
            <li>
              <i className="dk-swatch dk-swatch--extortion" />
              Extortion
              <b className="tabular-nums">{formatExposureUsd(parts.extortionAleUsd)}</b>
            </li>
            <li>
              <i className="dk-swatch dk-swatch--bi" />
              Interruption
              <b className="tabular-nums">{formatExposureUsd(parts.biAleUsd)}</b>
            </li>
          </ul>
        </section>

        <div className="dk-perils">
          {perils.map((peril) => (
            <section
              key={peril.id}
              className={`dk-peril dk-peril--${peril.id}${activeAreaId === peril.id ? ' is-hot' : ''}`}
              aria-label={peril.title}
            >
              <header>
                <h5>{peril.title}</h5>
                <p className="tabular-nums">{peril.ale} ALE</p>
              </header>
              <dl>
                <div>
                  <dt>Single loss</dt>
                  <dd className="tabular-nums">{peril.sle}</dd>
                </div>
                <div>
                  <dt>Share of ALE</dt>
                  <dd className="tabular-nums">{Math.round(peril.share * 100)}%</dd>
                </div>
              </dl>
              <div className="dk-meter" aria-hidden>
                <span style={{ width: `${Math.max(peril.share * 100, peril.share > 0 ? 4 : 0)}%` }} />
              </div>
              <p>{peril.detail}</p>
              <ThreatList points={peril.threats} activeId={activeId} onSelect={select} />
            </section>
          ))}
        </div>

        <section className="dk-block" aria-label="Limit against worst case">
          <div className="dk-block__head">
            <h5>Limit against the worst-case stack</h5>
            <p>{exposure.adequacyLabel}</p>
          </div>
          <div className="dk-cover">
            <div>
              <span>Requested limit</span>
              <div className="dk-cover__track">
                <span
                  className="dk-cover__limit"
                  style={{ width: `${(exposure.limitRequestedUsd / coverScale) * 100}%` }}
                />
              </div>
              <b className="tabular-nums">{formatExposureUsd(exposure.limitRequestedUsd)}</b>
            </div>
            <div>
              <span>Worst-case stack</span>
              <div className="dk-cover__track">
                <span
                  className="dk-cover__worst"
                  style={{ width: `${(exposure.worstCaseTotalUsd / coverScale) * 100}%` }}
                />
              </div>
              <b className="tabular-nums">{formatExposureUsd(exposure.worstCaseTotalUsd)}</b>
            </div>
          </div>
        </section>

        <section className="dk-act" aria-label="Open actuarial check">
          <div className="dk-block__head">
            <h5>Open actuarial check</h5>
            <p>
              Open FAIR sets loss exposure equal to loss event frequency times loss magnitude. The same
              dollars are the mean of three independent Poisson counts with fixed severity, the ground-up
              expected loss an open catastrophe framework such as OasisLMF reports. Both figures are
              recomputed in this workbench from the application inputs.
            </p>
          </div>
          <div className="dk-stats">
            <article>
              <p>Frequency λ</p>
              <strong className="tabular-nums">{parts.aro}</strong>
            </article>
            <article>
              <p>Extortion frequency</p>
              <strong className="tabular-nums">{parts.extortionFrequency}</strong>
            </article>
            <article>
              <p>Spread σ</p>
              <strong className="tabular-nums">{formatExposureUsd(Math.round(actuarial.stdDevUsd))}</strong>
            </article>
            <article>
              <p>P(loss &gt; 0)</p>
              <strong className="tabular-nums">{formatChance(actuarial.probabilityAnyLoss)}</strong>
            </article>
            <article>
              <p>P(loss &gt; limit)</p>
              <strong className="tabular-nums">{formatChance(actuarial.probabilityOverLimit)}</strong>
            </article>
          </div>
          <EpCurve
            curve={actuarial.curve}
            domainUsd={actuarial.curveDomainUsd}
            limitUsd={exposure.limitRequestedUsd}
            yMax={yMax}
            gradientId={`${c.id}-dk-ep`}
          />
          <ul className="dk-checks">
            {actuarial.checks.map((check) => (
              <li key={check.id} className={`dk-check dk-check--${check.status}`}>
                <div>
                  <p className="dk-check__standard">{check.standard}</p>
                  <h6>{check.title}</h6>
                  <p className="dk-check__formula">{check.formula}</p>
                  <p>{check.result}</p>
                </div>
                <span className={`dk-pill dk-pill--${check.status}`}>{checkStatusLabel(check.status)}</span>
              </li>
            ))}
          </ul>
        </section>

        {otherThreats.length > 0 ? (
          <section className="dk-block" aria-label="Other findings">
            <div className="dk-block__head">
              <h5>Other findings</h5>
              <p>Application signals that sit outside the three loss components.</p>
            </div>
            <ThreatList points={otherThreats} activeId={activeId} onSelect={select} />
          </section>
        ) : null}
      </div>
    </section>
  )
}
