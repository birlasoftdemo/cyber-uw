import { isOpenMaterialGap } from '../utils/gapDisposition'
import type { ControlGap } from '../types'

/** Cyber UW stages — singular, progressive labels for the underwriter. */
export const CYBER_FLOW_STAGES = [
  {
    key: 'intake',
    title: 'Intake',
    subtext: 'Package complete',
    pain: 'P2.1 · P2.6 · P2.7',
  
  },
  {
    key: 'gaps',
    title: 'Verify',
    subtext: 'Attest vs signal',
    pain: 'P1.2 · P1.4 · P1.10',
    
  },
  {
    key: 'appetite',
    title: 'Tier',
    subtext: 'Appetite and assist',
    pain: 'P2.11 · P3.4 · P3.5 · P3.7',
    
  },
  {
    key: 'accumulation',
    title: 'Book',
    subtext: 'Shared-vendor watch',
    pain: 'P4.1 · P4.3 · P4.5',
    
  },
  {
    key: 'decide',
    title: 'Decide',
    subtext: 'Quote, refer, or decline',
    pain: 'P2.4 · P2.5 · P2.12',
    
  },
] as const

export type CyberFlowKey = (typeof CYBER_FLOW_STAGES)[number]['key']

export function cyberFlowIndex(c: {
  completenessPct: number
  decision: string
  pasStatus: string
  gaps: ControlGap[]
}): number {
  if (c.pasStatus === 'synced') return CYBER_FLOW_STAGES.length
  if (c.decision !== 'pending') return 4
  if (c.completenessPct < 80) return 0
  if (c.gaps.some(isOpenMaterialGap)) return 1
  return 2
}
