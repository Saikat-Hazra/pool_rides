import React, { useEffect, useState } from 'react'
import { getAllUsers, updateUser } from '@/services/authService'
import { getAllPools, getAllReports, updateReportStatus } from '@/services/poolService'
import { useUIStore } from '@/store/uiStore'
import type { User, Pool, Report } from '@/types'
import { COLLEGES } from '@/data/seed'
import { Shield, CheckCircle, XCircle, Flag, Users, Car, Clock } from 'lucide-react'

const TABS = ['Users', 'Active Logins', 'Reports', 'Pools'] as const
type AdminTab = typeof TABS[number]

export default function AdminPanel() {
  const { addToast } = useUIStore()
  const [tab, setTab] = useState<AdminTab>('Users')
  const [users, setUsers] = useState<User[]>([])
  const [pools, setPools] = useState<Pool[]>([])
  const [reports, setReports] = useState<Report[]>([])

  function refresh() {
    setUsers(getAllUsers().filter((u) => u.role !== 'admin'))
    setPools(getAllPools())
    setReports(getAllReports())
  }

  useEffect(() => { refresh() }, [])

  function verifyUser(user: User) {
    const updated = { ...user, verifiedStatus: 'verified' as const }
    updateUser(updated)
    addToast(`${user.name} verified ✓`, 'success')
    refresh()
  }

  function suspendUser(user: User) {
    const updated = { ...user, verifiedStatus: 'suspended' as const }
    updateUser(updated)
    addToast(`${user.name} suspended.`, 'info')
    refresh()
  }

  function closeReport(report: Report) {
    updateReportStatus(report.id, 'reviewed')
    addToast('Report marked as reviewed.', 'success')
    refresh()
  }

  const pendingUsers = users.filter((u) => u.verifiedStatus === 'pending')
  const openReports = reports.filter((r) => r.status === 'open')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage users, reports, and pilots.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-xs text-gray-500">Total students</div>
          {pendingUsers.length > 0 && <div className="text-xs text-amber-600 font-medium mt-1">{pendingUsers.length} pending</div>}
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{pools.filter(p => p.status === 'open').length}</div>
          <div className="text-xs text-gray-500">Active pools</div>
        </div>
        <div className="card p-4 text-center">
          <div className={`text-2xl font-bold ${openReports.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{openReports.length}</div>
          <div className="text-xs text-gray-500">Open reports</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'Users' && <Users className="w-3.5 h-3.5" />}
            {t === 'Active Logins' && <Clock className="w-3.5 h-3.5" />}
            {t === 'Reports' && <Flag className="w-3.5 h-3.5" />}
            {t === 'Pools' && <Car className="w-3.5 h-3.5" />}
            {t}
            {t === 'Users' && pendingUsers.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">{pendingUsers.length}</span>
            )}
            {t === 'Reports' && openReports.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{openReports.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'Users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Activity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const college = COLLEGES.find((c) => c.id === u.collegeId)
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{college?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                      <div className="text-gray-700">Joined: {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="mt-0.5">Last login: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={u.verifiedStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {u.verifiedStatus !== 'verified' && u.verifiedStatus !== 'suspended' && (
                          <button onClick={() => verifyUser(u)} className="flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors">
                            <CheckCircle className="w-3 h-3" /> Verify
                          </button>
                        )}
                        {u.verifiedStatus !== 'suspended' && (
                          <button onClick={() => suspendUser(u)} className="flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                            <XCircle className="w-3 h-3" /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No students yet.</p>}
        </div>
      )}

      {/* Active Logins tab */}
      {tab === 'Active Logins' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users
                .filter((u) => u.lastLoginAt)
                .sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime())
                .map((u) => {
                  const college = COLLEGES.find((c) => c.id === u.collegeId)
                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{college?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-teal-700 font-medium text-xs">
                        {new Date(u.lastLoginAt!).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          {users.filter((u) => u.lastLoginAt).length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">No active login records yet.</p>
          )}
        </div>
      )}

      {/* Reports tab */}
      {tab === 'Reports' && (
        <div className="flex flex-col gap-3">
          {reports.length === 0 ? (
            <div className="card flex flex-col items-center py-12 text-center">
              <Shield className="w-8 h-8 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-700">No reports to review</p>
              <p className="text-xs text-gray-400">The community looks healthy.</p>
            </div>
          ) : reports.map((r) => {
            const reporter = users.find((u) => u.id === r.reporterUserId)
            return (
              <div key={r.id} className={`card p-4 ${r.status === 'open' ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-0.5">By: {reporter?.name ?? r.reporterUserId}</p>
                    <p className="text-sm text-gray-700">{r.reason}</p>
                    {r.poolId && <p className="text-xs text-gray-400 mt-1">Pool: {r.poolId}</p>}
                  </div>
                  {r.status === 'open' && (
                    <button onClick={() => closeReport(r)} className="text-xs py-1.5 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex-shrink-0">
                      Mark reviewed
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pools tab */}
      {tab === 'Pools' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Seats</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pools.map((p) => {
                const creator = users.find(u => u.id === p.creatorId)
                return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.originLabel} → {p.destinationLabel}</div>
                    <div className="text-xs text-gray-400">{p.timeWindowStart} – {p.timeWindowEnd}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-sm text-gray-800 capitalize font-medium">{p.date === 'recurring' ? 'Recurring' : new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div className="text-xs text-gray-500 mt-0.5">By {creator?.name?.split(' ')[0] ?? 'Unknown'} · ₹{p.estimatedTotalFare}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.seatsFilled}/{p.seatsTotal}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'open' ? 'bg-teal-100 text-teal-700' :
                      p.status === 'full' ? 'bg-amber-100 text-amber-700' :
                      p.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{p.status}</span>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const cls: Record<string, string> = {
    verified: 'bg-teal-100 text-teal-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-gray-200 text-gray-600',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${cls[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>
}
