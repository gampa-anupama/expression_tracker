import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Forbidden = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-9xl font-extrabold text-[#ab1c1c] opacity-20">
              403
            </span>
            <svg
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 text-[#ab1c1c]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m0 0v3m0-3h2m-2 0H9m3-3V8m0 0L9 4m6 4l-3-4m-3 4h6"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Access Forbidden
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Sorry, you don't have permission to access this page or resource.
        </p>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#ab1c1c] mb-3">
              This could be because:
            </h2>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-red-100 text-[#ab1c1c] flex items-center justify-center mr-2 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">
                  You need to log in to access this content
                </span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-red-100 text-[#ab1c1c] flex items-center justify-center mr-2 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">
                  Your account doesn't have the required permissions
                </span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-red-100 text-[#ab1c1c] flex items-center justify-center mr-2 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">
                  The content is restricted for security reasons
                </span>
              </li>
              <li className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-red-100 text-[#ab1c1c] flex items-center justify-center mr-2 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">
                  There may be an issue with your account status
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to={
              isAuthenticated
                ? `/${sessionStorage.getItem("role")}dashboard`
                : "/"
            }
            className="bg-[#ab1c1c] text-white px-6 py-3 rounded-md font-medium hover:bg-[#8e1818] transition duration-300 inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Return to {isAuthenticated ? `Dashboard` : "Homepage"}
          </Link>
          {/* <Link 
          to="/login" 
          className="border border-[#ab1c1c] text-[#ab1c1c] px-6 py-3 rounded-md font-medium hover:bg-red-50 transition duration-300 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Login
        </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
