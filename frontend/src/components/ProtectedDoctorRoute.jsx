import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const ProtectedDoctorRoute = ({ children }) => {
  const { token, userType } = useContext(AppContext)
  const location = useLocation()

  if (token === null || userType === null) {
    // Loading initial state
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!token || (userType && userType !== 'doctor')) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedDoctorRoute
