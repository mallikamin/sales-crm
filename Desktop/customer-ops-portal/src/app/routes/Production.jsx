import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listOrders } from '../../lib/db/orders'

const STATUS_STYLES = {
  submitted: 'bg-neutral-200',
  confirmed: 'bg-blue-200',
  in_progress: 'bg-amber-200',
  delivered: 'bg-emerald-200',
  closed: 'bg-neutral-100',
  cancelled: 'bg-red-100',
}

export default function Production() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [capacity, setCapacity] = useState({ daily: 100, utilized: 0 })
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' | 'list'

  useEffect(() => {
    listOrders().then(data => {
      setOrders(data)
      // Calculate utilization
      const active = data.filter(o => ['confirmed', 'in_progress'].includes(o.status))
      setCapacity(c => ({ ...c, utilized: active.length * 10 })) // Simulated
      setLoading(false)
    })
  }, [])

  // Group orders by status for Kanban-style view
  const ordersByStatus = useMemo(() => ({
    submitted: orders.filter(o => o.status === 'submitted'),
    confirmed: orders.filter(o => o.status === 'confirmed'),
    in_progress: orders.filter(o => o.status === 'in_progress'),
    delivered: orders.filter(o => o.status === 'delivered'),
  }), [orders])

  // Generate calendar weeks (simplified)
  const today = new Date()
  const weeks = useMemo(() => {
    const result = []
    const start = new Date(today)
    start.setDate(start.getDate() - start.getDay())
    
    for (let w = 0; w < 4; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(start)
        date.setDate(start.getDate() + w * 7 + d)
        const dayOrders = orders.filter(o => {
          if (!o.deliveryDate) return false
          const delivery = o.deliveryDate?.toDate ? o.deliveryDate.toDate() : new Date(o.deliveryDate)
          return delivery.toDateString() === date.toDateString()
        })
        week.push({ date, orders: dayOrders })
      }
      result.push(week)
    }
    return result
  }, [orders])

  const utilizationPercent = Math.min((capacity.utilized / capacity.daily) * 100, 100)

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-4">Planning</p>
          <h1 className="text-4xl font-extralight tracking-tight">Production</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 text-2xs tracking-widest uppercase ${viewMode === 'calendar' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-2xs tracking-widest uppercase ${viewMode === 'list' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
          >
            Pipeline
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-12 border-b border-neutral-100">
        <div>
          <p className="text-4xl font-extralight text-neutral-900">{ordersByStatus.submitted.length}</p>
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mt-2">Pending Review</p>
        </div>
        <div>
          <p className="text-4xl font-extralight text-neutral-900">{ordersByStatus.confirmed.length}</p>
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mt-2">Confirmed</p>
        </div>
        <div>
          <p className="text-4xl font-extralight text-neutral-900">{ordersByStatus.in_progress.length}</p>
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mt-2">In Production</p>
        </div>
        <div>
          <p className="text-4xl font-extralight text-neutral-900">{ordersByStatus.delivered.length}</p>
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mt-2">Delivered</p>
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xs tracking-widest text-neutral-400 uppercase">Capacity Utilization</p>
          <p className="text-sm text-neutral-900">{Math.round(utilizationPercent)}%</p>
        </div>
        <div className="h-2 bg-neutral-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${utilizationPercent > 80 ? 'bg-red-400' : utilizationPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
            style={{ width: `${utilizationPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-400">
          <span>0</span>
          <span>Daily capacity: {capacity.daily} units</span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-4 h-4 border border-neutral-900 border-t-transparent animate-spin mx-auto" />
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <div>
          <div className="grid grid-cols-7 gap-px bg-neutral-200 border border-neutral-200">
            {/* Header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-neutral-50 p-3 text-center">
                <p className="text-2xs tracking-widest text-neutral-400 uppercase">{day}</p>
              </div>
            ))}
            
            {/* Weeks */}
            {weeks.map((week, wi) =>
              week.map((day, di) => {
                const isToday = day.date.toDateString() === today.toDateString()
                const isPast = day.date < today && !isToday
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`bg-white p-3 min-h-[100px] ${isPast ? 'opacity-50' : ''}`}
                  >
                    <p className={`text-xs mb-2 ${isToday ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                      {day.date.getDate()}
                    </p>
                    <div className="space-y-1">
                      {day.orders.slice(0, 3).map(order => (
                        <Link
                          key={order.id}
                          to={`/orders/${order.id}`}
                          className={`block p-1.5 text-2xs truncate ${STATUS_STYLES[order.status]}`}
                        >
                          {order.title}
                        </Link>
                      ))}
                      {day.orders.length > 3 && (
                        <p className="text-2xs text-neutral-400">+{day.orders.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        /* Pipeline View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {['submitted', 'confirmed', 'in_progress', 'delivered'].map(status => (
            <div key={status}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-2xs tracking-widest text-neutral-400 uppercase">{status.replace(/_/g, ' ')}</p>
                <span className="text-xs text-neutral-400">{ordersByStatus[status].length}</span>
              </div>
              <div className="space-y-3">
                {ordersByStatus[status].map(order => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block border border-neutral-100 p-4 hover:border-neutral-300 transition-colors"
                  >
                    <p className="text-sm font-medium text-neutral-900 truncate">{order.title}</p>
                    <p className="text-xs text-neutral-400 mt-1">{order.customerId}</p>
                  </Link>
                ))}
                {ordersByStatus[status].length === 0 && (
                  <div className="border border-dashed border-neutral-200 p-4 text-center">
                    <p className="text-xs text-neutral-400">No orders</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
