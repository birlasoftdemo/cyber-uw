import { inferBucketFromControl } from '../constants/qualificationBuckets'
import type { ControlGap, CyberCase, CyberTier, ReferralTicket } from '../types'
import { defaultFormSignals, packageDocsFromNames } from './dossierPackage'
import { buildPlatformCards } from './platformDemo'
import { CYBER_PRODUCT_DEFAULTS } from './productIdentity'

/** Incomplete Ops-path package — Meridian Logistics. */
export const OPS_DEMO_INGEST_PACKAGE = {
  insured: 'Meridian Logistics',
  broker: 'Meridian Ops Desk',
  sector: 'Logistics',
  limitRequestedUsd: 7_500_000,
  files: [
    'Meridian_Partial_Cyber_App.pdf',
    'Meridian_Broker_cover_email.pdf',
  ],
} as const

function gap(
  partial: Omit<ControlGap, 'qualificationBucket'> & {
    qualificationBucket?: ControlGap['qualificationBucket']
  },
): ControlGap {
  return {
    ...partial,
    qualificationBucket: partial.qualificationBucket ?? inferBucketFromControl(partial.control),
  }
}

/** Incomplete case for Cyber Ops: stuck on Policy Documents, open EDR referral seed. */
export function buildOpsDemoIngestedCase(id: string, now: string): CyberCase {
  const vendors = [
    {
      vendor: 'Azure',
      category: 'Cloud',
      bookCount: 22,
      limitHint: 'Within soft cap',
    },
    {
      vendor: 'Okta',
      category: 'SaaS / Identity',
      bookCount: 35,
      limitHint: 'Watch IdP concentration',
    },
    {
      vendor: 'RegionalMSP Co',
      category: 'Managed service provider',
      bookCount: 7,
      limitHint: 'Elevated shared MSP risk',
    },
  ]

  return {
    id,
    insured: OPS_DEMO_INGEST_PACKAGE.insured,
    broker: OPS_DEMO_INGEST_PACKAGE.broker,
    sector: OPS_DEMO_INGEST_PACKAGE.sector,
    insuredAddress: '900 Freight Corridor, Newark, NJ 07102',
    ...CYBER_PRODUCT_DEFAULTS,
    productCode: 'CYB-LIAB-LOG',
    productName: 'Cyber Liability — Logistics',
    revenueUsd: 94_000_000,
    limitRequestedUsd: OPS_DEMO_INGEST_PACKAGE.limitRequestedUsd,
    receivedAt: now,
    policyStartAt: now.slice(0, 10),
    policyEndAt: new Date(new Date(now).setFullYear(new Date(now).getFullYear() + 1))
      .toISOString()
      .slice(0, 10),
    completenessPct: 65,
    tier: 4 as CyberTier,
    recommendation: 'refer',
    decision: 'pending',
    submissionKind: 'new_business',
    signalScore: 58,
    signalStatus: 'ready',
    pasStatus: 'idle',
    workflowStage: 0,
    riskJudgments: {},
    missingDocs: [
      'Architecture',
      'SOC report',
      'Incident Response Plan',
      'Disaster Recovery Drill report',
      'ISO report',
      'Compliance certifications',
    ],
    packageDocs: packageDocsFromNames(id, [...OPS_DEMO_INGEST_PACKAGE.files]),
    formSignals: defaultFormSignals(id, {
      insured: OPS_DEMO_INGEST_PACKAGE.insured,
      sector: OPS_DEMO_INGEST_PACKAGE.sector,
      limitUsd: OPS_DEMO_INGEST_PACKAGE.limitRequestedUsd,
      mfaAnswer: 'SSO MFA on email — VPN TBD',
      mfaSignal: 'Incomplete — VPN / remote admin path not attested',
      mfaGapId: `${id}-g1`,
      edrAnswer: 'Endpoint agent on most fleets',
      edrSignal: 'No console export attached; coverage unconfirmed',
      edrGapId: `${id}-g2`,
      backupAnswer: 'Daily backups — restore test pending IT',
      backupSignal: 'Restore-test attestation missing',
      vendorsAnswer: 'Azure, Okta, RegionalMSP Co',
    }),
    gaps: [
      gap({
        id: `${id}-g1`,
        control: 'MFA on external admin',
        attested: 'SSO MFA on email — VPN TBD',
        signal: 'Incomplete — VPN / remote admin path not attested',
        severity: 'high',
        rfiDraft:
          'Confirm MFA on VPN and remote admin. Package incomplete until broker returns attestation.',
        disposition: 'open',
      }),
      gap({
        id: `${id}-g2`,
        control: 'Endpoint detection and response (EDR) coverage',
        attested: 'Endpoint agent on most fleets',
        signal: 'No console export attached; coverage unconfirmed',
        severity: 'critical',
        rfiDraft: 'Attach EDR console export for servers and workstations.',
        disposition: 'referred',
        referredTo: 'Aon Cyber Desk — Broker',
        signedOffAt: now,
        signedOffBy: 'Ops',
      }),
      gap({
        id: `${id}-g3`,
        control: 'Immutable / tested backups',
        attested: 'Daily backups — restore test pending IT',
        signal: 'Restore-test attestation missing',
        severity: 'high',
        rfiDraft: 'Chase restore-test attestation dated within 90 days.',
        disposition: 'open',
      }),
    ],
    appetiteHits: [
      {
        ruleId: 'APP-LOG-01',
        label: 'Logistics + limit ≥ $5M requires Tier ≤ 3 or escalation',
        outcome: 'refer',
        detail: 'Incomplete package and Tier 4 — Ops chase before UW risk review.',
      },
      {
        ruleId: 'CTRL-EDR-01',
        label: 'EDR evidence floor',
        outcome: 'refer',
        detail: 'EDR referred to broker — awaiting console export.',
      },
    ],
    vendors,
    platformCards: buildPlatformCards(
      id,
      vendors,
      OPS_DEMO_INGEST_PACKAGE.sector,
      OPS_DEMO_INGEST_PACKAGE.limitRequestedUsd,
    ),
    dossierSummary:
      'Meridian Logistics — incomplete cyber package. Missing restore-test and VPN MFA; EDR referred to broker. Ops owns chase before Ready for UW.',
    audit: [
      {
        at: now,
        actor: 'Intake Agent',
        action: `Partial package ingested — ${OPS_DEMO_INGEST_PACKAGE.files.join(', ')}`,
      },
      {
        at: now,
        actor: 'Ops',
        action: 'EDR gap referred to broker desk — awaiting console export',
      },
    ],
  }
}

/** Seed referral ticket paired with Meridian EDR gap. */
export function buildOpsDemoReferral(caseId: string, now: string): ReferralTicket {
  return {
    id: `ref-ops-${caseId}`,
    caseId,
    kind: 'gap',
    sourceId: `${caseId}-g2`,
    sourceLabel: 'Endpoint detection and response (EDR) coverage',
    target: 'broker',
    assigneeLabel: 'Aon Cyber Desk — Broker',
    note: 'Need console export confirming EDR on servers + workstations. Package incomplete.',
    status: 'awaiting_broker',
    createdAt: now,
  }
}
