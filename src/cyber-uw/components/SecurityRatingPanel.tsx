import { useEffect, useState } from 'react'
import {
  securityRatingForCase,
  type SecurityRatingLetter,
  type SecurityRatingTrendPoint,
} from '../data/securityRatingDemo'
import type { CyberCase } from '../types'

function ordinal(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  const mod10 = n % 10
  if (mod10 === 1) return `${n}st`
  if (mod10 === 2) return `${n}nd`
  if (mod10 === 3) return `${n}rd`
  return `${n}th`
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
  return letters || 'UW'
}

function gradeColor(grade: SecurityRatingLetter): string {
  switch (grade) {
    case 'A':
      return '#1f9d55'
    case 'B':
      return '#2f80ed'
    case 'C':
      return '#e0a100'
    case 'D':
      return '#e07a2f'
    case 'E':
      return '#e24b3b'
    case 'F':
      return '#9f1239'
    default: {
      const neverGrade: never = grade
      return neverGrade
    }
  }
}

function markerLeft(factor: number): string {
  const t = Math.max(0.08, Math.min(0.92, 1 - (factor - 0.7) / 4.4))
  return `${(t * 100).toFixed(1)}%`
}

function Spectrum({
  rating,
  industry,
  hot,
}: {
  rating: number
  industry: number
  hot: number | null
}) {
  const place = (value: number) => `${(((value - 250) / 650) * 100).toFixed(1)}%`
  return (
    <div className="bs-spectrum" aria-hidden>
      <div className="bs-spectrum__bar">
        <span style={{ width: '38%' }} />
        <span style={{ width: '22%' }} />
        <span style={{ width: '16%' }} />
        <span style={{ width: '24%' }} />
      </div>
      <i className="bs-spectrum__pin bs-spectrum__pin--industry" style={{ left: place(industry) }} />
      <i className="bs-spectrum__pin bs-spectrum__pin--company" style={{ left: place(rating) }} />
      {hot != null ? <i className="bs-spectrum__pin bs-spectrum__pin--hot" style={{ left: place(hot) }} /> : null}
      <div className="bs-spectrum__ends">
        <span>250</span>
        <span>640</span>
        <span>740</span>
        <span>900</span>
      </div>
    </div>
  )
}

function Likelihood({ title, factor, note }: { title: string; factor: number; note: string }) {
  return (
    <div className="bs-like">
      <p className="bs-like__title">{title}</p>
      <p className="bs-like__factor">{factor.toFixed(1)}× as likely vs a 750+ company</p>
      <div className="bs-like__bar">
        <i style={{ left: markerLeft(factor) }} />
      </div>
      <div className="bs-like__ends">
        <span>High risk</span>
        <span>Low risk</span>
      </div>
      <p className="bs-like__note">{note}</p>
    </div>
  )
}

function PeerAnalytics({
  rating,
  industry,
  percentile,
}: {
  rating: number
  industry: number
  percentile: number
}) {
  const width = 640
  const height = 228
  const plotL = 28
  const plotR = 12
  const plotT = 36
  const plotB = 28
  const innerW = width - plotL - plotR
  const innerH = height - plotT - plotB
  const floors = [300, 380, 450, 510, 560, 610, 650, 690, 730, 770, 820]
  const sd = 72
  const weights = floors.map((floor) => {
    const center = floor + 28
    const z = (center - industry) / sd
    return Math.exp(-0.5 * z * z)
  })
  const sum = weights.reduce((total, weight) => total + weight, 0) || 1
  const bins = floors.map((floor, index) => ({
    floor,
    center: floor + 28,
    share: weights[index] / sum,
  }))
  const maxShare = Math.max(...bins.map((bin) => bin.share), 0.01)
  const xFor = (value: number) => plotL + ((value - 280) / 620) * innerW
  const barW = (innerW / bins.length) * 0.62

  return (
    <svg className="bs-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Peer distribution. Company rating ${rating}, industry ${industry}, ${ordinal(percentile)} percentile.`}>
      {[0.25, 0.5, 0.75, 1].map((tick) => {
        const y = plotT + innerH * (1 - tick)
        return <line key={tick} x1={plotL} x2={width - plotR} y1={y} y2={y} className="bs-chart__grid" />
      })}
      {bins.map((bin) => {
        const h = (bin.share / maxShare) * innerH
        const x = xFor(bin.center) - barW / 2
        const y = plotT + innerH - h
        const fill = bin.center < 560 ? '#e06a3a' : bin.center < 660 ? '#f0a04b' : bin.center < 740 ? '#7eb6f0' : '#3d8bfd'
        const label = Math.round(bin.share * 100)
        return (
          <g key={bin.floor}>
            {bin.share >= 0.03 ? <rect x={x} y={y} width={barW} height={h} rx={3} fill={fill} /> : null}
            {label >= 8 ? (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="bs-chart__bar-label">
                {label}%
              </text>
            ) : null}
          </g>
        )
      })}
      <line x1={xFor(industry)} x2={xFor(industry)} y1={plotT} y2={plotT + innerH} className="bs-chart__industry" />
      <line x1={xFor(rating)} x2={xFor(rating)} y1={plotT - 4} y2={plotT + innerH} className="bs-chart__company" />
      <text x={xFor(rating)} y={14} textAnchor="middle" className="bs-chart__company-label">
        {rating}
      </text>
      {[400, 500, 600, 700, 800].map((tick) => (
        <text key={tick} x={xFor(tick)} y={height - 8} textAnchor="middle" className="bs-chart__axis">
          {tick}
        </text>
      ))}
    </svg>
  )
}

function YearChart({ trend }: { trend: SecurityRatingTrendPoint[] }) {
  const width = 640
  const height = 210
  const plotL = 36
  const plotR = 16
  const plotT = 12
  const plotB = 28
  const innerW = width - plotL - plotR
  const innerH = height - plotT - plotB
  const yMin = 400
  const yMax = 900
  const yFor = (value: number) => plotT + (1 - (Math.min(yMax, Math.max(yMin, value)) - yMin) / (yMax - yMin)) * innerH
  const xFor = (index: number) =>
    plotL + (trend.length <= 1 ? innerW / 2 : (index / (trend.length - 1)) * innerW)
  const line = (values: number[]) =>
    values
      .map((value, index) => `${index === 0 ? 'M' : 'L'}${xFor(index).toFixed(1)} ${yFor(value).toFixed(1)}`)
      .join(' ')
  const y900 = yFor(yMax)
  const y740 = yFor(740)
  const y640 = yFor(640)
  const y250 = yFor(yMin)
  const last = trend[trend.length - 1]

  return (
    <svg className="bs-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={last ? `Twelve-month rating ends at ${last.rating}. Industry ends at ${last.industryAvg}.` : 'Twelve-month rating'}>
      <rect x={plotL} y={y900} width={innerW} height={y740 - y900} fill="#3aaa4a" />
      <rect x={plotL} y={y740} width={innerW} height={y640 - y740} fill="#e2b93b" />
      <rect x={plotL} y={y640} width={innerW} height={Math.max(0, y250 - y640)} fill="#d64545" />
      <path d={line(trend.map((point) => point.industryAvg))} className="bs-year__industry" />
      <path d={line(trend.map((point) => point.rating))} className="bs-year__insured" />
      {trend.map((point, index) => (
        <g key={`${point.month}-${index}`}>
          <circle cx={xFor(index)} cy={yFor(point.rating)} r={4.5} className="bs-year__dot" />
          <text x={xFor(index)} y={height - 8} textAnchor="middle" className="bs-chart__axis">
            {point.month}
          </text>
        </g>
      ))}
      {last ? (
        <text x={xFor(trend.length - 1) - 8} y={yFor(last.rating) - 10} textAnchor="end" className="bs-year__value">
          {last.rating}
        </text>
      ) : null}
    </svg>
  )
}

export function SecurityRatingPanel({
  c,
  onOpenCites,
}: {
  c: CyberCase
  onOpenCites?: () => void
}) {
  const snap = securityRatingForCase(c)
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = snap.vectors.find((vector) => vector.id === activeId) ?? null
  const findings = active ? snap.vectors.filter((vector) => vector.id === active.id) : snap.vectors
  const ransom = snap.multipliers.find((row) => row.label === 'Ransomware loss')
  const breach = snap.multipliers.find((row) => row.label === 'Breach likelihood')

  useEffect(() => {
    setActiveId(null)
  }, [c.id])

  if (!Number.isFinite(snap.rating)) {
    return <p className="wb-instrument__note">No Bitsight reading on this submission.</p>
  }

  return (
    <article className="bs-report" aria-label="Bitsight security rating">
      <aside className="bs-report__rail">
        <div className="bs-report__company">
          <span className="bs-report__avatar">{initials(c.insured)}</span>
          <div>
            <p className="bs-report__company-name">{c.insured}</p>
            <p>{c.sector}</p>
            <p>{c.broker}</p>
          </div>
        </div>

        <div className="bs-report__card">
          <p className="bs-report__card-kicker">Bitsight Security Rating</p>
          <p className="bs-report__score tabular-nums">{snap.rating}</p>
          <p className="bs-report__band">{snap.band}</p>
          <Spectrum rating={snap.rating} industry={snap.industryAvg} hot={active ? active.score : null} />
          <p className="bs-report__compare">
            <span><i className="bs-swatch bs-swatch--company" /> Company {snap.rating}</span>
            <span><i className="bs-swatch bs-swatch--industry" /> Industry {snap.industryAvg}</span>
          </p>
          <ul className="bs-report__legend">
            <li><i className="bs-swatch bs-swatch--basic" /> Basic 250–639</li>
            <li><i className="bs-swatch bs-swatch--mid" /> Intermediate 640–739</li>
            <li><i className="bs-swatch bs-swatch--adv" /> Advanced 740–900</li>
          </ul>
        </div>

        {ransom ? (
          <Likelihood title="Likelihood of ransomware incidents" factor={ransom.factor} note={ransom.note} />
        ) : null}
        {breach ? (
          <Likelihood title="Likelihood of data breach incidents" factor={breach.factor} note={breach.note} />
        ) : null}

        <div className="bs-report__about">
          <p className="bs-report__card-kicker">What is a Bitsight Security Rating?</p>
          <p>
            A 250–900 reading of security performance that can be seen from outside the company. Higher is
            better. It is a hygiene rating, not a dollar loss.
          </p>
        </div>
        <p className="bs-report__wordmark">Bitsight</p>
      </aside>

      <div className="bs-report__sheet">
        <header className="bs-report__sheet-head">
          <div>
            <p className="bs-report__kicker">Executive report</p>
            <h4>{c.insured}</h4>
            <p className="bs-report__cohort">
              {ordinal(snap.peerPercentile)} percentile · {snap.peerCohortLabel}
            </p>
          </div>
          {onOpenCites ? (
            <button type="button" className="bs-report__sources" onClick={onOpenCites}>
              View sources
            </button>
          ) : null}
        </header>

        <section className="bs-report__block">
          <h5>Peer analytics</h5>
          <p className="bs-report__lead">
            Share of companies in {c.sector}. The orange line is this company. The dashed line is the industry average.
          </p>
          <PeerAnalytics rating={snap.rating} industry={snap.industryAvg} percentile={snap.peerPercentile} />
          <ul className="bs-report__key">
            <li><i className="bs-swatch bs-swatch--company" /> Company rating</li>
            <li><i className="bs-swatch bs-swatch--industry" /> Industry average</li>
          </ul>
        </section>

        <section className="bs-report__block">
          <h5>Performance over the last 12 months</h5>
          <p className="bs-report__lead">
            Green is Advanced, amber is Intermediate, red is Basic. The line is this company. Dashed is the industry.
          </p>
          {snap.trend.length === 0 ? (
            <p className="bs-report__empty">No 12-month history on this reading.</p>
          ) : (
            <YearChart trend={snap.trend} />
          )}
        </section>

        <section className="bs-report__block">
          <h5>Risk categories</h5>
          {snap.vectors.length === 0 ? (
            <p className="bs-report__empty">Risk vectors are not on this reading.</p>
          ) : (
            <ul className="bs-cats">
              {snap.vectors.map((vector) => (
                <li key={vector.id}>
                  <button
                    type="button"
                    aria-pressed={activeId === vector.id}
                    onClick={() => setActiveId(vector.id)}
                    onFocus={() => setActiveId(vector.id)}
                  >
                    <span className="bs-cats__grade" style={{ background: gradeColor(vector.grade) }}>
                      {vector.grade}
                    </span>
                    <span className="bs-cats__score tabular-nums">{vector.score}</span>
                    <span className="bs-cats__name">{vector.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <h5 className="bs-report__findings-title">Findings</h5>
          {findings.length === 0 ? (
            <p className="bs-report__empty">No findings on this reading.</p>
          ) : (
            <ul className="bs-findings">
              {findings.map((vector) => (
                <li key={vector.id}>
                  <span className="bs-cats__grade" style={{ background: gradeColor(vector.grade) }}>
                    {vector.grade}
                  </span>
                  <span>
                    <strong>{vector.label}</strong>
                    <em>{vector.detail}</em>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  )
}
