import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import DoctorCard from '../components/DoctorCard'
import { assets } from '../assets/assets_admin/assets'
import { Loader2 } from 'lucide-react'

  const Dashboard = () => {
    const [counts, setCounts] = useState({ totalAppointments: 0, todaysAppointments: 0 })
    const [loading, setLoading] = useState(true)
    const { backendUrl, token, userType } = useContext(AppContext)
    const navigate = useNavigate()

  useEffect(() => {
    const fetchCounts = async () => {
      if (!token || userType !== 'doctor') {
        return
      }
      try {
        setLoading(true)
        const response = await axios.get(`${backendUrl}/api/doctor/dashboard-counts`)

        if (response.data.success) {
          setCounts(response.data.counts)
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.error('Error fetching dashboard counts:', error)
        if (error.response?.status === 401) {
          toast.error('Session expired, please log in again.')
          localStorage.removeItem('token')
          localStorage.removeItem('userType')
          setToken(false)
          setUserType(null)
          navigate('/login')
        } else {
          toast.error('Failed to fetch dashboard data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [backendUrl, token, userType, navigate])

  const cardData = [
    {
      label: "Total Appointments",
      count: counts.totalAppointments,
      icon: assets.appointments_icon,
      iconBg: "bg-purple-200"
    },
    {
      label: "Today's Appointments",
      count: counts.todaysAppointments,
      icon: assets.appointments_icon,
      iconBg: "bg-red-200"
    }
  ]

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="px-10 py-6 grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-4 w-full">
      {cardData.map(({ label, count, icon, iconBg }, index) => (
        <DoctorCard key={index} icon={icon} count={count} label={label} iconBg={iconBg} />
      ))}
    </div>
  )
}

export default Dashboard
