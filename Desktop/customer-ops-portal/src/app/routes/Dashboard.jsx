import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { listOrders } from '../../lib/db/orders'

const STATUS_STYLES = {
  submitted: 'bg-neutral-100 text-neutral-600',
  confirmed: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-neutral-100 text-neutral-400',
  cancelled: 'bg-red-50 text-red-600',
}

export default function Dashboard() {
  const { profile } = useAuthUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.customerId) {
      listOrders(profile.customerId).then(setOrders).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [profile?.customerId])

  const recentOrders = orders.slice(0, 5)
  const activeOrders = orders.filter(o => !['closed', 'cancelled'].includes(o.status))

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-16">
        <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-4">Dashboard</p>
        <h1 className="text-4xl font-extralight tracking-tight">
          Welcome back, {profile?.name?.split(' ')[0] || 'there'}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Active', value: activeOrders.length },
          { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
        ].map((stat, i) => (
          <div key={i}>
            <p className="text-4xl font-extralight text-neutral-900">{stat.value}</p>
            <p className="text-2xs tracking-widest text-neutral-400 uppercase mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mb-8 flex items-center justify-between">
        <p className="text-2xs tracking-widest text-neutral-400 uppercase">Recent Orders</p>
        <Link to="/orders" className="text-xs text-neutral-500 hover:text-neutral-900">
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-4 h-4 border border-neutral-900 border-t-transparent animate-spin mx-auto" />
        </div>
      ) : recentOrders.length === 0 ? (
        <div className="py-16 text-center border border-neutral-100">
          <p className="text-sm text-neutral-500 mb-6">No orders yet</p>
          <Link to="/orders/new" className="btn-primary">Create Order</Link>
        </div>
      ) : (
        <div className="border border-neutral-100 divide-y divide-neutral-100">
          {recentOrders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block p-6 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">{order.title}</h3>
                  {order.summary && (
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{order.summary}</p>
                  )}
                </div>
                <span className={`badge ${STATUS_STYLES[order.status] || STATUS_STYLES.submitted}`}>
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Action */}
      <div className="mt-8">
        <Link to="/orders/new" className="btn-secondary">
          New Order
        </Link>
      </div>
    </div>
  )
}
