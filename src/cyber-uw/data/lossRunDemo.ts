import type { CyberCase } from '../types'

export type LossClaimStatus = 'OPEN' | 'CLOSED'

export interface LossClaim {
  id: string
  lossDate: string
  lagDays: number | null
  status: LossClaimStatus
  cause: string
  paid: number
  incurred: number
}

export interface LossYearPoint {
  year: number
  incurred: number
  claims: number
}

export interface LossCauseShare {
  cause: string
  claims: number
  incurred: number
  share: number
}

export interface LossRunReading {
  claims: LossClaim[]
  years: LossYearPoint[]
  causes: LossCauseShare[]
  totalIncurred: number
  averageIncurred: number
  openCount: number
}

const CAUSES = [
  'Ransomware – business interruption',
  'Privacy – notification costs',
  'Funds transfer fraud',
  'Vendor outage – contingent business interruption',
] as const

/** History depth for the incurred / claims chart. */
const YEAR_SPAN = 15

function hash(seed: string): number {
  let value = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

function unit(seed: number): number {
  const next = Math.imul(seed ^ (seed >>> 15), seed | 1)
  return ((next ^ (next >>> 13)) >>> 0) / 4294967296
}

function moneyStep(seed: number, min: number, max: number): number {
  const span = max - min
  return Math.round((min + unit(seed) * span) / 100) * 100
}

export function lossRunForCase(
  c: Pick<CyberCase, 'id' | 'receivedAt' | 'gaps'>,
): LossRunReading {
  const receivedYear = Number(c.receivedAt.slice(0, 4)) || new Date().getFullYear()
  const endYear = Number.isFinite(receivedYear) ? receivedYear : new Date().getFullYear()
  const startYear = endYear - (YEAR_SPAN - 1)
  const forceOpen = c.gaps.some(
    (gap) => gap.disposition !== 'resolved' && /loss|claim/i.test(gap.control),
  )

  // Smooth-ish loss history: quiet start → gradual rise → mid peak → softer recent years.
  const caseBias = unit(hash(`${c.id}:curve`))
  const peakAt = 0.58 + caseBias * 0.18
  const years: LossYearPoint[] = []
  for (let year = startYear; year <= endYear; year += 1) {
    const index = year - startYear
    const t = YEAR_SPAN <= 1 ? 1 : index / (YEAR_SPAN - 1)
    const seed = hash(`${c.id}:year:${year}`)
    const noise = (unit(seed) - 0.5) * 0.18
    const rise = Math.pow(Math.min(1, t / peakAt), 1.35)
    const fall = Math.pow(Math.max(0, (1 - t) / (1 - peakAt)), 1.1)
    const envelope = Math.min(rise, Math.max(fall, 0.22 + caseBias * 0.08)) + noise
    const shaped = Math.max(0.12, Math.min(1.05, envelope))
    const claimsCount = Math.max(
      1,
      Math.min(5, Math.round(1 + shaped * 3.2 + (unit(seed >>> 3) - 0.5) * 0.9)),
    )
    const baseIncurred = 2_400 + shaped * (18_000 + caseBias * 8_000)
    const incurred = Math.round((baseIncurred * (0.85 + unit(seed >>> 7) * 0.3)) / 100) * 100
    years.push({ year, incurred, claims: claimsCount })
  }

  const claimRows: LossClaim[] = []
  let claimIndex = 0
  for (const point of years) {
    const weights = Array.from({ length: point.claims }, (_, i) => {
      const seed = hash(`${c.id}:w:${point.year}:${i}`)
      return 0.55 + unit(seed)
    })
    const weightSum = weights.reduce((sum, w) => sum + w, 0)
    let allocated = 0
    for (let i = 0; i < point.claims; i += 1) {
      const seed = hash(`${c.id}:claim:${point.year}:${i}`)
      const month = 1 + Math.floor(unit(seed) * 11)
      const day = 1 + Math.floor(unit(seed >>> 3) * 27)
      const cause = CAUSES[seed % CAUSES.length]
      const isLatestOpen =
        forceOpen && point.year === endYear && i === point.claims - 1
      const isOpen =
        isLatestOpen ||
        (point.year === endYear && i === point.claims - 1 && unit(seed >>> 5) > 0.45)
      const raw =
        i === point.claims - 1
          ? point.incurred - allocated
          : Math.round((point.incurred * (weights[i]! / weightSum)) / 100) * 100
      const incurred = Math.max(400, raw)
      allocated += i === point.claims - 1 ? 0 : incurred
      const paid = isOpen
        ? moneyStep(seed >>> 11, 0, Math.max(200, incurred * 0.35))
        : incurred
      claimRows.push({
        id: `CL-${point.year}-${String(claimIndex + 1).padStart(3, '0')}`,
        lossDate: `${point.year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        lagDays: isOpen ? null : 2 + (seed % 36),
        status: isOpen ? 'OPEN' : 'CLOSED',
        cause,
        paid,
        incurred,
      })
      claimIndex += 1
    }
  }

  const totalIncurred = claimRows.reduce((sum, claim) => sum + claim.incurred, 0)
  const byCause = new Map<string, { claims: number; incurred: number }>()
  for (const claim of claimRows) {
    const current = byCause.get(claim.cause) ?? { claims: 0, incurred: 0 }
    current.claims += 1
    current.incurred += claim.incurred
    byCause.set(claim.cause, current)
  }
  const causes: LossCauseShare[] = [...byCause.entries()]
    .map(([cause, row]) => ({
      cause,
      claims: row.claims,
      incurred: row.incurred,
      share: totalIncurred === 0 ? 0 : Math.round((row.incurred / totalIncurred) * 100),
    }))
    .sort((a, b) => b.incurred - a.incurred)

  return {
    claims: claimRows,
    years,
    causes,
    totalIncurred,
    averageIncurred: claimRows.length ? Math.round(totalIncurred / claimRows.length) : 0,
    openCount: claimRows.filter((claim) => claim.status === 'OPEN').length,
  }
}
