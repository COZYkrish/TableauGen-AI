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
import ColorBends from '@/components/ColorBends'

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
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 overflow-hidden w-full">
      {/* ── Background Animation ───────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <ColorBends
          colors={['#ffffff', '#a855f7', '#00ffd1']}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent={true}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full">
        <Container size="sm">
          <div className="mb-8 text-center sm:text-left">
            <h1
              className="text-3xl font-bold text-white tracking-tight mb-2"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
            >
              Upload CSV
            </h1>
            <p className="text-sm text-white/60" style={{ fontFamily: 'var(--font-sans)' }}>
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
                  borderRadius={24}
                  backgroundOpacity={0.03}
                  saturation={1.5}
                  distortionScale={-180}
                  brightness={60}
                  blur={20}
                  className={`w-full transition-all duration-300 ${
                    state === 'dragging' ? 'scale-[1.02]' : ''
                  }`}
                  style={{ display: 'block' }}
                >
                  <label
                    onDragOver={(e) => { e.preventDefault(); setState('dragging') }}
                    onDragLeave={() => setState('idle')}
                    onDrop={handleDrop}
                    className="relative flex flex-col items-center justify-center gap-5 p-16 sm:p-20 cursor-pointer w-full"
                    style={{
                      border: state === 'dragging'
                        ? '2px dashed rgba(255,255,255,0.6)'
                        : '2px dashed rgba(255,255,255,0.15)',
                      borderRadius: '24px',
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
                      className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl"
                      style={{
                        background: state === 'dragging'
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      <FileUp
                        className="w-9 h-9 transition-transform duration-300"
                        style={{
                          color: state === 'dragging' ? '#ffffff' : 'rgba(255,255,255,0.8)',
                          transform: state === 'dragging' ? 'translateY(-4px)' : 'translateY(0)',
                        }}
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-base font-semibold text-white mb-2">
                        {state === 'dragging' ? 'Drop your file here' : 'Drag & drop your CSV file here'}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
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
                  backgroundOpacity={0.02}
                  saturation={1.2}
                  distortionScale={-120}
                  brightness={50}
                  blur={12}
                  className="w-full mt-5"
                  style={{ display: 'block' }}
                >
                  <div className="flex items-start gap-4 px-6 py-5 w-full">
                    <FileSpreadsheet
                      className="w-6 h-6 shrink-0 mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    />
                    <div
                      className="text-xs leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-sans)' }}
                    >
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Supported format:</strong>{' '}
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
                  borderRadius={24}
                  backgroundOpacity={0.03}
                  saturation={1.4}
                  distortionScale={-160}
                  className="w-full"
                  style={{ display: 'block' }}
                >
                  <div className="text-center py-16 px-8 w-full">
                    <Loader2 className="w-12 h-12 mx-auto mb-6 animate-spin" style={{ color: 'rgba(255,255,255,0.9)' }} />
                    <p className="text-base font-semibold text-white mb-4">Uploading {file?.name}...</p>
                    <div className="w-full max-w-sm mx-auto h-2 rounded-full overflow-hidden shadow-inner" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs mt-3 font-bold" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
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
                  borderRadius={24}
                  backgroundOpacity={0.03}
                  saturation={1.4}
                  distortionScale={-160}
                  className="w-full"
                  style={{ display: 'block' }}
                >
                  <div className="py-12 px-8 w-full">
                    <div className="text-center mb-8">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: '#00ffd1', filter: 'drop-shadow(0 0 12px rgba(0, 255, 209, 0.4))' }} />
                      <h2 className="text-2xl font-bold text-white">Upload Successful!</h2>
                      <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>{result.file_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto">
                      {[
                        { val: result.row_count.toLocaleString(), label: 'Rows' },
                        { val: result.column_count, label: 'Columns' },
                      ].map((stat) => (
                        <GlassSurface
                          key={stat.label}
                          width="100%"
                          height="auto"
                          borderRadius={16}
                          backgroundOpacity={0.02}
                          distortionScale={-100}
                          className="w-full shadow-lg"
                          style={{ display: 'block' }}
                        >
                          <div className="text-center py-5 px-4 w-full">
                            <p className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>{stat.val}</p>
                            <p className="text-[11px] uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>{stat.label}</p>
                          </div>
                        </GlassSurface>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={reset}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontFamily: 'var(--font-sans)' }}
                      >
                        Upload Another
                      </button>
                      <button
                        onClick={() => navigate(`/app/profile/${result.project_id}`)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-black transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
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
                  borderRadius={24}
                  backgroundOpacity={0.03}
                  distortionScale={-140}
                  className="w-full"
                  style={{ display: 'block', border: '1px solid rgba(255,92,122,0.3)' }}
                >
                  <div className="text-center py-12 px-8 w-full">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ff5c7a', filter: 'drop-shadow(0 0 12px rgba(255, 92, 122, 0.4))' }} />
                    <h2 className="text-xl font-bold text-white mb-3">Upload Failed</h2>
                    <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-sans)' }}>{error}</p>
                    <button
                      onClick={reset}
                      className="px-8 py-3.5 rounded-full text-sm font-bold text-black transition-all hover:scale-105"
                      style={{ background: '#ffffff', fontFamily: 'var(--font-sans)' }}
                    >
                      Try Again
                    </button>
                  </div>
                </GlassSurface>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </div>
    </div>
  )
}

