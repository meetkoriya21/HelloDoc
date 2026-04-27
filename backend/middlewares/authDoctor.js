import jwt from 'jsonwebtoken'
import doctorModel from '../models/doctorModel.js'

const authDoctor = async (req, res, next) => {
  try {
    let token = req.header('token') || req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const doctor = await doctorModel.findById(decoded.id)
    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Token is not valid' })
    }

    if (doctor.status !== 'approved') {
      return res.status(401).json({ success: false, message: 'Account not approved' })
    }

    req.doctor = doctor
    next()
  } catch (error) {
    console.log(error)
    res.status(401).json({ success: false, message: 'Token is not valid' })
  }
}

export default authDoctor
