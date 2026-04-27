import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { assets } from '../assets/assets_frontend/assets'


const DoctorRegisterStep2 = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    speciality: "General physician",
    education: "",
    addressLine1: "",
    addressLine2: "",
    experience: "1 Year",
    fees: "",
    about: "",
    licenseNumber: "",
    mobile: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Debug: log localStorage values
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    console.log("LocalStorage name:", storedName);
    console.log("LocalStorage email:", storedEmail);
    console.log("LocalStorage password:", storedPassword);

    // Fix: ensure email is string, not array
    const emailValue = Array.isArray(storedEmail) ? storedEmail[0] : storedEmail;

    if (storedName || storedEmail || storedPassword) {
      setFormData((prev) => ({
        ...prev,
        name: storedName || "",
        email: emailValue || "",
        password: storedPassword || ""
      }));
    } else if (userData) {
      const userEmail = Array.isArray(userData.email) ? userData.email[0] : userData.email;
      setFormData((prev) => ({
        ...prev,
        name: userData.name || "",
        email: userEmail || ""
      }));
    }
  }, [userData]);


  const [licenseDocument, setLicenseDocument] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [aadharCard, setAadharCard] = useState(null);
  const [medicalDegreeCertificate, setMedicalDegreeCertificate] = useState(null);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "licenseDocument") {
      setLicenseDocument(files[0]);
      setErrors({ ...errors, licenseDocument: "" });
    } else if (name === "profilePicture") {
      setProfilePicture(files[0]);
      setProfilePicturePreview(URL.createObjectURL(files[0]));
      setErrors({ ...errors, profilePicture: "" });
    } else if (name === "aadharCard") {
      setAadharCard(files[0]);
      setErrors({ ...errors, aadharCard: "" });
    } else if (name === "medicalDegreeCertificate") {
      setMedicalDegreeCertificate(files[0]);
      setErrors({ ...errors, medicalDegreeCertificate: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Doctor Name is required";
    if (!formData.email.trim()) newErrors.email = "Doctor Email is required";
    if (!formData.gender.trim()) newErrors.gender = "Gender is required";
    if (!formData.education.trim()) newErrors.education = "Education is required";
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required";
    if (!formData.experience.trim()) newErrors.experience = "Experience is required";
    if (!formData.fees) newErrors.fees = "Fees is required";
    if (!formData.about.trim()) newErrors.about = "About Doctor is required";
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License Number is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";

    if (!licenseDocument) newErrors.licenseDocument = "License Document is required";
    if (!profilePicture) newErrors.profilePicture = "Doctor Picture is required";
    if (!aadharCard) newErrors.aadharCard = "Aadhar Card is required";
    if (!medicalDegreeCertificate) newErrors.medicalDegreeCertificate = "Medical Degree Certificate is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Remove duplicate onSubmitHandler declaration

  useEffect(() => {
    // Debug: log localStorage values
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    console.log("LocalStorage name:", storedName);
    console.log("LocalStorage email:", storedEmail);
    console.log("LocalStorage password:", storedPassword);

    // Fix: ensure email is string, not array
    const emailValue = Array.isArray(storedEmail) ? storedEmail[0] : storedEmail;

    if (storedName || storedEmail || storedPassword) {
      setFormData((prev) => ({
        ...prev,
        name: storedName || "",
        email: emailValue || "",
        password: storedPassword || ""
      }));
    } else if (userData) {
      const userEmail = Array.isArray(userData.email) ? userData.email[0] : userData.email;
      setFormData((prev) => ({
        ...prev,
        name: userData.name || "",
        email: userEmail || ""
      }));
    }
  }, [userData]);

  // New loading overlay JSX
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
      <div className="animate-pulse text-white text-lg font-semibold">
        Submitting your profile...
      </div>
      <div className="mt-4 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("You must be logged in to submit your profile.");
      navigate("/login");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (loading) return; // prevent multiple submits
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (licenseDocument) data.append("licenseDocument", licenseDocument);
    if (profilePicture) data.append("profilePicture", profilePicture);
    if (aadharCard) data.append("aadharCard", aadharCard);
    if (medicalDegreeCertificate) data.append("medicalDegreeCertificate", medicalDegreeCertificate);

    try {
      const { data: response } = await axios.post(
        backendUrl + "/api/doctor/auth/complete-profile",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      if (response.success) {
        toast.success(response.message);
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        
        window.location.href = "/login";
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
        console.error("Backend error response:", error.response.data);
      } else {
        toast.error(error.message);
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      <form onSubmit={onSubmitHandler} className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white p-3 rounded-lg shadow-md w-full max-w-6xl text-zinc-600 grid grid-cols-2 gap-8">
          <div className="flex flex-col items-start space-y-3">
            <div className="w-full">
              <label className="mb-2 text-sm font-semibold  block ">Upload doctor picture</label>
              <div
                className="flex items-center space-x-4 cursor-pointer border border-zinc-300 rounded p-4"
                onClick={() => document.getElementById("profilePictureInput").click()}
              >
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Doctor"
                    className="w-16 bg-gray-100 roundedd-full cursor-pointer"
                  />
                ) : (
                  <div className="flex items-center gap-4 mb-0 text-gray-500">
                    <label htmlFor="doc-img">
                      <img className='w-16 bg-gray-100 roundedd-full cursor-pointer' src={assets.upload_area} alt="" />
                    </label>
                  </div>
                )}
                <span className="text-gray-700 font-medium">Upload doctor picture</span>
              </div>
              <input
                type="file"
                id="profilePictureInput"
                name="profilePicture"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                required
              />
            </div>
            <label className="mb-2 text-sm font-semibold block">Doctor Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              placeholder="Name"
              required
            />
            <label className="mb-2 text-sm font-semibold block">Doctor Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="border border-zinc-300 rounded p-2 w-full bg-gray-100 cursor-not-allowed"
              placeholder="Email"
              required
            />
            <label className="mb-2 text-sm font-semibold block">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              placeholder="Mobile Number"
              required
            />
            <label className="mb-2 text-sm font-semibold block">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <label className="mb-2 text-sm font-semibold block">Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              placeholder="Address Line 1"
              required
            />
            <label className="mb-2 text-sm font-semibold block">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              placeholder="Address Line 2"
            />
            <label className="mb-2 text-sm font-semibold block">About Doctor</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              rows="4"
              placeholder="Write about doctor"
              required
            />
          </div>
          <div className="flex flex-col items-start space-y-4">
            <div className="w-full">
              <label className="mb-2 text-sm font-semibold block">Upload Medical License </label>
              <input
                type="file"
                name="licenseDocument"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="border border-zinc-300 rounded p-2 w-full block  text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                required
              />
            </div>
            <div className="w-full">
              <label className="mb-2 text-sm font-semibold block">Upload Aadhar card</label>
              <input
                type="file"
                name="aadharCard"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="border border-zinc-300 rounded p-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                required
              />
            </div>
            <div className="w-full">
              <label className="mb-2 text-sm font-semibold block">Upload Medical Degree Certificate</label>
              <input
                type="file"
                name="medicalDegreeCertificate"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="border border-zinc-300 rounded p-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                required
              />
            </div>
            <label className="mb-2 text-sm font-semibold block">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              placeholder="License Number"
              required
            />
            <label className="mb-2 text-sm font-semibold block">Speciality</label>
            <select
              name="speciality"
              value={formData.speciality}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
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
            <label className="mb-2 text-sm font-semibold block">Education</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              placeholder="Education"
              required
            />
            <label className="mb-2 text-sm font-semibold block">Experience</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              required
            >
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
              <option value="4 Years">4 Years</option>
              <option value="5 Years">5 Years</option>
              <option value="6 Years">6 Years</option>
              <option value="7 Years">7 Years</option>
              <option value="8 Years">8 Years</option>
              <option value="9 Years">9 Years</option>
              <option value="10+ Years">10+ Years</option>
            </select>
            <label className="mb-2 text-sm font-semibold block">Fees</label>
            <input
              type="number"
              name="fees"
              value={formData.fees}
              onChange={handleChange}
              className="border border-zinc-300 rounded p-2 w-full"
              placeholder="Fees"
              required
            />
            <button type="submit" className="bg-primary text-white py-2 rounded-md w-full">
              Submit Profile
            </button>
          </div>
        </div>
      </form>
    </>
  );
};


export default DoctorRegisterStep2;
