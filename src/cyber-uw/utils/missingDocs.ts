import { REQUIRED_PACKAGE_DOCS } from '../constants/requiredPackageDocs'
import type { CyberCase, PackageDoc } from '../types'

/** True when a package doc satisfies a required checklist item. */
export function docSatisfiesRequired(doc: PackageDoc, required: string): boolean {
  const kind = doc.kind.toLowerCase()
  const name = doc.name.toLowerCase()
  const r = required.toLowerCase()

  if (kind === r) return true

  switch (required) {
    case 'Architecture':
      return kind.includes('architecture') || name.includes('architecture') || name.includes('network diagram')
    case 'SOC report':
      return (
        kind === 'soc report' ||
        kind.includes('soc2') ||
        kind.includes('soc 2') ||
        name.includes('soc2') ||
        name.includes('soc_2') ||
        name.includes('soc report')
      )
    case 'Incident Response Plan':
      return (
        kind.includes('incident response') ||
        name.includes('incident response') ||
        name.includes('ir plan') ||
        name.includes('ir_plan')
      )
    case 'Disaster Recovery Drill report':
      return (
        kind.includes('disaster recovery') ||
        kind.includes('dr drill') ||
        name.includes('disaster recovery') ||
        name.includes('dr drill') ||
        name.includes('restore test')
      )
    case 'ISO report':
      return kind.includes('iso') || name.includes('iso27001') || name.includes('iso_27001') || name.includes('iso report')
    case 'Compliance certifications':
      return (
        kind.includes('compliance') ||
        name.includes('compliance') ||
        name.includes('certification') ||
        name.includes('hipaa') ||
        name.includes('gdpr attest')
      )
    default:
      return name.includes(r)
  }
}

export function checklistStatusForCase(c: Pick<CyberCase, 'packageDocs'>): {
  required: string
  present: boolean
  matchingDocId?: string
}[] {
  return REQUIRED_PACKAGE_DOCS.map((required) => {
    const match = c.packageDocs.find((d) => docSatisfiesRequired(d, required))
    return {
      required,
      present: Boolean(match),
      matchingDocId: match?.id,
    }
  })
}

/** Derive missing required docs from package, or honor explicit override when incomplete. */
export function missingDocsForCase(c: CyberCase): string[] {
  if (c.completenessPct >= 80) return []
  if (c.missingDocs?.length) return c.missingDocs
  return checklistStatusForCase(c)
    .filter((row) => !row.present)
    .map((row) => row.required)
}
