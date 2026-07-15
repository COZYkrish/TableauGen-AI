import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, FolderKanban, Upload, ArrowRight,
  FileSpreadsheet, Trash2, BarChart3, Clock
} from 'lucide-react'
import { projects as projectsApi, type ProjectResponse } from '@/lib/api'

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  uploaded: { color: 'var(--color-accent)', label: 'Uploaded' },
  profiled: { color: 'var(--color-warning)', label: 'Profiled' },
  ready: { color: 'var(--color-success)', label: 'Ready' },
  exported: { color: 'var(--color-primary)', label: 'Exported' },
  draft: { color: 'var(--color-text-muted)', label: 'Draft' },
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projectList, setProjectList] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectsApi.list()
      .then((data) => setProjectList(data.projects))
      .catch(() => {/* not logged in — show empty state */})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return
    await projectsApi.delete(id)
    setProjectList((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your Tableau dashboard projects</p>
        </div>
        <Link
          to="/app/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Project cards or empty state */}
      {!loading && projectList.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.map((project, i) => {
            const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.draft
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer"
                onClick={() => {
                  if (project.status === 'uploaded') {
                    navigate(`/app/profile/${project.id}`)
                  } else if (project.status === 'profiled') {
                    navigate(`/app/profile/${project.id}`)
                  }
                }}
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                    className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-white/5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold mb-1 truncate">{project.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">{project.file_name || 'No file'}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                  {project.row_count != null && (
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {project.row_count.toLocaleString()} rows
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Status badge */}
                <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium"
                    style={{
                      color: statusStyle.color,
                      background: `color-mix(in srgb, ${statusStyle.color} 10%, transparent)`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.color }} />
                    {statusStyle.label}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : !loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
      ) : null}
    </div>
  )
}
