import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { assets } from '../../assets/assets_admin/assets'
import { AdminContext } from '../../context/AdminContext'

const Dashboard = () => {
  const { backendUrl } = useContext(AdminContext)
  const [counts, setCounts] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todaysAppointments: 0,
  })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No token found in localStorage')
          return
        }
        const [countsRes, todaysRes] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/dashboard-counts`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get(`${backendUrl}/api/admin/todays-appointments`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ])

        if (countsRes.data.success && todaysRes.data.success) {
          setCounts({
            totalDoctors: countsRes.data.counts.totalDoctors,
            totalPatients: countsRes.data.counts.totalPatients,
            totalAppointments: countsRes.data.counts.totalAppointments,
            todaysAppointments: todaysRes.data.count
          })
        } else {
          console.error('API error:', countsRes.data.message || todaysRes.data.message)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard counts or todays appointments:', error)
      }
    }
    fetchCounts()
  }, [backendUrl])

  const cardData = [
    {
      label: "Doctors",
      count: counts.totalDoctors,
      icon: assets.doctor_icon,
      iconBg: "bg-blue-200"
    },
    {
      label: "Appointments",
      count: counts.totalAppointments,
      icon: assets.appointments_icon,
      iconBg: "bg-purple-200"
    },
    {
      label: "Patients",
      count: counts.totalPatients,
      icon: assets.patients_icon,
      iconBg: "bg-green-200"
    },
    {
      label: "Today's Appointments",
      count: counts.todaysAppointments,
      icon: assets.appointments_icon,
      iconBg: "bg-red-200"
    }
  ]

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cardData.map(({ label, count, icon, iconBg }, index) => (
        <div key={index} className="bg-white rounded-lg shadow px-2 py-1 flex items-center space-x-4 w-48 h-24">
          <div className={`${iconBg} p-4 rounded-lg`}>
            <img src={icon} alt={`${label} icon`} className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-semibold">{count}</p>
            <p className="text-gray-500 text-sm">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Dashboard
