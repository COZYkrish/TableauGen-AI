import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, FolderKanban, Upload, ArrowRight,
  FileSpreadsheet, Trash2, BarChart3, Clock,
  Search, Download, Eye, Sparkles, ChevronRight,
  Edit2, Check, X, Loader2
} from 'lucide-react'
import { projects as projectsApi, type ProjectResponse, type ProjectStats } from '@/lib/api'

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: typeof Eye; action: string }> = {
  uploaded: { color: 'var(--color-accent)', label: 'Uploaded', icon: Eye, action: 'Analyze' },
  profiled: { color: 'var(--color-warning)', label: 'Profiled', icon: Sparkles, action: 'Generate' },
  ready: { color: 'var(--color-success)', label: 'Ready', icon: Download, action: 'Dashboard' },
  exported: { color: 'var(--color-primary)', label: 'Exported', icon: Download, action: 'View' },
  draft: { color: 'var(--color-text-muted)', label: 'Draft', icon: Eye, action: 'View' },
}

function getNavigationPath(project: ProjectResponse) {
  if (project.status === 'ready' || project.status === 'exported') return `/app/dashboard/${project.id}`
  return `/app/profile/${project.id}`
}

function ProjectCard({
  project,
  onDelete,
  onRename,
}: {
  project: ProjectResponse
  onDelete: (id: number) => void
  onRename: (id: number, name: string) => void
}) {
  const navigate = useNavigate()
  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(project.name)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const saveEdit = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    if (!nameVal.trim() || nameVal === project.name) { setEditing(false); return }
    setSaving(true)
    try {
      await projectsApi.rename(project.id, nameVal.trim())
      onRename(project.id, nameVal.trim())
      setEditing(false)
    } catch {
      setNameVal(project.name)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNameVal(project.name)
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer relative"
      onClick={() => !editing && navigate(getNavigationPath(project))}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${config.color} 12%, transparent)` }}
        >
          <FileSpreadsheet className="w-5 h-5" style={{ color: config.color }} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={startEdit}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all"
            title="Rename"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project.id) }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-white/5 transition-all"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Title with inline rename */}
      {editing ? (
        <div className="flex items-center gap-1.5 mb-1" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(e); if (e.key === 'Escape') cancelEdit(e as any) }}
            className="flex-1 text-sm font-semibold bg-[var(--color-bg-surface)] border border-[var(--color-primary)] rounded-lg px-2 py-1 outline-none"
            onClick={(e) => e.stopPropagation()}
          />
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 text-[var(--color-text-muted)] animate-spin" />
          ) : (
            <>
              <button onClick={saveEdit} className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-success)] hover:bg-white/5">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={cancelEdit} className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:bg-white/5">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ) : (
        <h3 className="text-sm font-semibold mb-0.5 truncate">{project.name}</h3>
      )}

      <p className="text-xs text-[var(--color-text-muted)] mb-4 truncate">{project.file_name || 'No file'}</p>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-4">
        {project.row_count != null && (
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {project.row_count.toLocaleString()} rows
          </span>
        )}
        {project.column_count != null && (
          <span className="flex items-center gap-1">
            {project.column_count} cols
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Status + action */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium"
          style={{
            color: config.color,
            background: `color-mix(in srgb, ${config.color} 10%, transparent)`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
          {config.label}
        </span>

        <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
          {config.action} <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projectList, setProjectList] = useState<ProjectResponse[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      projectsApi.list(),
      projectsApi.stats().catch(() => null),
    ])
      .then(([listData, statsData]) => {
        setProjectList(listData.projects)
        if (statsData) setStats(statsData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project and all its files?')) return
    await projectsApi.delete(id)
    setProjectList((prev) => prev.filter((p) => p.id !== id))
  }

  const handleRename = (id: number, newName: string) => {
    setProjectList((prev) => prev.map((p) => p.id === id ? { ...p, name: newName } : p))
  }

  const filtered = projectList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.file_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusOptions = ['all', ...Array.from(new Set(projectList.map(p => p.status)))]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {projectList.length} project{projectList.length !== 1 ? 's' : ''} · Manage your Tableau dashboards
          </p>
        </div>
        <Link
          to="/app/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Stats strip */}
      {stats && projectList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: 'Total', value: stats.total_projects, color: 'var(--color-primary)' },
            { label: 'Exported', value: stats.exported_count, color: 'var(--color-success)' },
            { label: 'Rows Analyzed', value: stats.total_rows_analyzed.toLocaleString(), color: 'var(--color-accent)' },
            { label: 'Cols Analyzed', value: stats.total_columns_analyzed.toLocaleString(), color: 'var(--color-warning)' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center gap-3">
              <div>
                <p className="text-base font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Search + filter */}
      {projectList.length > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-primary)] outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  statusFilter === s
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                    : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Project cards */}
      {!loading && filtered.length > 0 ? (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : !loading && projectList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]/40 p-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-5">
            <FolderKanban className="w-7 h-7 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
            Upload a CSV file to get started. TableauGen AI will analyze your data and generate a professional Tableau dashboard automatically.
          </p>
          <Link
            to="/app/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-primary glow-primary hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Upload className="w-4 h-4" />
            Upload Your First CSV
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : !loading && filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-[var(--color-text-muted)]">No projects match your search.</p>
          <button onClick={() => { setSearch(''); setStatusFilter('all') }} className="text-xs text-[var(--color-primary)] mt-2 hover:underline">
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  )
}
