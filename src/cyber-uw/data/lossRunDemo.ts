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
  const forceOpen = c.gaps.some(
    (gap) => gap.disposition !== 'resolved' && /loss|claim/i.test(gap.control),
  )
  const count = 3 + (hash(c.id) % 2)
  const claims: LossClaim[] = []

  for (let index = 0; index < count; index += 1) {
    const seed = hash(`${c.id}:${index}`)
    const year = endYear - (count - index)
    const month = 1 + Math.floor(unit(seed) * 11)
    const day = 1 + Math.floor(unit(seed >>> 3) * 27)
    const cause = CAUSES[seed % CAUSES.length]
    const isOpen = forceOpen ? index === count - 1 : index === count - 1 && unit(seed >>> 5) > 0.35
    const incurred = moneyStep(seed >>> 7, 1_800, 14_000)
    const paid = isOpen ? moneyStep(seed >>> 11, 0, Math.max(200, incurred * 0.35)) : incurred
    claims.push({
      id: `CL-${year}-${String(index + 1).padStart(3, '0')}`,
      lossDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      lagDays: isOpen ? null : 2 + (seed % 36),
      status: isOpen ? 'OPEN' : 'CLOSED',
      cause,
      paid,
      incurred,
    })
  }

  const years: LossYearPoint[] = []
  const firstYear = endYear - count
  for (let year = firstYear; year <= endYear; year += 1) {
    const inYear = claims.filter((claim) => claim.lossDate.startsWith(String(year)))
    years.push({
      year,
      incurred: inYear.reduce((sum, claim) => sum + claim.incurred, 0),
      claims: inYear.length,
    })
  }

  const totalIncurred = claims.reduce((sum, claim) => sum + claim.incurred, 0)
  const byCause = new Map<string, { claims: number; incurred: number }>()
  for (const claim of claims) {
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
    claims,
    years,
    causes,
    totalIncurred,
    averageIncurred: claims.length ? Math.round(totalIncurred / claims.length) : 0,
    openCount: claims.filter((claim) => claim.status === 'OPEN').length,
  }
}
