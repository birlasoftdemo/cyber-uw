import type { ControlGap, CyberCase, FormSignal, PackageDoc } from '../types'

/** Permitted-value copy when gap.idealFloor is unset. */
export function idealFloorForGap(gap: ControlGap): string {
  if (gap.idealFloor) return gap.idealFloor
  const c = gap.control.toLowerCase()
  if (c.includes('mfa')) return 'MFA enforced on all external admin / VPN / RDP paths'
  if (c.includes('edr') || c.includes('endpoint'))
    return 'EDR on ≥95% endpoints and 100% servers with console evidence'
  if (c.includes('backup') || c.includes('immutable') || c.includes('restore'))
    return 'Immutable backups + restore test attested within 90 days'
  return `Permitted value met for ${gap.control}`
}

/** Detected Value column: attested vs signal synthesis. */
export function detectedValueForGap(gap: ControlGap): string {
  if (gap.attested && gap.signal) return `${gap.attested} · signal: ${gap.signal}`
  return gap.signal || gap.attested || 'No detection yet'
}

/** Green when safe/aligned; mismatch when open material. */
export function isDetectedSafe(gap: ControlGap): boolean {
  if (gap.disposition === 'resolved') return true
  if (gap.disposition === 'referred') return false
  if (gap.severity === 'info' || gap.severity === 'medium') {
    const a = gap.attested.toLowerCase()
    const s = gap.signal.toLowerCase()
    if (s.includes('align') || s.includes('consistent') || s.includes('within 90')) return true
    if (a && s && !s.includes('incomplete') && !s.includes('without') && !s.includes('no ')) {
      return gap.severity === 'info'
    }
  }
  return false
}

export function resolveIdealAnchor(c: CyberCase, gap: ControlGap): string {
  if (gap.idealDocId) return gap.idealDocId
  const app = c.packageDocs.find((d) => /app|attestation|questionnaire/i.test(d.name) || d.kind === 'application')
  return app?.id ?? c.packageDocs[0]?.id ?? `gap-ideal-${gap.id}`
}

export function resolveDetectedAnchor(c: CyberCase, gap: ControlGap): string {
  if (gap.detectedDocId) return gap.detectedDocId
  const sig = c.formSignals.find((f) => f.gapId === gap.id)
  if (sig) return `signal-${sig.id}`
  const evidence = c.packageDocs.find((d) => /mfa|edr|backup|attestation|soc/i.test(d.name))
  return evidence?.id ?? `gap-detected-${gap.id}`
}

export function dossierAnchorId(doc: PackageDoc): string {
  return doc.id
}

export function formSignalAnchorId(row: FormSignal): string {
  return `signal-${row.id}`
}
