import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, Download, FileArchive, BarChart3, Columns,
  Clock, Loader2, AlertTriangle, Inbox, ExternalLink, RefreshCw
} from 'lucide-react'
import { projects as projectsApi, getToken, type ExportHistoryItem } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/Container'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatBytes(kb: number | null) {
  if (kb === null) return '—'
  if (kb < 1) return `${Math.round(kb * 1024)} B`
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<ExportHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    projectsApi.exportHistory()
      .then((data) => setHistory(data.exports))
      .catch((err) => setError(err.message || 'Failed to load history'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const downloadWithAuth = async (url: string, fileName: string) => {
    const token = getToken()
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) return
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <Container>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-[var(--color-accent)]" />
            Export History
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Download your previously generated Tableau workbooks
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm glass hover:bg-white/5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48 gap-3 text-[var(--color-text-muted)]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading export history...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <AlertTriangle className="w-8 h-8 text-[var(--color-danger)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
          <button onClick={load} className="text-sm text-[var(--color-primary)] hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && history.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border border-dashed border-[var(--color-border)]"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Inbox className="w-7 h-7 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-lg font-semibold">No exports yet</h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-sm text-center">
            Upload a CSV, generate a dashboard, and export your first Tableau workbook.
          </p>
        </motion.div>
      )}

      {/* History table */}
      {!loading && !error && history.length > 0 && (
        <>
          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[
              { label: 'Total Exports', value: history.length, icon: FileArchive, color: 'var(--color-primary)' },
              {
                label: 'Total Rows Analyzed',
                value: history.reduce((s, e) => s + (e.row_count || 0), 0).toLocaleString(),
                icon: BarChart3,
                color: 'var(--color-accent)',
              },
              {
                label: 'Latest Export',
                value: formatDate(history[0]?.exported_at).split(',')[0],
                icon: Clock,
                color: 'var(--color-warning)',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-lg font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-sm font-semibold">Exported Workbooks</h2>
              <span className="text-xs text-[var(--color-text-muted)]">{history.length} file{history.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    <th className="text-left px-5 py-3 font-medium">Project</th>
                    <th className="text-left px-4 py-3 font-medium">File</th>
                    <th className="text-right px-4 py-3 font-medium">Size</th>
                    <th className="text-right px-4 py-3 font-medium">Rows</th>
                    <th className="text-right px-4 py-3 font-medium">Cols</th>
                    <th className="text-left px-4 py-3 font-medium">Exported</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {history.map((item, i) => (
                      <motion.tr
                        key={item.project_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-t border-[var(--color-border)] hover:bg-white/[0.015] transition-colors group"
                      >
                        <td className="px-5 py-3">
                          <button
                            onClick={() => navigate(`/app/dashboard/${item.project_id}`)}
                            className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5"
                          >
                            {item.project_name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <FileArchive className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                            {item.file_name || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-text-muted)]">
                          {formatBytes(item.file_size_kb)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-text-muted)]">
                          {item.row_count?.toLocaleString() ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-text-muted)]">
                          {item.column_count ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                          {formatDate(item.exported_at)}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => downloadWithAuth(item.download_url, item.file_name || 'dashboard.twbx')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white gradient-primary opacity-0 group-hover:opacity-100 hover:opacity-90 transition-all"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </Container>
  )
}
