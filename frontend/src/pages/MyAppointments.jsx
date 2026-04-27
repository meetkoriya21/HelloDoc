import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from "../context/AppContext"
import axios from 'axios'

const MyAppointments = () => {
  const { token, backendUrl } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/user/appointments', {
          headers: {
            token,
          },
        })
        if (data.success) {
          setAppointments(data.appointments)
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
      }
    }
    if (token) {
      fetchAppointments()
    }
  }, [token, backendUrl])

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

  const handlePayment = async (appointment) => {
    if (!token) {
      alert('Please login to pay for appointment');
      return;
    }

    const res = await loadRazorpayScript();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const orderResponse = await axios.post(
        backendUrl + '/api/user/create-order',
        {
          docId: appointment.docId,
          slotDate: appointment.slotDate,
          slotTime: appointment.slotTime,
          userId: appointment.userId
        },
        { headers: { token } }
      );

      if (!orderResponse.data.success) {
        alert(orderResponse.data.message || 'Failed to create order');
        return;
      }

      const { order } = orderResponse.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: "HelloDoc",
        description: "Appointment Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              backendUrl + '/api/user/verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                docId: appointment.docId,
                slotDate: appointment.slotDate,
                slotTime: appointment.slotTime,
                userId: appointment.userId
              },
              { headers: { token } }
            );

            if (verifyResponse.data.success) {
              alert('Payment successful and appointment booked!');
              // Refresh appointments list
              const { data } = await axios.get(backendUrl + '/api/user/appointments', {
                headers: { token },
              });
              if (data.success) {
                setAppointments(data.appointments);
              }
            } else {
              alert(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error(error);
            alert('Payment verification failed');
          }
        },
        prefill: {},
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert('Payment failed: ' + error.message);
    }
  };

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div>
        {appointments.length === 0 && <p>No appointments found.</p>}
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.profilePicture} alt={item.docData.name} />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-netural-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address?.line1 || ''}</p>
              <p className='text-xs'>{item.docData.address?.line2 || ''}</p>
              <p className='text-xs mt-1'>
                <span className='text-sm text-netural-700 font-medium'>Date & Time: </span>
                {item.slotDate} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.payment ? (
                <button onClick={() => handlePayment(item)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border border-gray-300 rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>
              ) : (
                <p className='text-sm text-green-500 text-center sm:min-w-48 py-2'>Paid</p>
              )}
              <button
                className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border border-gray-300 rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                onClick={async () => {
                  if (window.confirm('Are you sure you want to cancel this appointment?')) {
                    try {
                      const response = await fetch(`${backendUrl}/api/user/cancel-appointment`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          token,
                        },
                        body: JSON.stringify({ appointmentId: item._id, userId: item.userId }),
                      });
                      const data = await response.json();

                      if (data.success) {
                        setAppointments(prev => prev.filter(app => app._id !== item._id));
                        alert('Appointment cancelled successfully');
                      } else {
                        alert('Failed to cancel appointment: ' + data.message);
                      }
                    } catch (error) {
                      alert('Error cancelling appointment: ' + error.message);
                    }
                  }
                }}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments
