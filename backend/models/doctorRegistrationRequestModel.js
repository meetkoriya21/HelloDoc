import mongoose from "mongoose";

const doctorRegistrationRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  speciality: { type: String, default: "" },
  education: { type: String, default: "" },
  experience: { type: String, default: "" },
  about: { type: String, default: "" },
  fees: { type: Number, default: 0 },
  address: {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" }
  },
  licenseNumber: { type: String, default: "" },
  licenseDocument: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  aadharCard: { type: String, default: "" },
  mobile: { type: String, default: "" },
  gender: { type: String, default: "" },
  medicalDegreeCertificate: { type: String, default: "" },
  status: { type: String, enum: ["incomplete", "pending", "approved", "rejected"], default: "incomplete" },
  date: { type: Date, default: Date.now }
});

const DoctorRegistrationRequest = mongoose.model("DoctorRegistrationRequest", doctorRegistrationRequestSchema);

export default DoctorRegistrationRequest;
