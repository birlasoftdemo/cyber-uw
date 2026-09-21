import type { CyberCase, PlatformCardType } from '../types'

export type PlatformEcoView = 'vendors' | 'riskTypes' | 'peerCases'

export type VendorIncident = {
  id: string
  date: string
  kind: 'breach' | 'outage' | 'ransomware' | 'supply_chain'
  severity: 'low' | 'med' | 'high'
  summary: string
}

export type SharedVendorRow = {
  vendorId: string
  name: string
  class: 'idp' | 'msp' | 'cloud' | 'saas' | 'other'
  bookPolicyCount: number
  bookLimitSumUsd: number
  bookClaimCount36m: number
  bookLossSumUsd: number
  peerLimitP50Usd: number
  peerSirP50Usd: number
  thisRiskUses: boolean
  incidents: VendorIncident[]
  watchThreshold: number
  /** Maps to PlatformCard.type for sign-off spine */
  findingType: PlatformCardType | null
}

export type RiskTypeRow = {
  riskType: 'idp' | 'msp' | 'cloud' | 'sector'
  label: string
  bookPolicyCount: number
  bookLimitSumUsd: number
  peerLimitP50Usd: number
  peerSirP50Usd: number
  hitCount: number
  severity: 'info' | 'watch' | 'hot'
  findingType: PlatformCardType | null
}

export type PeerCase = {
  id: string
  insuredAlias: string
  sector: string
  sharedVendors: string[]
  quotedAt: string
  limitUsd: number
  sirUsd: number
  outcome: 'quoted' | 'bound' | 'referred' | 'declined' | 'ntu'
  declineOrReferReason?: string
  subsequentClaim?: {
    at: string
    type: string
    paidUsd: number
    relatedVendor?: string
  }
}

export type PlatformEconomicBundle = {
  suggestedSirUsd: number
  vendors: SharedVendorRow[]
  riskTypes: RiskTypeRow[]
  peerCases: PeerCase[]
}

function hasVendor(c: CyberCase, re: RegExp): boolean {
  return c.vendors.some((v) => re.test(v.vendor) || re.test(v.category))
}

/** Historic economic compare mock keyed off case vendors / sector. */
export function platformEconomicsForCase(c: CyberCase): PlatformEconomicBundle {
  const usesIdp = hasVendor(c, /okta|microsoft 365|m365|identity/i)
  const usesMsp = hasVendor(c, /msp|managed/i)
  const usesCloud = hasVendor(c, /aws|azure|cloud/i)
  const idpName = c.vendors.find((v) => /okta|microsoft 365|m365/i.test(v.vendor))?.vendor ?? 'Microsoft 365'
  const mspName =
    c.vendors.find((v) => /msp|managed/i.test(v.category) || /msp/i.test(v.vendor))?.vendor ??
    'RegionalMSP Co'
  const cloudName = c.vendors.find((v) => /aws|azure/i.test(v.vendor))?.vendor ?? 'AWS'

  const vendors: SharedVendorRow[] = []

  if (usesIdp || c.vendors.length === 0) {
    vendors.push({
      vendorId: 'idp-primary',
      name: idpName,
      class: 'idp',
      bookPolicyCount: 41,
      bookLimitSumUsd: 185_000_000,
      bookClaimCount36m: 2,
      bookLossSumUsd: 4_200_000,
      peerLimitP50Usd: 5_000_000,
      peerSirP50Usd: 100_000,
      thisRiskUses: usesIdp || c.vendors.length === 0,
      watchThreshold: 25,
      findingType: 'shared_idp',
      incidents: [
        {
          id: 'inc-idp-1',
          date: '2024-10-12',
          kind: 'breach',
          severity: 'high',
          summary: 'Credential stuffing wave on shared IdP tenants (industry bulletin)',
        },
        {
          id: 'inc-idp-2',
          date: '2025-03-02',
          kind: 'outage',
          severity: 'med',
          summary: 'Auth outage correlated BI notices on 3 peer accounts',
        },
      ],
    })
  }

  if (usesMsp || c.sector === 'Logistics') {
    vendors.push({
      vendorId: 'msp-1',
      name: mspName,
      class: 'msp',
      bookPolicyCount: 7,
      bookLimitSumUsd: 28_000_000,
      bookClaimCount36m: 1,
      bookLossSumUsd: 1_850_000,
      peerLimitP50Usd: 3_000_000,
      peerSirP50Usd: 50_000,
      thisRiskUses: usesMsp,
      watchThreshold: 5,
      findingType: 'msp_rmm_path',
      incidents: [
        {
          id: 'inc-msp-1',
          date: '2025-01-18',
          kind: 'ransomware',
          severity: 'high',
          summary: 'RMM path used in peer ransomware — multi-policy correlation watch',
        },
      ],
    })
  }

  if (usesCloud || c.vendors.length === 0) {
    vendors.push({
      vendorId: 'cloud-1',
      name: cloudName,
      class: 'cloud',
      bookPolicyCount: 28,
      bookLimitSumUsd: 142_000_000,
      bookClaimCount36m: 0,
      bookLossSumUsd: 0,
      peerLimitP50Usd: 5_000_000,
      peerSirP50Usd: 100_000,
      thisRiskUses: usesCloud || c.vendors.length === 0,
      watchThreshold: 25,
      findingType: 'cloud_concentration',
      incidents: [
        {
          id: 'inc-cloud-1',
          date: '2023-11-01',
          kind: 'outage',
          severity: 'med',
          summary: 'Regional cloud outage — contingent BI inquiries only',
        },
      ],
    })
  }

  vendors.push({
    vendorId: 'saas-1',
    name: c.vendors.find((v) => /saas|m365|shopify/i.test(v.category) || /365|shopify/i.test(v.vendor))
      ?.vendor ?? 'Critical SaaS',
    class: 'saas',
    bookPolicyCount: 19,
    bookLimitSumUsd: 76_000_000,
    bookClaimCount36m: 1,
    bookLossSumUsd: 900_000,
    peerLimitP50Usd: 5_000_000,
    peerSirP50Usd: 75_000,
    thisRiskUses: true,
    watchThreshold: 20,
    findingType: 'critical_saas_api',
    incidents: [],
  })

  const riskTypes: RiskTypeRow[] = [
    {
      riskType: 'idp',
      label: 'Shared identity provider',
      bookPolicyCount: 41,
      bookLimitSumUsd: 185_000_000,
      peerLimitP50Usd: 5_000_000,
      peerSirP50Usd: 100_000,
      hitCount: usesIdp ? 41 : 12,
      severity: usesIdp ? 'hot' : 'watch',
      findingType: 'shared_idp',
    },
    {
      riskType: 'msp',
      label: 'MSP / RMM access path',
      bookPolicyCount: 7,
      bookLimitSumUsd: 28_000_000,
      peerLimitP50Usd: 3_000_000,
      peerSirP50Usd: 50_000,
      hitCount: usesMsp ? 7 : 2,
      severity: usesMsp ? 'hot' : 'info',
      findingType: 'msp_rmm_path',
    },
    {
      riskType: 'cloud',
      label: 'Cloud concentration',
      bookPolicyCount: 28,
      bookLimitSumUsd: 142_000_000,
      peerLimitP50Usd: 5_000_000,
      peerSirP50Usd: 100_000,
      hitCount: 28,
      severity: 'watch',
      findingType: 'cloud_concentration',
    },
    {
      riskType: 'sector',
      label: `${c.sector} · limit aggregate`,
      bookPolicyCount: 14,
      bookLimitSumUsd: 62_000_000,
      peerLimitP50Usd: 5_000_000,
      peerSirP50Usd: 100_000,
      hitCount: 14,
      severity: c.limitRequestedUsd >= 10_000_000 ? 'hot' : 'watch',
      findingType: 'sector_limit_aggregate',
    },
  ]

  const peerCases: PeerCase[] = [
    {
      id: 'peer-1',
      insuredAlias: 'Peer-A · Healthcare SaaS',
      sector: 'Healthcare',
      sharedVendors: [idpName, cloudName],
      quotedAt: '2025-09-12',
      limitUsd: 5_000_000,
      sirUsd: 100_000,
      outcome: 'bound',
    },
    {
      id: 'peer-2',
      insuredAlias: 'Peer-B · Mid-market SaaS',
      sector: 'Technology / SaaS',
      sharedVendors: [idpName],
      quotedAt: '2025-11-03',
      limitUsd: 5_000_000,
      sirUsd: 50_000,
      outcome: 'quoted',
    },
    {
      id: 'peer-3',
      insuredAlias: 'Peer-C · Logistics',
      sector: 'Logistics',
      sharedVendors: [mspName, cloudName],
      quotedAt: '2025-06-20',
      limitUsd: 7_500_000,
      sirUsd: 100_000,
      outcome: 'referred',
      declineOrReferReason: 'MSP RMM path + incomplete EDR evidence',
    },
    {
      id: 'peer-4',
      insuredAlias: 'Peer-D · Retail',
      sector: 'Retail',
      sharedVendors: [mspName],
      quotedAt: '2024-12-01',
      limitUsd: 10_000_000,
      sirUsd: 250_000,
      outcome: 'declined',
      declineOrReferReason: 'Limit above appetite with shared MSP',
      subsequentClaim: {
        at: '2025-08-14',
        type: 'Ransomware via MSP',
        paidUsd: 1_850_000,
        relatedVendor: mspName,
      },
    },
    {
      id: 'peer-5',
      insuredAlias: 'Peer-E · Healthcare',
      sector: 'Healthcare',
      sharedVendors: [idpName, cloudName],
      quotedAt: '2026-01-22',
      limitUsd: 5_000_000,
      sirUsd: 100_000,
      outcome: 'bound',
    },
    {
      id: 'peer-6',
      insuredAlias: 'Peer-F · Manufacturing',
      sector: 'Manufacturing',
      sharedVendors: [cloudName],
      quotedAt: '2025-04-08',
      limitUsd: 3_000_000,
      sirUsd: 50_000,
      outcome: 'ntu',
    },
  ]

  return {
    suggestedSirUsd: c.limitRequestedUsd >= 10_000_000 ? 250_000 : 100_000,
    vendors,
    riskTypes,
    peerCases,
  }
}

export function formatUsdShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}
