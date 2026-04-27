import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { assets } from "../assets/assets_admin/assets"; // Reuse admin assets for consistency

const MyProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const { backendUrl, token, setToken, setUserType } = useContext(AppContext);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/get-profile`);
      if (data.success) {
        let doctor = data.doctor || {};
        if (!doctor.address || doctor.address === null) {
          doctor.address = { line1: "", line2: "" };
        } else if (typeof doctor.address === "string") {
          try {
            doctor.address = JSON.parse(
              doctor.address.replace(/\n/g, "").replace(/(\w+):/g, '"$1":')
            );
          } catch (e) {
            console.error("Failed to parse address:", e);
            doctor.address = { line1: "", line2: "" };
          }
        }
        setDoctorData(doctor);
      } else {
        toast.error(data.message);
        navigate("/login");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired, please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setToken(false);
        setUserType(null);
        navigate('/login');
      } else {
        toast.error("Failed to fetch profile");
        navigate("/login");
      }
    }
  };

  const updateDoctorProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", doctorData.name);
      formData.append("mobile", doctorData.mobile);
      formData.append("gender", doctorData.gender);
      formData.append("address", JSON.stringify(doctorData.address));
      formData.append("speciality", doctorData.speciality);
      formData.append("education", doctorData.education);
      formData.append("experience", doctorData.experience);
      formData.append("about", doctorData.about);
      formData.append("fees", doctorData.fees);
      formData.append("available", doctorData.available);
      formData.append("licenseNumber", doctorData.licenseNumber);
      image && formData.append("image", image);

      const { data } = await axios.post(`${backendUrl}/api/doctor/update-profile`, formData);

      if (data.success) {
        toast.success("Profile updated successfully!");
        await fetchDoctorProfile(); // Refresh data
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired, please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setToken(false);
        setUserType(null);
        navigate('/login');
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  if (!doctorData) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-6 text-sm px-10 py-6">
      {/* Profile Image and Name */}
      <div className="flex items-center gap-4">
        {isEdit ? (
          <label htmlFor="image" className="cursor-pointer relative inline-block">
            <img 
              className="w-36 h-36 rounded-full  opacity-75 border-2 border-gray-300" 
              src={image ? URL.createObjectURL(image) : doctorData.image || doctorData.profilePicture} 
              alt="Profile" 
            />
            {!image && <img className="w-8 h-8 absolute -bottom-2 -right-2" src={assets.upload_icon} alt="Upload" />}
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden accept="image/*" />
          </label>
        ) : (
          <img className="w-36 h-36 rounded-full " src={doctorData.image || doctorData.profilePicture} alt="Profile" />
        )}

        <div>
          {isEdit ? (
            <input
              className="bg-gray-50 text-3xl font-medium max-w-60"
              type="text"
              value={doctorData.name}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, name: e.target.value }))}
            />
          ) : (
            <p className="font-medium text-3xl text-neutral-800">{doctorData.name}</p>
          )}
          <p className="text-gray-500">Status: <span className={`px-2 py-1 rounded-full text-xs ${doctorData.status === 'approved' ? 'bg-green-100 text-green-800' : doctorData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{doctorData.status}</span></p>
          <p className="text-gray-500">Joined: {new Date(doctorData.date).toLocaleDateString()}</p>
        </div>
      </div>
      <hr className="bg-zinc-400 h-[1px] border-none" />

      {/* Contact Information */}
      <div>
        <p className="text-neutral-500 underline text-lg font-medium mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email:</p>
          <p className="text-blue-500">{doctorData.email}</p>
          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52 p-1 border rounded"
              type="text"
              value={doctorData.mobile}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, mobile: e.target.value }))}
            />
          ) : (
            <p className="text-blue-500">{doctorData.mobile}</p>
          )}
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="bg-gray-100 max-w-52 p-1 border rounded"
              value={doctorData.gender || ""}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, gender: e.target.value }))}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p className="text-gray-500">{doctorData.gender || "Not specified"}</p>
          )}
          <p className="font-medium">Address:</p>
          {isEdit ? (
            <div className="space-y-1">
              <input
                className="bg-gray-50 w-full p-1 border rounded"
                onChange={(e) => setDoctorData((prev) => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                value={doctorData?.address?.line1 || ""}
                type="text"
                placeholder="Address Line 1"
              />
              <input
                className="bg-gray-50 w-full p-1 border rounded"
                onChange={(e) => setDoctorData((prev) => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                value={doctorData?.address?.line2 || ""}
                type="text"
                placeholder="Address Line 2"
              />
            </div>
          ) : (
            <p className="text-gray-500">
              {doctorData?.address?.line1 || "No address"}
              <br />
              {doctorData?.address?.line2 || ""}
            </p>
          )}
        </div>
      </div>

      {/* Professional Information */}
      <div>
        <p className="text-neutral-500 underline text-lg font-medium mt-3">PROFESSIONAL INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Specialty:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-64 p-1 border rounded"
              type="text"
              value={doctorData.speciality}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, speciality: e.target.value }))}
            />
          ) : (
            <p className="text-gray-500 capitalize">{doctorData.speciality || "Not specified"}</p>
          )}
          <p className="font-medium">Education:</p>
          {isEdit ? (
            <textarea
              className="bg-gray-100 max-w-64 p-1 border rounded resize-none h-20"
              value={doctorData.education}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, education: e.target.value }))}
            />
          ) : (
            <p className="text-gray-500">{doctorData.education || "Not specified"}</p>
          )}
          <p className="font-medium">Experience:</p>
          {isEdit ? (
            <textarea
              className="bg-gray-100 max-w-64 p-1 border rounded resize-none h-20"
              value={doctorData.experience}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, experience: e.target.value }))}
            />
          ) : (
            <p className="text-gray-500">{doctorData.experience || "Not specified"}</p>
          )}
          <p className="font-medium">About:</p>
          {isEdit ? (
            <textarea
              className="bg-gray-100 max-w-64 p-1 border rounded resize-none h-24"
              value={doctorData.about}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, about: e.target.value }))}
            />
          ) : (
            <p className="text-gray-500">{doctorData.about || "Not specified"}</p>
          )}
          <p className="font-medium">Consultation Fees:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-20 p-1 border rounded"
              type="number"
              value={doctorData.fees}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, fees: e.target.value }))}
            />
          ) : (
            <p className="text-gray-500">₹{doctorData.fees || 0}</p>
          )}
          <p className="font-medium">Available:</p>
          {isEdit ? (
            <select
              className="bg-gray-100 max-w-20 p-1 border rounded"
              onChange={(e) => setDoctorData((prev) => ({ ...prev, available: e.target.value === 'true' }))}
              value={doctorData.available.toString()}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : (
            <p className="text-gray-500">{doctorData.available ? "Yes" : "No"}</p>
          )}
          <p className="font-medium">License Number:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52 p-1 border rounded"
              type="text"
              value={doctorData.licenseNumber}
              onChange={(e) => setDoctorData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
            />
          ) : (
            <p className="text-gray-500">{doctorData.licenseNumber || "Not specified"}</p>
          )}
          <p className="font-medium">License Document:</p>
          {doctorData.licenseDocument ? (
            <a href={`${backendUrl}/uploads/${doctorData.licenseDocument.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View License</a>
          ) : (
            <p className="text-gray-500">No document uploaded</p>
          )}
          <p className="font-medium">Medical Degree Certificate:</p>
          {doctorData.medicalDegreeCertificate ? (
            <a href={`${backendUrl}/uploads/${doctorData.medicalDegreeCertificate.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View Certificate</a>
          ) : (
            <p className="text-gray-500">No certificate uploaded</p>
          )}
          <p className="font-medium">Aadhar Card:</p>
          {doctorData.aadharCard ? (
            <a href={`${backendUrl}/uploads/${doctorData.aadharCard.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View Aadhar Card</a>
          ) : (
            <p className="text-gray-500">No document uploaded</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex gap-4">
        {isEdit ? (
          <button
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-500"
            onClick={updateDoctorProfile}
          >
            Save Information
          </button>
        ) : (
          <button
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-500"
            onClick={() => setIsEdit(true)}
          >
            Edit Profile
          </button>
        )}
        {isEdit && (
          <button
            className="border border-gray-300 px-8 py-2 rounded-full hover:bg-gray-100 transition-all duration-500"
            onClick={() => { setIsEdit(false); setImage(null); }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
