import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Brain, Loader2, AlertTriangle, RefreshCw,
  TrendingUp, TrendingDown, Minus, AlertCircle, Info,
  Zap, BarChart3, BookOpen, Target, ChevronDown, ChevronRight,
  Sparkles, Shield, Activity
} from 'lucide-react'
import {
  intelligence as intelligenceApi,
  type IntelligenceReport, type Insight, type Forecast, type Narrative
} from '@/lib/api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  critical: { color: 'var(--color-danger)', icon: AlertCircle, label: 'Critical', bg: 'var(--color-danger)' },
  warning:  { color: 'var(--color-warning)', icon: AlertTriangle, label: 'Warning', bg: 'var(--color-warning)' },
  info:     { color: 'var(--color-accent)', icon: Info, label: 'Info', bg: 'var(--color-accent)' },
}

const TYPE_CONFIG = {
  distribution:  { label: 'Distribution', color: '#a78bfa' },
  correlation:   { label: 'Correlation',  color: '#34d399' },
  trend:         { label: 'Trend',        color: 'var(--color-accent)' },
  concentration: { label: 'Concentration', color: 'var(--color-warning)' },
  quality:       { label: 'Data Quality', color: 'var(--color-danger)' },
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-white/5 text-[var(--color-accent)] font-mono text-[11px]">$1</code>')
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const sev = SEVERITY_CONFIG[insight.severity]
  const typ = TYPE_CONFIG[insight.type]
  const SevIcon = sev.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border overflow-hidden transition-colors"
      style={{ borderColor: `color-mix(in srgb, ${sev.bg} 20%, transparent)` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${sev.bg} 12%, transparent)` }}
        >
          <SevIcon className="w-4 h-4" style={{ color: sev.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
              style={{ color: typ.color, background: `color-mix(in srgb, ${typ.color} 10%, transparent)` }}
            >
              {typ.label}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
              style={{ color: sev.color, background: `color-mix(in srgb, ${sev.bg} 10%, transparent)` }}
            >
              {sev.label}
            </span>
            {insight.metric !== null && (
              <span className="ml-auto text-xs font-mono text-[var(--color-text-muted)]">
                {insight.metric > 0 ? '+' : ''}{insight.metric}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold truncate">{insight.title}</p>
        </div>

        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div
                className="text-sm text-[var(--color-text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(insight.description) }}
              />
              {insight.fields.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {insight.fields.map(f => (
                    <span key={f} className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.04] border border-[var(--color-border)] text-[var(--color-accent)]">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function MiniChart({ historical, forecast, color }: {
  historical: { period: string; value: number }[]
  forecast: { period: string; value: number }[]
  color: string
}) {
  const allValues = [...historical.map(h => h.value), ...forecast.map(f => f.value)]
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || 1
  const W = 280, H = 72, pad = 6
  const n = allValues.length

  const toX = (i: number) => pad + (i / (n - 1)) * (W - pad * 2)
  const toY = (v: number) => H - pad - ((v - min) / range) * (H - pad * 2)

  const histPoints = historical.map((h, i) => `${toX(i)},${toY(h.value)}`).join(' ')
  const forecastStartX = toX(historical.length - 1)
  const forecastPoints = [
    `${toX(historical.length - 1)},${toY(historical[historical.length - 1].value)}`,
    ...forecast.map((f, i) => `${toX(historical.length + i)},${toY(f.value)}`),
  ].join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-18">
      {/* Historical line */}
      <polyline points={histPoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Forecast line (dashed) */}
      <polyline points={forecastPoints} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      {/* Divider */}
      <line x1={forecastStartX} y1={pad} x2={forecastStartX} y2={H - pad}
        stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Dots at ends */}
      <circle cx={toX(0)} cy={toY(historical[0].value)} r="3" fill={color} />
      <circle cx={toX(historical.length - 1)} cy={toY(historical[historical.length - 1].value)} r="3" fill={color} />
    </svg>
  )
}

// ─── Forecast Card ────────────────────────────────────────────────────────────

function ForecastCard({ forecast, index }: { forecast: Forecast; index: number }) {
  const TrendIcon = forecast.trend_direction === 'up' ? TrendingUp
    : forecast.trend_direction === 'down' ? TrendingDown : Minus
  const trendColor = forecast.trend_direction === 'up' ? 'var(--color-success)'
    : forecast.trend_direction === 'down' ? 'var(--color-danger)' : 'var(--color-text-muted)'

  const methodLabel: Record<string, string> = {
    linear: 'Linear Regression',
    moving_avg: 'Moving Average',
    seasonal_naive: 'Seasonal Naive',
  }

  const confidenceColor = {
    high: 'var(--color-success)',
    medium: 'var(--color-warning)',
    low: 'var(--color-danger)',
  }[forecast.confidence]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold">{forecast.measure.replace(/_/g, ' ')}</h3>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            via <span className="text-[var(--color-text-secondary)]">{forecast.date_field}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: trendColor }}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            {forecast.growth_rate_pct >= 0 ? '+' : ''}{forecast.growth_rate_pct}%
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase"
            style={{ color: confidenceColor, background: `color-mix(in srgb, ${confidenceColor} 10%, transparent)` }}
          >
            {forecast.confidence} confidence
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mb-3">
        <MiniChart
          historical={forecast.historical}
          forecast={forecast.forecast}
          color={trendColor}
        />
      </div>

      {/* Next periods strip */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {forecast.forecast.slice(0, 4).map((pt, i) => (
          <div
            key={i}
            className="flex-1 min-w-0 p-2 rounded-lg bg-white/[0.03] border border-[var(--color-border)] text-center"
          >
            <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{pt.period}</p>
            <p className="text-xs font-mono font-bold" style={{ color: trendColor }}>
              {pt.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
        Method: <span className="text-[var(--color-text-secondary)]">{methodLabel[forecast.method] || forecast.method}</span>
      </p>
    </motion.div>
  )
}

// ─── Narrative Panel ──────────────────────────────────────────────────────────

function NarrativePanel({ narrative }: { narrative: Narrative }) {
  return (
    <div className="space-y-5">
      {/* Headline */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/5 border border-[var(--color-primary)]/20">
        <p className="text-xs text-[var(--color-accent)] uppercase tracking-widest mb-2 font-medium">AI Generated Headline</p>
        <h2 className="text-base font-bold leading-snug">{narrative.headline}</h2>
      </div>

      {/* Executive summary */}
      <div className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold">Executive Summary</h3>
        </div>
        <div
          className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2"
          dangerouslySetInnerHTML={{
            __html: narrative.executive_summary
              .split('. ')
              .map(s => `<p>${renderMarkdown(s)}.</p>`)
              .join(''),
          }}
        />
      </div>

      {/* Data story */}
      {narrative.data_story.length > 0 && (
        <div className="space-y-3">
          {narrative.data_story.map((section, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <h4 className="text-sm font-semibold mb-2">{section.title}</h4>
              <p
                className="text-sm text-[var(--color-text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Action items */}
      {narrative.action_items.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[var(--color-warning)]" />
            <h3 className="text-sm font-semibold">Recommended Actions</h3>
          </div>
          <ul className="space-y-2.5">
            {narrative.action_items.map((item, i) => (
              <li
                key={i}
                className="text-sm text-[var(--color-text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'insights' | 'forecast' | 'narrative'

export default function IntelligencePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const pid = parseInt(projectId || '0')

  const [report, setReport] = useState<IntelligenceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('insights')

  const load = () => {
    setLoading(true)
    setError('')
    intelligenceApi.full(pid)
      .then(setReport)
      .catch(err => setError(err.message || 'Failed to load intelligence report'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (pid) load() }, [pid])

  const tabs: { id: Tab; label: string; icon: typeof Brain; count?: number }[] = [
    { id: 'insights', label: 'Insights', icon: Zap, count: report?.insights.length },
    { id: 'forecast', label: 'Forecast', icon: Activity, count: report?.forecasts.length },
    { id: 'narrative', label: 'Narrative', icon: BookOpen },
  ]

  const criticalCount = report?.insights.filter(i => i.severity === 'critical').length ?? 0
  const warningCount = report?.insights.filter(i => i.severity === 'warning').length ?? 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(`/app/dashboard/${pid}`)}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-[var(--color-accent)]" />
            AI Intelligence
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Statistical insights · Time-series forecasting · Natural language narrative
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm glass hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center">
              <Brain className="w-7 h-7 text-[var(--color-accent)]" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-[var(--color-accent)]/10 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Running Intelligence Engines</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Analysing distribution · detecting correlations · generating forecasts...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle className="w-10 h-10 text-[var(--color-danger)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm gradient-primary text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && report && (
        <>
          {/* Severity summary strip */}
          {(criticalCount > 0 || warningCount > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 mb-5 rounded-xl border"
              style={{
                borderColor: criticalCount > 0 ? 'color-mix(in srgb, var(--color-danger) 30%, transparent)' : 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
                background: criticalCount > 0 ? 'color-mix(in srgb, var(--color-danger) 5%, transparent)' : 'color-mix(in srgb, var(--color-warning) 5%, transparent)',
              }}
            >
              <Shield className="w-4 h-4 shrink-0" style={{ color: criticalCount > 0 ? 'var(--color-danger)' : 'var(--color-warning)' }} />
              <p className="text-sm">
                {criticalCount > 0 && <strong className="text-[var(--color-danger)]">{criticalCount} critical issue{criticalCount !== 1 ? 's' : ''}</strong>}
                {criticalCount > 0 && warningCount > 0 && <span className="text-[var(--color-text-muted)]"> and </span>}
                {warningCount > 0 && <strong className="text-[var(--color-warning)]">{warningCount} warning{warningCount !== 1 ? 's' : ''}</strong>}
                <span className="text-[var(--color-text-muted)]"> detected in your dataset — review the insights below.</span>
              </p>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] mb-6 w-fit">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{
                      background: tab === t.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                      color: tab === t.id ? '#fff' : 'var(--color-text-muted)',
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {tab === 'insights' && (
              <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {report.insights.length === 0 ? (
                  <div className="text-center py-16 text-[var(--color-text-muted)]">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No significant insights detected — your data looks clean!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {report.insights.map((ins, i) => (
                      <InsightCard key={ins.id} insight={ins} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'forecast' && (
              <motion.div key="forecast" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {report.forecasts.length === 0 ? (
                  <div className="text-center py-16 text-[var(--color-text-muted)]">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No temporal data found — add a date column to enable forecasting.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {report.forecasts.map((f, i) => (
                      <ForecastCard key={f.measure} forecast={f} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'narrative' && (
              <motion.div key="narrative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NarrativePanel narrative={report.narrative} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
