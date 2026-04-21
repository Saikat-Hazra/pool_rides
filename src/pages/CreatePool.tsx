import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreatePoolSchema } from '@/schemas'
import { z } from 'zod'

type FormInput = z.input<typeof CreatePoolSchema>
type FormOutput = z.output<typeof CreatePoolSchema>
import { useAuthStore } from '@/store/authStore'
import { usePoolStore } from '@/store/poolStore'
import { useUIStore } from '@/store/uiStore'
import { createPool } from '@/services/poolService'
import { IndianRupee, Info, MapPin } from 'lucide-react'
import type { DayOfWeek, VisibilityType } from '@/types'
import MapPickerModal from '@/components/UI/MapPickerModal'

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CreatePool() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { addPool } = usePoolStore()
  const { addToast } = useUIStore()
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const [loading, setLoading] = useState(false)
  const [mapModalTarget, setMapModalTarget] = useState<'origin' | 'dest' | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(CreatePoolSchema),
    defaultValues: {
      seatsTotal: 3,
      estimatedTotalFare: 300,
      visibilityType: 'public',
      womenOnly: false,
      verifiedOnly: false,
      isRecurring: true,
    },
  })

  const isRecurring = watch('isRecurring')
  const fare = Number(watch('estimatedTotalFare') || 0)
  const seats = Number(watch('seatsTotal') || 1)
  const splitPreview = Math.round(fare / seats)

  if (!currentUser) return null

  function toggleDay(day: DayOfWeek) {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]
    setSelectedDays(next)
    setValue('recurrenceDays', next)
  }

  async function onSubmit(data: FormOutput) {
    if (!currentUser) return

    // Enforce: unverified users cannot create women-only pools
    if (data.womenOnly && currentUser.verifiedStatus !== 'verified') {
      addToast('Women-only pools require a verified campus email.', 'error')
      return
    }

    setLoading(true)
    try {
      const pool = createPool({
        creatorId: currentUser.id,
        collegeId: currentUser.collegeId,
        originLabel: data.originLabel,
        originCoords: data.originCoords,
        destinationLabel: data.destinationLabel,
        destCoords: data.destCoords,
        pickupNotes: data.pickupNotes,
        dropNotes: data.dropNotes,
        date: isRecurring ? 'recurring' : (data.date ?? ''),
        recurrenceDays: isRecurring ? selectedDays : undefined,
        timeWindowStart: data.timeWindowStart,
        timeWindowEnd: data.timeWindowEnd,
        estimatedTotalFare: data.estimatedTotalFare,
        seatsTotal: data.seatsTotal,
        visibilityType: data.visibilityType as VisibilityType,
        womenOnly: data.womenOnly,
        verifiedOnly: data.verifiedOnly,
      })
      addPool(pool)
      addToast('Pool created! Others can now discover and join it.', 'success')
      navigate(`/pool/${pool.id}`)
    } catch (err: any) {
      addToast(err.message ?? 'Failed to create pool.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="page-title">Create a pool</h1>
        <p className="text-sm text-slate-400 mt-1">Set up a recurring commute pool for your route. Others can discover and request to join.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Route */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Route</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Origin area</label>
              <button
                type="button"
                onClick={() => setMapModalTarget('origin')}
                className="w-full rounded-lg border border-slate-800 px-3 py-2.5 text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <span className={watch('originLabel') ? 'text-white line-clamp-1 pr-2' : 'text-slate-500'}>
                  {watch('originLabel') || 'Tap to set origin on map...'}
                </span>
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              </button>
              {errors.originLabel && <p className="text-xs text-red-500 mt-1">{errors.originLabel.message}</p>}
            </div>
            <div>
              <label className="label">Destination</label>
              <button
                type="button"
                onClick={() => setMapModalTarget('dest')}
                className="w-full rounded-lg border border-slate-800 px-3 py-2.5 text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <span className={watch('destinationLabel') ? 'text-white line-clamp-1 pr-2' : 'text-slate-500'}>
                  {watch('destinationLabel') || 'Tap to set destination map...'}
                </span>
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              </button>
              {errors.destinationLabel && <p className="text-xs text-red-500 mt-1">{errors.destinationLabel.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="pickup">Pickup instructions (optional)</label>
              <input id="pickup" {...register('pickupNotes')} className="input-field" placeholder="e.g. Marathahalli bridge, near Cafe Coffee Day" />
            </div>
            <div>
              <label className="label" htmlFor="drop">Drop instructions (optional)</label>
              <input id="drop" {...register('dropNotes')} className="input-field" placeholder="e.g. Main gate of campus" />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Schedule</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('isRecurring')} className="rounded border-gray-300 text-teal-600" />
              <span className="font-medium">Recurring commute (Mon–Fri or custom days)</span>
            </label>

            {isRecurring ? (
              <div>
                <label className="label">Repeat on</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selectedDays.includes(d)
                          ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-900/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="label" htmlFor="date">Date</label>
                <input id="date" type="date" {...register('date')} className="input-field" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="tstart">Earliest departure</label>
                <input id="tstart" type="time" {...register('timeWindowStart')} className="input-field" />
                {errors.timeWindowStart && <p className="text-xs text-red-500 mt-1">{errors.timeWindowStart.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="tend">Latest departure</label>
                <input id="tend" type="time" {...register('timeWindowEnd')} className="input-field" />
                {errors.timeWindowEnd && <p className="text-xs text-red-500 mt-1">{errors.timeWindowEnd.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Seats & Fare */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Seats & cost</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="seats">Seats available (exc. you)</label>
                <input id="seats" type="number" min={1} max={9} {...register('seatsTotal')} className="input-field" />
                {errors.seatsTotal && <p className="text-xs text-red-500 mt-1">{errors.seatsTotal.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="fare">Estimated total fare (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input id="fare" type="number" min={1} {...register('estimatedTotalFare')} className="input-field pl-8" />
                </div>
                {errors.estimatedTotalFare && <p className="text-xs text-red-500 mt-1">{errors.estimatedTotalFare.message}</p>}
              </div>
            </div>

            {/* Cost preview */}
            <div className="flex items-start gap-2 p-3 bg-teal-900/20 rounded-lg border border-teal-800/30">
              <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-teal-200">
                With {seats} rider{seats !== 1 ? 's' : ''}, each person pays approximately{' '}
                <strong className="text-white">₹{splitPreview}</strong> per ride.
              </p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Pool settings</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="visibility">Who can see this pool?</label>
              <select id="visibility" {...register('visibilityType')} className="input-field">
                <option value="public">Anyone on PoolRides</option>
                <option value="campus_only">My campus only</option>
                <option value="invite_only">Invite only (link sharing)</option>
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" {...register('verifiedOnly')} className="rounded border-slate-700 bg-slate-900 text-teal-600" />
                <span>
                  <span className="font-medium text-slate-200">Verified students only</span>
                  <span className="text-slate-500 ml-1.5"> — only campus-verified users can join</span>
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" {...register('womenOnly')} className="rounded border-slate-700 bg-slate-900 text-teal-600" />
                <span>
                  <span className="font-medium text-slate-200">Women-only pool</span>
                  <span className="text-slate-500 ml-1.5"> — requires campus verification</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating…' : 'Create pool'}
          </button>
        </div>
      </form>

      <MapPickerModal
        isOpen={mapModalTarget !== null}
        onClose={() => setMapModalTarget(null)}
        title={mapModalTarget === 'origin' ? 'Select Pickup Location' : 'Select Drop Location'}
        onSelect={(label, lat, lng) => {
          if (mapModalTarget === 'origin') {
            setValue('originLabel', label, { shouldValidate: true })
            setValue('originCoords', { lat, lng })
          } else if (mapModalTarget === 'dest') {
            setValue('destinationLabel', label, { shouldValidate: true })
            setValue('destCoords', { lat, lng })
          }
        }}
      />
    </div>
  )
}
