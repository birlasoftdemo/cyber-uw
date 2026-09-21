import { inferBucketFromControl } from '../constants/qualificationBuckets'
import type { ControlGap, CyberCase, CyberTier } from '../types'
import { defaultFormSignals, packageDocsFromNames } from './dossierPackage'
import { buildPlatformCards } from './platformDemo'
import { CYBER_PRODUCT_DEFAULTS } from './productIdentity'

/** Full-dossier package used by Mail MCP rich ingest (Brightcare). */
export const DEMO_INGEST_PACKAGE = {
  insured: 'Brightcare Digital Health',
  broker: 'Marsh Specialty',
  sector: 'Healthcare',
  limitRequestedUsd: 5_000_000,
  files: [
    'Brightcare_Cyber_Application_2026.pdf',
    'Brightcare_Architecture.pdf',
    'Brightcare_SOC2_TypeII.pdf',
    'Brightcare_Incident_Response_Plan.pdf',
    'Brightcare_DR_Drill_report.pdf',
    'Brightcare_ISO27001_report.pdf',
    'Brightcare_HIPAA_compliance_cert.pdf',
  ],
} as const

function gap(
  partial: Omit<ControlGap, 'qualificationBucket'> & { qualificationBucket?: ControlGap['qualificationBucket'] },
): ControlGap {
  return {
    ...partial,
    qualificationBucket: partial.qualificationBucket ?? inferBucketFromControl(partial.control),
  }
}

/** Builds a quote-leaning case that lands on Policy Documents (open material gap). */
export function buildDemoIngestedCase(id: string, now: string): CyberCase {
  const vendors = [
    {
      vendor: 'Microsoft 365',
      category: 'SaaS / Identity',
      bookCount: 41,
      limitHint: 'Watch IdP concentration',
    },
    {
      vendor: 'AWS',
      category: 'Cloud',
      bookCount: 28,
      limitHint: 'Within treaty soft cap',
    },
    {
      vendor: 'CrowdStrike',
      category: 'Endpoint detection and response',
      bookCount: 19,
      limitHint: 'OK',
    },
  ]

  return {
    id,
    insured: DEMO_INGEST_PACKAGE.insured,
    broker: DEMO_INGEST_PACKAGE.broker,
    sector: DEMO_INGEST_PACKAGE.sector,
    insuredAddress: '500 Healthcloud Pkwy, Boston, MA 02110',
    ...CYBER_PRODUCT_DEFAULTS,
    productCode: 'CYB-LIAB-HC',
    productName: 'Cyber Liability — Healthcare',
    revenueUsd: 128_000_000,
    limitRequestedUsd: DEMO_INGEST_PACKAGE.limitRequestedUsd,
    receivedAt: now,
    policyStartAt: now.slice(0, 10),
    policyEndAt: new Date(new Date(now).setFullYear(new Date(now).getFullYear() + 1))
      .toISOString()
      .slice(0, 10),
    completenessPct: 96,
    tier: 2 as CyberTier,
    recommendation: 'quote',
    decision: 'pending',
    submissionKind: 'new_business',
    signalScore: 84,
    signalStatus: 'ready',
    pasStatus: 'idle',
    workflowStage: 0,
    riskJudgments: {},
    packageDocs: packageDocsFromNames(id, [...DEMO_INGEST_PACKAGE.files]),
    formSignals: defaultFormSignals(id, {
      insured: DEMO_INGEST_PACKAGE.insured,
      sector: DEMO_INGEST_PACKAGE.sector,
      limitUsd: DEMO_INGEST_PACKAGE.limitRequestedUsd,
      mfaAnswer: 'Okta MFA enforced — all privileged + VPN',
      mfaSignal: 'Legacy VPN path without MFA challenge on one regional gateway',
      mfaGapId: `${id}-g1`,
      edrAnswer: 'CrowdStrike Falcon — 98% endpoints / 100% servers',
      edrSignal: 'Telemetry coverage aligned with attestation',
      edrGapId: `${id}-g2`,
      backupAnswer: 'Daily immutable; restore test 2026-06-12',
      backupSignal: 'Evidence PDF attached — within 90 days',
      vendorsAnswer: 'Microsoft 365, AWS, CrowdStrike',
    }),
    gaps: [
      gap({
        id: `${id}-g1`,
        control: 'MFA on external admin',
        attested: 'Okta MFA enforced — all privileged + VPN',
        signal: 'Legacy VPN path without MFA challenge on one regional gateway',
        severity: 'high',
        rfiDraft:
          'Confirm MFA on all VPN / remote admin paths, or attach compensating control evidence and remediation plan.',
        disposition: 'open',
      }),
      gap({
        id: `${id}-g2`,
        control: 'Endpoint detection and response (EDR) coverage',
        attested: 'CrowdStrike Falcon — 98% endpoints / 100% servers',
        signal: 'Telemetry coverage aligned with attestation',
        severity: 'info',
        rfiDraft: '',
        disposition: 'open',
      }),
      gap({
        id: `${id}-g3`,
        control: 'Immutable / tested backups',
        attested: 'Daily immutable; restore test 2026-06-12',
        signal: 'Evidence PDF attached — within 90 days',
        severity: 'info',
        rfiDraft: '',
        disposition: 'open',
      }),
    ],
    appetiteHits: [
      {
        ruleId: 'APP-HC-01',
        label: 'Healthcare ≤ $5M within band when Tier ≤ 3',
        outcome: 'pass',
        detail: 'Tier 2 with sector and limit inside appetite band.',
      },
      {
        ruleId: 'CTRL-MFA-01',
        label: 'MFA floor on remote admin',
        outcome: 'refer',
        detail: 'Open high gap on VPN MFA — verify before straight-through quote.',
      },
      {
        ruleId: 'CTRL-FLOOR-01',
        label: 'EDR and backup floors',
        outcome: 'pass',
        detail: 'EDR and backup attestation align with signal.',
      },
    ],
    vendors,
    platformCards: buildPlatformCards(id, vendors, DEMO_INGEST_PACKAGE.sector, DEMO_INGEST_PACKAGE.limitRequestedUsd),
    dossierSummary:
      'Brightcare Digital Health — mid-market healthcare SaaS. Strong EDR/backup evidence; open MFA gap on one remote path. AI recommends QUOTE at Tier 2 after Risk Analysis and Closure.',
    audit: [
      {
        at: now,
        actor: 'Intake Agent',
        action: `Package ingested — ${DEMO_INGEST_PACKAGE.files.join(', ')}`,
      },
      {
        at: now,
        actor: 'Signal Mock',
        action: 'ASM + control scan complete — field diffs ready',
      },
      {
        at: now,
        actor: 'Appetite Engine',
        action: 'Recommend QUOTE — APP-HC-01; MFA feedback open (CTRL-MFA-01)',
      },
    ],
  }
}
