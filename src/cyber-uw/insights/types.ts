/** Chart IDs and drill-down types — CYBER-INSIGHTS-METRICS-SPEC.md */

export type CyberInsightChartId =
  | 'heroKpi'
  | 'stageAging'
  | 'cycleTime'
  | 'decisionTrend'
  | 'gapSeverity'
  | 'recVsDecision'
  | 'limitConcentration'
  | 'sectorDecision'
  | 'submissionKind'
  | 'vendorAccumulation'
  | 'riskThreatTrend'
  | 'RiskMapHeatmap'
  | 'topExposures'

export type KpiStatus = 'on-track' | 'watch' | 'action'

export interface DrillDownSelection {
  chartId: CyberInsightChartId
  title: string
  count: number
  segment: Record<string, string | number>
}

export interface CyberDrillDownRow {
  id: string
  insured: string
  broker: string
  sector: string
  submissionKind: string
  stage: string
  tier: number
  signalScore: number
  limitRequestedUsd: number
  gapCriticalCount: number
  decision: string
  assignee: string
  ageHours: number
  isReal: boolean
}

export const CHART_COLORS = {
  blue: '#2563eb',
  sky: '#0ea5e9',
  indigo: '#4f46e5',
  amber: '#ea580c',
  rose: '#dc2626',
  emerald: '#059669',
  slate: '#64748b',
  violet: '#7c3aed',
} as const

export const AGE_BUCKETS = ['0-24h', '24-48h', '>48h'] as const
export const STAGES = ['Policy Documents', 'Risk Information', 'Risk Analysis', 'Getting Ready to Quote'] as const
