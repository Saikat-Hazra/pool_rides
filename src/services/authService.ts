import { getItem, setItem, getSingle, setSingle, removeItem, KEYS } from './storageService'
import { SEED_USERS, COLLEGES } from '@/data/seed'
import type { User, AuthSession, Role, College } from '@/types'
import { getGoogleUser } from '@/config/firebase'

// Simple hash mock (XOR-based — not cryptographic, for demo only)
function mockHash(str: string): string {
  return btoa(str + '_pr_salt')
}

function verifyHash(str: string, hash: string): boolean {
  return mockHash(str) === hash
}

export function initAuth(): void {
  const seeded = localStorage.getItem(KEYS.seeded)
  if (!seeded) {
    // Store hashed passwords
    const hashedUsers = SEED_USERS.map((u) => ({ ...u, passwordHash: mockHash(u.passwordHash) }))
    setItem(KEYS.users, hashedUsers)
    setItem(KEYS.colleges, COLLEGES)
    localStorage.setItem(KEYS.seeded, 'true')
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  collegeId: string,
): Promise<User> {
  const users = getItem<User>(KEYS.users)
  if (users.find((u) => u.email === email)) {
    throw new Error('An account with this email already exists.')
  }
  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email,
    passwordHash: mockHash(password),
    collegeId,
    verifiedStatus: 'pending',
    homeArea: '',
    role: 'student',
    preferencesJson: {},
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.users, [...users, newUser])
  return newUser
}

export async function login(email: string, password: string): Promise<{ user: User; session: AuthSession }> {
  const users = getItem<User>(KEYS.users)
  const user = users.find((u) => u.email === email)

  if (!user) throw new Error('No account found with this email.')
  if (!verifyHash(password, user.passwordHash)) throw new Error('Incorrect password.')
  if (user.verifiedStatus === 'suspended') throw new Error('Your account has been suspended. Contact support.')

  user.lastLoginAt = new Date().toISOString()
  setItem(KEYS.users, users.map((u) => u.id === user.id ? user : u))

  const session: AuthSession = {
    userId: user.id,
    role: user.role as Role,
    token: btoa(`${user.id}:${Date.now()}`),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  }
  setSingle(KEYS.session, session)
  return { user, session }
}

export async function loginWithGoogle(): Promise<{ user: User; session: AuthSession }> {
  // 1. Get User from Firebase (or Mock)
  const googleUser = await getGoogleUser()
  const { name, email } = googleUser

  // 2. Parse Domain & Auto-Detect College
  const domain = email.split('@')[1]?.toLowerCase()
  const colleges = getItem<College>(KEYS.colleges) || COLLEGES
  const matchedCollege = colleges.find(c => c.emailDomain === domain)
  const collegeId = matchedCollege ? matchedCollege.id : 'col_other'

  // 3. Find existing logic or register seamlessly
  let users = getItem<User>(KEYS.users)
  let user = users.find((u) => u.email === email)

  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name,
      email,
      passwordHash: mockHash('google_oauth_fallback'),
      collegeId,
      // Automatically verify student if they proved ownership of a legitimate college email domain!
      verifiedStatus: matchedCollege ? 'verified' : 'pending',
      homeArea: '',
      role: 'student',
      preferencesJson: {},
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }
    users.push(user)
    setItem(KEYS.users, users)
  } else if (user.verifiedStatus === 'suspended') {
    throw new Error('Your account has been suspended. Contact support.')
  } else {
    // If they were pending but now SSO'd with a valid domain, auto-verify them
    user.lastLoginAt = new Date().toISOString()
    if (matchedCollege && user.verifiedStatus === 'pending') {
      user.verifiedStatus = 'verified'
    }
    setItem(KEYS.users, users.map(u => u.id === user?.id ? user : u))
  }

  const session: AuthSession = {
    userId: user.id,
    role: user.role as Role,
    token: btoa(`${user.id}:${Date.now()}`),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  }
  setSingle(KEYS.session, session)
  return { user, session }
}

export function logout(): void {
  removeItem(KEYS.session)
}

export function restoreSession(): { user: User; session: AuthSession } | null {
  const session = getSingle<AuthSession>(KEYS.session)
  if (!session) return null
  if (new Date(session.expiresAt) < new Date()) {
    removeItem(KEYS.session)
    return null
  }
  const users = getItem<User>(KEYS.users)
  const user = users.find((u) => u.id === session.userId)
  if (!user) return null
  return { user, session }
}

export function updateUser(updated: User): void {
  const users = getItem<User>(KEYS.users)
  setItem(KEYS.users, users.map((u) => (u.id === updated.id ? updated : u)))
  // Update session if current user
  const session = getSingle<AuthSession>(KEYS.session)
  if (session?.userId === updated.id) {
    setSingle(KEYS.session, { ...session, role: updated.role })
  }
}

export function getAllUsers(): User[] {
  return getItem<User>(KEYS.users)
}
