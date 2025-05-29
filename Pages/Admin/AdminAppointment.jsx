import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import Loader from "../../Components/Loader";

export default function AdminAppointment() {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(useLocation().search);
  const centreChild = queryParams.get("childId");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [formState, setFormState] = useState({
    childName: "",
    childAge: "",
    parentName: "",
    parentId: null,
    email: "",
    dob: "",
    parentPhoneNo: "",
    appointmentDate: "",
    time: "",
    doctorId: "",
    schoolName: "",
    classGrade: "",
    schoolBoard: "",
    childConcerns: "",
    branch: "",
    gender: "",
    alternativeNumber: "",
    address: "",
    consultationType: "",
    referredBy: "",
  });

  // Time of day filter state
  const [timeOfDay, setTimeOfDay] = useState("morning");

  const [doctors, setDoctors] = useState([]);
  const [centres, setCentres] = useState([]);
  const [timeSlots, setTimeSlots] = useState({
    morning: ["10:30 AM", "11:30 AM", "12:30 PM"],
    afternoon: ["2:00 PM", "3:00 PM", "3:30 PM", "4:30 PM", "5:30 PM"],
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [pdf, setPDF] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Countdown effect for auto-navigation
  useEffect(() => {
    if (bookingSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [bookingSuccess, navigate]);

  const updateFormState = (key, value) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
  };

  const fetchCentres = async () => {
    try {
      const response = await axios.get("/api/data/allcentres", {
        headers: { Authorization: sessionStorage.getItem("token") },
      });
      setCentres(response.data);
    } catch (error) {
      toast.error("Failed to fetch centres");
    }
  };

  useEffect(() => {
    const fetchChildAndParentDetails = async () => {
      if (centreChild) {
        setIsLoading(true);
        try {
          const childResponse = await axios.get(`/api/data/${centreChild}`, {
            headers: { Authorization: sessionStorage.getItem("token") },
          });
          const childData = childResponse.data;

          let age = "";
          if (childData.dob) {
            const birthDate = new Date(childData.dob);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();

            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }

          setFormState((prevState) => ({
            ...prevState,
            childName: childData.name || "",
            childAge: age.toString(),
            dob: childData.dob
              ? new Date(childData.dob).toISOString().split("T")[0]
              : "",
            gender: childData.gender || "",
            schoolName: childData.schoolName || "",
            classGrade: childData.classGrade || "",
            schoolBoard: childData.schoolBoard || "",
            parentId: childData.parentId || null,
          }));

          if (childData.parentId) {
            const parentResponse = await axios.get(
              `/api/data/allUsers/${childData.parentId}`,
              {
                headers: { Authorization: sessionStorage.getItem("token") },
              }
            );
            const parentData = parentResponse.data;

            setFormState((prevState) => ({
              ...prevState,
              parentName: parentData.name || "",
              email: parentData.email || "",
              parentPhoneNo: parentData.mobilenumber || "",
              address: parentData.address || "",
              alternativeNumber: parentData.mobilenumber || "",
            }));
          }
        } catch (error) {
          toast.error("Failed to fetch child or parent details");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchChildAndParentDetails();
  }, [centreChild]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const centreId = sessionStorage.getItem("centreId");
        const response = await axios.get(`/api/data/alldoctors/${centreId}`, {
          headers: { Authorization: sessionStorage.getItem("token") },
        });
        setDoctors(response.data.doctors);
      } catch (error) {
        toast.error("Error fetching doctors");
      }
    };
    fetchCentres();
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (formState.doctorId && formState.appointmentDate) {
        try {
          const response = await axios.get(
            `/api/admins/getBookedSlots/${formState.doctorId}/${formState.appointmentDate}`,
            { headers: { Authorization: sessionStorage.getItem("token") } }
          );
          setBookedSlots(response.data.bookedSlots);
        } catch (error) {
          toast.error("Error fetching booked slots");
        }
      } else {
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [formState.doctorId, formState.appointmentDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonLoading(true);
    try {
      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (pdf) {
        formData.append("pdf", pdf);
      }

      formData.append("centreId", sessionStorage.getItem("centreId"));

      if (formState.parentId) {
        formData.append("parentId", formState.parentId);
      }

      await axios.post("/api/admins/bookAppointment", formData, {
        headers: {
          Authorization: sessionStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Appointment Details", 10, 10);
      doc.setFontSize(12);
      doc.text(`Child Name: ${formState.childName}`, 10, 20);
      doc.text(`Child Age: ${formState.childAge}`, 10, 30);
      doc.text(`Parent Name: ${formState.parentName}`, 10, 40);
      doc.text(`Parent Email: ${formState.email}`, 10, 50);
      doc.text(`Parent Phone Number: ${formState.parentPhoneNo}`, 10, 60);
      doc.text(`Appointment Date: ${formState.appointmentDate}`, 10, 70);
      doc.text(`Time: ${formState.time}`, 10, 80);
      doc.text(
        `Doctor: ${doctors.find((doc) => doc._id === formState.doctorId)?.name || "N/A"
        }`,
        10,
        90
      );
      doc.text(
        `Branch: ${centres.find((centre) => centre._id === formState.branch)?.name ||
        "N/A"
        }`,
        10,
        100
      );
      doc.text(`Consultation Type: ${formState.consultationType}`, 10, 110);
      doc.text(`Child Concerns: ${formState.childConcerns}`, 10, 120);
      doc.text(`Address: ${formState.address}`, 10, 130);
      doc.text(`School Name: ${formState.schoolName}`, 10, 140);
      doc.text(`Class/Grade: ${formState.classGrade}`, 10, 150);
      doc.text(`School Board: ${formState.schoolBoard}`, 10, 160);
      doc.text(`Referred By: ${formState.referredBy}`, 10, 170);

      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfDownloadUrl(pdfUrl);

      toast.success("Appointment booked successfully!");
      setIsButtonLoading(false);
      setBookingSuccess(true);
      setCountdown(10);
    } catch (error) {
      toast.error(
        error.response?.data || "Failed to book appointment. Please try again."
      );
      setIsButtonLoading(false);
    }
  };

  const handleTimeSelect = (selectedTime) => {
    if (!bookedSlots.includes(selectedTime)) {
      updateFormState("time", selectedTime);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "childName",
      "childAge",
      "parentName",
      "email",
      "parentPhoneNo",
      "appointmentDate",
      "time",
      "doctorId",
    ];
    return requiredFields.every((field) => formState[field]);
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isTimeSlotPast = (timeString) => {
    if (!isToday(formState.appointmentDate)) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const [timePart, ampm] = timeString.split(" ");
    let [hour, minutes] = timePart.split(":").map(Number);

    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    if (hour < currentHour) return true;
    if (hour === currentHour && minutes <= currentMinutes) return true;
    return false;
  };

  const getAvailableTimes = () => {
    const selectedTimeSlots = timeSlots[timeOfDay];
    return selectedTimeSlots.filter((time) => {
      const isBooked = bookedSlots.includes(time);
      const isPast = isTimeSlotPast(time);
      return !isBooked && !isPast;
    });
  };

  const handleBookAnother = () => {
    setBookingSuccess(false);
    setPdfDownloadUrl(null);
    setFormState({
      childName: "",
      childAge: "",
      parentName: "",
      parentId: null,
      email: "",
      dob: "",
      parentPhoneNo: "",
      appointmentDate: "",
      time: "",
      doctorId: "",
      schoolName: "",
      classGrade: "",
      schoolBoard: "",
      childConcerns: "",
      branch: "",
      gender: "",
      alternativeNumber: "",
      address: "",
      consultationType: "",
      referredBy: "",
    });
    setTimeOfDay("morning");
    setPDF(null);
  };

  const handleBackToDashboard = () => {
    navigate(-1);
  };

  return (
    <div className="max-width mx-auto mt-4 mb-10 py-12 px-4">
      <ToastContainer />
      {isLoading ? (
        <Loader />
      ) : bookingSuccess ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-lg text-center p-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Booked Successfully!</h2>
            <p className="text-gray-600 mb-2">
              You will be redirected back in {countdown} seconds...
            </p>
            <p className="text-gray-600 mb-8">
              You can download the appointment details below.
            </p>

            {pdfDownloadUrl && (
              <div className="mb-8">
                <a
                  href={pdfDownloadUrl}
                  download="appointment_details.pdf"
                  className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 w-full"
                >
                  Download Appointment Details
                </a>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={handleBookAnother}
                className="px-6 py-3 border border-red-700 text-red-700 font-medium rounded-md hover:bg-red-50 flex-1"
              >
                Book Another Appointment
              </button>
              <button
                onClick={handleBackToDashboard}
                className="px-6 py-3 bg-red-700 text-white font-medium rounded-md hover:bg-red-800 flex-1"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full md:w-11/12 lg:w-5/6">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-red-700 border-b py-4 text-center">
                <h2 className="text-2xl font-semibold text-white">
                  Book Appointment
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-red-800 pb-1">
                      Child Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.childName}
                        onChange={(e) =>
                          updateFormState("childName", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.dob}
                        onChange={(e) => {
                          const dobValue = e.target.value;
                          updateFormState("dob", dobValue);

                          // Calculate and update age when DOB changes
                          if (dobValue) {
                            const birthDate = new Date(dobValue);
                            const today = new Date();
                            let age =
                              today.getFullYear() - birthDate.getFullYear();

                            // Adjust age if birthday hasn't occurred yet this year
                            const m = today.getMonth() - birthDate.getMonth();
                            if (
                              m < 0 ||
                              (m === 0 && today.getDate() < birthDate.getDate())
                            ) {
                              age--;
                            }

                            updateFormState("childAge", age.toString());
                          } else {
                            updateFormState("childAge", "");
                          }
                        }}
                        max={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.gender}
                        onChange={(e) =>
                          updateFormState("gender", e.target.value)
                        }
                        required
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Others">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-red-800  pb-1">
                        Parent Information
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.parentName}
                        onChange={(e) =>
                          updateFormState("parentName", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.email}
                        onChange={(e) =>
                          updateFormState("email", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Phone Number
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.parentPhoneNo}
                        onChange={(e) =>
                          updateFormState("parentPhoneNo", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.alternativeNumber}
                        onChange={(e) =>
                          updateFormState("alternativeNumber", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Concerns<span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        rows="3"
                        value={formState.childConcerns}
                        onChange={(e) =>
                          updateFormState("childConcerns", e.target.value)
                        }
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        rows="3"
                        value={formState.address}
                        onChange={(e) =>
                          updateFormState("address", e.target.value)
                        }
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-red-800  pb-1">
                        School Information
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.schoolName}
                        onChange={(e) =>
                          updateFormState("schoolName", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class/Grade
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.classGrade}
                        onChange={(e) =>
                          updateFormState("classGrade", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Board
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.schoolBoard}
                        onChange={(e) =>
                          updateFormState("schoolBoard", e.target.value)
                        }
                      >
                        <option value="">Select School Board</option>
                        <option value="CBSE">CBSE</option>
                        <option value="SSC">SSC</option>
                        <option value="ICSE">ICSE</option>
                        <option value="Camebridge (IB)">Cambridge (IB)</option>
                        <option value="NIOS">NIOS</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referred By
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.referredBy}
                        onChange={(e) =>
                          updateFormState("referredBy", e.target.value)
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-red-800  pb-1">
                        Appointment Details
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Appointment Date<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.appointmentDate}
                        onChange={(e) => {
                          updateFormState("appointmentDate", e.target.value);
                          // Clear time selection when date changes
                          updateFormState("time", "");
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Branch<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.branch}
                        onChange={(e) =>
                          updateFormState("branch", e.target.value)
                        }
                        required
                      >
                        <option value="">Select Branch</option>
                        {centres.map((centre) => (
                          <option key={centre._id} value={centre._id}>
                            {centre.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Consultation type
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.consultationType}
                        onChange={(e) =>
                          updateFormState("consultationType", e.target.value)
                        }
                        required
                      >
                        <option value="">Select Consultation Type</option>
                        <option value="New Consultation">
                          New Consultation Rs.700/-
                        </option>
                        <option value="Assessment(IQ)">
                          Assessment (IQ) Rs.6000/-
                        </option>
                        <option value="For IB board Assessment(IQ)">
                          For IB board Assessment (IQ) Rs.12000/-
                        </option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Doctor<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={formState.doctorId}
                        onChange={(e) => {
                          updateFormState("doctorId", e.target.value);
                          // Clear time selection when doctor changes
                          updateFormState("time", "");
                        }}
                        required
                      >
                        <option value="">-- Select a Doctor --</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Radio buttons for time of day selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time of Day
                      </label>
                      <div className="flex gap-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-5 w-5 text-red-600"
                            value="morning"
                            checked={timeOfDay === "morning"}
                            onChange={() => {
                              setTimeOfDay("morning");
                              // Clear time selection when switching time of day
                              updateFormState("time", "");
                            }}
                          />
                          <span className="ml-2 text-gray-700">
                            Morning (10:30 AM - 12:30 PM)
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-5 w-5 text-red-600"
                            value="afternoon"
                            checked={timeOfDay === "afternoon"}
                            onChange={() => {
                              setTimeOfDay("afternoon");
                              // Clear time selection when switching time of day
                              updateFormState("time", "");
                            }}
                          />
                          <span className="ml-2 text-gray-700">
                            Afternoon/Evening (2:00 PM - 5:30 PM)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time Slots
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formState.doctorId && formState.appointmentDate ? (
                          getAvailableTimes().length > 0 ? (
                            getAvailableTimes().map((time) => (
                              <button
                                type="button"
                                className={`px-4 py-2 rounded-md ${formState.time === time
                                    ? "bg-red-700 text-white"
                                    : "border border-red-700 text-red-800 hover:bg-red-50"
                                  }`}
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                              >
                                {time}
                              </button>
                            ))
                          ) : (
                            <p className="text-amber-600">
                              No available{" "}
                              {timeOfDay === "morning"
                                ? "morning"
                                : "afternoon/evening"}{" "}
                              time slots for the selected date and doctor.
                            </p>
                          )
                        ) : (
                          <p className="text-gray-500">
                            Please select a doctor and appointment date to view
                            available time slots.
                          </p>
                        )}
                      </div>
                      {formState.appointmentDate &&
                        isToday(formState.appointmentDate) && (
                          <p className="mt-2 text-sm text-gray-500 italic">
                            Note: Time slots for today that have already passed
                            are not shown.
                          </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                      <div className="font-[sans-serif] max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload previous reports (if any)
                        </label>
                        <input
                          type="file"
                          className="w-full text-gray-400 font-semibold text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500 rounded"
                          onChange={(e) => setPDF(e.target.files[0])}
                          accept=".pdf"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Only PDFs are Allowed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isButtonLoading ? (
                    <Loader />
                  ) : (
                    <div className="mt-6">
                      <button
                        type="submit"
                        className={`w-full md:w-auto px-6 py-3 text-white font-medium rounded-md ${validateForm()
                            ? "bg-red-700 hover:bg-red-800"
                            : "bg-gray-400 cursor-not-allowed"
                          }`}
                        disabled={!validateForm()}
                      >
                        Book Appointment
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}