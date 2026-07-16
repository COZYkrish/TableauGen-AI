/**
 * API client for TableauGen AI backend.
 * Centralizes all HTTP calls with JWT token handling.
 */

const API_BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('tg_token')
}

export function setToken(token: string) {
  localStorage.setItem('tg_token', token)
}

export function clearToken() {
  localStorage.removeItem('tg_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return {} as T
  return res.json()
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface LoginPayload { email: string; password: string }
export interface SignupPayload { email: string; full_name: string; password: string }
export interface TokenResponse { access_token: string; token_type: string }
export interface UserResponse {
  id: number; email: string; full_name: string; is_active: boolean
  is_verified: boolean; avatar_url: string | null; created_at: string
}

export const auth = {
  login: (data: LoginPayload) =>
    request<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  signup: (data: SignupPayload) =>
    request<UserResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<UserResponse>('/auth/me'),
  updateProfile: (data: { full_name?: string; avatar_url?: string }) =>
    request<UserResponse>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
}

// ── Projects ────────────────────────────────────────────────────────────────

export interface ProjectResponse {
  id: number; user_id: number; name: string; description: string | null
  status: string; file_name: string | null; row_count: number | null
  column_count: number | null; created_at: string; updated_at: string
}

export interface ExportHistoryItem {
  project_id: number
  project_name: string
  file_name: string | null
  file_size_kb: number | null
  row_count: number | null
  column_count: number | null
  exported_at: string | null
  download_url: string
}

export interface ProjectStats {
  total_projects: number
  by_status: Record<string, number>
  total_rows_analyzed: number
  total_columns_analyzed: number
  exported_count: number
}

export const projects = {
  list: () => request<{ projects: ProjectResponse[]; total: number }>('/projects/'),
  get: (id: number) => request<ProjectResponse>(`/projects/${id}`),
  rename: (id: number, name: string, description?: string) =>
    request<ProjectResponse>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify({ name, description }) }),
  delete: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  stats: () => request<ProjectStats>('/projects/stats/summary'),
  exportHistory: () => request<{ exports: ExportHistoryItem[]; total: number }>('/projects/exports/history'),
}

// ── Uploads ─────────────────────────────────────────────────────────────────

export interface UploadResponse {
  project_id: number; file_name: string; row_count: number
  column_count: number; message: string
}

export interface ProfileResponse {
  project_id: number
  overview: Record<string, any>
  columns: Record<string, any>
  summary: Record<string, any>
}

export const uploads = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<UploadResponse>('/uploads/', { method: 'POST', body: formData })
  },
  profile: (projectId: number) =>
    request<ProfileResponse>(`/uploads/${projectId}/profile`),
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface KPICard {
  id: string
  title: string
  field: string
  aggregation: string
  formula: string
  display_format: string
  icon: string
  semantic_type: string
  priority: number
}

export interface ChartRecommendation {
  chart_type: string
  chart_subtype?: string
  title: string
  score: number
  rationale: string
  fields: Record<string, any>
  tableau_config: Record<string, any>
}

export interface LayoutCell {
  row: number
  col: number
  row_span: number
  col_span: number
  content_type: string
  content_id: string
  title: string
  chart_type?: string
}

export interface FilterSuggestion {
  field: string
  filter_type: string
  label: string
  hierarchy?: string[]
  values_count?: number
}

export interface ThemeSummary {
  id: string
  name: string
  description: string
}

export interface BlueprintResponse {
  project_id: number
  template: string
  theme_name: string
  theme: Record<string, any>
  kpis: KPICard[]
  recommendations: ChartRecommendation[]
  layout: LayoutCell[]
  filters: FilterSuggestion[]
  available_themes: ThemeSummary[]
  metadata_summary: Record<string, any>
}

export interface ExportResponse {
  project_id: number
  download_url: string
  file_name: string
  validation_warnings: string[]
}

export const dashboard = {
  generate: (projectId: number, theme?: string) =>
    request<BlueprintResponse>(`/dashboard/${projectId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ theme: theme ?? null }),
    }),
  get: (projectId: number) =>
    request<BlueprintResponse>(`/dashboard/${projectId}`),
  export: (projectId: number) =>
    request<ExportResponse>(`/dashboard/${projectId}/export`, { method: 'POST' }),
  downloadUrl: (projectId: number) => `/api/dashboard/${projectId}/download`,
}

// ── Intelligence ──────────────────────────────────────────────────────────────

export interface Insight {
  id: string
  type: 'distribution' | 'correlation' | 'trend' | 'concentration' | 'quality'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  fields: string[]
  metric: number | null
}

export interface ForecastPoint {
  period: string
  value: number
  lower_bound?: number
  upper_bound?: number
}

export interface HistoricalPoint { period: string; value: number }

export interface Forecast {
  measure: string
  date_field: string
  method: string
  historical: HistoricalPoint[]
  forecast: ForecastPoint[]
  trend_direction: 'up' | 'down' | 'flat'
  growth_rate_pct: number
  confidence: 'high' | 'medium' | 'low'
}

export interface NarrativeSection { title: string; body: string }

export interface Narrative {
  headline: string
  executive_summary: string
  data_story: NarrativeSection[]
  chart_rationales: Array<{ chart_title: string; chart_type: string; score: number; narrative: string }>
  kpi_narratives: Array<{ kpi_id: string; kpi_title: string; narrative: string }>
  action_items: string[]
}

export interface IntelligenceReport {
  project_id: number
  insights: Insight[]
  forecasts: Forecast[]
  narrative: Narrative
}

export const intelligence = {
  full: (projectId: number, horizon = 6) =>
    request<IntelligenceReport>(`/intelligence/${projectId}/full?horizon=${horizon}`),
  insights: (projectId: number) =>
    request<{ insights: Insight[] }>(`/intelligence/${projectId}/insights`),
  forecast: (projectId: number, horizon = 6) =>
    request<{ forecasts: Forecast[] }>(`/intelligence/${projectId}/forecast?horizon=${horizon}`),
  narrative: (projectId: number) =>
    request<{ project_id: number } & Narrative>(`/intelligence/${projectId}/narrative`),
}
