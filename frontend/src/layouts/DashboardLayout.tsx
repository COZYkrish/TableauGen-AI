import { Outlet, NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, Upload, History,
  Settings, LogOut, Sparkles, ChevronLeft, Menu, User
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Projects', end: true },
  { to: '/app/upload', icon: Upload, label: 'New Upload' },
  { to: '/app/templates', icon: FolderKanban, label: 'Templates' },
  { to: '/app/history', icon: History, label: 'Export History' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[var(--color-bg-deep)] overflow-hidden">
      {/* ─ Sidebar ──────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static z-50 top-0 bottom-0 flex flex-col bg-[var(--color-bg-card)] border-r border-[var(--color-border)] transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-60',
          mobileOpen ? 'left-0' : '-left-64 lg:left-0'
        )}
      >
        {/* Logo */}
        <div className={cn('h-16 flex items-center border-b border-[var(--color-border)] px-4', collapsed && 'justify-center')}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-[var(--font-heading)] text-base font-bold text-white whitespace-nowrap"
              >
                TableauGen <span className="text-[var(--color-accent)]">AI</span>
              </motion.span>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/[0.03]'
              )}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex border-t border-[var(--color-border)] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--color-text-muted)] hover:text-white hover:bg-white/[0.03] transition-all w-full',
              collapsed && 'justify-center'
            )}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ─ Main Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/60 backdrop-blur-md shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-[var(--color-text-secondary)] hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block" />

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Free Plan</p>
              </div>
            </div>
            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
