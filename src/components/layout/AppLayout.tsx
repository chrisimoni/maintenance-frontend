import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu, ShieldCheck } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '../../store/authStore'

export const AppLayout = () => {
  const { isAuthenticated } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile topbar */}
      <header className="md:hidden fixed inset-x-0 top-0 z-10 h-14 flex items-center gap-3 px-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-600 hover:text-gray-900 p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100"
          aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary-500" />
          <span className="font-semibold text-sm text-gray-900">MIVA Maintenance</span>
        </div>
      </header>

      <main className="flex-1 md:ml-60 pt-14 md:pt-0 p-4 sm:p-6 md:p-8 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
