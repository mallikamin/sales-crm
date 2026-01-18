import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { signIn, useAuthUser } from '../../lib/auth'

export default function Login() {
  const { user, loading } = useAuthUser()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!loading && user) return <Navigate to={from} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setBusy(true)
    setError('')

    try {
      await signIn(email.trim(), password)
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else {
        setError('Unable to sign in')
      }
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border border-neutral-900 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-50 items-center justify-center p-16">
        <div className="max-w-md">
          <h1 className="text-5xl font-extralight tracking-tight text-neutral-900 leading-tight">
            CUSTOMER<br />OPS PORTAL
          </h1>
          <p className="mt-8 text-sm text-neutral-500 leading-relaxed tracking-wide">
            Order management, production planning, and client collaboration — unified in one elegant workspace.
          </p>
          <div className="mt-16 flex items-center gap-8 text-2xs tracking-widest text-neutral-400 uppercase">
            <span>Orders</span>
            <span>·</span>
            <span>Production</span>
            <span>·</span>
            <span>Collaboration</span>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm animate-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-16 text-center">
            <h1 className="text-2xl font-extralight tracking-tight">CUSTOMER OPS</h1>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-light tracking-tight">Sign in</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-2xs font-medium tracking-widest text-neutral-500 uppercase mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-elite"
                placeholder="you@company.com"
                disabled={busy}
              />
            </div>

            <div>
              <label className="block text-2xs font-medium tracking-widest text-neutral-500 uppercase mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-elite"
                placeholder="••••••••"
                disabled={busy}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full mt-4"
            >
              {busy ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-16 pt-8 border-t border-neutral-100">
            <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-4">Demo Accounts</p>
            <div className="space-y-2 text-xs text-neutral-500">
              <p><span className="text-neutral-900">Admin:</span> mallikamin@gmail.com</p>
              <p><span className="text-neutral-900">Staff:</span> staff@customerops.com</p>
              <p><span className="text-neutral-900">Customer:</span> customer@customerops.com</p>
              <p className="text-neutral-400 mt-2">Password: [role]123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
