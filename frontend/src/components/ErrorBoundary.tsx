import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-danger)]/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-[var(--color-danger)]" />
          </div>
          <div className="text-center max-w-md">
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">
              An unexpected error occurred in this section.
            </p>
            {this.state.error && (
              <code className="block text-xs font-mono text-[var(--color-danger)] bg-white/[0.03] p-3 rounded-lg mt-3 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </code>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/app'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm glass hover:bg-white/5 transition-colors"
            >
              <Home className="w-4 h-4" /> Back to Projects
            </button>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
