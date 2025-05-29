import React, { useEffect, useState } from "react";
import Loader from "../../Components/Loader";
import axios from "axios";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
import generatePDF from "../AppointmentDetails";
import ScrollToTop from "../../Components/ScrollTop";

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [formattedAppointments, setFormattedAppointments] = useState([]);
  const [filters, setFilters] = useState({
    child: "all",
    doctor: "all",
    status: "all",
    date: "",
  });
  const [parentName, setParetName] = useState("");
  const parentId = sessionStorage.getItem("parentId");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `/api/parents/getappointments/${parentId}`,
          { headers: { Authorization: `${sessionStorage.getItem("token")}` } }
        );
        // console.log(response.data.appointments);
        setAppointments(response.data.appointments);
        setParetName(response.data.parentName);
        setFilteredAppointments(response.data.appointments); // Initially show all appointments
        const formattedAppointments = response.data.appointments.map((appointment) => {
          const appointmentDate = new Date(appointment.appointmentDate);
          const birthDate = new Date(appointment.childId?.dob);
          const ageInMilliseconds = appointmentDate - birthDate;
          const ageInYears = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25));
        
          return {
            id: appointment._id,
            childName: appointment.childId?.name || 'Unknown',
            age: ageInYears,
            appointmentDate: appointmentDate,
            appointmentDateFormatted: appointmentDate.toLocaleDateString(),
            appointmentDateValue: appointmentDate.toISOString().split('T')[0],
            appointmentTime: appointment.appointmentTime || 'Not specified',
            consultationType: appointment.consultationType || 'Not specified',
            doctorName: appointment.doctorId?.name || 'Not assigned',
            doctorId: appointment.doctorId?._id || null,
            status: appointment.status || 'pending',
            centreName: appointment.centreId?.name || 'Not specified',
            parentName: response.data.parentName || 'Not specified'
          };
        
        });
            setFormattedAppointments(formattedAppointments);
            console.log(formattedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    
  }, [parentId]);

  useEffect(() => {
    let filtered = appointments;

    if (filters.child !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.childId.name === filters.child
      );
    }

    if (filters.doctor !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.doctorId.name === filters.doctor
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === filters.status
      );
    }

    if (filters.date) {
      filtered = filtered.filter((appointment) => {
        const appointmentDate = new Date(
          appointment.appointmentDate
        ).toLocaleDateString();
        return appointmentDate === new Date(filters.date).toLocaleDateString();
      });
    }

    setFilteredAppointments(filtered);
  }, [filters, appointments]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100  rounded-lg text-yellow-800";
      case "rejected":
        return "bg-red-100 rounded-lg text-red-800";
      case "approved":
        return "bg-green-200 rounded-lg  text-green-800";
      default:
        return "bg-gray-100 rounded-lg text-gray-800";
    }
  };

  // const generatePDF = (appointment, parentName) => {
  //   const doc = new jsPDF();

  //   doc.setFontSize(18);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Appointment Details", 70, 15);

  //   doc.setLineWidth(0.5);
  //   doc.rect(10, 20, 190, 120);

  //   doc.setFontSize(12);
  //   doc.setFont("helvetica", "normal");

  //   let y = 30;
  //   const lineSpacing = 10;

  //   doc.text(`Child Name: ${appointment.childId.name}`, 14, y);
  //   y += lineSpacing;
  //   doc.text(`Parent Name: ${parentName}`, 14, y);
  //   y += lineSpacing;
  //   doc.text(`Doctor Name: ${appointment.doctorId.name}`, 14, y);
  //   y += lineSpacing;
  //   doc.text(`Centre: ${appointment.centreId.name}`, 14, y);
  //   y += lineSpacing;
  //   doc.text(
  //     `Appointment Date: ${new Date(
  //       appointment.appointmentDate
  //     ).toLocaleDateString()}`,
  //     14,
  //     y
  //   );
  //   y += lineSpacing;
  //   doc.text(`Appointment Time: ${appointment.appointmentTime}`, 14, y);
  //   y += lineSpacing;
  //   doc.text(`Consultation Type: ${appointment.consultationType}`, 14, y);
  //   y += lineSpacing;
  //   doc.text(`Status: ${appointment.status}`, 14, y);
  //   y += lineSpacing;
  //   doc.text(`Referred By: ${appointment.referredBy || "N/A"}`, 14, y);
  //   y += lineSpacing;
  //   doc.text(`Child Concerns: ${appointment.childConcerns || "N/A"}`, 14, y);
  //   y += lineSpacing;

  //   if (appointment.prescription.trim()) {
  //     y += 10;
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Prescription:", 14, y);
  //     doc.setFont("helvetica", "normal");
  //     y += lineSpacing;
  //     doc.text(appointment.prescription, 14, y, { maxWidth: 180 });
  //   }

  //   if (appointment.previousMedicalReports.length > 0) {
  //     y += 15;
  //     doc.setFont("helvetica", "bold");
  //     doc.text("Previous Medical Reports:", 14, y);
  //     doc.setFont("helvetica", "normal");
  //     appointment.previousMedicalReports.forEach((report, index) => {
  //       doc.text(`- ${report}`, 14, y + lineSpacing + index * 10);
  //     });
  //   }

  //   const pdfBlob = doc.output("blob");
  //   const pdfUrl = URL.createObjectURL(pdfBlob);
  //   window.open(pdfUrl, "_blank");
  // };

  if (loading) {
    return (
      <div className="mt-16">
        <Loader />
      </div>
    );
  }

  const uniqueChildren = [
    
    ...new Set(appointments.map((appointment) => appointment.childId.name)),
  ];
  const uniqueDoctors = [
    ...new Set(appointments.map((appointment) => appointment.doctorId?.name)),
  ];

  return (
    <div className="container mx-auto p-4">
      <ScrollToTop />
      <h1 className="text-3xl text-center font-bold text-[#ab1c1c] mt-10 mb-10">
        Appointments
      </h1>
      <div className="flex flex-wrap justify-center mb-6 space-x-4">
        <div className="w-full sm:w-auto mb-4 sm:mb-0">
          <label className="block text-sm font-medium text-gray-700">
            Child
          </label>
          <select
            name="child"
            value={filters.child}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#ab1c1c] focus:border-[#ab1c1c] sm:text-sm rounded-md"
          >
            <option value="all">All</option>
            {uniqueChildren.map((child) => (
              <option key={child} value={child}>
                {child}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto mb-4 sm:mb-0">
          <label className="block text-sm font-medium text-gray-700">
            Doctor
          </label>
          <select
            name="doctor"
            value={filters.doctor}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#ab1c1c] focus:border-[#ab1c1c] sm:text-sm rounded-md"
          >
            <option value="all">All</option>
            {uniqueDoctors.map((doctor) => (
              <option key={doctor} value={doctor}>
                {doctor}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto mb-4 sm:mb-0">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#ab1c1c] focus:border-[#ab1c1c] sm:text-sm rounded-md"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="w-full sm:w-auto mb-4 sm:mb-0">
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#ab1c1c] focus:border-[#ab1c1c] sm:text-sm rounded-md"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-[#ab1c1c] text-white">
            <tr>
              <th className="px-4 py-2 border-b text-center">Child Name</th>
              <th className="px-4 py-2 border-b text-center">Doctor Name</th>
              <th className="px-4 py-2 border-b text-center">
                Appointment Date
              </th>
              <th className="px-4 py-2 border-b text-center">
                Appointment Time
              </th>
              <th className="px-4 py-2 border-b text-center">Status</th>
              <th className="px-4 py-2 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment,i) => (
              <tr key={appointment._id} className="hover:bg-red-50">
                <td className="px-4 py-2 border-b text-center">
                  {appointment.childId.name}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {appointment.doctorId?.name}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {appointment.appointmentTime}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <p className={getStatusColor(appointment.status)}>
                    {appointment.status[0].toUpperCase()}
                    {appointment.status.substring(1)}
                  </p>
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => generatePDF(formattedAppointments[i])}
                    className="text-[#ab1c1c] px-4 py-2 hover:text-[#8e1818] transition duration-300"
                  >
                    View PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAppointments;