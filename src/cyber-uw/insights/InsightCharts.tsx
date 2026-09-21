import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  bookInsuredLiabilityUsd,
  bookLiability30dTrend,
  cycleTimeByStage,
  decisionTrend,
  gapSeverity,
  limitBuckets,
  recVsDecision,
  riskThreatTrend,
  sectorDecision,
  submissionKindMix,
  RiskMapHeatmapCells,
  RiskMapHeatmapSectors,
  RiskMapHeatmapVendors,
  stageAging,
  topControls,
  topExposures,
  vendorHits,
  VENDOR_WATCH_THRESHOLD,
} from './insightsDemo'
import { ChartCard } from './InsightSection'
import { AGE_BUCKETS, CHART_COLORS, STAGES, type DrillDownSelection } from './types'

type OpenDrill = (sel: DrillDownSelection) => void

/** Chart series / axis labels — keep data keys as `refer`, display as escalate. */
function decisionSeriesName(key: string): string {
  return key === 'refer' ? 'escalate' : key
}

function pivotAging() {
  return STAGES.map((stage) => {
    const row: Record<string, string | number> = { stage }
    for (const b of AGE_BUCKETS) {
      row[b] = stageAging.find((r) => r.stage === stage && r.bucket === b)?.count ?? 0
    }
    return row
  })
}

const AGE_COLORS = [CHART_COLORS.emerald, CHART_COLORS.amber, CHART_COLORS.rose]

export function StageAgingChart({ onDrill }: { onDrill: OpenDrill }) {
  const data = pivotAging()
  return (
    <ChartCard title="Stage aging" badge="Ops" className="xl:col-span-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {AGE_BUCKETS.map((bucket, i) => (
            <Bar
              key={bucket}
              dataKey={bucket}
              stackId="age"
              fill={AGE_COLORS[i]}
              cursor="pointer"
              onClick={(item) => {
                const payload = item?.payload as Record<string, string | number> | undefined
                if (!payload?.stage) return
                const count = Number(payload[bucket] ?? 0)
                onDrill({
                  chartId: 'stageAging',
                  title: `${String(payload.stage)} · ${bucket}`,
                  count,
                  segment: { stage: String(payload.stage), ageBucket: bucket },
                })
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function CycleTimeChart({ onDrill }: { onDrill: OpenDrill }) {
  return (
    <ChartCard title="Cycle time by stage" badge="UW" className="xl:col-span-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={cycleTimeByStage} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={28} unit="d" />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar
            dataKey="days"
            name="Median days"
            fill={CHART_COLORS.blue}
            cursor="pointer"
            onClick={(item) => {
              const payload = item?.payload as { stage?: string; days?: number } | undefined
              if (!payload?.stage) return
              onDrill({
                chartId: 'cycleTime',
                title: `Cycle time · ${payload.stage}`,
                count: Math.max(1, Math.round(payload.days ?? 1)),
                segment: { stage: payload.stage },
              })
            }}
          />
          <Bar dataKey="sla" name="SLA" fill={CHART_COLORS.slate} opacity={0.35} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function DecisionTrendChart({ onDrill }: { onDrill: OpenDrill }) {
  return (
    <ChartCard title="Quote / escalate / decline trend" badge="Both" className="xl:col-span-4">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={decisionTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {(
            [
              ['quote', CHART_COLORS.emerald],
              ['refer', CHART_COLORS.amber],
              ['decline', CHART_COLORS.rose],
            ] as const
          ).map(([key, color]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={decisionSeriesName(key)}
              stroke={color}
              strokeWidth={2}
              dot={(dotProps) => {
                const { cx, cy, payload } = dotProps as {
                  cx?: number
                  cy?: number
                  payload?: Record<string, string | number>
                }
                if (cx == null || cy == null || !payload) return null
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      onDrill({
                        chartId: 'decisionTrend',
                        title: `${payload.week} · ${decisionSeriesName(key)}`,
                        count: Number(payload[key] ?? 0),
                        segment: { week: String(payload.week), decision: key },
                      })
                    }
                  />
                )
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

const SEV_COLORS: Record<string, string> = {
  critical: CHART_COLORS.rose,
  high: CHART_COLORS.amber,
  medium: CHART_COLORS.blue,
  info: CHART_COLORS.emerald,
}

export function GapSeverityChart({ onDrill }: { onDrill: OpenDrill }) {
  return (
    <ChartCard title="Control gap severity mix" badge="Both" className="xl:col-span-6">
      <div className="grid flex-1 gap-3 md:grid-cols-2">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={gapSeverity}
              dataKey="count"
              nameKey="severity"
              cx="50%"
              cy="50%"
              outerRadius={72}
              cursor="pointer"
              onClick={(_, index) => {
                const row = gapSeverity[index]
                if (!row) return
                onDrill({
                  chartId: 'gapSeverity',
                  title: `Gaps · ${row.severity}`,
                  count: row.count,
                  segment: { severity: row.severity },
                })
              }}
            >
              {gapSeverity.map((row) => (
                <Cell key={row.severity} fill={SEV_COLORS[row.severity] ?? CHART_COLORS.slate} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div>
          <ul className="space-y-1.5">
            {topControls.map((c) => (
              <li key={c.control}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-slate-50"
                  onClick={() =>
                    onDrill({
                      chartId: 'gapSeverity',
                      title: c.control,
                      count: c.count,
                      segment: { control: c.control },
                    })
                  }
                >
                  <span className="truncate text-slate-700">{c.control}</span>
                  <span className="font-semibold text-slate-900">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ChartCard>
  )
}

export function RecVsDecisionChart({ onDrill }: { onDrill: OpenDrill }) {
  return (
    <ChartCard title="Recommendation vs decision" badge="UW" className="xl:col-span-6">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={recVsDecision} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="recommendation"
            tick={{ fontSize: 11 }}
            tickFormatter={decisionSeriesName}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {(
            [
              ['quote', CHART_COLORS.emerald],
              ['refer', CHART_COLORS.amber],
              ['decline', CHART_COLORS.rose],
              ['pending', CHART_COLORS.slate],
            ] as const
          ).map(([key, color]) => (
            <Bar
              key={key}
              dataKey={key}
              name={decisionSeriesName(key)}
              stackId="rec"
              fill={color}
              cursor="pointer"
              onClick={(item) => {
                const payload = item?.payload as { recommendation?: string } | undefined
                if (!payload?.recommendation) return
                const count = Number((payload as Record<string, unknown>)[key] ?? 0)
                onDrill({
                  chartId: 'recVsDecision',
                  title: `AI ${decisionSeriesName(payload.recommendation)} → UW ${decisionSeriesName(key)}`,
                  count,
                  segment: { recommendation: payload.recommendation, decision: key },
                })
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function LimitConcentrationChart({
  onDrill,
  highlightHigh,
}: {
  onDrill: OpenDrill
  highlightHigh: boolean
}) {
  return (
    <ChartCard title="Limit concentration" badge="UW" className="xl:col-span-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={limitBuckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Bar
            dataKey="count"
            cursor="pointer"
            onClick={(item) => {
              const payload = item?.payload as { bucket?: string; count?: number } | undefined
              if (!payload?.bucket) return
              onDrill({
                chartId: 'limitConcentration',
                title: `Limit · ${payload.bucket}`,
                count: payload.count ?? 0,
                segment: { limitBucket: payload.bucket },
              })
            }}
          >
            {limitBuckets.map((row) => (
              <Cell
                key={row.bucket}
                fill={
                  highlightHigh && row.highlight ? CHART_COLORS.violet : CHART_COLORS.blue
                }
                opacity={highlightHigh && !row.highlight ? 0.45 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function SectorDecisionChart({ onDrill }: { onDrill: OpenDrill }) {
  return (
    <ChartCard title="Sector × decision mix" badge="Both" className="xl:col-span-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={sectorDecision} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="sector" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={48} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {(
            [
              ['quote', CHART_COLORS.emerald],
              ['refer', CHART_COLORS.amber],
              ['decline', CHART_COLORS.rose],
            ] as const
          ).map(([key, color]) => (
            <Bar
              key={key}
              dataKey={key}
              name={decisionSeriesName(key)}
              stackId="sec"
              fill={color}
              cursor="pointer"
              onClick={(item) => {
                const payload = item?.payload as { sector?: string } | undefined
                if (!payload?.sector) return
                const count = Number((payload as Record<string, unknown>)[key] ?? 0)
                onDrill({
                  chartId: 'sectorDecision',
                  title: `${payload.sector} · ${decisionSeriesName(key)}`,
                  count,
                  segment: { sector: payload.sector, decision: key },
                })
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function SubmissionKindChart({ onDrill }: { onDrill: OpenDrill }) {
  return (
    <ChartCard title="Renewals · New business · Open" badge="Both" className="xl:col-span-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={submissionKindMix} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="kind" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar
            dataKey="total"
            name="Volume"
            fill={CHART_COLORS.indigo}
            cursor="pointer"
            onClick={(item) => {
              const payload = item?.payload as {
                kind?: string
                kindKey?: string
                total?: number
              } | undefined
              if (!payload?.kindKey) return
              onDrill({
                chartId: 'submissionKind',
                title: payload.kind ?? 'Submission kind',
                count: Number(payload.total ?? 0),
                segment: { kindKey: payload.kindKey },
              })
            }}
          />
          <Bar
            dataKey="open"
            name="In-process"
            fill={CHART_COLORS.sky}
            cursor="pointer"
            onClick={(item) => {
              const payload = item?.payload as {
                kind?: string
                kindKey?: string
                open?: number
              } | undefined
              if (!payload?.kindKey) return
              onDrill({
                chartId: 'submissionKind',
                title: `${payload.kind ?? 'Kind'} · in-process`,
                count: Number(payload.open ?? 0),
                segment: {
                  kindKey: payload.kindKey === 'open' ? 'open' : payload.kindKey,
                  openOnly: 1,
                },
              })
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function VendorAccumulationChart({ onDrill }: { onDrill: OpenDrill }) {
  const data = [...vendorHits].sort((a, b) => b.bookCount - a.bookCount)
  return (
    <ChartCard title="Vendor accumulation hits" badge="UW" className="xl:col-span-4">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="vendor" width={96} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar
            dataKey="bookCount"
            cursor="pointer"
            onClick={(item) => {
              const payload = item?.payload as { vendor?: string; bookCount?: number } | undefined
              if (!payload?.vendor) return
              onDrill({
                chartId: 'vendorAccumulation',
                title: `Vendor · ${payload.vendor}`,
                count: payload.bookCount ?? 0,
                segment: { vendor: payload.vendor },
              })
            }}
          >
            {data.map((row) => (
              <Cell
                key={row.vendor}
                fill={row.bookCount >= VENDOR_WATCH_THRESHOLD ? CHART_COLORS.rose : CHART_COLORS.indigo}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

const THREAT_LINE_KEYS = [
  ['ransomware', CHART_COLORS.rose, 'Ransomware'],
  ['phishing', CHART_COLORS.blue, 'Phishing'],
  ['dos', CHART_COLORS.amber, 'DoS'],
  ['dataLeak', CHART_COLORS.violet, 'Data leak'],
  ['imposter', CHART_COLORS.slate, 'Imposter'],
] as const

export function RiskThreatTrendChart({ onDrill }: { onDrill: OpenDrill }) {
  return (
    <ChartCard title="Cyber insurance risk trend" badge="UW" className="xl:col-span-8">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={riskThreatTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar
            dataKey="volume"
            name="Volume"
            fill="#bbf7d0"
            cursor="pointer"
            onClick={(item) => {
              const payload = item?.payload as { month?: string; volume?: number } | undefined
              if (!payload?.month) return
              onDrill({
                chartId: 'riskThreatTrend',
                title: `Risk volume · ${payload.month}`,
                count: Math.max(3, Math.round((payload.volume ?? 0) / 2000)),
                segment: { month: payload.month, threatCategory: 'volume' },
              })
            }}
          />
          {THREAT_LINE_KEYS.map(([key, color, name]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={name}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, cursor: 'pointer' }}
              activeDot={{
                r: 5,
                onClick: (_e, payload) => {
                  const row = (payload as { payload?: Record<string, string | number> })?.payload
                  if (!row?.month) return
                  onDrill({
                    chartId: 'riskThreatTrend',
                    title: `${name} · ${String(row.month)}`,
                    count: Math.max(3, Math.round(Number(row[key] ?? 0) / 800)),
                    segment: { month: String(row.month), threatCategory: key },
                  })
                },
              }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function heatmapColor(count: number, max: number): string {
  if (count <= 0) return '#f8fafc'
  const t = Math.min(1, count / max)
  if (t < 0.35) return '#dbeafe'
  if (t < 0.55) return '#93c5fd'
  if (t < 0.75) return '#3b82f6'
  return '#1d4ed8'
}

export function RiskMapHeatmapChart({ onDrill }: { onDrill: OpenDrill }) {
  const max = Math.max(...RiskMapHeatmapCells.map((c) => c.policyCount), 1)
  return (
    <ChartCard title="Risk Map concentration · sector × vendor" badge="UW" className="xl:col-span-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-left text-[11px]">
          <thead>
            <tr>
              <th className="px-1 py-1 font-semibold text-slate-500">Sector</th>
              {RiskMapHeatmapVendors.map((v) => (
                <th key={v} className="px-1 py-1 font-semibold text-slate-500">
                  <span className="line-clamp-2 max-w-[4.5rem]">{v.replace('Microsoft ', 'M365 ')}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RiskMapHeatmapSectors.map((sector) => (
              <tr key={sector}>
                <th className="px-1 py-1 font-medium text-slate-700">{sector.split(' / ')[0]}</th>
                {RiskMapHeatmapVendors.map((vendor) => {
                  const cell = RiskMapHeatmapCells.find((c) => c.sector === sector && c.vendor === vendor)
                  const count = cell?.policyCount ?? 0
                  return (
                    <td key={vendor} className="p-0.5">
                      <button
                        type="button"
                        className="flex h-9 w-full items-center justify-center rounded-md font-semibold text-slate-800 transition hover:ring-2 hover:ring-slate-400"
                        style={{
                          background: heatmapColor(count, max),
                          color: count >= max * 0.55 ? '#fff' : undefined,
                        }}
                        title={`${sector} · ${vendor}: ${count} policies`}
                        onClick={() =>
                          onDrill({
                            chartId: 'RiskMapHeatmap',
                            title: `${sector} · ${vendor}`,
                            count: Math.max(count, 3),
                            segment: { sector, vendor },
                          })
                        }
                      >
                        {count}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 px-1 text-[11px] text-slate-500">
        Cell = book policy count (Risk Map stub). Click to drill into cases.
      </p>
    </ChartCard>
  )
}

export function TopExposuresPanel({ onDrill }: { onDrill: OpenDrill }) {
  return (
    <ChartCard title="Top 5 risks by financial exposure" badge="UW" className="xl:col-span-6">
      <table className="w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-1 py-1.5 font-semibold">Company</th>
            <th className="px-1 py-1.5 font-semibold">Amount</th>
            <th className="px-1 py-1.5 font-semibold">Trend</th>
          </tr>
        </thead>
        <tbody>
          {topExposures.map((row) => (
            <tr key={row.insured} className="border-t border-slate-100">
              <td className="px-1 py-2">
                <button
                  type="button"
                  className="text-left font-medium text-slate-900 hover:underline"
                  onClick={() =>
                    onDrill({
                      chartId: 'topExposures',
                      title: `Exposure · ${row.insured}`,
                      count: 5,
                      segment: {
                        insured: row.insured,
                        sector: row.sector,
                        ...(row.caseId ? { caseId: row.caseId } : {}),
                      },
                    })
                  }
                >
                  {row.insured}
                </button>
                <p className="text-xs text-slate-500">{row.sector}</p>
              </td>
              <td className="px-1 py-2 tabular-nums text-slate-800">
                ${(row.amountUsd / 1_000_000).toFixed(1)}M
              </td>
              <td className="px-1 py-2">
                <span
                  className={
                    row.trending === 'up'
                      ? 'font-semibold text-rose-600'
                      : 'font-semibold text-emerald-600'
                  }
                >
                  {row.trending === 'up' ? '↑' : '↓'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartCard>
  )
}

export function BookRiskProfilerCard({ onDrill }: { onDrill: OpenDrill }) {
  const down = bookLiability30dTrend === 'down'
  return (
    <ChartCard title="Book risk profiler · financial liability" badge="Both" className="xl:col-span-6">
      <button
        type="button"
        className="flex w-full flex-col items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-4 text-left transition hover:border-slate-300"
        onClick={() =>
          onDrill({
            chartId: 'topExposures',
            title: 'Book insured liability',
            count: 12,
            segment: { kpi: 'bookLiability' },
          })
        }
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">30-day trend</p>
          <p className={`mt-1 text-3xl font-semibold ${down ? 'text-emerald-600' : 'text-rose-600'}`}>
            {down ? '↓' : '↑'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total insured liability across all policies
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900">
            ${bookInsuredLiabilityUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </button>
    </ChartCard>
  )
}
