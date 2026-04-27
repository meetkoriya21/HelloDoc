import express from 'express'
import { doctorList, registerDoctorStep1, completeProfile, loginDoctor, getDoctorProfile, updateDoctorProfile, getDoctorDashboardCounts, getDoctorAppointments } from '../controllers/doctorController.js'
import authUser from '../middlewares/authUser.js'
import authDoctor from '../middlewares/authDoctor.js'
import upload from '../middlewares/multer.js'

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)

// Doctor auth routes
doctorRouter.post('/auth/register-doctor', registerDoctorStep1)
doctorRouter.post('/auth/complete-profile', upload.fields([
  { name: 'licenseDocument', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'medicalDegreeCertificate', maxCount: 1 }
]), completeProfile)
doctorRouter.post('/auth/login-doctor', loginDoctor)

// Doctor profile routes
doctorRouter.get('/get-profile', authDoctor, getDoctorProfile)
doctorRouter.post('/update-profile', authDoctor, upload.single('image'), updateDoctorProfile)

// Doctor dashboard routes
doctorRouter.get('/dashboard-counts', authDoctor, getDoctorDashboardCounts)
doctorRouter.get('/appointments', authDoctor, getDoctorAppointments)

export default doctorRouter
