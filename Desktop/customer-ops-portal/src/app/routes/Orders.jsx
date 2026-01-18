import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const STATUSES = ['all', 'submitted', 'confirmed', 'in_progress', 'delivered', 'closed']

export default function Orders() {
  const navigate = useNavigate()
  const { profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const customerId = isStaff ? null : profile?.customerId
    listOrders(customerId).then(setOrders).finally(() => setLoading(false))
  }, [profile, isStaff])

  const filtered = useMemo(() => {
    let result = orders
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(o => 
        o.title?.toLowerCase().includes(q) ||
        o.customerId?.toLowerCase().includes(q) ||
        o.summary?.toLowerCase().includes(q)
      )
    }
    return result
  }, [orders, search, statusFilter])

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-4">
            {isStaff ? 'All Orders' : 'My Orders'}
          </p>
          <h1 className="text-4xl font-extralight tracking-tight">Orders</h1>
        </div>
        <Link to="/orders/new" className="btn-primary">
          New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="input-elite"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-2xs tracking-widest uppercase whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-4 h-4 border border-neutral-900 border-t-transparent animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-neutral-200">
          <p className="text-sm text-neutral-400 mb-6">
            {search || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}
          </p>
          {!search && statusFilter === 'all' && (
            <Link to="/orders/new" className="btn-secondary">Create First Order</Link>
          )}
        </div>
      ) : (
        <div className="border border-neutral-100">
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-neutral-50 text-2xs tracking-widest text-neutral-400 uppercase">
            <div className="col-span-4">Order</div>
            {isStaff && <div className="col-span-2">Customer</div>}
            <div className={isStaff ? 'col-span-2' : 'col-span-4'}>Status</div>
            <div className={isStaff ? 'col-span-2' : 'col-span-2'}>Date</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-neutral-100">
            {filtered.map(order => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-6 py-5 hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <div className="lg:col-span-4">
                  <p className="text-sm font-medium text-neutral-900">{order.title}</p>
                  {order.summary && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1 hidden lg:block">{order.summary}</p>
                  )}
                </div>
                {isStaff && (
                  <div className="lg:col-span-2">
                    <p className="text-xs text-neutral-500">{order.customerId || '—'}</p>
                  </div>
                )}
                <div className={isStaff ? 'lg:col-span-2' : 'lg:col-span-4'}>
                  <span className={`badge ${STATUS_STYLES[order.status] || STATUS_STYLES.submitted}`}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className={isStaff ? 'lg:col-span-2' : 'lg:col-span-2'}>
                  <p className="text-xs text-neutral-400">
                    {order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                  </p>
                </div>
                <div className="lg:col-span-2 text-right">
                  <span className="text-xs text-neutral-400 hover:text-neutral-900">View →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
