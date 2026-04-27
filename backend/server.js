import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import path from 'path'

//app config
const app = express()
const port = process.env.PORT || 8082
connectDB();
connectCloudinary();

// middlewares
app.use(express.json())
app.use(cors())

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

//api endpoints
app.use('/api/admin',adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/',(req,res)=>(
    res.send('API WORKING Great')
))

app.listen(port, ()=> console.log("Server Started" , port))

