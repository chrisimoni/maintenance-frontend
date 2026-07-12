import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Download, FileBarChart } from 'lucide-react'
import toast from 'react-hot-toast'
import { exportReport } from '../../api/categories'
import { downloadBlob } from '../../utils'
import { Spinner } from '../../components/ui/Spinner'
const STATUSES: { value: string; label: string }[] = [
  { value: '',            label: 'All Requests' },
  { value: 'PENDING',     label: 'Pending' },
  { value: 'ASSIGNED',    label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED',   label: 'Completed' },
  { value: 'REJECTED',    label: 'Rejected' },
]

export const ReportsPage = () => {
  const [status, setStatus] = useState('')

  const exportMutation = useMutation({
    mutationFn: () => exportReport(status || undefined),
    onSuccess: (blob: Blob) => {
      const filename = `maintenance-requests${status ? `-${status.toLowerCase()}` : ''}.csv`
      downloadBlob(blob, filename)
      toast.success('Report downloaded')
    },
    onError: () => toast.error('Export failed'),
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">Export service request data for analysis and reporting</p>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
            <FileBarChart size={30} className="text-primary-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Export to CSV</h2>
          <p className="text-sm text-gray-500 mb-7">
            Download a spreadsheet of all service requests filtered by status.
            The file includes request title, category, location, priority, submitter, and timestamps.
          </p>

          <div className="text-left mb-6">
            <label className="label">Filter by Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input">
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <button onClick={() => exportMutation.mutate()} className="btn-primary btn w-full btn-lg"
            disabled={exportMutation.isPending}>
            {exportMutation.isPending
              ? <><Spinner className="w-4 h-4 border-white border-t-white/40" /> Generating…</>
              : <><Download size={18} /> Download CSV Report</>}
          </button>
        </div>
      </div>
    </div>
  )
}
