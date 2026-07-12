import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, Activity, UserCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, updateStatus, uploadEvidence, getAuditTrail, deleteRequest } from '../api/requests'
import { getUsers } from '../api/users'
import { createAssignment } from '../api/assignments'
import { useAuthStore } from '../store/authStore'
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge'
import { PageSpinner, Spinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'
import { formatDateTime } from '../utils'
import type { RequestStatus } from '../types'

const OFFICER_TRANSITIONS: RequestStatus[] = ['IN_PROGRESS', 'COMPLETED', 'REJECTED']
const ADMIN_TRANSITIONS: RequestStatus[]   = ['IN_PROGRESS', 'COMPLETED', 'REJECTED']

export const RequestDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()

  const isAdmin   = user?.role === 'ADMIN'
  const isOfficer = user?.role === 'OFFICER'

  const [statusModal,   setStatusModal]   = useState(false)
  const [assignModal,   setAssignModal]   = useState(false)
  const [newStatus,     setNewStatus]     = useState<RequestStatus>('IN_PROGRESS')
  const [comment,       setComment]       = useState('')
  const [officerId,     setOfficerId]     = useState('')
  const [assignNotes,   setAssignNotes]   = useState('')

  const { data: req, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getRequest(Number(id)),
  })

  const { data: audit } = useQuery({
    queryKey: ['audit', id],
    queryFn: () => getAuditTrail(Number(id)),
  })

  const { data: officers } = useQuery({
    queryKey: ['users', 'OFFICER'],
    queryFn: () => getUsers('OFFICER', 0, 100),
    enabled: isAdmin && assignModal,
  })

  const statusMutation = useMutation({
    mutationFn: () => updateStatus(Number(id), newStatus, comment),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['request', id] })
      qc.invalidateQueries({ queryKey: ['audit', id] })
      setStatusModal(false); setComment('')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  })

  const assignMutation = useMutation({
    mutationFn: () => createAssignment({ requestId: Number(id), officerId: Number(officerId), notes: assignNotes }),
    onSuccess: () => {
      toast.success('Officer assigned successfully')
      qc.invalidateQueries({ queryKey: ['request', id] })
      setAssignModal(false); setOfficerId(''); setAssignNotes('')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Assignment failed'),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadEvidence(Number(id), file),
    onSuccess: () => {
      toast.success('Evidence uploaded')
      qc.invalidateQueries({ queryKey: ['request', id] })
    },
    onError: () => toast.error('Upload failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRequest(Number(id)),
    onSuccess: () => { toast.success('Request deleted'); navigate('/requests') },
    onError: () => toast.error('Delete failed'),
  })

  if (isLoading || !req) return <PageSpinner />

  const canUpdateStatus = (isOfficer || isAdmin) && !['COMPLETED','REJECTED'].includes(req.status)
  const canAssign       = isAdmin && req.status === 'PENDING'
  const isOwner         = user?.id === req.submitter.id
  const canUpload       = (isOwner || isAdmin) && !['COMPLETED','REJECTED'].includes(req.status)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost btn btn-sm mb-3">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs text-gray-400 font-mono">#{req.id}</span>
              <StatusBadge status={req.status} />
              <PriorityBadge priority={req.priority} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{req.title}</h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {canAssign && (
              <button onClick={() => setAssignModal(true)} className="btn-primary btn">
                <UserCheck size={15} /> Assign Officer
              </button>
            )}
            {canUpdateStatus && (
              <button onClick={() => setStatusModal(true)} className="btn-accent btn">
                <Activity size={15} /> Update Status
              </button>
            )}
            {isAdmin && (
              <button onClick={() => { if (confirm('Delete this request?')) deleteMutation.mutate() }}
                className="btn-danger btn">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-5">
              <div><p className="text-gray-400 text-xs mb-1">Category</p><p className="font-medium">{req.categoryName}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Location</p><p className="font-medium">{req.location}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Submitted by</p><p className="font-medium">{req.submitter.name}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Date</p><p className="font-medium">{formatDateTime(req.createdAt)}</p></div>
            </div>
            <p className="text-gray-400 text-xs mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{req.description}</p>
          </div>

          {/* Evidence */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Evidence Photo</h3>
              {canUpload && (
                <label className="btn-outline btn btn-sm cursor-pointer">
                  {uploadMutation.isPending
                    ? <><Spinner className="w-3 h-3" /> Uploading…</>
                    : <><Upload size={14} /> Upload Photo</>}
                  <input type="file" accept="image/*" className="sr-only"
                    onChange={e => e.target.files?.[0] && uploadMutation.mutate(e.target.files[0])} />
                </label>
              )}
            </div>
            {req.evidenceUrl ? (
              <img
                src={`http://localhost:8080${req.evidenceUrl}`}
                alt="Evidence"
                className="rounded-xl max-h-80 w-full object-cover border border-gray-100"
              />
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-200 h-40 flex items-center justify-center">
                <p className="text-sm text-gray-400">No evidence uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Audit trail */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary-500" /> Activity Log
          </h3>
          {!audit?.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
          ) : (
            <ol className="relative border-l border-gray-200 ml-2 space-y-5">
              {audit.map((log, i) => (
                <li key={log.id} className="ml-4">
                  <div className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 border-white ${
                    i === 0 ? 'bg-primary-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex items-center gap-2 mb-0.5">
                    {log.oldStatus && (
                      <StatusBadge status={log.oldStatus} />
                    )}
                    {log.oldStatus && <span className="text-gray-400 text-xs">→</span>}
                    <StatusBadge status={log.newStatus} />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{log.changedBy.name}</p>
                  {log.comment && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">"{log.comment}"</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(log.changedAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Request Status">
        <div className="space-y-4">
          <div>
            <label className="label">New Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as RequestStatus)} className="input">
              {(isOfficer ? OFFICER_TRANSITIONS : ADMIN_TRANSITIONS).map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Comment</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              rows={3} className="input resize-none"
              placeholder="Describe what was done or why the status changed…" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setStatusModal(false)} className="btn-outline btn flex-1">Cancel</button>
            <button onClick={() => statusMutation.mutate()} className="btn-accent btn flex-1"
              disabled={statusMutation.isPending}>
              {statusMutation.isPending && <Spinner className="w-4 h-4 border-white border-t-white/40" />}
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Officer Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Maintenance Officer">
        <div className="space-y-4">
          <div>
            <label className="label">Select Officer</label>
            <select value={officerId} onChange={e => setOfficerId(e.target.value)} className="input">
              <option value="">Choose an officer…</option>
              {officers?.content.map(o => (
                <option key={o.id} value={o.id}>{o.name} — {o.department || 'No dept.'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Notes for Officer (optional)</label>
            <textarea value={assignNotes} onChange={e => setAssignNotes(e.target.value)}
              rows={3} className="input resize-none" placeholder="Any specific instructions…" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setAssignModal(false)} className="btn-outline btn flex-1">Cancel</button>
            <button onClick={() => assignMutation.mutate()} className="btn-primary btn flex-1"
              disabled={!officerId || assignMutation.isPending}>
              {assignMutation.isPending && <Spinner className="w-4 h-4 border-white border-t-white/40" />}
              Assign Officer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
