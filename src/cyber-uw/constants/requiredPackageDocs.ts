/** Canonical cyber package checklist (domain-expert demo). */
export const REQUIRED_PACKAGE_DOCS = [
  'Architecture',
  'SOC report',
  'Incident Response Plan',
  'Disaster Recovery Drill report',
  'ISO report',
  'Compliance certifications',
] as const

export type RequiredPackageDoc = (typeof REQUIRED_PACKAGE_DOCS)[number]
