import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { OnboardingSchema, type OnboardingFormData } from '@/schemas'
import { useAuthStore } from '@/store/authStore'
import { updateUser } from '@/services/authService'
import { useUIStore } from '@/store/uiStore'
import { BENGALURU_AREAS } from '@/data/seed'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const STEPS_LABELS = ['Home area', 'Schedule', 'Preferences', 'Done']

export default function Onboarding() {
  const navigate = useNavigate()
  const { currentUser, updateCurrentUser } = useAuthStore()
  const { addToast } = useUIStore()
  const [step, setStep] = useState(0)
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      preferredDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      commuteMode: 'any',
      preferredTimeStart: '08:00',
      preferredTimeEnd: '09:00',
    },
  })

  function toggleDay(day: string) {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]
    setSelectedDays(next)
    setValue('preferredDays', next as any)
  }

  async function onSubmit(data: OnboardingFormData) {
    if (!currentUser) return
    const updated = {
      ...currentUser,
      homeArea: data.homeArea,
      yearOfStudy: data.yearOfStudy,
      gender: data.gender,
      preferencesJson: {
        ...currentUser.preferencesJson,
        commuteMode: data.commuteMode,
      },
    }
    updateUser(updated)
    updateCurrentUser(updated)
    addToast('Profile set up! Welcome to PoolRides 🚗', 'success')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-teal-700 text-lg mb-8 justify-center">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          PoolRides
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS_LABELS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < step ? 'bg-teal-600 text-white' : i === step ? 'bg-teal-100 text-teal-700 border-2 border-teal-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-teal-700' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < STEPS_LABELS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-teal-400' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card p-6">
            {/* Step 0: Home area */}
            {step === 0 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Where do you live?</h2>
                <p className="text-sm text-gray-500 mb-6">We'll use this to find pools near you.</p>
                <div>
                  <label className="label" htmlFor="homeArea">Home area</label>
                  <select id="homeArea" {...register('homeArea')} className="input-field">
                    <option value="">Select your area</option>
                    {BENGALURU_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.homeArea && <p className="text-xs text-red-500 mt-1">{errors.homeArea.message}</p>}
                </div>
                <div className="mt-4">
                  <label className="label" htmlFor="destination">Your campus / destination</label>
                  <input id="destination" {...register('destinationLabel')} className="input-field" placeholder="e.g. RVCE, PES University" />
                  {errors.destinationLabel && <p className="text-xs text-red-500 mt-1">{errors.destinationLabel.message}</p>}
                </div>
              </div>
            )}

            {/* Step 1: Schedule */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-1">When do you commute?</h2>
                <p className="text-sm text-gray-500 mb-6">Select your usual commute days and time window.</p>
                <div className="mb-4">
                  <label className="label">Commute days</label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          selectedDays.includes(d)
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  {errors.preferredDays && <p className="text-xs text-red-500 mt-1">{errors.preferredDays.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="timeStart">Earliest departure</label>
                    <input id="timeStart" type="time" {...register('preferredTimeStart')} className="input-field" />
                  </div>
                  <div>
                    <label className="label" htmlFor="timeEnd">Latest departure</label>
                    <input id="timeEnd" type="time" {...register('preferredTimeEnd')} className="input-field" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-1">A bit more about you</h2>
                <p className="text-sm text-gray-500 mb-6">Optional but helps us find better matches.</p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label" htmlFor="year">Year of study</label>
                    <select id="year" {...register('yearOfStudy')} className="input-field">
                      <option value="">Select year</option>
                      {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="gender">Gender (optional)</label>
                    <select id="gender" {...register('gender')} className="input-field">
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="mode">Preferred commute mode</label>
                    <select id="mode" {...register('commuteMode')} className="input-field">
                      <option value="any">Any (cab, auto, bike)</option>
                      <option value="cab">Cab only</option>
                      <option value="auto">Auto only</option>
                      <option value="bike">Bike only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < 2 ? (
              <button type="button" className="btn-primary" onClick={() => setStep((s) => s + 1)}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" className="btn-primary">
                Finish setup <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
