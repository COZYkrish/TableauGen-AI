import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: integrate with /api/auth/signup
    setTimeout(() => setLoading(false), 1200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-deep)] px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--color-primary)] rounded-full blur-[200px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-[var(--color-accent)] rounded-full blur-[200px] opacity-8 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-[var(--font-heading)] text-xl font-bold text-white">
            TableauGen <span className="text-[var(--color-accent)]">AI</span>
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl glass p-8">
          <h1 className="text-2xl font-bold text-center mb-1">Create your account</h1>
          <p className="text-sm text-[var(--color-text-muted)] text-center mb-8">Start generating dashboards in minutes</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      password.length >= i * 3
                        ? password.length >= 12
                          ? 'var(--color-success)'
                          : password.length >= 8
                          ? 'var(--color-warning)'
                          : 'var(--color-danger)'
                        : 'var(--color-border)',
                  }}
                />
              ))}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" required className="w-3.5 h-3.5 rounded accent-[var(--color-primary)] mt-0.5" />
              <label htmlFor="terms" className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                I agree to the <a href="#" className="text-[var(--color-primary)] hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white glass hover:bg-white/5 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-muted)] text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
