/**
 * AuthContext.jsx
 * ---------------
 * Provides app-wide authentication state using Supabase Auth.
 *
 * Security model:
 * - `loading`   — true while Supabase is restoring the session on page load.
 * - `authReady` — true ONLY after ALL three checks have passed:
 *                   1. A valid Supabase session exists
 *                   2. staff_profiles.is_active === true
 *                   3. hospitals.is_active === true  (if staff has a hospital)
 *                 App.jsx gates AppLayout on this flag. The dashboard is
 *                 never rendered until authReady is true.
 * - `deactivatedMessage` — set when a session is force-ended due to an
 *                 inactive staff or hospital account. Login.jsx reads this
 *                 to display the correct message to the user.
 *
 * Other features:
 * - Fix 4: BroadcastChannel cross-tab inactivity timer — activity in any
 *   tab resets the 30-minute timer for all tabs.
 */

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000
const ACTIVITY_CHANNEL_NAME = 'medicore_activity'

export function AuthProvider({ children }) {
  const [user,               setUser]               = useState(null)
  const [profile,            setProfile]            = useState(null)
  const [loading,            setLoading]            = useState(true)
  // authReady: true only after session + both is_active checks pass.
  // App.jsx must NOT render AppLayout until this is true.
  const [authReady,          setAuthReady]          = useState(false)
  // deactivatedMessage: shown on the login page after a force sign-out.
  const [deactivatedMessage, setDeactivatedMessage] = useState('')

  const inactivityTimer  = useRef(null)
  const broadcastChannel = useRef(null)

  // ── Sign out ────────────────────────────────────────────────────────────────
  const signOut = useCallback(async (message = '') => {
    clearTimeout(inactivityTimer.current)
    if (broadcastChannel.current) {
      broadcastChannel.current.close()
      broadcastChannel.current = null
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setAuthReady(false)
    if (message) setDeactivatedMessage(message)
  }, [])

  // ── Inactivity timer (cross-tab via BroadcastChannel) ───────────────────────
  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      signOut('You were signed out due to 30 minutes of inactivity.')
    }, INACTIVITY_TIMEOUT_MS)

    if (broadcastChannel.current) {
      try {
        broadcastChannel.current.postMessage({ type: 'activity', ts: Date.now() })
      } catch (_) {
        // Channel may have been closed; ignore
      }
    }
  }, [signOut])

  // Attach / detach activity listeners and BroadcastChannel when logged in
  useEffect(() => {
    if (!user) {
      clearTimeout(inactivityTimer.current)
      if (broadcastChannel.current) {
        broadcastChannel.current.close()
        broadcastChannel.current = null
      }
      return
    }

    const channel = new BroadcastChannel(ACTIVITY_CHANNEL_NAME)
    broadcastChannel.current = channel

    channel.onmessage = (event) => {
      if (event.data?.type === 'activity') {
        clearTimeout(inactivityTimer.current)
        inactivityTimer.current = setTimeout(() => {
          signOut('You were signed out due to 30 minutes of inactivity.')
        }, INACTIVITY_TIMEOUT_MS)
      }
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer))
    resetInactivityTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer))
      clearTimeout(inactivityTimer.current)
      channel.close()
      broadcastChannel.current = null
    }
  }, [user, resetInactivityTimer, signOut])

  // ── Fetch and validate staff profile ────────────────────────────────────────
  // Called after every login or session restore.
  // Sets authReady to true only if all checks pass.
  // Returns true if authorized, false if the session was terminated.
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      setAuthReady(false)
      return false
    }

    const { data: staffData, error: staffError } = await supabase
      .from('staff_profiles')
      .select('*, hospitals(is_active)')
      .eq('id', authUser.id)
      .single()

    if (staffError || !staffData) {
      console.error('Error fetching staff profile:', staffError?.message)
      await signOut('Your staff account could not be found. Contact your administrator.')
      return false
    }

    // Check staff account is active
    if (!staffData.is_active) {
      await signOut('Your account has been deactivated. Contact your administrator.')
      return false
    }

    // Check the linked hospital is active (Super Admin has no hospital_id)
    if (staffData.hospital_id && staffData.hospitals?.is_active === false) {
      await signOut('Your hospital account has been deactivated. Contact your administrator.')
      return false
    }

    // All checks passed — strip the joined hospitals object before storing
    const { hospitals: _h, ...cleanProfile } = staffData
    setProfile(cleanProfile)
    setAuthReady(true)
    return true
  }, [signOut])

  // ── Auth state listener ──────────────────────────────────────────────────────
  // Fires on page load (session restore), login, and logout.
  // authReady is only set to true inside fetchProfile when all checks pass,
  // so the dashboard is never rendered prematurely.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user ?? null

        if (!authUser) {
          // Logged out — clear everything
          setUser(null)
          setProfile(null)
          setAuthReady(false)
          setLoading(false)
          return
        }

        // Set user so inactivity listeners can attach, but do NOT set
        // authReady yet — that only happens after fetchProfile passes.
        setUser(authUser)
        const ok = await fetchProfile(authUser)
        if (ok) setDeactivatedMessage('')
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ── Sign in ──────────────────────────────────────────────────────────────────
  // Delegates credential check to Supabase. The is_active checks run
  // automatically via onAuthStateChange → fetchProfile after a successful
  // login, so signIn() itself stays simple.
  const signIn = useCallback(async (email, password) => {
    setDeactivatedMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const value = { user, profile, loading, authReady, deactivatedMessage, signIn, signOut }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
