import React from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import DoctorRegisterStep2 from './pages/DoctorRegisterStep2'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment.jsx'
import Navbar from './components/navbar'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DoctorApp from './doctor/DoctorApp'
import ProtectedDoctorRoute from './components/ProtectedDoctorRoute'
import ProtectedPatientRoute from './components/ProtectedPatientRoute'
import Dashboard from './doctor/pages/Dashboard'
import DoctorAppointments from './doctor/pages/Appointments'
import DoctorMyProfile from './doctor/pages/MyProfile'

const App = () => {
  const location = useLocation()
  const isDoctorPath = location.pathname.startsWith('/doctor')

  return (
    <div className={isDoctorPath ? "mx-4 sm:mx-[0%] min-h-screen flex flex-col" : "mx-4 sm:mx-[10%] min-h-screen flex flex-col"}>
      <ToastContainer />
      {!isDoctorPath && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alldoctors" element={<Doctors />} />
          <Route path="/alldoctors/:speciality" element={<Doctors />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registerdoctor/complete-profile" element={<DoctorRegisterStep2 />} />
          <Route path="/doctor" element={
            <ProtectedDoctorRoute>
              <DoctorApp />
            </ProtectedDoctorRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="my-profile" element={<DoctorMyProfile />} />
          </Route>
          <Route path="/contact" element={<Contact />} />
          <Route path="/my-profile" element={
            <ProtectedPatientRoute>
              <MyProfile />
            </ProtectedPatientRoute>
          } />
          <Route path="/my-appointments" element={
            <ProtectedPatientRoute>
              <MyAppointments />
            </ProtectedPatientRoute>
          } />
          <Route path="/appointment/:docId" element={
            <ProtectedPatientRoute>
              <Appointment />
            </ProtectedPatientRoute>
          } />
        </Routes>
      </main>
      {!isDoctorPath && <Footer />}
    </div>
  )
}

export default App
