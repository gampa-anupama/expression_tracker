import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, Menu, Home, UserPlus, Calendar, ClipboardList, Mail } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";

const AdminSideNavbar = forwardRef((props, ref) => {   
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    props.onStateChange?.({ isOpen, isMobile });
  }, [isOpen, isMobile]);

  useImperativeHandle(ref, () => ({
    getMobile: () => isMobile,
    getIsOpen: () => isOpen,
  }));

  const isActive = (path) => {
    
    return location.pathname === path || location.pathname === path + '/';
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        setIsOpen(false);
        setIsVisible(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else if (!isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      setIsVisible(true);
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 h-full bg-white shadow-lg transition-all duration-300 ${
          isOpen ? "translate-x-0 w-64" : "translate-x-[-100%] w-0"
        } pt-16 overflow-hidden`}
      >
        {isVisible && (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#ab1c1c]">Admin Portal</h2>
            </div>

            <nav className="mt-6 w-64">
              <ul className="space-y-2 px-2">
                <li>
                  <Link
                    to="/admindashboard"
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive("/admindashboard")
                        ? "bg-red-50 text-[#ab1c1c] font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <Home size={18} className="mr-3" />
                    <span>Dashboard</span>
                    {isActive("/admindashboard") && (
                      <ChevronRight size={18} className="ml-auto" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admindashboard/register"
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive("/admindashboard/register")
                        ? "bg-red-50 text-[#ab1c1c] font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <UserPlus size={18} className="mr-3" />
                    <span>Register</span>
                    {isActive("/admindashboard/register") && (
                      <ChevronRight size={18} className="ml-auto" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admindashboard/viewappointment"
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive("/admindashboard/viewappointment")
                        ? "bg-red-50 text-[#ab1c1c] font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <Calendar size={18} className="mr-3" />
                    <span>View Appointments</span>
                    {isActive("/admindashboard/viewappointment") && (
                      <ChevronRight size={18} className="ml-auto" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admindashboard/manageappointment"
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive("/admindashboard/manageappointment")
                        ? "bg-red-50 text-[#ab1c1c] font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <ClipboardList size={18} className="mr-3" />
                    <span>Manage Appointments</span>
                    {isActive("/admindashboard/manageappointment") && (
                      <ChevronRight size={18} className="ml-auto" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admindashboard/jwlenquiries"
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive("/admindashboard/jwlenquiries")
                        ? "bg-red-50 text-[#ab1c1c] font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <Mail size={18} className="mr-3" />
                    <span>JWL Enquiries</span>
                    {isActive("/admindashboard/jwlenquiries") && (
                      <ChevronRight size={18} className="ml-auto" />
                    )}
                  </Link>
                </li>
              </ul>
            </nav>
          </>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className={`fixed z-40 bg-[#ab1c1c] text-white shadow-md transition-all duration-300 ${
          isMobile ? `top-16 ${isOpen ? "left-64" : "left-0"}` : `top-20 ${isOpen ? "left-64" : "left-0"}`
        }`}
        style={{
          borderRadius: '0 50% 50% 0',
          width: '28px',
          height: '48px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        aria-label="Toggle navigation"
      >
        {isOpen ? 
          <ChevronLeft size={20} /> : 
          (isMobile ? <ChevronRight size={20} /> : <Menu size={20} />)
        }
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
});

export default AdminSideNavbar;