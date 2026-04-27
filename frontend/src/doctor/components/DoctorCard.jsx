import React from 'react'

const DoctorCard = ({ icon, count, label, iconBg }) => {
  return (
    <div className="bg-white rounded-lg shadow px-2 py-1 flex items-center space-x-4 w-48 h-24">
      <div className={`${iconBg} p-4 rounded-lg`}>
        <img src={icon} alt={`${label} icon`} className="h-7 w-7" />
      </div>
      <div>
        <p className="text-lg font-semibold">{count}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  )
}

export default DoctorCard
