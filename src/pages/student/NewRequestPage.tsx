import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategories } from '../../api/categories'
import { createRequest } from '../../api/requests'
import { Spinner, PageSpinner } from '../../components/ui/Spinner'

const schema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Please describe the issue in more detail'),
  categoryId:  z.number().min(1, 'Select a category'),
  location:    z.string().min(3, 'Location is required').max(200),
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
})
type Form = z.infer<typeof schema>

const priorities = [
  { value: 'LOW',    label: 'Low',    color: 'border-gray-300 peer-checked:border-gray-500   peer-checked:bg-gray-50' },
  { value: 'MEDIUM', label: 'Medium', color: 'border-blue-300  peer-checked:border-blue-500   peer-checked:bg-blue-50' },
  { value: 'HIGH',   label: 'High',   color: 'border-orange-300 peer-checked:border-orange-500 peer-checked:bg-orange-50' },
  { value: 'URGENT', label: 'Urgent', color: 'border-red-300   peer-checked:border-red-500    peer-checked:bg-red-50' },
]

export const NewRequestPage = () => {
  const navigate = useNavigate()
  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form, any, Form>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
  })

  const priority = watch('priority')

  const mutation = useMutation({
    mutationFn: createRequest,
    onSuccess: (req) => {
      toast.success('Request submitted successfully!')
      navigate(`/requests/${req.id}`)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Submission failed'),
  })

  if (loadingCats) return <PageSpinner />

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate(-1)} className="btn-ghost btn btn-sm mb-2">
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="page-title">Submit a Service Request</h1>
          <p className="page-sub">Describe the issue and we'll get it resolved as soon as possible</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate({ ...d, categoryId: Number(d.categoryId) }))} className="space-y-6">
          {/* Title */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Request Details</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Title <span className="text-accent-500">*</span></label>
                <input {...register('title')} placeholder="e.g. Broken light in Lab 3"
                  className={`input ${errors.title ? 'input-error' : ''}`} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">Category <span className="text-accent-500">*</span></label>
                <select className={`input ${errors.categoryId ? 'input-error' : ''}`}
                  onChange={e => setValue('categoryId', Number(e.target.value))}>
                  <option value="">Select a category</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="label">Location <span className="text-accent-500">*</span></label>
                <input {...register('location')} placeholder="e.g. Block A, Room 204, Lab 3"
                  className={`input ${errors.location ? 'input-error' : ''}`} />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="label">Description <span className="text-accent-500">*</span></label>
                <textarea {...register('description')} rows={5}
                  placeholder="Describe the problem in detail — when it started, how severe it is, and any other relevant information..."
                  className={`input resize-none ${errors.description ? 'input-error' : ''}`} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Priority Level</h3>
            <p className="text-sm text-gray-500 mb-4">How urgent is this issue?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {priorities.map(p => (
                <label key={p.value} className="cursor-pointer">
                  <input type="radio" value={p.value} className="peer sr-only"
                    checked={priority === p.value}
                    onChange={() => setValue('priority', p.value as any)} />
                  <div className={`border-2 rounded-xl p-3 text-center transition-all ${p.color}`}>
                    <p className="font-semibold text-sm">{p.label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-outline btn">
              Cancel
            </button>
            <button type="submit" className="btn-primary btn flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner className="w-4 h-4 border-white border-t-white/40" /> : <Send size={16} />}
              {mutation.isPending ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
