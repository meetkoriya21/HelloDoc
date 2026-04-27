import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {type : String , default : ''},
    email: {type : String , required : true, unique : true},
    password: {type : String , required : true},
    image: {type : String},
    speciality: {type : String , default : ''},
    education: {type : String , default : ''},
    experience: {type : String , default : ''},
    about: {type : String , default : ''},
    available: {type : Boolean , default : true},
    fees: {type : Number , default : 0},
    address: {
        line1: {type : String , default : ''},
        line2: {type : String , default : ''}
    },
    date: {type : Number , required : true},
    slots_booked: {type : Object ,default:{}},
    role: {type : String , default : 'doctor'},
    status: {type : String , enum : ['pending','approved','rejected'], default : 'pending'},
    licenseNumber: {type : String},
    licenseDocument: {type : String},
    profilePicture: {type : String},
    aadharCard: {type : String, default: ""},
    mobile: { type: String, default: "" },
    gender: { type: String, default: "" },
    medicalDegreeCertificate: { type: String, default: "" }

},{minimize:false})

delete mongoose.models['doctor'];
const doctorModel = mongoose.model('doctor',doctorSchema)

export default doctorModel