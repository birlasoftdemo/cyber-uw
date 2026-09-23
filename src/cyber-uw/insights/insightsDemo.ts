import { flowStageTitle } from '../constants/cyberFlow'
import { MOCK_CYBER_CASES } from '../data/mockCases'
import type { CyberCase } from '../types'
import type { CyberDrillDownRow } from './types'
import { AGE_BUCKETS, STAGES } from './types'

export const VENDOR_WATCH_THRESHOLD = 25
export const LIMIT_HIGH_THRESHOLD = 5_000_000

export const heroKpis = {
  medianDaysToDecision: 2.8,
  signalCompletenessHealth: 72,
  pipelineLimitMillions: 28.5,
  limitOver5mCount: 4,
  gapBlockedBacklog: 6,
}

export const kpiSparklines = {
  medianDaysToDecision: [3.4, 3.2, 3.1, 2.9, 3.0, 2.8, 2.8],
  signalCompletenessHealth: [64, 66, 68, 70, 69, 71, 72],
  pipelineLimitMillions: [22, 24, 26, 25, 27, 28, 28.5],
  gapBlockedBacklog: [9, 8, 8, 7, 7, 6, 6],
}

export const kpiDeltas = {
  medianDaysToDecision: { pct: -8, label: '30d' },
  signalCompletenessHealth: { pct: 5, label: '30d' },
  pipelineLimitMillions: { pct: 12, label: '30d' },
  gapBlockedBacklog: { pct: -14, label: '30d' },
}

/** Flat stage × age rows for stacked bar pivot */
export const stageAging: { stage: string; bucket: (typeof AGE_BUCKETS)[number]; count: number }[] = [
  { stage: 'Policy Documents', bucket: '0-24h', count: 3 },
  { stage: 'Policy Documents', bucket: '24-48h', count: 1 },
  { stage: 'Policy Documents', bucket: '>48h', count: 0 },
  { stage: 'Risk Information', bucket: '0-24h', count: 5 },
  { stage: 'Risk Information', bucket: '24-48h', count: 3 },
  { stage: 'Risk Information', bucket: '>48h', count: 2 },
  { stage: 'Risk Analysis', bucket: '0-24h', count: 3 },
  { stage: 'Risk Analysis', bucket: '24-48h', count: 1 },
  { stage: 'Risk Analysis', bucket: '>48h', count: 2 },
  { stage: 'Getting Ready to Quote', bucket: '0-24h', count: 3 },
  { stage: 'Getting Ready to Quote', bucket: '24-48h', count: 2 },
  { stage: 'Getting Ready to Quote', bucket: '>48h', count: 1 },
]

export const cycleTimeByStage: { stage: string; days: number; sla: number }[] = [
  { stage: 'Policy Documents', days: 0.4, sla: 0.5 },
  { stage: 'Risk Information', days: 0.8, sla: 1.0 },
  { stage: 'Risk Analysis', days: 0.6, sla: 0.75 },
  { stage: 'Getting Ready to Quote', days: 1.2, sla: 1.5 },
]

export const decisionTrend: { week: string; quote: number; refer: number; decline: number }[] = [
  { week: 'W1', quote: 4, refer: 3, decline: 1 },
  { week: 'W2', quote: 5, refer: 2, decline: 2 },
  { week: 'W3', quote: 3, refer: 4, decline: 1 },
  { week: 'W4', quote: 6, refer: 3, decline: 1 },
  { week: 'W5', quote: 5, refer: 5, decline: 2 },
  { week: 'W6', quote: 7, refer: 3, decline: 1 },
]

export const gapSeverity: { severity: string; count: number }[] = [
  { severity: 'critical', count: 5 },
  { severity: 'high', count: 9 },
  { severity: 'medium', count: 14 },
  { severity: 'info', count: 7 },
]

export const topControls: { control: string; count: number }[] = [
  { control: 'MFA on external admin', count: 6 },
  { control: 'EDR coverage', count: 5 },
  { control: 'Immutable / tested backups', count: 4 },
  { control: 'Email security MFA', count: 3 },
]

export const cleanQuotePathPct = 38

export const recVsDecision: { recommendation: string; quote: number; refer: number; decline: number; pending: number }[] =
  [
    { recommendation: 'quote', quote: 8, refer: 1, decline: 0, pending: 2 },
    { recommendation: 'refer', quote: 2, refer: 6, decline: 1, pending: 3 },
    { recommendation: 'decline', quote: 0, refer: 1, decline: 4, pending: 1 },
  ]

export const limitBuckets: { bucket: string; count: number; millions: number; highlight: boolean }[] = [
  { bucket: '<$1M', count: 5, millions: 3.2, highlight: false },
  { bucket: '$1–5M', count: 8, millions: 22.4, highlight: false },
  { bucket: '≥$5M', count: 4, millions: 38.0, highlight: true },
  { bucket: '≥$10M', count: 2, millions: 24.0, highlight: true },
]

export const sectorDecision: { sector: string; quote: number; refer: number; decline: number }[] = [
  { sector: 'Healthcare', quote: 2, refer: 4, decline: 1 },
  { sector: 'Technology / SaaS', quote: 5, refer: 2, decline: 0 },
  { sector: 'Financial services', quote: 1, refer: 3, decline: 2 },
  { sector: 'Manufacturing', quote: 3, refer: 1, decline: 1 },
]

/** Renewals / New Business / In-process open WIP. */
export const submissionKindMix: {
  kind: string
  kindKey: 'new_business' | 'renewal' | 'open'
  total: number
  open: number
}[] = [
  { kind: 'New business', kindKey: 'new_business', total: 14, open: 9 },
  { kind: 'Renewals', kindKey: 'renewal', total: 11, open: 6 },
  { kind: 'In-process / open', kindKey: 'open', total: 15, open: 15 },
]

export const vendorHits: { vendor: string; category: string; bookCount: number }[] = [
  { vendor: 'Microsoft 365', category: 'SaaS / Identity', bookCount: 41 },
  { vendor: 'AWS', category: 'Cloud', bookCount: 28 },
  { vendor: 'Okta', category: 'Identity', bookCount: 26 },
  { vendor: 'CrowdStrike', category: 'EDR', bookCount: 19 },
  { vendor: 'RegionalMSP Co', category: 'MSP', bookCount: 7 },
]

/** CR01 — monthly volume + threat category lines */
export const riskThreatTrend: {
  month: string
  volume: number
  ransomware: number
  phishing: number
  dos: number
  dataLeak: number
  imposter: number
}[] = [
  { month: '2025-10', volume: 9200, ransomware: 4200, phishing: 2800, dos: 1100, dataLeak: 700, imposter: 400 },
  { month: '2025-11', volume: 10100, ransomware: 4800, phishing: 3100, dos: 900, dataLeak: 800, imposter: 500 },
  { month: '2025-12', volume: 8800, ransomware: 3900, phishing: 2600, dos: 1400, dataLeak: 600, imposter: 300 },
  { month: '2026-01', volume: 11200, ransomware: 5200, phishing: 3400, dos: 1200, dataLeak: 900, imposter: 500 },
  { month: '2026-02', volume: 9800, ransomware: 4500, phishing: 3000, dos: 1000, dataLeak: 750, imposter: 550 },
  { month: '2026-03', volume: 12400, ransomware: 6100, phishing: 3600, dos: 1300, dataLeak: 850, imposter: 550 },
  { month: '2026-04', volume: 10800, ransomware: 5000, phishing: 3300, dos: 1100, dataLeak: 800, imposter: 600 },
  { month: '2026-05', volume: 13100, ransomware: 6400, phishing: 3900, dos: 1500, dataLeak: 700, imposter: 600 },
  { month: '2026-06', volume: 11900, ransomware: 5600, phishing: 3500, dos: 1200, dataLeak: 950, imposter: 650 },
]

/** CR02 — Risk Map sector × vendor policy counts */
export const RiskMapHeatmapSectors = ['Healthcare', 'Technology / SaaS', 'Financial services', 'Manufacturing'] as const
export const RiskMapHeatmapVendors = ['Microsoft 365', 'AWS', 'Okta', 'CrowdStrike', 'RegionalMSP Co'] as const

export const RiskMapHeatmapCells: {
  sector: (typeof RiskMapHeatmapSectors)[number]
  vendor: (typeof RiskMapHeatmapVendors)[number]
  policyCount: number
  exposedLimitUsd: number
  avgSignalScore: number
}[] = [
  { sector: 'Healthcare', vendor: 'Microsoft 365', policyCount: 14, exposedLimitUsd: 48_000_000, avgSignalScore: 58 },
  { sector: 'Healthcare', vendor: 'AWS', policyCount: 6, exposedLimitUsd: 22_000_000, avgSignalScore: 61 },
  { sector: 'Healthcare', vendor: 'Okta', policyCount: 11, exposedLimitUsd: 36_000_000, avgSignalScore: 55 },
  { sector: 'Healthcare', vendor: 'CrowdStrike', policyCount: 8, exposedLimitUsd: 28_000_000, avgSignalScore: 72 },
  { sector: 'Healthcare', vendor: 'RegionalMSP Co', policyCount: 4, exposedLimitUsd: 12_000_000, avgSignalScore: 49 },
  { sector: 'Technology / SaaS', vendor: 'Microsoft 365', policyCount: 12, exposedLimitUsd: 40_000_000, avgSignalScore: 74 },
  { sector: 'Technology / SaaS', vendor: 'AWS', policyCount: 16, exposedLimitUsd: 62_000_000, avgSignalScore: 71 },
  { sector: 'Technology / SaaS', vendor: 'Okta', policyCount: 9, exposedLimitUsd: 30_000_000, avgSignalScore: 68 },
  { sector: 'Technology / SaaS', vendor: 'CrowdStrike', policyCount: 7, exposedLimitUsd: 24_000_000, avgSignalScore: 79 },
  { sector: 'Technology / SaaS', vendor: 'RegionalMSP Co', policyCount: 1, exposedLimitUsd: 3_000_000, avgSignalScore: 66 },
  { sector: 'Financial services', vendor: 'Microsoft 365', policyCount: 9, exposedLimitUsd: 55_000_000, avgSignalScore: 64 },
  { sector: 'Financial services', vendor: 'AWS', policyCount: 4, exposedLimitUsd: 28_000_000, avgSignalScore: 60 },
  { sector: 'Financial services', vendor: 'Okta', policyCount: 5, exposedLimitUsd: 32_000_000, avgSignalScore: 57 },
  { sector: 'Financial services', vendor: 'CrowdStrike', policyCount: 3, exposedLimitUsd: 18_000_000, avgSignalScore: 70 },
  { sector: 'Financial services', vendor: 'RegionalMSP Co', policyCount: 0, exposedLimitUsd: 0, avgSignalScore: 0 },
  { sector: 'Manufacturing', vendor: 'Microsoft 365', policyCount: 6, exposedLimitUsd: 18_000_000, avgSignalScore: 62 },
  { sector: 'Manufacturing', vendor: 'AWS', policyCount: 2, exposedLimitUsd: 8_000_000, avgSignalScore: 58 },
  { sector: 'Manufacturing', vendor: 'Okta', policyCount: 1, exposedLimitUsd: 4_000_000, avgSignalScore: 54 },
  { sector: 'Manufacturing', vendor: 'CrowdStrike', policyCount: 1, exposedLimitUsd: 5_000_000, avgSignalScore: 65 },
  { sector: 'Manufacturing', vendor: 'RegionalMSP Co', policyCount: 2, exposedLimitUsd: 7_000_000, avgSignalScore: 51 },
]

/** CR03 — top insured exposures */
export const topExposures: {
  insured: string
  caseId: string | null
  amountUsd: number
  trending: 'up' | 'down'
  sector: string
}[] = [
  {
    insured: 'Airbnb',
    caseId: MOCK_CYBER_CASES[0]?.id ?? null,
    amountUsd: 50_000_000,
    trending: 'up',
    sector: 'Travel / Hospitality Marketplace',
  },
  {
    insured: 'LumenForge Software',
    caseId: MOCK_CYBER_CASES[1]?.id ?? null,
    amountUsd: 18_500_000,
    trending: 'up',
    sector: 'Technology / SaaS',
  },
  {
    insured: 'Harbor Retail Group',
    caseId: MOCK_CYBER_CASES[2]?.id ?? null,
    amountUsd: 17_200_000,
    trending: 'down',
    sector: 'Retail',
  },
  {
    insured: 'Cascade Logistics',
    caseId: MOCK_CYBER_CASES[3]?.id ?? null,
    amountUsd: 16_800_000,
    trending: 'up',
    sector: 'Manufacturing',
  },
  {
    insured: 'BrightPath Clinics',
    caseId: null,
    amountUsd: 16_200_000,
    trending: 'down',
    sector: 'Healthcare',
  },
]

export const bookInsuredLiabilityUsd = 899_440_021
export const bookLiability30dTrend: 'down' | 'up' = 'down'

function stageFromCase(c: CyberCase): string {
  return flowStageTitle(c)
}

function ageHours(iso: string): number {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000))
}

function toRow(c: CyberCase, isReal = true): CyberDrillDownRow {
  return {
    id: c.id,
    insured: c.insured,
    broker: c.broker,
    sector: c.sector,
    submissionKind: c.submissionKind === 'renewal' ? 'Renewal' : 'New business',
    stage: stageFromCase(c),
    tier: c.tier,
    signalScore: c.signalScore,
    limitRequestedUsd: c.limitRequestedUsd,
    gapCriticalCount: c.gaps.filter((g) => g.severity === 'critical' || g.severity === 'high').length,
    decision: c.decision,
    assignee: c.audit.at(-1)?.actor ?? 'Unassigned',
    ageHours: ageHours(c.receivedAt),
    isReal,
  }
}

const DEMO_PAD: CyberDrillDownRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `CYB-2026-DEMO-${String(i + 1).padStart(3, '0')}`,
  insured: ['Acme Robotics', 'BrightPath Clinics', 'Cobalt Logistics', 'Delta Fintech'][i % 4],
  broker: ['Marsh Specialty', 'Aon Cyber Desk', 'WTW Cyber'][i % 3],
  sector: ['Healthcare', 'Technology / SaaS', 'Financial services', 'Manufacturing'][i % 4],
  submissionKind: i % 2 === 0 ? 'New business' : 'Renewal',
  stage: STAGES[i % STAGES.length],
  tier: ((i % 5) + 1) as number,
  signalScore: 48 + i * 4,
  limitRequestedUsd: [1_000_000, 3_000_000, 5_000_000, 10_000_000][i % 4],
  gapCriticalCount: i % 3,
  decision: ['pending', 'quote', 'refer', 'decline'][i % 4],
  assignee: ['Sarah Chen', 'James Park', 'Unassigned'][i % 3],
  ageHours: 8 + i * 7,
  isReal: false,
}))

/** Build drawer rows for a selection; prefer real mock cases when they match. */
export function rowsForSelection(
  chartId: string,
  segment: Record<string, string | number>,
  count: number,
): CyberDrillDownRow[] {
  const real = MOCK_CYBER_CASES.map((c) => toRow(c))
  let filtered = real

  switch (chartId) {
    case 'stageAging':
      filtered = real.filter((r) => r.stage === segment.stage)
      break
    case 'cycleTime':
      filtered = real.filter((r) => r.stage === segment.stage)
      break
    case 'decisionTrend':
      filtered = real.filter((r) => r.decision === segment.decision)
      break
    case 'gapSeverity':
      filtered = real.filter((r) => r.gapCriticalCount > 0)
      break
    case 'recVsDecision':
      filtered = real.filter((r) => r.decision === segment.decision || r.decision === 'pending')
      break
    case 'limitConcentration': {
      const bucket = String(segment.limitBucket)
      filtered = real.filter((r) => {
        const lim = r.limitRequestedUsd
        if (bucket === '<$1M') return lim < 1_000_000
        if (bucket === '$1–5M') return lim >= 1_000_000 && lim < 5_000_000
        if (bucket === '≥$5M') return lim >= 5_000_000 && lim < 10_000_000
        if (bucket === '≥$10M') return lim >= 10_000_000
        return lim >= LIMIT_HIGH_THRESHOLD
      })
      break
    }
    case 'sectorDecision':
      filtered = real.filter((r) => r.sector === segment.sector)
      break
    case 'submissionKind': {
      const key = String(segment.kindKey)
      if (key === 'open' || segment.openOnly) {
        filtered = real.filter((r) => r.decision === 'pending')
        if (key === 'renewal') {
          filtered = filtered.filter((r) => r.submissionKind === 'Renewal')
        } else if (key === 'new_business') {
          filtered = filtered.filter((r) => r.submissionKind === 'New business')
        }
      } else if (key === 'renewal') {
        filtered = real.filter((r) => r.submissionKind === 'Renewal')
      } else {
        filtered = real.filter((r) => r.submissionKind === 'New business')
      }
      break
    }
    case 'vendorAccumulation':
      filtered = real.filter((c) =>
        MOCK_CYBER_CASES.find((m) => m.id === c.id)?.vendors.some((v) => v.vendor === segment.vendor),
      )
      break
    case 'riskThreatTrend':
      filtered = real.filter((r) => r.decision === 'pending' || r.gapCriticalCount > 0)
      break
    case 'RiskMapHeatmap':
      filtered = real.filter((r) => {
        const matchSector = !segment.sector || r.sector === segment.sector
        const matchVendor =
          !segment.vendor ||
          MOCK_CYBER_CASES.find((m) => m.id === r.id)?.vendors.some((v) => v.vendor === segment.vendor)
        return matchSector && Boolean(matchVendor || !segment.vendor)
      })
      break
    case 'topExposures':
      filtered = real
        .slice()
        .sort((a, b) => b.limitRequestedUsd - a.limitRequestedUsd)
      if (segment.insured) {
        const hit = filtered.filter((r) => r.insured === segment.insured)
        if (hit.length) filtered = hit
      } else if (segment.sector) {
        filtered = filtered.filter((r) => r.sector === segment.sector)
      }
      break
    case 'heroKpi':
      if (segment.kpi === 'gapBlocked') {
        filtered = real.filter((r) => r.decision === 'pending' && r.gapCriticalCount > 0)
      } else if (segment.kpi === 'pipelineLimit') {
        filtered = real.filter((r) => r.decision === 'pending')
      }
      break
    default:
      break
  }

  const need = Math.max(count, 3)
  const out = [...filtered]
  let i = 0
  while (out.length < need && i < DEMO_PAD.length) {
    out.push(DEMO_PAD[i])
    i += 1
  }
  return out.slice(0, Math.max(need, filtered.length))
}
