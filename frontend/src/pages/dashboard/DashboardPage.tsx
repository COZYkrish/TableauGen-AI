import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Download, Loader2, AlertTriangle,
  BarChart3, TrendingUp, PieChart, Map, GitBranch, Layers,
  RefreshCw, Sparkles, CheckCircle2, DollarSign, Package,
  Percent, Hash, BarChart2, Filter, Palette, ChevronRight,
  Activity, Zap, Brain
} from 'lucide-react'
import {
  dashboard as dashboardApi,
  getToken,
  type BlueprintResponse,
  type ChartRecommendation,
  type KPICard,
  type ThemeSummary
} from '@/lib/api'
import { Container } from '@/components/Container'

// ── Icon maps ────────────────────────────────────────────────────────────────

const CHART_ICONS: Record<string, typeof BarChart3> = {
  bar: BarChart3,
  line: TrendingUp,
  pie: PieChart,
  scatter: Activity,
  map: Map,
  treemap: Layers,
}

const KPI_ICONS: Record<string, typeof DollarSign> = {
  DollarSign, Package, Percent, Hash, BarChart2, TrendingUp,
}

const CHART_TYPE_COLORS: Record<string, string> = {
  bar: 'var(--color-primary)',
  line: 'var(--color-accent)',
  pie: 'var(--color-warning)',
  scatter: '#a78bfa',
  map: '#34d399',
  treemap: '#f97316',
}

const THEME_SWATCHES: Record<string, string[]> = {
  executive: ['#1A3A5C', '#C9973A', '#2E6DA4', '#4A90D9'],
  sales:     ['#00897B', '#FF6D00', '#26A69A', '#43A047'],
  finance:   ['#1565C0', '#2E7D32', '#C62828', '#F57F17'],
  minimal:   ['#5C6BC0', '#78909C', '#7E57C2', '#42A5F5'],
}

// ── Score ring component ─────────────────────────────────────────────────────

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold font-mono" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

// ── KPI Card component ───────────────────────────────────────────────────────

function KPICardUI({ kpi }: { kpi: KPICard }) {
  const Icon = KPI_ICONS[kpi.icon] || Hash
  const color = kpi.semantic_type === 'currency' ? 'var(--color-primary)'
    : kpi.semantic_type === 'quantity' ? 'var(--color-accent)'
    : kpi.semantic_type === 'percentage' ? 'var(--color-warning)'
    : 'var(--color-text-secondary)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-start gap-3 hover:border-[var(--color-border-hover)] transition-colors"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider leading-none mb-1">{kpi.aggregation}</p>
        <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug">{kpi.title}</p>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono truncate">{kpi.formula}</p>
      </div>
    </motion.div>
  )
}

// ── Chart Recommendation Card ────────────────────────────────────────────────

function RecommendationCard({ rec, index }: { rec: ChartRecommendation; index: number }) {
  const Icon = CHART_ICONS[rec.chart_type] || BarChart3
  const color = CHART_TYPE_COLORS[rec.chart_type] || 'var(--color-primary)'

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex gap-4 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all group"
    >
      <ScoreRing score={rec.score} color={color} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            {rec.chart_type}{rec.chart_subtype ? ` (${rec.chart_subtype})` : ''}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1.5 leading-snug">
          {rec.title}
        </h3>

        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {rec.rationale}
        </p>

        {/* Field pills */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {Object.entries(rec.fields)
            .filter(([, v]) => v && typeof v === 'string')
            .map(([k, v]) => (
              <span key={k} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text-muted)]">{k}: </span>{v}
              </span>
            ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Theme Selector ───────────────────────────────────────────────────────────

function ThemeSelector({
  themes, selected, onSelect
}: { themes: ThemeSummary[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {themes.map((t) => {
        const swatches = THEME_SWATCHES[t.id] || ['#555', '#777', '#999', '#bbb']
        const isActive = t.id === selected
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              isActive
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-card)]'
            }`}
          >
            <div className="flex gap-1 mb-2">
              {swatches.map((c, i) => (
                <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <p className="text-xs font-semibold">{t.name}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-snug">{t.description}</p>
          </button>
        )
      })}
    </div>
  )
}

// ── Main Dashboard Page ──────────────────────────────────────────────────────

type Stage = 'generating' | 'ready' | 'exporting' | 'exported' | 'error'

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [stage, setStage] = useState<Stage>('generating')
  const [blueprint, setBlueprint] = useState<BlueprintResponse | null>(null)
  const [selectedTheme, setSelectedTheme] = useState('executive')
  const [error, setError] = useState('')
  const [exportData, setExportData] = useState<{ url: string; fileName: string } | null>(null)
  const [exportWarnings, setExportWarnings] = useState<string[]>([])
  const [regenerating, setRegenerating] = useState(false)

  const pid = parseInt(projectId || '0')

  // ── Initial generation ────────────────────────────────────────────
  useEffect(() => {
    if (!pid) return
    generateBlueprint('executive')
  }, [pid])

  const generateBlueprint = async (theme: string) => {
    setStage('generating')
    setError('')
    try {
      // Try fetching existing blueprint first
      let data: BlueprintResponse
      try {
        data = await dashboardApi.get(pid)
        // If different theme requested, regenerate
        if (data.theme_name !== theme) {
          data = await dashboardApi.generate(pid, theme)
        }
      } catch {
        data = await dashboardApi.generate(pid, theme)
      }
      setBlueprint(data)
      setSelectedTheme(data.theme_name)
      setStage('ready')
    } catch (err: any) {
      setError(err.message || 'Failed to generate dashboard')
      setStage('error')
    }
  }

  const handleThemeChange = async (themeId: string) => {
    if (themeId === selectedTheme || !pid) return
    setSelectedTheme(themeId)
    setRegenerating(true)
    try {
      const data = await dashboardApi.generate(pid, themeId)
      setBlueprint(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRegenerating(false)
    }
  }

  const handleExport = async () => {
    if (!pid) return
    setStage('exporting')
    try {
      const res = await dashboardApi.export(pid)
      setExportData({
        url: dashboardApi.downloadUrl(pid),
        fileName: res.file_name,
      })
      setExportWarnings(res.validation_warnings || [])
      setStage('exported')
    } catch (err: any) {
      setError(err.message || 'Export failed')
      setStage('ready')
    }
  }

  const handleDownload = async () => {
    if (!exportData) return
    try {
      const token = getToken()
      const res = await fetch(exportData.url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) { setError('Download failed — please try exporting again.'); return }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = exportData.fileName
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      setError('Download failed — please try exporting again.')
    }
  }

  // ── Loading state ─────────────────────────────────────────────────
  if (stage === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-9 h-9 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl gradient-primary opacity-30 animate-ping" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">Generating Your Dashboard</h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
            Running AI recommendation engine, KPI generator, and dashboard planner...
          </p>
        </div>
        <div className="flex items-center gap-6 mt-4">
          {['Profiling', 'Recommendations', 'KPIs', 'Blueprint'].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.5 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 text-[var(--color-primary)] animate-spin" />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">{step}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <AlertTriangle className="w-10 h-10 text-[var(--color-danger)]" />
        <h2 className="text-lg font-bold">Generation Failed</h2>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm text-center">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/app')} className="px-4 py-2 rounded-xl text-sm glass hover:bg-white/5">
            Back to Projects
          </button>
          <button
            onClick={() => generateBlueprint(selectedTheme)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-primary"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    )
  }

  if (!blueprint) return null

  const { kpis, recommendations, filters, available_themes, metadata_summary } = blueprint

  return (
    <Container>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(`/app/profile/${pid}`)}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
            Dashboard Blueprint
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Template: <span className="text-[var(--color-text-primary)] font-medium capitalize">{blueprint.template}</span>
            {' · '}{recommendations.length} charts · {kpis.length} KPIs
          </p>
        </div>

        {/* Intelligence button */}
        <button
          onClick={() => navigate(`/app/intelligence/${pid}`)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass hover:bg-white/5 border border-[var(--color-accent)]/20 text-[var(--color-accent)] hover:border-[var(--color-accent)]/40 transition-all"
        >
          <Brain className="w-4 h-4" /> AI Insights
        </button>

        {/* Export button */}
        <AnimatePresence mode="wait">
          {stage === 'exported' && exportData ? (
            <motion.button
              key="download"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-success)] hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" /> Download .twbx
            </motion.button>
          ) : stage === 'exporting' ? (
            <motion.button
              key="exporting"
              disabled
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary opacity-70 cursor-not-allowed"
            >
              <Loader2 className="w-4 h-4 animate-spin" /> Exporting...
            </motion.button>
          ) : (
            <motion.button
              key="export"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-opacity glow-primary"
            >
              <Zap className="w-4 h-4" /> Generate .twbx
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Export success banner ────────────────────────────────────── */}
      <AnimatePresence>
        {stage === 'exported' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30"
          >
            <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-success)]">
                Tableau Workbook Generated Successfully!
              </p>
              {exportWarnings.length > 0 && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {exportWarnings.length} warning(s): {exportWarnings[0]}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Main content ────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Dataset summary pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
            {[
              { label: `${metadata_summary.dimension_count} Dimensions`, icon: Layers, color: 'var(--color-accent)' },
              { label: `${metadata_summary.measure_count} Measures`, icon: BarChart2, color: 'var(--color-primary)' },
              metadata_summary.has_temporal && { label: 'Temporal Data', icon: TrendingUp, color: 'var(--color-warning)' },
              metadata_summary.has_geographic && { label: 'Geographic Data', icon: Map, color: '#34d399' },
              metadata_summary.has_currency && { label: 'Currency Fields', icon: DollarSign, color: 'var(--color-primary)' },
            ].filter(Boolean).map((pill: any, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{
                  color: pill.color,
                  borderColor: `color-mix(in srgb, ${pill.color} 30%, transparent)`,
                  background: `color-mix(in srgb, ${pill.color} 8%, transparent)`,
                }}
              >
                <pill.icon className="w-3 h-3" />
                {pill.label}
              </span>
            ))}
          </motion.div>

          {/* ── KPI Cards ─────────────────────────────────────────── */}
          {kpis.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[var(--color-warning)]" />
                <h2 className="text-base font-semibold">KPI Cards</h2>
                <span className="ml-auto text-xs text-[var(--color-text-muted)]">{kpis.length} metrics</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {kpis.map((kpi) => (
                  <KPICardUI key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </section>
          )}

          {/* ── Chart Recommendations ─────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="text-base font-semibold">Chart Recommendations</h2>
              <span className="ml-auto text-xs text-[var(--color-text-muted)]">Ranked by AI confidence</span>
            </div>
            <div className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={rec.title} rec={rec} index={i} />
              ))}
              {recommendations.length === 0 && (
                <div className="p-8 text-center rounded-xl border border-dashed border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    No chart recommendations generated. Your dataset may need more columns.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Filter Suggestions ────────────────────────────────── */}
          {filters.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <h2 className="text-base font-semibold">Suggested Filters</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <div
                    key={f.field}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-xs"
                  >
                    <span className="font-medium text-[var(--color-text-primary)]">{f.label}</span>
                    <span className="text-[var(--color-text-muted)]">
                      {f.filter_type === 'date_range' ? '📅 Date Range'
                        : `Dropdown (${f.values_count} values)`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Theme selector */}
          <div className="p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-[var(--color-accent)]" />
              <h3 className="text-sm font-semibold">Dashboard Theme</h3>
              {regenerating && <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin text-[var(--color-text-muted)]" />}
            </div>
            <ThemeSelector
              themes={available_themes}
              selected={selectedTheme}
              onSelect={handleThemeChange}
            />
          </div>

          {/* Blueprint summary */}
          <div className="p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <h3 className="text-sm font-semibold">Blueprint Summary</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Template', value: blueprint.template, capitalize: true },
                { label: 'Theme', value: blueprint.theme?.name || selectedTheme, capitalize: false },
                { label: 'Charts', value: recommendations.length },
                { label: 'KPI Cards', value: kpis.length },
                { label: 'Filters', value: filters.length },
                { label: 'Layout Cells', value: blueprint.layout?.length || 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">{item.label}</span>
                  <span className={`font-semibold text-[var(--color-text-primary)] ${item.capitalize ? 'capitalize' : ''}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart type breakdown */}
          <div className="p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold mb-3">Chart Types</h3>
            <div className="space-y-2">
              {Array.from(
                recommendations.reduce((acc, r) => {
                  acc.set(r.chart_type, (acc.get(r.chart_type) || 0) + 1)
                  return acc
                }, new globalThis.Map<string, number>())
              ).map(([type, count]) => {
                const Icon = CHART_ICONS[type] || BarChart3
                const color = CHART_TYPE_COLORS[type] || 'var(--color-primary)'
                return (
                  <div key={type} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-xs capitalize flex-1">{type}</span>
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">×{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Export action card */}
          <div className="p-4 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
            <h3 className="text-sm font-semibold mb-1.5">Ready to Export?</h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">
              Generate a Tableau Packaged Workbook (.twbx) with all charts pre-built and data embedded.
            </p>
            <button
              onClick={handleExport}
              disabled={stage === 'exporting' || stage === 'exported'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {stage === 'exporting'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                : stage === 'exported'
                ? <><CheckCircle2 className="w-4 h-4" /> Exported!</>
                : <><Download className="w-4 h-4" /> Generate .twbx</>
              }
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}
