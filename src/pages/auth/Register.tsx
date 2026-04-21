import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { RegisterSchema, type RegisterFormData } from '@/schemas'
import { register as registerUser, loginWithGoogle } from '@/services/authService'
import { login } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { COLLEGES } from '@/data/seed'

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { addToast } = useUIStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(RegisterSchema) })

  async function onSubmit(data: RegisterFormData) {
    setLoading(true)
    try {
      await registerUser(data.name, data.email, data.password, data.collegeId)
      const { user } = await login(data.email, data.password)
      setUser(user)
      addToast('Account created! Let\'s set up your commute.', 'success')
      navigate('/onboarding')
    } catch (err: any) {
      addToast(err.message ?? 'Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-white text-xl">
            <img src="/Pool-rides_logo.png" alt="PoolRides" className="w-9 h-9 object-contain" />
            PoolRides
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4 mb-1">Create your account</h1>
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" {...register('name')} className="input-field" placeholder="Arjun Sharma" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" {...register('email')} className="input-field" placeholder="you@rvce.edu.in" type="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="college">College</label>
              <select id="college" {...register('collegeId')} className="input-field">
                <option value="">Select your college</option>
                {COLLEGES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.collegeId && <p className="text-xs text-red-500 mt-1">{errors.collegeId.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  {...register('password')}
                  className="input-field pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-950 text-slate-500">Or integrate swiftly</span></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true)
                  const { user } = await loginWithGoogle()
                  useAuthStore.getState().setUser(user)
                  // No specific pool set up yet unless migrating
                  useUIStore.getState().addToast('Account created via Google SSO!', 'success')
                  navigate(user.homeArea ? '/dashboard' : '/onboarding')
                } catch (err: any) {
                  useUIStore.getState().addToast(err.message, 'error')
                } finally {
                  setLoading(false)
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-800 rounded-lg text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>
          </form>

          <div className="mt-6 p-3 bg-teal-900/20 rounded-lg border border-teal-800/30">
            <p className="text-xs text-teal-400">
              <strong>Demo accounts:</strong> arjun@rvce.edu.in · priya@pes.edu · admin@poolrides.in — all with password <code className="text-teal-300">password123</code> (admin: admin123)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
