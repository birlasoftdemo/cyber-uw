import { create } from 'zustand'
import {
  CONSOLE_FEATURES,
  DEFAULT_FEATURE_MATRIX,
  SEED_APPROVALS,
  SEED_AUDIT,
  SEED_RULES,
  SEED_USERS,
  cloneMatrix,
  emptyRuleDraft,
  emptyUserDraft,
  type ApprovalStatus,
  type ConsoleAuditEntry,
  type ConsoleRoleId,
  type ConsoleRule,
  type ConsoleScreen,
  type ConsoleUser,
  type FeatureAccess,
  type FeatureId,
  type FeatureMatrix,
  type RegistrationRequest,
  type RuleCondition,
  type UserStatus,
} from '../data/consoleV2Seed'

const STORAGE_KEY = 'cyber-uw-console-v2'

interface PersistedConsoleV2 {
  users: ConsoleUser[]
  approvals: RegistrationRequest[]
  matrix: FeatureMatrix
  functionEnablement: Record<FeatureId, Record<ConsoleRoleId, boolean>>
  rules: ConsoleRule[]
  audit: ConsoleAuditEntry[]
}

function defaultFunctionEnablement(matrix: FeatureMatrix): Record<FeatureId, Record<ConsoleRoleId, boolean>> {
  const out = {} as Record<FeatureId, Record<ConsoleRoleId, boolean>>
  for (const feature of CONSOLE_FEATURES) {
    const row = {} as Record<ConsoleRoleId, boolean>
    for (const roleId of Object.keys(matrix[feature.id]) as ConsoleRoleId[]) {
      row[roleId] = matrix[feature.id][roleId] !== 'none'
    }
    out[feature.id] = row
  }
  return out
}

function emptyPersisted(): PersistedConsoleV2 {
  const matrix = cloneMatrix(DEFAULT_FEATURE_MATRIX)
  return {
    users: SEED_USERS.map((u) => ({ ...u, roles: u.roles.map((r) => ({ ...r, lobs: [...r.lobs] })) })),
    approvals: SEED_APPROVALS.map((a) => ({
      ...a,
      requestedRoles: [...a.requestedRoles],
      requestedLobs: [...a.requestedLobs],
    })),
    matrix,
    functionEnablement: defaultFunctionEnablement(matrix),
    rules: SEED_RULES.map((r) => ({
      ...r,
      conditions: r.conditions.map((c) => ({ ...c })),
    })),
    audit: [...SEED_AUDIT],
  }
}

function loadPersisted(): PersistedConsoleV2 {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyPersisted()
    const parsed = JSON.parse(raw) as Partial<PersistedConsoleV2>
    const base = emptyPersisted()
    return {
      users: parsed.users ?? base.users,
      approvals: parsed.approvals ?? base.approvals,
      matrix: parsed.matrix ? { ...cloneMatrix(DEFAULT_FEATURE_MATRIX), ...parsed.matrix } : base.matrix,
      functionEnablement: parsed.functionEnablement ?? base.functionEnablement,
      rules: parsed.rules ?? base.rules,
      audit: parsed.audit ?? base.audit,
    }
  } catch {
    return emptyPersisted()
  }
}

function persist(state: PersistedConsoleV2) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function slicePersisted(state: ConsoleV2State): PersistedConsoleV2 {
  return {
    users: state.users,
    approvals: state.approvals,
    matrix: state.matrix,
    functionEnablement: state.functionEnablement,
    rules: state.rules,
    audit: state.audit,
  }
}

interface ConsoleV2State extends PersistedConsoleV2 {
  screen: ConsoleScreen
  editingUserId: string | null
  editingRuleId: string | null
  selectedRoleId: ConsoleRoleId
  hydrate: () => void
  setScreen: (screen: ConsoleScreen) => void
  setSelectedRoleId: (roleId: ConsoleRoleId) => void
  openCreateUser: () => void
  openEditUser: (userId: string) => void
  saveUser: (
    draft: Omit<ConsoleUser, 'id' | 'createdAt'> & { id?: string },
    actor: string,
  ) => void
  setUserStatus: (userId: string, status: UserStatus, actor: string) => void
  resolveApproval: (id: string, status: Exclude<ApprovalStatus, 'pending'>, actor: string) => void
  setMatrixAccess: (featureId: FeatureId, roleId: ConsoleRoleId, access: FeatureAccess, actor: string) => void
  setFunctionEnabled: (featureId: FeatureId, roleId: ConsoleRoleId, enabled: boolean, actor: string) => void
  openCreateRule: () => void
  openEditRule: (ruleId: string) => void
  saveRule: (
    draft: Omit<ConsoleRule, 'id' | 'updatedAt'> & { id?: string },
    actor: string,
    mode: 'draft' | 'publish' | 'test',
  ) => void
  appendAudit: (actor: string, action: string, detail: string) => void
  getEditingUser: () => ConsoleUser | null
  getEditingRule: () => ConsoleRule | null
  getUserDraft: () => Omit<ConsoleUser, 'id' | 'createdAt'> & { id?: string }
  getRuleDraft: () => Omit<ConsoleRule, 'id' | 'updatedAt'> & { id?: string }
}

const initial = loadPersisted()

export const useConsoleV2Store = create<ConsoleV2State>((set, get) => ({
  ...initial,
  screen: 'dashboard',
  editingUserId: null,
  editingRuleId: null,
  selectedRoleId: 'system_admin',

  hydrate: () => {
    const data = loadPersisted()
    set(data)
  },

  setScreen: (screen) => set({ screen }),

  setSelectedRoleId: (roleId) => set({ selectedRoleId: roleId }),

  openCreateUser: () => set({ screen: 'user_edit', editingUserId: null }),

  openEditUser: (userId) => set({ screen: 'user_edit', editingUserId: userId }),

  saveUser: (draft, actor) => {
    const state = get()
    const now = new Date().toISOString()
    let users: ConsoleUser[]
    let action: string
    let detail: string

    if (draft.id) {
      users = state.users.map((u) =>
        u.id === draft.id
          ? {
              ...u,
              firstName: draft.firstName,
              lastName: draft.lastName,
              email: draft.email,
              employeeId: draft.employeeId,
              team: draft.team,
              status: draft.status,
              roles: draft.roles.map((r) => ({ ...r, lobs: [...r.lobs] })),
            }
          : u,
      )
      action = 'Updated user'
      detail = `${draft.firstName} ${draft.lastName} (${draft.email})`
    } else {
      const created: ConsoleUser = {
        id: nextId('usr'),
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        employeeId: draft.employeeId,
        team: draft.team,
        status: draft.status,
        roles: draft.roles.map((r) => ({ ...r, lobs: [...r.lobs] })),
        createdAt: now,
      }
      users = [created, ...state.users]
      action = 'Created user'
      detail = `${created.firstName} ${created.lastName} (${created.email}) — prototype only, no login issued`
    }

    const audit: ConsoleAuditEntry = {
      id: nextId('aud'),
      actor,
      action,
      detail,
      timestamp: now,
    }
    const next = { ...slicePersisted(state), users, audit: [audit, ...state.audit] }
    persist(next)
    set({ ...next, screen: 'users', editingUserId: null })
  },

  setUserStatus: (userId, status, actor) => {
    const state = get()
    const user = state.users.find((u) => u.id === userId)
    if (!user) return
    const users = state.users.map((u) => (u.id === userId ? { ...u, status } : u))
    const audit: ConsoleAuditEntry = {
      id: nextId('aud'),
      actor,
      action: 'Changed user status',
      detail: `${user.firstName} ${user.lastName} → ${status}`,
      timestamp: new Date().toISOString(),
    }
    const next = { ...slicePersisted(state), users, audit: [audit, ...state.audit] }
    persist(next)
    set(next)
  },

  resolveApproval: (id, status, actor) => {
    const state = get()
    const request = state.approvals.find((a) => a.id === id)
    if (!request || request.status !== 'pending') return

    let users = state.users
    if (status === 'approved') {
      const created: ConsoleUser = {
        id: nextId('usr'),
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        employeeId: request.employeeId,
        team: request.team,
        status: 'active',
        roles: request.requestedRoles.map((roleId) => ({
          roleId,
          lobs: [...request.requestedLobs],
        })),
        createdAt: new Date().toISOString(),
      }
      users = [created, ...users]
    }

    const approvals = state.approvals.map((a) => (a.id === id ? { ...a, status } : a))
    const audit: ConsoleAuditEntry = {
      id: nextId('aud'),
      actor,
      action: status === 'approved' ? 'Approved registration' : 'Rejected registration',
      detail: `${request.firstName} ${request.lastName} (${request.email})`,
      timestamp: new Date().toISOString(),
    }
    const next = {
      ...slicePersisted(state),
      users,
      approvals,
      audit: [audit, ...state.audit],
    }
    persist(next)
    set(next)
  },

  setMatrixAccess: (featureId, roleId, access, actor) => {
    const state = get()
    const matrix = cloneMatrix(state.matrix)
    matrix[featureId] = { ...matrix[featureId], [roleId]: access }
    const functionEnablement = {
      ...state.functionEnablement,
      [featureId]: {
        ...state.functionEnablement[featureId],
        [roleId]: access !== 'none',
      },
    }
    const audit: ConsoleAuditEntry = {
      id: nextId('aud'),
      actor,
      action: 'Updated permissions',
      detail: `${featureId} / ${roleId} → ${access}`,
      timestamp: new Date().toISOString(),
    }
    const next = {
      ...slicePersisted(state),
      matrix,
      functionEnablement,
      audit: [audit, ...state.audit],
    }
    persist(next)
    set(next)
  },

  setFunctionEnabled: (featureId, roleId, enabled, actor) => {
    const state = get()
    const functionEnablement = {
      ...state.functionEnablement,
      [featureId]: {
        ...state.functionEnablement[featureId],
        [roleId]: enabled,
      },
    }
    const matrix = cloneMatrix(state.matrix)
    if (!enabled) {
      matrix[featureId] = { ...matrix[featureId], [roleId]: 'none' }
    } else if (matrix[featureId][roleId] === 'none') {
      matrix[featureId] = { ...matrix[featureId], [roleId]: 'view' }
    }
    const audit: ConsoleAuditEntry = {
      id: nextId('aud'),
      actor,
      action: 'Updated function enablement',
      detail: `${featureId} / ${roleId} → ${enabled ? 'enabled' : 'disabled'}`,
      timestamp: new Date().toISOString(),
    }
    const next = {
      ...slicePersisted(state),
      matrix,
      functionEnablement,
      audit: [audit, ...state.audit],
    }
    persist(next)
    set(next)
  },

  openCreateRule: () => set({ screen: 'rule_editor', editingRuleId: null }),

  openEditRule: (ruleId) => set({ screen: 'rule_editor', editingRuleId: ruleId }),

  saveRule: (draft, actor, mode) => {
    const state = get()
    const now = new Date().toISOString()
    const status = mode === 'publish' ? 'active' : draft.status === 'active' && mode === 'draft' ? 'draft' : draft.status

    let rules: ConsoleRule[]
    let action: string
    let detail: string

    if (draft.id) {
      rules = state.rules.map((r) =>
        r.id === draft.id
          ? {
              ...r,
              name: draft.name,
              app: draft.app,
              version: draft.version,
              lob: draft.lob,
              status: mode === 'test' ? r.status : status,
              effectiveDate: draft.effectiveDate,
              conditions: draft.conditions.map((c) => ({ ...c })),
              thenAction: draft.thenAction,
              updatedAt: now,
            }
          : r,
      )
      action =
        mode === 'publish' ? 'Published rule' : mode === 'test' ? 'Tested rule' : 'Saved rule draft'
      detail = `${draft.name} v${draft.version}`
    } else {
      const created: ConsoleRule = {
        id: nextId('rule'),
        name: draft.name,
        app: draft.app,
        version: draft.version,
        lob: draft.lob,
        status: mode === 'publish' ? 'active' : 'draft',
        effectiveDate: draft.effectiveDate,
        conditions: draft.conditions.map((c) => ({ ...c })),
        thenAction: draft.thenAction,
        updatedAt: now,
      }
      rules = [created, ...state.rules]
      action =
        mode === 'publish' ? 'Published rule' : mode === 'test' ? 'Tested rule' : 'Created rule draft'
      detail = `${created.name} v${created.version}`
    }

    if (mode === 'test') {
      const audit: ConsoleAuditEntry = {
        id: nextId('aud'),
        actor,
        action,
        detail: `${detail} — stub test passed`,
        timestamp: now,
      }
      const next = { ...slicePersisted(state), audit: [audit, ...state.audit] }
      persist(next)
      set(next)
      return
    }

    const audit: ConsoleAuditEntry = {
      id: nextId('aud'),
      actor,
      action,
      detail,
      timestamp: now,
    }
    const next = { ...slicePersisted(state), rules, audit: [audit, ...state.audit] }
    persist(next)
    set({ ...next, screen: 'rules', editingRuleId: null })
  },

  appendAudit: (actor, action, detail) => {
    const state = get()
    const audit: ConsoleAuditEntry = {
      id: nextId('aud'),
      actor,
      action,
      detail,
      timestamp: new Date().toISOString(),
    }
    const next = { ...slicePersisted(state), audit: [audit, ...state.audit] }
    persist(next)
    set(next)
  },

  getEditingUser: () => {
    const { editingUserId, users } = get()
    if (!editingUserId) return null
    return users.find((u) => u.id === editingUserId) ?? null
  },

  getEditingRule: () => {
    const { editingRuleId, rules } = get()
    if (!editingRuleId) return null
    return rules.find((r) => r.id === editingRuleId) ?? null
  },

  getUserDraft: () => {
    const existing = get().getEditingUser()
    if (existing) {
      return {
        id: existing.id,
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        employeeId: existing.employeeId,
        team: existing.team,
        status: existing.status,
        roles: existing.roles.map((r) => ({ ...r, lobs: [...r.lobs] })),
      }
    }
    return emptyUserDraft()
  },

  getRuleDraft: () => {
    const existing = get().getEditingRule()
    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        app: existing.app,
        version: existing.version,
        lob: existing.lob,
        status: existing.status,
        effectiveDate: existing.effectiveDate,
        conditions: existing.conditions.map((c) => ({ ...c })),
        thenAction: existing.thenAction,
      }
    }
    return emptyRuleDraft()
  },
}))

export type { RuleCondition }