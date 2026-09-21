/** Case-level risk / OSINT confidence demo — CYBER-RISK-VIZ-SPEC.md */

import type { CyberCase } from '../types'
import { applicationPosture, triageFindingsForCase } from './cyberTriageRules'
import type { RiskActionItem } from './riskReviewDemo'
import { RISK_REVIEW_GENERIC, RISK_REVIEW_HEALTHCARE, riskReviewForCase } from './riskReviewDemo'

export type OsintSourceType =
  | 'whois'
  | 'certificate'
  | 'dns'
  | 'topology'
  | 'behavioral'
  | 'form'
  | 'asm'

export type RiskBand = 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical'

export interface ThreatVizPoint {
  threatId: string
  label: string
  likelihoodPct: number
  impactUsd: number
  exposureWeight: number
  color: string
}

export interface ConfidenceFinding {
  id: string
  label: string
  confidence: number
  sourceCount: number
  sourceType: OsintSourceType
  collectedAtDaysAgo: number
  riskBand: RiskBand
}

const THREAT_COLORS = ['#eab308', '#64748b', '#2563eb', '#f97316', '#0ea5e9', '#7c3aed', '#059669']

/** Quantified inherent-risk points keyed by RiskActionItem.id */
const HEALTHCARE_THREAT_VIZ: Record<string, Omit<ThreatVizPoint, 'threatId' | 'label' | 'color'>> = {
  'thr-mfa-vpn': { likelihoodPct: 42, impactUsd: 8200, exposureWeight: 78 },
  'thr-cred-priv': { likelihoodPct: 55, impactUsd: 4100, exposureWeight: 42 },
  'thr-bec-phi': { likelihoodPct: 78, impactUsd: 3600, exposureWeight: 36 },
  'thr-idp-blast': { likelihoodPct: 28, impactUsd: 12000, exposureWeight: 64 },
  'imp-ransom-bi': { likelihoodPct: 38, impactUsd: 15000, exposureWeight: 88 },
  'imp-phi-reg': { likelihoodPct: 48, impactUsd: 9500, exposureWeight: 55 },
  'imp-limit': { likelihoodPct: 22, impactUsd: 2000, exposureWeight: 24 },
  'imp-mfa-floor': { likelihoodPct: 60, impactUsd: 5500, exposureWeight: 48 },
}

const GENERIC_THREAT_VIZ: Record<string, Omit<ThreatVizPoint, 'threatId' | 'label' | 'color'>> = {
  'g-thr-remote': { likelihoodPct: 48, impactUsd: 11000, exposureWeight: 72 },
  'g-thr-vendor': { likelihoodPct: 32, impactUsd: 7000, exposureWeight: 58 },
  'g-imp-ransom': { likelihoodPct: 40, impactUsd: 14000, exposureWeight: 80 },
  'g-imp-ref': { likelihoodPct: 55, impactUsd: 2500, exposureWeight: 30 },
}

function shortLabel(title: string): string {
  const cut = title.split(/[·•|]/)[0]?.trim() ?? title
  return cut.length > 28 ? `${cut.slice(0, 26)}…` : cut
}

function pointsForItems(
  items: RiskActionItem[],
  lookup: Record<string, Omit<ThreatVizPoint, 'threatId' | 'label' | 'color'>>,
): ThreatVizPoint[] {
  return items.map((item, i) => {
    const q = lookup[item.id] ?? {
      likelihoodPct: item.severity === 'high' ? 55 : item.severity === 'medium' ? 35 : 18,
      impactUsd: item.severity === 'high' ? 10000 : item.severity === 'medium' ? 4500 : 1800,
      exposureWeight: item.severity === 'high' ? 70 : item.severity === 'medium' ? 40 : 22,
    }
    return {
      threatId: item.id,
      label: shortLabel(item.title),
      likelihoodPct: q.likelihoodPct,
      impactUsd: q.impactUsd,
      exposureWeight: q.exposureWeight,
      color: THREAT_COLORS[i % THREAT_COLORS.length],
    }
  })
}

export function inherentRiskPointsForCase(c: {
  id?: string
  sector: string
  insured: string
  revenueUsd?: number
  limitRequestedUsd?: number
  completenessPct?: number
  recommendation?: CyberCase['recommendation']
  packageDocs?: CyberCase['packageDocs']
  formSignals?: CyberCase['formSignals']
  gaps?: CyberCase['gaps']
}): ThreatVizPoint[] {
  if (c.packageDocs && c.formSignals && c.gaps && c.revenueUsd != null && c.limitRequestedUsd != null) {
    const findings = triageFindingsForCase(c as CyberCase).filter(
      (f) => f.required || f.severity === 'high',
    )
    return findings.map((f, i) => ({
      threatId: f.id,
      label: f.chartLabel,
      likelihoodPct: f.likelihoodPct,
      impactUsd: f.impactUsd,
      exposureWeight: f.exposureWeight,
      color: THREAT_COLORS[i % THREAT_COLORS.length],
    }))
  }
  const demo = riskReviewForCase(c)
  const lookup =
    demo === RISK_REVIEW_HEALTHCARE || demo.threats[0]?.id.startsWith('thr-')
      ? HEALTHCARE_THREAT_VIZ
      : GENERIC_THREAT_VIZ
  const base = pointsForItems(demo.threats, lookup)
  if (base.length >= 4) return base
  return [...base, ...pointsForItems(demo.impacts.slice(0, 3), lookup)]
}

const HEALTHCARE_FINDINGS: ConfidenceFinding[] = [
  {
    id: 'cf-mfa-asm',
    label: 'VPN MFA gap (ASM)',
    confidence: 0.88,
    sourceCount: 4,
    sourceType: 'asm',
    collectedAtDaysAgo: 2,
    riskBand: 'High',
  },
  {
    id: 'cf-mfa-form',
    label: 'MFA attest (form)',
    confidence: 0.62,
    sourceCount: 2,
    sourceType: 'form',
    collectedAtDaysAgo: 5,
    riskBand: 'High',
  },
  {
    id: 'cf-whois',
    label: 'Domain age / WHOIS',
    confidence: 0.91,
    sourceCount: 3,
    sourceType: 'whois',
    collectedAtDaysAgo: 1,
    riskBand: 'Low',
  },
  {
    id: 'cf-cert',
    label: 'TLS certificate chain',
    confidence: 0.84,
    sourceCount: 3,
    sourceType: 'certificate',
    collectedAtDaysAgo: 3,
    riskBand: 'Medium',
  },
  {
    id: 'cf-dns',
    label: 'DNS / MX records',
    confidence: 0.79,
    sourceCount: 2,
    sourceType: 'dns',
    collectedAtDaysAgo: 4,
    riskBand: 'Medium',
  },
  {
    id: 'cf-topo',
    label: 'Network topology sketch',
    confidence: 0.71,
    sourceCount: 2,
    sourceType: 'topology',
    collectedAtDaysAgo: 12,
    riskBand: 'Medium',
  },
  {
    id: 'cf-beh',
    label: 'Behavioral login anomalies',
    confidence: 0.41,
    sourceCount: 1,
    sourceType: 'behavioral',
    collectedAtDaysAgo: 28,
    riskBand: 'Critical',
  },
  {
    id: 'cf-edr',
    label: 'EDR coverage signal',
    confidence: 0.86,
    sourceCount: 5,
    sourceType: 'asm',
    collectedAtDaysAgo: 2,
    riskBand: 'Low',
  },
  {
    id: 'cf-backup',
    label: 'Backup restore attest',
    confidence: 0.58,
    sourceCount: 1,
    sourceType: 'form',
    collectedAtDaysAgo: 9,
    riskBand: 'High',
  },
  {
    id: 'cf-vendor',
    label: 'Shared IdP dependency',
    confidence: 0.77,
    sourceCount: 3,
    sourceType: 'topology',
    collectedAtDaysAgo: 6,
    riskBand: 'Medium',
  },
  {
    id: 'cf-phi',
    label: 'PHI system footprint',
    confidence: 0.69,
    sourceCount: 2,
    sourceType: 'asm',
    collectedAtDaysAgo: 8,
    riskBand: 'High',
  },
  {
    id: 'cf-dns2',
    label: 'SPF / DKIM posture',
    confidence: 0.82,
    sourceCount: 4,
    sourceType: 'dns',
    collectedAtDaysAgo: 3,
    riskBand: 'Low',
  },
]

const GENERIC_FINDINGS: ConfidenceFinding[] = [
  {
    id: 'gf-asm-remote',
    label: 'Remote admin exposure',
    confidence: 0.81,
    sourceCount: 3,
    sourceType: 'asm',
    collectedAtDaysAgo: 3,
    riskBand: 'High',
  },
  {
    id: 'gf-form-mfa',
    label: 'MFA attest',
    confidence: 0.54,
    sourceCount: 1,
    sourceType: 'form',
    collectedAtDaysAgo: 7,
    riskBand: 'High',
  },
  {
    id: 'gf-whois',
    label: 'WHOIS / domain',
    confidence: 0.9,
    sourceCount: 2,
    sourceType: 'whois',
    collectedAtDaysAgo: 2,
    riskBand: 'Minimal',
  },
  {
    id: 'gf-cert',
    label: 'Certificate inventory',
    confidence: 0.76,
    sourceCount: 2,
    sourceType: 'certificate',
    collectedAtDaysAgo: 10,
    riskBand: 'Low',
  },
  {
    id: 'gf-dns',
    label: 'DNS records',
    confidence: 0.73,
    sourceCount: 3,
    sourceType: 'dns',
    collectedAtDaysAgo: 5,
    riskBand: 'Medium',
  },
  {
    id: 'gf-vendor',
    label: 'Vendor stack map',
    confidence: 0.68,
    sourceCount: 2,
    sourceType: 'topology',
    collectedAtDaysAgo: 14,
    riskBand: 'Medium',
  },
  {
    id: 'gf-beh',
    label: 'Behavioral indicators',
    confidence: 0.35,
    sourceCount: 1,
    sourceType: 'behavioral',
    collectedAtDaysAgo: 35,
    riskBand: 'Critical',
  },
  {
    id: 'gf-edr',
    label: 'EDR telemetry stub',
    confidence: 0.79,
    sourceCount: 4,
    sourceType: 'asm',
    collectedAtDaysAgo: 4,
    riskBand: 'Low',
  },
]

export function confidenceFindingsForCase(c: { sector: string; insured: string }): ConfidenceFinding[] {
  const demo = riskReviewForCase(c)
  if (demo === RISK_REVIEW_HEALTHCARE || demo.threats.some((t) => t.id.startsWith('thr-'))) {
    return HEALTHCARE_FINDINGS
  }
  if (demo === RISK_REVIEW_GENERIC || demo.threats[0]?.id.startsWith('g-')) {
    return GENERIC_FINDINGS
  }
  return GENERIC_FINDINGS
}

export interface SourceConfidenceBucket {
  sources: string
  sourceCount: number
  mean: number
  min: number
  q1: number
  median: number
  q3: number
  max: number
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const next = sorted[base + 1] ?? sorted[base]
  return sorted[base] + rest * (next - sorted[base])
}

export function confidenceBySourceCount(findings: ConfidenceFinding[]): SourceConfidenceBucket[] {
  const groups = new Map<number, number[]>()
  for (const f of findings) {
    const key = Math.min(5, Math.max(1, f.sourceCount))
    const list = groups.get(key) ?? []
    list.push(f.confidence)
    groups.set(key, list)
  }
  return [1, 2, 3, 4, 5].map((n) => {
    const vals = (groups.get(n) ?? []).slice().sort((a, b) => a - b)
    const mean = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
    return {
      sources: n === 5 ? '5+' : String(n),
      sourceCount: n,
      mean: Number(mean.toFixed(3)),
      min: vals[0] ?? 0,
      q1: quantile(vals, 0.25),
      median: quantile(vals, 0.5),
      q3: quantile(vals, 0.75),
      max: vals[vals.length - 1] ?? 0,
    }
  }).filter((b) => b.max > 0 || findings.some((f) => Math.min(5, f.sourceCount) === b.sourceCount))
}

export interface ConfidenceBin {
  bin: string
  binStart: number
  count: number
}

export function confidenceHistogram(findings: ConfidenceFinding[]): {
  bins: ConfidenceBin[]
  mean: number
  median: number
  stdDev: number
} {
  const values = findings.map((f) => f.confidence)
  const mean = values.reduce((s, v) => s + v, 0) / (values.length || 1)
  const sorted = values.slice().sort((a, b) => a - b)
  const median = quantile(sorted, 0.5)
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length || 1)
  const stdDev = Math.sqrt(variance)

  const edges = [0, 0.2, 0.4, 0.6, 0.8, 1.01]
  const bins: ConfidenceBin[] = []
  for (let i = 0; i < edges.length - 1; i++) {
    const start = edges[i]
    const end = edges[i + 1]
    const count = values.filter((v) => v >= start && v < end).length
    bins.push({
      bin: `${start.toFixed(1)}–${Math.min(1, end).toFixed(1)}`,
      binStart: start,
      count,
    })
  }
  return {
    bins,
    mean: Number(mean.toFixed(3)),
    median: Number(median.toFixed(3)),
    stdDev: Number(stdDev.toFixed(3)),
  }
}

export type CoverageAdequacy = 'adequate' | 'tight' | 'shortfall'

export interface IngestCalcInput {
  label: string
  value: string
  source: string
}

export interface ScoreCriterion {
  id: string
  title: string
  formula: string
  applied: string
}

export interface CarrierExposureSummary {
  /** Estimated annualized loss expectancy (USD) */
  aleUsd: number
  /** Industry / size factor note */
  aleBasis: string
  /** How ALE was built from the package */
  aleFormula: string
  scoreCriteria: ScoreCriterion[]
  ingestInputs: IngestCalcInput[]
  /** Component worst-case losses */
  worstCase: { label: string; usd: number }[]
  worstCaseTotalUsd: number
  limitRequestedUsd: number
  /** Coverage vs worst-case total */
  coverageRatio: number
  adequacy: CoverageAdequacy
  adequacyLabel: string
  adequacyDetail: string
  ineligibleActivity: string | null
}

/** Carrier-facing exposure: ALE = SLE × ARO from application answers (Q1–19). */
export function carrierExposureForCase(c: {
  id?: string
  sector: string
  revenueUsd: number
  limitRequestedUsd: number
  insured: string
  completenessPct?: number
  recommendation?: CyberCase['recommendation']
  packageDocs?: CyberCase['packageDocs']
  formSignals?: CyberCase['formSignals']
  gaps?: CyberCase['gaps']
  dossierSummary?: string
}): CarrierExposureSummary {
  const p = applicationPosture(c as CyberCase)
  const slePrivacy = p.recordsMidpoint * p.costPerRecord * p.encryptionEf
  const alePrivacy = slePrivacy * p.aro
  const biSle = c.revenueUsd * (p.rtoHours / 8760) * 0.55
  const aleBi = biSle * p.aro
  const sleExtortion = Math.min(c.limitRequestedUsd * 0.15, c.revenueUsd * 0.012)
  const aleExtortion = sleExtortion * p.aro * 0.6
  const aleUsd = p.ineligibleActivity ? 0 : Math.round(alePrivacy + aleBi + aleExtortion)

  const worstCase = p.ineligibleActivity
    ? [
        { label: 'Cyber extortion', usd: 0 },
        { label: 'Data exfiltration', usd: 0 },
        { label: 'Business interruption', usd: 0 },
        { label: 'Requested limit', usd: c.limitRequestedUsd },
      ]
    : (() => {
        const eventShare = 0.12
        const exfil = Math.round(slePrivacy * eventShare)
        const extortion = Math.round(sleExtortion + biSle)
        const bi = Math.round(biSle * (p.rtoHours > 24 ? 1.5 : 1))
        return [
          { label: 'Cyber extortion', usd: extortion },
          { label: 'Data exfiltration', usd: exfil },
          { label: 'Business interruption', usd: bi },
          { label: 'Requested limit', usd: c.limitRequestedUsd },
        ]
      })()
  const worstCaseTotalUsd = worstCase
    .filter((w) => w.label !== 'Requested limit')
    .reduce((s, w) => s + w.usd, 0)
  const coverageRatio = worstCaseTotalUsd > 0 ? c.limitRequestedUsd / worstCaseTotalUsd : 1

  let adequacy: CoverageAdequacy = 'adequate'
  let adequacyLabel = 'Aggregate covers modeled exposure'
  let adequacyDetail = `Q18 aggregate ${formatUsdShort(c.limitRequestedUsd)} meets or exceeds stacked worst-case ${formatUsdShort(worstCaseTotalUsd)}.`
  if (p.ineligibleActivity) {
    adequacy = 'shortfall'
    adequacyLabel = 'Not eligible — do not price'
    adequacyDetail = `Organizations not eligible for coverage: ${p.ineligibleActivity}. ALE is not calculated.`
  } else if (coverageRatio < 0.7) {
    adequacy = 'shortfall'
    adequacyLabel = 'Aggregate short of worst-case exposure'
    adequacyDetail = `Q18 aggregate ${formatUsdShort(c.limitRequestedUsd)} covers about ${Math.round(coverageRatio * 100)}% of stacked worst-case ${formatUsdShort(worstCaseTotalUsd)}.`
  } else if (coverageRatio < 1) {
    adequacy = 'tight'
    adequacyLabel = 'Aggregate is tight vs worst-case'
    adequacyDetail = `Q18 aggregate ${formatUsdShort(c.limitRequestedUsd)} is below stacked worst-case ${formatUsdShort(worstCaseTotalUsd)} (${Math.round(coverageRatio * 100)}% covered).`
  }

  const aroProduct = p.aroMultipliers.map((m) => m.factor.toFixed(2)).join(' × ') || '1.00'
  const scoreCriteria: ScoreCriterion[] = [
    {
      id: 'ale',
      title: 'Annualized loss expectancy',
      formula: 'ALE = SLE_privacy × ARO + SLE_BI × ARO + SLE_extortion × ARO × 0.6',
      applied: p.ineligibleActivity
        ? `Ineligible class (${p.ineligibleActivity}) — ALE = $0`
        : `ALE = ${formatUsdShort(Math.round(alePrivacy))} + ${formatUsdShort(Math.round(aleBi))} + ${formatUsdShort(Math.round(aleExtortion))} = ${formatUsdShort(aleUsd)}`,
    },
    {
      id: 'sle',
      title: 'Privacy SLE (Q2 × cost/record × Q3 EF)',
      formula: 'SLE_privacy = records midpoint × cost per record × encryption exposure factor',
      applied: `${p.recordsBand.replace(/,/g, '')} → ${p.recordsMidpoint.toLocaleString()} × $${p.costPerRecord} (${p.dataClass}) × EF ${p.encryptionEf} = ${formatUsdShort(Math.round(slePrivacy))}`,
    },
    {
      id: 'ef',
      title: 'Encryption exposure factor (Q3 a–e)',
      formula: 'All five Yes → 0.15 · mixed / mobile-BYOD gap → 0.35 · incomplete or rest/transit No → 0.55 · none → 0.80',
      applied: `${p.encryptionNote} → EF ${p.encryptionEf}`,
    },
    {
      id: 'aro',
      title: 'Annual rate of occurrence',
      formula: 'ARO = sector base × MFA (Q7h–j) × EDR/AV (Q7c) × backups (Q7l) × IR test (Q12) × loss history (Q16–17)',
      applied: `${p.aroBase} (${p.aroBaseLabel}) × ${aroProduct} = ${p.aro}`,
    },
    {
      id: 'bi',
      title: 'Business interruption SLE (Q13)',
      formula: 'SLE_BI = revenue × (RTO hours / 8,760) × 0.55 critical-ops share',
      applied: `${formatUsdShort(c.revenueUsd)} × (${p.rtoHours} / 8760) × 0.55 · RTO ${p.rtoBand} = ${formatUsdShort(Math.round(biSle))}`,
    },
    {
      id: 'extortion',
      title: 'Extortion SLE',
      formula: 'SLE_extortion = min(0.15 × aggregate limit, 0.012 × revenue)',
      applied: `min(0.15 × ${formatUsdShort(c.limitRequestedUsd)}, 0.012 × ${formatUsdShort(c.revenueUsd)}) = ${formatUsdShort(Math.round(sleExtortion))}`,
    },
    {
      id: 'worst',
      title: 'Worst-case vs requested limit',
      formula: 'Worst-case = extortion SLE + BI SLE + (privacy SLE × 0.12 event share of inventory)',
      applied: p.ineligibleActivity
        ? 'Not priced'
        : `Stacked worst-case ${formatUsdShort(worstCaseTotalUsd)} vs Q18 aggregate ${formatUsdShort(c.limitRequestedUsd)}`,
    },
    {
      id: 'cost',
      title: 'Cost per record',
      formula: 'Medical / PHI $225 · payment card $180 · SSN $165 · default PII $150',
      applied: `${p.dataClass} → $${p.costPerRecord}`,
    },
  ]

  const ingestInputs: IngestCalcInput[] = [
    { label: 'Q2 Records', value: p.recordsBand, source: 'Data Inventory' },
    { label: 'Cost / record', value: `$${p.costPerRecord}`, source: p.dataClass },
    { label: 'Q3 Encryption EF', value: String(p.encryptionEf), source: 'Data Inventory' },
    { label: 'ARO', value: String(p.aro), source: p.aroBaseLabel },
    { label: 'Q13 Restoration time', value: `${p.rtoBand} (${p.rtoHours}h)`, source: 'BC / DR / IR' },
    { label: 'Q18 Aggregate', value: formatUsdShort(c.limitRequestedUsd), source: 'Requested Terms' },
    {
      label: 'Eligibility',
      value: p.ineligibleActivity ? p.ineligibleActivity : 'Not an excluded class',
      source: 'Organizations not eligible for coverage',
    },
  ]

  return {
    aleUsd,
    aleBasis: p.ineligibleActivity
      ? `Not priced — ${p.ineligibleActivity}`
      : `${p.aroBaseLabel} · SLE_privacy ${formatUsdShort(Math.round(slePrivacy))} · ARO ${p.aro}`,
    aleFormula: p.ineligibleActivity
      ? 'ALE = $0 (ineligible organization)'
      : `ALE = SLE × ARO → ${formatUsdShort(Math.round(slePrivacy))} × ${p.aro} (privacy) + BI + extortion = ${formatUsdShort(aleUsd)}`,
    scoreCriteria,
    ingestInputs,
    worstCase,
    worstCaseTotalUsd,
    limitRequestedUsd: c.limitRequestedUsd,
    coverageRatio,
    adequacy,
    adequacyLabel,
    adequacyDetail,
    ineligibleActivity: p.ineligibleActivity,
  }
}

function formatUsdShort(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(usd >= 10_000_000 ? 0 : 1)}M`
  if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}k`
  return `$${usd}`
}

export { formatUsdShort as formatExposureUsd }

