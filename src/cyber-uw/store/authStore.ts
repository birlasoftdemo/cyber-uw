import { create } from 'zustand'

export type AuthRole = 'underwriter' | 'ops'
export type AppScreen = 'workbench' | 'admin'

export interface AuthUser {
  email: string
  name: string
  role: AuthRole
  avatarUrl?: string
}

const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'uw@cyber.internal': {
    password: 'uw123',
    user: {
      email: 'uw@cyber.internal',
      name: 'James Park',
      role: 'underwriter',
    },
  },
  'ops@cyber.internal': {
    password: 'ops123',
    user: {
      email: 'ops@cyber.internal',
      name: 'Sarah Chen',
      role: 'ops',
    },
  },
}

const SESSION_KEY = 'cyber-uw-auth-session'

interface StoredSession {
  user: AuthUser
  appScreen?: AppScreen
}

function loadSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

function saveSession(user: AuthUser | null, appScreen: AppScreen = 'workbench') {
  if (!user) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, appScreen }))
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  appScreen: AppScreen
  loginError: string | null
  hydrate: () => void
  login: (email: string, password: string) => boolean
  loginWithSso: (provider: 'google' | 'outlook') => boolean
  logout: () => void
  enterAdminConsole: () => void
  leaveAdminConsole: () => void
}

const stored = loadSession()

export const useAuthStore = create<AuthState>((set, get) => ({
  user: stored?.user ?? null,
  isAuthenticated: Boolean(stored?.user),
  appScreen: stored?.user ? (stored.appScreen ?? 'workbench') : 'workbench',
  loginError: null,

  hydrate: () => {
    const session = loadSession()
    if (session?.user) {
      set({
        user: session.user,
        isAuthenticated: true,
        appScreen: session.appScreen ?? 'workbench',
      })
    }
  },

  login: (email, password) => {
    const key = email.trim().toLowerCase()
    const account = DEMO_ACCOUNTS[key]
    if (!account || account.password !== password) {
      set({ loginError: 'Invalid email or password.' })
      return false
    }
    saveSession(account.user, 'workbench')
    set({
      user: account.user,
      isAuthenticated: true,
      appScreen: 'workbench',
      loginError: null,
    })
    return true
  },

  loginWithSso: (_provider) => {
    const account = DEMO_ACCOUNTS['uw@cyber.internal']
    saveSession(account.user, 'workbench')
    set({
      user: account.user,
      isAuthenticated: true,
      appScreen: 'workbench',
      loginError: null,
    })
    return true
  },

  logout: () => {
    saveSession(null)
    set({
      user: null,
      isAuthenticated: false,
      appScreen: 'workbench',
      loginError: null,
    })
  },

  enterAdminConsole: () => {
    const { user } = get()
    if (!user || user.role !== 'ops') return
    saveSession(user, 'admin')
    set({ appScreen: 'admin' })
  },

  leaveAdminConsole: () => {
    const { user } = get()
    if (!user) return
    saveSession(user, 'workbench')
    set({ appScreen: 'workbench' })
  },
}))
