import React, { useRef, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminSideNavbar from "./AdminSideNavbar";
import AdminDashboard from "./AdminDashboard";
import AdminRegister from "./AdminRegister";
import ViewAppointments from "./AdminViewAppointment";
import ManageAppointments from "./AdminManageAppointments";
import JWLEnquiries from "./JWLEnquiries";
import JWLEnquiryDetails from "./JWLEnquiryDetails";
import ChildDetails from "./ChildDetails";
import AdminIEPReports from "./AdminIEPReports";
import AdminAppointment from "./AdminAppointment";
export default function AdminWrapper() {
  const adminSideNavbarRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (adminSideNavbarRef.current) {
      setIsMobile(adminSideNavbarRef.current.getMobile());
      setIsOpen(adminSideNavbarRef.current.getIsOpen());
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navbar - always visible for all admin routes */}
      <AdminSideNavbar
        ref={adminSideNavbarRef}
        onStateChange={({ isMobile, isOpen }) => {
          setIsMobile(isMobile);
          setIsOpen(isOpen);
        }}
      />

      {/* Main Content Area - responsive margin */}
      <div
        className={`transition-all duration-300 ${
          !isMobile && isOpen ? "ml-64" : ""
        }`}
      >
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/register" element={<AdminRegister />} />
          <Route path="/viewappointment" element={<ViewAppointments />} />
          <Route path="/manageappointment" element={<ManageAppointments />} />
          <Route path="/jwlenquiries" element={<JWLEnquiries />} />
          <Route
            path="/jwlenquiries/:referenceId"
            element={<JWLEnquiryDetails />}
          />
          <Route path="/child/:childId" element={<ChildDetails />} />
          <Route
            path="/appointment"
            element={<AdminAppointment />}
          />
          <Route path="/iepreports/:childId" element={<AdminIEPReports />} />
          <Route path="*" element={<Navigate to="/admindashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}
