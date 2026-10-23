import { applicationPosture, triageFindingsForCase } from './cyberTriageRules'
import { carrierExposureForCase, formatExposureUsd } from './riskVizDemo'
import type { CyberCase, EnrichmentModelId } from '../types'

export const DESK_ENRICHMENT_MODELS: {
  id: EnrichmentModelId
  label: string
  caption: string
}[] = [
  { id: 'bitsight', label: 'Bitsight', caption: 'Security rating, 250–900' },
  { id: 'cyence', label: 'Cyence', caption: 'Economic loss' },
  { id: 'cytora', label: 'Cytora', caption: 'Submission risk factors' },
]

export type CyencePosition = 'covers' | 'tight' | 'short' | 'unpriced'

export interface CyenceScenario {
  id: string
  label: string
  lossUsd: number
  evidence: string
}

export interface CyenceReading {
  economicLossUsd: number
  probableMaximumLossUsd: number
  limitUsd: number
  probabilityAboveLimit: number
  exceedance: { probability: number; lossUsd: number }[]
  scenarios: CyenceScenario[]
  position: CyencePosition
  positionSentence: string
}

export type CytoraAppetite = 'Match' | 'Refer' | 'Decline'

export interface CytoraFactor {
  id: string
  name: string
  evidence: string
}

export interface CytoraEvidence {
  section: string
  line: string
}

export interface CytoraReading {
  appetite: CytoraAppetite
  why: string
  action: string
  factors: CytoraFactor[]
  evidence: CytoraEvidence[]
}

function worstUsd(rows: { label: string; usd: number }[], label: string): number {
  return rows.find((row) => row.label === label)?.usd ?? 0
}

function cyencePosition(input: {
  ineligible: string | null
  adequacy: 'adequate' | 'tight' | 'shortfall'
}): { position: CyencePosition; positionSentence: string } {
  if (input.ineligible) {
    return {
      position: 'unpriced',
      positionSentence: 'Probable maximum loss is not modeled on this package.',
    }
  }
  switch (input.adequacy) {
    case 'adequate':
      return {
        position: 'covers',
        positionSentence: 'Requested limit covers probable maximum loss.',
      }
    case 'tight':
      return {
        position: 'tight',
        positionSentence: 'Requested limit is tight against probable maximum loss.',
      }
    case 'shortfall':
      return {
        position: 'short',
        positionSentence: 'Requested limit is short of probable maximum loss.',
      }
    default: {
      const neverAdequacy: never = input.adequacy
      return neverAdequacy
    }
  }
}

/** Shape the desk's existing loss terms into a Cyence-style reading. */
export function cyenceReadingForCase(c: CyberCase): CyenceReading {
  const exposure = carrierExposureForCase(c)
  const parts = exposure.lossParts
  const economicLossUsd = exposure.aleUsd
  const probableMaximumLossUsd = exposure.worstCaseTotalUsd
  const span = Math.max(probableMaximumLossUsd - economicLossUsd, 0)
  const probabilities = [0.9, 0.6, 0.35, 0.15, 0.05, 0.01]
  const exceedance = probabilities.map((probability, index) => {
    const t = index / (probabilities.length - 1)
    return {
      probability,
      lossUsd: Math.round(economicLossUsd * (0.2 + t * 0.8) + span * t),
    }
  })
  const probabilityAboveLimit = exposure.ineligibleActivity
    ? 0
    : exposure.worstCaseTotalUsd <= exposure.limitRequestedUsd
      ? 0.06
      : Math.min(0.72, Math.max(0.08, 1 - exposure.coverageRatio))
  const { position, positionSentence } = cyencePosition({
    ineligible: exposure.ineligibleActivity,
    adequacy: exposure.adequacy,
  })

  return {
    economicLossUsd,
    probableMaximumLossUsd,
    limitUsd: exposure.limitRequestedUsd,
    probabilityAboveLimit,
    exceedance,
    position,
    positionSentence,
    scenarios: [
      {
        id: 'data-breach',
        label: 'Data breach',
        lossUsd: worstUsd(exposure.worstCase, 'Data exfiltration'),
        evidence: `${parts.recordsBand} records · $${parts.costPerRecord} per record`,
      },
      {
        id: 'business-interruption',
        label: 'Business interruption',
        lossUsd: worstUsd(exposure.worstCase, 'Business interruption'),
        evidence: `Restoration ${parts.rtoBand} (${parts.rtoHours}h)`,
      },
      {
        id: 'ransomware',
        label: 'Ransomware',
        lossUsd: worstUsd(exposure.worstCase, 'Cyber extortion'),
        evidence: `Extortion single-loss ${formatExposureUsd(parts.extortionSleUsd)}`,
      },
    ],
  }
}

/** Digitized submission factors and one appetite word. */
export function cytoraReadingForCase(c: CyberCase): CytoraReading {
  const posture = applicationPosture(c)
  const findings = triageFindingsForCase(c)
  const openHigh = findings.filter((finding) => {
    if (finding.severity !== 'high') return false
    const status = c.riskJudgments[finding.id]?.status
    return status !== 'accepted' && status !== 'noted'
  })

  const factors: CytoraFactor[] = [
    { id: 'records', name: 'Records', evidence: posture.recordsBand },
    { id: 'encryption', name: 'Encryption', evidence: posture.encryptionNote },
    { id: 'mfa', name: 'MFA', evidence: posture.mfaGap ? 'Gap on the floor' : 'Floor met' },
    { id: 'backups', name: 'Backups', evidence: posture.backupWeak ? 'Weak' : 'In place' },
    {
      id: 'restoration',
      name: 'Restoration',
      evidence: `${posture.rtoBand} · ${posture.rtoHours}h`,
    },
    {
      id: 'loss',
      name: 'Loss history',
      evidence: posture.lossYes ? 'Loss disclosed' : 'No loss disclosed',
    },
    {
      id: 'class',
      name: 'Class',
      evidence: posture.ineligibleActivity ?? 'Inside eligible classes',
    },
  ]

  const evidence: CytoraEvidence[] = findings.slice(0, 6).map((finding) => ({
    section: finding.chartLabel,
    line: finding.questionRef ? `${finding.questionRef} · ${finding.summary}` : finding.summary,
  }))

  if (posture.ineligibleActivity) {
    return {
      appetite: 'Decline',
      why: `Ineligible class: ${posture.ineligibleActivity}.`,
      action: 'Do not price this submission.',
      factors,
      evidence,
    }
  }
  if (openHigh.length > 0) {
    const count = openHigh.length
    return {
      appetite: 'Refer',
      why: `${count} high ${count === 1 ? 'finding is' : 'findings are'} still open.`,
      action: 'Refer before quote.',
      factors,
      evidence,
    }
  }
  return {
    appetite: 'Match',
    why: 'No ineligible class and no open high findings.',
    action: 'Continue. Digitized factors sit inside appetite.',
    factors,
    evidence,
  }
}
