import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import {
  FaStethoscope,
  FaUserGraduate,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaIdCard,
  FaPhone
} from 'react-icons/fa'

const PendingDoctors = () => {
  const { aToken, backendUrl } = useContext(AdminContext)
  const [doctors, setDoctors] = useState([])
  const [expandedDoctorId, setExpandedDoctorId] = useState(null)

  const toggleExpand = (docId) => {
    setExpandedDoctorId(expandedDoctorId === docId ? null : docId)
  }

  const getPendingDoctors = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/pending-doctors', {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      })
      if (data.success) {
        setDoctors(data.doctors)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const approveDoctor = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/approve-doctor/' + docId,
        {},
        {
          headers: {
            Authorization: `Bearer ${aToken}`
          }
        }
      )
      if (data.success) {
        toast.success(data.message)
        getPendingDoctors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const rejectDoctor = async (docId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/reject-doctor/' + docId,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${aToken}`
          }
        }
      )
      if (data.success) {
        toast.success(data.message)
        getPendingDoctors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (aToken) {
      getPendingDoctors()
    }
  }, [aToken])

  return (
    <div className="m-5 max-h-[90vh] overflow-y-auto w-full max-w-full">
      <p className="mb-3 text-lg font-medium">Pending Doctor Requests</p>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2"></th>
            <th className="border border-gray-300 p-2 text-left">Name</th>
            <th className="border border-gray-300 p-2 text-left">Email</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((item) => (
            <React.Fragment key={item._id}>
              <tr>
                <td
                  className="border border-gray-300 p-2 cursor-pointer text-center select-none"
                  onClick={() => toggleExpand(item._id)}
                >
                  {expandedDoctorId === item._id ? '▼' : '▶'}
                </td>
                <td className="border border-gray-300 p-2">{item.name}</td>
                <td className="border border-gray-300 p-2">{item.email}</td>
                <td className="border border-gray-300 p-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      approveDoctor(item._id)
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      rejectDoctor(item._id)
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                </td>
              </tr>

              {expandedDoctorId === item._id && (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-gray-300 p-6 bg-white max-w-full rounded-lg shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Profile Photo */}
                      <div className="flex justify-center lg:justify-start min-w-[180px]">
                        {item.profilePicture && (
                          <img
                            src={item.profilePicture}
                            alt="Profile"
                            className="w-[180px] h-[180px] rounded-lg object-fill"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>

                      {/* Doctor Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 flex-grow">
                        {/* Second Column: Mobile, Address, Experience, Education */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <FaPhone className="text-teal-600" />
                            <span>
                              <strong>Mobile Number:</strong>{' '}
                              <span className="font-normal">{item.mobile || 'N/A'}</span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt className="text-red-600" />
                            <span>
                              <strong>Address:</strong>{' '}
                              <span className="font-normal">
                                {item.address?.line1 || 'N/A'}, {item.address?.line2 || ''}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <FaClock className="text-gray-600" />
                            <span>
                              <strong>Experience:</strong>{' '}
                              <span className="font-normal">{item.experience || 'N/A'}</span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <FaUserGraduate className="text-purple-600" />
                            <span>
                              <strong>Education:</strong>{' '}
                              <span className="font-normal">{item.education || 'N/A'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Third Column: Speciality, Fees, License No, About Doctor */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <FaStethoscope className="text-blue-600" />
                            <span>
                              <strong>Speciality:</strong>{' '}
                              <span className="font-normal">{item.speciality || 'N/A'}</span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <FaMoneyBillWave className="text-green-600" />
                            <span>
                              <strong>Fees:</strong>{' '}
                              <span className="font-normal">₹{item.fees || '0'}</span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <FaIdCard className="text-indigo-600" />
                            <span>
                              <strong>License Number:</strong>{' '}
                              <span className="font-normal">{item.licenseNumber || 'N/A'}</span>
                            </span>
                          </div>

                          <div className="flex items-start space-x-2">
                            <FaUserGraduate className="text-orange-600 mt-1" />
                            <span>
                              <strong>About Doctor:</strong>{' '}
                              <span className="font-normal">{item.about || item.aboutDoctor || 'N/A'}</span>
                            </span>
                          </div>
                        </div>

                        {/* View Documents - spans full width */}
                        <div className="flex flex-wrap justify-start space-x-4 col-span-1 sm:col-span-3 mt-6">
                          {item.licenseDocument && (
                            <a
                              href={encodeURI(item.licenseDocument)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View License Document
                            </a>
                          )}
                          {item.aadharCard && (
                            <a
                              href={encodeURI(item.aadharCard)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Aadhar Card
                            </a>
                          )}
                          {item.medicalDegreeCertificate && (
                            <a
                              href={encodeURI(item.medicalDegreeCertificate)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Medical Degree Certificate
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PendingDoctors
