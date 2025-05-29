import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../Components/redux/authSlice";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Loader from "../Components/Loader";
import { Helmet } from "react-helmet";

export default function Login() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/users/login", formData);
      if (response.data.success) {
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("role", response.data.role);
        sessionStorage.setItem(
          `${response.data.role}Id`,
          jwtDecode(response.data.token).user._id
        );
        dispatch(
          login({
            token: response.data.token,
            role: response.data.role,
            details: jwtDecode(response.data.token).user,
          })
        );
        toast.success("Login Successful", { autoClose: 2000 });
        navigate(`/${response.data.role}dashboard`);
      } else {
        setLoading(false);
        toast.error("Could not find Username", { autoClose: 2000 });
      }
    } catch (error) {
      setLoading(false);
      toast.error("Invalid Credentials", { autoClose: 2000 });
    }
  };

  return (
    <div className="px-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Helmet>
        <title>Login | Total Solution for Learning</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Login to access your personalized therapy and learning dashboard at Total Solution for Learning." />
        <link rel="canonical" href="https://totalsolutionforlearning.org/login" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Login",
              "url": "https://totalsolutionforlearning.org/login"
            }),
          }}
        ></script>

      </Helmet>


      <div className="flex items-center justify-center py-12">
        <ToastContainer />
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#ab1c1c]">Welcome Back</h1>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-base font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="relative block w-full px-4 py-2 mt-1 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c] transition-all duration-200"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] focus:border-[#ab1c1c] transition-all duration-200"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-[#ab1c1c] focus:outline-none transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {!loading ? (
                <button
                  type="submit"
                  className="relative flex justify-center w-full px-4 py-3 text-base font-medium text-white bg-[#ab1c1c] border border-transparent rounded-lg group hover:bg-[#8e1818] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ab1c1c] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign in
                </button>
              ) : (
                <Loader />
              )}
            </div>

            <div className="text-center font-medium text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#ab1c1c] hover:text-[#8e1818] hover:underline transition-colors duration-200"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
