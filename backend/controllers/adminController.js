  
import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import DoctorRegistrationRequest from "../models/doctorRegistrationRequestModel.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import userModel from "../models/userModel.js"
import appointmentModel from "../models/appointmentModel.js"

// ✅ Add Doctor (manual by admin)
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address, mobile, gender, licenseNumber } = req.body
    const files = req.files

    if (!files || !files.image || !files.image[0]) {
      return res.status(400).json({ success: false, message: "Image file not received" })
    }
    if (!files.licenseDocument || !files.licenseDocument[0]) {
      return res.status(400).json({ success: false, message: "License document not received" })
    }
    if (!files.aadharCard || !files.aadharCard[0]) {
      return res.status(400).json({ success: false, message: "Aadhar card not received" })
    }
    if (!files.medicalDegreeCertificate || !files.medicalDegreeCertificate[0]) {
      return res.status(400).json({ success: false, message: "Medical degree certificate not received" })
    }
    if (!name || !email || !password || !speciality || !degree || !about || !fees || !address || !experience || !mobile || !licenseNumber) {
      return res.json({ success: false, message: "Missing Details" })
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Upload doctor profile picture
    const imageUpload = await cloudinary.uploader.upload(files.image[0].path, { resource_type: "image" })
    const imageUrl = imageUpload.secure_url

    // Helper function to get local URL for uploaded file
    const getLocalFileUrl = (filename) => {
      if (!filename) return null
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8082}`
      return `${baseUrl}/uploads/${filename}`
    }

    // Upload license document if provided
    let licenseDocumentUrl = ""
    if (files.licenseDocument && files.licenseDocument[0]) {
      licenseDocumentUrl = getLocalFileUrl(files.licenseDocument[0].filename)
    }

    // Upload medical degree certificate if provided
    let medicalDegreeCertificateUrl = ""
    if (files.medicalDegreeCertificate && files.medicalDegreeCertificate[0]) {
      medicalDegreeCertificateUrl = getLocalFileUrl(files.medicalDegreeCertificate[0].filename)
    }

    // Upload aadhar card if provided
    let aadharCardUrl = ""
    if (files.aadharCard && files.aadharCard[0]) {
      aadharCardUrl = getLocalFileUrl(files.aadharCard[0].filename)
    }

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      education: degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      mobile,
      gender,
      licenseNumber,
      licenseDocument: licenseDocumentUrl,
      profilePicture: imageUrl,
      medicalDegreeCertificate: medicalDegreeCertificateUrl,
      aadharCard: aadharCardUrl,
      date: Date.now(),
      status: "approved"
    }

    const newDoctor = new doctorModel(doctorData)
    await newDoctor.save()

    res.json({ success: true, message: "Doctor Added" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email, password }, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "Invalid credentials" })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Get All Approved Doctors
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" }).select('-password')
    res.json({ success: true, doctors })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Get Pending Doctors
const pendingDoctors = async (req, res) => {
  try {
    const doctors = await DoctorRegistrationRequest.find({ status: "pending" }).select('-password')
    res.json({ success: true, doctors })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Approve Doctor
const approveDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id
    const doctorRequest = await DoctorRegistrationRequest.findById(doctorId)
    if (!doctorRequest) {
      return res.status(404).json({ success: false, message: "Doctor not found" })
    }

    const doctorData = {
      name: doctorRequest.name,
      email: doctorRequest.email,
      password: doctorRequest.password,
      speciality: doctorRequest.speciality,
      education: doctorRequest.education,
      experience: doctorRequest.experience,
      about: doctorRequest.about,
      fees: doctorRequest.fees,
      address: doctorRequest.address,
      mobile: doctorRequest.mobile,
      gender: doctorRequest.gender,
      licenseNumber: doctorRequest.licenseNumber,
      profilePicture: doctorRequest.profilePicture,
      licenseDocument: doctorRequest.licenseDocument,
      aadharCard: doctorRequest.aadharCard,
      medicalDegreeCertificate: doctorRequest.medicalDegreeCertificate,
      status: "approved",
      date: doctorRequest.date,
      image: doctorRequest.profilePicture // Ensure image field is set to profilePicture
    }

    const newDoctor = new doctorModel(doctorData)
    await newDoctor.save()

    await sendEmail(doctorRequest.email, "Doctor Account Approved", "Your account has been approved by admin.")

    await DoctorRegistrationRequest.findByIdAndDelete(doctorId)

    res.json({ success: true, message: "Doctor approved" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Reject Doctor
const rejectDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id
    const { reason } = req.body

    const doctorRequest = await DoctorRegistrationRequest.findById(doctorId)
    if (!doctorRequest) {
      return res.status(404).json({ success: false, message: "Doctor not found" })
    }

    await sendEmail(doctorRequest.email, "Doctor Account Rejected", `Your account was rejected. Reason: ${reason}`)

    await DoctorRegistrationRequest.findByIdAndDelete(doctorId)

    res.json({ success: true, message: "Doctor rejected and removed" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Email Helper
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: `"Admin" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text
    })
  } catch (error) {
    console.log("Email sending error:", error)
  }
}

export { addDoctor, loginAdmin, allDoctors, pendingDoctors, approveDoctor, rejectDoctor, updateDoctor, deleteDoctor, getDashboardCounts, getTodaysAppointments }

// API to get today's appointments list and count
const getTodaysAppointments = async (req, res) => {
  try {
    // Calculate today's date string in IST timezone in "DD_MM_YYYY" format
    const now = new Date()
    const istOffset = 5.5 * 60 // IST is UTC+5:30 in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const istTime = new Date(utc + (istOffset * 60000))

    const yyyy = istTime.getFullYear()
    const mm = String(istTime.getMonth() + 1).padStart(2, '0')
    const dd = istTime.getDate() // no leading zero to match format like "3_09_2025"
    const todayStr = `${dd}_${mm}_${yyyy}`

    // Query appointments with slotDate equal to todayStr and not cancelled
    const appointments = await appointmentModel.find({ slotDate: todayStr, cancelled: false })

    res.json({
      success: true,
      count: appointments.length,
      appointments
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Debug API to get distinct slotDate values from appointments
const getDistinctSlotDates = async (req, res) => {
  try {
    const distinctDates = await appointmentModel.distinct('slotDate')
    res.json({ success: true, distinctDates })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ✅ Update Doctor
const updateDoctor = async (req, res) => {
  try {
    const { docId, name, email, speciality, degree, experience, about, fees, address, mobile, gender, licenseNumber } = req.body;
    const files = req.files;

    if (!docId) {
      return res.json({ success: false, message: "Doctor ID is required" });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Update fields
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (speciality) doctor.speciality = speciality;
    if (degree) doctor.education = degree;
    if (experience) doctor.experience = experience;
    if (about) doctor.about = about;
    if (fees) doctor.fees = fees;
    if (address) doctor.address = JSON.parse(address);
    if (mobile) doctor.mobile = mobile;
    if (gender) doctor.gender = gender;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;

    // Handle file uploads if provided
    if (files && files.image && files.image[0]) {
      const imageUpload = await cloudinary.uploader.upload(files.image[0].path, { resource_type: "image" });
      doctor.image = imageUpload.secure_url;
      doctor.profilePicture = imageUpload.secure_url;
    }

    // Helper function to get local URL for uploaded file
    const getLocalFileUrl = (filename) => {
      if (!filename) return null;
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8082}`;
      return `${baseUrl}/uploads/${filename}`;
    };

    if (files && files.licenseDocument && files.licenseDocument[0]) {
      doctor.licenseDocument = getLocalFileUrl(files.licenseDocument[0].filename);
    }
    if (files && files.medicalDegreeCertificate && files.medicalDegreeCertificate[0]) {
      doctor.medicalDegreeCertificate = getLocalFileUrl(files.medicalDegreeCertificate[0].filename);
    }
    if (files && files.aadharCard && files.aadharCard[0]) {
      doctor.aadharCard = getLocalFileUrl(files.aadharCard[0].filename);
    }

    await doctor.save();

    res.json({ success: true, message: "Doctor updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Delete Doctor
const deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.json({ success: false, message: "Doctor ID is required" });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Delete the doctor
    await doctorModel.findByIdAndDelete(docId);

    // Optionally, cancel all future appointments for this doctor
    await appointmentModel.updateMany(
      { docId, cancelled: false },
      { cancelled: true, cancelReason: "Doctor account deleted" }
    );

    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get counts for dashboard cards
const getDashboardCounts = async (req, res) => {
  try {
    const totalDoctors = await doctorModel.countDocuments({ status: "approved" })
    const totalPatients = await userModel.countDocuments()
    const totalAppointments = await appointmentModel.countDocuments()

    // Get today's date string in format D_MM_YYYY to match slotDate format
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0') // leading zero to match format like "03_09_2025"
    const todayStr = `${dd}_${mm}_${yyyy}`

    // Match slotDate exactly with todayStr
    const todaysAppointments = await appointmentModel.countDocuments({ slotDate: todayStr })

    res.json({
      success: true,
      counts: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        todaysAppointments
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}
