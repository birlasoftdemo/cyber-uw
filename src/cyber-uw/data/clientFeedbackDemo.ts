import {
  isWithinJuniorAuthority,
  needsManagerCosign,
} from '../constants/cyberFlow'
import type { AppetiteHit, CyberCase, CyberDecision, GapSeverity } from '../types'
import {
  sectionReportsForCase,
  triageFindingsForCase,
} from './cyberTriageRules'
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
export type HitlDecisionLabel = 'Approve' | 'Refer' | 'Decline'

export type IntakeDocStatus =
  | 'Received'
  | 'Classified'
  | 'Extracted'
  | 'Missing'
  | 'Review Required'

export type BrokerFollowUp = 'Required' | 'Not Required'

export type VerificationStatus =
  | 'Verified'
  | 'Partially Verified'
  | 'Contradicted'
  | 'Missing Evidence'
  | 'Not Applicable'

export type EnrichmentCategory =
  | 'Vulnerabilities/CVEs'
  | 'Security Rating'
  | 'Third-party Dependencies'

export type AppetiteResultLabel = 'Within Appetite' | 'Refer' | 'Decline'

export interface IntakeDocumentRow {
  id: string
  name: string
  status: IntakeDocStatus
  brokerFollowUp: BrokerFollowUp
  confidence: number
  /** Row-level document completeness 0–100. */
  completenessPct: number
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
  /** Display value, e.g. `34/100`. */
  value: string
  /** Numeric score 0–100 for bars and gauges. */
  score: number
  tone: 'ok' | 'watch' | 'action'
  /** Short status label kept for appetite / summary copy. */
  statusLabel?: string
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
    // CYB-2401 walkthrough: package present with broker correspondence still in review.
    if (c.id === 'CYB-2401') {
      if (doc.id === 'cyber-app') status = 'Extracted'
      if (doc.id === 'infosec') status = 'Extracted'
      if (doc.id === 'irp') status = 'Classified'
      if (doc.id === 'loss-runs') status = 'Received'
      if (doc.id === 'broker-corr') status = 'Review Required'
    }
    // CYB-2405 Northwind — negative path: multiple missing docs + review required.
    if (c.id === 'CYB-2405') {
      if (doc.id === 'cyber-app') status = 'Extracted'
      if (doc.id === 'infosec') status = 'Missing'
      if (doc.id === 'irp') status = 'Missing'
      if (doc.id === 'loss-runs') status = 'Missing'
      if (doc.id === 'broker-corr') status = 'Review Required'
    }
    // CYB-2408 Vanta Grid — positive path: clean package ready for analysis.
    if (c.id === 'CYB-2408') {
      if (doc.id === 'cyber-app') status = 'Extracted'
      if (doc.id === 'infosec') status = 'Extracted'
      if (doc.id === 'irp') status = 'Extracted'
      if (doc.id === 'loss-runs') status = 'Classified'
      if (doc.id === 'broker-corr') status = 'Received'
    }
    const brokerFollowUp: BrokerFollowUp =
      status === 'Missing' || status === 'Review Required' ? 'Required' : 'Not Required'
    const confidence = confidenceForIntakeStatus(status)
    const completenessPct = completenessForIntakeStatus(status)
    return { ...doc, status, brokerFollowUp, confidence, completenessPct }
  })
}

function confidenceForIntakeStatus(status: IntakeDocStatus): number {
  switch (status) {
    case 'Extracted':
      return 96
    case 'Classified':
      return 88
    case 'Received':
      return 74
    case 'Review Required':
      return 52
    case 'Missing':
      return 0
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

function completenessForIntakeStatus(status: IntakeDocStatus): number {
  switch (status) {
    case 'Extracted':
      return 100
    case 'Classified':
      return 90
    case 'Received':
      return 70
    case 'Review Required':
      return 40
    case 'Missing':
      return 0
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

/** True when the package still has missing intake docs or low completeness. */
export function packageIncompleteForCase(c: CyberCase): boolean {
  const docs = intakeDocumentsForCase(c)
  const missing = docs.filter((d) => d.status === 'Missing').length
  return missing > 0 || c.completenessPct < 80 || (c.missingDocs?.length ?? 0) > 0
}

export function intakeMetricsForCase(c: CyberCase) {
  const docs = intakeDocumentsForCase(c)
  const match = entityMatchForCase(c)
  const missingDocs = docs.filter((d) => d.status === 'Missing').length
  return {
    completenessPct: c.completenessPct,
    missingDocs,
    duplicateCheckCompleted: match.duplicateCheckCompleted,
    duplicateCheckLabel: match.duplicateCheckCompleted ? 'Complete' : 'Pending',
    insuredMatched: match.insuredMatched,
    brokerIdentified: match.brokerIdentified,
    docs,
  }
}

export function entityMatchForCase(c: CyberCase) {
  return {
    insuredMatched: true,
    // Demo KPI stays Complete (rendered black); package gaps are tracked separately.
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
  if (c.id === 'CYB-2408') return positivePathEnrichment(c)
  if (c.id === 'CYB-2405') return negativePathEnrichment(c)

  const rating = securityRatingForCase(c)
  const mfaGap = c.gaps.find((g) => /mfa/i.test(g.control))
  const edrGap = c.gaps.find((g) => /edr|endpoint/i.test(g.control))
  return [
    {
      id: `${c.id}-xf-cve1`,
      category: 'Vulnerabilities/CVEs',
      source: 'Cyence',
      simulated: true,
      finding: 'Two critical CVEs on perimeter hosts older than patch SLA.',
      severity: 'high',
      observedDate: '2026-07-12',
      freshness: '14 days',
      entityMatch: 'Y',
      underwritingImpact: 'Unpatched perimeter hosts weaken control effectiveness and may need a referral.',
      conflictsWithDeclaration: mfaGap
        ? `Conflicts with declaration: "${mfaGap.attested}"`
        : undefined,
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
      entityMatch: 'Y',
      underwritingImpact:
        rating.rating < 700
          ? 'Security rating sits below appetite, so treat this as a referral before quoting.'
          : 'Rating is in line with peers and does not change the quote path.',
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
      entityMatch: 'Y',
      underwritingImpact: edrGap
        ? 'EDR looks incomplete versus the application, so request evidence before binding.'
        : 'Third-party concentration is normal and does not change terms.',
      conflictsWithDeclaration: edrGap
        ? `Conflicts with declaration: "${edrGap.attested}"`
        : undefined,
    },
  ]
}

/** Vanta Grid — positive path: analyst-grade enrichment for Gartner-facing review. */
function positivePathEnrichment(c: CyberCase): ExternalFindingRow[] {
  const rating = securityRatingForCase(c)
  return [
    {
      id: `${c.id}-xf-sr1`,
      category: 'Security Rating',
      source: 'BitSight',
      simulated: true,
      finding: `Security rating ${Math.max(rating.rating, 790)} (Advanced tier). 12-month trend stable (±15 pts). Strongest factors: Patching Cadence, Application Security, Botnet Infections (none observed). No Compromised Systems events in the last 12 months.`,
      severity: 'info',
      observedDate: '2026-11-12',
      freshness: '1 day',
      entityMatch: 'Y',
      underwritingImpact:
        'Strong rating supports the attested controls and does not call for referral or loading.',
    },
    {
      id: `${c.id}-xf-sr2`,
      category: 'Security Rating',
      source: 'Cyence',
      simulated: true,
      finding:
        'Modeled cyber-risk tier: Low-Moderate. Peer percentile 76th within B2B SaaS, revenue $50–250M. Modeled BI exposure driven mainly by single-cloud-provider reliance, not by security posture.',
      severity: 'info',
      observedDate: '2026-11-05',
      freshness: '8 days',
      entityMatch: 'Y',
      underwritingImpact:
        'Peer position is favorable and can support pricing without driving the decision.',
    },
    {
      id: `${c.id}-xf-cve1`,
      category: 'Vulnerabilities/CVEs',
      source: 'BitSight',
      simulated: true,
      finding:
        'No CISA KEV-listed vulnerabilities on attributed external assets. One legacy status subdomain still negotiates TLS 1.0/1.1 alongside TLS 1.2. No sensitive data path identified on this host.',
      severity: 'medium',
      observedDate: '2026-11-09',
      freshness: '4 days',
      entityMatch: 'Y',
      underwritingImpact:
        'Legacy TLS on a non-critical host is a watch item only and should not block the quote.',
    },
    {
      id: `${c.id}-xf-cve2`,
      category: 'Vulnerabilities/CVEs',
      source: 'Cytora',
      simulated: true,
      finding:
        'Open-source dependency advisory on the public marketing site: outdated front-end library with a published medium-severity advisory (CVSS ~5–6). No evidence of exploitation. Not on the KEV list. Vendor patch available.',
      severity: 'info',
      observedDate: '2026-10-21',
      freshness: '23 days',
      entityMatch: 'Y',
      underwritingImpact:
        'Marketing-site library advisory is low materiality and fits a normal patch cycle.',
    },
    {
      id: `${c.id}-xf-tp1`,
      category: 'Third-party Dependencies',
      source: 'Cyence',
      simulated: true,
      finding:
        'Primary workloads on one hyperscaler, multi-AZ. Identity via a major SSO provider. Payments via a PCI-listed processor. No public security incident at any identified critical vendor in the last 12 months.',
      severity: 'medium',
      observedDate: '2026-10-30',
      freshness: '14 days',
      entityMatch: 'Y',
      underwritingImpact:
        'Cloud and vendor setup is typical for SaaS and is not a binding blocker.',
    },
  ]
}

/** Northwind Payments — negative path: realistic adverse enrichment for analyst review. */
function negativePathEnrichment(c: CyberCase): ExternalFindingRow[] {
  return [
    {
      id: `${c.id}-xf-sr1`,
      category: 'Security Rating',
      source: 'BitSight',
      simulated: true,
      finding:
        'Security rating 560 (Basic tier). Down 70 pts over 90 days. Weakest factors: Patching Cadence (F), Application Security (D), Open Ports (D). Two Potentially Exploited events in the last 90 days.',
      severity: 'high',
      observedDate: '2026-11-10',
      freshness: '3 days',
      entityMatch: 'Y',
      underwritingImpact:
        'Rating is below appetite with a worsening trend, so refer before quoting.',
    },
    {
      id: `${c.id}-xf-sr2`,
      category: 'Security Rating',
      source: 'Cyence',
      simulated: true,
      finding:
        'Modeled cyber-risk tier: Elevated. Peer percentile 17th within payments/fintech. Modeled ransomware and data-exfiltration frequency above peer median, driven by internet-facing exposure and reported control gaps.',
      severity: 'high',
      observedDate: '2026-11-05',
      freshness: '8 days',
      entityMatch: 'Y',
      underwritingImpact:
        'Independent model also shows elevated risk, so expect higher price and tighter limits if written.',
    },
    {
      id: `${c.id}-xf-cve1`,
      category: 'Vulnerabilities/CVEs',
      source: 'BitSight',
      simulated: true,
      finding:
        'Internet-facing SSL-VPN gateway running a build affected by a pre-authentication remote-code-execution advisory (CVE-2024-class, CISA KEV-listed). Vendor fix available 60+ days. Gateway still responds with the vulnerable version banner.',
      severity: 'critical',
      observedDate: '2026-10-29',
      freshness: '15 days',
      entityMatch: 'Y',
      underwritingImpact:
        'A known critical flaw on remote access must be patched or isolated before bind.',
      conflictsWithDeclaration:
        'Declared critical patches applied within 30 days. Observed KEV-listed vulnerability on a perimeter gateway unpatched >60 days after fix availability.',
    },
    {
      id: `${c.id}-xf-cve2`,
      category: 'Vulnerabilities/CVEs',
      source: 'Cytora',
      simulated: true,
      finding:
        'Customer-facing legacy portal subdomain running an end-of-life PHP runtime (7.4, unsupported since Nov 2022). Multiple unpatched advisories applicable. Login form exposed to the internet.',
      severity: 'high',
      observedDate: '2026-10-14',
      freshness: '30 days',
      entityMatch: 'Y',
      underwritingImpact:
        'Unsupported software on a public login page needs an upgrade plan or warranty discussion.',
      conflictsWithDeclaration:
        'Declared all internet-facing systems run vendor-supported software. Observed an end-of-life runtime on a public portal.',
    },
    {
      id: `${c.id}-xf-tp1`,
      category: 'Third-party Dependencies',
      source: 'Cyence',
      simulated: true,
      finding:
        'Core transaction hosting and monitoring depend on a single managed service provider. That MSP disclosed a security incident affecting some customers in Q3 2026. No evidence Northwind data was affected. Concentration on one MSP with privileged access.',
      severity: 'medium',
      observedDate: '2026-09-18',
      freshness: '56 days',
      entityMatch: 'Y',
      underwritingImpact:
        'Single MSP concentration raises contingent-BI concern until vendor evidence is on file.',
    },
    {
      id: `${c.id}-xf-tp2`,
      category: 'Third-party Dependencies',
      source: 'Cytora',
      simulated: true,
      finding:
        "News signal: 'Northwind Payment Solutions' (different legal name and jurisdiction, no shared domain) reported unauthorized access to a payments database. Name similarity only. No domain, registration number, or LEI match to the insured.",
      severity: 'medium',
      observedDate: '2026-08-27',
      freshness: '78 days',
      entityMatch: 'N',
      underwritingImpact:
        'Name-similar news does not match this insured and should be ignored for scoring.',
    },
  ]
}

export function appetiteResultForCase(c: CyberCase): AppetiteResultLabel {
  if (packageIncompleteForCase(c)) return 'Decline'
  if (c.recommendation === 'decline' || c.decision === 'decline') return 'Decline'
  if (c.recommendation === 'refer' || c.decision === 'refer') return 'Refer'
  if (c.appetiteHits.some((h) => h.outcome === 'decline')) return 'Decline'
  if (c.appetiteHits.some((h) => h.outcome === 'refer')) return 'Refer'
  return 'Within Appetite'
}

export function referralRuleForCase(c: CyberCase): string {
  const mfaHit = c.appetiteHits.find((h) => /mfa/i.test(h.label) || /mfa/i.test(h.ruleId))
  if (mfaHit) return mfaHit.detail || 'MFA coverage below minimum threshold'
  const firstRefer = c.appetiteHits.find((h) => h.outcome === 'refer' || h.outcome === 'decline')
  if (firstRefer) return firstRefer.detail || firstRefer.label
  if (c.gaps.some((g) => /mfa/i.test(g.control) && g.disposition !== 'resolved')) {
    return 'MFA coverage below minimum threshold'
  }
  const cyber = documentCyberRiskScore(c)
  if (cyber.score >= 70) return 'Document risk load above carrier appetite band'
  return 'No referral rule triggered'
}

export interface SectionHeatChip {
  id: string
  label: string
  failCount: number
  findingCount: number
  tone: 'ok' | 'watch' | 'action'
}

/** Application-section heat for Risk Analysis — fail counts from ingested fields. */
export function sectionHeatForCase(c: CyberCase): SectionHeatChip[] {
  return sectionReportsForCase(c).map((report) => {
    const failCount = report.fields.filter((field) => field.failsTriage).length
    const findingCount = report.findings.filter(
      (finding) => finding.required || finding.severity !== 'low',
    ).length
    const load = failCount + findingCount
    const tone: SectionHeatChip['tone'] =
      load >= 2 || failCount >= 1 ? 'action' : findingCount > 0 ? 'watch' : 'ok'
    return {
      id: report.section.id,
      label: report.section.tabLabel,
      failCount,
      findingCount,
      tone,
    }
  })
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Document-native cyber risk load 0–100 (higher = more adverse). */
export function documentCyberRiskScore(c: CyberCase): {
  score: number
  failFields: number
  highFindings: number
  openGaps: number
  pendingRequired: number
} {
  const reports = sectionReportsForCase(c)
  const failFields = reports.reduce(
    (sum, report) => sum + report.fields.filter((field) => field.failsTriage).length,
    0,
  )
  const highFindings = triageFindingsForCase(c).filter(
    (finding) => finding.severity === 'high' || (finding.required && finding.severity !== 'low'),
  ).length
  const openGaps = c.gaps.filter((gap) => gap.disposition === 'open').length
  const pendingRequired = triageFindingsForCase(c)
    .filter((finding) => finding.required)
    .filter((finding) => {
      const judgment = c.riskJudgments?.[finding.id]
      return !judgment || judgment.status === 'pending'
    }).length
  const score = clampScore(
    18 + failFields * 11 + highFindings * 9 + openGaps * 8 + pendingRequired * 6,
  )
  return { score, failFields, highFindings, openGaps, pendingRequired }
}

/** Document-native control effectiveness 0–100 (higher = stronger). */
export function documentControlEffectivenessScore(c: CyberCase): {
  score: number
  openGaps: number
  contradicted: number
  failFields: number
  signedAccepted: number
} {
  const openGaps = c.gaps.filter((gap) => gap.disposition !== 'resolved').length
  const contradicted = evidenceControlsForCase(c).filter((row) => row.result === 'Contradicted')
    .length
  const failFields = sectionReportsForCase(c).reduce(
    (sum, report) => sum + report.fields.filter((field) => field.failsTriage).length,
    0,
  )
  const signedAccepted = Object.values(c.riskJudgments ?? {}).filter(
    (judgment) => judgment.status === 'accepted' || judgment.status === 'noted',
  ).length
  const score = clampScore(
    100 - openGaps * 12 - contradicted * 16 - failFields * 6 + signedAccepted * 3,
  )
  return { score, openGaps, contradicted, failFields, signedAccepted }
}

export function riskMeasuresForCase(c: CyberCase): RiskMeasure[] {
  // Incomplete packages must not show positive risk metrics (Northwind negative path).
  if (packageIncompleteForCase(c)) {
    const missing = intakeDocumentsForCase(c)
      .filter((d) => d.status === 'Missing')
      .map((d) => d.name)
    const missingList =
      missing.length > 0
        ? missing.join('; ')
        : (c.missingDocs ?? []).join('; ') || 'Required package documents'
    return [
      {
        id: 'cyber-risk',
        label: 'Cyber Risk',
        value: '88/100',
        score: 88,
        tone: 'action',
        why: {
          evidence: `Risk elevated because the package is incomplete (${missingList}). Positive scoring is withheld until docs arrive or a manual override is recorded for navigation only.`,
          rules: [
            'Start from ingested application + questionnaire fields only (no external rating on this stage).',
            'Missing required docs floor Cyber Risk in the adverse band (≥80).',
            'Manual intake override unlocks navigation only — it does not restore affirmative scoring.',
          ],
        },
      },
      {
        id: 'control-eff',
        label: 'Control Effectiveness',
        value: '22/100',
        score: 22,
        tone: 'action',
        why: {
          evidence:
            'Control effectiveness cannot be affirmed without InfoSec / IRP / loss-run evidence in the package.',
          rules: [
            'Score starts at 100 and falls for open gaps, contradicted attestations, and failed triage fields.',
            'Missing InfoSec / IRP / loss-run evidence floors the score in the adverse band.',
            'Broker follow-up is required before affirmative control measures.',
          ],
        },
      },
      {
        id: 'appetite',
        label: 'Appetite Result',
        value: '20/100',
        score: 20,
        tone: 'action',
        statusLabel: 'Decline',
        why: {
          evidence: 'Appetite held at Decline while required documents are missing.',
          rules: [
            'Incomplete package → Decline (20/100) until remediated.',
            'Within Appetite = 100 · Refer = 55 · Decline = 20.',
            'Triggered by missing package docs, not by enrichment models.',
          ],
        },
      },
    ]
  }

  const cyber = documentCyberRiskScore(c)
  const control = documentControlEffectivenessScore(c)
  const appetite = appetiteResultForCase(c)
  const rule = referralRuleForCase(c)
  const appetiteScore = appetiteScoreForLabel(appetite)
  const appetiteTone: RiskMeasure['tone'] =
    appetite === 'Decline' ? 'action' : appetite === 'Refer' ? 'watch' : 'ok'
  const topFails = sectionReportsForCase(c)
    .flatMap((report) =>
      report.fields
        .filter((field) => field.failsTriage)
        .map((field) => `${report.section.tabLabel}: ${field.label}`),
    )
    .slice(0, 3)

  return [
    {
      id: 'cyber-risk',
      label: 'Cyber Risk',
      value: `${cyber.score}/100`,
      score: cyber.score,
      tone: cyber.score >= 70 ? 'action' : cyber.score >= 45 ? 'watch' : 'ok',
      why: {
        evidence:
          topFails.length > 0
            ? `Document risk load from application triage. Top fails — ${topFails.join('; ')}.`
            : `Document risk load from application triage with ${cyber.highFindings} elevated finding(s) and ${cyber.openGaps} open gap(s).`,
        rules: [
          `Base 18 + ${cyber.failFields} failed field(s)×11 + ${cyber.highFindings} elevated finding(s)×9 + ${cyber.openGaps} open gap(s)×8 + ${cyber.pendingRequired} unsigned required finding(s)×6.`,
          'Inputs are extracted application answers, InfoSec/IRP presence, and UW gap dispositions — not BitSight/Cyence.',
          'Higher score = more adverse. ≥70 action · 45–69 watch · <45 within band.',
        ],
      },
    },
    {
      id: 'control-eff',
      label: 'Control Effectiveness',
      value: `${control.score}/100`,
      score: control.score,
      tone: control.score < 55 ? 'action' : control.score < 75 ? 'watch' : 'ok',
      why: {
        evidence: `${control.openGaps} open/referred control gap(s); ${control.contradicted} contradicted verification row(s); ${control.failFields} failed application field(s).`,
        rules: [
          `Start at 100 − ${control.openGaps} open gap(s)×12 − ${control.contradicted} contradiction(s)×16 − ${control.failFields} failed field(s)×6 + ${control.signedAccepted} signed finding(s)×3.`,
          'MFA / EDR / backup floors from the application drive gap weight; HITL Approve/Ignore on findings recovers a small credit.',
          'Higher score = stronger controls. <55 action · 55–74 watch · ≥75 within band.',
        ],
      },
    },
    {
      id: 'appetite',
      label: 'Appetite Result',
      value: `${appetiteScore}/100`,
      score: appetiteScore,
      tone: appetiteTone,
      statusLabel: appetite,
      why: {
        evidence: `${appetite} · triggered rule: ${rule}`,
        rules:
          c.appetiteHits.length > 0
            ? [
                ...c.appetiteHits.map(
                  (h: AppetiteHit) => `${h.ruleId}: ${h.label} → ${h.outcome}`,
                ),
                'Mapped score: Within Appetite = 100 · Refer = 55 · Decline = 20.',
              ]
            : [
                `Rule: ${rule}`,
                'Mapped score: Within Appetite = 100 · Refer = 55 · Decline = 20.',
              ],
      },
    },
  ]
}

function appetiteScoreForLabel(label: AppetiteResultLabel): number {
  switch (label) {
    case 'Within Appetite':
      return 100
    case 'Refer':
      return 55
    case 'Decline':
      return 20
    default: {
      const neverLabel: never = label
      return neverLabel
    }
  }
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
): Exclude<CyberDecision, 'pending'> {
  switch (label) {
    case 'Approve':
      return 'quote'
    case 'Refer':
      return 'refer'
    case 'Decline':
      return 'decline'
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
  const incomplete = packageIncompleteForCase(c)
  return {
    insured: c.insured,
    industry: c.sector,
    revenue: money(c.revenueUsd),
    requestedLimit: money(c.limitRequestedUsd),
    cyberRisk: incomplete
      ? 'D · Incomplete package'
      : `${letterFromRating(rating.rating)} · ${rating.rating}`,
    appetite: appetiteResultForCase(c),
    completeness: `${c.completenessPct}%`,
  }
}
