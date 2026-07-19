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
 * - `signingIn` — true from the moment signIn() is called until the ENTIRE
 *                 flow (credential check + fetchProfile + any forced sign-out)
 *                 has fully settled. While true, App.jsx suppresses the
 *                 LoadingScreen so Login.jsx stays mounted throughout.
 * - `deactivatedMessage` — set when a session is force-ended due to an
 *                 inactive staff or hospital account. Login.jsx reads this
 *                 to display the correct message to the user.
 *
 * Key design: the deactivated-account path
 * -----------------------------------------
 * When fetchProfile detects is_active = false it must:
 *   1. Revoke the Supabase session
 *   2. Clear all auth state
 *   3. Set the deactivatedMessage
 *   4. Clear signingIn
 * All four steps must complete before any React render that could cause
 * App.jsx to re-evaluate its gate conditions. The problem with calling
 * the shared signOut() helper is that supabase.auth.signOut() fires a
 * second onAuthStateChange (SIGNED_OUT) event asynchronously. That second
 * handler runs concurrently and can trigger a render BEFORE signOut() has
 * finished setting deactivatedMessage, creating a window where signingIn
 * is false but deactivatedMessage is still empty.
 *
 * Solution: a `suppressNextSignOut` ref. When fetchProfile decides to
 * reject a session, it sets the ref to true, then calls the shared
 * signOut() helper. The onAuthStateChange handler checks the ref on every
 * SIGNED_OUT event: if it is true, it skips all state updates (they are
 * already being handled by fetchProfile's inline cleanup) and just clears
 * the ref. This eliminates the race entirely — signingIn is cleared only
 * after deactivatedMessage is set, in a single synchronous batch.
 *
 * Other features:
 * - BroadcastChannel cross-tab inactivity timer — activity in any tab
 *   resets the 30-minute timer for all tabs.
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
  const [authReady,          setAuthReady]          = useState(false)
  const [signingIn,          setSigningIn]          = useState(false)
  const [deactivatedMessage, setDeactivatedMessage] = useState('')

  const inactivityTimer     = useRef(null)
  const broadcastChannel    = useRef(null)
  // When true, the next SIGNED_OUT onAuthStateChange event is suppressed
  // because fetchProfile is already handling all state cleanup inline.
  const suppressNextSignOut = useRef(false)

  // ── Sign out (user-initiated or inactivity) ──────────────────────────────────
  // Used for explicit sign-out (sidebar button, inactivity timer).
  // NOT used by fetchProfile for the deactivated-account path — see below.
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
  //
  // DEACTIVATED-ACCOUNT PATH: instead of calling signOut() (which fires a
  // second onAuthStateChange and creates a race), this function:
  //   1. Sets suppressNextSignOut = true so the SIGNED_OUT event is ignored
  //   2. Calls supabase.auth.signOut() to revoke the session
  //   3. Sets all state synchronously in one batch
  //   4. Clears signingIn LAST, after deactivatedMessage is already set
  // This guarantees no render occurs between "signingIn = false" and
  // "deactivatedMessage is populated" — eliminating the flash.
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

    // ── Inline rejection helper ───────────────────────────────────────────────
    // Handles the full teardown for any rejection case (profile not found,
    // staff deactivated, hospital deactivated). Sets suppressNextSignOut
    // BEFORE calling supabase.auth.signOut() so the resulting SIGNED_OUT
    // onAuthStateChange event is ignored. Then sets all state in one place,
    // with signingIn cleared last.
    const rejectSession = async (message) => {
      suppressNextSignOut.current = true
      await supabase.auth.signOut()
      clearTimeout(inactivityTimer.current)
      if (broadcastChannel.current) {
        broadcastChannel.current.close()
        broadcastChannel.current = null
      }
      // Set all state in one synchronous block. React 18 batches these.
      setUser(null)
      setProfile(null)
      setAuthReady(false)
      setDeactivatedMessage(message)
      // signingIn cleared LAST — only after deactivatedMessage is set.
      // App.jsx will not re-evaluate its gate until this render batch
      // completes, so there is no window where signingIn=false but
      // deactivatedMessage is still empty.
      setSigningIn(false)
    }

    if (staffError || !staffData) {
      console.error('Error fetching staff profile:', staffError?.message)
      await rejectSession('Your staff account could not be found. Contact your administrator.')
      return false
    }

    if (!staffData.is_active) {
      await rejectSession('Your account has been deactivated. Contact your administrator.')
      return false
    }

    // Use !== true (not === false) so that null/undefined — which PostgREST
    // returns when the hospitals join is blocked by RLS for a deactivated
    // hospital — is also treated as inactive and correctly rejected.
    if (staffData.hospital_id && staffData.hospitals?.is_active !== true) {
      await rejectSession('Your hospital account has been deactivated. Contact your administrator.')
      return false
    }

    // All checks passed — strip the joined hospitals object before storing
    const { hospitals: _h, ...cleanProfile } = staffData
    setProfile(cleanProfile)
    setAuthReady(true)
    return true
  }, []) // no signOut dependency — rejectSession is defined inline

  // ── Auth state listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user ?? null

        if (!authUser) {
          // Check if this SIGNED_OUT was triggered by fetchProfile's
          // rejectSession(). If so, skip — fetchProfile is handling all
          // state updates itself to avoid the race condition.
          if (suppressNextSignOut.current) {
            suppressNextSignOut.current = false
            return
          }
          // Normal sign-out (user-initiated or inactivity timer)
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
        if (ok) {
          setDeactivatedMessage('')
          // Success path: clear signingIn after authReady is set.
          setSigningIn(false)
        }
        // Failure path: signingIn was already cleared inside rejectSession().
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ── Sign in ──────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    setDeactivatedMessage('')
    setSigningIn(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Credential check failed — no onAuthStateChange will fire.
      setSigningIn(false)
    }
    // On success, signingIn is cleared in onAuthStateChange (success path)
    // or inside rejectSession (failure path). Never cleared here on success.
    return { error }
  }, [])

  const value = { user, profile, loading, authReady, signingIn, deactivatedMessage, signIn, signOut }

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
