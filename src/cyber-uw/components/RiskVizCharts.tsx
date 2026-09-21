/** Case Review Risk charts — carrier exposure context (ALE, worst-case, coverage). */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import {
  carrierExposureForCase,
  formatExposureUsd,
  inherentRiskPointsForCase,
  type ThreatVizPoint,
} from '../data/riskVizDemo'
import {
  AlertOctagon,
  Radio,
  Ruler,
  Umbrella,
} from 'lucide-react'
import type { CyberCase } from '../types'

function formatImpact(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`
  if (usd >= 1000) return `$${(usd / 1000).toFixed(usd >= 10000 ? 0 : 1)}k`
  return `$${usd}`
}

function InherentRiskBubble({
  points,
  activeThreatId,
  onSelectThreat,
  aleUsd,
}: {
  points: ThreatVizPoint[]
  activeThreatId: string | null
  onSelectThreat: (threatId: string) => void
  aleUsd: number
}) {
  return (
    <div className="cuw-panel">
      <div className="cuw-panel__head">
        <span className="cuw-glyph" aria-hidden>
          <Radio size={16} strokeWidth={1.75} />
        </span>
        <h4 className="cuw-type-title">Est. ALE {formatExposureUsd(aleUsd)}</h4>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="likelihoodPct"
            name="Likelihood"
            unit="%"
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            label={{ value: 'Likelihood', position: 'insideBottom', offset: -2, fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="impactUsd"
            name="Impact"
            tick={{ fontSize: 11 }}
            width={44}
            tickFormatter={(v) => formatImpact(Number(v))}
            label={{ value: 'Impact $', angle: -90, position: 'insideLeft', fontSize: 10 }}
          />
          <ZAxis type="number" dataKey="exposureWeight" range={[80, 420]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const p = payload[0].payload as ThreatVizPoint
              return (
                <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm">
                  <p className="font-semibold text-slate-900">{p.label}</p>
                  <p className="text-slate-600">
                    {p.likelihoodPct}% · {formatImpact(p.impactUsd)} · wt {p.exposureWeight}
                  </p>
                </div>
              )
            }}
          />
          <Scatter
            data={points}
            cursor="pointer"
            onClick={(data) => {
              const raw = data as unknown as Partial<ThreatVizPoint> & {
                payload?: ThreatVizPoint
              }
              const hit = raw.payload?.threatId
                ? raw.payload
                : raw.threatId
                  ? (raw as ThreatVizPoint)
                  : null
              if (hit?.threatId) onSelectThreat(hit.threatId)
            }}
          >
            {points.map((p) => (
              <Cell
                key={p.threatId}
                fill={p.color}
                stroke={activeThreatId === p.threatId ? '#0f172a' : 'transparent'}
                strokeWidth={activeThreatId === p.threatId ? 2 : 0}
                opacity={activeThreatId && activeThreatId !== p.threatId ? 0.45 : 0.9}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 px-1">
        {points.map((p) => (
          <li key={p.threatId}>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 text-[11px] ${
                activeThreatId === p.threatId ? 'font-semibold text-slate-900' : 'text-slate-600'
              }`}
              onClick={() => onSelectThreat(p.threatId)}
            >
              <span className="inline-block size-2 rounded-full" style={{ background: p.color }} />
              {p.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function WorstCaseExposureChart({
  rows,
  totalUsd,
  limitUsd,
}: {
  rows: { label: string; usd: number }[]
  totalUsd: number
  limitUsd: number
}) {
  const data = rows.map((r) => ({ name: r.label, usd: r.usd }))
  return (
    <div className="cuw-panel">
      <div className="cuw-panel__head">
        <span className="cuw-glyph" aria-hidden>
          <AlertOctagon size={16} strokeWidth={1.75} />
        </span>
        <h4 className="cuw-type-title">
          Stacked exposure {formatExposureUsd(totalUsd)}
          <span className="cuw-type-caption ml-1 font-medium">
            · limit {formatExposureUsd(limitUsd)}
          </span>
        </h4>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
          <YAxis
            tick={{ fontSize: 11 }}
            width={44}
            tickFormatter={(v) => formatImpact(Number(v))}
          />
          <Tooltip formatter={(value) => formatExposureUsd(Number(value ?? 0))} />
          <Bar dataKey="usd" name="USD" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.name}
                fill={
                  d.name.toLowerCase().includes('limit')
                    ? '#2563eb'
                    : d.name.toLowerCase().includes('extortion')
                      ? '#0f172a'
                      : d.name.toLowerCase().includes('exfil')
                        ? '#64748b'
                        : '#94a3b8'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function CoverageAdequacyChart({
  limitUsd,
  worstCaseTotalUsd,
  adequacyLabel,
  adequacyDetail,
  adequacy,
}: {
  limitUsd: number
  worstCaseTotalUsd: number
  adequacyLabel: string
  adequacyDetail: string
  adequacy: 'adequate' | 'tight' | 'shortfall'
}) {
  const data = [
    { name: 'Requested limit', usd: limitUsd, fill: '#0058b0' },
    { name: 'Worst-case stack', usd: worstCaseTotalUsd, fill: '#3d4f66' },
  ]

  return (
    <div className="cuw-panel">
      <div className="cuw-panel__head">
        <span className="cuw-glyph" aria-hidden>
          <Umbrella size={16} strokeWidth={1.75} />
        </span>
        <div>
          <p className="cuw-type-kicker">{adequacy === 'adequate' ? 'Adequate' : adequacy === 'tight' ? 'Tight' : 'Shortfall'}</p>
          <h4 className="cuw-type-title">{adequacyLabel}</h4>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => formatImpact(Number(v))}
          />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value) => formatExposureUsd(Number(value ?? 0))} />
          <Bar dataKey="usd" name="USD" radius={[0, 4, 4, 0]} barSize={22}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="cuw-type-caption mt-2">{adequacyDetail}</p>
    </div>
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
  const adequacyTone =
    exposure.adequacy === 'adequate'
      ? 'Adequate'
      : exposure.adequacy === 'tight'
        ? 'Tight'
        : 'Shortfall'

  return (
    <div className="wb-capacity-ledger space-y-4" aria-label="Book capacity ledger">
      <div className="cuw-panel">
        <div className="cuw-panel__head">
          <span className="cuw-glyph" aria-hidden>
            <Ruler size={16} strokeWidth={1.75} />
          </span>
          <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
            <div>
              <h4 className="cuw-type-title">Book capacity</h4>
              
            </div>
            {onOpenCites ? (
              <button type="button" className="wb-risk-cite-open" onClick={onOpenCites}>
                View sources
              </button>
            ) : null}
          </div>
        </div>
        <table className="wb-capacity-ledger__table">
          <thead>
            <tr>
              <th scope="col">Line</th>
              <th scope="col" className="wb-capacity-ledger__num">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Requested limit</td>
              <td className="wb-capacity-ledger__num tabular-nums">
                {formatExposureUsd(exposure.limitRequestedUsd)}
              </td>
            </tr>
            <tr>
              <td>Est. ALE</td>
              <td className="wb-capacity-ledger__num tabular-nums">
                {formatExposureUsd(exposure.aleUsd)}
              </td>
            </tr>
            <tr>
              <td>Worst-case stack</td>
              <td className="wb-capacity-ledger__num tabular-nums">
                {formatExposureUsd(exposure.worstCaseTotalUsd)}
              </td>
            </tr>
            <tr>
              <td>Adequacy</td>
              <td className="wb-capacity-ledger__num">
                {adequacyTone} · {exposure.adequacyLabel}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="wb-capacity-ledger__formula font-mono">{exposure.aleFormula}</p>
        
      </div>

      <div className="wb-capacity-charts">
        <InherentRiskBubble
          points={points}
          activeThreatId={activeThreatId}
          onSelectThreat={onSelectThreat}
          aleUsd={exposure.aleUsd}
        />
        <WorstCaseExposureChart
          rows={exposure.worstCase}
          totalUsd={exposure.worstCaseTotalUsd}
          limitUsd={exposure.limitRequestedUsd}
        />
        <div className="wb-capacity-charts__span">
          <CoverageAdequacyChart
            limitUsd={exposure.limitRequestedUsd}
            worstCaseTotalUsd={exposure.worstCaseTotalUsd}
            adequacy={exposure.adequacy}
            adequacyLabel={exposure.adequacyLabel}
            adequacyDetail={exposure.adequacyDetail}
          />
        </div>
      </div>
    </div>
  )
}
