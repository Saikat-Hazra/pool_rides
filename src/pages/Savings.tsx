import { useEffect, useState, type ComponentType } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getSavingsForUser } from '@/services/savingsService'
import { calcWeeklySavings, calcMonthlySavings, calcTotalSavings, groupByWeek } from '@/utils/costCalc'
import { TrendingUp, Car, IndianRupee } from 'lucide-react'
import type { SavingsEntry } from '@/types'

export default function Savings() {
  const { currentUser } = useAuthStore()
  const [entries, setEntries] = useState<SavingsEntry[]>([])

  useEffect(() => {
    if (currentUser) setEntries(getSavingsForUser(currentUser.id))
  }, [currentUser])

  if (!currentUser) return null

  const weekly = calcWeeklySavings(entries, currentUser.id)
  const monthly = calcMonthlySavings(entries, currentUser.id)
  const total = calcTotalSavings(entries, currentUser.id)
  const totalSoloWouldHaveCost = entries.reduce((s, e) => s + e.soloEstimatedCost, 0)
  const totalActualPaid = entries.reduce((s, e) => s + e.pooledCost, 0)
  const weeklyData = groupByWeek(entries, currentUser.id)

  // Simple bar chart values
  const maxVal = weeklyData.length > 0 ? Math.max(...weeklyData.map((w) => w.savings)) : 1

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="page-title">Savings</h1>
        <p className="text-sm text-slate-400 mt-1">Track how much you've saved by pooling rides.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <SavingsStatCard label="This week" value={`₹${weekly}`} icon={TrendingUp} color="teal" />
        <SavingsStatCard label="This month" value={`₹${monthly}`} icon={TrendingUp} color="green" />
        <SavingsStatCard label="All time saved" value={`₹${total}`} icon={Car} color="blue" />
        <SavingsStatCard label="Ride count" value={String(entries.length)} icon={IndianRupee} color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card p-6">
          <h2 className="section-title mb-6">Weekly savings</h2>
          {weeklyData.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Complete your first pooled ride to see savings here.
            </div>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {weeklyData.map((w) => {
                const height = maxVal > 0 ? Math.max(8, Math.round((w.savings / maxVal) * 140)) : 8
                const weekLabel = new Date(w.week).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                return (
                  <div key={w.week} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs font-semibold text-teal-400">₹{w.savings}</span>
                    <div
                      className="w-full bg-teal-500 rounded-t-md transition-all shadow-sm shadow-teal-500/20"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-xs text-slate-500 rotate-[-45deg] origin-top-left whitespace-nowrap">{weekLabel}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Solo vs pooled */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Solo vs pooled cost</h2>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No rides recorded yet.</div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">What you would have paid solo</span>
                  <span className="font-semibold text-slate-500 line-through">₹{totalSoloWouldHaveCost}</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">What you actually paid</span>
                  <span className="font-semibold text-teal-400">₹{totalActualPaid}</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${totalSoloWouldHaveCost > 0 ? (totalActualPaid / totalSoloWouldHaveCost) * 100 : 100}%` }}
                  />
                </div>
              </div>
              <div className="p-4 bg-green-900/20 rounded-xl border border-green-800/30 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">₹{total}</div>
                <div className="text-sm text-green-300">saved across {entries.length} rides</div>
                {entries.length >= 22 && (
                  <div className="text-xs text-green-500 mt-1">≈ ₹{Math.round((total / entries.length) * 22)} saved per month at this rate</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ride log */}
      {entries.length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="section-title mb-4">Ride log</h2>
          <div className="flex flex-col gap-2">
            {[...entries].reverse().slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm text-slate-200">{new Date(e.rideDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-xs text-slate-500">Paid ₹{e.pooledCost} · Solo would be ₹{e.soloEstimatedCost}</p>
                </div>
                <span className="text-sm font-semibold text-green-400">–₹{e.savingsAmount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SavingsStatCardProps {
  label: string; value: string; icon: ComponentType<{className?: string}>; color: string
}
const colorMapS: Record<string, string> = {
  teal: 'bg-teal-900/30 text-teal-400',
  green: 'bg-green-900/30 text-green-400',
  blue: 'bg-blue-900/30 text-blue-400',
  amber: 'bg-amber-900/30 text-amber-400',
}
function SavingsStatCard({ label, value, icon: Icon, color }: SavingsStatCardProps) {
  return (
    <div className="card p-4 border-slate-800/60 bg-slate-900/40">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorMapS[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
