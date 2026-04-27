import express from 'express'
import { addDoctor, allDoctors, loginAdmin, pendingDoctors, approveDoctor, rejectDoctor, updateDoctor, deleteDoctor, getDashboardCounts, getTodaysAppointments } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailability } from '../controllers/doctorController.js';

const adminRouter = express.Router()

adminRouter.post("/add-doctor", authAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'licenseDocument', maxCount: 1 }, { name: 'medicalDegreeCertificate', maxCount: 1 }, { name: 'aadharCard', maxCount: 1 }]), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);

// New admin routes for doctor approval
adminRouter.get("/pending-doctors", authAdmin, pendingDoctors);
adminRouter.post("/approve-doctor/:id", authAdmin, approveDoctor);
adminRouter.post("/reject-doctor/:id", authAdmin, rejectDoctor);

// Dashboard counts API
adminRouter.get("/dashboard-counts", authAdmin, getDashboardCounts);
adminRouter.get("/todays-appointments", authAdmin, getTodaysAppointments);

// Update doctor API
adminRouter.post("/update-doctor", authAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'licenseDocument', maxCount: 1 }, { name: 'medicalDegreeCertificate', maxCount: 1 }, { name: 'aadharCard', maxCount: 1 }]), updateDoctor);

// Delete doctor API
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor);

export default adminRouter


