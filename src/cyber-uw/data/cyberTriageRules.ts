import type { CyberCase, GapSeverity, PackageDoc } from '../types'

/** UW disposition on a triage finding. */
export type TriageDisposition = 'approve' | 'escalate' | 'ignore'

export interface TriageFinding {
  id: string
  ruleId: string
  title: string
  chartLabel: string
  severity: 'high' | 'medium' | 'low'
  required: boolean
  sourceSectionId: string
  sourceDocId: string
  sourceDocName: string
  attested: string
  detected: string
  summary: string
  detail: string
  suggested: TriageDisposition
  likelihoodPct: number
  impactUsd: number
  exposureWeight: number
}

export interface AppSection {
  id: string
  /** Bold section title from the CyberRisk application (CYB-14102). */
  title: string
  questions: string
  tabLabel: string
}

export interface SectionField {
  key?: string
  label: string
  value: string
  /** Application-attested answer (Policy Documents). Falls back to `value`. */
  attested?: string
  signal?: string
  /** Permitted value shown in green on Risk Information. */
  floor?: string
  failsTriage?: boolean
}

export interface SectionReport {
  section: AppSection
  fields: SectionField[]
  findings: TriageFinding[]
}

/** @deprecated Use SectionReport — kept for call sites still expecting a document wrapper. */
export type DocReport = SectionReport & { doc: PackageDoc }

/**
 * Coverage will not be considered for these classes
 * (application: “Organizations not eligible for coverage”).
 */
export const INELIGIBLE_ORGANIZATION_ACTIVITIES = [
  'Paramilitary operations',
  'Pornography',
  'Adult entertainment',
  'Escort services',
  'Prostitution',
  'Manufacturing, distribution, or sale of marijuana',
] as const

const INELIGIBLE_MATCHERS: { needles: string[]; activity: string }[] = [
  { needles: ['paramilitary'], activity: 'Paramilitary operations' },
  { needles: ['pornograph'], activity: 'Pornography' },
  { needles: ['adult entertainment', 'adult content'], activity: 'Adult entertainment' },
  { needles: ['escort'], activity: 'Escort services' },
  { needles: ['prostitut'], activity: 'Prostitution' },
  {
    needles: ['marijuana', 'cannabis'],
    activity: 'Manufacturing, distribution, or sale of marijuana',
  },
]

/** Bold section titles covering questions 1–19 on the application. */
export const APP_SECTIONS: AppSection[] = [
  { id: 'data_inventory', title: 'Data Inventory', questions: '1–5', tabLabel: 'Data Inventory' },
  { id: 'privacy_controls', title: 'Privacy Controls', questions: '6', tabLabel: 'Privacy Controls' },
  {
    id: 'network_security',
    title: 'Network Security Controls',
    questions: '7',
    tabLabel: 'Network Security',
  },
  {
    id: 'payment_card',
    title: 'PCI-DSS',
    questions: '8',
    tabLabel: 'PCI-DSS',
  },
  {
    id: 'content_liability',
    title: 'Content Liability Controls',
    questions: '9–10',
    tabLabel: 'Content Liability Controls',
  },
  {
    id: 'bc_dr_ir',
    title: 'Business Continuity / Disaster Recovery / Incident Response',
    questions: '11–13',
    tabLabel: 'BC / DR / IR',
  },
  { id: 'vendor_controls', title: 'Vendor Controls', questions: '14', tabLabel: 'Vendor Controls' },
  {
    id: 'outsourced_services',
    title: 'Outsourced Services',
    questions: '15',
    tabLabel: 'Outsourced',
  },
  { id: 'loss_information', title: 'Loss Information', questions: '16–17', tabLabel: 'Loss Information' },
  {
    id: 'requested_insurance_terms',
    title: 'Requested Insurance Terms',
    questions: 'Coverage table',
    tabLabel: 'Insurance Terms',
  },
  { id: 'requested_terms', title: 'Requested Terms', questions: '18', tabLabel: 'Requested Terms' },
  { id: 'current_coverage', title: 'Current Coverage', questions: '19', tabLabel: 'Current Coverage' },
]

/** Risk Information tab order: terms and highest-severity floors first. */
export const RISK_REVIEW_SECTION_IDS = [
  'requested_terms',
  'requested_insurance_terms',
  'loss_information',
  'data_inventory',
  'network_security',
  'payment_card',
  'bc_dr_ir',
  'privacy_controls',
  'vendor_controls',
  'outsourced_services',
  'current_coverage',
  'content_liability',
] as const

export interface AroMultiplier {
  label: string
  factor: number
}

export interface ApplicationPosture {
  ineligibleActivity: string | null
  healthcare: boolean
  retail: boolean
  saas: boolean
  cardData: boolean
  hipaaApplies: boolean
  gdprApplies: boolean
  recordsBand: string
  recordsMidpoint: number
  costPerRecord: number
  dataClass: string
  encryptionEf: number
  encryptionNote: string
  aroBase: number
  aroBaseLabel: string
  aroMultipliers: AroMultiplier[]
  aro: number
  rtoBand: string
  rtoHours: number
  mfaGap: boolean
  edrGap: boolean
  backupWeak: boolean
  irTested: boolean
  lossYes: boolean
  pciCompliant: boolean | null
}

function gapByControl(c: CyberCase, match: string) {
  const m = match.toLowerCase()
  return c.gaps.find((g) => g.control.toLowerCase().includes(m))
}

function hasOpenMaterial(c: CyberCase, match: string): boolean {
  const g = gapByControl(c, match)
  if (!g) return false
  if (g.disposition !== 'open') return false
  return g.severity === 'critical' || g.severity === 'high'
}

function contradiction(_attested: string, detected?: string): boolean {
  if (!detected) return false
  const d = detected.toLowerCase()
  return (
    d.includes('without mfa') ||
    d.includes('gap') ||
    d.includes('~78%') ||
    d.includes('not attached') ||
    d.includes('antivirus') ||
    d.includes('not fully') ||
    d.includes('incomplete') ||
    d.includes('legacy imap')
  )
}

function haystackFor(c: { sector: string; insured: string; dossierSummary?: string }): string {
  return `${c.sector} ${c.insured} ${c.dossierSummary ?? ''}`.toLowerCase()
}

export function matchIneligibleActivity(c: {
  sector: string
  insured: string
  dossierSummary?: string
}): string | null {
  const hay = haystackFor(c)
  for (const row of INELIGIBLE_MATCHERS) {
    if (row.needles.some((n) => hay.includes(n))) return row.activity
  }
  return null
}

function yn(yes: boolean): string {
  return yes ? 'Yes' : 'No'
}

export function applicationPosture(c: Pick<CyberCase, 'sector' | 'insured'> & Partial<CyberCase>): ApplicationPosture {
  const formSignals = c.formSignals ?? []
  const gaps = c.gaps ?? []
  const caseLike = { ...c, formSignals, gaps } as CyberCase
  const sector = c.sector.toLowerCase()
  const healthcare = /health|pharma|clinic/.test(sector)
  const retail = /retail|e-comm/.test(sector)
  const saas = /saas|tech|software/.test(sector)
  const logistics = /logistic|transport/.test(sector)
  const incomplete = (c.completenessPct ?? 100) < 80
  const mfaSignal = formSignals.find((s) => s.label.toLowerCase().includes('mfa'))
  const edrSignal = formSignals.find((s) => s.label.toLowerCase().includes('edr'))
  const backupSignal = formSignals.find((s) => s.label.toLowerCase().includes('backup'))
  const mfaGap =
    hasOpenMaterial(caseLike, 'MFA') || contradiction(mfaSignal?.answer ?? '', mfaSignal?.signal)
  const edrGap =
    hasOpenMaterial(caseLike, 'EDR') ||
    hasOpenMaterial(caseLike, 'endpoint') ||
    contradiction(edrSignal?.answer ?? '', edrSignal?.signal)
  const backupWeak =
    contradiction(backupSignal?.answer ?? '', backupSignal?.signal) ||
    (backupSignal?.signal ?? '').toLowerCase().includes('not attached') ||
    (backupSignal?.answer ?? '').toLowerCase().includes('not sure') ||
    incomplete
  const lossYes = incomplete || c.recommendation === 'decline'
  const irTested = !backupWeak && !incomplete && !mfaGap
  const ineligibleActivity = matchIneligibleActivity(c)
  const cardData = retail || healthcare
  const pciCompliant = !cardData ? null : retail ? !incomplete && !edrGap : true

  let recordsBand = 'fewer than 100,000'
  let recordsMidpoint = 50_000
  if (healthcare) {
    recordsBand = '1,000,000 – 5,000,000'
    recordsMidpoint = 3_000_000
  } else if (retail) {
    recordsBand = '250,000 – 1,000,000'
    recordsMidpoint = 625_000
  } else if (saas) {
    recordsBand = '100,000 – 250,000'
    recordsMidpoint = 175_000
  } else if (logistics) {
    recordsBand = '100,000 – 250,000'
    recordsMidpoint = 175_000
  }

  const costPerRecord = healthcare ? 225 : retail ? 180 : 150
  const dataClass = healthcare
    ? 'Medical information / PHI (Q1b)'
    : retail
      ? 'Credit / debit card data (Q1a)'
      : saas
        ? 'Customer PII'
        : 'Employee / operational PII'

  let encryptionEf = 0.15
  let encryptionNote = 'Encrypted at rest, in transit, mobile, BYOD, and third parties (Q3 a–e)'
  if (incomplete) {
    encryptionEf = 0.55
    encryptionNote = 'Encryption states incomplete on application (Q3)'
  } else if (mfaGap || edrGap) {
    encryptionEf = 0.35
    encryptionNote = 'Mixed encryption — mobile / remote paths not fully covered (Q3c–d)'
  }

  let aroBase = 0.1
  let aroBaseLabel = `${c.sector} peer frequency`
  if (healthcare) {
    aroBase = 0.18
    aroBaseLabel = 'Healthcare PHI / clinical attack surface'
  } else if (retail) {
    aroBase = 0.14
    aroBaseLabel = 'Retail cardholder and e-commerce surface'
  } else if (logistics) {
    aroBase = 0.12
    aroBaseLabel = 'Logistics OT / TMS surface'
  } else if (saas) {
    aroBase = 0.11
    aroBaseLabel = 'SaaS multi-tenant attack surface'
  }

  const aroMultipliers: AroMultiplier[] = []
  if (mfaGap) aroMultipliers.push({ label: 'MFA gap on admin / remote / email (Q7h–j)', factor: 1.55 })
  if (edrGap) aroMultipliers.push({ label: 'EDR / AV coverage gap (Q7c)', factor: 1.35 })
  if (backupWeak) aroMultipliers.push({ label: 'Backups not automated or not tested annually (Q7l)', factor: 1.25 })
  if (!irTested) aroMultipliers.push({ label: 'DR / IR plans not regularly tested (Q12)', factor: 1.2 })
  if (lossYes) aroMultipliers.push({ label: 'Q16/Q17 loss or circumstance = Yes', factor: 1.4 })
  if (!mfaGap && !edrGap && !backupWeak && irTested) {
    aroMultipliers.push({ label: 'Firewall + AV + 30-day patching in place (Q7b–d)', factor: 0.85 })
  }

  const aro = Number(
    (aroBase * aroMultipliers.reduce((acc, m) => acc * m.factor, 1)).toFixed(4),
  )

  let rtoBand = '0–12 hours'
  let rtoHours = 8
  if (incomplete || backupWeak) {
    rtoBand = 'Unknown'
    rtoHours = 36
  } else if (mfaGap) {
    rtoBand = '12–24 hours'
    rtoHours = 18
  } else if (edrGap) {
    rtoBand = 'More than 24 hours'
    rtoHours = 48
  }

  return {
    ineligibleActivity,
    healthcare,
    retail,
    saas,
    cardData,
    hipaaApplies: healthcare,
    gdprApplies: saas,
    recordsBand,
    recordsMidpoint,
    costPerRecord,
    dataClass,
    encryptionEf,
    encryptionNote,
    aroBase,
    aroBaseLabel,
    aroMultipliers,
    aro,
    rtoBand,
    rtoHours,
    mfaGap,
    edrGap,
    backupWeak,
    irTested,
    lossYes,
    pciCompliant,
  }
}

function moneyShort(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(usd >= 10_000_000 ? 0 : 1)}M`
  if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}k`
  return `$${usd}`
}

function finding(
  section: AppSection,
  partial: Omit<TriageFinding, 'sourceSectionId' | 'sourceDocId' | 'sourceDocName'>,
): TriageFinding {
  return {
    ...partial,
    sourceSectionId: section.id,
    sourceDocId: section.id,
    sourceDocName: section.title,
  }
}

function sectionById(id: string): AppSection {
  return APP_SECTIONS.find((s) => s.id === id) ?? APP_SECTIONS[0]
}

/**
 * Triage rules evaluated from the CyberRisk application.
 * Hard eligibility uses “Organizations not eligible for coverage”.
 * Remaining findings map to the bold section that asked the question.
 */
export function triageFindingsForCase(c: CyberCase): TriageFinding[] {
  const p = applicationPosture(c)
  const findings: TriageFinding[] = []
  const dataInv = sectionById('data_inventory')
  const privacy = sectionById('privacy_controls')
  const network = sectionById('network_security')
  const payment = sectionById('payment_card')
  const content = sectionById('content_liability')
  const bc = sectionById('bc_dr_ir')
  const vendor = sectionById('vendor_controls')
  const outsourced = sectionById('outsourced_services')
  const loss = sectionById('loss_information')
  const insTerms = sectionById('requested_insurance_terms')
  const reqTerms = sectionById('requested_terms')
  const current = sectionById('current_coverage')

  const ineligible = Boolean(p.ineligibleActivity)
  findings.push(
    finding( dataInv, {
      id: `${c.id}-triage-elig`,
      ruleId: 'ELIG-ORG-EXCLUSION',
      title: 'Organizations not eligible for coverage',
      chartLabel: 'Eligibility',
      severity: ineligible ? 'high' : 'low',
      required: true,
      attested: `${c.sector} · ${c.insured}`,
      detected: ineligible
        ? `Matches excluded class: ${p.ineligibleActivity}`
        : `No match to excluded classes: ${INELIGIBLE_ORGANIZATION_ACTIVITIES.join('; ')}`,
      summary: ineligible
        ? `Ineligible class — coverage will not be considered (${p.ineligibleActivity}).`
        : 'Applicant is not in an excluded class. Confirm and Approve to proceed.',
      detail:
        'The application states coverage will not be considered for paramilitary operations, pornography, adult entertainment, escort services, prostitution, or manufacturing, distribution, or sale of marijuana. A match is a hard decline — do not price. No match still requires an explicit Approve so the desk records the eligibility check.',
      suggested: ineligible ? 'escalate' : 'approve',
      likelihoodPct: ineligible ? 95 : 8,
      impactUsd: c.limitRequestedUsd,
      exposureWeight: ineligible ? 100 : 18,
    }),
  )

  if (p.hipaaApplies) {
    findings.push(
      finding( dataInv, {
        id: `${c.id}-triage-hipaa`,
        ruleId: 'DATA-HIPAA-Q4',
        title: 'HIPAA entity and compliance (Q4)',
        chartLabel: 'HIPAA',
        severity: 'medium',
        required: true,
        attested: 'Healthcare provider / covered entity — Yes',
        detected: p.mfaGap || p.edrGap
          ? 'HIPAA applies; control floors on the same package are open'
          : 'HIPAA applies; no open control contradiction extracted',
        summary: p.mfaGap || p.edrGap
          ? 'PHI inventory plus open technical floors — escalate before quoting.'
          : 'HIPAA compliance represented; no extracted contradiction.',
        detail:
          'Q4 asks whether the applicant is a healthcare provider or entity and whether they are HIPAA compliant. A healthcare book with medical information (Q1b) and open MFA/EDR gaps is treated as an eligibility-adjacent referral, not a silent approve.',
        suggested: p.mfaGap || p.edrGap ? 'escalate' : 'approve',
        likelihoodPct: p.mfaGap || p.edrGap ? 38 : 16,
        impactUsd: Math.round(p.recordsMidpoint * p.costPerRecord * p.encryptionEf * 0.25),
        exposureWeight: p.mfaGap || p.edrGap ? 64 : 28,
      }),
    )
  }

  findings.push(
    finding( privacy, {
      id: `${c.id}-triage-privacy`,
      ruleId: 'PRIV-CONTROLS-Q6',
      title: 'Privacy officer, policy, training, least privilege (Q6)',
      chartLabel: 'Privacy',
      severity: (c.completenessPct ?? 100) < 80 ? 'medium' : 'low',
      required: false,
      attested: p.healthcare || p.saas ? 'CPO / equivalent named; annual training attested' : 'Privacy policy attested',
      detected: (c.completenessPct ?? 100) < 80
        ? 'Questionnaire incomplete — Q6 not fully answered'
        : 'No contradiction extracted on Q6 a–f',
      summary:
        (c.completenessPct ?? 100) < 80
          ? 'Privacy-control answers are incomplete on the application.'
          : 'Written privacy program represented (Q6).',
      detail:
        'Q6 covers CPO (or equivalent), attorney-reviewed privacy policy, data classification, retention/destruction, annual training, and job-function access. Gaps here raise exposure factor but are not the hard ineligible-class rule.',
      suggested: (c.completenessPct ?? 100) < 80 ? 'escalate' : 'approve',
      likelihoodPct: (c.completenessPct ?? 100) < 80 ? 32 : 14,
      impactUsd: Math.round(p.recordsMidpoint * 40),
      exposureWeight: (c.completenessPct ?? 100) < 80 ? 42 : 20,
    }),
  )

  findings.push(
    finding( network, {
      id: `${c.id}-triage-mfa`,
      ruleId: 'CTRL-MFA-Q7',
      title: 'MFA for admin, remote access, and email (Q7h–j)',
      chartLabel: 'MFA floor',
      severity: p.mfaGap ? 'high' : 'low',
      required: true,
      attested:
        c.formSignals.find((s) => s.label.toLowerCase().includes('mfa'))?.answer ?? 'Not extracted',
      detected:
        c.formSignals.find((s) => s.label.toLowerCase().includes('mfa'))?.signal ??
        'No ASM contradiction extracted',
      summary: p.mfaGap
        ? 'Q7h–j MFA floor is open or contradicted — do not straight-through.'
        : 'MFA for privileged, remote, and email access is represented.',
      detail:
        'Q7 asks Yes/No/N/A for MFA on administrative or privileged access, remote access to systems holding private data in bulk, and remote access to email, plus VPN-limited remote access (Q7k). A No or attest-vs-signal contradiction is a coverage-floor escalate, independent of the ineligible-organization list.',
      suggested: p.mfaGap ? 'escalate' : 'approve',
      likelihoodPct: p.mfaGap ? 62 : 22,
      impactUsd: Math.round(c.revenueUsd * 0.018),
      exposureWeight: p.mfaGap ? 82 : 30,
    }),
  )

  findings.push(
    finding( network, {
      id: `${c.id}-triage-backup`,
      ruleId: 'CTRL-BACKUP-Q7L',
      title: 'Backup and recovery — automated and tested annually (Q7l)',
      chartLabel: 'Backups',
      severity: p.backupWeak ? 'medium' : 'low',
      required: p.backupWeak,
      attested:
        c.formSignals.find((s) => s.label.toLowerCase().includes('backup'))?.answer ?? 'Not extracted',
      detected:
        c.formSignals.find((s) => s.label.toLowerCase().includes('backup'))?.signal ??
        'No backup contradiction extracted',
      summary: p.backupWeak
        ? 'Backup procedures are incomplete, untested, or evidence is missing.'
        : 'Backups are automated and restore-tested per Q7l.',
      detail:
        'Q7l asks whether backup and recovery procedures exist for important business and customer data, whether they are automated, and whether they are tested annually. Missing Yes answers increase ransomware ARO and BI SLE (via Q13 restoration time).',
      suggested: p.backupWeak ? 'escalate' : 'approve',
      likelihoodPct: p.backupWeak ? 44 : 16,
      impactUsd: Math.round(c.revenueUsd * 0.022),
      exposureWeight: p.backupWeak ? 60 : 24,
    }),
  )

  findings.push(
    finding( payment, {
      id: `${c.id}-triage-pci`,
      ruleId: 'PCI-Q8',
      title: 'PCI-DSS (credit / debit card data)',
      chartLabel: 'PCI-DSS',
      severity: p.cardData && p.pciCompliant === false ? 'high' : 'low',
      required: p.cardData,
      attested: p.cardData
        ? p.pciCompliant
          ? 'Handles card data; in-transit encryption and at-rest encrypt/tokenize attested'
          : 'Handles credit or debit card data — PCI-DSS answers incomplete or No'
        : 'Does not collect, process, store, or transmit credit or debit card data — section N/A',
      detected: p.cardData
        ? p.pciCompliant === false
          ? 'PCI-DSS answers not decision-ready; card data is in inventory'
          : 'No extracted contradiction on in-transit encryption, tokenization, or EMV'
        : 'PCI-DSS skipped — no card data in inventory',
      summary: !p.cardData
        ? 'Section not required — no credit or debit card data.'
        : p.pciCompliant
          ? 'PCI-DSS controls represented.'
          : 'Card data present without a complete PCI-DSS story — escalate.',
      detail:
        'Complete PCI-DSS only if the applicant collects, processes, stores, or transmits credit or debit card data. Questions cover encryption while data moves, encrypt/tokenize at rest so raw card numbers are not in clear text, and EMV for card-present. A No on a cardholder environment is a floor, not a documentation footnote.',
      suggested: p.cardData && p.pciCompliant === false ? 'escalate' : 'approve',
      likelihoodPct: p.cardData && p.pciCompliant === false ? 52 : 12,
      impactUsd: p.cardData ? Math.round(p.recordsMidpoint * 180 * p.encryptionEf) : 0,
      exposureWeight: p.cardData && p.pciCompliant === false ? 70 : 16,
    }),
  )

  findings.push(
    finding( content, {
      id: `${c.id}-triage-media`,
      ruleId: 'MEDIA-Q9-10',
      title: 'Intellectual property and content procedures (Q9–10)',
      chartLabel: 'Content',
      severity: 'low',
      required: false,
      attested: 'Communications And Media Liability Coverage is not requested',
      detected: 'Content-liability questions not used for bind on this submission',
      summary: 'Media coverage not requested — Ignore unless the broker adds Media limits.',
      detail:
        'Q9–10 apply when Communications and Media Liability is sought (IP program; procedures to avoid infringing content, take down offensive material, and respond to libel / privacy allegations). If the box “coverage is not requested” is checked, typical desk action is Ignore.',
      suggested: 'ignore',
      likelihoodPct: 6,
      impactUsd: Math.round(c.limitRequestedUsd * 0.05),
      exposureWeight: 10,
    }),
  )

  findings.push(
    finding( bc, {
      id: `${c.id}-triage-ir`,
      ruleId: 'IR-DR-Q11-13',
      title: 'DR / BCP, incident response, and restoration time (Q11–13)',
      chartLabel: 'RTO / IR',
      severity: !p.irTested ? 'medium' : 'low',
      required: !p.irTested,
      attested: p.irTested
        ? 'DR/BCP and IR plans attested; tested with deficiencies remediated'
        : `DR/BCP or IR testing incomplete · Q13 restoration time: ${p.rtoBand}`,
      detected: `Modeled RTO ${p.rtoHours} hours (${p.rtoBand})`,
      summary: p.irTested
        ? `Plans tested; restoration time ${p.rtoBand}.`
        : `Untested or unknown restoration time (${p.rtoBand}) loads business-interruption ALE.`,
      detail:
        'Q11 asks for a disaster recovery / business continuity plan for computer-system disruption and an incident-response plan for network intrusion. Q12 asks whether plans are tested regularly with critical deficiencies remediated. Q13 restoration bands (Unknown, 0–12 hours, 12–24 hours, more than 24 hours) feed BI SLE as revenue × (hours / 8,760) × critical-ops share.',
      suggested: p.irTested ? 'approve' : 'escalate',
      likelihoodPct: p.irTested ? 18 : 40,
      impactUsd: Math.round(c.revenueUsd * (p.rtoHours / 8760) * 0.55),
      exposureWeight: p.irTested ? 26 : 58,
    }),
  )

  findings.push(
    finding( vendor, {
      id: `${c.id}-triage-vendor`,
      ruleId: 'VENDOR-Q14',
      title: 'Vendor information-security policy and access review (Q14)',
      chartLabel: 'Vendors',
      severity: (c.completenessPct ?? 100) < 80 ? 'medium' : 'low',
      required: false,
      attested:
        c.formSignals.find((s) => s.label.toLowerCase().includes('vendor'))?.answer ??
        'Written vendor info-sec controls attested',
      detected:
        (c.completenessPct ?? 100) < 80
          ? 'Vendor-control answers incomplete'
          : 'Periodic access-rights review represented',
      summary:
        (c.completenessPct ?? 100) < 80
          ? 'Q14 vendor controls are not fully answered.'
          : 'Written vendor security policy and periodic access review attested.',
      detail:
        'Q14 applies to vendors with access to computer systems or confidential information: written policies specifying vendor information-security controls, and periodic review of vendor access rights. Missing Yes answers raise third-party ARO but are not the ineligible-class rule.',
      suggested: (c.completenessPct ?? 100) < 80 ? 'escalate' : 'approve',
      likelihoodPct: (c.completenessPct ?? 100) < 80 ? 28 : 14,
      impactUsd: Math.round(c.revenueUsd * 0.008),
      exposureWeight: (c.completenessPct ?? 100) < 80 ? 40 : 22,
    }),
  )

  findings.push(
    finding( outsourced, {
      id: `${c.id}-triage-outsourced`,
      ruleId: 'OUTSOURCE-Q15',
      title: 'Outsourced services and alternative processing (Q15)',
      chartLabel: 'Outsourcing',
      severity: p.retail && p.backupWeak ? 'medium' : 'low',
      required: false,
      attested: p.retail
        ? 'Payment processing outsourced · alternative card processing not confirmed'
        : 'Data backup / IT infrastructure / hosting disclosed',
      detected: p.retail && p.backupWeak
        ? 'No alternative means of processing card data on failure (Q15 payment follow-up)'
        : 'Alternative solution for hosting / infrastructure outage represented',
      summary:
        p.retail && p.backupWeak
          ? 'Payment processing is outsourced without a documented fallback.'
          : 'Outsourced-service grid does not show an unmitigated single point of failure.',
      detail:
        'Q15 is a Yes/No/N/A grid (data backup, payment processing, data-center hosting, physical security, IT infrastructure, software development, IT security, customer marketing, web hosting, data processing) plus impact / alternative-solution follow-ups for hosting, infrastructure, and payments.',
      suggested: p.retail && p.backupWeak ? 'escalate' : 'approve',
      likelihoodPct: p.retail && p.backupWeak ? 34 : 12,
      impactUsd: Math.round(c.revenueUsd * 0.01),
      exposureWeight: p.retail && p.backupWeak ? 46 : 18,
    }),
  )

  findings.push(
    finding( loss, {
      id: `${c.id}-triage-loss`,
      ruleId: 'LOSS-Q16-17',
      title: 'Prior incidents and known circumstances (Q16–17)',
      chartLabel: 'Loss history',
      severity: p.lossYes ? 'high' : 'low',
      required: true,
      attested: p.lossYes
        ? 'Q16 or Q17 is Yes, incomplete, or not decision-ready'
        : 'Q16 No — no disruption, breach, extortion, or privacy claim in the past three years; Q17 No',
      detected: p.lossYes
        ? 'Package does not support a clean no-loss / no-circumstance representation'
        : 'No paid cyber losses extracted from loss runs',
      summary: p.lossYes
        ? 'Adverse or incomplete loss answers — attach details or escalate.'
        : 'Clean three-year loss and circumstance answers.',
      detail:
        'Q16 asks whether, in the past three years, the applicant had network/system disruption, a data breach, an extortion demand, or complaints/claims/litigation involving privacy, identity theft, DoS, virus, or third-party network damage. Q17 asks if anyone proposed for insurance is aware of a circumstance that could give rise to a CyberRisk claim. Yes on either requires attached costs, losses, and corrective procedures — typical desk action is Escalate, not Ignore.',
      suggested: p.lossYes ? 'escalate' : 'approve',
      likelihoodPct: p.lossYes ? 48 : 11,
      impactUsd: Math.round(c.revenueUsd * 0.01),
      exposureWeight: p.lossYes ? 56 : 18,
    }),
  )

  findings.push(
    finding( insTerms, {
      id: `${c.id}-triage-ins-terms`,
      ruleId: 'TERMS-TABLE',
      title: 'Insuring-agreement limits and retentions',
      chartLabel: 'Sublimits',
      severity: 'low',
      required: false,
      attested: `Privacy & Security ${moneyShort(c.limitRequestedUsd)} · Extortion / BI / Social Engineering scheduled`,
      detected: 'Table used as impact inputs for ALE vs aggregate (Q18)',
      summary: 'Requested insuring-agreement limits feed coverage-adequacy, not eligibility.',
      detail:
        'The requested-insurance-terms table (Privacy and Security, Media, Regulatory Proceedings, Privacy Breach Notification, Computer and Legal Experts, Betterment, Cyber Extortion, Data Restoration, Public Relations, Computer Fraud, Funds Transfer Fraud, Social Engineering Fraud, plus Business Interruption, Dependent Business Interruption, Reputation Harm, Telecom Fraud) supplies Limit $ and Retention $ for each agreement. They are scoring inputs, not the ineligible-organization rule.',
      suggested: 'ignore',
      likelihoodPct: 10,
      impactUsd: c.limitRequestedUsd,
      exposureWeight: 22,
    }),
  )

  const highLimitPhi = p.healthcare && c.limitRequestedUsd >= 5_000_000
  findings.push(
    finding( reqTerms, {
      id: `${c.id}-triage-aggregate`,
      ruleId: 'TERMS-Q18',
      title: 'Aggregate limit and effective date (Q18)',
      chartLabel: 'Aggregate limit',
      severity: highLimitPhi ? 'medium' : 'low',
      required: highLimitPhi,
      attested: `Aggregate limit requested ${moneyShort(c.limitRequestedUsd)}`,
      detected: highLimitPhi
        ? 'Healthcare PHI + aggregate ≥ $5M — senior review of limit vs modeled SLE'
        : 'Aggregate is inside the mid-market band for this sector on size alone',
      summary: highLimitPhi
        ? 'High aggregate on a PHI inventory — confirm limit vs ALE before Getting Ready to Quote.'
        : 'Requested aggregate is the cap used on the coverage-adequacy chart.',
      detail:
        'Q18 is Aggregate Limit Requested and Effective Date Requested. Coverage adequacy compares this aggregate to the stacked worst-case (privacy SLE + extortion + BI). It does not override an ineligible-organization match.',
      suggested: highLimitPhi ? 'escalate' : 'approve',
      likelihoodPct: highLimitPhi ? 30 : 12,
      impactUsd: c.limitRequestedUsd,
      exposureWeight: highLimitPhi ? 50 : 20,
    }),
  )

  findings.push(
    finding( current, {
      id: `${c.id}-triage-current`,
      ruleId: 'COVER-Q19',
      title: 'Currently purchased CyberRisk coverage (Q19)',
      chartLabel: 'Expiring',
      severity: 'low',
      required: false,
      attested:
        (c.completenessPct ?? 100) < 80
          ? 'Current coverage not fully disclosed'
          : 'Yes — expiring carrier / limit / first-purchased date extracted',
      detected:
        (c.completenessPct ?? 100) < 80
          ? 'Q19 incomplete'
          : `Expiring limit used as a reasonability check vs ${moneyShort(c.limitRequestedUsd)} requested`,
      summary:
        (c.completenessPct ?? 100) < 80
          ? 'Current-coverage answers are incomplete.'
          : 'Incumbent placement is documented; not a bind gate.',
      detail:
        'Q19 asks whether the applicant currently purchases CyberRisk coverage; if Yes: expiring carrier, expiring limit, and date coverage was first purchased. Typical desk action is Approve or Ignore unless the requested aggregate is a large step-up from expiring with weaker controls.',
      suggested: (c.completenessPct ?? 100) < 80 ? 'escalate' : 'ignore',
      likelihoodPct: 8,
      impactUsd: Math.round(c.limitRequestedUsd * 0.1),
      exposureWeight: 12,
    }),
  )

  return findings
}

export function requiredTriageIds(findings: TriageFinding[]): string[] {
  return findings.filter((f) => f.required).map((f) => f.id)
}

export function fieldKey(sectionId: string, label: string): string {
  return `${sectionId}::${label}`
}

const FAIL_RE =
  /no \/ contradicted|incomplete|not answered|not decision-ready|not attested|not clearly no|partial|gap on|legacy|exposed rdp|yes \/ incomplete/i

function fieldFloor(label: string, value: string): string {
  if (/^n\/a/i.test(value) || /not subject/i.test(value) || /coverage is not requested/i.test(value) || /skip q8/i.test(value)) {
    return 'N/A'
  }
  if (/aggregate limit/i.test(label)) return 'Aggregate within sector appetite'
  if (/unique individuals/i.test(label)) return 'Record count disclosed'
  if (/retention/i.test(label)) return 'Retention disclosed'
  if (/effective date/i.test(label)) return 'Inception date set'
  if (/limit/i.test(label) && !/expiring/i.test(label)) return 'Scheduled on requested terms'
  if (/restoration time/i.test(label)) return '0–12 hours'
  if (/q16|q17/i.test(label)) return 'No'
  if (/encryption/i.test(label)) return 'Encrypted in all five states (Q3 a–e)'
  return 'Yes'
}

export function isAnswerSigned(c: Pick<CyberCase, 'packageSignOff'>, key: string): boolean {
  const signed = new Set(c.packageSignOff?.signedAnswerKeys ?? [])
  return signed.has('*') || signed.has(key)
}

export function answersSignedForCase(c: Pick<CyberCase, 'packageSignOff'> & Partial<CyberCase>, keys: string[]): boolean {
  const signed = new Set(c.packageSignOff?.signedAnswerKeys ?? [])
  if (signed.has('*')) return true
  return keys.length > 0 && keys.every((k) => signed.has(k))
}

function decorateSectionFields(c: CyberCase, sectionId: string, fields: SectionField[]): SectionField[] {
  return fields.map((f) => {
    const key = fieldKey(sectionId, f.label)
    const override = c.answerOverrides?.[key]
    const attested = override ?? f.attested ?? f.value
    const value = override ?? f.value
    const failsTriage = Boolean(f.signal) || FAIL_RE.test(value)
    return {
      ...f,
      key,
      attested,
      value,
      floor: f.floor ?? fieldFloor(f.label, value),
      failsTriage,
    }
  })
}

export function allAnswerKeysForCase(c: CyberCase): string[] {
  return APP_SECTIONS.flatMap((section) =>
    fieldsForSection(c, section.id).map((f) => f.key ?? fieldKey(section.id, f.label)),
  )
}

export function fieldsForSection(c: CyberCase, sectionId: string): SectionField[] {
  return decorateSectionFields(c, sectionId, fieldsForSectionRaw(c, sectionId))
}

function fieldsForSectionRaw(c: CyberCase, sectionId: string): SectionField[] {
  const p = applicationPosture(c)
  const mfa = c.formSignals.find((s) => s.label.toLowerCase().includes('mfa'))
  const edr = c.formSignals.find((s) => s.label.toLowerCase().includes('edr'))
  const backup = c.formSignals.find((s) => s.label.toLowerCase().includes('backup'))
  const vendors = c.formSignals.find((s) => s.label.toLowerCase().includes('vendor'))
  const incomplete = (c.completenessPct ?? 100) < 80

  switch (sectionId) {
    case 'data_inventory':
      return [
        {
          label: 'Q1a Credit / debit card data',
          attested: p.cardData ? yn(true) : yn(false),
          value: p.cardData ? yn(true) : yn(false),
          signal: p.cardData
            ? `PCI-DSS ${p.pciCompliant ? 'Yes' : 'Not decision-ready'} · volume from Q2 band`
            : undefined,
        },
        { label: 'Q1b Medical information (non-employee)', value: yn(p.healthcare) },
        { label: 'Q1c Non-employee SSNs', value: yn(p.healthcare || p.retail) },
        { label: 'Q1d Employee / HR information', value: 'Yes' },
        { label: 'Q2 Unique individuals (records)', value: p.recordsBand },
        { label: 'Q3 Encryption (at rest / transit / mobile / BYOD / third party)', value: p.encryptionNote },
        {
          label: 'Q4 HIPAA',
          value: p.hipaaApplies ? 'Healthcare entity — Yes; compliance attested' : 'N/A',
        },
        {
          label: 'Q5 GDPR',
          value: p.gdprApplies ? 'Subject to GDPR — compliance attested' : 'Not subject / N/A',
        },
      ]
    case 'privacy_controls':
      return [
        { label: 'Q6a Chief Privacy Officer (or equivalent)', value: p.healthcare || p.saas ? 'Yes' : incomplete ? 'Not answered' : 'Yes' },
        { label: 'Q6b Public privacy policy reviewed by counsel', value: incomplete ? 'Not answered' : 'Yes' },
        { label: 'Q6c Data classification and inventory', value: incomplete ? 'Not answered' : 'Yes' },
        { label: 'Q6d Retention, destruction, recordkeeping', value: incomplete ? 'Not answered' : 'Yes' },
        { label: 'Q6e Annual privacy / security training', value: incomplete ? 'Not answered' : 'Yes' },
        { label: 'Q6f Restricted access by job function', value: incomplete ? 'Not answered' : 'Yes' },
      ]
    case 'network_security':
      return [
        { label: 'Q7a CISO (or equivalent)', value: p.saas || p.healthcare ? 'Yes' : incomplete ? 'Not answered' : 'Yes' },
        { label: 'Q7b Active firewall', value: 'Yes' },
        {
          label: 'Q7c Anti-virus / EDR across devices',
          attested: edr?.answer ?? 'Yes',
          value: edr?.answer ?? (p.edrGap ? 'Antivirus only' : 'Yes'),
          signal: edr?.signal,
        },
        {
          label: 'Q7d Patch management (automated / critical ≤ 30 days)',
          attested: 'Yes',
          value: p.edrGap || incomplete ? 'Partial' : 'Yes',
        },
        { label: 'Q7e–g IDS / IPS / DLP', value: p.saas || p.healthcare ? 'Yes / Yes / Yes' : 'Yes / No / No' },
        {
          label: 'Q7h MFA for administrative or privileged access',
          attested: mfa?.answer ?? 'Yes',
          value: p.mfaGap ? 'No / contradicted' : 'Yes',
          signal: mfa?.signal,
        },
        {
          label: 'Q7i MFA for remote access to systems with bulk sensitive data',
          attested: 'Yes',
          value: p.mfaGap ? 'No / contradicted' : 'Yes',
        },
        {
          label: 'Q7j MFA for remote access to email',
          attested: mfa?.answer ?? 'Yes',
          value: mfa?.answer ?? (p.mfaGap ? 'Gap on mail protocols' : 'Yes'),
          signal: mfa?.signal,
        },
        {
          label: 'Q7k Remote access limited to VPN',
          attested: 'Yes',
          value: p.mfaGap ? 'No — exposed RDP / legacy auth' : 'Yes',
        },
        {
          label: 'Q7l Backup and recovery (automated · tested annually)',
          attested: backup?.answer ?? 'Yes',
          value: backup?.answer ?? (p.backupWeak ? 'Incomplete' : 'Yes'),
          signal: backup?.signal,
        },
        { label: 'Q7m–n Annual pentest / security assessment (third party)', value: p.saas || p.healthcare ? 'Yes' : incomplete ? 'Not answered' : 'Yes' },
        { label: 'Q7o–q Logs, password complexity, joiner-mover-leaver', value: incomplete ? 'Not answered' : 'Yes' },
      ]
    case 'payment_card':
      if (!p.cardData) {
        return [
          {
            label:
              'Does the applicant collect, process, store, or transmit credit or debit card data?',
            value: 'No — PCI-DSS not applicable',
          },
        ]
      }
      return [
        {
          label:
            'Does the applicant collect, process, store, or transmit credit or debit card data?',
          value: 'Yes',
        },
        {
          label:
            'While card data moves, is it encrypted the whole way (end-to-end or point-to-point)?',
          value: p.pciCompliant ? 'Yes' : 'Not answered / No',
        },
        {
          label:
            'At rest, is card data encrypted or tokenized so raw card numbers are not sitting in clear text?',
          value: p.pciCompliant ? 'Yes' : 'Not answered / No',
        },
        {
          label: 'If they take cards in person, are the terminals EMV-capable?',
          value: p.retail ? (p.pciCompliant ? 'Yes' : 'Not answered') : 'N/A — not card-present',
        },
      ]
    case 'content_liability':
      return [
        { label: 'Communications and Media Liability', value: 'Coverage is not requested' },
        { label: 'Q9 Written IP-rights program', value: 'N/A' },
        { label: 'Q10a–c Infringing / offensive content and complaint response', value: 'N/A' },
      ]
    case 'bc_dr_ir':
      return [
        { label: 'Q11a Disaster recovery / BCP for system disruption', attested: 'Yes', value: p.irTested ? 'Yes' : 'Incomplete / untested' },
        { label: 'Q11b Incident-response plan for network intrusion', attested: 'Yes', value: p.irTested ? 'Yes' : p.backupWeak ? 'Not attested' : 'Yes' },
        { label: 'Q12 Plans tested; deficiencies remediated', attested: p.irTested ? 'Yes' : 'No', value: p.irTested ? 'Yes' : 'No / N/A' },
        { label: 'Q13 Time to restore critical operations', value: p.rtoBand },
      ]
    case 'vendor_controls':
      return [
        { label: 'Q14a Written vendor information-security controls', value: incomplete ? 'Not answered' : 'Yes' },
        { label: 'Q14b Periodic review of vendor access rights', value: incomplete ? 'Not answered' : 'Yes' },
        { label: 'Named vendors (application)', value: vendors?.answer ?? 'See outsourced grid' },
      ]
    case 'outsourced_services':
      return [
        { label: 'Data backup', value: p.backupWeak ? 'Yes — provider not evidenced' : 'Yes' },
        { label: 'Payment processing', value: p.retail || p.healthcare ? 'Yes' : 'No' },
        { label: 'Data-center hosting / IT infrastructure', value: 'Yes' },
        { label: 'IT security', value: p.saas || p.healthcare ? 'Yes' : 'No' },
        { label: 'Web hosting / data processing', value: p.saas ? 'Yes' : 'No' },
        {
          label: 'Hosting outage — alternative solution',
          value: incomplete ? 'Not answered' : 'Documented failover',
        },
        {
          label: 'Payment processing — alternative means',
          value: p.retail ? (p.backupWeak ? 'No' : 'Yes') : 'N/A',
        },
      ]
    case 'loss_information':
      return [
        {
          label: 'Q16 Disruption, breach, extortion, or privacy claim (3 years)',
          attested: p.lossYes ? 'Yes' : 'No',
          value: p.lossYes ? 'Yes / incomplete' : 'No',
        },
        {
          label: 'Q17 Aware of circumstance that could give rise to a claim',
          attested: p.lossYes ? 'Yes' : 'No',
          value: p.lossYes ? 'Not clearly No' : 'No',
        },
        {
          label: 'If Yes — costs, losses, corrective procedures',
          value: p.lossYes ? 'Required attachment missing or incomplete' : 'N/A',
        },
      ]
    case 'requested_insurance_terms':
      return [
        { label: 'Privacy and Security — limit', value: moneyShort(c.limitRequestedUsd) },
        { label: 'Cyber Extortion — limit', value: moneyShort(Math.round(c.limitRequestedUsd * 0.15)) },
        { label: 'Business Interruption — limit', value: moneyShort(Math.round(c.limitRequestedUsd * 0.25)) },
        { label: 'Dependent Business Interruption — limit', value: moneyShort(Math.round(c.limitRequestedUsd * 0.1)) },
        { label: 'Social Engineering Fraud — limit', value: moneyShort(Math.round(c.limitRequestedUsd * 0.05)) },
        { label: 'Telecom Fraud / Reputation Harm', value: moneyShort(Math.round(c.limitRequestedUsd * 0.05)) },
        { label: 'Retention requested (each agreement)', value: '$100,000' },
      ]
    case 'requested_terms': {
      const start = c.policyStartAt?.trim() || c.receivedAt.slice(0, 10)
      const end =
        c.policyEndAt?.trim() ||
        (() => {
          const d = new Date(start.length <= 10 ? `${start}T12:00:00` : start)
          if (Number.isNaN(d.getTime())) return '—'
          d.setFullYear(d.getFullYear() + 1)
          return d.toISOString().slice(0, 10)
        })()
      return [
        { label: 'Q18 Aggregate limit requested', value: moneyShort(c.limitRequestedUsd) },
        { label: 'Q18 Effective date requested', value: start.slice(0, 10) },
        { label: 'Proposed end date', value: end.slice(0, 10) },
      ]
    }
    case 'current_coverage':
      return [
        { label: 'Q19 Currently purchase CyberRisk coverage', value: incomplete ? 'Not answered' : 'Yes' },
        { label: 'Expiring carrier', value: incomplete ? '—' : c.broker },
        { label: 'Expiring limit', value: incomplete ? '—' : moneyShort(Math.round(c.limitRequestedUsd * 0.8)) },
        { label: 'Date coverage first purchased', value: incomplete ? '—' : '2019' },
      ]
    default:
      return [{ label: 'Named insured', value: c.insured }]
  }
}

export function sectionReportsForCase(c: CyberCase): SectionReport[] {
  const findings = triageFindingsForCase(c)
  const posture = applicationPosture(c)
  return APP_SECTIONS.filter((section) => {
    if (section.id === 'content_liability' && !/media|publish|advertis/i.test(c.sector)) {
      return false
    }
    if (section.id === 'payment_card' && !posture.cardData) {
      // Still include — fields collapse to a single N/A row for clarity.
      return true
    }
    return true
  }).map((section) => ({
    section,
    fields: fieldsForSection(c, section.id),
    findings: findings.filter((f) => f.sourceSectionId === section.id),
  }))
}

export function riskSectionReportsForCase(c: CyberCase): SectionReport[] {
  const byId = new Map(sectionReportsForCase(c).map((r) => [r.section.id, r]))
  return RISK_REVIEW_SECTION_IDS.map((id) => byId.get(id)).filter(
    (r): r is SectionReport => Boolean(r),
  )
}

/** @deprecated Use sectionReportsForCase */
export function documentReportsForCase(c: CyberCase): DocReport[] {
  return sectionReportsForCase(c).map((r) => ({
    ...r,
    doc: {
      id: r.section.id,
      name: r.section.title,
      kind: `Q${r.section.questions}`,
    },
  }))
}

export function fieldsForDoc(c: CyberCase, doc: PackageDoc): SectionField[] {
  const match = APP_SECTIONS.find((s) => s.id === doc.id || s.title === doc.name)
  if (match) return fieldsForSection(c, match.id)
  return [
    { label: 'Document', value: doc.name },
    { label: 'Kind', value: doc.kind },
    { label: 'Named insured', value: c.insured },
  ]
}

export function triageSeverityOf(severity: GapSeverity | string): 'high' | 'medium' | 'low' {
  if (severity === 'critical' || severity === 'high') return 'high'
  if (severity === 'medium') return 'medium'
  return 'low'
}
