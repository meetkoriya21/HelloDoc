  import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const BookAppointment = ({ docId, docInfo, onClose, slotDate, slotTime, onSuccess }) => {
  const { backendUrl, token } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    address: { line1: '', line2: '' },
    mobile: '',
    gender: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/get-profile`);
        if (data.success) {
          const user = data.userData;
          const currentYear = new Date().getFullYear();
          const birthYear = user.dob ? new Date(user.dob).getFullYear() : null;
          const age = birthYear ? currentYear - birthYear : '';

          setFormData({
            name: user.name || '',
            address: typeof user.address === 'object' && user.address ? user.address : { line1: user.address || '', line2: '' },
            mobile: user.phone || '',
            gender: user.gender || '',
            age: age
          });
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch profile');
      }
    };

    if (token) {
      fetchPatientProfile();
    }
  }, [backendUrl, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'line1' || name === 'line2') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.address.line1 || !formData.mobile || !formData.gender || !formData.age) {
      toast.error('All fields are required');
      return;
    }

    // Validate slot details
    if (!slotDate || !slotTime) {
      toast.error('Please select a date and time slot');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/book-appointment-form`, {
        docId,
        slotDate: slotDate,
        slotTime: slotTime,
        ...formData
      }, { headers: { token } });

      if (data.success) {
        toast.success('Appointment booked successfully');
        onClose();
        if (onSuccess) {
          onSuccess(slotDate, slotTime);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4">
        <h2 className="text-2xl font-semibold mb-4">Confirm Appointment</h2>

        {/* Doctor and Booking Details in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Doctor Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Doctor Details</h3>
            <p className="text-sm"><strong>Name:</strong> {docInfo?.name}</p>
            <p className="text-sm"><strong>Speciality:</strong> {docInfo?.speciality}</p>
            <p className="text-sm"><strong>Address:</strong> {typeof docInfo?.address === 'object' ? `${docInfo.address.line1}, ${docInfo.address.line2}` : docInfo?.address}</p>
          </div>

          {/* Booking Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Booking Details</h3>
            <p className="text-sm"><strong>Date:</strong> {slotDate}</p>
            <p className="text-sm"><strong>Time:</strong> {slotTime}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="line1"
              placeholder="Address Line 1"
              value={formData.address.line1}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
            <input
              type="text"
              name="line2"
              placeholder="Address Line 2"
              value={formData.address.line2}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile No</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
