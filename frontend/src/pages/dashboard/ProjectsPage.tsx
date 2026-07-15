import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, FolderKanban, Upload, ArrowRight } from 'lucide-react'

export default function ProjectsPage() {
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

      {/* Empty state */}
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
    </div>
  )
}
