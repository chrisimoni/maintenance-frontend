import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { register as registerUser } from '../../api/auth'
import { Spinner } from '../../components/ui/Spinner'

const schema = z.object({
  name:       z.string().min(2, 'Full name is required'),
  email:      z.string().email('Enter a valid email'),
  password:   z.string().min(8, 'Min 8 characters')
                .regex(/[A-Z]/, 'Must include an uppercase letter')
                .regex(/[0-9]/, 'Must include a digit')
                .regex(/[@#$%^&+=!]/, 'Must include a special character'),
  role:       z.enum(['STUDENT', 'STAFF', 'OFFICER']),
  phone:      z.string().optional(),
  department: z.string().optional(),
})
type Form = z.infer<typeof schema>

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STUDENT' },
  })

  const onSubmit = async (data: Form) => {
    try {
      await registerUser(data)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">MIVA Open University</p>
            <p className="text-gray-500 text-xs">Maintenance Portal</p>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-7">Fill in your details to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full name</label>
                <input {...register('name')} placeholder="Amara Johnson"
                  className={`input ${errors.name ? 'input-error' : ''}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="label">Email address</label>
                <input {...register('email')} placeholder="you@university.edu"
                  className={`input ${errors.email ? 'input-error' : ''}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="label">Password</label>
                <input {...register('password')} type="password" placeholder="Min 8 chars, uppercase, digit, symbol"
                  className={`input ${errors.password ? 'input-error' : ''}`} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Role</label>
                <select {...register('role')} className="input">
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Staff</option>
                  <option value="OFFICER">Maintenance Officer</option>
                </select>
              </div>

              <div>
                <label className="label">Phone (optional)</label>
                <input {...register('phone')} placeholder="08012345678" className="input" />
              </div>

              <div className="col-span-2">
                <label className="label">Department (optional)</label>
                <input {...register('department')} placeholder="Faculty of Engineering" className="input" />
              </div>
            </div>

            <button type="submit" className="btn-primary btn w-full btn-lg" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="w-4 h-4 border-white border-t-white/40" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
