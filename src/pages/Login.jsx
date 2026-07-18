/**
 * Login.jsx
 * ---------
 * Email + password login page for MediCore staff.
 *
 * Also displays the deactivatedMessage from AuthContext when a session
 * is force-ended due to an inactive account or hospital (Fix 2).
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'

export default function Login() {
  const { signIn, deactivatedMessage } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    const { error: authError } = await signIn(email.trim(), password)
    setLoading(false)

    if (authError) {
      if (authError.message.toLowerCase().includes('invalid login')) {
        setError('Incorrect email or password. Please try again.')
      } else if (authError.message.toLowerCase().includes('email not confirmed')) {
        setError('Your account email is not confirmed. Contact your administrator.')
      } else {
        setError(authError.message)
      }
    }
  }

  // Show deactivation message (from AuthContext) OR a login error, not both
  const displayMessage = deactivatedMessage || error
  const isDeactivated  = !!deactivatedMessage && !error

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F0F4F8', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1A5276] mb-4 shadow-lg">
            <span className="text-white text-2xl font-black">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MediCore</h1>
          <p className="text-sm text-gray-500 mt-1">Hospital Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Staff Login</h2>
          <p className="text-xs text-gray-500 mb-6">Sign in with your hospital-issued credentials</p>

          {/* Error / deactivation banner */}
          {displayMessage && (
            <div className={`flex items-start gap-3 rounded-lg px-4 py-3 mb-5 border ${
              isDeactivated
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                isDeactivated ? 'text-amber-500' : 'text-red-500'
              }`} />
              <p className={`text-sm ${
                isDeactivated ? 'text-amber-700' : 'text-red-700'
              }`}>{displayMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="........"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Staff accounts are managed by your Hospital Administrator.
        </p>
      </div>
    </div>
  )
}
