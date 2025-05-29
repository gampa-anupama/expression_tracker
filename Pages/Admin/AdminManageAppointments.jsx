import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../../Components/Loader";

const AdminManageAppointments = () => {
  const centreId = sessionStorage.getItem("centreId");

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    if (centreId) {
      fetchAppointments();
    }
  }, [centreId]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/admins/getPendingAppointments/${centreId}`,
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );
      setAppointments(response.data);
      setFilteredAppointments(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await axios.put(
        `/api/admins/manageAppointment/${appointmentId}`,
        { status },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(
        (app) =>
          app.childId?.name?.toLowerCase().includes(query) ||
          app.childId?.parentName?.toLowerCase().includes(query)
      );
      setFilteredAppointments(filtered);
    }
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (!centreId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Centre ID is missing in the URL parameters
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-[#ab1c1c] mb-6 text-center">
        Pending Appointments
      </h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by child or parent name..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
        />
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#ab1c1c]">
            Loading appointments...
            <Loader/>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-red-200">
                <thead className="bg-[#ab1c1c] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-red-200">
                  {currentAppointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {searchQuery
                          ? "No matching appointments found"
                          : "No pending appointments"}
                      </td>
                    </tr>
                  ) : (
                    currentAppointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-red-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.childId?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.childId?.parentId.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.doctorId?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              appointment.appointmentDate
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.appointmentTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.consultationType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleStatusChange(appointment._id, "approved")
                              }
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded flex items-center justify-center w-10 h-10"
                              title="Approve"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment._id, "rejected")
                              }
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center w-10 h-10"
                              title="Reject"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-red-50 px-4 py-3 flex items-center justify-between border-t border-red-200">
                <div>
                  <p className="text-sm text-[#ab1c1c]">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span> •{" "}
                    <span className="font-medium">
                      {filteredAppointments.length}
                    </span>{" "}
                    total
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-red-300 rounded text-[#ab1c1c] disabled:opacity-50 hover:bg-red-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-red-300 rounded text-[#ab1c1c] disabled:opacity-50 hover:bg-red-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminManageAppointments;
