/**
 * AuthContext.jsx
 * ---------------
 * Provides app-wide authentication state using Supabase Auth.
 *
 * Security fixes applied:
 * - Fix 2: After fetching staff_profiles, checks is_active on both the
 *   staff row and the linked hospital. Signs out with a clear message
 *   if either is deactivated.
 * - Fix 4: Uses BroadcastChannel to share the last-activity timestamp
 *   across all open tabs. Activity in ANY tab resets the inactivity
 *   timer for ALL tabs, preventing a background tab from signing the
 *   user out while they are actively working in another tab.
 */

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

// 30 minutes in milliseconds
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000

// BroadcastChannel name - all tabs on the same origin share this channel
const ACTIVITY_CHANNEL_NAME = 'medicore_activity'

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  // deactivatedMessage is shown on the login page when a session is force-ended
  const [deactivatedMessage, setDeactivatedMessage] = useState('')

  const inactivityTimer  = useRef(null)
  const broadcastChannel = useRef(null)

  // -- Sign out ---------------------------------------------------------------
  const signOut = useCallback(async (message = '') => {
    clearTimeout(inactivityTimer.current)
    if (broadcastChannel.current) {
      broadcastChannel.current.close()
      broadcastChannel.current = null
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    if (message) setDeactivatedMessage(message)
  }, [])

  // -- Inactivity timer (Fix 4: cross-tab via BroadcastChannel) ---------------
  // When the user is active in this tab, we broadcast a timestamp to all
  // other tabs. Each tab resets its own local timer when it receives the
  // broadcast, so activity in any tab keeps all tabs alive.
  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      signOut('You were signed out due to 30 minutes of inactivity.')
    }, INACTIVITY_TIMEOUT_MS)

    // Broadcast activity to other tabs
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

    // Open the shared channel for this tab
    const channel = new BroadcastChannel(ACTIVITY_CHANNEL_NAME)
    broadcastChannel.current = channel

    // When another tab broadcasts activity, reset this tab's timer too
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
    resetInactivityTimer() // start the timer immediately on login

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer))
      clearTimeout(inactivityTimer.current)
      channel.close()
      broadcastChannel.current = null
    }
  }, [user, resetInactivityTimer, signOut])

  // -- Fetch and validate staff profile (Fix 2) --------------------------------
  // After every login or session restore:
  // 1. Fetch the staff_profiles row (with joined hospital is_active)
  // 2. Check staff is_active - sign out if false
  // 3. If staff has a hospital_id, check hospital is_active - sign out if false
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
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

    // Fix 2: Check staff account is active
    if (!staffData.is_active) {
      await signOut('Your account has been deactivated. Contact your administrator.')
      return false
    }

    // Fix 2: Check the linked hospital is active (Super Admin has no hospital)
    if (staffData.hospital_id && staffData.hospitals?.is_active === false) {
      await signOut('Your hospital account has been deactivated. Contact your administrator.')
      return false
    }

    // Strip the joined hospitals object before storing in context
    const { hospitals: _h, ...cleanProfile } = staffData
    setProfile(cleanProfile)
    return true
  }, [signOut])

  // -- Auth state listener ----------------------------------------------------
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user ?? null
        setUser(authUser)
        const ok = await fetchProfile(authUser)
        if (ok) setDeactivatedMessage('')
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // -- Sign in ----------------------------------------------------------------
  const signIn = useCallback(async (email, password) => {
    setDeactivatedMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const value = { user, profile, loading, deactivatedMessage, signIn, signOut }

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
