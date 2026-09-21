/** Broker Typeform steps — mapped to dispatch modules (UI-SPEC §4 / sketch 002). */

export type BrokerStepType = 'text' | 'url' | 'number' | 'date' | 'textarea' | 'choice' | 'multi'

export type BrokerVisibleIf = (answers: Record<string, string>) => boolean

export interface BrokerStepDef {
  id: string
  moduleId: string
  q: string
  type: BrokerStepType
  options?: string[]
  proposal?: { value: string; source: string; loc: string }
  /** Answer-driven reflexive visibility. */
  visibleIf?: BrokerVisibleIf
}

const CARD_DATA_OPTION = 'Credit / debit card data (PCI-DSS)'
const PHI_OPTION = 'Healthcare records (PHI)'

function multiIncludes(answers: Record<string, string>, option: string): boolean {
  const raw = answers.data_types ?? ''
  return raw
    .split(' · ')
    .map((s) => s.trim())
    .includes(option)
}

export const BROKER_STEPS: Record<string, BrokerStepDef> = {
  legal_name: {
    id: 'legal_name',
    moduleId: 'firmographics',
    q: 'What is the applicant’s legal or trading name?',
    type: 'text',
    proposal: {
      value: 'Northwind Analytics Inc.',
      source: 'PriorApp_2025.pdf',
      loc: 'p.1 · Company name',
    },
  },
  website: {
    id: 'website',
    moduleId: 'firmographics',
    q: 'What is the primary website?',
    type: 'url',
    proposal: {
      value: 'https://northwind.example',
      source: 'PriorApp_2025.pdf',
      loc: 'p.1 · Website',
    },
  },
  geography: {
    id: 'geography',
    moduleId: 'firmographics',
    q: 'Where is the applicant domiciled?',
    type: 'choice',
    options: ['United States', 'United Kingdom', 'European Union', 'Other'],
  },
  employee_count: {
    id: 'employee_count',
    moduleId: 'firmographics',
    q: 'How many employees does the applicant have?',
    type: 'number',
  },
  revenue_band: {
    id: 'revenue_band',
    moduleId: 'firmographics',
    q: 'What is the approximate annual revenue?',
    type: 'choice',
    options: ['Under $10M', '$10M–$35M', '$35M–$100M', 'Over $100M'],
  },
  limit_requested: {
    id: 'limit_requested',
    moduleId: 'requested_terms',
    q: 'What limit is being requested?',
    type: 'choice',
    options: ['$1M', '$5M', '$10M+'],
  },
  retention: {
    id: 'retention',
    moduleId: 'requested_terms',
    q: 'What retention is sought?',
    type: 'choice',
    options: ['$10,000', '$25,000', '$50,000', '$100,000'],
  },
  effective_date: {
    id: 'effective_date',
    moduleId: 'requested_terms',
    q: 'What is the desired effective date?',
    type: 'date',
  },
  products_services: {
    id: 'products_services',
    moduleId: 'business_activities',
    q: 'What are the main products and services?',
    type: 'textarea',
    proposal: {
      value: 'B2B analytics SaaS; processes customer data in US-East.',
      source: 'PriorApp_2025.pdf',
      loc: 'Business activities',
    },
  },
  industry_sector: {
    id: 'industry_sector',
    moduleId: 'business_activities',
    q: 'Which sector best describes the applicant?',
    type: 'choice',
    options: [
      'Technology / SaaS',
      'Healthcare',
      'Financial services',
      'Retail / e-commerce',
      'Professional services',
      'Other',
    ],
  },
  mna_last_3y: {
    id: 'mna_last_3y',
    moduleId: 'business_activities',
    q: 'Has the applicant been involved in any mergers or acquisitions in the last 3 years?',
    type: 'choice',
    options: ['Yes', 'No'],
  },
  data_types: {
    id: 'data_types',
    moduleId: 'data_exposure',
    q: 'Which types of data does the applicant store or process?',
    type: 'multi',
    options: [
      'Personal information (PII)',
      'Healthcare records (PHI)',
      CARD_DATA_OPTION,
      'None of the above',
    ],
  },
  phi_safeguards: {
    id: 'phi_safeguards',
    moduleId: 'data_exposure',
    q: 'For healthcare records (PHI), which safeguards are in place?',
    type: 'multi',
    options: [
      'Access limited to need-to-know roles',
      'Encryption at rest',
      'Business associate agreements',
      'Audit logging of PHI access',
    ],
    visibleIf: (a) =>
      multiIncludes(a, PHI_OPTION) ||
      /healthcare/i.test(a.industry_sector ?? ''),
  },
  pci_in_transit: {
    id: 'pci_in_transit',
    moduleId: 'data_exposure',
    q: 'While card data moves, is it encrypted the whole way (end-to-end or point-to-point)?',
    type: 'choice',
    options: ['Yes', 'No', 'Not sure'],
    visibleIf: (a) => multiIncludes(a, CARD_DATA_OPTION),
  },
  pci_at_rest: {
    id: 'pci_at_rest',
    moduleId: 'data_exposure',
    q: 'At rest, is card data encrypted or tokenized so raw card numbers are not sitting in clear text?',
    type: 'choice',
    options: ['Yes — encrypted or tokenized', 'No — stored in clear text', 'We do not store card data'],
    visibleIf: (a) => multiIncludes(a, CARD_DATA_OPTION),
  },
  pci_emv: {
    id: 'pci_emv',
    moduleId: 'data_exposure',
    q: 'If they take cards in person, are the terminals EMV-capable?',
    type: 'choice',
    options: ['Yes', 'No', 'N/A — not card-present'],
    visibleIf: (a) => multiIncludes(a, CARD_DATA_OPTION),
  },
  record_volume: {
    id: 'record_volume',
    moduleId: 'data_exposure',
    q: 'Approximately how many sensitive records are stored or processed?',
    type: 'choice',
    options: ['Under 100k', '100k–1M', '1M–10M', 'Over 10M'],
    visibleIf: (a) => {
      const raw = a.data_types ?? ''
      if (!raw.trim()) return true
      return !raw.split(' · ').map((s) => s.trim()).includes('None of the above')
    },
  },
  remote_access: {
    id: 'remote_access',
    moduleId: 'identity_access',
    q: 'Is remote access to the network permitted?',
    type: 'choice',
    options: ['Yes', 'No'],
  },
  mfa_email: {
    id: 'mfa_email',
    moduleId: 'identity_access',
    q: 'Is multi-factor authentication required for web-based email?',
    type: 'choice',
    options: ['Yes', 'No'],
    proposal: { value: 'Yes', source: 'SecurityPolicy.pdf', loc: 'Identity' },
  },
  mfa_privileged: {
    id: 'mfa_privileged',
    moduleId: 'identity_access',
    q: 'Is multi-factor authentication required for privileged accounts?',
    type: 'choice',
    options: ['Yes', 'No'],
  },
  edr_in_use: {
    id: 'edr_in_use',
    moduleId: 'endpoint_detection',
    q: 'Is an endpoint detection and response (EDR) solution deployed?',
    type: 'choice',
    options: ['Yes', 'No'],
    proposal: { value: 'Yes', source: 'PriorApp_2025.pdf', loc: 'Controls' },
  },
  email_security: {
    id: 'email_security',
    moduleId: 'email_security',
    q: 'Which inbound email security controls are in place?',
    type: 'multi',
    options: [
      'Secure email gateway / filtering',
      'Malicious link scanning',
      'External email tagging',
      'Microsoft 365 Defender or equivalent',
    ],
  },
  phishing_training: {
    id: 'phishing_training',
    moduleId: 'email_security',
    q: 'How often is interactive phishing training conducted?',
    type: 'choice',
    options: ['Never / not regularly', 'Annually', 'Two or more times per year'],
  },
  backup_frequency: {
    id: 'backup_frequency',
    moduleId: 'backup_recovery',
    q: 'How often are critical systems backed up?',
    type: 'choice',
    options: ['Continuously / daily', 'Weekly', 'Monthly', 'Less often'],
  },
  backup_measures: {
    id: 'backup_measures',
    moduleId: 'backup_recovery',
    q: 'Which backup protections apply?',
    type: 'multi',
    options: [
      'Offline or air-gapped',
      'Immutable / WORM',
      'MFA on backup access',
      'Encrypted',
      'Restore tested',
    ],
  },
  critical_patch_sla: {
    id: 'critical_patch_sla',
    moduleId: 'patch_vuln',
    q: 'Within how many days are critical patches applied to internet-facing systems?',
    type: 'choice',
    options: ['Within 7 days', 'Within 14 days', 'Within 30 days', 'Longer than 30 days'],
  },
  ir_plan: {
    id: 'ir_plan',
    moduleId: 'incident_response',
    q: 'Is there a documented incident response plan for cyber events?',
    type: 'choice',
    options: ['Yes', 'No'],
  },
  ir_retainer: {
    id: 'ir_retainer',
    moduleId: 'incident_response',
    q: 'Is an incident response retainer in place?',
    type: 'choice',
    options: ['Yes', 'No'],
  },
  cloud_provider: {
    id: 'cloud_provider',
    moduleId: 'vendors_concentration',
    q: 'What is the primary cloud provider?',
    type: 'choice',
    options: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Other / on-premises'],
  },
  idp: {
    id: 'idp',
    moduleId: 'vendors_concentration',
    q: 'What is the primary identity provider?',
    type: 'choice',
    options: ['Microsoft Entra ID', 'Okta', 'Google Workspace', 'Other'],
  },
  cyber_loss_5y: {
    id: 'cyber_loss_5y',
    moduleId: 'claims_history',
    q: 'Have there been any cyber claims or material incidents in the last 5 years?',
    type: 'choice',
    options: ['Yes', 'No'],
  },
}

const MODULE_ORDER = [
  'firmographics',
  'requested_terms',
  'business_activities',
  'data_exposure',
  'identity_access',
  'endpoint_detection',
  'email_security',
  'backup_recovery',
  'patch_vuln',
  'incident_response',
  'vendors_concentration',
  'claims_history',
] as const

export function buildBrokerPath(moduleIds: string[]): BrokerStepDef[] {
  const on = new Set(moduleIds)
  const path: BrokerStepDef[] = []
  for (const mod of MODULE_ORDER) {
    if (!on.has(mod)) continue
    for (const step of Object.values(BROKER_STEPS)) {
      if (step.moduleId === mod) path.push(step)
    }
  }
  return path
}

/** Apply answer-driven reflexive visibility. */
export function filterVisibleBrokerSteps(
  path: BrokerStepDef[],
  answers: Record<string, string>,
): BrokerStepDef[] {
  return path.filter((step) => !step.visibleIf || step.visibleIf(answers))
}

export function demoAnswersForPath(path: BrokerStepDef[]): Record<string, string> {
  const answers: Record<string, string> = {}
  for (const step of path) {
    if (step.proposal?.value) {
      answers[step.id] = step.proposal.value
    } else if (step.type === 'choice' && step.options?.[0]) {
      answers[step.id] = step.options[0]
    } else if (step.type === 'multi' && step.options?.[0]) {
      answers[step.id] = step.options[0]
    } else if (step.type === 'number') {
      answers[step.id] = '120'
    } else if (step.type === 'date') {
      answers[step.id] = '2026-09-01'
    } else {
      answers[step.id] = '—'
    }
  }
  return answers
}
