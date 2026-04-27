import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Global Axios interceptor to attach token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(() => localStorage.getItem("userType") || null);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    if (!token || !userType) {
      return;
    }
    try {
      let endpoint = backendUrl + "/api/user/get-profile";
      if (userType === "doctor") {
        endpoint = backendUrl + "/api/doctor/get-profile";
      }
      const { data } = await axios.get(endpoint);

      if (data.success) {
        let user = data.userData || data.doctor || {};

        if (!user.address || user.address === null) {
          user.address = { line1: "", line2: "" };
        } else if (typeof user.address === "string") {
          try {
            user.address = JSON.parse(
              user.address.replace(/\n/g, "").replace(/(\w+):/g, '"$1":')
            );
          } catch (e) {
            console.error("Failed to parse address:", e);
            user.address = { line1: "", line2: "" };
          }
        }

        setUserData(user);
        console.log("Frontend userData:", user);
      } else {
        setUserData(null);
        toast.error(data.message);
        // If token is invalid or not authorized, clear token and userData
        if (
          data.message &&
          (data.message.toLowerCase().includes("not authorized") ||
            data.message.toLowerCase().includes("invalid token"))
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          setToken(false);
          setUserType(null);
          setUserData(false);
        }
      }
    } catch (error) {
      console.log(error);
      // If error response indicates unauthorized, show toast and clear token
      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data &&
        error.response.data.message &&
        (error.response.data.message.toLowerCase().includes("not authorized") ||
          error.response.data.message.toLowerCase().includes("invalid token"))
      ) {
        toast.error("Session expired, please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        setToken(false);
        setUserType(null);
        setUserData(false);
      } else {
        toast.error(error.message);
      }
    }
  };

  const value = {
    doctors,getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    userType,
    setUserType,
    loadUserProfileData,
    createOrder: async (docId, slotDate, slotTime) => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/user/create-order",
          { docId, slotDate, slotTime, userId: localStorage.getItem("userId") }
        );
        return data;
      } catch (error) {
        toast.error(error.message);
        return null;
      }
    },
    verifyPayment: async (paymentData) => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/user/verify-payment",
          { ...paymentData, userId: localStorage.getItem("userId") }
        );
        return data;
      } catch (error) {
        toast.error(error.message);
        return null;
      }
    },
  };

  useEffect(() => {
    // Initialize from localStorage
    const storedToken = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");
    if (storedToken && storedToken !== "false") {
      setToken(storedToken);
    }
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, []);

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    loadUserProfileData();
  }, [token]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
export default AppContextProvider;
