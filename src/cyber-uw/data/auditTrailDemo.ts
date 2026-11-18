import type { AuditTrailEntry, CyberCase } from '../types'

/** Normalize legacy audit rows and backfill ACUI columns for the Audit journey step. */
export function auditTrailForCase(c: CyberCase): AuditTrailEntry[] {
  const seeded = c.audit.map((row) => enrichAuditRow(row, c))
  if (seeded.length >= 3) return seeded

  return [
    {
      at: c.receivedAt,
      actor: 'Intake Agent',
      action: 'Submission normalized',
      evidenceSource: 'Cyber Application',
      ruleModel: 'Intake classifier',
      confidence: 88,
      humanOverride: false,
    },
    {
      at: c.receivedAt,
      actor: 'Signal Mock',
      action: 'External enrichment scanned',
      evidenceSource: 'BitSight · Simulated',
      ruleModel: 'ASM scanner',
      confidence: 81,
      humanOverride: false,
    },
    ...seeded,
  ]
}

function enrichAuditRow(
  row: AuditTrailEntry,
  c: CyberCase,
): AuditTrailEntry {
  const override =
    row.humanOverride ??
    (c.decision !== 'pending' &&
      c.recommendation !== 'pending' &&
      c.decision !== c.recommendation &&
      /decision|quote|refer|decline|approv/i.test(row.action))

  return {
    at: row.at,
    actor: row.actor,
    action: row.action,
    evidenceSource: row.evidenceSource ?? inferEvidence(row.action),
    ruleModel: row.ruleModel ?? inferRule(row.action),
    confidence: row.confidence ?? inferConfidence(row.action),
    humanOverride: Boolean(override),
  }
}

function inferEvidence(action: string) {
  if (/mfa|evidence/i.test(action)) return 'Evidence Verification'
  if (/asm|bitsight|enrich/i.test(action)) return 'External findings'
  if (/appetite|refer|decline|quote/i.test(action)) return 'Appetite engine'
  return 'Case dossier'
}

function inferRule(action: string) {
  if (/appetite|APP-|CTRL-/i.test(action)) return 'Appetite rules'
  if (/mfa/i.test(action)) return 'CTRL-MFA-01'
  if (/scan|asm/i.test(action)) return 'Signal model'
  return 'Workbench'
}

function inferConfidence(action: string) {
  if (/recommend|appetite/i.test(action)) return 86
  if (/scan|asm/i.test(action)) return 79
  return 72
}
