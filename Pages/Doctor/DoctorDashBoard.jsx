import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function DoctorDashBoard() {
  const [children, setChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const getChildren = async () => {
      try {
        const res = await axios.get("/api/doctors/assigned", {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });
        if (res.data.length === 0) {
          setMessage("No children assigned");
        }
        setChildren(res.data);
        setFilteredChildren(res.data);
      } catch (error) {
        toast.error("Error fetching children");
      }
    };

    getChildren();
  }, []);

  const handleNavigate = () => {
    navigate("/doctordashboard/viewappointment");
  };

  useEffect(() => {
    const filtered = children.filter((child) =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChildren(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, children]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChildren.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAssignIEP = async (
    childId,
    therapistName,
    childName,
    centreName
  ) => {
    sessionStorage.setItem("childId", childId);
    sessionStorage.setItem("therapistName", therapistName);
    sessionStorage.setItem("childName", childName);
    sessionStorage.setItem("centreName", centreName);
    navigate("/doctordashboard/iepdoctor");
  };

  return (
    <div className="p-4 sm:p-6">
      <ToastContainer />
      <div
        className="max-w-7xl mx-auto 
                sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12
            "
      >
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#ab1c1c]">
            Doctor Dashboard
          </h1>
          <button
            className="bg-[#ab1c1c] text-white px-2 py-2 rounded-lg hover:bg-[#8e1818]"
            onClick={handleNavigate}
          >
            Appointments
          </button>
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#ab1c1c] text-white">
              <tr>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Name</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">
                  Date of Birth
                </th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Gender</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Centre</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">IEP</th>
                <th className="py-2 px-4 sm:py-3 sm:px-6 text-left">Game Reports</th>
              </tr>
            </thead>
            {!message ? (
              <tbody className="divide-y divide-red-200">
                {currentItems.map((child, index) => (
                  <tr
                    key={index}
                    className="hover:bg-red-50 transition duration-200"
                  >
                    <td className="py-2 px-4 sm:py-4 sm:px-6">{child.name}</td>
                    <td className="py-2 px-4 sm:py-4 sm:px-6">
                      {new Date(child.dob).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-4 sm:py-4 sm:px-6">
                      {child.gender}
                    </td>
                    <td className="py-2 px-4 sm:py-4 sm:px-6">
                      {child.centreId.name}
                    </td>
                    <td className="py-2 px-4 sm:py-4 sm:px-6">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600"
                        onClick={() =>
                          handleAssignIEP(
                            child._id,
                            child.therapistId.name,
                            child.name,
                            child.centreId.name
                          )
                        }
                      >
                        Assign/View
                      </button>
                    </td>
                    <td className="py-2 px-4 sm:py-4 sm:px-6">
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700"
                        onClick={() =>
                          navigate(`/reports?childId=${child._id}`)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No children assigned
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 sm:mt-6">
          {Array.from(
            { length: Math.ceil(filteredChildren.length / itemsPerPage) },
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
      </div>
    </div>
  );
}
