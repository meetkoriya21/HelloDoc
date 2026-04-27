import { createContext, useState } from "react";
import axios from "axios";
import {toast} from 'react-toastify'

export const AdminContext = createContext();

const AdminContextProvider = (props) => {

  const [aToken, setAtoken] = useState(localStorage.getItem("token") ? localStorage.getItem("token") : '');
  const [doctors,setDoctors] = useState([])
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const getAllDoctors = async () => {
    try {
      const {data} = await axios.post( `${backendUrl}/api/admin/all-doctors`, {} , {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      })
      if(data.success){
        setDoctors(data.doctors)
        console.log(data.doctors)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const changeAvailability = async (docId) => {
    try {
      const {data} = await axios.post( backendUrl + '/api/admin/change-availability', {docId} , {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      })
      if(data.success){
        toast.success(data.message)
        getAllDoctors()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const updateDoctor = async (formData) => {
    try {
      const {data} = await axios.post( backendUrl + '/api/admin/update-doctor', formData , {
        headers: {
          Authorization: `Bearer ${aToken}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      if(data.success){
        toast.success(data.message)
        getAllDoctors()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteDoctor = async (docId) => {
    try {
      const {data} = await axios.post( backendUrl + '/api/admin/delete-doctor', {docId} , {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      })
      if(data.success){
        toast.success(data.message)
        getAllDoctors()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const value = {
    aToken,setAtoken,
    backendUrl,doctors,
    getAllDoctors,changeAvailability,updateDoctor,deleteDoctor
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
