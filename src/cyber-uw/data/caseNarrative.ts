/**
 * One underwriting story per case, shared by intake, evidence, external
 * findings, appetite, and the human decision. Screens read this module so
 * the insured, the MFA contradiction, the referral rules, and the
 * recommendation cannot drift apart.
 */

import { isWithinJuniorAuthority } from '../constants/cyberFlow'
import { securityRatingForCase } from './securityRatingDemo'
import type { CyberCase, CyberDecision } from '../types'

export type IntakeDocStatus = 'Received' | 'Classified' | 'Extracted' | 'Missing' | 'Review Required'

export type VerificationResult =
  | 'Verified'
  | 'Partially Verified'
  | 'Contradicted'
  | 'Missing Evidence'
  | 'Not Applicable'

export type AppetiteResult = 'Within Appetite' | 'Refer' | 'Decline'

export type CyberRiskBand = 'Low' | 'Moderate' | 'Elevated' | 'High'

export type ExternalCategory =
  | 'Attack Surface'
  | 'Vulnerabilities/CVEs'
  | 'Security Rating'
  | 'Exposed Services'
  | 'Third-party Dependencies'

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'

export interface IntakeDocument {
  name: string
  status: IntakeDocStatus
  note: string
}

export interface EvidenceControl {
  id: string
  control: string
  declaration: string
  documentEvidence: string
  externalObservation: string
  result: VerificationResult
  confidence: 'High' | 'Medium' | 'Low'
}

export interface ExternalFinding {
  id: string
  category: ExternalCategory
  source: string
  finding: string
  severity: FindingSeverity
  observedDate: string
  freshness: string
  entityMatch: string
  impact: string
}

export interface DeclarationConflict {
  id: string
  title: string
  declaration: string
  external: string
}

export interface AppetiteRuleView {
  id: string
  label: string
  outcome: AppetiteResult
  detail: string
}

export interface AiReason {
  id: string
  text: string
  href: string
  evidenceLabel: string
}

export interface RatingTrendPoint {
  month: string
  rating: number
  industryAvg: number
}

export interface CaseNarrative {
  cyberRisk: { label: CyberRiskBand; summary: string; why: string[] }
  controlEffectiveness: { pct: number; label: string; summary: string; why: string[] }
  evidenceConfidence: { pct: number; label: string; summary: string; why: string[] }
  completeness: { pct: number; missingCount: number; followUpCount: number; why: string[] }
  appetite: {
    result: AppetiteResult
    triggerRule: string | null
    rules: AppetiteRuleView[]
    why: string[]
  }
  documents: IntakeDocument[]
  followUps: string[]
  entityMatch: {
    insuredMatched: string
    duplicateCheck: string
    brokerIdentified: string
  }
  controls: EvidenceControl[]
  externalFindings: ExternalFinding[]
  conflicts: DeclarationConflict[]
  rating: number
  ratingFloor: number
  ratingTrend: RatingTrendPoint[]
  ai: {
    action: Exclude<CyberDecision, 'pending'>
    label: 'Approve' | 'Refer' | 'Request Information' | 'Decline'
    reasons: AiReason[]
  }
  authority: {
    exceeds: boolean
    summary: string
    owner: string
  }
}

const MFA_CONTRADICTION =
  'Applicant says MFA applies to all users, but evidence shows privileged users only.'

const DOC_WEIGHT: Record<IntakeDocStatus, number> = {
  Extracted: 1,
  Classified: 0.7,
  Received: 0.55,
  'Review Required': 0.45,
  Missing: 0,
}

const CONTROL_WEIGHT: Record<VerificationResult, number | null> = {
  Verified: 1,
  'Partially Verified': 0.55,
  Contradicted: 0.15,
  'Missing Evidence': 0.2,
  'Not Applicable': null,
}

export function ratingFloorForLimit(limitUsd: number): number {
  return limitUsd >= 10_000_000 ? 700 : 640
}

function outcomeLabel(outcome: 'pass' | 'refer' | 'decline'): AppetiteResult {
  switch (outcome) {
    case 'pass':
      return 'Within Appetite'
    case 'refer':
      return 'Refer'
    case 'decline':
      return 'Decline'
    default: {
      const neverOutcome: never = outcome
      return neverOutcome
    }
  }
}

function bandWord(pct: number, strong: string, mid: string, low: string, weak: string): string {
  if (pct >= 80) return strong
  if (pct >= 60) return mid
  if (pct >= 40) return low
  return weak
}

function effectivenessFrom(controls: EvidenceControl[]): { pct: number; label: string } {
  const scored = controls.filter((row) => CONTROL_WEIGHT[row.result] != null)
  if (scored.length === 0) return { pct: 0, label: 'Weak' }
  const total = scored.reduce((sum, row) => sum + (CONTROL_WEIGHT[row.result] ?? 0), 0)
  const pct = Math.round((total / scored.length) * 100)
  return { pct, label: bandWord(pct, 'Strong', 'Adequate', 'Partial', 'Weak') }
}

function confidenceFrom(documents: IntakeDocument[]): { pct: number; label: string } {
  if (documents.length === 0) return { pct: 0, label: 'Low' }
  const total = documents.reduce((sum, row) => sum + DOC_WEIGHT[row.status], 0)
  const pct = Math.round((total / documents.length) * 100)
  return { pct, label: bandWord(pct, 'High', 'Moderate', 'Limited', 'Low') }
}

function cyberRiskBand(rating: number, floor: number, controls: EvidenceControl[]): CyberRiskBand {
  const contradicted = controls.some((row) => row.result === 'Contradicted')
  const partial = controls.filter(
    (row) => row.result === 'Partially Verified' || row.result === 'Missing Evidence',
  ).length
  if (contradicted && rating < floor) return 'High'
  if (contradicted || rating < floor) return 'Elevated'
  if (partial >= 2 || rating < floor + 50) return 'Moderate'
  return 'Low'
}

function aiFromRecommendation(recommendation: CyberCase['recommendation']): CaseNarrative['ai']['action'] {
  switch (recommendation) {
    case 'quote':
      return 'quote'
    case 'refer':
      return 'refer'
    case 'decline':
      return 'decline'
    case 'request_info':
      return 'request_info'
    case 'pending':
      return 'refer'
    default: {
      const neverRecommendation: never = recommendation
      return neverRecommendation
    }
  }
}

function aiLabel(action: CaseNarrative['ai']['action']): CaseNarrative['ai']['label'] {
  switch (action) {
    case 'quote':
      return 'Approve'
    case 'refer':
      return 'Refer'
    case 'request_info':
      return 'Request Information'
    case 'decline':
      return 'Decline'
    default: {
      const neverAction: never = action
      return neverAction
    }
  }
}

const HERO_DOCUMENTS: IntakeDocument[] = [
  {
    name: 'Cyber Application',
    status: 'Extracted',
    note: '2026 cyber application extracted, including the MFA attestation.',
  },
  {
    name: 'InfoSec Questionnaire',
    status: 'Review Required',
    note: 'Okta export inside the questionnaire covers privileged roles only.',
  },
  {
    name: 'Incident Response Plan',
    status: 'Extracted',
    note: 'Incident response plan received with the package and extracted.',
  },
  {
    name: 'Loss Runs',
    status: 'Missing',
    note: 'Five-year cyber loss runs were not in the submission.',
  },
  {
    name: 'Broker Correspondence',
    status: 'Classified',
    note: 'Marsh slip and cover email classified to this insured. Not fully extracted.',
  },
]

const HERO_FOLLOW_UPS = [
  'Confirm whether MFA applies to all users or privileged users only. The application says all users; the Okta export covers privileged roles only.',
  'Provide five-year cyber loss runs. Loss Runs is missing on the submission register.',
]

function documentsFor(c: CyberCase): IntakeDocument[] {
  if (c.id === 'CYB-2401') return HERO_DOCUMENTS
  const hasApp = c.packageDocs.some((doc) => doc.name.toLowerCase().includes('app'))
  const hasIr = c.packageDocs.some((doc) => doc.name.toLowerCase().includes('incident'))
  const irListedMissing = (c.missingDocs ?? []).some((doc) => doc.toLowerCase().includes('incident'))
  const thinFile = c.completenessPct < 80
  const questioned = c.recommendation === 'refer' || c.recommendation === 'decline'
  const lossRuns: IntakeDocStatus =
    c.completenessPct >= 100 ? 'Extracted' : c.completenessPct >= 88 ? 'Classified' : 'Missing'
  return [
    {
      name: 'Cyber Application',
      status: hasApp ? 'Extracted' : 'Missing',
      note: hasApp ? 'Application received and extracted.' : 'Cyber application was not in the package.',
    },
    {
      name: 'InfoSec Questionnaire',
      status: questioned || thinFile ? 'Review Required' : 'Extracted',
      note: questioned
        ? 'Control answers need a check against the attached evidence.'
        : 'Questionnaire extracted with no open control question.',
    },
    {
      name: 'Incident Response Plan',
      status: irListedMissing || !hasIr ? 'Missing' : 'Extracted',
      note: irListedMissing || !hasIr ? 'Incident response plan is not in the package.' : 'Incident response plan extracted.',
    },
    {
      name: 'Loss Runs',
      status: lossRuns,
      note:
        lossRuns === 'Missing'
          ? 'Loss runs were not attached.'
          : lossRuns === 'Classified'
            ? 'Loss runs received and classified. Extraction is partial.'
            : 'Loss runs extracted.',
    },
    {
      name: 'Broker Correspondence',
      status: c.broker ? (c.completenessPct >= 100 ? 'Classified' : 'Received') : 'Missing',
      note: c.broker ? `${c.broker} correspondence is on the file.` : 'Broker was not identified on the file.',
    },
  ]
}

function followUpsFor(c: CyberCase, documents: IntakeDocument[]): string[] {
  if (c.id === 'CYB-2401') return HERO_FOLLOW_UPS
  if (c.id === 'CYB-2402') return []
  const questions: string[] = []
  const mfa = c.formSignals.find((signal) => signal.label.toLowerCase().includes('mfa'))
  if (mfa?.signal && c.id === 'CYB-2404') {
    questions.push(
      `Confirm email MFA. The application says "${mfa.answer}". External observation: ${mfa.signal}.`,
    )
  }
  if (c.id === 'CYB-2403') {
    questions.push('MFA scope was not fully disclosed. Ask the broker for the IdP policy.')
    questions.push('EDR is described as workstation antivirus. Ask for an enterprise EDR console export.')
    questions.push('Backups are unconfirmed. Ask IT for an immutability and restore-test attestation.')
  }
  if (documents.some((doc) => doc.name === 'Loss Runs' && doc.status === 'Missing')) {
    questions.push('Provide five-year cyber loss runs.')
  }
  if (questions.length === 0 && documents.some((doc) => doc.status === 'Review Required')) {
    questions.push('Resolve the questionnaire items marked Review Required before a straight-through decision.')
  }
  return questions
}

function controlsFor(c: CyberCase): EvidenceControl[] {
  if (c.id === 'CYB-2401') {
    return [
      {
        id: 'mfa',
        control: 'MFA',
        declaration: 'MFA applies to all users',
        documentEvidence: 'InfoSec questionnaire Okta export lists privileged and admin roles only.',
        externalObservation:
          'Simulated BitSight user behavior: MFA challenge observed on privileged users only.',
        result: 'Contradicted',
        confidence: 'High',
      },
      {
        id: 'edr',
        control: 'EDR',
        declaration: 'Endpoint detection and response on 100% of endpoints',
        documentEvidence: 'SOC 2 excerpt names CrowdStrike in scope. Console export is not attached.',
        externalObservation: 'Simulated exposure inventory shows EDR telemetry on about 78% of assets.',
        result: 'Partially Verified',
        confidence: 'Medium',
      },
      {
        id: 'backups',
        control: 'Backups',
        declaration: 'Daily backups; quarterly restore tests',
        documentEvidence: 'Latest restore-test attestation PDF is not attached.',
        externalObservation: 'No external observation contradicts the backup claim.',
        result: 'Missing Evidence',
        confidence: 'Low',
      },
      {
        id: 'privileged',
        control: 'Privileged access',
        declaration: 'Privileged access uses a PAM vault and just-in-time roles.',
        documentEvidence: 'Architecture summary describes PAM for administrators.',
        externalObservation: 'Simulated identity observation matches privileged-only MFA, not all users.',
        result: 'Partially Verified',
        confidence: 'Medium',
      },
      {
        id: 'patching',
        control: 'Patching',
        declaration: 'Critical patches applied within 14 days.',
        documentEvidence: 'ISO summary notes a minor nonconformity on patch SLA.',
        externalObservation: 'Simulated scan: 3 high CVEs on the edge older than 30 days.',
        result: 'Partially Verified',
        confidence: 'Medium',
      },
      {
        id: 'ir',
        control: 'Incident response',
        declaration: 'Written incident response plan with an executive on-call path.',
        documentEvidence: 'Incident Response Plan received and extracted.',
        externalObservation: 'No external incident record contradicts the plan.',
        result: 'Verified',
        confidence: 'High',
      },
    ]
  }

  const mfa = c.formSignals.find((signal) => signal.label.toLowerCase().includes('mfa'))
  const edr = c.formSignals.find((signal) => signal.label.toLowerCase().includes('edr'))
  const backup = c.formSignals.find((signal) => signal.label.toLowerCase().includes('backup'))
  const mfaText = `${mfa?.answer ?? ''} ${mfa?.signal ?? ''}`.toLowerCase()
  const edrSignal = (edr?.signal ?? '').toLowerCase()
  const mfaResult: VerificationResult = !mfa
    ? 'Missing Evidence'
    : mfaText.includes('without mfa') || mfaText.includes('legacy imap')
      ? 'Partially Verified'
      : mfaText.includes('not fully') || mfaText.includes('not disclosed') || mfaText.includes('incomplete')
        ? 'Missing Evidence'
        : 'Verified'
  const edrResult: VerificationResult = !edr
    ? 'Missing Evidence'
    : edrSignal.includes('antivirus') || edrSignal.includes('78%') || edrSignal.includes('gap')
      ? 'Contradicted'
      : 'Verified'
  const backupResult: VerificationResult =
    !backup || (backup.signal ?? '').toLowerCase().includes('incomplete') || (backup.answer ?? '').toLowerCase().includes('not sure')
      ? 'Missing Evidence'
      : 'Verified'
  const clean = c.recommendation === 'quote'

  const rows: EvidenceControl[] = [
    {
      id: 'mfa',
      control: 'MFA',
      declaration: mfa?.answer ?? 'Not disclosed',
      documentEvidence: mfa ? 'Questionnaire answer on file.' : 'No MFA answer extracted.',
      externalObservation: mfa?.signal ?? 'No external MFA observation on this file.',
      result: mfaResult,
      confidence: mfaResult === 'Verified' ? 'High' : mfaResult === 'Missing Evidence' ? 'Low' : 'Medium',
    },
    {
      id: 'edr',
      control: 'EDR',
      declaration: edr?.answer ?? 'Not disclosed',
      documentEvidence: edr ? 'Questionnaire answer on file.' : 'No EDR answer extracted.',
      externalObservation: edr?.signal ?? 'No external EDR observation on this file.',
      result: edrResult,
      confidence: edrResult === 'Verified' ? 'High' : 'Medium',
    },
    {
      id: 'backups',
      control: 'Backups',
      declaration: backup?.answer ?? 'Not disclosed',
      documentEvidence: backup ? 'Questionnaire answer on file.' : 'No backup answer extracted.',
      externalObservation: backup?.signal ?? 'No external backup observation.',
      result: backupResult,
      confidence: backupResult === 'Verified' ? 'High' : 'Low',
    },
    {
      id: 'privileged',
      control: 'Privileged access',
      declaration: clean ? 'Privileged access is in the IdP used for MFA.' : 'Privileged access not separately evidenced.',
      documentEvidence: clean ? 'IdP control described in the application.' : 'No privileged-access exhibit attached.',
      externalObservation: clean ? 'No conflicting privileged-access observation.' : 'External observation does not confirm privileged-access scope.',
      result: clean ? 'Verified' : 'Missing Evidence',
      confidence: clean ? 'High' : 'Low',
    },
    {
      id: 'patching',
      control: 'Patching',
      declaration: clean ? 'Patch cadence described as within policy.' : 'Patch cadence not fully disclosed.',
      documentEvidence: clean ? 'No contradictory audit finding in the package.' : 'Patch evidence not attached.',
      externalObservation: clean ? 'No aged critical CVE called out on this file.' : 'External scan is incomplete on this file.',
      result: clean ? 'Verified' : c.recommendation === 'decline' ? 'Missing Evidence' : 'Partially Verified',
      confidence: clean ? 'Medium' : 'Low',
    },
    {
      id: 'ir',
      control: 'Incident response',
      declaration: 'Incident response plan required with the submission.',
      documentEvidence: c.packageDocs.some((doc) => doc.name.toLowerCase().includes('incident'))
        ? 'Incident response plan is in the package.'
        : 'Incident response plan is not in the package.',
      externalObservation: 'No external incident record on this file.',
      result: c.packageDocs.some((doc) => doc.name.toLowerCase().includes('incident'))
        ? 'Verified'
        : 'Missing Evidence',
      confidence: c.packageDocs.some((doc) => doc.name.toLowerCase().includes('incident')) ? 'High' : 'Low',
    },
  ]
  if (c.id === 'CYB-2403') {
    const privileged = rows.find((row) => row.id === 'privileged')
    if (privileged) {
      privileged.declaration = 'No in-house privileged-admin population. Store operations sit with the MSP.'
      privileged.documentEvidence = 'Not applicable. The retail workforce has no separate privileged tier.'
      privileged.externalObservation = 'Simulated scan did not find an in-house admin plane for this entity.'
      privileged.result = 'Not Applicable'
      privileged.confidence = 'Medium'
    }
  }
  return rows
}

function conflictsFor(c: CyberCase, controls: EvidenceControl[]): DeclarationConflict[] {
  if (c.id === 'CYB-2401') {
    return [
      {
        id: 'mfa-all-users',
        title: MFA_CONTRADICTION,
        declaration: 'Cyber Application and InfoSec Questionnaire: MFA applies to all users.',
        external:
          'Document evidence and simulated BitSight observation: MFA is in place for privileged users only.',
      },
    ]
  }
  return controls
    .filter((row) => row.result === 'Contradicted' || row.result === 'Partially Verified')
    .filter((row) => row.externalObservation && row.declaration && row.externalObservation !== row.declaration)
    .slice(0, 2)
    .map((row) => ({
      id: row.id,
      title: `${row.control} does not fully match the application.`,
      declaration: row.declaration,
      external: row.externalObservation,
    }))
}

function findingsFor(
  c: CyberCase,
  rating: number,
  floor: number,
  controls: EvidenceControl[],
): ExternalFinding[] {
  const matched = `Insured matched · ${c.insured}`
  const below = rating < floor
  const mfa = controls.find((row) => row.id === 'mfa')
  const attack =
    c.id === 'CYB-2401'
      ? 'Admin bastion observed. MFA challenge is not present for the standard user population.'
      : mfa?.result === 'Verified'
        ? 'No high-risk remote admin exposure on the simulated external scan.'
        : mfa?.externalObservation ?? 'External attack-surface scan completed for this insured.'
  return [
    {
      id: 'attack-surface',
      category: 'Attack Surface',
      source: 'BitSight (Simulated)',
      finding: attack,
      severity: c.id === 'CYB-2401' ? 'High' : mfa?.result === 'Verified' ? 'Low' : 'Medium',
      observedDate: '2026-11-02',
      freshness: 'Current · 9 days',
      entityMatch: matched,
      impact: c.id === 'CYB-2401' ? 'Supports referral. Exposed admin path plus the MFA contradiction.' : 'Informational for appetite.',
    },
    {
      id: 'cves',
      category: 'Vulnerabilities/CVEs',
      source: 'BitSight (Simulated)',
      finding:
        c.id === 'CYB-2401'
          ? '3 high CVEs on internet-facing edge hosts, older than 30 days.'
          : 'No critical CVE older than 30 days on the simulated scan.',
      severity: c.id === 'CYB-2401' ? 'Medium' : 'Low',
      observedDate: '2026-10-26',
      freshness: 'Current · 16 days',
      entityMatch: matched,
      impact: c.id === 'CYB-2401' ? 'Patching control stays partially verified.' : 'No appetite impact from CVE age.',
    },
    {
      id: 'security-rating',
      category: 'Security Rating',
      source: 'BitSight (Simulated)',
      finding: below
        ? `Latest simulated rating ${rating} is below the carrier floor of ${floor} for this limit. Use the 12-month trend, not this point alone.`
        : `Latest simulated rating ${rating} is at or above the carrier floor of ${floor}. The 12-month trend is on this row.`,
      severity: below ? 'High' : 'Info',
      observedDate: '2026-11-08',
      freshness: 'Current · 3 days',
      entityMatch: matched,
      impact: below ? 'Security rating below carrier appetite level.' : 'Rating meets the carrier floor.',
    },
    {
      id: 'exposed-services',
      category: 'Exposed Services',
      source: 'Censys-style scan (Simulated)',
      finding:
        c.id === 'CYB-2401'
          ? 'Remote admin service exposed. MFA not observed outside privileged roles.'
          : 'No unexpected remote-admin service on the simulated scan.',
      severity: c.id === 'CYB-2401' ? 'High' : 'Low',
      observedDate: '2026-11-02',
      freshness: 'Current · 9 days',
      entityMatch: matched,
      impact: c.id === 'CYB-2401' ? 'Agrees with the privileged-only MFA evidence.' : 'No exposed-service referral.',
    },
    {
      id: 'third-parties',
      category: 'Third-party Dependencies',
      source: 'BitSight (Simulated)',
      finding: c.vendors.length
        ? c.vendors.map((vendor) => vendor.vendor).join(', ')
        : 'No critical third parties named.',
      severity: c.vendors.some((vendor) => vendor.limitHint.toLowerCase().includes('watch') || vendor.limitHint.toLowerCase().includes('elevated'))
        ? 'Medium'
        : 'Low',
      observedDate: '2026-10-18',
      freshness: 'Aging · 24 days',
      entityMatch: matched,
      impact: 'Dependency list is context for aggregation. It does not by itself set appetite.',
    },
  ]
}

function rulesFor(c: CyberCase, rating: number, floor: number): AppetiteRuleView[] {
  const fromCase = c.appetiteHits.map((hit) => ({
    id: hit.ruleId,
    label: hit.label,
    outcome: outcomeLabel(hit.outcome),
    detail: hit.detail,
  }))
  if (fromCase.length > 0) {
    return fromCase.map((rule) =>
      rule.id === 'EXT-RATING-MIN'
        ? {
            ...rule,
            detail: `${rule.detail} Simulated BitSight rating is ${rating} against a floor of ${floor}.`,
          }
        : rule,
    )
  }
  if (c.recommendation === 'decline') {
    return [
      {
        id: 'APP-DECLINE',
        label: 'Control floor failed at the requested limit',
        outcome: 'Decline',
        detail: 'Open control evidence does not meet the floor for this limit.',
      },
    ]
  }
  if (rating < floor) {
    return [
      {
        id: 'EXT-RATING-MIN',
        label: 'Security rating below carrier appetite level',
        outcome: 'Refer',
        detail: `Simulated BitSight rating is ${rating} against a floor of ${floor}.`,
      },
    ]
  }
  return [
    {
      id: 'APP-PASS',
      label: 'Within carrier appetite',
      outcome: 'Within Appetite',
      detail: 'No referral or decline rule is triggered on this file.',
    },
  ]
}

function appetiteResultFrom(rules: AppetiteRuleView[], recommendation: CyberCase['recommendation']): AppetiteResult {
  if (rules.some((rule) => rule.outcome === 'Decline') || recommendation === 'decline') return 'Decline'
  if (rules.some((rule) => rule.outcome === 'Refer') || recommendation === 'refer' || recommendation === 'request_info') {
    return 'Refer'
  }
  return 'Within Appetite'
}

function reasonsFor(
  c: CyberCase,
  rules: AppetiteRuleView[],
  controls: EvidenceControl[],
  rating: number,
  floor: number,
  followUpCount: number,
): AiReason[] {
  if (c.id === 'CYB-2401') {
    return [
      {
        id: 'reason-mfa',
        text: `${MFA_CONTRADICTION} Verification result is Contradicted with high confidence.`,
        href: '#evidence-control-mfa',
        evidenceLabel: 'Evidence verification · MFA',
      },
      {
        id: 'reason-rule',
        text: 'Referral rule triggered: MFA coverage below minimum threshold.',
        href: '#appetite-rule-CTRL-MFA-MIN',
        evidenceLabel: 'Appetite rule CTRL-MFA-MIN',
      },
      {
        id: 'reason-rating',
        text: `Security rating below carrier appetite level. Simulated BitSight rating ${rating} versus floor ${floor} for a $${Math.round(c.limitRequestedUsd / 1_000_000)}M limit.`,
        href: '#external-finding-security-rating',
        evidenceLabel: 'External finding · Security Rating',
      },
    ]
  }
  const trigger = rules.find((rule) => rule.outcome === 'Refer' || rule.outcome === 'Decline')
  const weak = controls.find((row) => row.result === 'Contradicted' || row.result === 'Partially Verified' || row.result === 'Missing Evidence')
  const reasons: AiReason[] = []
  if (trigger) {
    reasons.push({
      id: `reason-${trigger.id}`,
      text: `${trigger.outcome === 'Decline' ? 'Decline' : 'Referral'} rule triggered: ${trigger.label}.`,
      href: `#appetite-rule-${trigger.id}`,
      evidenceLabel: `Appetite rule ${trigger.id}`,
    })
  } else {
    reasons.push({
      id: 'reason-clear',
      text: 'No referral or decline rule is triggered. Control evidence agrees with the application.',
      href: '#underwriting-measures',
      evidenceLabel: 'Underwriting measures',
    })
  }
  if (weak) {
    reasons.push({
      id: `reason-${weak.id}`,
      text: `${weak.control}: applicant says "${weak.declaration}". Verification result is ${weak.result}.`,
      href: `#evidence-control-${weak.id}`,
      evidenceLabel: `Evidence verification · ${weak.control}`,
    })
  }
  reasons.push({
    id: 'reason-rating',
    text:
      rating < floor
        ? `Security rating below carrier appetite level (${rating} vs floor ${floor}).`
        : `Simulated security rating ${rating} meets the floor of ${floor}. ${followUpCount} broker follow-up question${followUpCount === 1 ? '' : 's'}.`,
    href: '#external-finding-security-rating',
    evidenceLabel: 'External finding · Security Rating',
  })
  return reasons.slice(0, 3)
}

function authorityFor(c: CyberCase): CaseNarrative['authority'] {
  const withinLimit = isWithinJuniorAuthority(c.limitRequestedUsd, c.tier)
  const criticalOpen = c.gaps.some((gap) => gap.severity === 'critical' && gap.disposition === 'open')
  const exceeds = !withinLimit || criticalOpen
  if (!exceeds) {
    return {
      exceeds: false,
      summary: "Within delegated authority. Limit and tier are inside the underwriter's $5M / Tier 3 authority.",
      owner: 'James Park — Underwriter (delegated authority)',
    }
  }
  const why = [
    !withinLimit ? `Requested limit and tier sit outside James Park's delegated authority ($5M and Tier 3).` : null,
    criticalOpen ? 'A critical control gap is still open.' : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join(' ')
  return {
    exceeds: true,
    summary: why,
    owner: 'Priya Nair — Cyber specialist (referral owner)',
  }
}

export function narrativeForCase(c: CyberCase): CaseNarrative {
  const snap = securityRatingForCase(c)
  const rating = snap.rating
  const floor = ratingFloorForLimit(c.limitRequestedUsd)
  const documents = documentsFor(c)
  const followUps = followUpsFor(c, documents)
  const controls = controlsFor(c)
  const conflicts = conflictsFor(c, controls)
  const rules = rulesFor(c, rating, floor)
  const appetiteResult = appetiteResultFrom(rules, c.recommendation)
  const trigger = rules.find((rule) => rule.outcome === 'Refer' || rule.outcome === 'Decline') ?? null
  const effectiveness = effectivenessFrom(controls)
  const confidence = confidenceFrom(documents)
  const risk = cyberRiskBand(rating, floor, controls)
  const action = aiFromRecommendation(c.recommendation)
  const missingCount = documents.filter((doc) => doc.status === 'Missing').length

  return {
    cyberRisk: {
      label: risk,
      summary: `${risk} cyber risk from the simulated rating and control verification. This is not a blend of the other measures.`,
      why: [
        `Simulated BitSight rating is ${rating}. The carrier floor for this limit is ${floor}.`,
        controls.some((row) => row.result === 'Contradicted')
          ? `A control is Contradicted. ${c.id === 'CYB-2401' ? MFA_CONTRADICTION : 'See the evidence table.'}`
          : 'No control is marked Contradicted.',
        'Cyber risk is judged from the rating versus the floor and from verification results. It is not an average of control effectiveness, evidence confidence, completeness, and appetite.',
      ],
    },
    controlEffectiveness: {
      pct: effectiveness.pct,
      label: effectiveness.label,
      summary: `${effectiveness.label} · ${effectiveness.pct}% of verified control weight.`,
      why: [
        'Verified controls score 100%, partially verified 55%, contradicted 15%, missing evidence 20%. Not applicable controls are left out.',
        ...controls.map((row) => `${row.control}: ${row.result} (${row.confidence} confidence).`),
      ],
    },
    evidenceConfidence: {
      pct: confidence.pct,
      label: confidence.label,
      summary: `${confidence.label} · ${confidence.pct}% from submission document status.`,
      why: [
        'Extracted documents score 100%, classified 70%, received 55%, review required 45%, missing 0%.',
        ...documents.map((doc) => `${doc.name}: ${doc.status}.`),
      ],
    },
    completeness: {
      pct: c.completenessPct,
      missingCount,
      followUpCount: followUps.length,
      why: [
        `Submission completeness is ${c.completenessPct}% on the extracted package score already used by this desk.`,
        `${missingCount} submission document${missingCount === 1 ? '' : 's'} marked Missing on the intake register.`,
        `${followUps.length} question${followUps.length === 1 ? '' : 's'} require broker follow-up.`,
      ],
    },
    appetite: {
      result: appetiteResult,
      triggerRule: trigger?.label ?? null,
      rules,
      why: [
        appetiteResult === 'Within Appetite'
          ? 'No refer or decline rule is triggered.'
          : `Appetite result is ${appetiteResult} because this rule triggered: ${trigger?.label ?? 'see rules'}.`,
        ...rules.map((rule) => `${rule.label} — ${rule.outcome}. ${rule.detail}`),
      ],
    },
    documents,
    followUps,
    entityMatch: {
      insuredMatched: `Insured matched — ${c.insured} matches the legal name on the application.`,
      duplicateCheck: 'Duplicate check completed — no second open submission for this insured.',
      brokerIdentified: `Broker identified — ${c.broker}.`,
    },
    controls,
    externalFindings: findingsFor(c, rating, floor, controls),
    conflicts,
    rating,
    ratingFloor: floor,
    ratingTrend: snap.trend.map((point) => ({
      month: point.month,
      rating: point.rating,
      industryAvg: point.industryAvg,
    })),
    ai: {
      action,
      label: aiLabel(action),
      reasons: reasonsFor(c, rules, controls, rating, floor, followUps.length),
    },
    authority: authorityFor(c),
  }
}

export function decisionActionLabel(action: Exclude<CyberDecision, 'pending'>): CaseNarrative['ai']['label'] {
  return aiLabel(action)
}

export const MFA_CONTRADICTION_SUMMARY = MFA_CONTRADICTION
