import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ScrollToTop from "../../Components/ScrollTop";

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
    name: "",
    mobilenumber: "",
    email: "",
    address: "",
    childName: "",
    childDob: "",
    childGender: "",
    childSchoolName: "",
    childSchoolBoard: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [addingChild, setAddingChild] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.mobilenumber)
      newErrors.mobilenumber = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobilenumber))
      newErrors.mobilenumber = "Mobile number must be 10 digits";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.role) newErrors.role = "Role is required";

    if (formData.role === "parent" && !formData.address)
      newErrors.address = "Address is required";

    // Validate child fields if adding a child
    if (formData.role === "parent" && addingChild) {
      if (!formData.childName) newErrors.childName = "Child name is required";
      if (!formData.childDob) newErrors.childDob = "Date of birth is required";
      if (!formData.childGender) newErrors.childGender = "Gender is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      const centreId = sessionStorage.getItem("centreId");
      if (!centreId) {
        toast.error("Centre ID not found in session storage");
        setIsSubmitting(false);
        return;
      }

      // Prepare registration data based on role
      let registrationData;
      console.log("Form data:", formData);

      if (formData.role === "parent") {
        registrationData = {
          username: formData.username,
          password: formData.password,
          role: "parent",
          name: formData.name,
          mobilenumber: formData.mobilenumber,
          email: formData.email,
          address: formData.address,
          centreId: centreId,
          childData: addingChild
            ? {
                name: formData.childName,
                dob: formData.childDob,
                gender: formData.childGender,
                schoolName: formData.childSchoolName || "",
                schoolBoard: formData.childSchoolBoard || "",
                centreId: centreId,
              }
            : null,
        };
      } else if (formData.role === "therapist") {
        registrationData = {
          username: formData.username,
          password: formData.password,
          role: "therapist",
          name: formData.name,
          mobilenumber: formData.mobilenumber,
          email: formData.email,
          centreId: centreId,
        };
      } else if (formData.role === "doctor") {
        registrationData = {
          username: formData.username,
          password: formData.password,
          role: "doctor",
          name: formData.name,
          mobilenumber: formData.mobilenumber,
          email: formData.email,
          centreId: centreId,
        };
      }

      // Make a single API call to /register
      const response = await axios.post(
        "/api/admins/register",
        registrationData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );

      // Handle success
      toast.success("Registration successful!");
      setRegistrationSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === "parent") {
      return (
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.address ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
              placeholder="Full address"
              rows="3"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-[#ab1c1c]">
                Child Information
              </h3>
              <button
                type="button"
                onClick={() => setAddingChild((prevState) => !prevState)}
                className="text-sm text-[#ab1c1c] hover:text-[#8e1818] flex items-center"
              >
                {addingChild ? "Skip for now" : "Add child"}
              </button>
            </div>

            {addingChild && (
              <div >
                <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child's Name *
                    </label>
                    <input
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.childName ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                      placeholder="Child's Full Name"
                    />
                    {errors.childName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.childName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="childDob"
                      value={formData.childDob}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.childDob ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                    />
                    {errors.childDob && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.childDob}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="childGender"
                    value={formData.childGender}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors.childGender ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] bg-white`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                  {errors.childGender && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.childGender}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name
                    </label>
                    <input
                      type="text"
                      name="childSchoolName"
                      value={formData.childSchoolName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      placeholder="School Name (Optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Board
                    </label>
                    <select
                      name="childSchoolBoard"
                      value={formData.childSchoolBoard}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] bg-white"
                    >
                      <option value="">Select Board (Optional)</option>
                      <option value="CBSE">CBSE</option>
                      <option value="SSC">SSC</option>
                      <option value="ICSE">ICSE</option>
                      <option value="Cambridge (IB)">Cambridge (IB)</option>
                      <option value="NIOS">NIOS</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <ScrollToTop />
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-red-100">
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-xl font-medium text-gray-900">
              Registration Successful!
            </h3>
            <p className="mt-2 text-gray-600">
              Your account has been created successfully.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setRegistrationSuccess(false);
                  setFormData({
                    username: "",
                    password: "",
                    confirmPassword: "",
                    role: "",
                    name: "",
                    mobilenumber: "",
                    email: "",
                    address: "",
                    childName: "",
                    childDob: "",
                    childGender: "",
                    childSchoolName: "",
                    childSchoolBoard: "",
                  });
                  setAddingChild(false);
                }}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ab1c1c] hover:bg-[#8e1818] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ab1c1c]"
              >
                Register Another Account
              </button>
            </div>
            <div className="mt-3">
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ab1c1c]"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-xl overflow-hidden mb-20 border-2 border-red-800">
        <div className="px-6 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#ab1c1c] mb-2">
              Create account for a User
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Fill in the details to register
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                  placeholder="Username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                  placeholder="Full Name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                  placeholder="Email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobilenumber"
                  value={formData.mobilenumber}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.mobilenumber ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                  placeholder="Mobile Number"
                />
                {errors.mobilenumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mobilenumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.role ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] bg-white`}
                >
                  <option value="">Select Role</option>
                  <option value="parent">Parent</option>
                  <option value="therapist">Therapist</option>
                  <option value="doctor">Doctor</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                )}
              </div>
            </div>

            {formData.role && renderRoleSpecificFields()}
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]`}
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                  >
                    {confirmPasswordVisible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div
                className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{errors.submit}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-[#8e1818] cursor-not-allowed"
                    : "bg-[#ab1c1c] hover:bg-[#8e1818] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ab1c1c]"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Processing...
                  </div>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Requirements */}
        {(formData.password || formData.confirmPassword) && (
          <div className="mt-4 max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden border border-red-100">
            <div className="px-6 py-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Password Requirements:
              </h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li
                  className={
                    formData.password.length >= 6 ? "text-green-600" : ""
                  }
                >
                  At least 6 characters long
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  At least one uppercase letter
                </li>
                <li
                  className={
                    /[a-z]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  At least one lowercase letter
                </li>
                <li
                  className={
                    /[0-9]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  At least one number
                </li>
                <li
                  className={
                    /[^A-Za-z0-9]/.test(formData.password)
                      ? "text-green-600"
                      : ""
                  }
                >
                  At least one special character
                </li>
                <li
                  className={
                    formData.password === formData.confirmPassword &&
                    formData.password
                      ? "text-green-600"
                      : ""
                  }
                >
                  Passwords match
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
