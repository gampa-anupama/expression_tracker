import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function ChildDetails() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const location = useLocation();
  const [selectedChild, setSelectedChild] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [error, setError] = useState(null);

  // If child data is passed through location state, use it
  useEffect(() => {
    if (location.state && location.state.childData) {
      setSelectedChild(location.state.childData);
      setSelectedDoctor(location.state.childData.doctorId || "");
      setSelectedTherapist(location.state.childData.therapistId || "");
      setLoading(false);
      fetchStaff();
    } else {
      // If no data is passed, fetch the child data by ID
      fetchChildData();
    }
  }, [childId, location.state]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(`/api/data/child/${childId}`, {
        headers: {
          Authorization: token,
        },
      });

      setSelectedChild(response.data);
      setSelectedDoctor(response.data.doctorId || "");
      setSelectedTherapist(response.data.therapistId || "");
      setLoading(false);
      fetchStaff();
    } catch (err) {
      const errorMessage = err.response
        ? `Error: ${err.response.status} - ${err.response.statusText}`
        : err.message;
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const decodedToken = jwtDecode(token);
      const doctorsResponse = await axios.get(
        `/api/data/allDoctors/${decodedToken.user.centreId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      const therapistsResponse = await axios.get(
        `/api/data/allTherapists/${decodedToken.user.centreId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setDoctors(doctorsResponse.data.doctors);
      setTherapists(therapistsResponse.data.therapists);
      setLoadingStaff(false);
    } catch (err) {
      const errorMessage = err.response
        ? `Error: ${err.response.status} - ${err.response.statusText}`
        : err.message;
      setError(errorMessage);
      setLoadingStaff(false);
    }
  };

  const handleAssignStaff = async () => {
    try {
      setSavingChanges(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      await axios.put(
        `/api/admins/assign/${selectedChild._id}`,
        {
          doctorId: selectedDoctor,
          therapistId: selectedTherapist,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setSelectedChild({
        ...selectedChild,
        doctorId: selectedDoctor,
        therapistId: selectedTherapist,
      });

      setSavingChanges(false);
      alert("Staff assigned successfully!");
    } catch (err) {
      const errorMessage = err.response
        ? `Error: ${err.response.status} - ${err.response.statusText}`
        : err.message;
      setError(errorMessage);
      setSavingChanges(false);
      alert(`Failed to assign staff: ${errorMessage}`);
    }
  };

  const handleBookAppointment = () => {
    // e.preventDefault();
    navigate(`/admindashboard/appointment?childId=${selectedChild._id}`);
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-800 border-green-200";
        case "inactive":
          return "bg-red-100 text-red-800 border-red-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles()}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          onClick={() => navigate("/admindashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
        <p>Child data not found.</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => navigate("/admindashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 mt-16 max-w-7xl mx-auto">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Child Details</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 w-full sm:w-auto"
            onClick={handleBookAppointment}
          >
            Book Appointment
          </button>
          {/* <button
            className="px-4 py-2 bg-[#ab1c1c] text-white rounded-md hover:bg-[#8e1818] w-full sm:w-auto"
            onClick={() => {
              alert("Edit functionality to be implemented");
            }}
          >
            Edit Details
          </button> */}
        </div>
      </div>

      {/* Main Content - Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Information */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
            <h3 className="text-lg font-medium text-[#ab1c1c]">
              Personal Information
            </h3>
          </div>
          <div className="p-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Full Name</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.name}
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Date of Birth</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(selectedChild.dob)}
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Age</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {calculateAge(selectedChild.dob)} years
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">Gender</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.gender}
                </dd>
              </div>
              <div className="border-b sm:border-b-0 pb-2 sm:pb-0">
                <dt className="text-sm text-gray-500 mb-1">
                  Registration Date
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(selectedChild.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">Status</dt>
                <dd>
                  <StatusBadge status={selectedChild.admitStatus} />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* School Information */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
            <h3 className="text-lg font-medium text-[#ab1c1c]">
              School Information
            </h3>
          </div>
          <div className="p-4">
            <dl className="grid grid-cols-1 gap-4">
              <div className="border-b pb-2">
                <dt className="text-sm text-gray-500 mb-1">School Name</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.schoolName || "Not enrolled"}
                </dd>
              </div>
              <div className="border-b pb-2">
                <dt className="text-sm text-gray-500 mb-1">School Board</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.schoolBoard || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">Grade/Class</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedChild.grade || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
            <h3 className="text-lg font-medium text-[#ab1c1c]">
              Parent/Guardian Information
            </h3>
          </div>
          <div className="p-4">
            <dl className="grid grid-cols-1 gap-4">
              <div className="border-b pb-2">
                <dt className="text-sm text-gray-500 mb-1">
                  Parent/Guardian Name
                </dt>
                <dd className="text-sm font-medium text-gray-900 break-words">
                  {selectedChild.parentId && selectedChild.parentId.name
                    ? selectedChild.parentId.name
                    : "Not provided"}
                </dd>
              </div>
              <div className="border-b pb-2">
                <dt className="text-sm text-gray-500 mb-1">Contact Number</dt>
                <dd className="text-sm font-medium text-gray-900 break-words">
                  {selectedChild.parentId && selectedChild.parentId.mobilenumber
                    ? selectedChild.parentId.mobilenumber
                    : "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">Email Address</dt>
                <dd className="text-sm font-medium text-gray-900 break-words">
                  {selectedChild.parentId && selectedChild.parentId.email
                    ? selectedChild.parentId.email
                    : "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Staff Assignment */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-l-4 border-[#ab1c1c]">
            <h3 className="text-lg font-medium text-[#ab1c1c]">
              Staff Assignment
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Doctor
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  disabled={loadingStaff || savingChanges}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Therapist
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                  value={selectedTherapist}
                  onChange={(e) => setSelectedTherapist(e.target.value)}
                  disabled={loadingStaff || savingChanges}
                >
                  <option value="">Select Therapist</option>
                  {therapists.map((therapist) => (
                    <option key={therapist._id} value={therapist._id}>
                      {therapist.name} - {therapist.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <button
                  className="px-4 py-2 bg-[#ab1c1c] text-white rounded-md hover:bg-[#8e1818] disabled:bg-red-300 w-full sm:w-auto"
                  onClick={handleAssignStaff}
                  disabled={loadingStaff || savingChanges}
                >
                  {savingChanges ? "Saving..." : "Assign"}
                </button>
                {loadingStaff && (
                  <span className="ml-2 text-sm text-gray-500 block sm:inline mt-2 sm:mt-0">
                    Loading staff data...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Dashboard Button */}
      <div className="mt-8 flex justify-center sm:justify-start">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 w-full sm:w-auto max-w-xs"
          onClick={() => navigate("/admindashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
