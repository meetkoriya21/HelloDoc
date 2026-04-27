import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const Login = () => {

  const {backendUrl, token, setToken, userType, setUserType } = useContext(AppContext)
  const navigate = useNavigate();

  const [state, setState] = useState(() => localStorage.getItem("loginState") || "Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {

      if(state === 'Sign Up'){

          if(isDoctor){
          // Doctor registration step 1
          const {data} = await axios.post(backendUrl + "/api/doctor/auth/register-doctor", {name,password,email});
          if(data.success){
            localStorage.setItem("token", data.token);
            setToken(data.token);
            // Save name, email, and password to localStorage for profile prefill
            localStorage.setItem("name", name);
            localStorage.setItem("email", email);
            localStorage.setItem("password", password);
            toast.success("Account created. Please complete your profile.");
            navigate("/registerdoctor/complete-profile");
          }else{
            toast.error(data.message);
          }
        } else {
          // Patient registration
          const {data} = await axios.post(backendUrl + "/api/user/register", {name,password,email});
          if(data.success){
            localStorage.setItem("token", data.token);
            localStorage.setItem("userType", "patient");
            setToken(data.token);
            setUserType("patient");
            toast.success("Account created successfully, please complete profile");
            navigate("/my-profile");
          }else{
            toast.error(data.message);
          }
        }

      }else{
          if(isDoctor){
          // Doctor login
          const {data} = await axios.post(backendUrl + "/api/doctor/auth/login-doctor", {password,email});
          if(data.success){
            localStorage.setItem("token", data.token);
            localStorage.setItem("userType", "doctor");
            setToken(data.token);
            setUserType("doctor");
            if(data.status === "pending"){
              navigate("/registerdoctor/complete-profile");
            } 
          }else{
            toast.error(data.message);
          }
        } else {
          // Patient login
          const {data} = await axios.post(backendUrl + "/api/user/login", {password,email});
          if(data.success){
            localStorage.setItem("token", data.token);
            localStorage.setItem("userType", "patient");
            setToken(data.token);
            setUserType("patient");
            navigate('/');
          }else{
            toast.error(data.message);
          }
        }
      }

    }catch(error){
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (token && userType === 'doctor' && window.location.pathname === '/login') {
      navigate('/doctor');
    } else if (token && userType === 'patient' && window.location.pathname === '/login') {
      navigate('/');
    }
  }, [token, userType, navigate]);

  return (
    <form onSubmit={onSubmitHandler} action="" className="min-h-[70vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign Up" ? "Sign Up" : "Login"} to book appointment
        </p>
        <div className="w-full">
          <p>User Type</p>
          <select
            value={isDoctor ? "doctor" : "patient"}
            onChange={(e) => setIsDoctor(e.target.value === "doctor")}
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            required
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
        {state === "Sign Up" && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>
        <button type="submit" className="bg-primary text-white w-full py-2 rounded-md text-base">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>
        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => { setState("Login"); localStorage.setItem("loginState", "Login"); }}
              className="text-primary underline cursor-pointer bg-transparent border-none p-0 m-0"
            >
              Login here
            </button>{" "}
          </p>
        ) : (
          <p>
            Create a new account?{" "}
            <button
              type="button"
              onClick={() => { setState("Sign Up"); localStorage.setItem("loginState", "Sign Up"); }}
              className="text-primary underline cursor-pointer bg-transparent border-none p-0 m-0"
            >
              click here
            </button>{" "}
          </p>
        )}
      </div>
    </form>
  );
};
export default Login;
