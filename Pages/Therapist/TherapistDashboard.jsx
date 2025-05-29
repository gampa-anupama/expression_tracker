import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../Components/Loader";

export default function TherapistDashboard() {
  const [data, setData] = useState([]);
  const [childDetails, setChildDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setResponseText("Authentication token missing. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/therapists/assigned", {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (!response.data) {
          setResponseText("No data received from server");
          setLoading(false);
          return;
        }

        if (response.data.length === 0) {
          setResponseText("No Children Assigned");
          setLoading(false);
          return;
        }

        setResponseText("");
        setData(response.data);
        setFilteredData(response.data);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message || "Failed to fetch data");
        setResponseText("Error loading data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((child) =>
      child.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, data]);

  // Function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "Unknown";

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
    if (!dateString) return "Not specified";

    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const handleRowClick = (child) => {
    try {
      if (!child || !child._id) {
        console.error("Invalid child data:", child);
        return;
      }
      setIsModalOpen(true);
      setChildDetails(child);
    } catch (err) {
      console.error("Error in handleRowClick:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setChildDetails(null);
    sessionStorage.removeItem("childId");
  };

  const gotoReports = () => {
    console.log(childDetails);
    if (childDetails && childDetails._id) {
      sessionStorage.setItem("childId", childDetails._id);
      navigate(`/reports?childId=${childDetails._id}`);
    }
  };

  const gotoIEP = () => {
    if (childDetails && childDetails._id) {
      sessionStorage.setItem("childId", childDetails._id);
      navigate(`/therapistdashboard/iep?childId=${childDetails._id}`);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Safe rendering for child details that handles missing data
  const renderChildDetails = () => {
    if (!childDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#ab1c1c]">
                {childDetails.name || "Child"}'s Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#ab1c1c] mb-2">
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {childDetails.name || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Age:</span>{" "}
                    {calculateAge(childDetails.dob)} years
                  </p>
                  <p>
                    <span className="font-medium">Date of Birth:</span>{" "}
                    {formatDate(childDetails.dob)}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {childDetails.gender || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        childDetails.admitStatus === "active"
                          ? "bg-green-100 text-green-800"
                          : childDetails.admitStatus === "inactive"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {childDetails.admitStatus
                        ? childDetails.admitStatus.charAt(0).toUpperCase() +
                          childDetails.admitStatus.slice(1)
                        : "Pending"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#ab1c1c] mb-2">
                  Education Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">School Name:</span>{" "}
                    {childDetails.schoolName || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">School Board:</span>{" "}
                    {childDetails.schoolBoard || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Centre Number:</span>{" "}
                    {childDetails.centreId.name || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#ab1c1c] mb-2">
                  Associated Professionals
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Doctor ID:</span>{" "}
                    {childDetails.doctorId.name || "Not assigned"}
                  </p>
                  <p>
                    <span className="font-medium">Therapist ID:</span>{" "}
                    {childDetails.therapistId.name || "Not assigned"}
                  </p>
                  <p>
                    <span className="font-medium">Parent ID:</span>{" "}
                    {childDetails.parentId.name || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#ab1c1c] mb-2">Records</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">IEPs:</span>{" "}
                    {(childDetails.IEPs && childDetails.IEPs.length) || 0}{" "}
                    records
                  </p>
                  <p>
                    <span className="font-medium">Prescription Reports:</span>{" "}
                    {(childDetails.prescriptionReports &&
                      childDetails.prescriptionReports.length) ||
                      0}{" "}
                    records
                  </p>
                  <p>
                    <span className="font-medium">Appointments:</span>{" "}
                    {(childDetails.appointments &&
                      childDetails.appointments.length) ||
                      0}{" "}
                    records
                  </p>
                  <p>
                    <span className="font-medium">Game Reports:</span>{" "}
                    {(childDetails.gameReports &&
                      childDetails.gameReports.length) ||
                      0}{" "}
                    records
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={gotoIEP}
                className="bg-[#ab1c1c] text-white px-4 py-2 rounded-md shadow hover:bg-[#8e1818] transition"
              >
                IEP
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem("childId", childDetails._id);
                  localStorage.setItem(
                    "therapistId",
                    childDetails.therapistId._id
                  );
                  navigate("/facedetection");
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
              >
                Play Games
              </button>
              <button
                onClick={gotoReports}
                className="bg-[#8e1818] text-white px-4 py-2 rounded-md shadow hover:bg-red-700 transition"
              >
                Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto mt-20 px-4">
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-3xl font-bold text-[#ab1c1c] flex-grow-1 text-center">
          Therapist Dashboard
        </h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 sm:p-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : responseText ? (
        <h3 className="text-center text-gray-500 text-xl">{responseText}</h3>
      ) : null}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Table */}
      {data && data.length > 0 && !loading && !responseText && (
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto mb-6">
          <table className="min-w-full">
            <thead className="bg-[#ab1c1c] text-white">
              <tr>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Name</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">
                  Date of Birth
                </th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Age</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Gender</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">IEP</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Games</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-200">
              {currentItems.map((child, index) => (
                <tr
                  key={child._id || `item-${index}`}
                  className="hover:bg-red-50 transition duration-200 cursor-pointer"
                  onClick={() => handleRowClick(child)}
                >
                  <td className="py-2 px-4 sm:py-4 sm:px-6">
                    {child.name || "Unnamed Child"}
                  </td>
                  <td className="py-2 px-4 sm:py-4 sm:px-6">
                    {formatDate(child.dob)}
                  </td>
                  <td className="py-2 px-4 sm:py-4 sm:px-6">
                    {calculateAge(child.dob)} years
                  </td>
                  <td className="py-2 px-4 sm:py-4 sm:px-6">
                    {child.gender || "Not specified"}
                  </td>
                  <td className="py-2 px-4 sm:py-4 sm:px-6">
                    <button
                      className="text-[#ab1c1c] hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        sessionStorage.setItem("childId", child._id);
                        sessionStorage.setItem("childName", child.name);
                        navigate(
                          `/therapistdashboard/iep?childId=${child._id}`
                        );
                      }}
                    >
                      View
                    </button>
                  </td>
                  <td className="py-2 px-4 sm:py-4 sm:px-6">
                    <button
                      className="text-green-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        localStorage.setItem("childId", child._id);
                        localStorage.setItem(
                          "therapistId",
                          child.therapistId._id
                        );
                        navigate("/facedetection");
                      }}
                    >
                      Play
                    </button>
                  </td>
                  <td className="py-2 px-4 sm:py-4 sm:px-6">
                    <button
                      className="text-[#8e1818] hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        sessionStorage.setItem("childId", child._id);
                        navigate(`/reports?childId=${child._id}`);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredData.length > itemsPerPage && !loading && !responseText && (
        <div className="flex justify-center mt-4 sm:mt-6">
          {Array.from(
            { length: Math.ceil(filteredData.length / itemsPerPage) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base ${
                  currentPage === i + 1
                    ? "bg-[#ab1c1c] text-white"
                    : "bg-red-200 text-[#ab1c1c] hover:bg-red-300"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      )}

      {/* Child Details Modal */}
      {isModalOpen && childDetails && renderChildDetails()}
    </div>
  );
}
