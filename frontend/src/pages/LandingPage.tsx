import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Upload, BarChart3, Brain, Gauge, LayoutDashboard,
  FileDown, Sparkles, ArrowRight, Menu, X, ChevronDown
} from 'lucide-react'

/* ─── Animation Variants ─────────────────────────────────────────────── */
const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ─── SCENE 1: Navigation + Hero ─────────────────────────────────────── */
function Scene1Hero() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col noise-bg"
      style={{ background: '#080808' }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-strong' : ''
        }`}
      >
        <div
          className="flex items-center justify-between px-6 md:px-12 h-16"
          style={{ maxWidth: '92vw', margin: '0 auto', width: '92vw' }}
        >
          {/* Brand */}
          <Link
            to="/"
            className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-white"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            TABLEAU<span style={{ color: 'rgba(255,255,255,0.4)' }}>GEN</span>_AI
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {['Features', 'How It Works', 'Testimonials'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 rounded-lg text-xs font-mono tracking-widest uppercase transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.2em',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                }}
              >
                {label}
              </a>
            ))}
            <Link
              to="/signup"
              className="ml-4 px-5 py-2 rounded-lg text-xs font-bold tracking-widest uppercase silver-btn"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Join Beta
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden glass-strong border-t border-white/5 px-6 py-5 space-y-3"
          >
            {['Features', 'How It Works', 'Testimonials'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                className="block text-xs font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <Link
              to="/signup"
              className="block text-center px-5 py-2.5 text-xs font-bold font-mono uppercase tracking-widest silver-btn rounded-lg"
            >
              Join Beta
            </Link>
          </motion.div>
        )}
      </motion.nav>

      {/* ── Hero Content ───────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative z-10 pt-24 pb-16 px-6"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center"
          style={{ width: '92vw', maxWidth: '900px', margin: '0 auto' }}
        >
          {/* Overline */}
          <motion.p
            variants={slideUp}
            custom={0}
            className="text-xs tracking-[0.5em] uppercase mb-8"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
          >
            AI-Powered Data Intelligence
          </motion.p>

          {/* Main headline — frosted glass container */}
          <motion.div
            variants={slideUp}
            custom={1}
            className="relative mb-10"
            style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'clamp(1.5rem, 4vw, 4rem)',
              padding: 'clamp(2rem, 5vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <h1
              className="silver-gradient-text"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(42px, 9vw, 130px)',
                lineHeight: 0.88,
                letterSpacing: '-0.03em',
                fontWeight: 400,
              }}
            >
              Instant Tableau
              <br />
              <em style={{ fontStyle: 'italic' }}>Dashboards</em>
              <br />
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.6em' }}>
                from any CSV.
              </span>
            </h1>
          </motion.div>

          {/* Metadata Bar */}
          <motion.div
            variants={slideUp}
            custom={2}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-12"
          >
            {[
              { label: 'Input', value: 'CSV / Excel' },
              { label: 'Output', value: '.twb / .twbx' },
              { label: 'Speed', value: '< 60 sec' },
              { label: 'Charts', value: 'Auto-Selected' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1"
                style={{
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  paddingLeft: '1.5rem',
                }}
              >
                <span
                  className="text-[10px] uppercase tracking-[0.4em]"
                  style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={slideUp} custom={3} className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold silver-btn"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }}
            >
              START GENERATING <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-mono uppercase tracking-widest glass"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em' }}
            >
              SEE HOW <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span
            className="text-[9px] uppercase tracking-[0.5em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  )
}

/* ─── SCENE 2: Feature Bento Grid ────────────────────────────────────── */
const bentoFeatures = [
  {
    index: '01',
    label: 'AI ENGINE',
    title: 'Intelligent Data Analysis',
    desc: 'Profiles every column, detects types, semantics & relationships automatically.',
    icon: Brain,
    span: 'md:col-span-2',
  },
  {
    index: '02',
    label: 'VISUALIZATION',
    title: 'Smart Chart Selection',
    desc: 'Recommends best charts with confidence scores you can override.',
    icon: BarChart3,
    span: '',
  },
  {
    index: '03',
    label: 'KPI ENGINE',
    title: 'Auto KPI Generator',
    desc: 'Revenue, margins, growth — computed from your data automatically.',
    icon: Gauge,
    span: '',
  },
  {
    index: '04',
    label: 'UPLOAD',
    title: 'Any CSV, Any Size',
    desc: 'Drag & drop up to 100MB. Auto encoding detection. Zero friction.',
    icon: Upload,
    span: '',
  },
  {
    index: '05',
    label: 'LAYOUT',
    title: 'Dashboard Blueprint',
    desc: 'Intelligent layout planning engine builds the full dashboard structure.',
    icon: LayoutDashboard,
    span: '',
  },
  {
    index: '06',
    label: 'EXPORT',
    title: 'Production Export',
    desc: 'Download .twb and .twbx workbooks ready for Tableau Desktop or Server.',
    icon: FileDown,
    span: '',
  },
]

function Scene2Features() {
  return (
    <section
      id="features"
      style={{ background: '#080808', padding: '8rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div style={{ width: '92vw', margin: '0 auto' }}>
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="mb-16"
        >
          <motion.p
            variants={slideUp}
            className="text-[10px] uppercase tracking-[0.5em] mb-4"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
          >
            Capabilities
          </motion.p>
          <motion.h2
            variants={slideUp}
            className="silver-gradient-text"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(36px, 6vw, 90px)',
              lineHeight: 0.9,
              fontWeight: 400,
              maxWidth: '700px',
            }}
          >
            Everything automated.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7em' }}>
              Nothing manual.
            </span>
          </motion.h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}
        >
          {bentoFeatures.map((feature, i) => (
            <motion.div
              key={feature.index}
              variants={slideUp}
              custom={i}
              className={`bento-card group p-8 flex flex-col justify-between min-h-[220px] cursor-default ${
                i === 0 ? 'md:col-span-2' : ''
              }`}
              style={{
                borderRight: '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.4em] mb-4"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255,255,255,0.25)',
                  }}
                >
                  {feature.index} / {feature.label}
                </p>
                <h3
                  className="silver-gradient-text mb-3"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: 'clamp(26px, 3vw, 42px)',
                    lineHeight: 0.95,
                    fontWeight: 400,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    lineHeight: 1.8,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
              <feature.icon
                className="w-8 h-8 mt-6 transition-opacity duration-300 group-hover:opacity-60"
                style={{ color: 'rgba(255,255,255,0.12)' }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── SCENE 3: Value Proposition / Member Registry ─────────────────── */
const workflowSteps = [
  { num: '01', title: 'Upload CSV', detail: 'Drag & drop any structured dataset.' },
  { num: '02', title: 'AI Profiles Data', detail: 'Every column analyzed: type, semantics, relationships.' },
  { num: '03', title: 'Dashboard Generated', detail: 'KPIs, charts, layouts — all built automatically.' },
  { num: '04', title: 'Export & Deploy', detail: 'Download production-ready .twb or .twbx workbook.' },
]

const recentUsers = [
  { initials: 'SC', title: 'Data Analyst · Deloitte' },
  { initials: 'MR', title: 'BI Developer · Startup' },
  { initials: 'ET', title: 'Product Manager · SaaS' },
  { initials: 'JK', title: 'Data Scientist · Finance' },
]

function Scene3ValueProp() {
  return (
    <section
      id="how-it-works"
      style={{
        background: '#0a0a0a',
        padding: '8rem 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ width: '92vw', margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Steps */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.p
              variants={slideUp}
              className="text-[10px] uppercase tracking-[0.5em] mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
            >
              How It Works
            </motion.p>
            <motion.h2
              variants={slideUp}
              className="silver-gradient-text mb-12"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(32px, 5vw, 72px)',
                lineHeight: 0.9,
                fontWeight: 400,
              }}
            >
              From raw data
              <br />
              to Tableau in
              <br />
              <em>60 seconds.</em>
            </motion.h2>

            <div className="space-y-8">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={step.num}
                  variants={slideUp}
                  custom={i + 2}
                  className="flex gap-6 group"
                >
                  <div
                    className="flex-shrink-0 w-px self-stretch"
                    style={{ background: 'rgba(255,255,255,0.08)', marginLeft: '20px' }}
                  />
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '2rem' }}>
                    <span
                      className="text-[9px] uppercase tracking-[0.5em] block mb-1"
                      style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
                    >
                      Step {step.num}
                    </span>
                    <h3
                      className="text-white mb-1"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '22px',
                        fontWeight: 400,
                        lineHeight: 1.1,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-[11px] uppercase tracking-wider"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'rgba(255,255,255,0.3)',
                        letterSpacing: '0.08em',
                        lineHeight: 1.8,
                      }}
                    >
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Registry card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="bento-card rounded-2xl p-8 relative overflow-hidden"
              style={{ minHeight: '420px' }}
            >
              {/* Decorative */}
              <Sparkles
                className="absolute bottom-6 right-6 opacity-[0.04]"
                style={{ width: '120px', height: '120px' }}
              />

              <p
                className="text-[10px] uppercase tracking-[0.4em] mb-8"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
              >
                Registry / Recent Users
              </p>

              {/* Users grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                {recentUsers.map((user, i) => (
                  <motion.div
                    key={user.initials}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3 group cursor-default"
                    style={{
                      transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = 'translateX(4px)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = 'translateX(0)')
                    }
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        filter: 'grayscale(100%) contrast(1.25)',
                      }}
                    >
                      <span
                        className="text-[10px] font-bold text-white"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {user.initials}
                      </span>
                    </div>
                    <p
                      className="text-[9px] uppercase tracking-wider leading-tight transition-colors duration-300 group-hover:text-white"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'rgba(255,255,255,0.3)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {user.title}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div
                className="pt-6"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { val: '< 60s', label: 'Avg Gen Time' },
                    { val: '100MB', label: 'Max File Size' },
                    { val: '100%', label: 'Auto-Exported' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p
                        className="text-white text-lg font-bold mb-1"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {stat.val}
                      </p>
                      <p
                        className="text-[8px] uppercase tracking-widest"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: 'rgba(255,255,255,0.25)',
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── SCENE 4: Testimonials ──────────────────────────────────────────── */
const testimonials = [
  {
    quote:
      'TableauGen AI turned a 3-hour dashboard build into a 5-minute task. The generated workbooks are production-ready.',
    name: 'Sarah Chen',
    title: 'Data Analyst · Deloitte',
    initials: 'SC',
  },
  {
    quote:
      'Finally a tool that understands Tableau\'s structure. The KPI generation and calculated fields alone save me hours every week.',
    name: 'Marcus Rivera',
    title: 'BI Developer · Independent',
    initials: 'MR',
  },
]

function Scene4Testimonials() {
  return (
    <section
      id="testimonials"
      style={{
        background: 'rgba(255,255,255,0.01)',
        padding: '8rem 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ width: '92vw', margin: '0 auto' }}>
        {/* Section headline */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.p
            variants={slideUp}
            className="text-[10px] uppercase tracking-[0.5em] mb-6"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
          >
            Testimonials
          </motion.p>
          <motion.h2
            variants={slideUp}
            className="silver-gradient-text"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(40px, 8vw, 110px)',
              lineHeight: 0.88,
              fontWeight: 400,
            }}
          >
            Loved by data
            <br />
            <em>professionals.</em>
          </motion.h2>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group"
              style={{
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                paddingLeft: '3rem',
              }}
            >
              <p
                className="silver-gradient-text mb-8"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(22px, 3vw, 38px)',
                  lineHeight: 1.15,
                  fontWeight: 400,
                }}
              >
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    filter: 'grayscale(100%) contrast(1.25)',
                  }}
                >
                  <span
                    className="text-[11px] font-bold text-white"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p
                    className="text-white text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {t.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── SCENE 5: Final CTA + Beta Form + Footer ────────────────────────── */
function CountdownTimer() {
  const [time, setTime] = useState({ h: 47, m: 59, s: 59 })

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev
        if (s > 0) return { h, m, s: s - 1 }
        if (m > 0) return { h, m: m - 1, s: 59 }
        if (h > 0) return { h: h - 1, m: 59, s: 59 }
        return { h: 47, m: 59, s: 59 }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <p
        className="text-[9px] uppercase tracking-[0.5em] mr-4"
        style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}
      >
        Beta Closes In
      </p>
      {[
        { val: pad(time.h), label: 'HH' },
        { sep: true },
        { val: pad(time.m), label: 'MM' },
        { sep: true },
        { val: pad(time.s), label: 'SS' },
      ].map((item, i) =>
        'sep' in item ? (
          <span
            key={i}
            className="text-3xl"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'rgba(255,255,255,0.1)',
              fontStyle: 'italic',
            }}
          >
            /
          </span>
        ) : (
          <div key={i} className="text-center">
            <p
              className="silver-gradient-text"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(36px, 6vw, 80px)',
                lineHeight: 1,
                fontWeight: 400,
              }}
            >
              {item.val}
            </p>
            <p
              className="text-[8px] uppercase tracking-[0.4em] mt-1"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              {item.label}
            </p>
          </div>
        )
      )}
    </div>
  )
}

function Scene5CTA() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section
      id="cta"
      style={{ background: '#080808', padding: '8rem 0 4rem' }}
    >
      <div style={{ width: '92vw', margin: '0 auto' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="text-center"
        >
          {/* Countdown */}
          <motion.div variants={slideUp} custom={0}>
            <CountdownTimer />
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={slideUp}
            custom={1}
            className="silver-gradient-text mb-6"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(36px, 7vw, 100px)',
              lineHeight: 0.9,
              fontWeight: 400,
            }}
          >
            Start building
            <br />
            <em>smarter dashboards.</em>
          </motion.h2>

          <motion.p
            variants={slideUp}
            custom={2}
            className="mb-12 mx-auto"
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '16px',
              maxWidth: '480px',
              lineHeight: 1.7,
            }}
          >
            Join the beta. Upload your first CSV and get a complete Tableau
            workbook in under a minute.
          </motion.p>

          {/* Capture Form */}
          <motion.div
            variants={slideUp}
            custom={3}
            className="mx-auto mb-16"
            style={{ maxWidth: '600px' }}
          >
            {submitted ? (
              <div
                className="glass rounded-2xl p-8 text-center"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <p
                  className="silver-gradient-text text-2xl mb-2"
                  style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
                >
                  You're on the list.
                </p>
                <p
                  className="text-[11px] uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}
                >
                  We'll be in touch soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="glass rounded-2xl flex flex-col sm:flex-row overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-6 py-5 bg-transparent text-white placeholder:text-white/20 outline-none text-sm"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.05em' }}
                />
                <Link
                  to="/signup"
                  className="silver-btn px-8 py-5 text-xs font-bold tracking-widest uppercase text-center whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Request Access →
                </Link>
              </form>
            )}
          </motion.div>

          {/* Trust marks */}
          <motion.div
            variants={slideUp}
            custom={4}
            className="flex items-center justify-center gap-8 flex-wrap"
          >
            {[
              'No credit card required',
              'Cancel anytime',
              'Export .twb + .twbx',
            ].map((label) => (
              <span
                key={label}
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}
              >
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-24 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span
            className="text-xs font-bold tracking-[0.3em] uppercase text-white"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            TABLEAU<span style={{ color: 'rgba(255,255,255,0.3)' }}>GEN</span>_AI
          </span>

          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map((label) => (
              <a
                key={label}
                href="#"
                className="text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 hover:text-white"
                style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}
              >
                {label}
              </a>
            ))}
          </div>

          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}
          >
            © {new Date().getFullYear()} TableauGen AI
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── Floating Mobile Nav ─────────────────────────────────────────────── */
function FloatingMobileNav() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > window.innerHeight * 0.8)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: visible ? 0 : 80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className="mobile-nav-blur flex items-center gap-1 px-4 py-3 rounded-full"
        style={{ gap: '0.25rem' }}
      >
        {[
          { label: 'Home', href: '#hero' },
          { label: 'Features', href: '#features' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="px-3 py-2 text-[8px] uppercase tracking-widest transition-colors hover:text-white"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}
          >
            {item.label}
          </a>
        ))}
        <Link
          to="/signup"
          className="px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest silver-btn mx-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Join
        </Link>
        {[
          { label: 'About', href: '#testimonials' },
          { label: 'Beta', href: '#cta' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="px-3 py-2 text-[8px] uppercase tracking-widest transition-colors hover:text-white"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Main Landing Page ──────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <FloatingMobileNav />
      {/* Scene 1: Hero */}
      <Scene1Hero />
      {/* Scene 2: Feature Bento Grid */}
      <Scene2Features />
      {/* Scene 3: Value Prop / How It Works + Member Registry */}
      <Scene3ValueProp />
      {/* Scene 4: Testimonials */}
      <Scene4Testimonials />
      {/* Scene 5: Final CTA + Beta Form + Footer */}
      <Scene5CTA />
    </div>
  )
}
