import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../Components/Loader";
import generateAppointmentPDF from '../AppointmentDetails';
import { FiDownload } from "react-icons/fi";
// Time slots available for appointments
const TIME_SLOTS = [
  '10:30 AM', '11:30 AM', '12:30 PM', '2:00 PM', '3:00 PM', '3:30 PM', '4:30 PM', '5:30 PM'
];

export default function AppointmentsTable() {
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    doctorName: '',
    status: '',
    date: '',
  });
  const [filteredData, setFilteredData] = useState([]);

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [editStep, setEditStep] = useState(1); // 1: select date, 2: select time, 3: confirm

  // State for prescription upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const fileInputRef = useRef(null);
  const [unprocessedData, setUnprocessedData] = useState([]);
  useEffect(() => {
    const fetchAppointments = async () => {
      const centreId = sessionStorage.getItem("centreId");
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/admins/getAppointments/${centreId}`,
          {
            headers: {
              Authorization: `${sessionStorage.getItem("token")}`,
            },
          }
        );
        setUnprocessedData(response.data);
        console.log(response.data);
        const processedData = response.data.map(appointment => {
          const childDob = appointment.childId?.dob ? new Date(appointment.childId.dob) : null;
          const today = new Date();

          const ageInYears = childDob ?
            Math.floor((today - childDob) / (365.25 * 24 * 60 * 60 * 1000)) :
            'N/A';

          const appointmentDate = appointment.appointmentDate ?
            new Date(appointment.appointmentDate) :
            new Date();

          return {
            id: appointment._id,
            childName: appointment.childId?.name || 'Unknown',
            age: ageInYears,
            appointmentDate: appointmentDate,
            appointmentDateFormatted: appointmentDate.toLocaleDateString(),
            appointmentDateValue: appointmentDate.toISOString().split('T')[0],
            appointmentTime: appointment.appointmentTime || 'Not specified',
            consultationType: appointment.consultationType || 'Not specified',
            doctorName: appointment.doctorId?.name || 'Not assigned',
            doctorId: appointment.doctorId?._id || null,
            status: appointment.status || 'pending',
            centreName: appointment.centreId?.name || 'Not specified',
            parentName: appointment.childId?.parentId?.name || 'Not specified',
            prescription: appointment.prescription || null // Add this line
          };
        });

        setAppointmentsData(processedData);
        setFilteredData(processedData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    let result = [...appointmentsData];

    if (filters.doctorName) {
      result = result.filter(item =>
        item.doctorName.toLowerCase().includes(filters.doctorName.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(item => item.status === filters.status);
    }

    if (filters.date) {
      const filterDate = new Date(filters.date);
      result = result.filter(item => {
        return (
          item.appointmentDate.getFullYear() === filterDate.getFullYear() &&
          item.appointmentDate.getMonth() === filterDate.getMonth() &&
          item.appointmentDate.getDate() === filterDate.getDate()
        );
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [filters, appointmentsData]);

  const uniqueDoctors = [...new Set(appointmentsData
    .filter(item => item.doctorName !== 'Not assigned')
    .map(item => item.doctorName))];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      doctorName: '',
      status: '',
      date: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getConsultationTypeBadge = (type) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-md";

    switch (type) {
      case "New Consultation":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Assessment(IQ)":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Open edit modal and initialize with current appointment data
  const openEditModal = (appointment) => {
    setCurrentAppointment(appointment);
    setEditDate(appointment.appointmentDateValue);
    setEditTime(appointment.appointmentTime);
    setIsEditModalOpen(true);
    setEditStep(1);
  };

  // Close edit modal and reset state
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentAppointment(null);
    setEditDate('');
    setEditTime('');
    setAvailableSlots([]);
    setLoadingSlots(false);
  };

  // Handle date selection in edit modal
  const handleDateSelect = async () => {
    if (!editDate || !currentAppointment?.doctorId) return;

    try {
      setLoadingSlots(true);
      const response = await axios.get(
        `/api/admins/getBookedSlots/${currentAppointment.doctorId}/${editDate}`,
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );

      const bookedSlots = response.data.bookedSlots || [];
      // Filter out already booked slots and show available ones
      const slots = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(slots);

      // If current time is still available, keep it selected
      if (slots.includes(currentAppointment.appointmentTime)) {
        setEditTime(currentAppointment.appointmentTime);
      } else {
        setEditTime(slots[0] || '');
      }

      setEditStep(2);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      toast.error("Failed to fetch available time slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle form submission to update appointment
  const handleUpdateAppointment = async () => {
    if (!currentAppointment || !editDate || !editTime) return;

    try {
      const response = await axios.put(
        `/api/admins/updateAppointment/${currentAppointment.id}`,
        {
          appointmentDate: editDate,
          appointmentTime: editTime
        },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Appointment updated successfully");

      // Update the local state to reflect changes
      const updatedAppointments = appointmentsData.map(app => {
        if (app.id === currentAppointment.id) {
          const newDate = new Date(editDate);
          return {
            ...app,
            appointmentDate: newDate,
            appointmentDateFormatted: newDate.toLocaleDateString(),
            appointmentDateValue: editDate,
            appointmentTime: editTime
          };
        }
        return app;
      });

      setAppointmentsData(updatedAppointments);
      closeEditModal();
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment");
    }
  };

  // Open prescription upload modal
  const openUploadModal = (appointment) => {
    setCurrentAppointment(appointment);
    setPrescriptionFile(null);
    setIsUploadModalOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Close prescription upload modal
  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setCurrentAppointment(null);
    setPrescriptionFile(null);
  };

  // Handle prescription file change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setPrescriptionFile(e.target.files[0]);
    }
  };

  // Handle prescription upload
  const handleUploadPrescription = async () => {
    if (!currentAppointment || !prescriptionFile) return;

    try {
      setUploadingPrescription(true);

      const formData = new FormData();
      formData.append('prescription', prescriptionFile);
      formData.append('appointmentId', currentAppointment.id);

      const response = await axios.post(
        `/api/admins/uploadPrescription`, // Adjust this URL
        formData,
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      toast.success("Prescription uploaded successfully");

      // Update the local state
      const updatedAppointments = appointmentsData.map(app => {
        if (app.id === currentAppointment.id) {
          return {
            ...app,
            prescription: response.data.appointment.prescription
          };
        }
        return app;
      });

      setAppointmentsData(updatedAppointments);
      closeUploadModal();
    } catch (error) {
      console.error("Error uploading prescription:", error);
      toast.error("Failed to upload prescription");
    } finally {
      setUploadingPrescription(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  console.log(filteredData);
  console.log(currentItems);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl">
      {/* Edit Appointment Modal */}
      {isEditModalOpen && currentAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#ab1c1c] mb-4">
                {editStep === 1 && "Select New Date"}
                {editStep === 2 && "Select Time Slot"}
                {editStep === 3 && "Confirm Changes"}
              </h3>

              {editStep === 1 && (
                <div>
                  <div className="mb-4">
                    <label htmlFor="editDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      id="editDate"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDateSelect}
                      disabled={!editDate}
                      className={`px-4 py-2 rounded-lg ${!editDate ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#ab1c1c] text-white hover:bg-[#8a1717]'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {editStep === 2 && (
                <div>
                  {loadingSlots ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Time Slots for {new Date(editDate).toLocaleDateString()}
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2">
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => setEditTime(slot)}
                                className={`p-2 rounded-md border ${editTime === slot ? 'bg-[#ab1c1c] text-white' : 'bg-white hover:bg-gray-100'}`}
                              >
                                {slot}
                              </button>
                            ))
                          ) : (
                            <div className="col-span-2 text-center py-4 text-gray-500">
                              No available slots for this date
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between space-x-3 mt-6">
                        <button
                          onClick={() => setEditStep(1)}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setEditStep(3)}
                          disabled={!editTime}
                          className={`px-4 py-2 rounded-lg ${!editTime ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#ab1c1c] text-white hover:bg-[#8a1717]'}`}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {editStep === 3 && (
                <div>
                  <div className="mb-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Child Name</h4>
                      <p className="text-lg">{currentAppointment.childName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Doctor</h4>
                      <p className="text-lg">{currentAppointment.doctorName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Current Date</h4>
                        <p className="text-lg">{currentAppointment.appointmentDateFormatted}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">New Date</h4>
                        <p className="text-lg">{new Date(editDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Current Time</h4>
                        <p className="text-lg">{currentAppointment.appointmentTime}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">New Time</h4>
                        <p className="text-lg">{editTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between space-x-3 mt-6">
                    <button
                      onClick={() => setEditStep(2)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleUpdateAppointment}
                      className="px-4 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8a1717]"
                    >
                      Confirm Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prescription Upload Modal */}
      {isUploadModalOpen && currentAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#ab1c1c] mb-4">Upload Prescription</h3>

              <div className="mb-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Child Name</h4>
                  <p className="text-lg">{currentAppointment.childName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Doctor</h4>
                  <p className="text-lg">{currentAppointment.doctorName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Appointment Date</h4>
                  <p className="text-lg">{currentAppointment.appointmentDateFormatted}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Appointment Time</h4>
                  <p className="text-lg">{currentAppointment.appointmentTime}</p>
                </div>

                <div className="mt-4">
                  <label htmlFor="prescriptionFile" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Prescription File
                  </label>
                  <input
                    type="file"
                    id="prescriptionFile"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-red-50 file:text-[#ab1c1c]
                      hover:file:bg-red-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Accepted formats: PDF, JPG, JPEG, PNG
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeUploadModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  disabled={uploadingPrescription}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadPrescription}
                  disabled={!prescriptionFile || uploadingPrescription}
                  className={`px-4 py-2 rounded-lg flex items-center ${!prescriptionFile || uploadingPrescription
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#ab1c1c] text-white hover:bg-[#8a1717]'
                    }`}
                >
                  {uploadingPrescription && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {uploadingPrescription ? 'Uploading...' : 'Upload Prescription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Content */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#ab1c1c]">Appointments</h2>
          <p className="text-gray-600 mt-1">
            <span>{filteredData.length} appointments found</span>
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-red-200">
          <p className="text-sm font-medium text-[#ab1c1c]">Today's Date</p>
          <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString("en-GB")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-red-200">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="doctorName" className="block text-sm font-medium text-[#ab1c1c] mb-1">Doctor</label>
            <select
              id="doctorName"
              name="doctorName"
              value={filters.doctorName}
              onChange={handleFilterChange}
              className="w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
            >
              <option value="">All Doctors</option>
              {uniqueDoctors.map(doctor => (
                <option key={doctor} value={doctor}>{doctor}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-[#ab1c1c] mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-[#ab1c1c] mb-1">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="bg-red-100 hover:bg-red-200 text-[#ab1c1c] px-4 py-2 rounded-lg transition-colors duration-150 border border-red-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-red-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-red-200">
            <thead className="bg-[#ab1c1c] text-white">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-medium uppercase tracking-wider">Child Name</th>
                <th className="py-4 px-6 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                <th className="py-4 px-6 text-left text-xs font-medium uppercase tracking-wider">Consultation Type</th>
                <th className="py-4 px-6 text-left text-xs font-medium uppercase tracking-wider">Doctor</th>
                <th className="py-4 px-6 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-red-200">
              {currentItems.length > 0 ? (
                currentItems.map((appointment, index) => (
                  <tr key={appointment.id} className={`hover:bg-red-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-red-50'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{appointment.childName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-900">
                        {appointment.appointmentDateFormatted}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-900">
                        {appointment.appointmentTime}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={getConsultationTypeBadge(appointment.consultationType)}>
                        {appointment.consultationType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {appointment.doctorName !== 'Not assigned' ? appointment.doctorName : (
                            <span className="text-gray-500 italic">Not assigned</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(appointment)}
                          className="text-xs px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                        >
                          Reschedule
                        </button>

                        {appointment.status === "approved" && (
                          <>
                            {appointment.prescription ? (
                              <a
                                className="text-xs px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition font-medium"
                                href={`https://totalapi.joywithlearning.com/api/admins/get-prescription/${appointment.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Prescription
                              </a>
                            ) : (
                              <button
                                onClick={() => openUploadModal(appointment)}
                                className="text-xs px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                              >
                                Upload Prescription
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => generateAppointmentPDF(appointment)}
                          className="text-xs px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                          title="Download Appointment PDF"
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 px-6 text-center text-gray-500">
                    No appointments found with the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > itemsPerPage && (
          <div className="px-6 py-4 bg-gray-50 border-t border-red-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span> results
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm rounded-md ${currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#ab1c1c] hover:bg-red-50 border border-red-300"
                    }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-4 py-2 text-sm rounded-md ${currentPage === number
                      ? "bg-[#ab1c1c] text-white"
                      : "bg-white text-[#ab1c1c] hover:bg-red-50 border border-red-300"
                      }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm rounded-md ${currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-[#ab1c1c] hover:bg-red-50 border border-red-300"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {appointmentsData.length === 0 && (
          <div className="py-12 px-6 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">There are no appointments in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}