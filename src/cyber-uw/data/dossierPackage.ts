import type { FormSignal, PackageDoc, PackageDocPreviewKind } from '../types'
import { REQUIRED_PACKAGE_DOCS } from '../constants/requiredPackageDocs'

export const PACKAGE_DOC_KINDS = [
  'Application',
  'Architecture',
  'SOC report',
  'Incident Response Plan',
  'Disaster Recovery Drill report',
  'ISO report',
  'Compliance certifications',
  'SOC2',
  'Attestation',
  'Loss runs',
  'Attachment',
  'Document',
] as const

export type PackageDocKind = (typeof PACKAGE_DOC_KINDS)[number]

export { REQUIRED_PACKAGE_DOCS }

function kindFromName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('architecture') || n.includes('network_diagram') || n.includes('network diagram')) {
    return 'Architecture'
  }
  if (n.includes('incident') || n.includes('ir_plan') || n.includes('ir plan')) {
    return 'Incident Response Plan'
  }
  if (n.includes('disaster') || n.includes('dr_drill') || n.includes('dr drill') || n.includes('restore')) {
    return 'Disaster Recovery Drill report'
  }
  if (n.includes('iso27001') || n.includes('iso_27001') || n.includes('iso report')) {
    return 'ISO report'
  }
  if (n.includes('compliance') || n.includes('certification') || n.includes('hipaa') || n.includes('gdpr')) {
    return 'Compliance certifications'
  }
  if (n.includes('soc2') || n.includes('soc_2') || n.includes('soc report')) return 'SOC report'
  if (n.includes('loss')) return 'Loss runs'
  if (n.includes('mfa') || n.includes('edr') || n.includes('attest')) return 'Attestation'
  if (n.includes('app')) return 'Application'
  if (n.includes('pdf')) return 'Attachment'
  return 'Document'
}

function previewFor(name: string, kind: string): { previewKind: PackageDocPreviewKind; previewBody: string } {
  const title = name.replace(/_/g, ' ').replace(/\.pdf$/i, '')
  return {
    previewKind: 'pdf',
    previewBody: [
      `${kind.toUpperCase()}`,
      '',
      title,
      '',
      '— Confidential — for underwriting use only —',
      '',
      '1. Scope',
      '   This exhibit was ingested with the submission package.',
      '   A live connector would stream the stored PDF bytes here.',
      '',
      '2. Summary',
      `   Document type: ${kind}`,
      '   Status: Available for instant review in the workbench.',
      '',
      '3. Attestation',
      '   Broker / insured representations in the application remain',
      '   subject to underwriter verification against this exhibit.',
    ].join('\n'),
  }
}

export function packageDocsFromNames(caseId: string, names: string[]): PackageDoc[] {
  return names.map((name, i) => {
    const kind = kindFromName(name)
    const preview = previewFor(name, kind)
    return {
      id: `${caseId}-doc-${i}`,
      name,
      kind,
      ...preview,
    }
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Open a package document in a new browser tab. */
export function openPackageDocument(doc: PackageDoc): void {
  const body = doc.previewBody
    ? escapeHtml(doc.previewBody).replace(/\n/g, '<br/>')
    : 'Ingested package preview. A live connector would stream the stored file here.'
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.name)}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 2.5rem; color: #0f172a; max-width: 42rem; }
    .kind { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; }
    h1 { font-size: 1.15rem; margin: 0.35rem 0 1rem; }
    .sheet { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; font-size: 0.85rem; line-height: 1.55; color: #334155; white-space: pre-wrap; }
  </style>
</head>
<body>
  <p class="kind">${escapeHtml(doc.kind)}</p>
  <h1>${escapeHtml(doc.name)}</h1>
  <div class="sheet">${body}</div>
</body>
</html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** Default form-signal stub for new / light packages. */
export function defaultFormSignals(
  caseId: string,
  opts: {
    insured: string
    sector: string
    limitUsd: number
    mfaAnswer?: string
    mfaSignal?: string
    mfaGapId?: string
    edrAnswer?: string
    edrSignal?: string
    edrGapId?: string
    backupAnswer?: string
    backupSignal?: string
    vendorsAnswer?: string
  },
): FormSignal[] {
  const rows: FormSignal[] = [
    {
      id: `${caseId}-fs-legal`,
      moduleId: 'firmographics',
      label: 'Legal / trading name',
      answer: opts.insured,
    },
    {
      id: `${caseId}-fs-sector`,
      moduleId: 'firmographics',
      label: 'Primary sector',
      answer: opts.sector,
    },
    {
      id: `${caseId}-fs-limit`,
      moduleId: 'requested_terms',
      label: 'Limit requested',
      answer: `$${(opts.limitUsd / 1_000_000).toFixed(0)}M`,
    },
    {
      id: `${caseId}-fs-mfa`,
      moduleId: 'identity_access',
      label: 'MFA on external / privileged admin',
      answer: opts.mfaAnswer ?? 'Pending review',
      signal: opts.mfaSignal,
      gapId: opts.mfaGapId,
    },
    {
      id: `${caseId}-fs-edr`,
      moduleId: 'endpoint_detection',
      label: 'EDR coverage',
      answer: opts.edrAnswer ?? 'Pending review',
      signal: opts.edrSignal,
      gapId: opts.edrGapId,
    },
    {
      id: `${caseId}-fs-backup`,
      moduleId: 'backup_recovery',
      label: 'Immutable / tested backups',
      answer: opts.backupAnswer ?? 'Pending review',
      signal: opts.backupSignal,
    },
    {
      id: `${caseId}-fs-vendors`,
      moduleId: 'vendors_concentration',
      label: 'Critical SaaS / cloud vendors',
      answer: opts.vendorsAnswer ?? 'To be disclosed',
    },
  ]
  return rows
}

export function moduleLabel(moduleId: string): string {
  const map: Record<string, string> = {
    firmographics: 'Firmographics',
    business_activities: 'Business activities',
    requested_terms: 'Requested terms',
    identity_access: 'Identity & access',
    endpoint_detection: 'Endpoint detection',
    email_security: 'Email security',
    backup_recovery: 'Backup & recovery',
    patch_vuln: 'Patch & vulnerability',
    incident_response: 'Incident response',
    vendors_concentration: 'Vendors',
    data_exposure: 'Data exposure',
    claims_history: 'Claims history',
  }
  return map[moduleId] ?? moduleId
}
