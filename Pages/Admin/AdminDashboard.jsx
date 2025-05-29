import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const decodedToken = jwtDecode(token);
        sessionStorage.setItem("centreId", decodedToken.user.centreId);
        const response = await axios.get(
          `/api/data/allChildren/${decodedToken.user.centreId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setChildren(response.data);
        setFilteredChildren(response.data);
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response
          ? `Error: ${err.response.status} - ${err.response.statusText}`
          : err.message;
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Apply filters whenever search term or status filter changes
  useEffect(() => {
    filterChildren();
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, children]);

  const filterChildren = () => {
    let result = [...children];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((child) => child.admitStatus === statusFilter);
    }

    // Apply search term filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(
        (child) =>
          child.name.toLowerCase().includes(lowercasedTerm) ||
          (child.parentName &&
            child.parentName.toLowerCase().includes(lowercasedTerm)) ||
          (child.schoolName &&
            child.schoolName.toLowerCase().includes(lowercasedTerm))
      );
    }

    setFilteredChildren(result);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChildren.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredChildren.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleViewDetails = (child) => {
    navigate(`/admindashboard/child/${child._id}`, {
      state: { childData: child },
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
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

  const handleReports = (child) => {
    navigate(`/admindashboard/iepreports/${child._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ab1c1c]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-[#ab1c1c] text-white rounded hover:bg-[#8e1818]"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 mb-16  min-h-screen">
      <div className="justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#ab1c1c] ps-3">Children</h1>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
              placeholder="Search by name, parent name, or school..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status Filter
            </label>
            <select
              id="statusFilter"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="itemsPerPage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Items per Page
            </label>
            <select
              id="itemsPerPage"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Showing {filteredChildren.length === 0 ? 0 : indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, filteredChildren.length)} of{" "}
          {filteredChildren.length} records
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#ab1c1c]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Age/Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  School Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Added On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  IEP Reports
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((child) => (
                  <tr key={child._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {child.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateAge(child.dob)} years
                      </div>
                      <div className="text-sm text-gray-500">
                        {child.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {child.schoolName || "Not enrolled"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {child.schoolBoard || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={child.admitStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(child.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                        onClick={() => handleReports(child)}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
                        onClick={() => handleViewDetails(child)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pageNumbers.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-gray-50">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {pageNumbers.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === number
                      ? "bg-[#ab1c1c] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === pageNumbers.length}
                className="px-4 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
