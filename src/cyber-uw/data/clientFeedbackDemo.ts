import {
  isWithinJuniorAuthority,
  needsManagerCosign,
} from '../constants/cyberFlow'
import type { AppetiteHit, CyberCase, CyberDecision, GapSeverity } from '../types'
import { securityRatingForCase, type SecurityRatingLetter } from './securityRatingDemo'

function letterFromRating(rating: number): SecurityRatingLetter {
  if (rating >= 800) return 'A'
  if (rating >= 740) return 'B'
  if (rating >= 670) return 'C'
  if (rating >= 600) return 'D'
  if (rating >= 500) return 'E'
  return 'F'
}

/** Client-facing AI / HITL labels (store still uses quote | refer | decline). */
export type HitlDecisionLabel = 'Approve' | 'Refer' | 'Request Information' | 'Decline'

export type IntakeDocStatus =
  | 'Received'
  | 'Classified'
  | 'Extracted'
  | 'Missing'
  | 'Review Required'

export type VerificationStatus =
  | 'Verified'
  | 'Partially Verified'
  | 'Contradicted'
  | 'Missing Evidence'
  | 'Not Applicable'

export type EnrichmentCategory =
  | 'Attack Surface'
  | 'Vulnerabilities/CVEs'
  | 'Security Rating'
  | 'Exposed Services'
  | 'Third-party Dependencies'

export type AppetiteResultLabel = 'Within Appetite' | 'Refer' | 'Decline'

export interface IntakeDocumentRow {
  id: string
  name: string
  status: IntakeDocStatus
}

export interface EvidenceControlRow {
  id: string
  control: string
  declaration: string
  documentEvidence: string
  externalObservation: string
  result: VerificationStatus
  confidence: number
  contradiction?: boolean
  evidenceAnchor?: string
}

export interface ExternalFindingRow {
  id: string
  category: EnrichmentCategory
  source: string
  simulated: boolean
  finding: string
  severity: GapSeverity
  observedDate: string
  freshness: string
  entityMatch: string
  underwritingImpact: string
  conflictsWithDeclaration?: string
}

export interface RiskMeasure {
  id: string
  label: string
  value: string
  tone: 'ok' | 'watch' | 'action'
  why: { evidence: string; rules: string[] }
}

export interface AiDecisionReason {
  id: string
  text: string
  evidenceLabel: string
  evidenceAnchor: string
}

export interface HitlBundle {
  aiLabel: HitlDecisionLabel
  storeRecommendation: Exclude<CyberDecision, 'pending'>
  reasons: AiDecisionReason[]
  referralRule: string
  authority: {
    exceeds: boolean
    approvalAuthority: string
    referralOwner: string
    detail: string
  }
}

const INTAKE_DOCS: { id: string; name: string }[] = [
  { id: 'cyber-app', name: 'Cyber Application' },
  { id: 'infosec', name: 'InfoSec Questionnaire' },
  { id: 'irp', name: 'Incident Response Plan' },
  { id: 'loss-runs', name: 'Loss Runs' },
  { id: 'broker-corr', name: 'Broker Correspondence' },
]

function money(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function hasDoc(c: CyberCase, pattern: RegExp) {
  return c.packageDocs.some((doc) => pattern.test(doc.name) || pattern.test(doc.kind))
}

export function intakeDocumentsForCase(c: CyberCase): IntakeDocumentRow[] {
  const missingListed = new Set((c.missingDocs ?? []).map((d) => d.toLowerCase()))
  return INTAKE_DOCS.map((doc) => {
    let status: IntakeDocStatus = 'Missing'
    switch (doc.id) {
      case 'cyber-app':
        status = hasDoc(c, /application|cyber.?app/i)
          ? c.completenessPct >= 85
            ? 'Extracted'
            : 'Classified'
          : missingListed.has('cyber application') || c.completenessPct < 70
            ? 'Missing'
            : 'Received'
        break
      case 'infosec':
        status = hasDoc(c, /infosec|questionnaire|architecture/i)
          ? 'Extracted'
          : 'Review Required'
        break
      case 'irp':
        status = hasDoc(c, /incident|irp/i) ? 'Classified' : 'Missing'
        break
      case 'loss-runs':
        status = hasDoc(c, /loss/i) ? 'Received' : 'Missing'
        break
      case 'broker-corr':
        status = hasDoc(c, /broker|correspond|email|mail/i) ? 'Received' : 'Review Required'
        break
      default: {
        const neverId: never = doc.id as never
        void neverId
      }
    }
    // CYB-2401 demo consistency: all five present with IRP classified and broker review.
    if (c.id === 'CYB-2401') {
      if (doc.id === 'cyber-app') status = 'Extracted'
      if (doc.id === 'infosec') status = 'Extracted'
      if (doc.id === 'irp') status = 'Classified'
      if (doc.id === 'loss-runs') status = 'Received'
      if (doc.id === 'broker-corr') status = 'Review Required'
    }
    return { ...doc, status }
  })
}

export function intakeMetricsForCase(c: CyberCase) {
  const docs = intakeDocumentsForCase(c)
  const missingDocs = docs.filter((d) => d.status === 'Missing').length
  const brokerFollowUps =
    c.gaps.filter((g) => g.disposition === 'open' || g.disposition === 'referred').length +
    docs.filter((d) => d.status === 'Review Required' || d.status === 'Missing').length
  return {
    completenessPct: c.completenessPct,
    missingDocs,
    brokerFollowUps,
    docs,
  }
}

export function entityMatchForCase(c: CyberCase) {
  return {
    insuredMatched: true,
    duplicateCheckCompleted: true,
    brokerIdentified: Boolean(c.broker?.trim()),
    insured: c.insured,
    broker: c.broker,
  }
}

export function evidenceControlsForCase(c: CyberCase): EvidenceControlRow[] {
  const mfaGap = c.gaps.find((g) => /mfa/i.test(g.control))
  const edrGap = c.gaps.find((g) => /edr|endpoint/i.test(g.control))
  const backupGap = c.gaps.find((g) => /backup/i.test(g.control))

  // Client demo contradiction: declared "all users" vs evidence of privileged-only MFA.
  const mfaDeclaration =
    c.id === 'CYB-2401'
      ? 'MFA applies to all users'
      : (mfaGap?.attested ?? 'MFA on privileged accounts')
  const mfaExternal =
    c.id === 'CYB-2401'
      ? 'Evidence shows MFA on privileged users only; two admin bastions lack challenge.'
      : (mfaGap?.signal ??
        'External observation shows MFA on privileged users only; two admin bastions lack challenge.')

  return [
    {
      id: `${c.id}-ev-mfa`,
      control: 'MFA',
      declaration: mfaDeclaration,
      documentEvidence: 'InfoSec Questionnaire Q7 — MFA attested for workforce access.',
      externalObservation: mfaExternal,
      result: mfaGap || c.id === 'CYB-2401' ? 'Contradicted' : 'Partially Verified',
      confidence: mfaGap || c.id === 'CYB-2401' ? 92 : 74,
      contradiction: Boolean(mfaGap) || c.id === 'CYB-2401',
      evidenceAnchor: mfaGap?.id ?? 'mfa',
    },
    {
      id: `${c.id}-ev-edr`,
      control: 'EDR',
      declaration: edrGap?.attested ?? 'EDR on 100% of endpoints',
      documentEvidence: 'Endpoint policy excerpt in Cyber Application schedule.',
      externalObservation: edrGap?.signal ?? 'No contradictory EDR telemetry in simulated scan.',
      result: edrGap ? 'Partially Verified' : 'Verified',
      confidence: edrGap ? 78 : 88,
      evidenceAnchor: edrGap?.id,
    },
    {
      id: `${c.id}-ev-backups`,
      control: 'Backups',
      declaration: backupGap?.attested ?? 'Daily backups with quarterly restore tests',
      documentEvidence: backupGap ? 'Restore test PDF not attached.' : 'DR drill report attached.',
      externalObservation: backupGap?.signal ?? 'No public contradiction.',
      result: backupGap ? 'Missing Evidence' : 'Verified',
      confidence: backupGap ? 55 : 84,
      evidenceAnchor: backupGap?.id,
    },
    {
      id: `${c.id}-ev-priv`,
      control: 'Privileged access',
      declaration: 'Privileged access managed via IdP with MFA',
      documentEvidence: 'Access policy excerpt classified in InfoSec pack.',
      externalObservation: 'Exposed admin bastion inventory overlaps privileged paths.',
      result: mfaGap ? 'Contradicted' : 'Partially Verified',
      confidence: 81,
    },
    {
      id: `${c.id}-ev-patch`,
      control: 'Patching',
      declaration: 'Critical patches within 30 days',
      documentEvidence: 'Patch SLA stated in Cyber Application.',
      externalObservation: 'Simulated CVE window shows 2 critical CVEs > 30 days on perimeter hosts.',
      result: 'Partially Verified',
      confidence: 70,
    },
    {
      id: `${c.id}-ev-ir`,
      control: 'Incident response',
      declaration: 'IR plan tested annually',
      documentEvidence: hasDoc(c, /incident|irp/i)
        ? 'Incident Response Plan classified in package.'
        : 'IR plan missing from package.',
      externalObservation: 'No simulated IR tabletop contradiction.',
      result: hasDoc(c, /incident|irp/i) ? 'Verified' : 'Missing Evidence',
      confidence: hasDoc(c, /incident|irp/i) ? 86 : 48,
    },
  ]
}

export function externalFindingsForCase(c: CyberCase): ExternalFindingRow[] {
  const rating = securityRatingForCase(c)
  const mfaGap = c.gaps.find((g) => /mfa/i.test(g.control))
  const edrGap = c.gaps.find((g) => /edr|endpoint/i.test(g.control))
  return [
    {
      id: `${c.id}-xf-as1`,
      category: 'Attack Surface',
      source: 'BitSight',
      simulated: true,
      finding: 'Internet-facing admin bastions discovered without MFA challenge path.',
      severity: 'critical',
      observedDate: '2026-07-18',
      freshness: '8 days',
      entityMatch: `Matched ${c.insured}`,
      underwritingImpact: 'Supports MFA control floor referral.',
      conflictsWithDeclaration: mfaGap
        ? `Conflicts with declaration: "${mfaGap.attested}"`
        : 'Conflicts with declaration that MFA covers all users.',
    },
    {
      id: `${c.id}-xf-cve1`,
      category: 'Vulnerabilities/CVEs',
      source: 'Cyence',
      simulated: true,
      finding: 'Two critical CVEs on perimeter hosts older than patch SLA.',
      severity: 'high',
      observedDate: '2026-07-12',
      freshness: '14 days',
      entityMatch: `Matched ${c.insured}`,
      underwritingImpact: 'Raises Control Effectiveness concern.',
    },
    {
      id: `${c.id}-xf-sr1`,
      category: 'Security Rating',
      source: 'BitSight',
      simulated: true,
      finding: `Current rating ${rating.rating} (${letterFromRating(rating.rating)}) vs industry ${rating.industryAvg}.`,
      severity: rating.rating < 700 ? 'high' : 'medium',
      observedDate: '2026-07-20',
      freshness: 'Current',
      entityMatch: `Matched ${c.insured}`,
      underwritingImpact:
        rating.rating < 700
          ? 'Security rating below carrier appetite level.'
          : 'Rating within peer band; monitor trend.',
    },
    {
      id: `${c.id}-xf-exp1`,
      category: 'Exposed Services',
      source: 'BitSight',
      simulated: true,
      finding: 'Remote admin services exposed on two hosts.',
      severity: 'high',
      observedDate: '2026-07-18',
      freshness: '8 days',
      entityMatch: `Matched ${c.insured}`,
      underwritingImpact: 'Corroborates privileged access contradiction.',
      conflictsWithDeclaration: 'Conflicts with full-workforce MFA attestation.',
    },
    {
      id: `${c.id}-xf-tp1`,
      category: 'Third-party Dependencies',
      source: 'Cytora',
      simulated: true,
      finding: edrGap
        ? `EDR coverage signal ~78% vs attested full deployment (${edrGap.control}).`
        : 'Cloud concentration on primary CSP within portfolio norms.',
      severity: edrGap ? 'high' : 'info',
      observedDate: '2026-07-15',
      freshness: '11 days',
      entityMatch: `Matched ${c.insured}`,
      underwritingImpact: edrGap
        ? 'EDR deployment gap — refer for evidence.'
        : 'No third-party concentration exception.',
      conflictsWithDeclaration: edrGap
        ? `Conflicts with declaration: "${edrGap.attested}"`
        : undefined,
    },
  ]
}

export function appetiteResultForCase(c: CyberCase): AppetiteResultLabel {
  if (c.recommendation === 'decline' || c.decision === 'decline') return 'Decline'
  if (c.recommendation === 'refer' || c.decision === 'refer') return 'Refer'
  if (c.appetiteHits.some((h) => h.outcome === 'decline')) return 'Decline'
  if (c.appetiteHits.some((h) => h.outcome === 'refer')) return 'Refer'
  return 'Within Appetite'
}

export function referralRuleForCase(c: CyberCase): string {
  const mfaHit = c.appetiteHits.find((h) => /mfa/i.test(h.label) || /mfa/i.test(h.ruleId))
  if (mfaHit) return mfaHit.detail || 'MFA coverage below minimum threshold'
  const rating = securityRatingForCase(c)
  if (rating.rating < 700) return 'Security rating below carrier appetite level'
  const firstRefer = c.appetiteHits.find((h) => h.outcome === 'refer' || h.outcome === 'decline')
  if (firstRefer) return firstRefer.detail || firstRefer.label
  if (c.gaps.some((g) => /mfa/i.test(g.control) && g.disposition !== 'resolved')) {
    return 'MFA coverage below minimum threshold'
  }
  return 'No referral rule triggered'
}

export function riskMeasuresForCase(c: CyberCase): RiskMeasure[] {
  const rating = securityRatingForCase(c)
  const openGaps = c.gaps.filter((g) => g.disposition !== 'resolved')
  const contradicted = evidenceControlsForCase(c).filter((r) => r.result === 'Contradicted').length
  const cyberRisk = Math.max(0, Math.min(100, Math.round(100 - (rating.rating - 250) / 6.5)))
  const controlEff = Math.max(
    0,
    Math.min(100, Math.round(100 - openGaps.length * 12 - contradicted * 18)),
  )
  const evidenceConf = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        evidenceControlsForCase(c).reduce((sum, row) => sum + row.confidence, 0) /
          Math.max(1, evidenceControlsForCase(c).length),
      ),
    ),
  )
  const completeness = c.completenessPct
  const appetite = appetiteResultForCase(c)
  const rule = referralRuleForCase(c)

  return [
    {
      id: 'cyber-risk',
      label: 'Cyber Risk',
      value: `${cyberRisk}`,
      tone: cyberRisk >= 70 ? 'action' : cyberRisk >= 45 ? 'watch' : 'ok',
      why: {
        evidence: `Simulated BitSight rating ${rating.rating} (${letterFromRating(rating.rating)}); attack-surface and exposed-service findings.`,
        rules: ['Security rating band vs carrier floor', 'Exposed admin services weight'],
      },
    },
    {
      id: 'control-eff',
      label: 'Control Effectiveness',
      value: `${controlEff}`,
      tone: controlEff < 55 ? 'action' : controlEff < 75 ? 'watch' : 'ok',
      why: {
        evidence: `${openGaps.length} open control gap(s); ${contradicted} contradicted verification row(s) including MFA.`,
        rules: ['MFA coverage below minimum threshold', 'EDR deployment gap check'],
      },
    },
    {
      id: 'evidence-conf',
      label: 'Evidence Confidence',
      value: `${evidenceConf}`,
      tone: evidenceConf < 60 ? 'action' : evidenceConf < 75 ? 'watch' : 'ok',
      why: {
        evidence: 'Average confidence across MFA, EDR, backups, privileged access, patching, IR.',
        rules: ['Contradiction lowers confidence', 'Missing evidence caps confidence'],
      },
    },
    {
      id: 'completeness',
      label: 'Submission Completeness',
      value: `${completeness}%`,
      tone: completeness < 80 ? 'action' : completeness < 90 ? 'watch' : 'ok',
      why: {
        evidence: `Package completeness ${completeness}%; intake missing/review docs ${intakeMetricsForCase(c).missingDocs}.`,
        rules: ['Package completeness floor 80%', 'Required cyber document set'],
      },
    },
    {
      id: 'appetite',
      label: 'Appetite Result',
      value: appetite,
      tone: appetite === 'Decline' ? 'action' : appetite === 'Refer' ? 'watch' : 'ok',
      why: {
        evidence: `Triggered rule: ${rule}`,
        rules: c.appetiteHits.map((h: AppetiteHit) => `${h.ruleId}: ${h.label} → ${h.outcome}`),
      },
    },
  ]
}

export function hitlLabelFromDecision(d: CyberDecision): HitlDecisionLabel {
  switch (d) {
    case 'quote':
      return 'Approve'
    case 'refer':
      return 'Refer'
    case 'decline':
      return 'Decline'
    case 'pending':
      return 'Refer'
    default: {
      const neverDecision: never = d
      return neverDecision
    }
  }
}

export function storeDecisionFromHitl(
  label: HitlDecisionLabel,
): Exclude<CyberDecision, 'pending'> | 'request_info' {
  switch (label) {
    case 'Approve':
      return 'quote'
    case 'Refer':
      return 'refer'
    case 'Decline':
      return 'decline'
    case 'Request Information':
      return 'request_info'
    default: {
      const neverLabel: never = label
      return neverLabel
    }
  }
}

export function hitlBundleForCase(c: CyberCase): HitlBundle {
  const rec = c.recommendation === 'pending' ? 'refer' : c.recommendation
  const rating = securityRatingForCase(c)
  const mfaGap = c.gaps.find((g) => /mfa/i.test(g.control))
  const exceeds = needsManagerCosign({
    limitUsd: c.limitRequestedUsd,
    pricingTier: c.tier,
    criticalOpenGaps: c.gaps.filter((g) => g.severity === 'critical' && g.disposition === 'open')
      .length,
  })
  const withinJunior = isWithinJuniorAuthority(c.limitRequestedUsd, c.tier)

  return {
    aiLabel: hitlLabelFromDecision(rec),
    storeRecommendation: rec,
    reasons: [
      {
        id: 'r1',
        text: mfaGap
          ? 'MFA attestation conflicts with external observation (privileged users only / exposed bastions).'
          : 'Control attestation requires specialist review against external posture.',
        evidenceLabel: 'Evidence Verification · MFA',
        evidenceAnchor: 'evidence-mfa',
      },
      {
        id: 'r2',
        text: referralRuleForCase(c),
        evidenceLabel: 'Appetite rule',
        evidenceAnchor: 'appetite-rule',
      },
      {
        id: 'r3',
        text: `Simulated security rating ${rating.rating} with peer pressure vs industry ${rating.industryAvg}.`,
        evidenceLabel: 'BitSight (Simulated) · Security Rating',
        evidenceAnchor: 'enrichment-rating',
      },
    ],
    referralRule: referralRuleForCase(c),
    authority: {
      exceeds: exceeds || !withinJunior,
      approvalAuthority: withinJunior ? 'Junior UW authority' : 'Senior UW / Manager co-sign',
      referralOwner: 'Priya Nair — Cyber specialist',
      detail: exceeds
        ? `Requested limit ${money(c.limitRequestedUsd)} and Tier ${c.tier} exceed delegated authority (≤ $5M and Tier ≤ 3), or critical open gaps require manager co-sign.`
        : 'Case is inside junior delegated authority.',
    },
  }
}

export function caseHeaderMetrics(c: CyberCase) {
  const rating = securityRatingForCase(c)
  return {
    insured: c.insured,
    industry: c.sector,
    revenue: money(c.revenueUsd),
    requestedLimit: money(c.limitRequestedUsd),
    cyberRisk: `${letterFromRating(rating.rating)} · ${rating.rating}`,
    appetite: appetiteResultForCase(c),
    completeness: `${c.completenessPct}%`,
  }
}
