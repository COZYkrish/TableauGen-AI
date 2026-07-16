import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './layouts/DashboardLayout'
import ProjectsPage from './pages/dashboard/ProjectsPage'
import UploadPage from './pages/dashboard/UploadPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import DashboardPage from './pages/dashboard/DashboardPage'

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Dashboard Routes */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<ProjectsPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="profile/:projectId" element={<ProfilePage />} />
        <Route path="dashboard/:projectId" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
