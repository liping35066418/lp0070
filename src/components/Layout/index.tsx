import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-industrial-bg text-industrial-text-primary">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-industrial-card border-b border-industrial-border flex items-center px-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">弹窗规则调度平台</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-industrial-text-muted font-mono">
              API: /api
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
