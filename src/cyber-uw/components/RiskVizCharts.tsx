/** Case Review Risk charts — carrier exposure (ALE, controls, limit adequacy). */

import { applicationPosture, type ApplicationPosture } from '../data/cyberTriageRules'
import { carrierExposureForCase, formatExposureUsd, type CarrierExposureSummary } from '../data/riskVizDemo'
import type { CyberCase } from '../types'

const ALE_COLORS = {
  privacy: '#312e81',
  bi: '#0891b2',
  extortion: '#7c3aed',
} as const

const STACK_COLORS: Record<string, string> = {
  'Cyber extortion': '#312e81',
  'Data exfiltration': '#0891b2',
  'Business interruption': '#c4b5fd',
  Covered: '#67e8f9',
  Shortfall: '#fb7185',
  Headroom: '#a5b4fc',
}

type ControlRow = {
  id: string
  label: string
  uplift: number
  chip: string
  text: string
  dot: string
  pale: string
}

function controlRows(posture: ApplicationPosture): ControlRow[] {
  return [
    {
      id: 'mfa',
      label: 'MFA',
      uplift: posture.mfaGap ? 55 : 0,
      chip: '#312e81',
      text: '#fff',
      dot: '#312e81',
      pale: '#e0e7ff',
    },
    {
      id: 'edr',
      label: 'EDR / AV',
      uplift: posture.edrGap ? 35 : 0,
      chip: '#0891b2',
      text: '#fff',
      dot: '#0891b2',
      pale: '#cffafe',
    },
    {
      id: 'backup',
      label: 'Backups',
      uplift: posture.backupWeak ? 25 : 0,
      chip: '#7dd3fc',
      text: '#0f172a',
      dot: '#0284c7',
      pale: '#e0f2fe',
    },
    {
      id: 'ir',
      label: 'IR / DR test',
      uplift: posture.irTested ? 0 : 20,
      chip: '#c4b5fd',
      text: '#1e1b4b',
      dot: '#7c3aed',
      pale: '#ede9fe',
    },
    {
      id: 'loss',
      label: 'Prior loss',
      uplift: posture.lossYes ? 40 : 0,
      chip: '#7c3aed',
      text: '#fff',
      dot: '#7c3aed',
      pale: '#ede9fe',
    },
  ]
}

function lossCostLabel(aleUsd: number, revenueUsd: number, ineligible: boolean): string {
  if (ineligible || revenueUsd <= 0) return 'Not priced'
  const bps = (aleUsd / revenueUsd) * 10_000
  const text = bps >= 10 ? String(Math.round(bps)) : bps.toFixed(1)
  return `${text} bps`
}

function aleParts(exposure: CarrierExposureSummary) {
  return [
    { label: 'Privacy', usd: exposure.alePrivacyUsd, color: ALE_COLORS.privacy },
    { label: 'Business interruption', usd: exposure.aleBiUsd, color: ALE_COLORS.bi },
    { label: 'Extortion', usd: exposure.aleExtortionUsd, color: ALE_COLORS.extortion },
  ]
}

function ExpectedLossCard({
  exposure,
  revenueUsd,
}: {
  exposure: CarrierExposureSummary
  revenueUsd: number
}) {
  const parts = aleParts(exposure)
  const max = Math.max(...parts.map((part) => part.usd), 1)
  const pill = lossCostLabel(exposure.aleUsd, revenueUsd, Boolean(exposure.ineligibleActivity))
  return (
    <article className="wb-expo-card">
      <h3 className="wb-expo-card__title">Expected annual loss</h3>
      <p className="wb-expo-pill-row">
        <span className="wb-expo-pill-row__label">Loss cost, bps of revenue</span>
        <span className="wb-expo-pill">{pill}</span>
      </p>
      <div
        className="wb-expo-bars"
        role="img"
        aria-label={parts
          .map((part) => `${part.label} ${formatExposureUsd(part.usd)}`)
          .join(', ')}
      >
        {parts.map((part) => (
          <div key={part.label} className="wb-expo-bars__col">
            <span className="wb-expo-bars__value">{formatExposureUsd(part.usd)}</span>
            <div className="wb-expo-bars__track">
              <div
                className="wb-expo-bars__bar"
                style={{
                  height: `${Math.max(4, (part.usd / max) * 100)}%`,
                  background: part.color,
                }}
              />
            </div>
            <span className="wb-expo-bars__name">{part.label}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function ControlLoadCard({ posture }: { posture: ApplicationPosture }) {
  const rows = controlRows(posture)
  return (
    <article className="wb-expo-card">
      <h3 className="wb-expo-card__title">Control frequency load</h3>
      <div className="wb-expo-scale" aria-hidden>
        <span className="wb-expo-scale__meter">
          <span>LOW</span>
          <span>MED</span>
          <span>HIGH</span>
        </span>
      </div>
      <ul className="wb-expo-rows">
        {rows.map((row) => {
          const filled = Math.round((row.uplift / 55) * 10)
          return (
            <li key={row.id} className="wb-expo-row">
              <span className="wb-expo-chip" style={{ background: row.chip, color: row.text }}>
                {row.label}
              </span>
              <span className="wb-expo-row__pct">{row.uplift > 0 ? `+${row.uplift}%` : '0%'}</span>
              <span className="wb-expo-meter" aria-hidden>
                {Array.from({ length: 10 }, (_, index) => (
                  <span
                    key={index}
                    style={{ background: index < filled ? row.dot : row.pale }}
                  />
                ))}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="wb-expo-note">Frequency load versus a control that is already in force.</p>
    </article>
  )
}

function AggregateCard({ exposure }: { exposure: CarrierExposureSummary }) {
  const losses = exposure.worstCase.filter((row) => row.label !== 'Requested limit')
  const scale = Math.max(exposure.worstCaseTotalUsd, exposure.limitRequestedUsd, 1)
  const covered = Math.min(exposure.limitRequestedUsd, exposure.worstCaseTotalUsd)
  const shortfall = Math.max(0, exposure.worstCaseTotalUsd - exposure.limitRequestedUsd)
  const headroom = Math.max(0, exposure.limitRequestedUsd - exposure.worstCaseTotalUsd)
  const limitSegments = [
    covered > 0 ? { label: 'Covered', usd: covered } : null,
    shortfall > 0 ? { label: 'Shortfall', usd: shortfall } : null,
    headroom > 0 ? { label: 'Headroom', usd: headroom } : null,
  ].filter((segment): segment is { label: string; usd: number } => segment != null)
  const limitTotal = limitSegments.reduce((sum, segment) => sum + segment.usd, 0) || 1

  const legend = [
    ...losses.map((row) => row.label),
    ...limitSegments.map((segment) => segment.label),
  ]

  return (
    <article className="wb-expo-card">
      <h3 className="wb-expo-card__title">Aggregate vs stacked worst case</h3>
      <div className="wb-expo-stacks">
        <StackBar
          name="Worst case"
          total={exposure.worstCaseTotalUsd}
          widthPct={(exposure.worstCaseTotalUsd / scale) * 100}
          segments={losses.map((row) => ({
            label: row.label,
            pct: exposure.worstCaseTotalUsd > 0 ? (row.usd / exposure.worstCaseTotalUsd) * 100 : 0,
          }))}
        />
        <StackBar
          name="Requested aggregate"
          total={exposure.limitRequestedUsd}
          widthPct={(limitTotal / scale) * 100}
          segments={limitSegments.map((segment) => ({
            label: segment.label,
            pct: (segment.usd / limitTotal) * 100,
          }))}
        />
      </div>
      <ul className="wb-expo-legend">
        {legend.map((label) => (
          <li key={label}>
            <span style={{ background: STACK_COLORS[label] ?? '#94a3b8' }} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
      <p className="wb-expo-note">{exposure.adequacyDetail}</p>
    </article>
  )
}

function StackBar({
  name,
  total,
  widthPct,
  segments,
}: {
  name: string
  total: number
  widthPct: number
  segments: { label: string; pct: number }[]
}) {
  return (
    <div className="wb-expo-stack">
      <span className="wb-expo-stack__name">{name}</span>
      <div
        className="wb-expo-stack__track"
        role="img"
        aria-label={`${name} ${formatExposureUsd(total)}. ${segments
          .map((segment) => `${segment.label} ${Math.round(segment.pct)}%`)
          .join(', ')}`}
      >
        <div className="wb-expo-stack__bar" style={{ width: `${Math.max(widthPct, 8)}%` }}>
          {segments.map((segment) => (
            <span
              key={segment.label}
              style={{
                width: `${segment.pct}%`,
                background: STACK_COLORS[segment.label] ?? '#94a3b8',
              }}
            />
          ))}
        </div>
      </div>
      <span className="wb-expo-stack__total">{formatExposureUsd(total)}</span>
    </div>
  )
}

function AleMixCard({ exposure }: { exposure: CarrierExposureSummary }) {
  const parts = aleParts(exposure)
  const total = parts.reduce((sum, part) => sum + part.usd, 0)
  let cursor = 0
  const stops =
    total <= 0
      ? ['#e5e7eb 0% 100%']
      : parts.map((part) => {
          const start = (cursor / total) * 100
          cursor += part.usd
          const end = (cursor / total) * 100
          return `${part.color} ${start}% ${end}%`
        })
  return (
    <article className="wb-expo-card">
      <h3 className="wb-expo-card__title">Where the annual loss sits</h3>
      <div className="wb-expo-donut-row">
        <div
          className="wb-expo-donut"
          style={{ background: `conic-gradient(${stops.join(', ')})` }}
          role="img"
          aria-label={
            total <= 0
              ? 'Annual loss is not priced'
              : parts
                  .map(
                    (part) =>
                      `${part.label} ${Math.round((part.usd / total) * 100)} percent`,
                  )
                  .join(', ')
          }
        >
          <div className="wb-expo-donut__hole">
            <span>ALE</span>
            <strong>{formatExposureUsd(exposure.aleUsd)}</strong>
          </div>
        </div>
        <ul className="wb-expo-legend wb-expo-legend--donut">
          {parts.map((part) => (
            <li key={part.label}>
              <span style={{ background: part.color }} aria-hidden />
              {part.label}
              <em>{total > 0 ? `${Math.round((part.usd / total) * 100)}%` : '0%'}</em>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function RiskVizPanel({
  c,
  onOpenCites,
}: {
  c: CyberCase
  onOpenCites?: () => void
}) {
  const exposure = carrierExposureForCase(c)
  const posture = applicationPosture(c)

  return (
    <div className="wb-capacity-ledger wb-expo-board" aria-label="Internal risk insights">
      <div className="wb-expo-head">
        <h3 className="cuw-type-title">Internal risk insights</h3>
        {onOpenCites ? (
          <button type="button" className="wb-risk-cite-open" onClick={onOpenCites}>
            View sources
          </button>
        ) : null}
      </div>
      <div className="wb-expo">
        <ExpectedLossCard exposure={exposure} revenueUsd={c.revenueUsd} />
        <ControlLoadCard posture={posture} />
        <AggregateCard exposure={exposure} />
        <AleMixCard exposure={exposure} />
      </div>
    </div>
  )
}
