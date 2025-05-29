import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../Components/Loader/";

const DoctorViewAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments from the backend
  useEffect(() => {
    const fetchAppointments = async () => {
      const doctorId = sessionStorage.getItem("doctorId");

      if (!doctorId) {
        setError("Doctor ID not found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `/api/doctors/getAppointments/${doctorId}`,
          {
            headers: {
              Authorization: `${sessionStorage.getItem("token")}`,
            },
          }
        );
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch appointments");
        setLoading(false);
        console.error(err);
      }
    };

    fetchAppointments();
  }, []);

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "pending":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "rejected":
  //       return "bg-red-100 text-red-800";
  //     case "completed":
  //       return "bg-green-100 text-green-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className=" p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#ab1c1c] text-center mb-8">
          Completed Appointments
        </h1>
        {appointments.length === 0 ? (
          <div className="text-center text-gray-600">
            No completed appointments found.
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-[#ab1c1c] text-white">
                  <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                    Consultation Type
                  </th>
                  <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                    Child Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-red-500 text-left text-sm font-semibold uppercase tracking-wider">
                    Centre
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="hover:bg-red-50 transition duration-200"
                  >
                    <td className="px-5 py-5 border-b border-red-200 text-sm">
                      <p className="text-[#ab1c1c] whitespace-nowrap">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-red-200 text-sm">
                      <p className="text-[#ab1c1c] whitespace-nowrap">
                        {appointment.appointmentTime}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-red-200 text-sm">
                      <p className="text-[#ab1c1c] whitespace-nowrap">
                        {appointment.consultationType}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-red-200 text-sm">
                      <p className="text-[#ab1c1c] whitespace-nowrap">
                        {appointment.childId?.name || "N/A"}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-red-200 text-sm">
                      <p className="text-[#ab1c1c] whitespace-nowrap">
                        {appointment.centreId?.name || "N/A"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorViewAppointment;
