import { cyenceReadingForCase, type CyenceScenario } from '../data/enrichmentDemo'
import { formatExposureUsd } from '../data/riskVizDemo'
import type { CyberCase } from '../types'

function scenarioColor(id: string): string {
  switch (id) {
    case 'data-breach':
      return '#7c3aed'
    case 'business-interruption':
      return '#0284c7'
    case 'ransomware':
      return '#e11d48'
    default:
      return '#0f766e'
  }
}

function EpCurve({
  points,
  limit,
  pml,
}: {
  points: { probability: number; lossUsd: number }[]
  limit: number
  pml: number
}) {
  const width = 680
  const height = 260
  const plotL = 46
  const plotR = 16
  const plotT = 18
  const plotB = 36
  const innerW = width - plotL - plotR
  const innerH = height - plotT - plotB
  const tail = Math.max(pml, ...points.map((point) => point.lossUsd), 1)
  const limitInFrame = limit <= tail * 1.25
  const maxLoss = (limitInFrame ? Math.max(limit, tail) : tail) * 1.08
  const xFor = (loss: number) => plotL + (loss / maxLoss) * innerW
  const yFor = (probability: number) => plotT + (1 - Math.max(0, Math.min(1, probability))) * innerH
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${xFor(point.lossUsd).toFixed(1)} ${yFor(point.probability).toFixed(1)}`)
    .join(' ')
  const first = points[0]
  const last = points[points.length - 1]
  const area =
    first && last
      ? `${line} L${xFor(last.lossUsd).toFixed(1)} ${yFor(0).toFixed(1)} L${xFor(first.lossUsd).toFixed(1)} ${yFor(0).toFixed(1)} Z`
      : ''
  const ticks = [0.25, 0.5, 0.75, 1]

  return (
    <svg className="cy-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Exceedance curve. Probable maximum loss ${formatExposureUsd(pml)}. Requested limit ${formatExposureUsd(limit)}.`}>
      <defs>
        <linearGradient id="cy-ep-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => {
        const y = yFor(tick)
        return (
          <g key={tick}>
            <line x1={plotL} x2={width - plotR} y1={y} y2={y} className="cy-chart__grid" />
            <text x={plotL - 8} y={y + 4} textAnchor="end" className="cy-chart__axis">
              {Math.round(tick * 100)}%
            </text>
          </g>
        )
      })}
      <path d={area} fill="url(#cy-ep-fill)" />
      <path d={line} className="cy-chart__line" />
      {limitInFrame ? (
        <line x1={xFor(limit)} x2={xFor(limit)} y1={plotT} y2={plotT + innerH} className="cy-chart__limit" />
      ) : null}
      <line x1={xFor(pml)} x2={xFor(pml)} y1={plotT} y2={plotT + innerH} className="cy-chart__pml" />
      <text x={limitInFrame ? xFor(limit) : width - plotR} y={height - 10} textAnchor={limitInFrame ? 'middle' : 'end'} className="cy-chart__axis">
        {limitInFrame ? `Limit ${formatExposureUsd(limit)}` : `Limit ${formatExposureUsd(limit)} is past this tail`}
      </text>
      <text x={Math.min(width - 70, xFor(pml) + 8)} y={plotT + 14} className="cy-chart__pml-label">
        PML {formatExposureUsd(pml)}
      </text>
    </svg>
  )
}

function ScenarioBars({ scenarios, limit }: { scenarios: CyenceScenario[]; limit: number }) {
  const max = Math.max(limit, ...scenarios.map((scenario) => scenario.lossUsd), 1)
  return (
    <ul className="cy-scenarios">
      {scenarios.map((scenario) => (
        <li key={scenario.id}>
          <div className="cy-scenarios__top">
            <span>{scenario.label}</span>
            <strong className="tabular-nums">{formatExposureUsd(scenario.lossUsd)}</strong>
          </div>
          <div className="cy-scenarios__track">
            <i
              style={{
                width: `${Math.max(4, (scenario.lossUsd / max) * 100)}%`,
                background: scenarioColor(scenario.id),
              }}
            />
            <b style={{ left: `${(limit / max) * 100}%` }} title="Requested limit" />
          </div>
          <p>{scenario.evidence}</p>
        </li>
      ))}
    </ul>
  )
}

export function CyencePanel({ c, onOpenCites }: { c: CyberCase; onOpenCites?: () => void }) {
  const reading = cyenceReadingForCase(c)
  const chance = Math.round(reading.probabilityAboveLimit * 100)

  if (reading.economicLossUsd === 0 && reading.probableMaximumLossUsd === 0 && reading.position !== 'unpriced') {
    return <p className="wb-instrument__note">No Cyence loss model on this submission.</p>
  }

  return (
    <article className="cy-report" aria-label="Cyence economic loss">
      <header className="cy-report__head">
        <div>
          <p className="cy-report__brand">Cyence</p>
          <h4>Economic loss model</h4>
          <p>Dollars of modeled loss. This is not a 250–900 security rating.</p>
        </div>
        {onOpenCites ? (
          <button type="button" className="cy-report__sources" onClick={onOpenCites}>
            View sources
          </button>
        ) : null}
      </header>

      <div className="cy-kpis">
        <div className="cy-kpi cy-kpi--loss">
          <p>Expected loss</p>
          <strong className="tabular-nums">{formatExposureUsd(reading.economicLossUsd)}</strong>
          <span>Annualized economic loss</span>
        </div>
        <div className="cy-kpi cy-kpi--pml">
          <p>Probable maximum loss</p>
          <strong className="tabular-nums">{formatExposureUsd(reading.probableMaximumLossUsd)}</strong>
          <span>Tail of the modeled outcomes</span>
        </div>
        <div className="cy-kpi cy-kpi--prob">
          <p>Loss above the limit</p>
          <strong className="tabular-nums">{chance}%</strong>
          <span>Chance modeled loss exceeds {formatExposureUsd(reading.limitUsd)}</span>
        </div>
      </div>

      <section className="cy-report__card">
        <h5>Exceedance curve</h5>
        <p className="cy-report__lead">
          Probability of a loss at least this large. Teal is probable maximum loss.
          {reading.limitUsd > reading.probableMaximumLossUsd * 1.25
            ? ` The requested limit of ${formatExposureUsd(reading.limitUsd)} sits past this tail.`
            : ' Orange is the requested limit.'}
        </p>
        <EpCurve
          points={reading.exceedance}
          limit={reading.limitUsd}
          pml={reading.probableMaximumLossUsd}
        />
      </section>

      <section className="cy-report__card">
        <h5>Scenarios</h5>
        <p className="cy-report__lead">Each bar is that scenario’s loss. The notch is the requested limit.</p>
        <ScenarioBars scenarios={reading.scenarios} limit={reading.limitUsd} />
      </section>

      <p className={`cy-report__verdict cy-report__verdict--${reading.position}`}>{reading.positionSentence}</p>
    </article>
  )
}
