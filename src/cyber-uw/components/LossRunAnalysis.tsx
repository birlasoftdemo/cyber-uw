import { CircleDollarSign, FileStack, TriangleAlert } from 'lucide-react'
import { lossRunForCase, type LossClaimStatus } from '../data/lossRunDemo'
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
  const width = 720
  const height = 210
  const padL = 52
  const padR = 28
  const padT = 16
  const padB = 28
  const innerW = width - padL - padR
  const innerH = height - padT - padB
  const maxMoney = Math.max(...years.map((year) => year.incurred), 1)
  const maxClaims = Math.max(...years.map((year) => year.claims), 1)
  const slot = years.length ? innerW / years.length : innerW
  const barW = Math.min(64, slot * 0.46)
  const ticks = [0, 0.5, 1]

  const points = years.map((year, index) => {
    const x = padL + slot * index + slot / 2
    const barH = (year.incurred / maxMoney) * innerH
    const y = padT + innerH - (year.claims / maxClaims) * innerH
    return { ...year, x, barH, y }
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
          rx={3}
        />
      ))}
      <polyline points={line} />
      {points.map((point) => (
        <g key={`dot-${point.year}`}>
          <circle cx={point.x} cy={point.y} r={4} />
          <text x={point.x} y={height - 8} textAnchor="middle">
            {point.year}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function LossRunAnalysis({ c }: { c: CyberCase }) {
  const reading = lossRunForCase(c)
  const lagMax = Math.max(...reading.claims.map((claim) => claim.lagDays ?? 0), 1)

  return (
    <section className="lr-sheet" aria-label="Loss Run Analysis">
      <header className="lr-sheet__head">
        <h4>Loss Run Analysis</h4>
      </header>
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
        <table className="ra-table">
          <thead>
            <tr>
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
                <td>{claim.id}</td>
                <td>{claim.lossDate}</td>
                <td>{claim.lagDays ?? '—'}</td>
                <td className={claim.status === 'OPEN' ? 'lr-status--open' : 'lr-status--closed'}>
                  {statusLabel(claim.status)}
                </td>
                <td>{claim.cause}</td>
                <td>{money(claim.paid)}</td>
                <td>{money(claim.incurred)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
