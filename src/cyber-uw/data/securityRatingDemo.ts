/** Deterministic mock partner security-rating feed — BitSight / SecurityScorecard shaped. */

import { bucketLabel, type QualificationBucketId } from '../constants/qualificationBuckets'
import type { CyberCase, ControlGap } from '../types'

export type SecurityRatingBand = 'Basic' | 'Intermediate' | 'Advanced'

export const SECURITY_RATING_BANDS = [
  { name: 'Basic' as const, floor: 250, ceiling: 639 },
  { name: 'Intermediate' as const, floor: 640, ceiling: 739 },
  { name: 'Advanced' as const, floor: 740, ceiling: 900 },
] as const

export type SecurityRatingLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface SecurityRatingTrendPoint {
  month: string
  rating: number
  industryAvg: number
}

export interface SecurityRatingVector {
  id: string
  label: string
  grade: SecurityRatingLetter
  score: number
  detail: string
}

export interface SecurityRatingMultiplier {
  label: string
  factor: number
  note: string
}

export interface SecurityRatingCiteBack {
  id: string
  bucketId: QualificationBucketId
  bucketLabel: string
  finding: string
}

export interface SecurityRatingSnapshot {
  rating: number
  band: SecurityRatingBand
  industryAvg: number
  peerCohortLabel: string
  peerPercentile: number
  trend: SecurityRatingTrendPoint[]
  vectors: SecurityRatingVector[]
  multipliers: SecurityRatingMultiplier[]
  citeBacks: SecurityRatingCiteBack[]
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const INDUSTRY_AVG: Record<string, number> = {
  healthcare: 680,
  manufacturing: 650,
  logistics: 610,
  'technology / saas': 720,
  technology: 720,
  saas: 720,
  retail: 640,
}

const VECTOR_SPECS: { id: string; label: string; detail: string }[] = [
  {
    id: 'diligence',
    label: 'Diligence',
    detail: 'Internet-facing hygiene, patch cadence, and certificate posture versus peers.',
  },
  {
    id: 'compromised-systems',
    label: 'Compromised systems',
    detail: 'Botnet, malware, and command-and-control observations over the last year.',
  },
  {
    id: 'user-behavior',
    label: 'User behavior',
    detail: 'Credential stuffing, phishing susceptibility, and privileged-access hygiene.',
  },
  {
    id: 'public-disclosures',
    label: 'Public disclosures',
    detail: 'Regulatory filings, breach notices, and public dark-web mentions.',
  },
]

const GAP_PENALTY: Record<ControlGap['severity'], number> = {
  critical: 48,
  high: 26,
  medium: 12,
  info: 4,
}

export function bandForRating(rating: number): SecurityRatingBand {
  if (rating >= 740) return 'Advanced'
  if (rating >= 640) return 'Intermediate'
  return 'Basic'
}

function clampRating(n: number): number {
  return Math.min(900, Math.max(250, Math.round(n)))
}

function hashSeed(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededUnit(seed: number): () => number {
  let s = seed || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function gradeForScore(score: number): SecurityRatingLetter {
  if (score >= 820) return 'A'
  if (score >= 740) return 'B'
  if (score >= 640) return 'C'
  if (score >= 540) return 'D'
  if (score >= 400) return 'E'
  return 'F'
}

function industryAvgForSector(sector: string): number {
  const key = sector.trim().toLowerCase()
  if (INDUSTRY_AVG[key] != null) return INDUSTRY_AVG[key]
  const hit = Object.entries(INDUSTRY_AVG).find(([k]) => key.includes(k))
  return hit?.[1] ?? 660
}

function revenueBandPhrase(revenueUsd: number): string {
  if (revenueUsd >= 1_000_000_000) return '$1B+ revenue'
  if (revenueUsd >= 250_000_000) return '$250M–$1B revenue'
  if (revenueUsd >= 50_000_000) return '$50–250M revenue'
  return '$10–50M revenue'
}

function openGaps(c: CyberCase): ControlGap[] {
  return c.gaps.filter((g) => g.disposition === 'open')
}

function ratingFromCase(c: CyberCase): number {
  const mapped = 250 + (c.signalScore / 100) * 650
  const penalty = openGaps(c).reduce((sum, g) => sum + (GAP_PENALTY[g.severity] ?? 8), 0)
  return clampRating(mapped - penalty)
}

function lastTwelveMonthLabels(): string[] {
  const now = new Date()
  const labels: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(MONTH_LABELS[d.getMonth()] ?? 'Jan')
  }
  return labels
}

function trendForCase(
  caseId: string,
  rating: number,
  industryAvg: number,
): SecurityRatingTrendPoint[] {
  const next = seededUnit(hashSeed(`${caseId}:trend`))
  const months = lastTwelveMonthLabels()
  const ratings = new Array<number>(12)
  const avgs = new Array<number>(12)
  ratings[11] = rating
  avgs[11] = industryAvg
  for (let i = 10; i >= 0; i--) {
    ratings[i] = clampRating(ratings[i + 1] - Math.round((next() - 0.46) * 28))
    avgs[i] = clampRating(avgs[i + 1] - Math.round((next() - 0.5) * 12))
  }
  return months.map((month, i) => ({
    month,
    rating: ratings[i] ?? rating,
    industryAvg: avgs[i] ?? industryAvg,
  }))
}

function vectorsForCase(c: CyberCase, rating: number): SecurityRatingVector[] {
  const next = seededUnit(hashSeed(`${c.id}:vectors`))
  const open = openGaps(c)
  return VECTOR_SPECS.map((spec, i) => {
    const drift = Math.round((next() - 0.5) * 70)
    const gapHit = open.filter((_, gi) => gi % 4 === i).length
    const score = clampRating(rating + drift - gapHit * 18)
    return {
      id: spec.id,
      label: spec.label,
      grade: gradeForScore(score),
      score,
      detail: spec.detail,
    }
  })
}

function multipliersForRating(rating: number): SecurityRatingMultiplier[] {
  const subCohort = rating < 750
  const ransom = subCohort ? 1.9 : 1.15
  const frequency = subCohort ? 1.45 : 0.92
  const breach = subCohort ? 1.6 : 0.88
  return [
    {
      label: 'Ransomware loss',
      factor: ransom,
      note: subCohort
        ? 'Guidance only: names below the 750-plus cohort typically see ~1.9× ransomware severity versus that peer set.'
        : 'Guidance only: 750-plus cohort names typically sit near 1.15× ransomware severity versus the wider book.',
    },
    {
      label: 'Claim frequency',
      factor: frequency,
      note: subCohort
        ? 'Guidance only: claim frequency tends to run higher than the 750-plus cohort — not a bind rule.'
        : 'Guidance only: claim frequency is typically in line with or below the 750-plus cohort.',
    },
    {
      label: 'Breach likelihood',
      factor: breach,
      note: subCohort
        ? 'Guidance only: observed breach likelihood is elevated versus the 750-plus cohort.'
        : 'Guidance only: observed breach likelihood is closer to the 750-plus cohort baseline.',
    },
  ]
}

function citeBacksForCase(c: CyberCase): SecurityRatingCiteBack[] {
  const seen = new Set<QualificationBucketId>()
  const rows: SecurityRatingCiteBack[] = []
  for (const gap of openGaps(c)) {
    if (seen.has(gap.qualificationBucket)) continue
    seen.add(gap.qualificationBucket)
    rows.push({
      id: gap.id,
      bucketId: gap.qualificationBucket,
      bucketLabel: bucketLabel(gap.qualificationBucket),
      finding: gap.signal || gap.control,
    })
    if (rows.length >= 4) break
  }
  return rows
}

function peerPercentile(rating: number, industryAvg: number, caseId: string): number {
  const next = seededUnit(hashSeed(`${caseId}:pct`))
  const delta = rating - industryAvg
  const raw = 50 + delta / 6 + (next() - 0.5) * 8
  return Math.min(99, Math.max(1, Math.round(raw)))
}

export function securityRatingForCase(c: CyberCase): SecurityRatingSnapshot {
  const rating = ratingFromCase(c)
  const industryAvg = industryAvgForSector(c.sector)
  return {
    rating,
    band: bandForRating(rating),
    industryAvg,
    peerCohortLabel: `${c.sector} · ${revenueBandPhrase(c.revenueUsd)}`,
    peerPercentile: peerPercentile(rating, industryAvg, c.id),
    trend: trendForCase(c.id, rating, industryAvg),
    vectors: vectorsForCase(c, rating),
    multipliers: multipliersForRating(rating),
    citeBacks: citeBacksForCase(c),
  }
}
