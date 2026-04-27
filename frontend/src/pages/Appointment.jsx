import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets_frontend/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import BookAppointment from "../components/BookAppointment";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState({});

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showBookAppointment, setShowBookAppointment] = useState(false);

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const fetchBookedSlots = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/booked-slots?docId=${docId}`);
      if (response.data.success) {
        setBookedSlots(response.data.bookedSlots);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);

    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 9 ? currentDate.getHours() + 1 : 9);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(9);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime
        });

        currentDate.setMinutes(currentDate.getMinutes() + 15);
      }

      setDocSlots(prev => ([...prev, timeSlots]));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Please login to book appointment');
      return navigate('/login');
    }

    if (!slotTime) {
      toast.warn('Please select a time slot');
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const response = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Appointment booked successfully!');
        getDoctorsData();
        setBookedSlots(prev => ({
          ...prev,
          [slotDate]: [...(prev[slotDate] || []), slotTime]
        }));
        navigate('/my-appointments');
      } else {
        toast.error(response.data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, [docId]);

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    fetchBookedSlots();
  }, [docId]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  return (
    docInfo ? (
      <div>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div>
            <img className="bg-primary w-full sm:max-w-60 rounded-lg" src={docInfo.profilePicture} alt="" />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex  items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
            </div>

            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                About
                <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
            </div>

            <p className="text-gray-500 font-medium mt-4">
              Appointment fee: <span className="text-gray-600">{currencySymbol} {docInfo.fees}</span>
            </p>
          </div>
        </div>

        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking Slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4 ">
            {
              docSlots.length && docSlots.map((item, index) => (
                <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16  rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-300'}`} key={index}>
                  <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))
            }
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots.length && docSlots[slotIndex].map((item, index) => {
              // Calculate slot date for checking booked slots
              const date = docSlots[slotIndex][0].datetime;
              let day = date.getDate();
              let month = date.getMonth() + 1;
              let year = date.getFullYear();
              const currentSlotDate = day + "_" + month + "_" + year;

              // Check if slot is booked
              const isBooked = bookedSlots[currentSlotDate] && bookedSlots[currentSlotDate].includes(item.time);

              return (
                <p
                  onClick={!isBooked ? () => {
                    setSlotTime(item.time);
                    setSlotDate(currentSlotDate);
                  } : null}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    isBooked
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : item.time === slotTime
                      ? 'bg-primary text-white'
                      : 'text-gray-400 border border-gray-300 hover:bg-gray-100'
                  }`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              );
            })}
          </div>
          <button onClick={() => setShowBookAppointment(true)} className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6">
            Book Appointment
          </button>
        </div>

        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

        {showBookAppointment && (
          <BookAppointment
            docId={docId}
            docInfo={docInfo}
            onClose={() => setShowBookAppointment(false)}
            slotDate={slotDate}
            slotTime={slotTime}
            onSuccess={(bookedSlotDate, bookedSlotTime) => {
              setBookedSlots(prev => ({
                ...prev,
                [bookedSlotDate]: [...(prev[bookedSlotDate] || []), bookedSlotTime]
              }));
            }}
          />
        )}

      </div>
    ) : (
      <div className="text-center mt-10">
        <p>Loading doctor information...</p>
      </div>
    )
  );
};

export default Appointment;
