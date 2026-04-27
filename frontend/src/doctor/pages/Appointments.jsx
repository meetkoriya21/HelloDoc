import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import { Loader2 } from 'lucide-react'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const { backendUrl, token } = useContext(AppContext)
  const navigate = useNavigate()

  const calculateAge = (dob) => {
    if (!dob) return null
    const birthYear = new Date(dob).getFullYear()
    const currentYear = new Date().getFullYear()
    return currentYear - birthYear
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${backendUrl}/api/doctor/appointments`)

        if (response.data.success) {
          setAppointments(response.data.appointments)
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.error('Error fetching appointments:', error)
        if (error.response?.status === 401) {
          toast.error('Session expired, please log in again.')
          localStorage.removeItem('token')
          localStorage.removeItem('userType')
          setToken(false)
          setUserType(null)
          navigate('/login')
        } else {
          toast.error('Failed to fetch appointments')
        }
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchAppointments()
    }
  }, [backendUrl, token, navigate])

  const getPaymentStatusColor = (payment) => {
    return payment ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
  }

  const exportToCSV = () => {
    const headers = ['Patient Name', 'Date', 'Time', 'Address', 'Mobile No', 'Gender', 'Age', 'Payment Status']
    const csvContent = [
      headers.join(','),
      ...filteredAppointments.map(appt => [
        `"${appt.userData?.name || 'Unknown'}"`,
        `"${appt.slotDate}"`,
        `"${appt.slotTime}"`,
        `"${appt.userData?.address?.line1 || 'No address'}"`,
        `"${appt.userData?.phone || 'No mobile'}"`,
        `"${appt.userData?.gender || 'Not specified'}"`,
        `"${appt.userData?.dob ? calculateAge(appt.userData.dob) : 'Not specified'}"`,
        `"${appt.payment ? 'Paid' : 'Pending'}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'appointments.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formattedSelectedDate = selectedDate ? selectedDate.split('-').reverse().join('_') : ''
  const filteredAppointments = formattedSelectedDate ? appointments.filter(appt => appt.slotDate === formattedSelectedDate).sort((a, b) => a.slotTime.localeCompare(b.slotTime)) : appointments.sort((a, b) => a.slotTime.localeCompare(b.slotTime))

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Appointments</h2>
        <p className="text-gray-500">No appointments found.</p>
      </div>
    )
  }

  return (
    <div className="px-10 py-6 w-full">
      <h2 className="text-2xl font-semibold mb-4">Appointments</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Filter by Date</label>
        <div className="flex gap-2">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          <button onClick={exportToCSV} className="mt-1 bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">Export to CSV</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Patient Name</th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Date</th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Time</th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Address</th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Mobile No</th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Gender</th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Age</th>
              <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appt) => (
              <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 border-b">{appt.userData?.name || 'Unknown'}</td>
                <td className="py-3 px-4 border-b">{appt.slotDate}</td>
                <td className="py-3 px-4 border-b">{appt.slotTime}</td>
                <td className="py-3 px-4 border-b">{appt.userData?.address?.line1 || 'No address'}</td>
                <td className="py-3 px-4 border-b">{appt.userData?.phone || 'No mobile'}</td>
                <td className="py-3 px-4 border-b">{appt.userData?.gender || 'Not specified'}</td>
                <td className="py-3 px-4 border-b">{appt.userData?.dob ? calculateAge(appt.userData.dob) : 'Not specified'}</td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(appt.payment)}`}>
                    {appt.payment ? 'Paid' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Appointments
