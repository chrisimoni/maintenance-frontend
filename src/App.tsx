import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage }       from './pages/auth/LoginPage'
import { RegisterPage }    from './pages/auth/RegisterPage'
import { DashboardPage }   from './pages/DashboardPage'
import { RequestListPage } from './pages/RequestListPage'
import { RequestDetailPage } from './pages/RequestDetailPage'
import { NewRequestPage }  from './pages/student/NewRequestPage'
import { AssignmentsPage } from './pages/officer/AssignmentsPage'
import { UsersPage }       from './pages/admin/UsersPage'
import { CategoriesPage }  from './pages/admin/CategoriesPage'
import { ReportsPage }     from './pages/admin/ReportsPage'
import { useAuthStore }    from './store/authStore'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

const AdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore()
  return user?.role === 'ADMIN' ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/my-requests" element={<RequestListPage />} />
            <Route path="/new-request" element={<NewRequestPage />} />
            <Route path="/requests"    element={<RequestListPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />

            <Route path="/users"      element={<AdminOnly><UsersPage /></AdminOnly>} />
            <Route path="/categories" element={<AdminOnly><CategoriesPage /></AdminOnly>} />
            <Route path="/reports"    element={<AdminOnly><ReportsPage /></AdminOnly>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '13px', fontWeight: 500 },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }}
      />
    </QueryClientProvider>
  )
}
