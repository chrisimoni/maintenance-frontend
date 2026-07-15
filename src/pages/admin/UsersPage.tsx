import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCheck, UserX, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers, toggleUser, deleteUser } from '../../api/users'
import { RoleBadge } from '../../components/ui/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils'
import type { Role } from '../../types'

const ROLES: Role[] = ['STUDENT','STAFF','OFFICER','ADMIN']

export const UsersPage = () => {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [role, setRole]  = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', role, page],
    queryFn: () => getUsers(role || undefined, page),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enable }: { id: number; enable: boolean }) => toggleUser(id, enable),
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError:   () => toast.error('Failed to update user'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError:   () => toast.error('Failed to delete user'),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-sub">{data?.totalElements ?? 0} registered users</p>
        </div>
      </div>

      {/* Role filter */}
      <div className="card p-4 mb-5">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setRole(''); setPage(0) }}
            className={role === '' ? 'btn-primary btn btn-sm' : 'btn-outline btn btn-sm'}>
            All
          </button>
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(0) }}
              className={role === r ? 'btn-primary btn btn-sm' : 'btn-outline btn btn-sm'}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {data?.content.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Joined</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map(u => (
                    <tr key={u.id} className="table-row">
                      <td className="table-cell font-medium text-gray-900">{u.name}</td>
                      <td className="table-cell text-gray-600">{u.email}</td>
                      <td className="table-cell"><RoleBadge role={u.role} /></td>
                      <td className="table-cell text-gray-500">{u.department || '—'}</td>
                      <td className="table-cell">
                        <span className={`badge ${u.enabled ? 'badge-completed' : 'badge-rejected'}`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="table-cell text-gray-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleMutation.mutate({ id: u.id, enable: !u.enabled })}
                            className={`btn btn-sm ${u.enabled ? 'btn-ghost text-amber-600' : 'btn-ghost text-emerald-600'}`}
                            title={u.enabled ? 'Disable' : 'Enable'}>
                            {u.enabled ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete ${u.name}?`)) deleteMutation.mutate(u.id) }}
                            className="btn btn-sm btn-ghost text-red-500" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4">
              <Pagination page={page} totalPages={data?.totalPages ?? 1}
                totalElements={data?.totalElements ?? 0} size={20} onPage={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
