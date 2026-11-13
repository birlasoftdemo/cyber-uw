import { CircleDollarSign, FileStack, TriangleAlert } from 'lucide-react'
import { lossRunForCase, type LossClaimStatus } from '../data/lossRunDemo'
import { carrierExposureForCase, formatExposureUsd } from '../data/riskVizDemo'
import type { CyberCase } from '../types'
import { InfoTip } from './InfoTip'

function money(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function statusLabel(status: LossClaimStatus) {
  switch (status) {
    case 'OPEN':
      return 'Open'
    case 'CLOSED':
      return 'Closed'
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

function YearChart({
  years,
}: {
  years: { year: number; incurred: number; claims: number }[]
}) {
  const width = 920
  const height = 220
  const padL = 56
  const padR = 32
  const padT = 16
  const padB = 30
  const innerW = width - padL - padR
  const innerH = height - padT - padB
  const maxMoney = Math.max(...years.map((year) => year.incurred), 1)
  const maxClaims = Math.max(...years.map((year) => year.claims), 1)
  const slot = years.length ? innerW / years.length : innerW
  const barW = Math.min(36, Math.max(8, slot * 0.55))
  const ticks = [0, 0.5, 1]
  const labelEvery = years.length > 12 ? 2 : 1

  const points = years.map((year, index) => {
    const x = padL + slot * index + slot / 2
    const barH = (year.incurred / maxMoney) * innerH
    const y = padT + innerH - (year.claims / maxClaims) * innerH
    return { ...year, x, barH, y, index }
  })
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <svg className="lr-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Incurred loss and claim count by year">
      {ticks.map((tick) => {
        const y = padT + innerH - tick * innerH
        return (
          <g key={tick}>
            <line x1={padL} x2={width - padR} y1={y} y2={y} />
            <text x={padL - 8} y={y + 4} textAnchor="end">
              {money(maxMoney * tick)}
            </text>
            <text x={width - padR + 6} y={y + 4}>
              {Math.round(maxClaims * tick)}
            </text>
          </g>
        )
      })}
      {points.map((point) => (
        <rect
          key={point.year}
          x={point.x - barW / 2}
          y={padT + innerH - point.barH}
          width={barW}
          height={point.barH}
          rx={2}
        />
      ))}
      <polyline points={line} />
      {points.map((point) => (
        <g key={`dot-${point.year}`}>
          <circle cx={point.x} cy={point.y} r={3.5} />
          {point.index % labelEvery === 0 ? (
            <text x={point.x} y={height - 8} textAnchor="middle">
              {String(point.year).slice(2)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  )
}

function MetricIcon() {
  return (
    <span className="intake-metric__icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
        <rect x="5.5" y="3.5" width="9" height="12" rx="1.4" stroke="#fff" strokeWidth="1.4" />
        <rect x="3.5" y="5.5" width="9" height="12" rx="1.4" fill="#1b1564" stroke="#fff" strokeWidth="1.4" />
      </svg>
    </span>
  )
}

export function LossRunAnalysis({ c }: { c: CyberCase }) {
  const reading = lossRunForCase(c)
  const exposure = carrierExposureForCase(c)
  const lagMax = Math.max(...reading.claims.map((claim) => claim.lagDays ?? 0), 1)

  return (
    <section className="lr-sheet" aria-label="Loss Run Analysis">
      <div className="lr-block">
        <h5>Loss run history</h5>
        <div className="lr-kpis">
          <article>
            <FileStack size={16} aria-hidden />
            <strong>{reading.claims.length}</strong>
            <span>Claims</span>
          </article>
          <article>
            <CircleDollarSign size={16} aria-hidden />
            <strong>{money(reading.totalIncurred)}</strong>
            <span>All years</span>
          </article>
          <article>
            <CircleDollarSign size={16} aria-hidden />
            <strong>{money(reading.averageIncurred)}</strong>
            <span>Per claim</span>
          </article>
          <article className="lr-kpis__open">
            <TriangleAlert size={16} aria-hidden />
            <strong>{reading.openCount}</strong>
            <span>Open claims</span>
          </article>
        </div>
      </div>
      <div className="lr-block">
        <h5>
          Incurred loss and claim count by year
          <InfoTip text="Bars are incurred loss for the year. The line is the number of claims reported in that year." />
        </h5>
        <YearChart years={reading.years} />
        <p className="lr-legend">
          <i /> Incurred
          <b /> Claims
        </p>
      </div>
      <div className="lr-split">
        <div className="lr-block">
          <h5>
            Cause mix — share of incurred loss
            <InfoTip text="Each bar is that cause’s share of total incurred loss on the loss runs." />
          </h5>
          <ul className="lr-bars">
            {reading.causes.map((cause, index) => (
              <li key={cause.cause}>
                <div>
                  <p>{cause.cause}</p>
                  <span>
                    {cause.claims} claim{cause.claims === 1 ? '' : 's'}
                  </span>
                </div>
                <i>
                  <b className={`lr-bars__fill lr-bars__fill--${index % 3}`} style={{ width: `${cause.share}%` }} />
                </i>
                <em>
                  {cause.share}% · {money(cause.incurred)}
                </em>
              </li>
            ))}
          </ul>
        </div>
        <div className="lr-block">
          <h5>
            Report lag in days
            <InfoTip text="Days from the loss date to the date the claim was reported. Open claims with no report date are blank." />
          </h5>
          <ul className="lr-bars">
            {reading.claims.map((claim) => (
              <li key={claim.id}>
                <div>
                  <p>{claim.id}</p>
                  <span>{claim.lossDate}</span>
                </div>
                <i>
                  <b style={{ width: `${claim.lagDays == null ? 0 : (claim.lagDays / lagMax) * 100}%` }} />
                </i>
                <em>{claim.lagDays == null ? '—' : `${claim.lagDays} days`}</em>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="lr-block">
        <h5>Claims</h5>
        <div className="intake-panel__metrics intake-panel__metrics--three lr-claims-kpis" aria-label="Coverage KPIs">
          <article className="intake-metric">
            <MetricIcon />
            <span className="intake-metric__label">Est. ALE</span>
            <strong className="intake-metric__value">{formatExposureUsd(exposure.aleUsd)}</strong>
          </article>
          <article className="intake-metric">
            <MetricIcon />
            <span className="intake-metric__label">Worst-case stack</span>
            <strong className="intake-metric__value">{formatExposureUsd(exposure.worstCaseTotalUsd)}</strong>
          </article>
          <article className="intake-metric">
            <MetricIcon />
            <span className="intake-metric__label">Requested limit</span>
            <strong className="intake-metric__value">{formatExposureUsd(exposure.limitRequestedUsd)}</strong>
          </article>
        </div>
        <div className="spec-grid-wrap spec-grid-wrap--nested">
          <table className="spec-grid spec-grid--claims">
            <thead>
              <tr className="spec-grid__groups">
                <th colSpan={5}>Claim</th>
                <th colSpan={2}>Amounts</th>
              </tr>
              <tr className="spec-grid__cols">
                <th>Claim</th>
                <th>Loss date</th>
                <th>Lag</th>
                <th>Status</th>
                <th>Cause</th>
                <th>Paid</th>
                <th>Incurred</th>
              </tr>
            </thead>
            <tbody>
              {reading.claims.map((claim) => (
                <tr key={claim.id}>
                  <td>
                    <strong>{claim.id}</strong>
                  </td>
                  <td className="spec-grid__num">{claim.lossDate}</td>
                  <td className="spec-grid__num">{claim.lagDays ?? '—'}</td>
                  <td className={claim.status === 'OPEN' ? 'lr-status--open' : 'lr-status--closed'}>
                    {statusLabel(claim.status)}
                  </td>
                  <td>{claim.cause}</td>
                  <td className="spec-grid__num">{money(claim.paid)}</td>
                  <td className="spec-grid__num">{money(claim.incurred)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
