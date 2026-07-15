import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Upload, BarChart3, Brain, Gauge, LayoutDashboard, FileDown,
  Lightbulb, TrendingUp, Palette, ChevronRight, Sparkles, Zap,
  ArrowRight, Star, Check, ChevronDown, Menu, X
} from 'lucide-react'
import { useState } from 'react'

/* ─── Animation Variants ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-[var(--font-heading)] text-lg font-bold tracking-tight text-white">
            TableauGen <span className="text-[var(--color-accent)]">AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--color-text-secondary)]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
          <a href="#preview" className="hover:text-white transition-colors">Preview</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">
            Log In
          </Link>
          <Link to="/signup" className="px-5 py-2 text-sm font-medium text-white rounded-lg gradient-primary hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden glass-strong border-t border-[var(--color-border)] px-6 pb-6 pt-4 space-y-4"
        >
          <a href="#features" className="block text-sm text-[var(--color-text-secondary)] hover:text-white">Features</a>
          <a href="#workflow" className="block text-sm text-[var(--color-text-secondary)] hover:text-white">How It Works</a>
          <a href="#pricing" className="block text-sm text-[var(--color-text-secondary)] hover:text-white">Pricing</a>
          <Link to="/login" className="block text-sm text-[var(--color-text-secondary)] hover:text-white">Log In</Link>
          <Link to="/signup" className="block w-full text-center px-5 py-2.5 text-sm font-medium text-white rounded-lg gradient-primary">
            Get Started
          </Link>
        </motion.div>
      )}
    </motion.nav>
  )
}

/* ─── Hero ─────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-[150px] opacity-20" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-[150px] opacity-15" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left — Copy */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-[var(--color-accent)] mb-6"
          >
            <Zap className="w-3.5 h-3.5" />
            Powered by Intelligent Automation
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6"
          >
            Generate Professional{' '}
            <span className="gradient-text">Tableau Dashboards</span>{' '}
            Automatically
          </motion.h1>

          <motion.p variants={fadeUp} custom={2}
            className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mb-8 leading-relaxed"
          >
            Upload any CSV. Let TableauGen AI analyze your data,
            recommend the best visualizations, generate KPIs,
            and export a polished Tableau dashboard in minutes.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
            <Link to="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl gradient-primary glow-primary hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#preview"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl glass hover:bg-white/5 transition-colors"
            >
              Live Demo <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="mt-10 flex items-center gap-6 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> Unlimited CSVs</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> Export .twbx</span>
          </motion.div>
        </motion.div>

        {/* Right — Animated Dashboard Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
        >
          <div className="relative w-full aspect-[4/3]">
            {/* Main dashboard card */}
            <div className="absolute inset-0 rounded-2xl glass glow-primary overflow-hidden">
              {/* Header bar */}
              <div className="h-10 bg-[var(--color-bg-surface)] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--color-danger)] opacity-70" />
                <div className="w-3 h-3 rounded-full bg-[var(--color-warning)] opacity-70" />
                <div className="w-3 h-3 rounded-full bg-[var(--color-success)] opacity-70" />
                <div className="ml-4 h-5 w-48 rounded bg-white/5" />
              </div>

              {/* KPI row */}
              <div className="px-5 pt-5 grid grid-cols-4 gap-3">
                {[
                  { label: 'Revenue', value: '$2.4M', color: 'var(--color-primary)' },
                  { label: 'Profit', value: '$890K', color: 'var(--color-success)' },
                  { label: 'Orders', value: '12,847', color: 'var(--color-accent)' },
                  { label: 'Growth', value: '+24.5%', color: 'var(--color-warning)' },
                ].map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.12 }}
                    className="rounded-lg bg-white/[0.03] border border-[var(--color-border)] p-3"
                  >
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-lg font-bold font-[var(--font-mono)] mt-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart area — stylized bars */}
              <div className="px-5 pt-4 grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="rounded-lg bg-white/[0.03] border border-[var(--color-border)] p-4 h-36"
                >
                  <div className="flex items-end gap-1.5 h-full pb-4">
                    {[60, 80, 45, 90, 70, 55, 85, 75, 95, 65].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1.5 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                        className="flex-1 rounded-t-sm"
                        style={{
                          background: `linear-gradient(to top, var(--color-primary), var(--color-accent))`,
                          opacity: 0.7 + (i % 3) * 0.1,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="rounded-lg bg-white/[0.03] border border-[var(--color-border)] p-4 h-36 flex items-center justify-center"
                >
                  {/* Donut chart */}
                  <svg viewBox="0 0 120 120" className="w-24 h-24">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" strokeWidth="12" />
                    <motion.circle
                      cx="60" cy="60" r="50" fill="none" stroke="var(--color-primary)" strokeWidth="12"
                      strokeDasharray="200 314" strokeLinecap="round"
                      initial={{ strokeDashoffset: 314 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ delay: 1.6, duration: 1.2, ease: "easeOut" }}
                      transform="rotate(-90 60 60)"
                    />
                    <motion.circle
                      cx="60" cy="60" r="50" fill="none" stroke="var(--color-accent)" strokeWidth="12"
                      strokeDasharray="80 314" strokeLinecap="round"
                      initial={{ strokeDashoffset: 314 }}
                      animate={{ strokeDashoffset: -200 }}
                      transition={{ delay: 1.8, duration: 1, ease: "easeOut" }}
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="58" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="var(--font-mono)">68%</text>
                    <text x="60" y="73" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8">Margin</text>
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-16 h-16 rounded-xl glass flex items-center justify-center"
            >
              <BarChart3 className="w-7 h-7 text-[var(--color-accent)]" />
            </motion.div>

            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-3 -left-3 w-14 h-14 rounded-xl glass flex items-center justify-center"
            >
              <Upload className="w-6 h-6 text-[var(--color-primary)]" />
            </motion.div>

            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/3 -left-8 w-12 h-12 rounded-lg glass flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-[var(--color-warning)]" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Trusted By ───────────────────────────────────────────────────────────── */
function TrustedBy() {
  const roles = ['Analysts', 'Students', 'Businesses', 'Data Scientists', 'Tableau Developers']
  return (
    <section className="py-16 border-y border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-8">Built for</p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {roles.map((role, i) => (
            <motion.span
              key={role}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-sm sm:text-base font-medium text-[var(--color-text-secondary)] hover:text-white transition-colors cursor-default"
            >
              {role}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Features ─────────────────────────────────────────────────────────────── */
const features = [
  { icon: Upload, title: 'Upload Any CSV', desc: 'Supports any structured dataset with automatic encoding detection and error handling.' },
  { icon: Brain, title: 'AI Data Profiling', desc: 'Automatically analyzes every column, detects types, semantics, and relationships.' },
  { icon: BarChart3, title: 'Smart Visualization Engine', desc: 'Recommends the best charts with confidence scores you can override.' },
  { icon: Gauge, title: 'KPI Generator', desc: 'Creates meaningful business metrics — revenue, growth, margins — automatically.' },
  { icon: LayoutDashboard, title: 'Dashboard Generator', desc: 'Builds beautiful Tableau layouts using an intelligent planning engine.' },
  { icon: FileDown, title: 'Tableau Export', desc: 'Exports production-ready .twb and .twbx workbooks.' },
  { icon: Lightbulb, title: 'AI Insights', desc: 'Detects trends, anomalies, and correlations in your data.' },
  { icon: TrendingUp, title: 'Forecasting', desc: 'Time-series prediction with confidence intervals.' },
  { icon: Palette, title: 'Modern Themes', desc: 'Dark Executive, Corporate, Minimal — all configuration-driven.' },
]

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">Capabilities</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</motion.h2>
          <motion.p variants={fadeUp} className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            From raw data to polished Tableau dashboards — automated, intelligent, and production-ready.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="group p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                <f.icon className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Workflow ──────────────────────────────────────────────────────────────── */
const steps = [
  { step: '01', title: 'Upload CSV', desc: 'Drag & drop any structured CSV file.' },
  { step: '02', title: 'Analyze Dataset', desc: 'AI profiles every column and infers semantics.' },
  { step: '03', title: 'Detect Data Types', desc: 'Dimensions, measures, dates — auto-detected.' },
  { step: '04', title: 'Generate KPIs', desc: 'Business metrics computed automatically.' },
  { step: '05', title: 'Recommend Charts', desc: 'Ranked visualization recommendations.' },
  { step: '06', title: 'Create Dashboard', desc: 'Blueprint planned and layout generated.' },
  { step: '07', title: 'Export TWBX', desc: 'Download your Tableau workbook.' },
]

function Workflow() {
  return (
    <section id="workflow" className="py-24 bg-[var(--color-bg-card)]/40">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">How It Works</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">Seven Steps to a Tableau Dashboard</motion.h2>
          <motion.p variants={fadeUp} className="text-[var(--color-text-secondary)]">Fully automated. Minimal effort.</motion.p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-accent)] to-transparent" />

          <div className="space-y-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative flex items-start gap-6 pl-14"
              >
                {/* Dot */}
                <div className="absolute left-4 top-1 w-5 h-5 rounded-full gradient-primary border-4 border-[var(--color-bg-deep)] z-10" />
                <div>
                  <span className="text-xs font-mono text-[var(--color-accent)] font-semibold">{s.step}</span>
                  <h3 className="text-base font-semibold mt-0.5">{s.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Dashboard Preview ───────────────────────────────────────────────────── */
function DashboardPreview() {
  return (
    <section id="preview" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">Preview</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">See It Before You Export</motion.h2>
          <motion.p variants={fadeUp} className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Preview your generated Tableau dashboard in real-time before downloading the workbook.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl glass glow-primary overflow-hidden"
        >
          {/* Title bar */}
          <div className="h-11 bg-[var(--color-bg-surface)] flex items-center px-4 gap-2 border-b border-[var(--color-border)]">
            <div className="w-3 h-3 rounded-full bg-[var(--color-danger)] opacity-60" />
            <div className="w-3 h-3 rounded-full bg-[var(--color-warning)] opacity-60" />
            <div className="w-3 h-3 rounded-full bg-[var(--color-success)] opacity-60" />
            <span className="ml-4 text-xs text-[var(--color-text-muted)]">Sales Dashboard — TableauGen AI</span>
          </div>

          <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold">Sales Performance Dashboard</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Generated from sales_data_2024.csv</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-md text-xs glass text-[var(--color-text-secondary)]">Filter: All Regions</span>
                <span className="px-3 py-1 rounded-md text-xs glass text-[var(--color-text-secondary)]">2024</span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total Revenue', value: '$2,456,890', change: '+18.2%', up: true },
                { label: 'Net Profit', value: '$892,340', change: '+12.7%', up: true },
                { label: 'Total Orders', value: '12,847', change: '+8.4%', up: true },
                { label: 'Avg Order Value', value: '$191.24', change: '-2.1%', up: false },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-lg bg-white/[0.03] border border-[var(--color-border)] p-3.5">
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-base sm:text-lg font-bold font-[var(--font-mono)] mt-1">{kpi.value}</p>
                  <span className={`text-[11px] font-medium ${kpi.up ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    {kpi.change}
                  </span>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid sm:grid-cols-3 gap-3">
              {/* Bar chart */}
              <div className="sm:col-span-2 rounded-lg bg-white/[0.03] border border-[var(--color-border)] p-4">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-3">Revenue by Region</p>
                <div className="flex items-end gap-2 h-28">
                  {[75, 92, 60, 85, 45, 70, 80].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                      className="flex-1 rounded-t"
                      style={{ background: `linear-gradient(to top, var(--color-primary), var(--color-accent))` }}
                    />
                  ))}
                </div>
              </div>

              {/* Pie */}
              <div className="rounded-lg bg-white/[0.03] border border-[var(--color-border)] p-4 flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-3 self-start">Category Split</p>
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-primary)" strokeWidth="16" strokeDasharray="120 251" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-accent)" strokeWidth="16" strokeDasharray="75 251" strokeDashoffset="-120" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-success)" strokeWidth="16" strokeDasharray="56 251" strokeDashoffset="-195" transform="rotate(-90 50 50)" />
                </svg>
                <div className="flex gap-3 mt-3 text-[10px] text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />Tech</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />Furniture</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />Office</span>
                </div>
              </div>
            </div>

            {/* Trend line area */}
            <div className="mt-3 rounded-lg bg-white/[0.03] border border-[var(--color-border)] p-4">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-3">Monthly Trend</p>
              <svg viewBox="0 0 600 80" className="w-full h-16">
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,60 Q50,55 100,50 T200,35 T300,25 T400,30 T500,15 T600,10" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
                <path d="M0,60 Q50,55 100,50 T200,35 T300,25 T400,30 T500,15 T600,10 V80 H0 Z" fill="url(#trendGrad)" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Testimonials ─────────────────────────────────────────────────────────── */
const testimonials = [
  { name: 'Sarah Chen', role: 'Data Analyst, Deloitte', text: 'TableauGen AI turned a 3-hour dashboard build into a 5-minute task. The generated workbooks are production-ready.' },
  { name: 'Marcus Rivera', role: 'BI Developer', text: 'Finally, a tool that understands Tableau\'s structure. The KPI generation and calculated fields alone save me hours.' },
  { name: 'Emily Tanaka', role: 'Product Manager', text: 'I upload our weekly export and get a polished executive dashboard in minutes. Game changer for our team.' },
]

function Testimonials() {
  return (
    <section className="py-24 bg-[var(--color-bg-card)]/40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">Testimonials</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">Loved by Data Professionals</motion.h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                ))}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ───────────────────────────────────────────────────────────────────── */
const faqs = [
  { q: 'What file formats are supported?', a: 'Currently we support CSV files. The system automatically detects encoding, handles missing headers, and validates data integrity.' },
  { q: 'Do I need Tableau Desktop?', a: 'No. TableauGen AI generates the workbook for you. You can open the exported .twb or .twbx file in Tableau Desktop, Tableau Reader (free), or publish to Tableau Server.' },
  { q: 'How large can my CSV be?', a: 'We support files up to 100MB. Large files are processed in the background so the UI stays responsive.' },
  { q: 'Can I customize the generated dashboard?', a: 'Yes. You can override chart recommendations, choose themes, select templates, and edit KPIs before exporting.' },
  { q: 'Is my data secure?', a: 'Absolutely. All data is processed server-side, encrypted in transit, and deleted after export unless you choose to save it to a project.' },
]

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">FAQ</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</motion.h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-[var(--color-border)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-medium hover:bg-white/[0.02] transition-colors"
              >
                {faq.q}
                <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-5 text-sm text-[var(--color-text-secondary)] leading-relaxed"
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ──────────────────────────────────────────────────────────────── */
const plans = [
  {
    name: 'Free',
    price: '$0',
    desc: 'For individuals exploring the platform.',
    features: ['3 projects', '10MB file limit', 'Basic themes', 'CSV export', 'Community support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    desc: 'For analysts and growing teams.',
    features: ['Unlimited projects', '100MB file limit', 'All themes & templates', '.twb + .twbx export', 'AI Insights & Forecasting', 'Priority support'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For organizations at scale.',
    features: ['Everything in Pro', 'SSO & SAML', 'Custom templates', 'API access', 'Dedicated support', 'SLA & compliance'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[var(--color-bg-card)]/40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">Pricing</motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</motion.h2>
          <motion.p variants={fadeUp} className="text-[var(--color-text-secondary)]">Start free. Upgrade when you need more power.</motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border transition-all ${
                plan.highlight
                  ? 'bg-[var(--color-bg-card)] border-[var(--color-primary)] glow-primary scale-[1.02]'
                  : 'bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              {plan.highlight && (
                <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-[var(--color-primary)] mb-3">Most Popular</span>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-3 mb-1">
                <span className="text-3xl font-bold font-[var(--font-mono)]">{plan.price}</span>
                {plan.period && <span className="text-sm text-[var(--color-text-muted)]">{plan.period}</span>}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-6">{plan.desc}</p>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Check className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  plan.highlight
                    ? 'gradient-primary text-white hover:opacity-90'
                    : 'glass text-white hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA ──────────────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
            Start Building Smarter Tableau Dashboards Today
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8">
            Join thousands of analysts who automate their Tableau workflows with TableauGen AI.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl gradient-primary glow-primary hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Footer ───────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-[var(--font-heading)] text-sm font-bold text-white">
            TableauGen <span className="text-[var(--color-accent)]">AI</span>
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} TableauGen AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

/* ─── Landing Page ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)]">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Workflow />
      <DashboardPreview />
      <Testimonials />
      <FAQ />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
