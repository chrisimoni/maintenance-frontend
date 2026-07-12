import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusCircle, Tags, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllCategories, createCategory, toggleCategory } from '../../api/categories'
import { Modal } from '../../components/ui/Modal'
import { PageSpinner, Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'

export const CategoriesPage = () => {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [name, setName]   = useState('')
  const [desc, setDesc]   = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories,
  })

  const createMutation = useMutation({
    mutationFn: () => createCategory({ name, description: desc }),
    onSuccess: () => {
      toast.success('Category created')
      qc.invalidateQueries({ queryKey: ['categories'] })
      setModal(false); setName(''); setDesc('')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create category'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) => toggleCategory(id, activate),
    onSuccess: () => { toast.success('Category updated'); qc.invalidateQueries({ queryKey: ['categories'] }) },
    onError: () => toast.error('Failed to update category'),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-sub">{data?.length ?? 0} categories</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary btn">
          <PlusCircle size={16} /> New Category
        </button>
      </div>

      {data?.length === 0 ? (
        <div className="card">
          <EmptyState icon={Tags} title="No categories" description="Create a category to get started"
            action={<button onClick={() => setModal(true)} className="btn-primary btn"><PlusCircle size={15} /> New Category</button>} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map(cat => (
            <div key={cat.id} className={`card p-5 ${!cat.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <span className={`badge ${cat.active ? 'badge-completed' : 'badge-rejected'}`}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{cat.description || '—'}</p>
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ id: cat.id, activate: !cat.active })}
                  className="btn-ghost btn p-1.5 flex-shrink-0"
                  title={cat.active ? 'Deactivate' : 'Activate'}>
                  {cat.active
                    ? <ToggleRight size={20} className="text-emerald-500" />
                    : <ToggleLeft  size={20} className="text-gray-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Category" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Name <span className="text-accent-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="input" placeholder="e.g. HVAC" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              rows={3} className="input resize-none"
              placeholder="What types of issues does this category cover?" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setModal(false)} className="btn-outline btn flex-1">Cancel</button>
            <button onClick={() => createMutation.mutate()} className="btn-primary btn flex-1"
              disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending && <Spinner className="w-4 h-4 border-white border-t-white/40" />}
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
