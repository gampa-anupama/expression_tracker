import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../Components/Loader.jsx";

export default function ChildDetailsParent() {
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/parents/child/${childId}`, {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });
        setChild(response.data);
        setEditedInfo(response.data);
        localStorage.setItem("centreId", response.data.centreId);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log("Error fetching child details:", error);
      }
    };

    if (childId) {
      fetchChildDetails();
    }
  }, [childId]);

  // Function to calculate age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      setEditedInfo(child);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      await axios.put(
        `/api/parents/edit-child-details/${childId}`,
        editedInfo,
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );
      setChild(editedInfo);
      setIsEditing(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error updating child information:", error);
      alert("Failed to update information. Please try again.");
    }
  };

  const schoolBoardOptions = [
    "CBSE",
    "SSC",
    "ICSE",
    "Camebridge (IB)",
    "NIOS",
    "Others",
    "",
  ];

  if (isLoading) return <Loader />;
  if (!child)
    return <div className="text-center py-10 mt-16">Child not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container  mx-auto px-4 py-6 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-[#ab1c1c] ps-6">
            {child.name}'s Details
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/parentdashboard/iepreports/${childId}`)}
              className="bg-blue-500 text-white px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2 rounded-md shadow hover:bg-[#8e1818] transition"
            >
              IEP Reports
            </button>
            <button
              onClick={() => navigate(`/parentdashboard/reports?childId=${childId}`)}
              className="bg-yellow-600 text-white px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2 rounded-md shadow hover:bg-[#8e1818] transition"
            >
              Game Reports
            </button>
            <button
              onClick={() =>
                navigate(`/parentdashboard/bookappointment?childId=${childId}`)
              }
              className="bg-purple-600 text-white px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2 rounded-md shadow hover:bg-[#8e1818] transition"
            >
              Book Appointment
            </button>

            <button
              onClick={handleEditToggle}
              className={`${
                isEditing
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-slate-600 hover:bg-[#8e1818]"
              } text-white px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2 rounded-md shadow transition`}
            >
              {isEditing ? "Cancel" : "Edit Information"}
            </button>
            {isEditing && (
              <button
                onClick={handleSaveChanges}
                className="bg-green-600 text-white px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2 rounded-md shadow hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="font-semibold text-[#ab1c1c] mb-3">
                Personal Information
              </h3>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editedInfo.name || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:py-3 sm:px-4 focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c] transition duration-150 ease-in-out"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={
                          editedInfo.dob
                            ? new Date(editedInfo.dob)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:py-3 sm:px-4 focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c] transition duration-150 ease-in-out"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={editedInfo.gender || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:py-3 sm:px-4 focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c] transition duration-150 ease-in-out appearance-none bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="font-medium">Name:</span> {child.name}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span>{" "}
                      {calculateAge(child.dob)} years
                    </p>
                    <p>
                      <span className="font-medium">Date of Birth:</span>{" "}
                      {formatDate(child.dob)}
                    </p>
                    <p>
                      <span className="font-medium">Gender:</span>{" "}
                      {child.gender}
                    </p>
                    <p>
                      <span className="font-medium">Admit Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          child.admitStatus === "active"
                            ? "bg-green-100 text-green-800"
                            : child.admitStatus === "inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {child.admitStatus.charAt(0).toUpperCase() +
                          child.admitStatus.slice(1)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Centre name:</span>{" "}
                      {child.centreId.name}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="font-semibold text-[#ab1c1c] mb-3">
                Education Information
              </h3>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Name
                      </label>
                      <input
                        type="text"
                        name="schoolName"
                        value={editedInfo.schoolName || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:py-3 sm:px-4 focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c] transition duration-150 ease-in-out"
                        placeholder="Enter school name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Board
                      </label>
                      <select
                        name="schoolBoard"
                        value={editedInfo.schoolBoard || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:py-3 sm:px-4 focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c] transition duration-150 ease-in-out appearance-none bg-white"
                      >
                        <option value="">Select School Board</option>
                        {schoolBoardOptions.map(
                          (board, index) =>
                            board && (
                              <option key={index} value={board}>
                                {board}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="font-medium">School Name:</span>{" "}
                      {child.schoolName || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">School Board:</span>{" "}
                      {child.schoolBoard || "Not specified"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="font-semibold text-[#ab1c1c] mb-3">
                Associated Professionals
              </h3>
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Doctor:</span>{" "}
                  {child?.doctorId?.name || "Not assigned"}
                </p>
                <p>
                  <span className="font-medium">Therapist:</span>{" "}
                  {child?.therapistId?.name || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="font-semibold text-[#ab1c1c] mb-3">Records</h3>
              <div className="space-y-3">
                <p>
                  <span className="font-medium">IEPs:</span>{" "}
                  {child.IEPs?.length || 0} records
                </p>
                <p>
                  <span className="font-medium">Prescription Reports:</span>{" "}
                  {child.prescriptionReports?.length || 0} records
                </p>
                <p>
                  <span className="font-medium">Appointments:</span>{" "}
                  {child.appointments?.length || 0} records
                </p>
                <p>
                  <span className="font-medium">Game Reports:</span>{" "}
                  {child.gameReports?.length || 0} records
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/parentdashboard")}
              className="bg-gray-500 text-white px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2 rounded-md shadow hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
