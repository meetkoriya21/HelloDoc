import doctorModel from "../models/doctorModel.js"
import DoctorRegistrationRequest from "../models/doctorRegistrationRequestModel.js"
import appointmentModel from "../models/appointmentModel.js"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import { v2 as cloudinary } from "cloudinary"
import { Readable } from "stream"
import jwt from 'jsonwebtoken'

// ✅ Change Availability
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body
    const docData = await doctorModel.findById(docId)
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
    res.json({ success: true, message: "Doctor availability updated" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Get All Approved Doctors (including unavailable ones)
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" }).select(['-password', '-email'])
    res.json({ success: true, doctors })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Step 1 Registration (do not store in DB, just validate)
const registerDoctorStep1 = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Name, email and password are required" })
    }

    // Check if email already exists in doctorModel (profile submitted)
    const existingDoctor = await doctorModel.findOne({ email })
    if (existingDoctor) {
      return res.json({ success: false, message: "Email already registered" })
    }

    // Check if email exists in DoctorRegistrationRequest (pending registration)
    const existingRequest = await DoctorRegistrationRequest.findOne({ email })
    if (existingRequest) {
      return res.json({ success: false, message: "Email already registered" })
    }

    // Do not save anything here, just return success to proceed to Step 2
    res.json({ success: true, message: "Step 1 data validated. Proceed to complete profile." })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Step 2 Complete Profile (save all data including password and files)
const completeProfile = async (req, res) => {
  try {
    console.log("Received completeProfile request body:", req.body)
    console.log("Received completeProfile files:", req.files)

    const {
      name,
      email,
      password,
      speciality,
      education,
      addressLine1,
      addressLine2,
      experience,
      fees,
      about,
      licenseNumber,
      mobile,
      gender
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" })
    }

    // Check if email already exists in doctorModel (profile submitted)
    const existingDoctor = await doctorModel.findOne({ email })
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: "Email already registered" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Helper function to get local URL for uploaded file
    const getLocalFileUrl = (filename) => {
      if (!filename) return null
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8082}`
      return `${baseUrl}/uploads/${filename}`
    }

    const licenseDocumentFile = req.files?.licenseDocument?.[0]
    const profilePictureFile = req.files?.profilePicture?.[0]
    const aadharCardFile = req.files?.aadharCard?.[0]
    const medicalDegreeCertificateFile = req.files?.medicalDegreeCertificate?.[0]

    // Upload profile picture to Cloudinary
    let profilePictureUrl = null
    if (profilePictureFile) {
      const resourceType = (profilePictureFile.mimetype || "").startsWith("image/") ? "image" : "auto"
      const uploadToCloudinary = (file, resourceType = "auto") => {
        return new Promise((resolve, reject) => {
          if (!file) return resolve(null)
          if (file.path) {
            return cloudinary.uploader.upload(file.path, { resource_type: resourceType }, (err, result) => {
              if (err) return reject(err)
              resolve(result.secure_url)
            })
          }
          if (file.buffer) {
            const upload_stream = cloudinary.uploader.upload_stream({ resource_type: resourceType }, (err, result) => {
              if (err) return reject(err)
              resolve(result.secure_url)
            })
            const rs = Readable.from(file.buffer)
            rs.pipe(upload_stream)
            return
          }
          return cloudinary.uploader.upload(file.originalname || "", { resource_type: resourceType })
            .then(r => resolve(r.secure_url))
            .catch(reject)
        })
      }
      profilePictureUrl = await uploadToCloudinary(profilePictureFile, resourceType)
    }

    // Create new doctor registration request
    const newRequest = new DoctorRegistrationRequest({
      name,
      email,
      password: hashedPassword,
      speciality,
      education,
      address: { line1: addressLine1, line2: addressLine2 },
      experience,
      fees,
      about,
      licenseNumber,
      mobile,
      gender,
      licenseDocument: getLocalFileUrl(licenseDocumentFile?.filename),
      profilePicture: profilePictureUrl,
      aadharCard: getLocalFileUrl(aadharCardFile?.filename),
      medicalDegreeCertificate: getLocalFileUrl(medicalDegreeCertificateFile?.filename),
      status: "pending",
      date: Date.now()
    })

    await newRequest.save()

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      const mailOptions = {
        from: `"Admin" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: "New Doctor Registration Request",
        text: `Doctor ${name} (${email}) has submitted a registration request. Please review and approve.`
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log("Error sending admin email:", error)
        else console.log("Admin email sent:", info.response)
      })
    }

    res.json({ success: true, message: "Registration request submitted. Please wait for admin approval." })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getDoctorProfile = async (req, res) => {
  try {
    const doctor = req.doctor
    const doctorData = await doctorModel.findById(doctor._id).select('-password')
    res.json({ success: true, doctor: doctorData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = req.doctor
    const formData = req.body

    // Parse address if string
    let address = formData.address
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address)
      } catch (e) {
        address = { line1: '', line2: '' }
      }
    }

    // Handle image upload if present
    let imageUrl = doctor.image
    if (req.file) {
      const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "auto"
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: resourceType })
      imageUrl = uploadResult.secure_url
    }

    const updateData = {
      name: formData.name,
      mobile: formData.mobile,
      gender: formData.gender,
      address,
      speciality: formData.speciality,
      education: formData.education,
      experience: formData.experience,
      about: formData.about,
      fees: formData.fees,
      available: formData.available === 'true',
      licenseNumber: formData.licenseNumber,
      image: imageUrl
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(doctor._id, updateData, { new: true }).select('-password')
    res.json({ success: true, doctor: updatedDoctor })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Get Doctor Dashboard Counts
const getDoctorDashboardCounts = async (req, res) => {
  try {
    const doctorId = req.doctor._id
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    const formattedToday = `${day}_${month}_${year}` // DD_MM_YYYY format

    // Total appointments
    const totalAppointments = await appointmentModel.countDocuments({ docId: doctorId })

    // Today's appointments
    const todaysAppointments = await appointmentModel.countDocuments({
      docId: doctorId,
      slotDate: formattedToday,
      cancelled: false
    })

    res.json({
      success: true,
      counts: {
        totalAppointments,
        todaysAppointments
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Get Doctor Appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.doctor._id
    const appointments = await appointmentModel.find({ docId: doctorId })
      .sort({ date: -1 }) // Most recent first
      .select('-__v')

    // Map status
    const appointmentsWithStatus = appointments.map(apt => {
      let status = 'Pending'
      if (apt.cancelled) status = 'Cancelled'
      else if (apt.isCompleted) status = 'Completed'
      else if (apt.payment) status = 'Confirmed'

      return {
        ...apt._doc,
        status
      }
    })

    res.json({ success: true, appointments: appointmentsWithStatus })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body
    let doctor = await doctorModel.findOne({ email })

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" })
    }

    const isMatch = await bcrypt.compare(password, doctor.password)
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    if (doctor.status === "rejected") {
      return res.json({ success: false, message: "Account rejected by admin" })
    }

    if (doctor.status === "pending" || doctor.status === "incomplete") {
      return res.json({ success: false, status: doctor.status, message: "Please complete your profile first" })
    }

    const token = jwt.sign(
      { id: doctor._id, role: "doctor", status: doctor.status },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )
    res.json({ success: true, token, status: doctor.status })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { changeAvailability, doctorList, registerDoctorStep1, completeProfile, loginDoctor, getDoctorProfile, updateDoctorProfile, getDoctorDashboardCounts, getDoctorAppointments }
