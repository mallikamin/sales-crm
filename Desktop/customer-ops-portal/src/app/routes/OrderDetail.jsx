import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthUser } from '../../lib/auth'
import { getOrder, updateOrder, addOrderUpdate, listOrderUpdates } from '../../lib/db/orders'
import { listTasks, createTask, updateTask, deleteTask } from '../../lib/db/tasks'
import { listComments, addComment } from '../../lib/db/comments'
import { listStaffUsers } from '../../lib/db/users'

const STATUSES = ['submitted', 'confirmed', 'in_progress', 'delivered', 'closed', 'cancelled']
const TASK_STATUSES = ['todo', 'doing', 'blocked', 'done']

const STATUS_STYLES = {
  submitted: 'bg-neutral-100 text-neutral-600',
  confirmed: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-neutral-100 text-neutral-400',
  cancelled: 'bg-red-50 text-red-600',
  todo: 'bg-neutral-100 text-neutral-600',
  doing: 'bg-blue-50 text-blue-700',
  blocked: 'bg-red-50 text-red-600',
  done: 'bg-emerald-50 text-emerald-700',
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuthUser()
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff'

  const [order, setOrder] = useState(null)
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState([])
  const [updates, setUpdates] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [newTask, setNewTask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  const refresh = async () => {
    const [o, t, c, u, staff] = await Promise.all([
      getOrder(orderId),
      listTasks(orderId),
      listComments(orderId),
      listOrderUpdates(orderId),
      isStaff ? listStaffUsers() : Promise.resolve([])
    ])
    setOrder(o)
    setTasks(t)
    setComments(c)
    setUpdates(u)
    setStaffUsers(staff)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [orderId])

  // Comment threading
  const threadedComments = useMemo(() => {
    const top = comments.filter(c => !c.parentId)
    const replies = comments.filter(c => c.parentId)
    return top.map(c => ({
      ...c,
      replies: replies.filter(r => r.parentId === c.id)
    }))
  }, [comments])

  // Task organization
  const parentTasks = useMemo(() => tasks.filter(t => !t.parentTaskId), [tasks])
  const subtaskMap = useMemo(() => {
    const map = {}
    tasks.filter(t => t.parentTaskId).forEach(t => {
      if (!map[t.parentTaskId]) map[t.parentTaskId] = []
      map[t.parentTaskId].push(t)
    })
    return map
  }, [tasks])

  const handleStatusChange = async (newStatus) => {
    if (!isStaff || newStatus === order.status) return
    setBusy(true)
    await updateOrder(orderId, { status: newStatus })
    await addOrderUpdate(orderId, {
      type: 'status_change',
      message: `Status changed to ${newStatus.replace(/_/g, ' ')}`,
      createdByUid: user.uid,
      createdByName: profile?.name
    })
    await refresh()
    setBusy(false)
  }

  const handleAssignmentChange = async (uid) => {
    if (!isStaff) return
    setBusy(true)
    const name = staffUsers.find(s => s.id === uid)?.name || 'Unassigned'
    await updateOrder(orderId, { assignedToUid: uid || null })
    await addOrderUpdate(orderId, {
      type: 'assignment',
      message: uid ? `Assigned to ${name}` : 'Unassigned',
      createdByUid: user.uid,
      createdByName: profile?.name
    })
    await refresh()
    setBusy(false)
  }

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    setBusy(true)
    await createTask(orderId, { title: newTask.trim(), createdByUid: user.uid })
    setNewTask('')
    await refresh()
    setBusy(false)
  }

  const handleTaskStatus = async (taskId, status) => {
    setBusy(true)
    await updateTask(orderId, taskId, { status })
    await refresh()
    setBusy(false)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setBusy(true)
    await addComment(orderId, {
      message: newComment.trim(),
      createdByUid: user.uid,
      createdByName: profile?.name,
      parentId: replyTo
    })
    setNewComment('')
    setReplyTo(null)
    await refresh()
    setBusy(false)
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-4 h-4 border border-neutral-900 border-t-transparent animate-spin mx-auto" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-neutral-500 mb-6">Order not found</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
      </div>
    )
  }

  return (
    <div className="animate-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-xs text-neutral-400 hover:text-neutral-900 mb-8">
        ← Back to orders
      </button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12 pb-12 border-b border-neutral-100">
        <div>
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-4">Order</p>
          <h1 className="text-3xl font-extralight tracking-tight mb-2">{order.title}</h1>
          {order.summary && <p className="text-sm text-neutral-500">{order.summary}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className={`badge ${STATUS_STYLES[order.status]}`}>
              {order.status?.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-neutral-400">Customer: {order.customerId}</span>
            {order.assignedToUid && (
              <span className="text-xs text-neutral-400">
                Owner: {staffUsers.find(s => s.id === order.assignedToUid)?.name || '—'}
              </span>
            )}
          </div>
        </div>

        {/* Staff Controls */}
        {isStaff && (
          <div className="flex flex-wrap gap-3">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={busy}
              className="input-elite text-sm py-2"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select
              value={order.assignedToUid || ''}
              onChange={(e) => handleAssignmentChange(e.target.value)}
              disabled={busy}
              className="input-elite text-sm py-2"
            >
              <option value="">Unassigned</option>
              {staffUsers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-neutral-100">
        {['tasks', 'comments', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-xs tracking-widest uppercase transition-colors ${
              activeTab === tab
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {tab} {tab === 'tasks' && `(${tasks.length})`}
            {tab === 'comments' && `(${comments.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              {/* Add Task */}
              <div className="flex gap-3 mb-8">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Add a task..."
                  className="input-elite flex-1"
                  disabled={busy}
                />
                <button onClick={handleAddTask} disabled={busy || !newTask.trim()} className="btn-primary">
                  Add
                </button>
              </div>

              {/* Task List */}
              {parentTasks.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-neutral-200">
                  <p className="text-sm text-neutral-400">No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {parentTasks.map(task => (
                    <div key={task.id} className="border border-neutral-100 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                          {task.dueDate && (
                            <p className="text-xs text-neutral-400 mt-1">
                              Due: {task.dueDate?.toDate?.()?.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatus(task.id, e.target.value)}
                          disabled={busy}
                          className={`badge cursor-pointer ${STATUS_STYLES[task.status]}`}
                        >
                          {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Subtasks */}
                      {subtaskMap[task.id]?.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-neutral-100 space-y-2">
                          {subtaskMap[task.id].map(st => (
                            <div key={st.id} className="flex items-center justify-between">
                              <p className="text-xs text-neutral-600">{st.title}</p>
                              <select
                                value={st.status}
                                onChange={(e) => handleTaskStatus(st.id, e.target.value)}
                                disabled={busy}
                                className="text-2xs bg-transparent border-0 text-neutral-400"
                              >
                                {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              {/* Comment Input */}
              <div className="mb-8">
                {replyTo && (
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span>Replying to comment...</span>
                    <button onClick={() => setReplyTo(null)}>Cancel</button>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    className="input-elite flex-1"
                    disabled={busy}
                  />
                  <button onClick={handleAddComment} disabled={busy || !newComment.trim()} className="btn-primary">
                    Post
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {threadedComments.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-neutral-200">
                  <p className="text-sm text-neutral-400">No comments yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {threadedComments.map(comment => (
                    <div key={comment.id}>
                      <div className={`p-4 ${comment.createdByUid === user?.uid ? 'bg-neutral-900 text-white' : 'bg-neutral-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-xs ${comment.createdByUid === user?.uid ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {comment.createdByName || 'Unknown'}
                          </p>
                          <button
                            onClick={() => setReplyTo(comment.id)}
                            className={`text-xs ${comment.createdByUid === user?.uid ? 'text-neutral-400' : 'text-neutral-400'} hover:underline`}
                          >
                            Reply
                          </button>
                        </div>
                        <p className="text-sm">{comment.message}</p>
                      </div>

                      {/* Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="ml-6 mt-2 space-y-2">
                          {comment.replies.map(reply => (
                            <div
                              key={reply.id}
                              className={`p-3 ${reply.createdByUid === user?.uid ? 'bg-neutral-800 text-white' : 'bg-neutral-100'}`}
                            >
                              <p className={`text-xs mb-1 ${reply.createdByUid === user?.uid ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                {reply.createdByName}
                              </p>
                              <p className="text-xs">{reply.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              {updates.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-neutral-200">
                  <p className="text-sm text-neutral-400">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map(update => (
                    <div key={update.id} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-neutral-300 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-neutral-700">{update.message}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {update.createdByName || 'System'}
                          {update.createdAt?.toDate && ` · ${update.createdAt.toDate().toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Quick Info */}
        <div className="space-y-8">
          <div>
            <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-4">Order Details</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className="text-neutral-900">{order.status?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer</span>
                <span className="text-neutral-900">{order.customerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Created</span>
                <span className="text-neutral-900">
                  {order.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                </span>
              </div>
              {order.assignedToUid && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Owner</span>
                  <span className="text-neutral-900">
                    {staffUsers.find(s => s.id === order.assignedToUid)?.name || '—'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-4">Progress</p>
            <div className="space-y-2">
              {TASK_STATUSES.map(status => {
                const count = tasks.filter(t => t.status === status).length
                return (
                  <div key={status} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 capitalize">{status}</span>
                    <span className="text-neutral-900">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
