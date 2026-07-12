import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, PlusCircle, Users,
  Wrench, Tags, FileBarChart, LogOut, ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils'

const MivaLogo = () => (
  <div className="flex items-center gap-3 px-3 py-1">
    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
      <ShieldCheck size={20} className="text-white" />
    </div>
    <div>
      <p className="text-white font-bold text-sm leading-tight">MIVA University</p>
      <p className="text-white/60 text-[10px] font-medium tracking-wide uppercase">Maintenance Portal</p>
    </div>
  </div>
)

interface NavItem { to: string; icon: React.ElementType; label: string }

const studentNav: NavItem[] = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-requests',   icon: ClipboardList,   label: 'My Requests' },
  { to: '/new-request',   icon: PlusCircle,      label: 'New Request' },
]

const officerNav: NavItem[] = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assignments',  icon: Wrench,          label: 'My Assignments' },
]

const adminNav: NavItem[] = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/requests',     icon: ClipboardList,   label: 'All Requests' },
  { to: '/assignments',  icon: Wrench,          label: 'Assignments' },
  { to: '/users',        icon: Users,           label: 'Users' },
  { to: '/categories',   icon: Tags,            label: 'Categories' },
  { to: '/reports',      icon: FileBarChart,    label: 'Reports' },
]

export const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItems =
    user?.role === 'ADMIN' ? adminNav :
    user?.role === 'OFFICER' ? officerNav :
    studentNav

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col z-30"
      style={{ background: 'linear-gradient(160deg, #2B5BA8 0%, #1d3f76 100%)' }}>

      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <MivaLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-white/50 text-[10px] truncate">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}
