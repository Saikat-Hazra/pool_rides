import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getPoolById,
  getMembersForPool,
  requestJoin,
  respondToJoin,
  getMessages,
  postMessage,
  updatePoolStatus,
  submitReport,
} from '@/services/poolService'
import { getAllUsers } from '@/services/authService'
import { recordSavings } from '@/services/savingsService'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { StatusBadge, VerifiedBadge, WomenOnlyBadge } from '@/components/UI/Badges'
import { COLLEGES } from '@/data/seed'
import type { Pool, PoolMember, PoolMessage, User } from '@/types'
import {
  MapPin, Clock, Users, IndianRupee, ArrowLeft, Send,
  CheckCircle, XCircle, Flag, X, AlertTriangle,
} from 'lucide-react'

const STATUS_UPDATE_PRESETS = [
  'Running 10 mins late',
  'On my way to pickup point',
  'Reached pickup point',
  'Ride started',
  'Ride completed',
]

export default function PoolDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { addToast } = useUIStore()

  const [pool, setPool] = useState<Pool | null>(null)
  const [members, setMembers] = useState<PoolMember[]>([])
  const [messages, setMessages] = useState<PoolMessage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [msgText, setMsgText] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')

  function refresh() {
    if (!id) return
    const p = getPoolById(id)
    if (!p) { navigate('/discover'); addToast('Pool not found or was removed.', 'error'); return }
    setPool(p)
    setMembers(getMembersForPool(id))
    setMessages(getMessages(id))
    setUsers(getAllUsers())
  }

  useEffect(() => { refresh() }, [id])

  if (!pool || !currentUser) return null

  const myMembership = members.find((m) => m.userId === currentUser.id)
  const acceptedMembers = members.filter((m) => m.joinStatus === 'accepted')
  const pendingMembers = members.filter((m) => m.joinStatus === 'pending')
  const isCreator = pool.creatorId === currentUser.id
  const isMember = myMembership?.joinStatus === 'accepted'
  const isPending = myMembership?.joinStatus === 'pending'
  const isFull = pool.seatsFilled >= pool.seatsTotal
  const collegeName = COLLEGES.find((c) => c.id === pool.collegeId)?.name ?? '—'
  const splitAmount = acceptedMembers.length > 0
    ? Math.round(pool.estimatedTotalFare / acceptedMembers.length) : pool.estimatedTotalFare
  const soloFare = Math.round(pool.estimatedTotalFare * 1.3)
  const savings = soloFare - splitAmount

  function getUserName(userId: string) {
    return users.find((u) => u.id === userId)?.name ?? 'Unknown'
  }

  function getUserVerified(userId: string) {
    return users.find((u) => u.id === userId)?.verifiedStatus === 'verified'
  }

  function handleJoin() {
    if (!currentUser) return
    try {
      requestJoin(pool.id, currentUser.id)
      addToast('Join request sent! Waiting for the creator to approve.', 'success')
      refresh()
    } catch (err: any) {
      addToast(err.message, 'error')
    }
  }

  function handleRespond(memberId: string, accept: boolean) {
    respondToJoin(memberId, accept)
    addToast(accept ? 'Request approved ✓' : 'Request rejected.', accept ? 'success' : 'info')
    refresh()
  }

  function handleSendMessage() {
    if (!msgText.trim()) return
    postMessage(pool.id, currentUser.id, msgText.trim())
    setMsgText('')
    refresh()
  }

  function handleStatusUpdate(preset: string) {
    postMessage(pool.id, currentUser.id, preset, 'status_update')
    refresh()
  }

  function handleCompleteRide() {
    updatePoolStatus(pool.id, 'completed')
    // Record savings for all accepted members
    for (const m of acceptedMembers) {
      recordSavings({
        userId: m.userId,
        poolId: pool.id,
        soloEstimatedCost: soloFare,
        pooledCost: splitAmount,
        savingsAmount: Math.max(0, soloFare - splitAmount),
        rideDate: new Date().toISOString(),
      })
    }
    addToast('Ride marked as completed. Savings recorded!', 'success')
    refresh()
  }

  function handleReport() {
    if (reportReason.trim().length < 10) {
      addToast('Please provide more detail (min 10 characters).', 'error')
      return
    }
    submitReport({ reporterUserId: currentUser.id, poolId: pool.id, reason: reportReason.trim() })
    addToast('Report submitted. Our team will review it.', 'success')
    setShowReport(false)
    setReportReason('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Pool summary */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={pool.status} />
                <VerifiedBadge verified={pool.verifiedOnly} />
                <WomenOnlyBadge show={pool.womenOnly} />
              </div>
              {!isCreator && (isMember || isPending || pool.status === 'open') && (
                <button onClick={() => setShowReport(true)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              )}
            </div>

            <p className="text-xs text-teal-600 font-medium mb-2">{collegeName}</p>

            {/* Route visual */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-teal-500 ring-2 ring-teal-200" />
                <div className="w-px h-8 bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-200" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{pool.originLabel}</p>
                <p className="text-sm text-gray-500 mt-2">{pool.destinationLabel}</p>
              </div>
            </div>

            {pool.pickupNotes && (
              <div className="flex gap-2 p-3 bg-gray-50 rounded-lg mb-3">
                <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700">{pool.pickupNotes}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                {pool.timeWindowStart} – {pool.timeWindowEnd}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                {pool.seatsFilled}/{pool.seatsTotal} seats filled
              </span>
            </div>

            {pool.recurrenceDays && (
              <div className="flex gap-1 flex-wrap mt-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d} className={`text-xs px-1.5 py-0.5 rounded font-medium ${pool.recurrenceDays?.includes(d as any) ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'}`}>{d}</span>
                ))}
              </div>
            )}
          </div>

          {/* Creator pending requests */}
          {isCreator && pendingMembers.length > 0 && (
            <div className="card p-6">
              <h2 className="section-title mb-4">Join requests ({pendingMembers.length})</h2>
              <div className="flex flex-col gap-3">
                {pendingMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getUserName(m.userId)}</p>
                      <p className="text-xs text-gray-500">Requested to join</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRespond(m.id, true)} className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => handleRespond(m.id, false)} className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity feed */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Activity</h2>

            {/* Status update presets */}
            {(isMember || isCreator) && pool.status === 'open' && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Quick updates:</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_UPDATE_PRESETS.map((p) => (
                    <button key={p} onClick={() => handleStatusUpdate(p)} className="text-xs px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-teal-100 hover:text-teal-700 text-gray-700 transition-colors border border-transparent hover:border-teal-200">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No activity yet. Be the first to post an update.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-teal-700">
                      {getUserName(msg.userId).charAt(0)}
                    </div>
                    <div className={`flex flex-col gap-0.5 max-w-xs ${msg.userId === currentUser.id ? 'items-end' : ''}`}>
                      <span className="text-xs text-gray-400">{getUserName(msg.userId)}</span>
                      <div className={`px-3 py-2 rounded-xl text-sm ${
                        msg.messageType === 'status_update'
                          ? 'bg-teal-50 border border-teal-200 text-teal-800'
                          : msg.userId === currentUser.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.body}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            {(isMember || isCreator) && (
              <div className="flex gap-2">
                <input
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="input-field flex-1"
                  placeholder="Type a message or update…"
                />
                <button onClick={handleSendMessage} className="btn-primary px-3">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Cost split */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Cost split</h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated total</span>
                <span className="font-semibold">₹{pool.estimatedTotalFare}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Confirmed riders</span>
                <span className="font-semibold">{acceptedMembers.length}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold">Your share</span>
                <span className="text-lg font-bold text-teal-700">₹{splitAmount}</span>
              </div>
              {savings > 0 && (
                <div className="p-2.5 bg-green-50 rounded-lg border border-green-200 text-center">
                  <span className="text-sm font-semibold text-green-700">You save ₹{savings} vs solo</span>
                </div>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Members ({acceptedMembers.length}/{pool.seatsTotal})</h2>
            <div className="flex flex-col gap-2">
              {acceptedMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700">
                    {getUserName(m.userId).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate block">{getUserName(m.userId)}</span>
                    {m.role === 'creator' && <span className="text-xs text-gray-400">Creator</span>}
                  </div>
                  <VerifiedBadge verified={getUserVerified(m.userId)} />
                </div>
              ))}
              {acceptedMembers.length === 0 && <p className="text-sm text-gray-400">No confirmed members yet.</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-5 flex flex-col gap-3">
            {!isCreator && !isMember && !isPending && pool.status !== 'cancelled' && pool.status !== 'completed' && (
              isFull ? (
                <div>
                  <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">Pool is full</button>
                  <p className="text-xs text-gray-400 text-center mt-2">Ask the creator about the waitlist.</p>
                </div>
              ) : (
                <button onClick={handleJoin} className="btn-primary w-full">Request to join</button>
              )
            )}
            {isPending && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
                <p className="text-sm text-amber-800 font-medium">Join request pending</p>
                <p className="text-xs text-amber-600 mt-0.5">Waiting for creator approval</p>
              </div>
            )}
            {isMember && !isCreator && (
              <button onClick={() => addToast('You have left the pool.', 'info')} className="btn-secondary w-full text-red-600 border-red-200 hover:bg-red-50">
                Leave pool
              </button>
            )}
            {isCreator && pool.status === 'open' && (
              <button onClick={handleCompleteRide} className="btn-primary w-full">
                <CheckCircle className="w-4 h-4" /> Mark as completed
              </button>
            )}
            {isCreator && pool.status === 'open' && (
              <button onClick={() => { updatePoolStatus(pool.id, 'cancelled'); refresh(); addToast('Pool cancelled.', 'info') }} className="btn-secondary w-full text-red-600 border-red-200">
                <X className="w-4 h-4" /> Cancel pool
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Report this pool</h3>
            </div>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="input-field h-28 resize-none mb-4"
              placeholder="Describe the issue (min 10 characters)…"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowReport(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleReport} className="btn-danger">Submit report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
