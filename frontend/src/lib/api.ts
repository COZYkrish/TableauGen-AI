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
}

// ── Projects ────────────────────────────────────────────────────────────────

export interface ProjectResponse {
  id: number; user_id: number; name: string; description: string | null
  status: string; file_name: string | null; row_count: number | null
  column_count: number | null; created_at: string; updated_at: string
}

export const projects = {
  list: () => request<{ projects: ProjectResponse[]; total: number }>('/projects/'),
  get: (id: number) => request<ProjectResponse>(`/projects/${id}`),
  delete: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
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
