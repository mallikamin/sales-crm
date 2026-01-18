import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthUser, signOut } from '../lib/auth'

export default function AppShell() {
  const { user, profile } = useAuthUser()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const role = profile?.role || 'customer'
  const isStaff = role === 'admin' || role === 'staff'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavItem = ({ to, children }) => (
    <NavLink
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        `text-xs tracking-widest uppercase transition-colors duration-200 ${
          isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'
        }`
      }
    >
      {children}
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <NavLink to="/" className="text-lg font-light tracking-tight">
              CUSTOMER OPS
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-10">
              {isStaff ? (
                <>
                  <NavItem to="/orders">Orders</NavItem>
                  <NavItem to="/production">Production</NavItem>
                  <NavItem to="/customers">Customers</NavItem>
                  <NavItem to="/products">Products</NavItem>
                </>
              ) : (
                <>
                  <NavItem to="/dashboard">Dashboard</NavItem>
                  <NavItem to="/orders">My Orders</NavItem>
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-neutral-900">{profile?.name || user?.email}</p>
                <p className="text-2xs text-neutral-400 uppercase tracking-wider">{role}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs tracking-widest uppercase text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                Exit
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`h-px bg-neutral-900 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`h-px bg-neutral-900 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`h-px bg-neutral-900 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-neutral-100 py-6 px-6 space-y-4 bg-white">
            {isStaff ? (
              <>
                <NavItem to="/orders">Orders</NavItem>
                <NavItem to="/production">Production</NavItem>
                <NavItem to="/customers">Customers</NavItem>
                <NavItem to="/products">Products</NavItem>
              </>
            ) : (
              <>
                <NavItem to="/dashboard">Dashboard</NavItem>
                <NavItem to="/orders">My Orders</NavItem>
              </>
            )}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <p className="text-2xs tracking-widest text-neutral-400 uppercase">
            Boardroom clarity. Execution-grade tracking.
          </p>
          <p className="text-2xs text-neutral-300">
            © 2024
          </p>
        </div>
      </footer>
    </div>
  )
}
