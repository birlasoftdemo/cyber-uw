/** Pre-qualification / cyber UW qualification parameter buckets — shared across Risk Information. */

export const QUALIFICATION_BUCKETS = [
  {
    id: 'controls_access',
    label: 'Identity & access',
    short: 'Access',
  },
  {
    id: 'controls_endpoint',
    label: 'Endpoint & detection',
    short: 'Endpoint',
  },
  {
    id: 'controls_recoverability',
    label: 'Backup & recoverability',
    short: 'Backup',
  },
  {
    id: 'ransomware_readiness',
    label: 'Ransomware readiness',
    short: 'Ransomware',
  },
  {
    id: 'appetite_fit',
    label: 'Appetite & limit fit',
    short: 'Appetite',
  },
  {
    id: 'third_party_ops',
    label: 'Third-party & ops dependency',
    short: 'Third-party',
  },
] as const

export type QualificationBucketId = (typeof QUALIFICATION_BUCKETS)[number]['id']

export function bucketLabel(id: QualificationBucketId): string {
  return QUALIFICATION_BUCKETS.find((b) => b.id === id)?.label ?? id
}

/** Heuristic map from control name → bucket when seeding mocks. */
export function inferBucketFromControl(control: string): QualificationBucketId {
  const c = control.toLowerCase()
  if (c.includes('mfa') || c.includes('admin') || c.includes('email') || c.includes('pam')) {
    return 'controls_access'
  }
  if (c.includes('edr') || c.includes('endpoint') || c.includes('detection')) {
    return 'controls_endpoint'
  }
  if (c.includes('backup') || c.includes('immutable') || c.includes('restore')) {
    return 'controls_recoverability'
  }
  if (c.includes('ir ') || c.includes('ransomware') || c.includes('patch') || c.includes('phishing')) {
    return 'ransomware_readiness'
  }
  if (c.includes('msp') || c.includes('vendor') || c.includes('saas') || c.includes('rmm')) {
    return 'third_party_ops'
  }
  return 'appetite_fit'
}
