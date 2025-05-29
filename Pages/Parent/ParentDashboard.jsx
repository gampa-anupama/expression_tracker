import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../Components/Loader.jsx";

export default function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/parents/children", {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });
        setChildren(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log("Error fetching children:", error);
      }
    };
    fetchChildren();
  }, []);

  const handleClick = (child) => {
    localStorage.setItem("centreId", child.centreId);
    navigate(`/parentdashboard/child/${child._id}`);
  };

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

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen bg-gray-50">
      <h1 className="text-center text-3xl font-bold text-[#ab1c1c] mt-6 mb-6">
        Parent Dashboard
      </h1>
      <div className="mt-4">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && <Loader />}
          {!isLoading && children.length === 0 && (
            <div className="col-span-full flex justify-center">
              <div className="bg-white border border-red-100 rounded-lg shadow-sm p-6 max-w-2xl w-full text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
                  <svg
                    className="h-6 w-6 text-[#ab1c1c]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Child Registration Required
                </h3>
                <p className="text-gray-600 mb-4">
                  Please schedule an appointment to complete your child's
                  registration process.
                </p>
                <button
                  onClick={() => navigate("/parentdashboard/bookappointment")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ab1c1c] hover:bg-[#8e1818] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ab1c1c]"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          )}
          {!isLoading &&
            children.map((child, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-4 m-2 cursor-pointer hover:shadow-lg transition duration-200 border border-gray-200"
                onClick={() => handleClick(child)}
              >
                <h3 className="text-lg font-bold text-[#ab1c1c]">
                  {child.name}
                </h3>
                <p className="text-gray-600">
                  <strong>Age:</strong> {calculateAge(child.dob)} years
                </p>
                <p className="text-gray-600">
                  <strong>School:</strong> {child.schoolName || "Not specified"}
                </p>
                <div className="mt-2 text-right">
                  <span className="text-xs font-bold text-[#ab1c1c]">
                    Click for details
                  </span>
                </div>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}
