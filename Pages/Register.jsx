import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import ScrollToTop from "../Components/ScrollTop";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    username: "",
    password: "",
    confirmPassword: "",
    address: "",
    otp: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [existingUsernames, setExistingUsernames] = useState([]);
  const [existingEmails, setExistingEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleClearForm = () => {
    setFormData({
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      username: "",
      password: "",
      confirmPassword: "",
      address: "",
      otp: "",
    });
    setFormErrors({});
    setFormSubmitted(false);
    setOtpSent(false);
    setOtpVerified(false);
  };

  useEffect(() => {
    const fetchUsernames = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/users/allusers");
        if (response.data.success) {
          const usernames = response.data.users.map((user) => user.username);
          setExistingUsernames(usernames);
          const emails = response.data.users.map((user) => user.email);
          setExistingEmails(emails);
        }
      } catch (error) {
        console.error("Error fetching usernames:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsernames();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate parent name
    if (!formData.parentName.trim()) {
      errors.parentName = "Parent name is required";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.parentEmail.trim()) {
      errors.parentEmail = "Email is required";
    } else if (!emailRegex.test(formData.parentEmail)) {
      errors.parentEmail = "Please enter a valid email address";
    } else if (existingEmails.includes(formData.parentEmail)) {
      errors.parentEmail = "";
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!formData.parentPhone.trim()) {
      errors.parentPhone = "Phone number is required";
    } else if (!phoneRegex.test(formData.parentPhone)) {
      errors.parentPhone = "Please enter a valid 10-digit phone number";
    }

    // Validate username
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 5) {
      errors.username = "Username must be at least 5 characters";
    } else if (existingUsernames.includes(formData.username)) {
      errors.username = "";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain at least one number";
    } else if (!/[@$]/.test(formData.password)) {
      errors.password =
        "Password must contain at least one special character (@ or $)";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Validate address
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    return errors;
  };

  const handleSendOtp = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const response = await axios.post("/api/users/send-otp", {
          otpEmail: formData.parentEmail,
        });
        if (response.data.success) {
          toast.success("OTP sent to your email!", { autoClose: 2000 });
          setOtpSent(true);
        } else {
          toast.error(response.data.message, { autoClose: 2000 });
        }
      } catch (error) {
        toast.error("Error sending OTP. Please try again.", {
          autoClose: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please fill the form correctly.", { autoClose: 2000 });
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      toast.error("Please enter the OTP.", { autoClose: 2000 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/users/verify-otp", {
        email: formData.parentEmail,
        otp: formData.otp,
      });

      if (response.data.success) {
        setOtpVerified(true);
        toast.success("OTP verified successfully!", { autoClose: 2000 });
        await handleRegistration(response.data.token);
      } else {
        toast.error(response.data.message, { autoClose: 2000 });
      }
    } catch (error) {
      toast.error("Error verifying OTP. Please try again.", {
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (verifyToken) => {
    try {
      const response = await axios.post("/api/users/parentRegister", formData, {
        headers: {
          Authorization: `${verifyToken}`,
        },
      });
      if (response.data.success) {
        setFormSubmitted(true);
        toast.success("Registration Successful! Redirecting to login...", {
          autoClose: 2000,
        });
        setTimeout(() => navigate("/login"), 5000);
      } else {
        toast.error("Registration failed. Please try again.", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("Error during registration. Please try again.", {
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Updated header with red color scheme */}
          <div className="bg-[#ab1c1c] px-6 py-8 text-white">
            <h2 className="text-3xl font-bold text-center">
              Create Your Account
            </h2>
            <p className="mt-2 text-center text-red-100">
              Register to book appointments and access our services
            </p>
          </div>

          {formSubmitted ? (
            <>
              <ScrollToTop />
              <div className="p-8 text-center">
                <div className="mb-6 mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#ab1c1c]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Thank you for registering with us. You can now log in to your
                  account.
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-[#ab1c1c] hover:bg-[#8e1818] text-white font-medium py-3 px-6 rounded-md transition duration-300"
                >
                  Go to Login
                </Link>
              </div>
            </>
          ) : (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Name */}
                <div>
                  <label
                    htmlFor="parentName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Parent Name <span className="text-[#ab1c1c]">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      formErrors.parentName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-transparent`}
                    placeholder="Enter name"
                  />
                  {formErrors.parentName && (
                    <p className="mt-1 text-sm text-[#ab1c1c]">
                      {formErrors.parentName}
                    </p>
                  )}
                </div>

                {/* Parent Email */}
                <div>
                  <label
                    htmlFor="parentEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Parent Email <span className="text-[#ab1c1c]">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    id="parentEmail"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      formErrors.parentEmail
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-transparent`}
                    placeholder="Enter email"
                  />
                  {formErrors.parentEmail && (
                    <p className="mt-1 text-sm text-[#ab1c1c]">
                      {formErrors.parentEmail}
                    </p>
                  )}
                  {existingEmails.includes(formData.parentEmail) && (
                    <p className="mt-1 text-sm text-[#ab1c1c]">
                      User with this email already exists
                    </p>
                  )}
                </div>

                {/* Parent Phone */}
                <div>
                  <label
                    htmlFor="parentPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Parent Phone Number{" "}
                    <span className="text-[#ab1c1c]">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      formErrors.parentPhone
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-transparent`}
                    placeholder="10-digit mobile number"
                  />
                  {formErrors.parentPhone && (
                    <p className="mt-1 text-sm text-[#ab1c1c]">
                      {formErrors.parentPhone}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username (Must be at least 5 characters){" "}
                    <span className="text-[#ab1c1c]">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      formErrors.username ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-transparent`}
                    placeholder="Choose a unique username"
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-[#ab1c1c]">
                      {formErrors.username}
                    </p>
                  )}
                  {existingUsernames.includes(formData.username) && (
                    <p className="mt-1 text-sm text-[#ab1c1c]">
                      Username already taken
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password <span className="text-[#ab1c1c]">*</span>
                  </label>

                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.password
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-transparent pr-10`}
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {formErrors.password && (
                    <p className="mt-1 text-sm text-[#ab1c1c]">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div className="bg-red-50 rounded-md p-3 mb-2 border border-red-100">
                  <p className="text-xs text-gray-600 flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-[#ab1c1c] mr-1 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Password must be at least 8 characters long, contain at
                    least one uppercase letter, one lowercase letter, one
                    number, and at least one special character (@ or $).
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password <span className="text-[#ab1c1c]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-transparent pr-10`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-[#ab1c1c]">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address <span className="text-[#ab1c1c]">*</span>
                </label>
                <textarea
                  required
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 border ${
                    formErrors.address ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-transparent`}
                  placeholder="Enter your complete address"
                />
                {formErrors.address && (
                  <p className="mt-1 text-sm text-[#ab1c1c]">
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* OTP Field */}
              {otpSent && (
                <div>
                  <div className="bg-red-50 rounded-md p-3 mb-2 border border-red-100 flex items-center ">
                    <p className="text-xs text-gray-600 flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-[#ab1c1c] mr-1 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Please enter OTP — valid for 5 mins.
                    </p>
                  </div>
          
                  <input
                    required
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-transparent"
                    placeholder="Enter OTP *"
                  />
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="text-[#ab1c1c]">*</span> Required fields
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
                  >
                    Clear
                  </button>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-6 py-2 bg-[#ab1c1c] text-white rounded-md hover:bg-[#8e1818] transition duration-300 flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP to email"
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-6 py-2 bg-[#ab1c1c] text-white rounded-md hover:bg-[#8e1818] transition duration-300 flex items-center"
                      disabled={isLoading || otpVerified}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verifying OTP...
                        </>
                      ) : (
                        "Verify OTP and Submit"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center mt-6 border-t border-gray-200 pt-4">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#ab1c1c] font-medium hover:text-[#8e1818]"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
