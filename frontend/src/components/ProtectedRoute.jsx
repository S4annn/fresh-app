import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token')
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user'))
  } catch {
    user = null
  }
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  const role = String(user.role || '').toLowerCase()
  const allowed = allowedRoles
    .map((item) => item.toLowerCase())
    .includes(role)
  if (!allowed) {
    if (role === 'bisnis') {
      return <Navigate to="/dashboard-bisnis" replace />
    }
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}