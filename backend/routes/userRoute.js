import express from 'express';
import {registerUser,loginUser, getProfile,updateProfile,bookAppointment, bookAppointmentForm, getUserAppointments, cancelAppointment, createOrder, verifyPayment, getBookedSlots } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/get-profile',authUser,getProfile);
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile );
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.post('/book-appointment-form', authUser, bookAppointmentForm);

userRouter.get('/appointments', authUser, getUserAppointments);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);

userRouter.post('/create-order', authUser, createOrder);
userRouter.post('/verify-payment', authUser, verifyPayment);

userRouter.get('/booked-slots', getBookedSlots);

export default userRouter;
