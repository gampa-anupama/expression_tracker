import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addPropery, logout } from "../Components/redux/authSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem(`${role}Id`);

    try {
      setLoading(true);
      const response = await axios.get(`/api/data/allUsers/${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setUser(response.data);
      setEditedUser(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If currently editing, cancel and reset form
      setEditedUser(user);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSaveChanges = async () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem(`${role}Id`);

    try {
      const response = await axios.put(
        `/api/data/updateUser/${userId}`,
        editedUser,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      setUser(response.data);
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
      dispatch(addPropery({ key: "name", value: response.data.name }));
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile", "error");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem(`${role}Id`);

    try {
      await axios.put(
        `/api/data/changePassword/${userId}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast(
        "Password changed successfully! \n You will be redirected to Login page",
        "success"
      );
      setTimeout(() => {
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem(role + "Id");
        dispatch(logout());
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      showToast(
        error.response?.data?.message || "Failed to change password",
        "error"
      );
    }
  };

  const showToast = (message, type) => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "info":
        toast.info(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      default:
        toast(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 m-20 border-red-800"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-[#ab1c1c]">User not found</h1>
          <p className="mt-2 text-gray-600">Please try logging in again</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818] transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#ab1c1c] px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
            <p className="mt-2 text-red-100">
              Hello, {user.username || "User"}!
            </p>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="bg-red-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#ab1c1c]">
                  Personal Information
                </h2>
                <button
                  onClick={handleEditToggle}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isEditing
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "bg-[#ab1c1c] hover:bg-[#8e1818]"
                  } transition duration-300`}
                >
                  {isEditing ? "Cancel" : "Edit Information"}
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="w-32 font-medium text-gray-600">Name:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name || ""}
                      onChange={handleInputChange}
                      className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    />
                  ) : (
                    <span className="mt-1 md:mt-0 text-gray-800">
                      {user.name || "Not provided"}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="w-32 font-medium text-gray-600">Email:</span>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email || ""}
                      onChange={handleInputChange}
                      className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    />
                  ) : (
                    <span className="mt-1 md:mt-0 text-gray-800">
                      {user.email || "Not provided"}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="w-32 font-medium text-gray-600">Phone:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mobilenumber"
                      value={editedUser.mobilenumber || ""}
                      onChange={handleInputChange}
                      className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    />
                  ) : (
                    <span className="mt-1 md:mt-0 text-gray-800">
                      {user.mobilenumber || "Not provided"}
                    </span>
                  )}
                </div>

                {/* Address */}
                {user.role === "parent" ? (
                  <div className="flex flex-col md:flex-row md:items-center">
                    <span className="w-32 font-medium text-gray-600">
                      Address:
                    </span>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={editedUser.address || ""}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 md:mt-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                      />
                    ) : (
                      <span className="mt-1 md:mt-0 text-gray-800">
                        {user.address || "Not provided"}
                      </span>
                    )}
                  </div>
                ) : null}

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSaveChanges}
                      className="px-6 py-2 bg-[#8e1818] text-white rounded-lg hover:bg-red-700 transition duration-300"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Management */}
            <div className="bg-red-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-[#ab1c1c] mb-6">
                Password Management
              </h2>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-6 py-3 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818] transition duration-300 w-full md:w-1/2"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#ab1c1c] mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818] transition duration-300"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
