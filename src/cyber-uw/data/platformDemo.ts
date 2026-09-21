import type { CyberCase, PlatformCard, PlatformOutcome, VendorExposure } from '../types'

function cardId(caseId: string, type: string): string {
  return `${caseId}-plat-${type}`
}

/** Build interrelated platform risk cards from vendor / sector context (not raw book counts). */
export function buildPlatformCards(
  caseId: string,
  vendors: VendorExposure[],
  sector: string,
  limitUsd: number,
): PlatformCard[] {
  const cards: PlatformCard[] = []
  const byName = (n: string) => vendors.find((v) => v.vendor.toLowerCase().includes(n.toLowerCase()))

  const m365 = byName('Microsoft 365')
  const okta = byName('Okta')
  const aws = byName('AWS')
  const azure = byName('Azure')
  const msp = vendors.find((v) => /msp|managed/i.test(v.category) || /msp/i.test(v.vendor))
  const saas = m365 ?? vendors.find((v) => /saas/i.test(v.category))

  if (m365 || okta) {
    const idp = okta ?? m365!
    cards.push({
      id: cardId(caseId, 'shared_idp'),
      type: 'shared_idp',
      label: 'Shared identity provider',
      finding: `${idp.vendor} is the insured’s primary IdP / identity plane.`,
      portfolioMeaning:
        'Auth outage or credential blast radius can correlate losses across policies on the same IdP class — watch, do not auto-decline mid-market SaaS.',
      signOff: 'pending',
    })
  }

  if (saas) {
    cards.push({
      id: cardId(caseId, 'critical_saas_api'),
      type: 'critical_saas_api',
      label: 'Critical SaaS / API dependency',
      finding: `${saas.vendor} holds operational or data-plane dependency for this insured.`,
      portfolioMeaning:
        'Dependent BI / single-vendor outage risk — consider waiting period or contingent BI sublimit if binding.',
      signOff: 'pending',
    })
  }

  if (msp) {
    cards.push({
      id: cardId(caseId, 'msp_rmm_path'),
      type: 'msp_rmm_path',
      label: 'MSP / RMM access path',
      finding: `${msp.vendor} provides managed / remote access paths shared across accounts.`,
      portfolioMeaning:
        'Classic ransomware entry + multi-policy correlation if the MSP is compromised — elevated portfolio watch.',
      signOff: 'pending',
    })
  }

  const cloud = aws ?? azure
  if (cloud) {
    cards.push({
      id: cardId(caseId, 'cloud_concentration'),
      type: 'cloud_concentration',
      label: 'Cloud concentration',
      finding: `Primary cloud: ${cloud.vendor}.`,
      portfolioMeaning:
        'Aggregation stress input (cloud-down / ransomware) — check remaining program capacity before adding limit.',
      signOff: 'pending',
    })
  }

  cards.push({
    id: cardId(caseId, 'sector_limit'),
    type: 'sector_limit_aggregate',
    label: 'Sector / limit aggregate',
    finding: `Binding $${(limitUsd / 1_000_000).toFixed(0)}M in ${sector}.`,
    portfolioMeaning:
      'Treaty / program capacity vs sector remaining limit — portfolio gate, not a vanity vendor tally.',
    signOff: 'pending',
  })

  return cards
}

export function platformOutcomeFromCards(cards: PlatformCard[]): PlatformOutcome {
  if (!cards.length) return 'clear'
  if (cards.some((c) => c.signOff === 'pending')) return 'pending'
  if (cards.some((c) => c.signOff === 'block')) return 'blocks'
  if (cards.some((c) => c.signOff === 'escalate')) return 'escalate'
  if (cards.some((c) => c.signOff === 'ignore')) return 'ignore'
  return 'clear'
}

export function platformOutcomeLabel(outcome: PlatformOutcome): string {
  if (outcome === 'pending') return 'Platform: Pending sign-off'
  if (outcome === 'clear') return 'Platform: Clear'
  if (outcome === 'ignore') return 'Platform: Ignore'
  if (outcome === 'escalate') return 'Platform: Escalate'
  return 'Platform: Blocks'
}

export function ensurePlatformCards(c: Pick<CyberCase, 'id' | 'vendors' | 'sector' | 'limitRequestedUsd' | 'platformCards'>): PlatformCard[] {
  if (c.platformCards?.length) return c.platformCards
  return buildPlatformCards(c.id, c.vendors, c.sector, c.limitRequestedUsd)
}
