/**
 * AuthContext.jsx
 * ---------------
 * Provides app-wide authentication state using Supabase Auth.
 *
 * What this does:
 * - Listens for Supabase auth state changes (login / logout / token refresh)
 * - After login, fetches the staff_profiles row to get hospital_id, role,
 *   and module_permissions for the logged-in user
 * - Exposes { user, profile, loading, signIn, signOut } to all components
 * - Implements 30-minute inactivity auto-logout: any mouse/keyboard/touch
 *   event resets the timer; if 30 minutes pass with no activity, the user
 *   is signed out automatically
 */

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

// 30 minutes in milliseconds
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000

export function AuthProvider({ children }) {
  // `user`    — the raw Supabase Auth user object (or null)
  // `profile` — the staff_profiles row with role, hospital_id, module_permissions
  // `loading` — true while we are checking the initial session on app load
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const inactivityTimer = useRef(null)

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    clearTimeout(inactivityTimer.current)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  // ── Inactivity timer ──────────────────────────────────────────────────────
  // Resets on every user interaction. If 30 min pass with no activity,
  // the session is ended and the user is redirected to the login page.
  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      signOut()
    }, INACTIVITY_TIMEOUT_MS)
  }, [signOut])

  // Attach / detach activity listeners whenever a user is logged in
  useEffect(() => {
    if (!user) {
      clearTimeout(inactivityTimer.current)
      return
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer))
    resetInactivityTimer() // start the timer immediately on login

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer))
      clearTimeout(inactivityTimer.current)
    }
  }, [user, resetInactivityTimer])

  // ── Fetch staff profile ───────────────────────────────────────────────────
  // Called after a successful login to load role, hospital_id, permissions.
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      return
    }

    // SELECT the staff_profiles row for this auth user.
    // RLS ensures they can only read their own row.
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.error('Error fetching staff profile:', error.message)
      setProfile(null)
    } else {
      setProfile(data)
    }
  }, [])

  // ── Auth state listener ───────────────────────────────────────────────────
  // Supabase fires onAuthStateChange on page load (to restore session),
  // on login, and on logout. This is the single source of truth for auth.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user ?? null
        setUser(authUser)
        await fetchProfile(authUser)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ── Sign in ───────────────────────────────────────────────────────────────
  // Returns { error } so the Login page can display error messages.
  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const value = { user, profile, loading, signIn, signOut }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Convenience hook — use this in any component:
//   const { user, profile, signOut } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
