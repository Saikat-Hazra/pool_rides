import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileSchema, type ProfileFormData } from '@/schemas'
import { useAuthStore } from '@/store/authStore'
import { updateUser } from '@/services/authService'
import { useUIStore } from '@/store/uiStore'
import { VerifiedBadge } from '@/components/UI/Badges'
import { BENGALURU_AREAS, COLLEGES } from '@/data/seed'
import { User, Shield, AlertCircle } from 'lucide-react'

export default function Profile() {
  const { currentUser, updateCurrentUser } = useAuthStore()
  const { addToast } = useUIStore()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: currentUser?.name ?? '',
      homeArea: currentUser?.homeArea ?? '',
      yearOfStudy: currentUser?.yearOfStudy,
      gender: currentUser?.gender,
      phone: currentUser?.phone,
    },
  })

  if (!currentUser) return null

  const college = COLLEGES.find((c) => c.id === currentUser.collegeId)

  async function onSubmit(data: ProfileFormData) {
    setSaving(true)
    try {
      const updated = { ...currentUser, ...data }
      updateUser(updated)
      updateCurrentUser(updated)
      addToast('Profile updated!', 'success')
    } catch {
      addToast('Failed to save profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="page-title mb-6">Profile & settings</h1>

      {/* Identity card */}
      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-teal-700">{currentUser.name.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-gray-900 text-lg">{currentUser.name}</h2>
            <VerifiedBadge verified={currentUser.verifiedStatus === 'verified'} />
          </div>
          <p className="text-sm text-gray-500">{currentUser.email}</p>
          {college && <p className="text-sm text-teal-600 font-medium">{college.name}</p>}
        </div>
        <div>
          {currentUser.verifiedStatus === 'pending' && (
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Pending verification
            </div>
          )}
          {currentUser.verifiedStatus === 'verified' && (
            <div className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              Verified student
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="section-title mb-5">Edit profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="name">Display name</label>
            <input id="name" {...register('name')} className="input-field" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="homeArea">Home area</label>
              <select id="homeArea" {...register('homeArea')} className="input-field">
                <option value="">Select area</option>
                {BENGALURU_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="year">Year of study</label>
              <select id="year" {...register('yearOfStudy')} className="input-field">
                <option value="">Not specified</option>
                {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="gender">Gender</label>
              <select id="gender" {...register('gender')} className="input-field">
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone (optional)</label>
              <input id="phone" {...register('phone')} className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Read-only info */}
      <div className="card p-6 mt-4">
        <h2 className="section-title mb-4">Account details</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-400">Email</dt>
            <dd className="font-medium text-gray-900">{currentUser.email}</dd>
          </div>
          <div>
            <dt className="text-gray-400">College</dt>
            <dd className="font-medium text-gray-900">{college?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Member since</dt>
            <dd className="font-medium text-gray-900">{new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Role</dt>
            <dd className="font-medium text-gray-900 capitalize">{currentUser.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
