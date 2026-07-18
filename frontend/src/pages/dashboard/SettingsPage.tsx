import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, Mail, Edit2, Save, X, Loader2,
  CheckCircle2, AlertCircle, Shield, Key, LogOut,
  BarChart3, Package, Clock, Sparkles
} from 'lucide-react'
import { auth, projects as projectsApi, clearToken, type UserResponse, type ProjectStats } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/Container'

export default function SettingsPage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<UserResponse | null>(null)
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    Promise.all([auth.me(), projectsApi.stats()])
      .then(([userData, statsData]) => {
        setUser(userData)
        setStats(statsData)
        setNameValue(userData.full_name)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    if (!nameValue.trim()) return
    setSaving(true)
    setSaveStatus('idle')
    try {
      const updated = await auth.updateProfile({ full_name: nameValue.trim() })
      setUser(updated)
      setSaveStatus('success')
      setEditing(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err: any) {
      setSaveStatus('error')
      setSaveError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    clearToken()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 gap-3 text-[var(--color-text-muted)]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading settings...</span>
      </div>
    )
  }

  return (
    <Container size="sm">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--color-accent)]" />
          Settings
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-5">
        {/* ── Account Stats ──────────────────────────────────────── */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: 'Projects', value: stats.total_projects, icon: BarChart3, color: 'var(--color-primary)' },
              { label: 'Exports', value: stats.exported_count, icon: Package, color: 'var(--color-accent)' },
              { label: 'Rows Analyzed', value: stats.total_rows_analyzed.toLocaleString(), icon: Sparkles, color: 'var(--color-warning)' },
              { label: 'Member Since', value: user ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—', icon: Clock, color: 'var(--color-text-secondary)' },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{ background: `color-mix(in srgb, ${s.color} 12%, transparent)` }}
                >
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <p className="text-base font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Profile Card ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="text-sm font-semibold">Profile</h2>
            </div>
            {!editing ? (
              <button
                onClick={() => { setEditing(true); setSaveStatus('idle') }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <button
                onClick={() => { setEditing(false); setNameValue(user?.full_name || '') }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
                {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="font-semibold">{user?.full_name}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {user?.is_verified ? '✓ Verified' : 'Unverified'} · Free Plan
                </p>
              </div>
            </div>

            {/* Full name field */}
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--color-bg-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none transition-colors"
                  placeholder="Your full name"
                  autoFocus
                />
              ) : (
                <p className="text-sm text-[var(--color-text-primary)] px-3 py-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                  {user?.full_name}
                </p>
              )}
            </div>

            {/* Email field (read-only) */}
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <p className="text-sm text-[var(--color-text-secondary)]">{user?.email}</p>
                <span className="ml-auto text-[10px] text-[var(--color-text-muted)] bg-white/5 px-2 py-0.5 rounded-full">Read-only</span>
              </div>
            </div>

            {/* Save button */}
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !nameValue.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                {saveStatus === 'success' && (
                  <span className="flex items-center gap-1.5 text-xs text-[var(--color-success)]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="flex items-center gap-1.5 text-xs text-[var(--color-danger)]">
                    <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                  </span>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Security Card ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-border)]">
            <Shield className="w-4 h-4 text-[var(--color-warning)]" />
            <h2 className="text-sm font-semibold">Security</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Last changed: Never</p>
                </div>
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] bg-white/5 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Danger Zone ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-danger)]/15">
            <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
            <h2 className="text-sm font-semibold text-[var(--color-danger)]">Danger Zone</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sign out of TableauGen AI</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  You will be returned to the landing page
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </Container>
  )
}
