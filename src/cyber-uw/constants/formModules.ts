/** Starter cyber question modules (RQ-CUW-02 pilot cut). */
export interface FormModuleDef {
  id: string
  label: string
  purpose: string
  defaultOn: boolean
}

export const CYBER_FORM_MODULES: FormModuleDef[] = [
  {
    id: 'firmographics',
    label: 'Firmographics',
    purpose: 'Identity & size',
    defaultOn: true,
  },
  {
    id: 'business_activities',
    label: 'Business activities',
    purpose: 'Risk narrative',
    defaultOn: true,
  },
  {
    id: 'requested_terms',
    label: 'Requested terms',
    purpose: 'Quote framing',
    defaultOn: true,
  },
  {
    id: 'identity_access',
    label: 'Identity & access',
    purpose: 'MFA / privileged access',
    defaultOn: true,
  },
  {
    id: 'endpoint_detection',
    label: 'Endpoint detection',
    purpose: 'EDR posture',
    defaultOn: true,
  },
  {
    id: 'email_security',
    label: 'Email security',
    purpose: 'Phishing / BEC',
    defaultOn: false,
  },
  {
    id: 'backup_recovery',
    label: 'Backup & recovery',
    purpose: 'Ransomware resilience',
    defaultOn: true,
  },
  {
    id: 'patch_vuln',
    label: 'Patch & vulnerability',
    purpose: 'Internet-facing hygiene',
    defaultOn: false,
  },
  {
    id: 'incident_response',
    label: 'Incident response',
    purpose: 'Readiness',
    defaultOn: false,
  },
  {
    id: 'vendors_concentration',
    label: 'Vendors',
    purpose: 'Concentration / TPRM',
    defaultOn: true,
  },
  {
    id: 'data_exposure',
    label: 'Data exposure',
    purpose: 'PII / PHI / PCI-DSS',
    defaultOn: false,
  },
  {
    id: 'claims_history',
    label: 'Claims history',
    purpose: 'Prior cyber events',
    defaultOn: true,
  },
]

export function defaultModuleIds(): string[] {
  return CYBER_FORM_MODULES.filter((m) => m.defaultOn).map((m) => m.id)
}
