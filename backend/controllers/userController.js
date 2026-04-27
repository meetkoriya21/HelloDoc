import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

//  API to register user

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: "All fields are required" });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        // Validate password length
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

//API for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exit" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }



    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        // const  userId  = req.user.id
        const  {userId}  = req.body

        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }

}

// API to update user profile
const updateProfile = async (req, res) => {

    try {
        // const userId = req.user.id;
        const { userId,name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !address || !dob || !gender) {
            return res.json({ success: false, message: "All fields are required" });

        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            // Uplad image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image: imageURL })
        }

        res.json({success:true,message:"Profile updated successfully"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }


}

// API to book appoinment
const bookAppointment = async (req, res) => {

    try {
        const{userId , docId , slotDate , slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if(!docData.available){
            return res.json({success:false,message:"Doctor is not available"})
        }

        // Check if slot is already booked by querying appointments
        const existingAppointment = await appointmentModel.findOne({
            docId,
            slotDate,
            slotTime,
            cancelled: false
        });

        if (existingAppointment) {
            return res.json({success:false,message:"Slot is already booked"});
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            slotDate,
            slotTime,
            userData,
            docData,
            amount: docData.fees,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        res.json({ success: true, message: "Appointment booked successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }

}

const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId, userId } = req.body;

    // Find the appointment and verify it belongs to the user
    const appointment = await appointmentModel.findOne({ _id: appointmentId, userId });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Delete the appointment (the pre-remove hook will handle freeing the slot)
    await appointmentModel.findByIdAndDelete(appointmentId);

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to create Razorpay order
const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.json({ success: false, message: "Payment functionality is disabled." });
    }

    const { docId, slotDate, slotTime } = req.body;
    const userId = req.body.userId;

    // Get doctor details
    const docData = await doctorModel.findById(docId).select('-password');
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not available" });
    }

    // Check if appointment already exists for this user and slot
    let existingAppointment = await appointmentModel.findOne({
      userId,
      docId,
      slotDate,
      slotTime
    });

    if (existingAppointment) {
      if (existingAppointment.payment) {
        return res.json({ success: false, message: "Appointment already paid" });
      }
      // If unpaid existing, proceed to payment
    } else {
      // Check if slot is already booked by querying appointments
      const bookedAppointment = await appointmentModel.findOne({
        docId,
        slotDate,
        slotTime,
        cancelled: false
      });

      if (bookedAppointment) {
        return res.json({ success: false, message: "Slot is already booked" });
      }

      // Create unpaid appointment
      const userData = await userModel.findById(userId).select('-password');
      delete docData.slots_booked;

      const appointmentData = {
        userId,
        docId,
        slotDate,
        slotTime,
        userData,
        docData,
        amount: docData.fees,
        date: Date.now(),
        payment: false
      };

      const newAppointment = new appointmentModel(appointmentData);
      await newAppointment.save();
    }

    // Create Razorpay order
    const options = {
      amount: docData.fees * 100, // amount in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify Razorpay payment and update appointment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, docId, slotDate, slotTime } = req.body;
    const userId = req.body.userId;

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.json({ success: false, message: "Payment verification failed" });
    }

    // Update the existing appointment to mark as paid
    const updatedAppointment = await appointmentModel.findOneAndUpdate(
      { userId, docId, slotDate, slotTime },
      { payment: true },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    res.json({ success: true, message: "Payment successful and appointment updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const bookAppointmentForm = async (req, res) => {
    try {
        const { docId, slotDate, slotTime, name, address, mobile, gender, age } = req.body;
        const userId = req.body.userId;

        const docData = await doctorModel.findById(docId).select('-password');

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor is not available" });
        }

        // Check if slot is already booked by querying appointments
        const existingAppointment = await appointmentModel.findOne({
            docId,
            slotDate,
            slotTime,
            cancelled: false
        });

        if (existingAppointment) {
            return res.json({ success: false, message: "Slot is already booked" });
        }

        const userData = await userModel.findById(userId).select('-password');

        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            slotDate,
            slotTime,
            userData: {
                ...userData.toObject(),
                name,
                address: typeof address === 'string' ? JSON.parse(address) : address,
                phone: mobile,
                gender,
                dob: userData.dob // Keep original DOB
            },
            docData,
            amount: docData.fees,
            date: Date.now(),
            payment: false,
            isCompleted: false
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        res.json({ success: true, message: "Appointment booked successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getBookedSlots = async (req, res) => {
    try {
        const { docId } = req.query;
        // Get all appointments for this doctor that are not cancelled
        const appointments = await appointmentModel.find({
            docId,
            cancelled: false
        }).select('slotDate slotTime');

        // Group slots by date
        const bookedSlots = {};
        appointments.forEach(appointment => {
            if (!bookedSlots[appointment.slotDate]) {
                bookedSlots[appointment.slotDate] = [];
            }
            bookedSlots[appointment.slotDate].push(appointment.slotTime);
        });

        res.json({ success: true, bookedSlots });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, bookAppointmentForm, getUserAppointments, cancelAppointment, createOrder, verifyPayment, getBookedSlots }
