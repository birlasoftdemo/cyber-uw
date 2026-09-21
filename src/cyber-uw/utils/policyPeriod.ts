import type { CyberCase } from '../types'

/** Resolve proposed policy period with demo-safe fallbacks. */
export function policyPeriodForCase(c: Pick<CyberCase, 'policyStartAt' | 'policyEndAt' | 'receivedAt'>): {
  startIso: string
  endIso: string
} {
  const startRaw = c.policyStartAt?.trim() || c.receivedAt
  const start = new Date(startRaw)
  const startOk = !Number.isNaN(start.getTime())

  const endRaw = c.policyEndAt?.trim()
  let end: Date
  if (endRaw) {
    end = new Date(endRaw)
  } else if (startOk) {
    end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate())
  } else {
    end = new Date()
    end.setFullYear(end.getFullYear() + 1)
  }

  const startIso = startOk
    ? startRaw.length <= 10
      ? startRaw.slice(0, 10)
      : start.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  const endIso = !Number.isNaN(end.getTime())
    ? end.toISOString().slice(0, 10)
    : startIso

  return { startIso, endIso }
}

export function formatPolicyDate(value: string) {
  const d = new Date(value.length <= 10 ? `${value}T12:00:00` : value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
