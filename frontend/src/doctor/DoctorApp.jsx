import React from 'react'
import { Outlet } from 'react-router-dom'
import DoctorNavbar from './components/DoctorNavbar'
import DoctorSidebar from './components/DoctorSidebar'

const DoctorApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <DoctorNavbar />
      <div className="flex w-full">
        <DoctorSidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DoctorApp
