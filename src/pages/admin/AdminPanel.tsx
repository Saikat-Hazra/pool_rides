import { useEffect, useState } from 'react'
import { getAllUsers } from '@/services/authService'
import { getAllPools } from '@/services/poolService'
import type { User, Pool } from '@/types'
import { COLLEGES } from '@/data/seed'
import { Shield, Car, Clock, Lock } from 'lucide-react'

const TABS = ['Active Logins', 'Pools'] as const
type AdminTab = typeof TABS[number]

export default function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>('Active Logins')
  const [users, setUsers] = useState<User[]>([])
  const [pools, setPools] = useState<Pool[]>([])

  function refresh() {
    setUsers(getAllUsers().filter((u) => u.role !== 'admin'))
    setPools(getAllPools())
  }

  useEffect(() => { refresh() }, [])



  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="text-sm text-slate-400">Manage users, reports, and pilots.</p>
        </div>
      </div>



      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
              tab === t ? 'bg-slate-800 text-white shadow-sm shadow-black' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t === 'Active Logins' && <Clock className="w-3.5 h-3.5" />}
            {t === 'Pools' && <Car className="w-3.5 h-3.5" />}
            {t}
          </button>
        ))}
      </div>



      {/* Active Logins tab */}
      {tab === 'Active Logins' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">College</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users
                .filter((u) => u.lastLoginAt)
                .sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime())
                .map((u) => {
                  const college = COLLEGES.find((c) => c.id === u.collegeId)
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{college?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-teal-400 font-medium text-xs">
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



      {/* Pools tab */}
      {tab === 'Pools' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Seats</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Restrictions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pools.map((p) => {
                const creator = users.find(u => u.id === p.creatorId)
                return (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{p.originLabel} → {p.destinationLabel}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-tight">{p.timeWindowStart} – {p.timeWindowEnd}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-sm text-slate-200 capitalize font-medium">{p.date === 'recurring' ? 'Recurring' : new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div className="text-xs text-slate-500 mt-0.5">By {creator?.name?.split(' ')[0] ?? 'Unknown'} · ₹{p.estimatedTotalFare}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{p.seatsFilled}/{p.seatsTotal}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.womenOnly && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-900/30 text-pink-300 border border-pink-800/40 font-bold uppercase">Women Only</span>
                      )}
                      {p.verifiedOnly ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-900/30 text-teal-300 border border-teal-800/40 font-bold uppercase flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          {COLLEGES.find(c => c.id === p.collegeId)?.name.split(' ')[0] ?? 'Verified'}
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 uppercase font-medium">Public</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                      p.status === 'open' ? 'bg-teal-900/30 text-teal-300 border border-teal-800/50' :
                      p.status === 'full' ? 'bg-amber-900/30 text-amber-300 border border-amber-800/50' :
                      p.status === 'completed' ? 'bg-green-900/30 text-green-300 border border-green-800/50' :
                      'bg-slate-800 text-slate-500 border border-slate-700'
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
