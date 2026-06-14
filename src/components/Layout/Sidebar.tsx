import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Play, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    path: '/',
    label: '规则管理',
    icon: LayoutDashboard,
  },
  {
    path: '/debug',
    label: '模拟调试',
    icon: Play,
  },
  {
    path: '/settings',
    label: '全局设置',
    icon: Settings,
  },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-industrial-card border-r border-industrial-border flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-industrial-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent-teal/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-accent-teal" />
          </div>
          <div>
            <h1 className="text-industrial-text-primary font-semibold text-sm">
              Popup Dispatcher
            </h1>
            <p className="text-industrial-text-muted text-xs font-mono">
              v1.0.0
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
                  'hover:bg-industrial-border/30 hover:text-industrial-text-primary',
                  isActive
                    ? 'bg-accent-teal/10 text-accent-teal border-l-2 border-accent-teal'
                    : 'text-industrial-text-secondary border-l-2 border-transparent'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-industrial-border">
        <div className="bg-industrial-bg rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-xs text-industrial-text-secondary font-mono">
              系统运行中
            </span>
          </div>
          <p className="text-xs text-industrial-text-muted">
            弹窗调度平台
          </p>
        </div>
      </div>
    </aside>
  )
}
