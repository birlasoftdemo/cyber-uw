import type { ControlGap, GapDisposition } from '../types'

export function gapDispositionOf(gap: ControlGap): GapDisposition {
  return gap.disposition ?? 'open'
}

/** Open critical/high gaps that still need a disposition. */
export function isOpenMaterialGap(gap: ControlGap): boolean {
  if (gapDispositionOf(gap) !== 'open') return false
  return gap.severity === 'critical' || gap.severity === 'high'
}

/** Open material gaps, critical before high (stable for focused stack order). */
export function openMaterialGaps(gaps: ControlGap[]): ControlGap[] {
  const rank = { critical: 0, high: 1 } as const
  return gaps
    .filter(isOpenMaterialGap)
    .sort((a, b) => rank[a.severity as 'critical' | 'high'] - rank[b.severity as 'critical' | 'high'])
}
