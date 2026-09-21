import { create } from 'zustand'

export type AuthRole = 'underwriter' | 'ops'

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

function saveSession(user: AuthUser | null) {
  if (!user) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  loginError: string | null
  hydrate: () => void
  login: (email: string, password: string) => boolean
  loginWithSso: (provider: 'google' | 'outlook') => boolean
  logout: () => void
}

const stored = loadSession()

export const useAuthStore = create<AuthState>((set) => ({
  user: stored?.user ?? null,
  isAuthenticated: Boolean(stored?.user),
  loginError: null,

  hydrate: () => {
    const session = loadSession()
    if (session?.user) {
      set({
        user: session.user,
        isAuthenticated: true,
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
    saveSession(account.user)
    set({
      user: account.user,
      isAuthenticated: true,
      loginError: null,
    })
    return true
  },

  loginWithSso: (_provider) => {
    const account = DEMO_ACCOUNTS['uw@cyber.internal']
    saveSession(account.user)
    set({
      user: account.user,
      isAuthenticated: true,
      loginError: null,
    })
    return true
  },

  logout: () => {
    saveSession(null)
    set({
      user: null,
      isAuthenticated: false,
      loginError: null,
    })
  },
}))
