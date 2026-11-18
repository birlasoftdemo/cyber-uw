import { ACCEPTED_INSURANCE_LOBS } from './gate1Settings'

export const CONSOLE_LOBS = [...ACCEPTED_INSURANCE_LOBS] as const
export type ConsoleLob = (typeof CONSOLE_LOBS)[number]

export type ConsoleRoleId =
  | 'system_admin'
  | 'uw_manager'
  | 'uw_supervisor'
  | 'underwriter'
  | 'uwa'

export type FeatureId =
  | 'F01'
  | 'F02'
  | 'F03'
  | 'F04'
  | 'F05'
  | 'F06'
  | 'F07'
  | 'F08'
  | 'F09'
  | 'F10'
  | 'F11'
  | 'F12'
  | 'F13'
  | 'F14'
  | 'F15'
  | 'F16'
  | 'F17'

export type FeatureAccess = 'view' | 'edit' | 'approve' | 'none'

export type PermissionFlag = 'view' | 'create' | 'edit' | 'execute' | 'approve'

export type ConsoleScreen =
  | 'dashboard'
  | 'users'
  | 'user_edit'
  | 'approvals'
  | 'roles'
  | 'permissions'
  | 'functions'
  | 'rules'
  | 'rule_editor'
  | 'audit'

export type UserStatus = 'active' | 'inactive' | 'pending'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type RuleStatus = 'active' | 'draft' | 'inactive'

export interface ConsoleRoleDef {
  id: ConsoleRoleId
  code: string
  label: string
  description: string
}

export interface ConsoleFeatureDef {
  id: FeatureId
  code: FeatureId
  module: string
  label: string
}

export interface RoleAssignment {
  roleId: ConsoleRoleId
  lobs: string[]
}

export interface ConsoleUser {
  id: string
  firstName: string
  lastName: string
  email: string
  employeeId: string
  team: string
  status: UserStatus
  roles: RoleAssignment[]
  createdAt: string
}

export interface RegistrationRequest {
  id: string
  firstName: string
  lastName: string
  email: string
  employeeId: string
  team: string
  requestedRoles: ConsoleRoleId[]
  requestedLobs: string[]
  status: ApprovalStatus
  submittedAt: string
  notes?: string
}

export interface ConsoleRule {
  id: string
  name: string
  app: string
  version: string
  lob: string
  status: RuleStatus
  effectiveDate: string
  conditions: RuleCondition[]
  thenAction: string
  updatedAt: string
}

export interface RuleCondition {
  id: string
  field: string
  operator: string
  value: string
}

export interface ConsoleAuditEntry {
  id: string
  actor: string
  action: string
  detail: string
  timestamp: string
}

/** Seeded matrix access: View | Edit | Approve | No Access */
export type FeatureMatrix = Record<FeatureId, Record<ConsoleRoleId, FeatureAccess>>

export const CONSOLE_ROLES: ConsoleRoleDef[] = [
  {
    id: 'system_admin',
    code: 'R01',
    label: 'System Admin',
    description: 'Full console administration; maps to Ops in this prototype.',
  },
  {
    id: 'uw_manager',
    code: 'R02',
    label: 'UW Manager',
    description: 'Approves hard stops, referrals, and rule configuration.',
  },
  {
    id: 'uw_supervisor',
    code: 'R03',
    label: 'UW Supervisor',
    description: 'Approves overrides, referrals, and assignment changes.',
  },
  {
    id: 'underwriter',
    code: 'R04',
    label: 'Underwriter',
    description: 'Day-to-day underwriting workbench access.',
  },
  {
    id: 'uwa',
    code: 'R05',
    label: 'UWA',
    description: 'Underwriting assistant intake and document support.',
  },
]

export const CONSOLE_FEATURES: ConsoleFeatureDef[] = [
  { id: 'F01', code: 'F01', module: 'Workbench', label: 'Dashboard & Work Queue' },
  { id: 'F02', code: 'F02', module: 'Intake', label: 'Submission Intake & Document Upload' },
  { id: 'F03', code: 'F03', module: 'Intake', label: 'Data Extraction Review & Correction' },
  { id: 'F04', code: 'F04', module: 'Analysis', label: 'Risk Score & Risk Analysis' },
  { id: 'F05', code: 'F05', module: 'Analysis', label: 'Loss Run Summary' },
  { id: 'F06', code: 'F06', module: 'Analysis', label: 'Rule Validation Results' },
  { id: 'F07', code: 'F07', module: 'Overrides', label: 'Override Warning' },
  { id: 'F08', code: 'F08', module: 'Overrides', label: 'Override Hard Stop' },
  { id: 'F09', code: 'F09', module: 'Decisions', label: 'Triage Decision' },
  { id: 'F10', code: 'F10', module: 'Decisions', label: 'Referral Approval' },
  { id: 'F11', code: 'F11', module: 'Workload', label: 'Assign/Reassign' },
  { id: 'F12', code: 'F12', module: 'Notifications', label: 'Email Notifications' },
  { id: 'F13', code: 'F13', module: 'Reporting', label: 'Reports & MI' },
  { id: 'F14', code: 'F14', module: 'Console', label: 'User Management' },
  { id: 'F15', code: 'F15', module: 'Console', label: 'Role & Feature Management' },
  { id: 'F16', code: 'F16', module: 'Console', label: 'Rule Configuration' },
  { id: 'F17', code: 'F17', module: 'Console', label: 'LOB Configuration' },
]

const ROLE_ORDER: ConsoleRoleId[] = [
  'system_admin',
  'uw_manager',
  'uw_supervisor',
  'underwriter',
  'uwa',
]

function row(
  admin: FeatureAccess,
  manager: FeatureAccess,
  supervisor: FeatureAccess,
  underwriter: FeatureAccess,
  uwa: FeatureAccess,
): Record<ConsoleRoleId, FeatureAccess> {
  return {
    system_admin: admin,
    uw_manager: manager,
    uw_supervisor: supervisor,
    underwriter,
    uwa,
  }
}

export const DEFAULT_FEATURE_MATRIX: FeatureMatrix = {
  F01: row('view', 'view', 'view', 'view', 'view'),
  F02: row('none', 'edit', 'edit', 'edit', 'edit'),
  F03: row('none', 'edit', 'edit', 'edit', 'edit'),
  F04: row('none', 'view', 'view', 'view', 'view'),
  F05: row('none', 'view', 'view', 'view', 'view'),
  F06: row('none', 'view', 'view', 'view', 'view'),
  F07: row('none', 'approve', 'approve', 'none', 'none'),
  F08: row('none', 'approve', 'none', 'none', 'none'),
  F09: row('none', 'edit', 'edit', 'edit', 'none'),
  F10: row('none', 'approve', 'approve', 'none', 'none'),
  F11: row('none', 'edit', 'edit', 'none', 'none'),
  F12: row('view', 'view', 'view', 'view', 'view'),
  F13: row('none', 'view', 'view', 'view', 'none'),
  F14: row('edit', 'none', 'none', 'none', 'none'),
  F15: row('edit', 'none', 'none', 'none', 'none'),
  F16: row('edit', 'approve', 'none', 'none', 'none'),
  F17: row('edit', 'view', 'none', 'none', 'none'),
}

export const RULE_THEN_ACTIONS = [
  'Route to Underwriter',
  'Escalate to Supervisor',
  'Auto Decline',
  'Request Documents',
  'Flag for Referral',
  'Apply Soft Warning',
  'Apply Hard Stop',
] as const

export const RULE_CONDITION_FIELDS = [
  'LOB',
  'TIV',
  'Broker Score',
  'Loss Ratio',
  'Risk Score',
  'Requested Limit',
  'Attachment Point',
] as const

export const RULE_OPERATORS = ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte', 'contains'] as const

export const CONSOLE_APPS = ['Submission Automation', 'Cyber UW', 'Portfolio Overview'] as const

function isoDaysAgo(days: number, hour = 10): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, 15, 0, 0)
  return d.toISOString()
}

export const SEED_USERS: ConsoleUser[] = [
  {
    id: 'usr-001',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'ops@birlasoft.internal',
    employeeId: 'EMP-1001',
    team: 'Platform Ops',
    status: 'active',
    roles: [{ roleId: 'system_admin', lobs: [...CONSOLE_LOBS] }],
    createdAt: isoDaysAgo(120),
  },
  {
    id: 'usr-002',
    firstName: 'James',
    lastName: 'Park',
    email: 'uw@birlasoft.internal',
    employeeId: 'EMP-2044',
    team: 'Casualty UW',
    status: 'active',
    roles: [
      {
        roleId: 'underwriter',
        lobs: ['General Liability', 'Excess Casualty', 'Auto Liability'],
      },
    ],
    createdAt: isoDaysAgo(90),
  },
  {
    id: 'usr-003',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@birlasoft.internal',
    employeeId: 'EMP-2108',
    team: 'Casualty UW',
    status: 'active',
    roles: [
      {
        roleId: 'uw_manager',
        lobs: ['General Liability', 'Excess Casualty', 'Professional Liability'],
      },
    ],
    createdAt: isoDaysAgo(200),
  },
  {
    id: 'usr-004',
    firstName: 'Marcus',
    lastName: 'Webb',
    email: 'marcus.webb@birlasoft.internal',
    employeeId: 'EMP-2180',
    team: 'Specialty UW',
    status: 'active',
    roles: [
      {
        roleId: 'uw_supervisor',
        lobs: ['Cyber Liability', 'D&O / FI', 'Professional Liability'],
      },
    ],
    createdAt: isoDaysAgo(150),
  },
  {
    id: 'usr-005',
    firstName: 'Elena',
    lastName: 'Rossi',
    email: 'elena.rossi@birlasoft.internal',
    employeeId: 'EMP-2301',
    team: 'Healthcare UW',
    status: 'active',
    roles: [{ roleId: 'underwriter', lobs: ['Healthcare', 'Professional Liability'] }],
    createdAt: isoDaysAgo(60),
  },
  {
    id: 'usr-006',
    firstName: 'David',
    lastName: 'Okoye',
    email: 'david.okoye@birlasoft.internal',
    employeeId: 'EMP-2412',
    team: 'Intake Ops',
    status: 'active',
    roles: [{ roleId: 'uwa', lobs: ['General Liability', 'Auto Liability', 'Healthcare'] }],
    createdAt: isoDaysAgo(45),
  },
  {
    id: 'usr-007',
    firstName: 'Amy',
    lastName: 'Liu',
    email: 'amy.liu@birlasoft.internal',
    employeeId: 'EMP-2505',
    team: 'Casualty UW',
    status: 'inactive',
    roles: [{ roleId: 'underwriter', lobs: ['Auto Liability'] }],
    createdAt: isoDaysAgo(300),
  },
  {
    id: 'usr-008',
    firstName: 'Noah',
    lastName: 'Bennett',
    email: 'noah.bennett@birlasoft.internal',
    employeeId: 'EMP-2610',
    team: 'Specialty UW',
    status: 'active',
    roles: [
      { roleId: 'underwriter', lobs: ['Cyber Liability'] },
      { roleId: 'uw_supervisor', lobs: ['Cyber Liability'] },
    ],
    createdAt: isoDaysAgo(30),
  },
  {
    id: 'usr-009',
    firstName: 'Fatima',
    lastName: 'Hassan',
    email: 'fatima.hassan@birlasoft.internal',
    employeeId: 'EMP-2702',
    team: 'Intake Ops',
    status: 'pending',
    roles: [{ roleId: 'uwa', lobs: ['General Liability'] }],
    createdAt: isoDaysAgo(3),
  },
  {
    id: 'usr-010',
    firstName: 'Chris',
    lastName: 'Nguyen',
    email: 'chris.nguyen@birlasoft.internal',
    employeeId: 'EMP-2800',
    team: 'Casualty UW',
    status: 'active',
    roles: [
      {
        roleId: 'uw_manager',
        lobs: ['General Liability', 'Excess Casualty', 'Auto Liability', 'Healthcare'],
      },
    ],
    createdAt: isoDaysAgo(110),
  },
]

export const SEED_APPROVALS: RegistrationRequest[] = [
  {
    id: 'reg-001',
    firstName: 'Jordan',
    lastName: 'Miles',
    email: 'jordan.miles@birlasoft.internal',
    employeeId: 'EMP-2901',
    team: 'Casualty UW',
    requestedRoles: ['underwriter'],
    requestedLobs: ['General Liability', 'Excess Casualty'],
    status: 'pending',
    submittedAt: isoDaysAgo(1, 9),
    notes: 'Transferring from broker desk; needs GL / Excess access.',
  },
  {
    id: 'reg-002',
    firstName: 'Sofia',
    lastName: 'Martinez',
    email: 'sofia.martinez@birlasoft.internal',
    employeeId: 'EMP-2908',
    team: 'Intake Ops',
    requestedRoles: ['uwa'],
    requestedLobs: ['Auto Liability', 'Healthcare'],
    status: 'pending',
    submittedAt: isoDaysAgo(2, 14),
  },
  {
    id: 'reg-003',
    firstName: 'Ravi',
    lastName: 'Patel',
    email: 'ravi.patel@birlasoft.internal',
    employeeId: 'EMP-2915',
    team: 'Specialty UW',
    requestedRoles: ['uw_supervisor'],
    requestedLobs: ['Cyber Liability', 'D&O / FI'],
    status: 'pending',
    submittedAt: isoDaysAgo(0, 8),
    notes: 'Promotion path — supervisor coverage for cyber book.',
  },
]

export const SEED_RULES: ConsoleRule[] = [
  {
    id: 'rule-001',
    name: 'High TIV referral',
    app: 'Submission Automation',
    version: '1.2',
    lob: 'General Liability',
    status: 'active',
    effectiveDate: '2026-01-01',
    conditions: [
      { id: 'c-1', field: 'TIV', operator: 'gte', value: '25000000' },
      { id: 'c-2', field: 'Risk Score', operator: 'gte', value: '70' },
    ],
    thenAction: 'Escalate to Supervisor',
    updatedAt: isoDaysAgo(12),
  },
  {
    id: 'rule-002',
    name: 'Cyber hard stop — critical controls missing',
    app: 'Cyber UW',
    version: '2.0',
    lob: 'Cyber Liability',
    status: 'active',
    effectiveDate: '2026-02-15',
    conditions: [{ id: 'c-3', field: 'Risk Score', operator: 'gte', value: '85' }],
    thenAction: 'Apply Hard Stop',
    updatedAt: isoDaysAgo(5),
  },
  {
    id: 'rule-003',
    name: 'Healthcare attachment floor',
    app: 'Submission Automation',
    version: '0.9',
    lob: 'Healthcare',
    status: 'draft',
    effectiveDate: '2026-04-01',
    conditions: [{ id: 'c-4', field: 'Attachment Point', operator: 'lt', value: '1000000' }],
    thenAction: 'Apply Soft Warning',
    updatedAt: isoDaysAgo(1),
  },
  {
    id: 'rule-004',
    name: 'Broker score document chase',
    app: 'Submission Automation',
    version: '1.0',
    lob: 'Auto Liability',
    status: 'inactive',
    effectiveDate: '2025-06-01',
    conditions: [{ id: 'c-5', field: 'Broker Score', operator: 'lt', value: '60' }],
    thenAction: 'Request Documents',
    updatedAt: isoDaysAgo(80),
  },
  {
    id: 'rule-005',
    name: 'Excess casualty auto route',
    app: 'Submission Automation',
    version: '1.1',
    lob: 'Excess Casualty',
    status: 'active',
    effectiveDate: '2025-11-01',
    conditions: [{ id: 'c-6', field: 'Requested Limit', operator: 'lte', value: '5000000' }],
    thenAction: 'Route to Underwriter',
    updatedAt: isoDaysAgo(20),
  },
]

export const SEED_AUDIT: ConsoleAuditEntry[] = [
  {
    id: 'aud-001',
    actor: 'Sarah Chen',
    action: 'Updated feature matrix',
    detail: 'F16 Rule Configuration — UW Manager set to Approve',
    timestamp: isoDaysAgo(4, 11),
  },
  {
    id: 'aud-002',
    actor: 'Priya Nair',
    action: 'Published rule',
    detail: 'High TIV referral v1.2 → Active',
    timestamp: isoDaysAgo(12, 15),
  },
  {
    id: 'aud-003',
    actor: 'Sarah Chen',
    action: 'Created user',
    detail: 'Fatima Hassan (UWA) — pending activation',
    timestamp: isoDaysAgo(3, 10),
  },
  {
    id: 'aud-004',
    actor: 'Marcus Webb',
    action: 'Approved registration',
    detail: 'Prior request for specialty UWA onboarded',
    timestamp: isoDaysAgo(7, 9),
  },
  {
    id: 'aud-005',
    actor: 'Sarah Chen',
    action: 'Deactivated user',
    detail: 'Amy Liu marked inactive',
    timestamp: isoDaysAgo(14, 16),
  },
]

export function roleLabel(roleId: ConsoleRoleId): string {
  const found = CONSOLE_ROLES.find((r) => r.id === roleId)
  return found?.label ?? roleId
}

export function featureLabel(featureId: FeatureId): string {
  const found = CONSOLE_FEATURES.find((f) => f.id === featureId)
  return found?.label ?? featureId
}

export function accessToFlags(access: FeatureAccess): Record<PermissionFlag, boolean> {
  switch (access) {
    case 'none':
      return { view: false, create: false, edit: false, execute: false, approve: false }
    case 'view':
      return { view: true, create: false, edit: false, execute: false, approve: false }
    case 'edit':
      return { view: true, create: true, edit: true, execute: true, approve: false }
    case 'approve':
      return { view: true, create: false, edit: false, execute: true, approve: true }
    default: {
      const _exhaustive: never = access
      return _exhaustive
    }
  }
}

export function flagsToAccess(flags: Record<PermissionFlag, boolean>): FeatureAccess {
  if (flags.approve) return 'approve'
  if (flags.edit || flags.create) return 'edit'
  if (flags.view || flags.execute) return 'view'
  return 'none'
}

export function hasAnyAccess(access: FeatureAccess): boolean {
  return access !== 'none'
}

export function cloneMatrix(matrix: FeatureMatrix): FeatureMatrix {
  const next = {} as FeatureMatrix
  for (const feature of CONSOLE_FEATURES) {
    next[feature.id] = { ...matrix[feature.id] }
  }
  return next
}

export function emptyUserDraft(): Omit<ConsoleUser, 'id' | 'createdAt'> {
  return {
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    team: '',
    status: 'pending',
    roles: [],
  }
}

export function emptyRuleDraft(): Omit<ConsoleRule, 'id' | 'updatedAt'> {
  return {
    name: '',
    app: CONSOLE_APPS[0],
    version: '0.1',
    lob: CONSOLE_LOBS[0],
    status: 'draft',
    effectiveDate: new Date().toISOString().slice(0, 10),
    conditions: [{ id: `cond-${Date.now()}`, field: 'LOB', operator: 'equals', value: '' }],
    thenAction: RULE_THEN_ACTIONS[0],
  }
}

export function screenTitle(screen: ConsoleScreen): string {
  switch (screen) {
    case 'dashboard':
      return 'Dashboard'
    case 'users':
      return 'Users'
    case 'user_edit':
      return 'User'
    case 'approvals':
      return 'Approvals'
    case 'roles':
      return 'Roles'
    case 'permissions':
      return 'Permissions'
    case 'functions':
      return 'Functions'
    case 'rules':
      return 'Rules'
    case 'rule_editor':
      return 'Rule Editor'
    case 'audit':
      return 'Audit'
    default: {
      const _exhaustive: never = screen
      return _exhaustive
    }
  }
}

export { ROLE_ORDER }