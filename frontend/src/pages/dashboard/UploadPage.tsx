import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle,
  Loader2, X, ArrowRight, FileUp
} from 'lucide-react'
import { uploads } from '@/lib/api'
import { Container } from '@/components/Container'

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

export default function UploadPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<UploadState>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{
    project_id: number; file_name: string; row_count: number; column_count: number
  } | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setState('error')
      setError('Only CSV files are supported.')
      return
    }
    if (f.size > 100 * 1024 * 1024) {
      setState('error')
      setError('File exceeds 100MB limit.')
      return
    }

    setFile(f)
    setState('uploading')
    setError('')
    setProgress(0)

    // Simulate progress (actual upload happens via fetch)
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90))
    }, 200)

    try {
      const res = await uploads.upload(f)
      clearInterval(interval)
      setProgress(100)
      setResult(res)
      setState('success')
    } catch (err: any) {
      clearInterval(interval)
      setState('error')
      setError(err.message || 'Upload failed.')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('idle')
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const reset = () => {
    setState('idle')
    setFile(null)
    setResult(null)
    setError('')
    setProgress(0)
  }

  return (
    <Container size="sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload CSV</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Upload a CSV file to start generating your Tableau dashboard.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Idle / Dragging ────────────────────────────────────────── */}
        {(state === 'idle' || state === 'dragging') && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <label
              onDragOver={(e) => { e.preventDefault(); setState('dragging') }}
              onDragLeave={() => setState('idle')}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center gap-4 p-16 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                state === 'dragging'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-card)]/40 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-card)]/60'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                state === 'dragging'
                  ? 'bg-[var(--color-primary)]/20'
                  : 'bg-[var(--color-primary)]/10'
              }`}>
                <FileUp className={`w-7 h-7 transition-colors ${
                  state === 'dragging' ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]'
                }`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {state === 'dragging' ? 'Drop your file here' : 'Drag & drop your CSV file here'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  or click to browse · up to 100MB
                </p>
              </div>
            </label>

            {/* File format info */}
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <FileSpreadsheet className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                <strong className="text-[var(--color-text-primary)]">Supported format:</strong> CSV files with headers.
                The system auto-detects encoding (UTF-8, Latin-1, etc.), handles missing values,
                and strips empty rows/columns.
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Uploading ──────────────────────────────────────────────── */}
        {state === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-center"
          >
            <Loader2 className="w-10 h-10 text-[var(--color-primary)] mx-auto mb-4 animate-spin" />
            <p className="text-sm font-medium mb-2">Uploading {file?.name}...</p>
            <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-[var(--color-bg-surface)] overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2 font-mono">
              {Math.round(progress)}%
            </p>
          </motion.div>
        )}

        {/* ── Success ────────────────────────────────────────────────── */}
        {state === 'success' && result && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          >
            <div className="text-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-[var(--color-success)] mx-auto mb-3" />
              <h2 className="text-lg font-bold">Upload Successful!</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{result.file_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-[var(--color-border)] text-center">
                <p className="text-xl font-bold font-[var(--font-mono)] text-[var(--color-primary)]">
                  {result.row_count.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Rows</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-[var(--color-border)] text-center">
                <p className="text-xl font-bold font-[var(--font-mono)] text-[var(--color-accent)]">
                  {result.column_count}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Columns</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button onClick={reset} className="px-5 py-2.5 rounded-xl text-sm font-medium glass hover:bg-white/5 transition-colors">
                Upload Another
              </button>
              <button
                onClick={() => navigate(`/app/profile/${result.project_id}`)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-opacity"
              >
                Analyze Data <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Error ──────────────────────────────────────────────────── */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-danger)]/30 text-center"
          >
            <AlertCircle className="w-12 h-12 text-[var(--color-danger)] mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-2">Upload Failed</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">{error}</p>
            <button onClick={reset} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-opacity">
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}
