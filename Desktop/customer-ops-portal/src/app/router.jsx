import React from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'
import AppShell from './AppShell'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import Orders from './routes/Orders'
import OrderDetail from './routes/OrderDetail'
import OrderCreate from './routes/OrderCreate'
import Customers from './routes/Customers'
import Products from './routes/Products'
import Production from './routes/Production'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import { useAuthUser } from '../lib/auth'

function RoleRedirect() {
  const { profile, loading } = useAuthUser()
  
  if (loading) return null
  
  const role = profile?.role || 'customer'
  if (role === 'admin' || role === 'staff') {
    return <Navigate to="/orders" replace />
  }
  return <Navigate to="/dashboard" replace />
}

const router = createHashRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { index: true, element: <RoleRedirect /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'orders', element: <Orders /> },
      { path: 'orders/new', element: <OrderCreate /> },
      { path: 'orders/:orderId', element: <OrderDetail /> },
      { path: 'customers', element: <ProtectedRoute allowRoles={['admin', 'staff']}><Customers /></ProtectedRoute> },
      { path: 'products', element: <ProtectedRoute allowRoles={['admin', 'staff']}><Products /></ProtectedRoute> },
      { path: 'production', element: <ProtectedRoute allowRoles={['admin', 'staff']}><Production /></ProtectedRoute> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default router
