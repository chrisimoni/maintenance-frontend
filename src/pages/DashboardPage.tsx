import { useQuery } from '@tanstack/react-query'
import { ClipboardList, Clock, CheckCircle, Wrench, Users, AlertTriangle, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getRequests } from '../api/requests'
import { getMyAssignments, getAllAssignments } from '../api/assignments'
import { getUsers } from '../api/users'
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate } from '../utils'
import { useNavigate } from 'react-router-dom'

const StatCard = ({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number | string; color: string; bg: string
}) => (
  <div className="stat-card">
    <div className={`stat-icon ${bg}`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)

export const DashboardPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin   = user?.role === 'ADMIN'
  const isOfficer = user?.role === 'OFFICER'

  const { data: myRequests, isLoading: loadingReq } = useQuery({
    queryKey: ['requests', 'dashboard'],
    queryFn: () => getRequests({ size: 5 }),
    enabled: !isOfficer,
  })

  const { data: myAssignments, isLoading: loadingAssign } = useQuery({
    queryKey: ['assignments', 'my', 'dashboard'],
    queryFn: () => isOfficer ? getMyAssignments(0, 5) : getAllAssignments(0, 5),
    enabled: isOfficer || isAdmin,
  })

  const { data: users } = useQuery({
    queryKey: ['users', 'count'],
    queryFn: () => getUsers(undefined, 0, 1),
    enabled: isAdmin,
  })

  const { data: pendingReqs } = useQuery({
    queryKey: ['requests', 'pending'],
    queryFn: () => getRequests({ status: 'PENDING', size: 1 }),
    enabled: isAdmin,
  })

  const { data: completedReqs } = useQuery({
    queryKey: ['requests', 'completed'],
    queryFn: () => getRequests({ status: 'COMPLETED', size: 1 }),
    enabled: isAdmin,
  })

  if (loadingReq || loadingAssign) return <PageSpinner />

  const requests = myRequests?.content ?? []
  const assignments = myAssignments?.content ?? []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ClipboardList} label="Total Requests"   value={myRequests?.totalElements ?? 0}  color="text-primary-600" bg="bg-primary-50" />
          <StatCard icon={AlertTriangle} label="Pending"          value={pendingReqs?.totalElements ?? 0}  color="text-amber-600"   bg="bg-amber-50"   />
          <StatCard icon={CheckCircle}   label="Completed"        value={completedReqs?.totalElements ?? 0} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={Users}         label="Registered Users" value={users?.totalElements ?? 0}         color="text-violet-600"  bg="bg-violet-50"  />
        </div>
      )}

      {isOfficer && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Wrench}       label="My Assignments" value={myAssignments?.totalElements ?? 0}                                                            color="text-primary-600" bg="bg-primary-50" />
          <StatCard icon={Clock}        label="In Progress"    value={assignments.filter(a => a.request.status === 'IN_PROGRESS').length}                            color="text-purple-600"  bg="bg-purple-50"  />
          <StatCard icon={CheckCircle}  label="Completed"      value={assignments.filter(a => a.request.status === 'COMPLETED').length}                              color="text-emerald-600" bg="bg-emerald-50" />
        </div>
      )}

      {!isAdmin && !isOfficer && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ClipboardList} label="Total Requests"  value={myRequests?.totalElements ?? 0}                                                       color="text-primary-600" bg="bg-primary-50" />
          <StatCard icon={Clock}         label="Pending"         value={requests.filter(r => r.status === 'PENDING').length}                                   color="text-amber-600"   bg="bg-amber-50"   />
          <StatCard icon={TrendingUp}    label="In Progress"     value={requests.filter(r => r.status === 'IN_PROGRESS').length}                               color="text-purple-600"  bg="bg-purple-50"  />
          <StatCard icon={CheckCircle}   label="Completed"       value={requests.filter(r => r.status === 'COMPLETED').length}                                 color="text-emerald-600" bg="bg-emerald-50" />
        </div>
      )}

      {/* Recent requests / assignments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {!isOfficer && (
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800">Recent Requests</h3>
              <button onClick={() => navigate(isAdmin ? '/requests' : '/my-requests')}
                className="text-xs text-primary-600 hover:underline font-medium">View all</button>
            </div>
            {requests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No requests yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {requests.map(req => (
                  <div key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/60 cursor-pointer transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{req.categoryName} · {req.location}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(req.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <StatusBadge status={req.status} />
                      <PriorityBadge priority={req.priority} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(isOfficer || isAdmin) && (
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800">
                {isOfficer ? 'My Assignments' : 'Recent Assignments'}
              </h3>
              <button onClick={() => navigate('/assignments')}
                className="text-xs text-primary-600 hover:underline font-medium">View all</button>
            </div>
            {assignments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No assignments yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {assignments.map(a => (
                  <div key={a.id}
                    onClick={() => navigate(`/requests/${a.request.id}`)}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/60 cursor-pointer transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.request.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.request.location}</p>
                      {isAdmin && <p className="text-xs text-gray-400 mt-0.5">Officer: {a.officer.name}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.assignedAt)}</p>
                    </div>
                    <StatusBadge status={a.request.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        {!isOfficer && !isAdmin && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/new-request')}
                className="btn-primary btn w-full justify-start gap-3 py-3">
                <ClipboardList size={18} /> Submit New Request
              </button>
              <button onClick={() => navigate('/my-requests')}
                className="btn-outline btn w-full justify-start gap-3 py-3">
                <Clock size={18} /> Track My Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
