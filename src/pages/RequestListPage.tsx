import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, PlusCircle, ClipboardX } from 'lucide-react'
import { getRequests } from '../api/requests'
import { getCategories } from '../api/categories'
import { useAuthStore } from '../store/authStore'
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge'
import { PageSpinner } from '../components/ui/Spinner'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../utils'
import type { RequestStatus, RequestPriority } from '../types'

const STATUSES: RequestStatus[] = ['PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','REJECTED']
const PRIORITIES: RequestPriority[] = ['LOW','MEDIUM','HIGH','URGENT']

export const RequestListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [page, setPage]         = useState(0)
  const [keyword, setKeyword]   = useState('')
  const [status, setStatus]     = useState('')
  const [priority, setPriority] = useState('')
  const [categoryId, setCat]    = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['requests', page, keyword, status, priority, categoryId],
    queryFn: () => getRequests({
      page, size: 15, keyword: keyword || undefined,
      status: status || undefined, priority: priority || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    }),
  })

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'All Requests' : 'My Requests'}</h1>
          <p className="page-sub">{data?.totalElements ?? 0} total requests</p>
        </div>
        {!isAdmin && (
          <button onClick={() => navigate('/new-request')} className="btn-primary btn">
            <PlusCircle size={16} /> New Request
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(0) }}
              placeholder="Search title, description, location…"
              className="input pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <SlidersHorizontal size={15} className="text-gray-400" />
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(0) }} className="input w-auto">
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select value={priority} onChange={e => { setPriority(e.target.value); setPage(0) }} className="input w-auto">
              <option value="">All priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={categoryId} onChange={e => { setCat(e.target.value); setPage(0) }} className="input w-auto">
              <option value="">All categories</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {(keyword || status || priority || categoryId) && (
              <button onClick={() => { setKeyword(''); setStatus(''); setPriority(''); setCat(''); setPage(0) }}
                className="btn-ghost btn btn-sm text-accent-500">Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {data?.content.length === 0 ? (
          <EmptyState icon={ClipboardX} title="No requests found"
            description="Try adjusting your filters or submit a new request"
            action={!isAdmin ? (
              <button onClick={() => navigate('/new-request')} className="btn-primary btn">
                <PlusCircle size={15} /> New Request
              </button>
            ) : undefined} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="table-header">Request</th>
                    <th className="table-header">Category</th>
                    <th className="table-header">Location</th>
                    {isAdmin && <th className="table-header">Submitter</th>}
                    <th className="table-header">Priority</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map(req => (
                    <tr key={req.id} className="table-row cursor-pointer"
                      onClick={() => navigate(`/requests/${req.id}`)}>
                      <td className="table-cell">
                        <p className="font-medium text-gray-900 truncate max-w-[220px]">{req.title}</p>
                        <p className="text-xs text-gray-400">#{req.id}</p>
                      </td>
                      <td className="table-cell text-gray-600">{req.categoryName}</td>
                      <td className="table-cell text-gray-600 truncate max-w-[140px]">{req.location}</td>
                      {isAdmin && <td className="table-cell text-gray-600">{req.submitter.name}</td>}
                      <td className="table-cell"><PriorityBadge priority={req.priority} /></td>
                      <td className="table-cell"><StatusBadge status={req.status} /></td>
                      <td className="table-cell text-gray-500 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4">
              <Pagination page={page} totalPages={data?.totalPages ?? 1}
                totalElements={data?.totalElements ?? 0} size={15} onPage={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
