import React, { useRef, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ParentSideNavbar from "./ParentSideNavbar";
import ParentDashboard from "./ParentDashboard";
import BookAppointment from "./Appointment";
import ViewAppointments from "./ViewAppointments";
import ChildDetailsParent from "./ChildDetailsParent";
import GameReports from "../Reports";
import IEPReports from "./IEPReports";
export default function ParentWrapper() {
  const parentSideNavbarRef = useRef();

  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  
  useEffect(() => {
    if (parentSideNavbarRef.current) {
      setIsMobile(parentSideNavbarRef.current.getMobile());
      setIsOpen(parentSideNavbarRef.current.getIsOpen());
    }
  }, []); // Only runs after first render, when ref is assigned

  return (
    <div className=" min-h-screen bg-gray-50">
      {/* Side Navbar - always visible for all parent routes */}
      <ParentSideNavbar ref={parentSideNavbarRef}  
      onStateChange={({ isMobile, isOpen }) => {
        setIsMobile(isMobile);
        setIsOpen(isOpen);
      }}
      />

      {/* Main Content Area - responsive margin */}
      <div className={`transition-all duration-300 ${!isMobile && isOpen ? "ml-64" : ""}`}>
        {/* <div className="container px-4 py-6 pt-16 lg:pt-6"> */}
          <Routes>
            <Route path="/" element={<ParentDashboard />} />
            <Route path="/bookappointment" element={<BookAppointment />} />
            <Route path="/viewappointments" element={<ViewAppointments />} />
            <Route path="/child/:childId" element={<ChildDetailsParent />} />
            <Route path="/reports" element={<GameReports />} />
            <Route path="/iepreports/:childId" element={<IEPReports />} />
            <Route path="*" element={<Navigate to="/parentdashboard" replace />} />
          </Routes>
        {/* </div> */}
      </div>
    </div>
  );
}
