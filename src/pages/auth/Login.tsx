import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Eye, EyeOff, Shield } from 'lucide-react'
import { useState } from 'react'
import { LoginSchema, type LoginFormData } from '@/schemas'
import { login, loginWithGoogle } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { getAllPools } from '@/services/poolService'
import { usePoolStore } from '@/store/poolStore'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { setPools } = usePoolStore()
  const { addToast } = useUIStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(LoginSchema) })

  async function onSubmit(data: LoginFormData) {
    setLoading(true)
    try {
      const { user } = await login(data.email, data.password)
      setUser(user)
      setPools(getAllPools())
      addToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success')
      navigate(user.homeArea ? '/dashboard' : '/onboarding')
    } catch (err: any) {
      addToast(err.message ?? 'Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-teal-700 text-xl">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            PoolRides
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Sign in to PoolRides</h1>
          <p className="text-sm text-gray-500">
            New here?{' '}
            <Link to="/register" className="text-teal-600 hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" {...register('email')} className="input-field" placeholder="you@rvce.edu.in" type="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  {...register('password')}
                  className="input-field pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Admin Access</span></div>
            </div>

            <button 
              type="button" 
              onClick={() => {
                setValue('email', 'admin@poolrides.in')
                setValue('password', 'admin123')
                setTimeout(() => handleSubmit(onSubmit)(), 0)
              }} 
              className="btn-secondary w-full text-gray-700 font-medium"
            >
              <Shield className="w-4 h-4 text-gray-500" /> Admin Login Portal
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true)
                  const { user } = await loginWithGoogle()
                  useAuthStore.getState().setUser(user)
                  usePoolStore.getState().setPools(getAllPools())
                  useUIStore.getState().addToast(`Authenticated via Google as ${user.name.split(' ')[0]}!`, 'success')
                  navigate(user.homeArea ? '/dashboard' : '/onboarding')
                } catch (err: any) {
                  useUIStore.getState().addToast(err.message, 'error')
                } finally {
                  setLoading(false)
                }
              }}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </form>

          <div className="mt-6 p-3 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-xs text-teal-700">
              <strong>Demo accounts:</strong> arjun@rvce.edu.in · priya@pes.edu (Standard passcode: <code>password123</code>)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
