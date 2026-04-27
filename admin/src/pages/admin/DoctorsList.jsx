import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, updateDoctor, deleteDoctor } = useContext(AdminContext);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(editForm).forEach(key => {
      formData.append(key, editForm[key]);
    });     
    if (editImage) {
      formData.append('image', editImage);
    }
    await updateDoctor(formData);
    setEditingDoctor(null);
    setEditForm({});
    setEditImage(null);
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors.map((item, index) => (
          <div
            className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden  group hover:translate-y-[-10px] transition-all duration-500'
            key={index}
          >
            <img
              className='bg-indigo-50 min-w-52 max-w-52 min-h-52 max-h-52 group-hover:bg-primary transition-all duration-500 cursor-pointer'
              src={item.profilePicture}
              alt=""
              onClick={() => setViewingDoctor(item)}
            />
            <div className="p-4">
              <p className="text-netural-800 text-lg font-medium">{item.name}</p>
              <p className="text-zinc-600 text-sm">{item.speciality}</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
                <p>Available</p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingDoctor(item._id);
                    setEditForm({
                      docId: item._id,
                      name: item.name,
                      email: item.email,
                      speciality: item.speciality,
                      degree: item.education,
                      experience: item.experience,
                      about: item.about,
                      fees: item.fees,
                      address: JSON.stringify(item.address),
                      mobile: item.mobile,
                      gender: item.gender,
                      licenseNumber: item.licenseNumber
                    });
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this doctor?')) {
                      deleteDoctor(item._id);
                    }
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-scroll">
            <h2 className="text-xl font-bold mb-4">Edit Doctor</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="border p-2 rounded"
                  required
                />
                <select
                  value={editForm.speciality || ''}
                  onChange={(e) => setEditForm({...editForm, speciality: e.target.value})}
                  className="border p-2 rounded"
                  required
                >
                  <option value="General physician">General physician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatricians">Pediatricians</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                  <option value="Cardiologist">Cardiologist</option>
                </select>
                <input
                  type="text"
                  placeholder="Degree"
                  value={editForm.degree || ''}
                  onChange={(e) => setEditForm({...editForm, degree: e.target.value})}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Experience"
                  value={editForm.experience || ''}
                  onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Fees"
                  value={editForm.fees || ''}
                  onChange={(e) => setEditForm({...editForm, fees: e.target.value})}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Mobile"
                  value={editForm.mobile || ''}
                  onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="License Number"
                  value={editForm.licenseNumber || ''}
                  onChange={(e) => setEditForm({...editForm, licenseNumber: e.target.value})}
                  className="border p-2 rounded"
                  required
                />
                <select
                  value={editForm.gender || ''}
                  onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                  className="border p-2 rounded"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <textarea
                placeholder="About"
                value={editForm.about || ''}
                onChange={(e) => setEditForm({...editForm, about: e.target.value})}
                className="border p-2 rounded w-full"
                rows={3}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Update Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-scroll">
            <h2 className="text-2xl font-bold mb-6">Document Viewer</h2>
            <div className="flex justify-center">
              <img
                src={viewingDocument}
                alt="Document"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingDocument(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl max-h-[92vh] overflow-y-scroll">
            <h2 className="text-2xl font-bold mb-6">Doctor Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div>
                <img
                  src={viewingDoctor.profilePicture}
                  alt={viewingDoctor.name}
                  className="w-64 h-64 object-fill rounded-lg mb-4"
                />
                <div className="space-y-2">
                  <p><strong>Name:</strong> {viewingDoctor.name}</p>
                  <p><strong>Email:</strong> {viewingDoctor.email}</p>
                  <p><strong>Speciality:</strong> {viewingDoctor.speciality}</p>
                  <p><strong>Degree:</strong> {viewingDoctor.education}</p>
                  <p><strong>Experience:</strong> {viewingDoctor.experience}</p>
                  <p><strong>Fees:</strong>₹{viewingDoctor.fees}</p>
                  <p><strong>Mobile:</strong> {viewingDoctor.mobile}</p>
                  <p><strong>Gender:</strong> {viewingDoctor.gender}</p>
                  <p><strong>License Number:</strong> {viewingDoctor.licenseNumber}</p>
                  <p><strong>Available:</strong> {viewingDoctor.available ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-700 mb-4">{viewingDoctor.about}</p>
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <div className="text-gray-700">
                  {typeof viewingDoctor.address === 'object' ? (
                    <>
                      <p>{viewingDoctor.address.line1}</p>
                      <p>{viewingDoctor.address.line2}</p>
                    </>
                  ) : (
                    <p>{viewingDoctor.address}</p>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2 mt-4">Documents</h3>
                <div className="space-y-2">
                  {viewingDoctor.licenseDocument && (
                    <div className="border p-2 rounded">
                      <p><strong>License Document:</strong></p>
                      <a
                        href={viewingDoctor.licenseDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View License Document
                      </a>
                    </div>
                  )}
                  <div className="border p-2 rounded">
                    <p><strong>Aadhar Card:</strong></p>
                    {viewingDoctor.aadharCard ? (
                      <button
                        onClick={() => setViewingDocument(viewingDoctor.aadharCard)}
                        className="text-blue-500 hover:underline"
                      >
                        View Aadhar Card
                      </button>
                    ) : (
                      <span className="text-gray-500">Not uploaded</span>
                    )}
                  </div>
                  {viewingDoctor.medicalDegreeCertificate && (
                    <div className="border p-2 rounded">
                      <p><strong>Medical Degree Certificate:</strong></p>
                      <a
                        href={viewingDoctor.medicalDegreeCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Medical Degree Certificate
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingDoctor(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
