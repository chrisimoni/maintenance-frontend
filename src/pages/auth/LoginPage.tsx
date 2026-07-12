import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/ui/Spinner'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type Form = z.infer<typeof schema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    try {
      const res = await login(data.email, data.password)
      setAuth(res.user, res.token)
      toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(160deg, #2B5BA8 0%, #1d3f76 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-base">MIVA Open University</p>
            <p className="text-white/60 text-xs">Maintenance Portal</p>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Report it.<br />Track it.<br />Resolve it.
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            The university's digital platform for submitting and managing maintenance
            service requests — from faulty electricity to leaking pipes.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[['Fast', 'Submit requests in seconds'],['Tracked', 'Monitor every status change'],['Resolved', 'Officers close jobs faster']].map(([t, d]) => (
            <div key={t} className="bg-white/10 rounded-xl p-4">
              <p className="font-bold text-sm mb-1">{t}</p>
              <p className="text-white/60 text-xs">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <p className="font-bold text-gray-900">MIVA Maintenance Portal</p>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-500 mb-7">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('email')} placeholder="you@university.edu"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('password')} type="password" placeholder="••••••••"
                    className={`input pl-10 ${errors.password ? 'input-error' : ''}`} />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" className="btn-primary btn w-full btn-lg" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="w-4 h-4 border-white border-t-white/40" /> : null}
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
