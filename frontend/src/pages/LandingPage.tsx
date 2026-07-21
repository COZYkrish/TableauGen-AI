import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Upload, BarChart3, Brain, Gauge, LayoutDashboard,
  FileDown, Sparkles, ArrowRight, Menu, X
} from 'lucide-react'

/* ─── Animation Variants ─────────────────────────────────────────────── */
const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ─── SCENE 1: Navigation + Hero (Video Background) ─────────────────── */
function Scene1Hero() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-black">
      <video autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'center center', willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.15) 100%)', zIndex: 1 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)', zIndex: 1 }} />

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 md:px-12 lg:px-16 transition-all duration-500"
        style={{ zIndex: 30, background: scrolled ? 'rgba(0,0,0,0.55)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none' }}
      >
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white sm:text-xl" style={{ fontFamily: 'var(--font-sans)' }}>
            TABLEAU<span style={{ color: 'rgba(255,255,255,0.45)' }}>GEN</span><span className="text-white/70"> AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[{ label: 'Features', href: '#features' }, { label: 'How It Works', href: '#how-it-works' }, { label: 'Testimonials', href: '#testimonials' }].map(({ label, href }) => (
              <a key={label} href={href} className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: 'var(--font-sans)' }}>{label}</a>
            ))}
          </div>
        </div>
        <Link to="/signup" className="hidden md:inline-flex rounded-lg bg-white px-5 py-2 text-sm font-medium text-black hover:scale-105 transition-transform" style={{ fontFamily: 'var(--font-sans)' }}>Get Started</Link>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden relative w-10 h-10 flex items-center justify-center active:scale-90 transition-transform" style={{ zIndex: 50 }} aria-label="Toggle navigation menu">
          <Menu size={22} className="absolute text-white transition-all duration-300" style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'rotate(90deg) scale(0.8)' : 'rotate(0deg) scale(1)' }} />
          <X size={22} className="absolute text-white transition-all duration-300" style={{ opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.8)' }} />
        </button>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <div className="absolute inset-x-0 top-0 overflow-hidden bg-black/98 backdrop-blur-xl md:hidden"
        style={{ zIndex: 20, height: menuOpen ? '100dvh' : 0, opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none', transition: 'height 500ms cubic-bezier(0.16,1,0.3,1), opacity 500ms cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="flex h-full flex-col justify-center px-8"
          style={{ opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 400ms ease 100ms, transform 400ms ease 100ms' }}
        >
          <div className="space-y-7 mb-10">
            {[{ label: 'Features', href: '#features' }, { label: 'How It Works', href: '#how-it-works' }, { label: 'Testimonials', href: '#testimonials' }].map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)} className="block text-3xl font-medium text-white/90 hover:text-white transition-colors" style={{ fontFamily: 'var(--font-sans)' }}>{label}</a>
            ))}
          </div>
          <Link to="/signup" onClick={() => setMenuOpen(false)} className="mt-2 inline-flex w-fit rounded-full bg-white px-8 py-3.5 text-base font-medium text-black hover:scale-105 transition-transform" style={{ fontFamily: 'var(--font-sans)' }}>Get Started</Link>
        </div>
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col justify-between px-6 pb-10 pt-24 sm:pb-12 sm:pt-28 md:px-12 md:pb-16 md:pt-32 lg:px-16" style={{ zIndex: 10 }}>
        <div style={{ maxWidth: '820px' }}>
          <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-white/75" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.25em', textTransform: 'uppercase', animation: 'fadeSlideUp 0.8s ease 0.2s both' }}>
            AI-Powered Dashboard Intelligence
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(40px, 7.5vw, 108px)', lineHeight: 1.04, letterSpacing: '-0.02em', fontWeight: 400, color: '#ffffff', animation: 'fadeSlideUp 0.8s ease 0.4s both' }}>
            Instant Tableau<br /><em>Dashboards,</em><br />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72em' }}>from any CSV.</span>
          </h1>
        </div>
        <div>
          <p className="mb-5 sm:mb-6 max-w-sm sm:max-w-lg leading-relaxed text-white/55 text-sm sm:text-base md:text-lg" style={{ fontFamily: 'var(--font-sans)', animation: 'fadeSlideUp 0.8s ease 0.7s both' }}>
            Upload any CSV. TableauGen AI analyzes your data, selects the best visualizations, builds KPIs, and exports a polished Tableau workbook in under a minute.
          </p>
          <div style={{ animation: 'fadeSlideUp 0.8s ease 0.9s both' }}>
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-medium text-black hover:scale-105 transition-transform" style={{ fontFamily: 'var(--font-sans)' }}>
              Start Generating <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── SCENE 2: Feature Bento Grid ────────────────────────────────────── */
const bentoFeatures = [
  { index: '01', label: 'AI ENGINE', title: 'Intelligent Data Analysis', desc: 'Profiles every column, detects types, semantics & relationships automatically.', icon: Brain },
  { index: '02', label: 'VISUALIZATION', title: 'Smart Chart Selection', desc: 'Recommends best charts with confidence scores you can override.', icon: BarChart3 },
  { index: '03', label: 'KPI ENGINE', title: 'Auto KPI Generator', desc: 'Revenue, margins, growth — computed from your data automatically.', icon: Gauge },
  { index: '04', label: 'UPLOAD', title: 'Any CSV, Any Size', desc: 'Drag & drop up to 100MB. Auto encoding detection. Zero friction.', icon: Upload },
  { index: '05', label: 'LAYOUT', title: 'Dashboard Blueprint', desc: 'Intelligent layout planning engine builds the full dashboard structure.', icon: LayoutDashboard },
  { index: '06', label: 'EXPORT', title: 'Production Export', desc: 'Download .twb and .twbx workbooks ready for Tableau Desktop or Server.', icon: FileDown },
]

function Scene2Features() {
  return (
    <section id="features" style={{ background: '#080808', padding: '8rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: '92vw', margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="mb-16">
          <motion.p variants={slideUp} className="text-[10px] uppercase tracking-[0.5em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>Capabilities</motion.p>
          <motion.h2 variants={slideUp} className="silver-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(36px, 6vw, 90px)', lineHeight: 0.9, fontWeight: 400, maxWidth: '700px' }}>
            Everything automated.<br /><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7em' }}>Nothing manual.</span>
          </motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
          {bentoFeatures.map((feature, i) => (
            <motion.div key={feature.index} variants={slideUp} custom={i}
              className={`bento-card group p-8 flex flex-col justify-between min-h-[220px] cursor-default ${i === 0 ? 'md:col-span-2' : ''}`}
              style={{ borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>{feature.index} / {feature.label}</p>
                <h3 className="silver-gradient-text mb-3" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(26px, 3vw, 42px)', lineHeight: 0.95, fontWeight: 400 }}>{feature.title}</h3>
                <p style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.8 }}>{feature.desc}</p>
              </div>
              <feature.icon className="w-8 h-8 mt-6 transition-opacity duration-300 group-hover:opacity-60" style={{ color: 'rgba(255,255,255,0.12)' }} />
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
    <section id="how-it-works" style={{ background: '#0a0a0a', padding: '8rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: '92vw', margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
            <motion.p variants={slideUp} className="text-[10px] uppercase tracking-[0.5em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>How It Works</motion.p>
            <motion.h2 variants={slideUp} className="silver-gradient-text mb-12" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(32px, 5vw, 72px)', lineHeight: 0.9, fontWeight: 400 }}>
              From raw data<br />to Tableau in<br /><em>60 seconds.</em>
            </motion.h2>
            <div className="space-y-8">
              {workflowSteps.map((step, i) => (
                <motion.div key={step.num} variants={slideUp} custom={i + 2} className="flex gap-6">
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '2rem' }}>
                    <span className="text-[9px] uppercase tracking-[0.5em] block mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>Step {step.num}</span>
                    <h3 className="text-white mb-1" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '22px', fontWeight: 400, lineHeight: 1.1 }}>{step.title}</h3>
                    <p className="text-[11px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', lineHeight: 1.8 }}>{step.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="bento-card rounded-2xl p-8 relative overflow-hidden" style={{ minHeight: '420px' }}>
              <Sparkles className="absolute bottom-6 right-6 opacity-[0.04]" style={{ width: '120px', height: '120px' }} />
              <p className="text-[10px] uppercase tracking-[0.4em] mb-8" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>Registry / Recent Users</p>
              <div className="grid grid-cols-2 gap-4 mb-10">
                {recentUsers.map((user, i) => (
                  <motion.div key={user.initials} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3 group cursor-default"
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                    style={{ transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)' }}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', filter: 'grayscale(100%) contrast(1.25)' }}>
                      <span className="text-[10px] font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{user.initials}</span>
                    </div>
                    <p className="text-[9px] uppercase tracking-wider leading-tight transition-colors duration-300 group-hover:text-white" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{user.title}</p>
                  </motion.div>
                ))}
              </div>
              <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[{ val: '< 60s', label: 'Avg Gen Time' }, { val: '100MB', label: 'Max File Size' }, { val: '100%', label: 'Auto-Exported' }].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-white text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-mono)' }}>{stat.val}</p>
                      <p className="text-[8px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>{stat.label}</p>
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
  { quote: 'TableauGen AI turned a 3-hour dashboard build into a 5-minute task. The generated workbooks are production-ready.', name: 'Sarah Chen', title: 'Data Analyst · Deloitte', initials: 'SC' },
  { quote: "Finally a tool that understands Tableau's structure. The KPI generation and calculated fields alone save me hours every week.", name: 'Marcus Rivera', title: 'BI Developer · Independent', initials: 'MR' },
]

function Scene4Testimonials() {
  return (
    <section id="testimonials" style={{ background: 'rgba(255,255,255,0.01)', padding: '8rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: '92vw', margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center mb-20">
          <motion.p variants={slideUp} className="text-[10px] uppercase tracking-[0.5em] mb-6" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>Testimonials</motion.p>
          <motion.h2 variants={slideUp} className="silver-gradient-text" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(40px, 8vw, 110px)', lineHeight: 0.88, fontWeight: 400 }}>
            Loved by data<br /><em>professionals.</em>
          </motion.h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '3rem' }}>
              <p className="silver-gradient-text mb-8" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 38px)', lineHeight: 1.15, fontWeight: 400 }}>"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', filter: 'grayscale(100%) contrast(1.25)' }}>
                  <span className="text-[11px] font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{t.initials}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>{t.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── SCENE 5: Final CTA — Fullscreen Video + Liquid Glass ───────────── */
const CTA_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4'

function CountdownTimer() {
  const [time, setTime] = useState({ h: 47, m: 59, s: 59 })

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        const { h, m, s } = prev
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
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[9px] uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)' }}>
        Beta closes in
      </span>
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <span key={i} className="flex items-baseline gap-1">
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>
            {val}
          </span>
          {i < 2 && <span style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>:</span>}
        </span>
      ))}
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
    <>
      {/* Fullscreen CTA with video */}
      <section id="cta" className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
        <video autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center center', willChange: 'transform', transform: 'translateZ(0)' }}
        >
          <source src={CTA_VIDEO} type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.1) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

        {/* Bottom-left hero content */}
        <div className="absolute bottom-0 left-0 z-10 px-6 sm:px-12 pb-10 sm:pb-16" style={{ maxWidth: '680px' }}>
          <CountdownTimer />

          <h2 className="text-white mb-4 tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(36px, 6vw, 80px)', lineHeight: 1.05, fontWeight: 400 }}
          >
            Start Building<br /><em>Smarter Dashboards.</em>
          </h2>

          <p className="mb-7 leading-relaxed"
            style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '420px' }}
          >
            Upload any CSV. TableauGen AI analyzes your data, selects the best
            visualizations, and exports a production-ready Tableau workbook in
            under a minute.
          </p>

          {submitted ? (
            <div className="liquid-glass rounded-full px-7 py-3.5 inline-flex items-center gap-2">
              <span className="text-white text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
                ✓ You're on the list — we'll be in touch soon.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
              <div className="liquid-glass rounded-full flex items-center overflow-hidden">
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="bg-transparent text-white placeholder:text-white/30 outline-none px-5 py-3 text-sm w-52 sm:w-64"
                  style={{ fontFamily: 'var(--font-sans)' }}
                />
              </div>
              <Link to="/signup"
                className="bg-white text-black text-sm font-medium px-6 py-3 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Start Generating →
              </Link>
              <button type="submit"
                className="liquid-glass text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-white/5 transition-colors whitespace-nowrap"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Request Access
              </button>
            </form>
          )}

          <div className="flex items-center gap-6 mt-6 flex-wrap">
            {['No credit card required', 'Cancel anytime', 'Export .twb + .twbx'].map((label) => (
              <span key={label} className="text-[10px] uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 px-6" style={{ width: '92vw', margin: '0 auto' }}>
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-white" style={{ fontFamily: 'var(--font-mono)' }}>
            TABLEAU<span style={{ color: 'rgba(255,255,255,0.3)' }}>GEN</span>_AI
          </span>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map((label) => (
              <a key={label} href="#" className="text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 hover:text-white" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>{label}</a>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} TableauGen AI
          </p>
        </div>
      </footer>
    </>
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
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: visible ? 0 : 80, opacity: visible ? 1 : 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="mobile-nav-blur flex items-center gap-1 px-4 py-3 rounded-full">
        {[{ label: 'Home', href: '#hero' }, { label: 'Features', href: '#features' }].map((item) => (
          <a key={item.label} href={item.href} className="px-3 py-2 text-[8px] uppercase tracking-widest transition-colors hover:text-white" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>{item.label}</a>
        ))}
        <Link to="/signup" className="px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest silver-btn mx-1" style={{ fontFamily: 'var(--font-mono)' }}>Join</Link>
        {[{ label: 'About', href: '#testimonials' }, { label: 'Beta', href: '#cta' }].map((item) => (
          <a key={item.label} href={item.href} className="px-3 py-2 text-[8px] uppercase tracking-widest transition-colors hover:text-white" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>{item.label}</a>
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
      <Scene1Hero />
      <Scene2Features />
      <Scene3ValueProp />
      <Scene4Testimonials />
      <Scene5CTA />
    </div>
  )
}
