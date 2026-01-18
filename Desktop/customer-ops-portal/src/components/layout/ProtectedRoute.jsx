import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'

export default function ProtectedRoute({ children, allowRoles }) {
  const { user, profile, loading } = useAuthUser()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-4 h-4 border border-neutral-900 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowRoles && allowRoles.length > 0) {
    const role = profile?.role || 'customer'
    if (!allowRoles.includes(role)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}
