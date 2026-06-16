import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (roles?.length && !roles.includes(user?.role)) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">You don&apos;t have access to this page.</p>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    )
  }
  return children
}
