import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import Loader from "../../Components/Loader";

const JWLEnquiries = () => {
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isArchivedView, setIsArchivedView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });
  const navigate = useNavigate();

  const center = sessionStorage.getItem("centerId");

  const fetchUsers = async () => {
    try {
      const center = sessionStorage.getItem("centreId");
      const response = await axios.get(
        `/api/admins/get-jwl-enquiries/${center}`,
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );
      const fetchedUsers = response.data;
      setUsers(fetchedUsers);
      setActiveUsers(fetchedUsers.filter((user) => !user.isArchived));
      setArchivedUsers(fetchedUsers.filter((user) => user.isArchived));
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
      console.error(err);
    }
  };
  useEffect(() => {

    fetchUsers();
  }, [center]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredUsers = (isArchivedView ? archivedUsers : activeUsers).filter(
    (user) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        user.childName.toLowerCase().includes(searchLower) ||
        user.parentName.toLowerCase().includes(searchLower) ||
        user.parentEmail.toLowerCase().includes(searchLower) ||
        user.referenceId.toLowerCase().includes(searchLower);

      // If no date filter is set, return search matches
      if (!dateFilter.from && !dateFilter.to) {
        return matchesSearch;
      }

      const enquiryDate = parseISO(user.enquiryDate);
      const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
      const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

      // Adjust toDate to include the entire day
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
      }

      const matchesDate =
        (!fromDate || enquiryDate >= fromDate) &&
        (!toDate || enquiryDate <= toDate);

      return matchesSearch && matchesDate;
    }
  );

  const resetDateFilter = () => {
    setDateFilter({ from: "", to: "" });
  };

  const openUserDetails = (referenceId) => {
    navigate(`/admindashboard/jwlenquiries/${referenceId}`);
  };

  const archiveUser = async (parentEmail) => {
    try {
      await axios.put(
        `/api/admins/archive-jwl-enquiry`,
        { parentEmail },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );
      fetchUsers(); // Refresh the user list after archiving
    } catch (err) {
      console.error("Failed to archive user", err);
    }
  };

  if (loading) {
    return (
      <div className="mt-20">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className="mt-16">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {isArchivedView ? "Archived Users" : "Active Users"}
            </h1>
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-md font-medium transition duration-300 ${
                  !isArchivedView
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
                onClick={() => setIsArchivedView(false)}
              >
                Active
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition duration-300 ${
                  isArchivedView
                    ? "bg-[#ab1c1c] text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
                onClick={() => setIsArchivedView(true)}
              >
                Archived
              </button>
            </div>
          </div>

          {/* Search and Date Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/2 lg:w-2/5 relative">
              <input
                type="text"
                placeholder="Search by child name, parent name, email or reference ID"
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col sm:flex-row gap-2 items-end">
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="from"
                  value={dateFilter.from}
                  onChange={handleDateFilterChange}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                />
              </div>
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="to"
                  value={dateFilter.to}
                  onChange={handleDateFilterChange}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                />
              </div>
              <div className="w-full sm:w-1/3">
                <button
                  onClick={resetDateFilter}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Reset Dates
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-[#ab1c1c] text-white">
                    <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                      Reference ID
                    </th>
                    <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                      Child Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                      Parent Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                      Parent Phone
                    </th>
                    <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                      Parent Email
                    </th>
                    <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                      Enquiry Date
                    </th>
                    <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-red-50 transition duration-200"
                      >
                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-nowrap">
                            {user.referenceId}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-nowrap">
                            {user.childName}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-nowrap">
                            {user.parentName}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-nowrap">
                            {user.parentPhoneNo}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-nowrap">
                            {user.parentEmail}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-nowrap">
                            {format(parseISO(user.enquiryDate), "dd-MM-yyyy")}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm flex space-x-2">
                          <button
                            onClick={() => openUserDetails(user.referenceId)}
                            className="px-4 py-2 bg-purple-800 text-white rounded-md hover:bg-purple-600 transition duration-200"
                          >
                            Details
                          </button>
                          {!user.isArchived && (
                            <button
                              onClick={() => archiveUser(user.parentEmail)}
                              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                            >
                              Archive
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-5 border-b border-gray-200 text-sm text-center"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JWLEnquiries;
