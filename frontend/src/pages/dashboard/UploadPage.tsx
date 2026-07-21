import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, FileUp
} from 'lucide-react'
import { uploads } from '@/lib/api'
import { Container } from '@/components/Container'
import GlassSurface from '@/components/GlassSurface'

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
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
        >
          Upload CSV
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
          Upload a CSV file to start generating your Tableau dashboard.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Idle / Dragging ──────────────────────────────────────── */}
        {(state === 'idle' || state === 'dragging') && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Drag & Drop Zone wrapped in GlassSurface */}
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={20}
              backgroundOpacity={0.06}
              saturation={1.4}
              distortionScale={-160}
              brightness={55}
              blur={14}
              className={`w-full transition-all duration-300 ${
                state === 'dragging' ? 'scale-[1.01]' : ''
              }`}
              style={{ display: 'block' }}
            >
              <label
                onDragOver={(e) => { e.preventDefault(); setState('dragging') }}
                onDragLeave={() => setState('idle')}
                onDrop={handleDrop}
                className="relative flex flex-col items-center justify-center gap-4 p-16 cursor-pointer w-full"
                style={{
                  border: state === 'dragging'
                    ? '2px dashed rgba(255,255,255,0.4)'
                    : '2px dashed rgba(255,255,255,0.12)',
                  borderRadius: '20px',
                  transition: 'border-color 0.2s',
                }}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleInputChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: state === 'dragging'
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <FileUp
                    className="w-7 h-7 transition-transform duration-300"
                    style={{
                      color: state === 'dragging' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                      transform: state === 'dragging' ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {state === 'dragging' ? 'Drop your file here' : 'Drag & drop your CSV file here'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
                    or click to browse · up to 100MB
                  </p>
                </div>
              </label>
            </GlassSurface>

            {/* File format info wrapped in GlassSurface */}
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={16}
              backgroundOpacity={0.04}
              saturation={1.2}
              distortionScale={-120}
              brightness={50}
              blur={10}
              className="w-full mt-4"
              style={{ display: 'block' }}
            >
              <div className="flex items-start gap-3 px-5 py-4 w-full">
                <FileSpreadsheet
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-sans)' }}
                >
                  <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Supported format:</strong>{' '}
                  CSV files with headers. The system auto-detects encoding (UTF-8, Latin-1, etc.),
                  handles missing values, and strips empty rows/columns.
                </div>
              </div>
            </GlassSurface>
          </motion.div>
        )}

        {/* ── Uploading ────────────────────────────────────────────── */}
        {state === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={20}
              backgroundOpacity={0.06}
              saturation={1.3}
              distortionScale={-150}
              className="w-full"
              style={{ display: 'block' }}
            >
              <div className="text-center py-10 px-8 w-full">
                <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: 'rgba(255,255,255,0.7)' }} />
                <p className="text-sm font-medium text-white mb-3">Uploading {file?.name}...</p>
                <div className="w-full max-w-xs mx-auto h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.9) 100%)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(progress)}%
                </p>
              </div>
            </GlassSurface>
          </motion.div>
        )}

        {/* ── Success ──────────────────────────────────────────────── */}
        {state === 'success' && result && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={20}
              backgroundOpacity={0.06}
              saturation={1.3}
              distortionScale={-150}
              className="w-full"
              style={{ display: 'block' }}
            >
              <div className="py-10 px-8 w-full">
                <div className="text-center mb-6">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(134,239,172,0.9)' }} />
                  <h2 className="text-lg font-bold text-white">Upload Successful!</h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>{result.file_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
                  {[
                    { val: result.row_count.toLocaleString(), label: 'Rows' },
                    { val: result.column_count, label: 'Columns' },
                  ].map((stat) => (
                    <GlassSurface
                      key={stat.label}
                      width="100%"
                      height="auto"
                      borderRadius={12}
                      backgroundOpacity={0.04}
                      distortionScale={-100}
                      className="w-full"
                      style={{ display: 'block' }}
                    >
                      <div className="text-center py-3 px-4 w-full">
                        <p className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{stat.val}</p>
                        <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>{stat.label}</p>
                      </div>
                    </GlassSurface>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={reset}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-sans)' }}
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={() => navigate(`/app/profile/${result.project_id}`)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-black transition-opacity hover:opacity-90"
                    style={{ background: '#ffffff', fontFamily: 'var(--font-sans)' }}
                  >
                    Analyze Data <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassSurface>
          </motion.div>
        )}

        {/* ── Error ────────────────────────────────────────────────── */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={20}
              backgroundOpacity={0.04}
              distortionScale={-140}
              className="w-full"
              style={{ display: 'block', border: '1px solid rgba(252,165,165,0.2)' }}
            >
              <div className="text-center py-10 px-8 w-full">
                <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(252,165,165,0.9)' }} />
                <h2 className="text-lg font-bold text-white mb-2">Upload Failed</h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-sans)' }}>{error}</p>
                <button
                  onClick={reset}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black bg-white hover:opacity-90 transition-opacity"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Try Again
                </button>
              </div>
            </GlassSurface>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}
