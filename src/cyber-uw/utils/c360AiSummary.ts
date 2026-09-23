import type { CyberCase } from '../types'

export interface C360AiSummary {
  paragraph: string
}

function moneyCompact(n: number): string {
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000
    return `$${Number.isInteger(v) ? v : v.toFixed(1)}B`
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `$${Number.isInteger(v) ? v : v.toFixed(0)}M`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function companyDescriptionFor(c: CyberCase): string {
  if (c.companyDescription?.trim()) return c.companyDescription.trim()
  return `Mid-market ${c.sector.toLowerCase()} operator with a digital-first customer footprint and cloud-hosted systems.`
}

/** Derive a short company / industry / offering blurb from case fields (demo, no LLM). */
export function buildC360AiSummary(c: CyberCase): C360AiSummary {
  const revenue = moneyCompact(c.revenueUsd)
  const description = companyDescriptionFor(c)
  const paragraph = [
    `${c.insured} is a ${c.sector} organization. ${description}`,
    `Based at ${c.insuredAddress}, it reports approximately ${revenue} in revenue and works through ${c.broker}.`,
    `Its core offering in view is ${c.productName} (${c.lobName} / ${c.productCode}).`,
  ].join(' ')

  return { paragraph }
}
