/** Shared cyber product identity defaults for Customer 360 / case constructors. */

export const CYBER_PRODUCT_DEFAULTS = {
  productName: 'Cyber Liability',
  productCode: 'CYB-LIAB',
  lobCode: 'CYB',
  lobName: 'Cyber',
  productVersion: '2026.1',
  productTenure: '12 months',
  renewalApplicable: true,
} as const

export function defaultInsuredAddress(insured: string, sector: string): string {
  return `1 Enterprise Way, ${sector} District — ${insured}`
}
