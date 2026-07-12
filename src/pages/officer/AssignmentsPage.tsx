import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { getMyAssignments, getAllAssignments } from '../../api/assignments'
import { useAuthStore } from '../../store/authStore'
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils'

export const AssignmentsPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['assignments', isAdmin ? 'all' : 'my', page],
    queryFn: () => isAdmin ? getAllAssignments(page) : getMyAssignments(page),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'All Assignments' : 'My Assignments'}</h1>
          <p className="page-sub">{data?.totalElements ?? 0} assignments</p>
        </div>
      </div>

      {data?.content.length === 0 ? (
        <div className="card">
          <EmptyState icon={Wrench} title="No assignments yet"
            description={isAdmin ? 'Assign officers to pending requests first' : 'No jobs have been assigned to you yet'} />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.content.map(a => (
            <div key={a.id}
              onClick={() => navigate(`/requests/${a.request.id}`)}
              className="card-hover card p-5 cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={a.request.status} />
                    <PriorityBadge priority={a.request.priority} />
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{a.request.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{a.request.categoryName} · {a.request.location}</p>
                  {isAdmin && (
                    <p className="text-xs text-gray-400 mt-1">Officer: <span className="font-medium text-gray-600">{a.officer.name}</span></p>
                  )}
                  {a.notes && (
                    <p className="text-xs text-gray-400 mt-1 italic">"{a.notes}"</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Assigned</p>
                  <p className="text-xs font-medium text-gray-600">{formatDate(a.assignedAt)}</p>
                  {isAdmin && (
                    <>
                      <p className="text-xs text-gray-400 mt-2">By</p>
                      <p className="text-xs font-medium text-gray-600">{a.assignedBy.name}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="px-1">
            <Pagination page={page} totalPages={data?.totalPages ?? 1}
              totalElements={data?.totalElements ?? 0} size={20} onPage={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}
