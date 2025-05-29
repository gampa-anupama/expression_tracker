import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, User, Calendar, ClipboardList, ChevronLeft, Menu } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
const ParentSideNavbar = forwardRef((props, ref) => {   

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
  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname === path + '/';
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, default to closed
        setIsOpen(false);
        setIsVisible(false);
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      // Short delay before hiding content to prevent flash during transition
      setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the transition duration
    }
  }, [location.pathname, isMobile]);

  // Handle visibility changes for smooth transitions
  useEffect(() => {
    if (isOpen) {
      // Show the content immediately when opening
      setIsVisible(true);
    } else if (!isOpen) {
      // Delay hiding content until after transition completes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      // When opening, make content visible immediately
      setIsVisible(true);
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Sidebar with improved transitions */}
      <div
        className={`fixed top-0 left-0 z-40 h-full bg-white shadow-lg transition-all duration-300 ${
          isOpen 
            ? "translate-x-0" 
            : "translate-x-[-100%]"
        } ${
          isOpen ? "w-64" : "w-0"
        } pt-16 overflow-hidden`}
      >
        {/* Only render content when it should be visible */}
        {isVisible && (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#ab1c1c]">Parent Portal</h2>
            </div>

            <nav className="mt-6 w-64"> {/* Fixed width to prevent content shrinking */}
              <ul className="space-y-2 px-2">
                <li>
                  <Link
                    to="/parentdashboard"
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive("/parentdashboard")
                        ? "bg-red-50 text-[#ab1c1c] font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <User size={18} className="mr-3" />
                    <span>Dashboard</span>
                    {isActive("/parentdashboard") && (
                      <ChevronRight size={18} className="ml-auto" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parentdashboard/bookappointment"
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive("/parentdashboard/bookappointment")
                        ? "bg-red-50 text-[#ab1c1c] font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <Calendar size={18} className="mr-3" />
                    <span>Book Appointment</span>
                    {isActive("/parentdashboard/bookappointment") && (
                      <ChevronRight size={18} className="ml-auto" />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parentdashboard/viewappointments"
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive("/parentdashboard/viewappointments")
                        ? "bg-red-50 text-[#ab1c1c] font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <ClipboardList size={18} className="mr-3" />
                    <span>View Appointments</span>
                    {isActive("/parentdashboard/viewappointments") && (
                      <ChevronRight size={18} className="ml-auto" />
                    )}
                  </Link>
                </li>
              </ul>
            </nav>
          </>
        )}
      </div>

      {/* Toggle button - different styles for mobile vs desktop */}
      <button
        onClick={handleToggle}
        className={`fixed z-40 bg-[#ab1c1c] text-white shadow-md transition-all duration-300 ${
          isMobile 
            ? `top-16 ${isOpen ? "left-64" : "left-0"}` 
            : `top-20 ${isOpen ? "left-64" : "left-0"}`
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

export default ParentSideNavbar;