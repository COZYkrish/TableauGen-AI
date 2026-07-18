import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Database, Hash, Calendar, ToggleLeft,
  Tag, DollarSign, Percent, MapPin, ArrowRight,
  BarChart3, AlertTriangle, Loader2, Layers
} from 'lucide-react'
import { uploads, type ProfileResponse } from '@/lib/api'
import { Container } from '@/components/Container'

const ROLE_ICONS: Record<string, typeof Tag> = {
  dimension: Tag,
  measure: Hash,
  date: Calendar,
  identifier: Database,
  boolean: ToggleLeft,
}

const SEMANTIC_ICONS: Record<string, typeof Tag> = {
  currency: DollarSign,
  percentage: Percent,
  geographic: MapPin,
  quantity: Hash,
  categorical: Tag,
  temporal: Calendar,
  numeric: Hash,
  identifier: Database,
  boolean: ToggleLeft,
  ratio: Percent,
  text: Tag,
}

const ROLE_COLORS: Record<string, string> = {
  dimension: 'var(--color-accent)',
  measure: 'var(--color-primary)',
  date: 'var(--color-warning)',
  identifier: 'var(--color-text-muted)',
  boolean: 'var(--color-success)',
}

export default function ProfilePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    uploads.profile(parseInt(projectId))
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium">Analyzing your dataset...</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Running profiler & metadata engine</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="w-8 h-8 text-[var(--color-danger)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
        <button onClick={() => navigate('/app')} className="text-sm text-[var(--color-primary)] hover:underline">
          Back to Projects
        </button>
      </div>
    )
  }

  if (!data) return null

  const { overview, columns, summary } = data

  return (
    <Container>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/app')}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Data Profile</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {overview.row_count?.toLocaleString()} rows · {overview.column_count} columns
          </p>
        </div>
        <button
          onClick={() => navigate(`/app/dashboard/${projectId}`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-opacity"
        >
          Generate Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Overview KPIs ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8"
      >
        {[
          { label: 'Rows', value: overview.row_count?.toLocaleString(), color: 'var(--color-primary)' },
          { label: 'Columns', value: overview.column_count, color: 'var(--color-accent)' },
          { label: 'Dimensions', value: summary.dimension_count, color: 'var(--color-accent)' },
          { label: 'Measures', value: summary.measure_count, color: 'var(--color-primary)' },
          { label: 'Missing %', value: `${overview.missing_percent}%`, color: overview.missing_percent > 5 ? 'var(--color-warning)' : 'var(--color-success)' },
          { label: 'Duplicates', value: overview.duplicate_rows, color: overview.duplicate_rows > 0 ? 'var(--color-warning)' : 'var(--color-success)' },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{kpi.label}</p>
            <p className="text-xl font-bold font-[var(--font-mono)] mt-1" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* ── Field Role Summary ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        {(['dimensions', 'measures', 'dates', 'identifiers'] as const).map((role) => {
          const fields: string[] = summary[role] || []
          const colors = {
            dimensions: 'var(--color-accent)',
            measures: 'var(--color-primary)',
            dates: 'var(--color-warning)',
            identifiers: 'var(--color-text-muted)',
          }
          return (
            <div key={role} className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4" style={{ color: colors[role] }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors[role] }}>
                  {role}
                </h3>
                <span className="ml-auto text-xs font-mono text-[var(--color-text-muted)]">{fields.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fields.length === 0 && (
                  <span className="text-xs text-[var(--color-text-muted)]">None detected</span>
                )}
                {fields.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 text-[11px] rounded-md bg-white/[0.04] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* ── Column Detail Table ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold">Column Metadata</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Inferred by the Metadata Engine — each column enriched with semantic meaning
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="text-left px-5 py-3 font-medium">Column</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Semantic</th>
                <th className="text-left px-4 py-3 font-medium">Aggregation</th>
                <th className="text-left px-4 py-3 font-medium">Format</th>
                <th className="text-right px-4 py-3 font-medium">Null %</th>
                <th className="text-right px-4 py-3 font-medium">Unique</th>
                <th className="text-left px-5 py-3 font-medium">Entity</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(columns).map((col: any, i: number) => {
                const RoleIcon = ROLE_ICONS[col.field_role] || Tag
                const roleColor = ROLE_COLORS[col.field_role] || 'var(--color-text-muted)'
                return (
                  <motion.tr
                    key={col.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t border-[var(--color-border)] hover:bg-white/[0.015] transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-[var(--color-text-primary)]">{col.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium" style={{ color: roleColor, background: `color-mix(in srgb, ${roleColor} 10%, transparent)` }}>
                        <RoleIcon className="w-3 h-3" />
                        {col.field_role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{col.semantic_type}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--color-text-muted)]">{col.default_aggregation}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{col.display_format}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono text-xs ${col.null_percent > 5 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'}`}>
                        {col.null_percent}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-text-muted)]">
                      {col.unique_count}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">
                      {col.business_entity || '—'}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </Container>
  )
}
