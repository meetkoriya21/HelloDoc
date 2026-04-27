import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets_admin/assets'

const DoctorSidebar = () => {
  return (
    <div className="min-h-screen bg-white border-r">
      <ul className="text-[#515151] mt-5 pl-0">
        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 ms:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'dashboard'}>
          <img src={assets.home_icon} alt="" />
          <p>Dashboard</p>
        </NavLink >

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 ms:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'appointments'}>
          <img src={assets.appointment_icon} alt="" />
          <p>Appointments</p>
        </NavLink>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 ms:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor/my-profile'}>
          <img src={assets.people_icon} alt="" />
          <p>My Profile</p>
        </NavLink>
      </ul>
    </div>
  )
}

export default DoctorSidebar
