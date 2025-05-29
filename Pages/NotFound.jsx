import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const NotFound = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-9xl font-extrabold text-[#ab1c1c] opacity-20">
              404
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          We're sorry, the page you're looking for doesn't exist or has been
          moved.
        </p>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#ab1c1c] mb-3">
              You might want to:
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">
                  Double check the URL for typos
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">
                  Go back to the previous page
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="text-gray-700">
                  Visit our homepage to start fresh
                </span>
              </li>
              {/* <li className="flex items-start">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span className="text-gray-700">
                Contact support if you believe this is an error
              </span>
            </li> */}
            </ul>
          </div>
        </div>

        <div className="mt-8">
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
        </div>
      </div>
    </div>
  );
};

export default NotFound;
