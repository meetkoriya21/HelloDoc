import React from 'react';

const TopDoctors = ({ doctors }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {doctors.map((doctor) => (
        <div
          key={doctor._id}
          className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 flex flex-col items-center text-center p-4"
        >
          {(doctor.profilePicture || doctor.profilePicture) && (doctor.profilePicture || doctor.profilePicture).trim() !== '' ? (
            <img
              src={doctor.profilePicture || doctor.profilePicture}
              alt={doctor.name || "Doctor"}
              className="w-full h-48 object-cover rounded-t-xl mb-4"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-t-xl mb-4 flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
          <p className="text-lg font-semibold">{doctor.name}</p>
          <p className="text-gray-600">{doctor.speciality || "General physician"}</p>
        </div>
      ))}
    </div>
  );
};

export default TopDoctors;
