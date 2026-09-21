/** Actionable Review Risk demo — threats & impacts bucketed by qualification parameters. */

import type { QualificationBucketId } from '../constants/qualificationBuckets'
import type { RiskJudgmentStatus } from '../types'

export type ThreatExposure = 'critical' | 'elevated' | 'moderate' | 'low'

export interface RiskActionItem {
  id: string
  kind: 'threat' | 'impact'
  bucket: QualificationBucketId
  title: string
  severity: 'high' | 'medium' | 'low'
  summary: string
  detail: string
  /** Must be signed before leaving Review Risk */
  required: boolean
  /** Dossier crosswalk — form module / gap / platform cite */
  cite: string
}

export interface RiskReviewDemo {
  exposure: ThreatExposure
  summary: string
  threats: RiskActionItem[]
  impacts: RiskActionItem[]
}

export function requiredRiskItemIds(demo: RiskReviewDemo): string[] {
  return [...demo.threats, ...demo.impacts].filter((i) => i.required).map((i) => i.id)
}

/** Healthcare mid-market dossier walkthrough (Brightcare / Northwind). */
export const RISK_REVIEW_HEALTHCARE: RiskReviewDemo = {
  exposure: 'elevated',
  summary:
    'Residual threat is elevated: remote-access MFA gap against otherwise strong EDR and backup posture. Own each judgment in Risk Analysis.',
  threats: [
    {
      id: 'thr-mfa-vpn',
      kind: 'threat',
      bucket: 'controls_access',
      title: 'Ransomware initial access via VPN / remote admin',
      severity: 'high',
      summary: 'Legacy VPN path without MFA challenge elevates corporate ransomware probability.',
      detail:
        'Attest vs signal: Okta MFA claimed on privileged + VPN; mock ASM shows one regional gateway without MFA. Binary floor for remote admin.',
      required: true,
      cite: 'Form · Identity & access · MFA on external admin',
    },
    {
      id: 'thr-cred-priv',
      kind: 'threat',
      bucket: 'controls_access',
      title: 'Credential stuffing on privileged healthcare IT',
      severity: 'medium',
      summary: 'Privileged accounts remain high-value targets if MFA floor is soft.',
      detail: 'PHI systems amplify blast radius of any privileged compromise.',
      required: false,
      cite: 'Form · Identity & access',
    },
    {
      id: 'thr-bec-phi',
      kind: 'threat',
      bucket: 'ransomware_readiness',
      title: 'BEC leading to PHI exfiltration',
      severity: 'medium',
      summary: 'Email path is secondary; healthcare notification risk remains material.',
      detail: 'Mail MFA story is stronger than VPN; still a sector playbook item.',
      required: false,
      cite: 'Form · Firmographics · Healthcare sector',
    },
    {
      id: 'thr-idp-blast',
      kind: 'threat',
      bucket: 'third_party_ops',
      title: 'IdP concentration amplifying blast radius',
      severity: 'medium',
      summary: 'Shared IdP class correlates portfolio losses — own in Risk Analysis.',
      detail: 'Not an insured-specific decline; feed Platform Ignore / Block / Escalate.',
      required: true,
      cite: 'Platform · Shared identity provider · Form · Vendors',
    },
  ],
  impacts: [
    {
      id: 'imp-ransom-bi',
      kind: 'impact',
      bucket: 'ransomware_readiness',
      title: 'Ransomware · downtime & recovery',
      severity: 'high',
      summary: 'Remote MFA gap raises severity; EDR + tested backups lower recovery floor.',
      detail:
        'With CrowdStrike + immutable restore test, recovery path exists; PHI / care ops amplify BI cost.',
      required: true,
      cite: 'Form · Endpoint detection · Backup & recovery',
    },
    {
      id: 'imp-phi-reg',
      kind: 'impact',
      bucket: 'appetite_fit',
      title: 'Breach · PHI notification & regulatory',
      severity: 'high',
      summary: 'Healthcare sector: unauthorized ePHI access drives HIPAA / OCR exposure.',
      detail: 'Loss runs clean; first-party regulatory defense still elevated for healthcare Tier 2.',
      required: true,
      cite: 'Package · Loss runs · Form · Firmographics',
    },
    {
      id: 'imp-limit',
      kind: 'impact',
      bucket: 'appetite_fit',
      title: 'Limit adequacy · $5M request',
      severity: 'medium',
      summary: 'Limit within healthcare appetite band when Tier ≤ 3.',
      detail: 'APP-HC-01 pass on size; sublimits may still need broker discussion.',
      required: false,
      cite: 'Form · Requested terms',
    },
    {
      id: 'imp-mfa-floor',
      kind: 'impact',
      bucket: 'controls_access',
      title: 'Coverage gate · MFA floor',
      severity: 'high',
      summary: 'CTRL-MFA-01 blocks straight-through quote until Risk Analysis sign-off.',
      detail: 'Quoting with unsigned open MFA gap creates rescission / misrepresentation exposure.',
      required: true,
      cite: 'Form · Identity & access · MFA gap',
    },
  ],
}

export const RISK_REVIEW_GENERIC: RiskReviewDemo = {
  exposure: 'elevated',
  summary: 'Threat posture driven by open control gaps and attest vs signal. Sign each required item.',
  threats: [
    {
      id: 'g-thr-remote',
      kind: 'threat',
      bucket: 'controls_access',
      title: 'Ransomware via weak remote access',
      severity: 'high',
      summary: 'Open material access gaps elevate intrusion probability.',
      detail: 'Remote MFA and privileged paths dominate residual threat.',
      required: true,
      cite: 'Form · Identity & access',
    },
    {
      id: 'g-thr-vendor',
      kind: 'threat',
      bucket: 'third_party_ops',
      title: 'Supply-chain / vendor concentration',
      severity: 'medium',
      summary: 'Shared platforms correlate portfolio losses.',
      detail: 'Own Ignore / Block / Escalate in Risk Analysis.',
      required: true,
      cite: 'Platform · Form · Vendors',
    },
  ],
  impacts: [
    {
      id: 'g-imp-ransom',
      kind: 'impact',
      bucket: 'ransomware_readiness',
      title: 'Ransomware severity',
      severity: 'high',
      summary: 'Control gaps raise severity of a successful intrusion.',
      detail: 'Remote access and backup posture dominate severity banding.',
      required: true,
      cite: 'Form · Backup & recovery · Endpoint detection',
    },
    {
      id: 'g-imp-ref',
      kind: 'impact',
      bucket: 'appetite_fit',
      title: 'Escalation / decline pressure',
      severity: 'medium',
      summary: 'Rule hits may block straight-through quote.',
      detail: 'Confirm appetite outcomes before Closure.',
      required: true,
      cite: 'Form · Requested terms · Firmographics',
    },
  ],
}

export function riskReviewForCase(c: {
  sector: string
  insured: string
}): RiskReviewDemo {
  if (
    c.sector === 'Healthcare' ||
    c.insured.toLowerCase().includes('brightcare') ||
    c.insured.toLowerCase().includes('northwind health')
  ) {
    return RISK_REVIEW_HEALTHCARE
  }
  return RISK_REVIEW_GENERIC
}

export function exposureChipColor(
  exposure: ThreatExposure,
): 'danger' | 'warning' | 'success' | 'accent' {
  if (exposure === 'critical') return 'danger'
  if (exposure === 'elevated') return 'warning'
  if (exposure === 'moderate') return 'accent'
  return 'success'
}

export function judgmentChipColor(
  status: RiskJudgmentStatus | undefined,
): 'accent' | 'success' | 'warning' | 'danger' {
  if (!status || status === 'pending') return 'accent'
  if (status === 'accepted') return 'success'
  if (status === 'escalated') return 'danger'
  return 'warning'
}
