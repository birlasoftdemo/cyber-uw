import type { CyberCase } from '../types'
import { checklistStatusForCase, missingDocsForCase } from './missingDocs'

export interface C360AiSummary {
  strengths: string[]
  watchItems: string[]
  aiRead: string[]
}

function shortControl(control: string): string {
  const cleaned = control.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
  if (cleaned.length <= 28) return cleaned
  return `${cleaned.slice(0, 26).trim()}…`
}

function splitNarrative(summary: string): string[] {
  const parts = summary
    .split(/(?<=\.)\s+/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length <= 1) return summary.trim() ? [summary.trim()] : []
  return parts.slice(0, 4)
}

/** Derive AI summary pills + prose from case fields (demo, no LLM). */
export function buildC360AiSummary(c: CyberCase): C360AiSummary {
  const missing = missingDocsForCase(c)
  const checklistClear = checklistStatusForCase(c).every((row) => row.present)
  const openMaterial = c.gaps.filter(
    (g) =>
      g.disposition === 'open' && (g.severity === 'critical' || g.severity === 'high'),
  )
  const noOpenCritical = !c.gaps.some(
    (g) => g.disposition === 'open' && g.severity === 'critical',
  )

  const strengths: string[] = []
  if (checklistClear || c.completenessPct >= 90) strengths.push('Package complete')
  else if (c.completenessPct >= 80) strengths.push('Strong completeness')
  if (c.signalScore >= 75) strengths.push('Strong signal score')
  if (c.recommendation === 'quote') strengths.push('Quote-leaning')
  if (noOpenCritical) strengths.push('No critical gaps')
  if (c.submissionKind === 'renewal' && openMaterial.length === 0) {
    strengths.push('Clean renewal posture')
  }
  if (c.tier <= 2) strengths.push(`Tier ${c.tier} band`)
  if (strengths.length === 0) strengths.push('Intake in progress')

  const watchItems: string[] = []
  for (const g of openMaterial.slice(0, 4)) {
    watchItems.push(shortControl(g.control))
  }
  if (c.recommendation === 'refer') watchItems.push('Escalate recommended')
  if (c.recommendation === 'decline') watchItems.push('Decline recommended')
  for (const doc of missing.slice(0, 3)) {
    watchItems.push(doc.length > 28 ? `${doc.slice(0, 26).trim()}…` : doc)
  }
  if (watchItems.length === 0) watchItems.push('No material watch items')

  return {
    strengths: strengths.slice(0, 5),
    watchItems: watchItems.slice(0, 5),
    aiRead: splitNarrative(c.dossierSummary),
  }
}
