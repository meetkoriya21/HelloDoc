   import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets_admin/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [mobile, setMobile] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [gender, setGender] = useState("Male");
  const [licenseDocument, setLicenseDocument] = useState(false);
  const [medicalDegreeCertificate, setMedicalDegreeCertificate] =
    useState(false);
  const [aadharCard, setAadharCard] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add aadharCard to form submission

  const { backendUrl, aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!aToken) {
      toast.error("Please login as admin");
      setLoading(false);
      return;
    }

    try {
      if (!docImg) {
        setLoading(false);
        return toast.error("Image Not Selected");
      }
      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );
      formData.append("mobile", mobile);
      formData.append("gender", gender);
      formData.append("licenseNumber", licenseNumber);
      if (licenseDocument) formData.append("licenseDocument", licenseDocument);
      if (medicalDegreeCertificate)
        formData.append("medicalDegreeCertificate", medicalDegreeCertificate);

      if (aadharCard) formData.append("aadharCard", aadharCard);

      // console log formdata
      formData.forEach((value, key) => {
        console.log(`${key} : ${value}`);
      });

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setDocImg(false);
        setName("");
        setPassword("");
        setEmail("");
        setAbout("");
        setAddress1("");
        setAddress2("");
        setDegree("");
        setFees("");
        setMobile("");
        setLicenseNumber("");
        setLicenseDocument(false);
        setMedicalDegreeCertificate(false);
        setAadharCard(false);
      } else if (data.message && data.message.toLowerCase().includes("email")) {
        toast.error("Email ID already registered");
      } else {
        toast.error(data.message);
      }
      setLoading(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={onSubmitHandler} className="m-5 w-full">
        <p className="mb-3 text-lg font-medium">Add Doctor</p>

        <div className="bg-white px-6 py-8 border rounded w-full max-w-8xl max-h-[100vh] overflow-y-scroll">
          <div className="bg-white border rounded p-4 flex flex-row gap-6 mb-8">
            <div className="flex-1 flex items-center gap-4">
              <label
                htmlFor="doc-img"
                
                className=" mb-1 font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center" >
                  
                  {docImg ? (
                    <img
                      src={URL.createObjectURL(docImg)}
                      alt="Doctor"
                      
                      className="w-16 bg-gray-100 rounded cursor-pointer"
                    />
                  ) : (
                    <div className="flex items-center gap-4 mb-0 text-gray-500">
                      <label htmlFor="doc-img">
                        <img
                          className="w-16 bg-gray-100 rounded-full cursor-pointer"
                          src={assets.upload_area}
                          alt=""
                        />
                      </label>
                    </div>
                  )}
                </div>
                Upload doctor picture
                
              </label>
              <input
                onChange={(e) => setDocImg(e.target.files[0])}
                type="file"
                id="doc-img"
                required
                className="hidden"
              />
            </div>

            <div className="flex-1 ">
              <label
                htmlFor="license-doc"
                className="block mb-1 font-medium text-gray-700"
              >
                Upload Medical License 
              </label>
              <input
                onChange={(e) => setLicenseDocument(e.target.files[0])}
                type="file"
                id="license-doc"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary cursor-pointer file:text-white hover:file:bg-primary-dark "
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="aadhar-card"
                className="block mb-1 font-medium text-gray-700 cursor-pointer"
              >
                Upload Aadhar card
              </label>
              <input
                onChange={(e) => setAadharCard(e.target.files[0])}
                type="file"
                id="aadhar-card"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="degree-cert"
                className="block mb-1 font-medium text-gray-700"
              >
                Upload Medical Degree Certificate
              </label>
              <input
                onChange={(e) => setMedicalDegreeCertificate(e.target.files[0])}
                type="file"
                id="degree-cert"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
            <div className="w-full ld:flex-1 flex flex-col gap-6">
              <div className="flex-1 flex flex-col gap-1">
                <p>Doctor Name</p>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Name"
                  required
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p>Doctor Email</p>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="border rounded px-3 py-2"
                  type="email"
                  placeholder="Email"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p>Doctor Password</p>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="border rounded px-3 py-2"
                  type="password"
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p>Experience</p>
                <select
                  onChange={(e) => setExperience(e.target.value)}
                  value={experience}
                  className="border rounded px-3 py-2"
                  name="experience"
                  id="experience"
                >
                  <option value="1 Year">1 Year</option>
                  <option value="2 Year">2 Year</option>
                  <option value="3 Year">3 Year</option>
                  <option value="4 Year">4 Year</option>
                  <option value="5 Year">5 Year</option>
                  <option value="6 Year">6 Year</option>
                  <option value="7 Year">7 Year</option>
                  <option value="8 Year">8 Year</option>
                  <option value="9 Year">9 Year</option>
                  <option value="10 Year">10 Year</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p>Fees</p>
                <input
                  onChange={(e) => setFees(e.target.value)}
                  value={fees}
                  className="border rounded px-3 py-2"
                  type="number"
                  placeholder="Fees"
                  required
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p>Gender</p>
                <select
                  onChange={(e) => setGender(e.target.value)}
                  value={gender}
                  className="border rounded px-3 py-2"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="w-full ld:flex-1 flex flex-col gap-4">
              <div className="flex-1 flex flex-col gap-1">
                <p>Speciality</p>
                <select
                  onChange={(e) => setSpeciality(e.target.value)}
                  value={speciality}
                  className="border rounded px-3 py-2"
                  name=""
                  id=""
                >
                  <option value="General physician">General physician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatricians">Pediatricians</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                  <option value="Cardiologist">Cardiologist</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p>Education</p>
                <input
                  onChange={(e) => setDegree(e.target.value)}
                  value={degree}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Education"
                  required
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p>License Number</p>
                <input
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  value={licenseNumber}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="License Number"
                  required
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <p>Mobile</p>
                <input
                  onChange={(e) => setMobile(e.target.value)}
                  value={mobile}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Mobile"
                  required
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                {/* <p>value={experience} onChange={(e)=> setExperience(e.target.value)} </p> */}
                <p>Address</p>

                <input
                  onChange={(e) => setAddress1(e.target.value)}
                  value={address1}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Address line 1"
                  required
                />
                <input
                  onChange={(e) => setAddress2(e.target.value)}
                  value={address2}
                  className="border rounded px-3 py-2"
                  type="text"
                  placeholder="Address line 2"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-4 mb-2">
            <p>About Doctor</p>
            <textarea
              onChange={(e) => setAbout(e.target.value)}
              value={about}
              className="w-full px-4 pt-2 border rounded"
              placeholder="Write about doctor"
              rows={5}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary px-10 py-3 mt-4 text-white rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </span>
            ) : (
              "Add Doctor"
            )}
          </button>
        </div>
      </form>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
            <p className="text-lg font-medium text-gray-700">Submitting doctor profile...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AddDoctor;
