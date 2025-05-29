import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import generateIEPPDF from "../IEPReportPDF" ;
import Loader from "../../Components/Loader";

export default function IEPDoctor() {
  const [responses, setResponses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitText, setSubmitText] = useState("");
  const therapistName = sessionStorage.getItem("therapistName");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null);
  const [doctorFeedback, setDoctorFeedback] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [feedbackId, setFeedbackId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/doctors/childIEP/${sessionStorage.getItem("childId")}`,
          { headers: { Authorization: `${sessionStorage.getItem("token")}` } }
        );
        setResponses(response.data);
      } catch (error) {
        console.error('Error fetching data: ' + error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // const handleViewIEP = (response) => {
  //   const doc = new jsPDF();
  //   const tableData = [];
  //   let yOffset = 20;

  //   const therapyName = response?.therapy || "N/A";
  //   const therapist = therapistName;
  //   const month =
  //     response?.startingMonth + " " + response?.startingYear || "N/A";
  //   const doctorName = response.doctorId?.name || "N/A";

  //   response.monthlyGoals.forEach((goalWrapper) => {
  //     const goalData = goalWrapper.latest;
  //     const numberedGoals = goalData.goals
  //       .map((goal, index) => `${index + 1}) ${goal}`)
  //       .join("\n\n");
  //     tableData.push([
  //       goalData.month,
  //       goalData.target,
  //       numberedGoals,
  //       goalData.performance
  //         ? goalData.performance
  //             .map((perf, index) => `${index + 1}) ${perf}%`)
  //             .join("\n")
  //         : "N/A",
  //       goalData.therapistFeedback || "N/A",
  //       goalData.doctorFeedback || "N/A",
  //     ]);
  //   });

  //   doc.setFontSize(18);
  //   doc.text("Individualized Education Program (IEP)", 14, yOffset);
  //   yOffset += 10;

  //   doc.setFontSize(12);
  //   doc.text(`Child: ${sessionStorage.getItem("childName")}`, 14, yOffset);
  //   yOffset += 10;
  //   doc.text(`Therapist: ${therapist}`, 14, yOffset);
  //   yOffset += 10;
  //   doc.text(`Doctor: ${doctorName}`, 14, yOffset);
  //   yOffset += 10;
  //   doc.text(`Centre: ${sessionStorage.getItem("centreName")}`, 14, yOffset);
  //   yOffset += 10;
  //   doc.text(`Therapy: ${therapyName}`, 14, yOffset);
  //   yOffset += 10;
  //   doc.text(`Starting Year and Month: ${month}`, 14, yOffset);

  //   autoTable(doc, {
  //     head: [
  //       [
  //         "Month",
  //         "Long-Term Goals",
  //         "Short-Term Goals",
  //         "Performance",
  //         "Therapist Feedback",
  //         "Doctor Feedback",
  //       ],
  //     ],
  //     body: tableData,
  //     startY: yOffset + 10,
  //   });

  //   doc.output("dataurlnewwindow");
  // };

  const handleInputChange = (e, monthIndex, goalIndex, field) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = { ...prevData };

      if (
        field === "goals" &&
        monthIndex !== undefined &&
        goalIndex !== undefined
      ) {
        updatedData.monthlyGoals[monthIndex].latest.goals[goalIndex] = value;
      } else if (field === "target" && monthIndex !== undefined) {
        updatedData.monthlyGoals[monthIndex].latest.target = value;
      } else if (name === "therapy") {
        updatedData.therapy = value;
      } else if (name === "startingMonth") {
        const startMonth = parseInt(value);
        const monthName = new Date(0, startMonth - 1).toLocaleString(
          "default",
          { month: "long" }
        );

        // Update selected months (current month + next 2 months)
        const selectedMonths = [
          startMonth,
          (startMonth % 12) + 1,
          ((startMonth + 1) % 12) + 1,
        ];

        const selectedMonthsNames = selectedMonths.map((month) =>
          new Date(0, month - 1).toLocaleString("default", { month: "long" })
        );

        updatedData.startingMonth = monthName;
        updatedData.selectedMonths = selectedMonths;
        updatedData.selectedMonthsNames = selectedMonthsNames;

        // Update monthly goals structure
        updatedData.monthlyGoals = selectedMonthsNames.map((monthName) => ({
          latest: {
            month: monthName,
            target: "",
            goals: [""],
            performance: [],
            therapistFeedback: "",
            doctorFeedback: "",
            childVideo: "",
            updatedAt: new Date(),
          },
          history: [],
        }));
      } else if (name === "year") {
        updatedData.startingYear = value;
        // Re-evaluate disabled months when year changes
        if (value === currentYear.toString()) {
          updatedData.startingMonth = Math.max(
            parseInt(updatedData.startingMonth),
            currentMonth
          );
        }
      } else if (name === "feedback") {
        updatedData.feedback = value;
      }
      return updatedData;
    });
  };

  const handleViewPerformance = (response, monthIndex) => {
    const goalWrapper = response.monthlyGoals[monthIndex];
    const monthDetails = {
      month: goalWrapper.latest.month,
      performance: goalWrapper.latest.performance,
      target: goalWrapper.latest.target,
      goals: goalWrapper.latest.goals,
      therapistFeedback: goalWrapper.latest.therapistFeedback,
      childVideo: goalWrapper.latest.childVideo,
    };
    setFeedbackId(response._id);

    setDoctorFeedback(goalWrapper.latest.doctorFeedback || "");
    setSelectedMonthDetails(monthDetails);
    console.log(monthDetails);
    setIsModalOpen(true);
  };

  const handleModalOpen = (response, monthIndex) => {
    const isEdit = Boolean(response);
    setIsEditMode(isEdit);
    setSubmitText(isEdit ? "Update Progress" : "Assign");

    if (isEdit) {
      setSelectedMonthIndex(monthIndex);
      const editData = JSON.parse(JSON.stringify(response));
      editData.iepId = response._id;
      setFormData(editData);
    } else {
      // Default to current month + next 2 months
      const startMonth = currentMonth;
      const selectedMonths = [
        startMonth,
        (startMonth % 12) + 1,
        ((startMonth + 1) % 12) + 1,
      ];

      const selectedMonthsNames = selectedMonths.map((month) =>
        new Date(0, month - 1).toLocaleString("default", { month: "long" })
      );

      setFormData({
        iepId: "",
        doctorId: sessionStorage.getItem("doctorId"),
        therapy: "",
        therapistName: therapistName,
        feedback: "",
        monthlyGoals: selectedMonthsNames.map((monthName) => ({
          latest: {
            month: monthName,
            target: "",
            goals: [""],
            performance: [],
            therapistFeedback: "",
            doctorFeedback: "",
            childVideo: "",
            updatedAt: new Date(),
          },
          history: [],
        })),
        startingYear: currentYear,
        startingMonth: new Date(0, currentMonth - 1).toLocaleString("default", {
          month: "long",
        }),
        selectedMonths: selectedMonths,
        selectedMonthsNames: selectedMonthsNames,
      });
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setFormData(null);
    setShowModal(false);
    setIsEditMode(false);
    setSelectedMonthIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonLoading(true);
    if (!isEditMode && !validateForm()) {
      setIsButtonLoading(false);
      return;
    }
    // Validation for starting month and year
    const selectedYear = parseInt(formData.startingYear, 10);
    const selectedMonth = formData.selectedMonths[0]; // Get the numeric month value

    if (
      selectedYear < currentYear ||
      (selectedYear === currentYear && selectedMonth < currentMonth)
    ) {
      toast.error("Starting month and year cannot be in the past.", {
        autoClose: 2000,
      });
      setIsButtonLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        // For edit mode, we only update the selected month's goals
        const updatedGoal = { ...formData.monthlyGoals[selectedMonthIndex] };

        updatedGoal.history.push({ ...updatedGoal.latest });

        updatedGoal.latest = {
          ...updatedGoal.latest,
          updatedAt: new Date(),
        };

        const response = await axios.put(
          `/api/doctors/updateIEP/${sessionStorage.getItem("childId")}`,
          {
            iepId: formData.iepId,
            monthlyGoals: updatedGoal,
            monthIndex: selectedMonthIndex,
            feedback: formData.feedback,
          },
          { headers: { Authorization: `${sessionStorage.getItem("token")}` } }
        );

        toast.success("IEP updated successfully!", { autoClose: 2000 });
      } else {
        // For new IEP, submit all data
        const response = await axios.post(
          `/api/doctors/assignIEP/${sessionStorage.getItem("childId")}`,
          {
            doctorId: formData.doctorId,
            therapy: formData.therapy,
            therapistName: formData.therapistName,
            feedback: formData.feedback,
            monthlyGoals: formData.monthlyGoals,
            startingMonth: formData.startingMonth,
            startingYear: formData.startingYear,
            selectedMonths: formData.selectedMonths,
            selectedMonthsNames: formData.selectedMonthsNames,
          },
          { headers: { Authorization: `${sessionStorage.getItem("token")}` } }
        );

        toast.success("New IEP created successfully!", { autoClose: 2000 });
      }

      // Refresh data
      const updatedResponse = await axios.get(
        `/api/doctors/childIEP/${sessionStorage.getItem("childId")}`,
        { headers: { Authorization: `${sessionStorage.getItem("token")}` } }
      );
      setResponses(updatedResponse.data);
      setShowModal(false);
    } catch (error) {
      toast.error("Error submitting form: " + error.message, {
        autoClose: 2000,
      });
      console.error("Error submitting form:", error);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const addGoal = (monthIndex) => {
    if (isEditMode && monthIndex !== selectedMonthIndex) return;

    setFormData((prevData) => {
      const updatedGoals = [...prevData.monthlyGoals];
      updatedGoals[monthIndex].latest.goals.push("");
      return { ...prevData, monthlyGoals: updatedGoals };
    });
  };

  const validateForm = () => {
    if (!formData.therapy) {
      toast.error("Therapy type is required", { autoClose: 2000 });
      return false;
    }
    
    if (!formData.startingYear) {
      toast.error("Year is required", { autoClose: 2000 });
      return false;
    }
    
    if (!formData.startingMonth) {
      toast.error("Starting month is required", { autoClose: 2000 });
      return false;
    }
    
    // Validate all three months' goals
    if (formData.monthlyGoals.length !== 3) {
      toast.error("Goals for all three months must be provided", { autoClose: 2000 });
      return false;
    }
    
    for (const [index, goalWrapper] of formData.monthlyGoals.entries()) {
      if (!goalWrapper.latest.target) {
        toast.error(`Long-term goal is required for Month ${index + 1}`, { autoClose: 2000 });
        return false;
      }
      
      if (goalWrapper.latest.goals.length === 0) {
        toast.error(`At least one short-term goal is required for Month ${index + 1}`, { autoClose: 2000 });
        return false;
      }
      
      if (goalWrapper.latest.goals.some(g => !g.trim())) {
        toast.error(`All short-term goals must be filled for Month ${index + 1}`, { autoClose: 2000 });
        return false;
      }
    }
    
    return true;
  };

  const removeGoal = (monthIndex, goalIndex) => {
    if (isEditMode && monthIndex !== selectedMonthIndex) return;

    setFormData((prevData) => {
      const updatedGoals = [...prevData.monthlyGoals];
      updatedGoals[monthIndex].latest.goals = updatedGoals[
        monthIndex
      ].latest.goals.filter((_, index) => index !== goalIndex);
      return { ...prevData, monthlyGoals: updatedGoals };
    });
  };

  const handleDoctorFeedback = (e) => {
    setDoctorFeedback(e.target.value);
  };

  const handleFeedback = async () => {
    try {
      await axios.put(
        `/api/doctors/IEPfeedback/${sessionStorage.getItem("childId")}`,
        {
          iepId: feedbackId,
          month: selectedMonthDetails.month,
          doctorFeedback: doctorFeedback,
        },
        { headers: { Authorization: `${sessionStorage.getItem("token")}` } }
      );

      toast.success("Feedback submitted successfully!", { autoClose: 2000 });
      setIsModalOpen(false);

      // Refresh data
      const response = await axios.get(
        `/api/doctors/childIEP/${sessionStorage.getItem("childId")}`,
        { headers: { Authorization: `${sessionStorage.getItem("token")}` } }
      );
      setResponses(response.data);
    } catch (error) {
      toast.error("Error submitting feedback", { autoClose: 2000 });
      console.error("Error submitting feedback:", error);
    }
  };

  const renderMonthlyGoals = () => {
    return formData.monthlyGoals.map((goalWrapper, monthIndex) => {
      const goalData = goalWrapper.latest;
  
      return (
        <div key={monthIndex} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h5 className="text-lg font-semibold mb-3">
            {goalData.month} <span className="text-red-500">*</span>
          </h5>
          <h6 className="text-[#ab1c1c] font-medium mb-2">
            Long-Term Goal <span className="text-red-500">*</span>
          </h6>
          <div className="mb-3">
            <input
              type="text"
              className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
              placeholder="Long-Term Goal"
              value={goalData.target}
              onChange={(e) => handleInputChange(e, monthIndex, null, "target")}
              required={!isEditMode}
            />
          </div>
          <h6 className="text-[#ab1c1c] font-medium mb-2">
            Short-Term Goals <span className="text-red-500">*</span>
          </h6>
          {goalData.goals.map((goal, goalIndex) => (
            <div key={goalIndex} className="flex items-center mb-3">
              <input
                type="text"
                className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                placeholder={`Short-Term Goal ${goalIndex + 1}`}
                value={goal}
                onChange={(e) =>
                  handleInputChange(e, monthIndex, goalIndex, "goals")
                }
                required={!isEditMode}
              />
              <button
                type="button"
                className="ml-2 p-2 bg-[#ab1c1c] text-white rounded-lg hover:bg-[#8e1818]"
                onClick={() => removeGoal(monthIndex, goalIndex)}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => addGoal(monthIndex)}
          >
            Add Goal
          </button>
        </div>
      );
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <ToastContainer />
      <div className="max-w-7xl mx-auto sm:mt-16 md:mt-16 lg:mt-20 xl:mt-20 2xl:mt-28">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#ab1c1c]">
            Individual Education Plan (IEP) {">"}{" "}
            {sessionStorage.getItem("childName")}{" "}
          </h1>
          <div className="flex space-x-4">
            <button
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
              onClick={() => handleModalOpen(null)}
            >
              Assign IEP
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ab1c1c]"></div>
          </div>
        ) : responses.length === 0 ? (
          <h3 className="text-center text-gray-600">No IEPs assigned</h3>
        ) : (
          <div className="overflow-x-auto rounded-lg border-2 border-red-800  shadow-md">
            <table className="min-w-full">
              <thead>
                <tr className="bg-red-100">
                  <th className="p-4 text-left text-[#ab1c1c]">S.No</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Therapy</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Month 1</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Month 2</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Month 3</th>
                  <th className="p-4 text-left text-[#ab1c1c]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {responses
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((response, index) => (
                    <tr
                      key={index}
                      className="border-b border-red-200 hover:bg-red-50"
                    >
                      <td className="p-4 text-gray-700">{index + 1}</td>
                      <td className="p-4 text-gray-700">{response.therapy}</td>
                      {response.selectedMonthsNames.map((month, idx) => (
                        <td key={idx} className="p-4">
                          <div className="flex flex-col space-y-2">
                            <span className="text-[#ab1c1c] font-semibold">
                              {month}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-lg shadow-md transition duration-300"
                                onClick={() => handleModalOpen(response, idx)}
                              >
                                Edit
                              </button>
                              <button
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-lg shadow-md transition duration-300"
                                onClick={() =>
                                  handleViewPerformance(response, idx)
                                }
                              >
                                View Performance
                              </button>
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="p-4">
                        <button
                          className="bg-[#ab1c1c] hover:bg-[#8e1818] text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                          onClick={() => generateIEPPDF(response)}
                        >
                          IEP Report
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && formData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-red-200 flex justify-between items-center">
                <h5 className="text-2xl font-bold text-[#ab1c1c]">
                  {isEditMode ? "Edit IEP Progress" : "Assign New IEP"}
                </h5>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 text-2xl border-2 px-3 py-1 rounded border-[#ab1c1c]"
                  onClick={handleModalClose}
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Therapy Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      name="therapy"
                      value={formData.therapy}
                      onChange={handleInputChange}
                      placeholder="Enter therapy type"
                      required={!isEditMode}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Therapist Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c] bg-gray-200 cursor-not-allowed"
                      name="therapistName"
                      value={therapistName}
                      disabled

                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      name="year"
                      value={formData.startingYear}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      required={!isEditMode}
                    >
                      <option value="">Select year</option>
                      <option value={currentYear}>{currentYear}</option>
                      <option value={currentYear + 1}>{currentYear + 1}</option>
                    </select>
                  </div>

                  {!isEditMode && (
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Select Starting Month <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                        name="startingMonth"
                        value={formData.startingMonth}
                        onChange={(e) =>
                          handleInputChange(e, null, null, "startingMonth")
                        }
                      >
                        <option value="">Select month</option>
                        {[...Array(12).keys()].map((i) => {
                          const monthValue = i + 1;
                          const isDisabled =
                            formData.startingYear === currentYear.toString() &&
                            monthValue < currentMonth;
                          return (
                            <option
                              key={i}
                              value={monthValue}
                              disabled={isDisabled}
                            >
                              {new Date(0, i).toLocaleString("default", {
                                month: "long",
                              })}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Long-Term and Short-Term Goals <span className="text-red-500">*</span>
                    </label>
                    {renderMonthlyGoals()}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Feedback
                    </label>
                    <textarea
                      className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                      name="feedback"
                      value={formData.feedback}
                      onChange={handleInputChange}
                      placeholder="Feedback for the month"
                    />
                  </div>
                  {isButtonLoading ? (
                    <div className="flex justify-center items-center">
                      <Loader />
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                    >
                      {submitText}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && selectedMonthDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-red-200 flex justify-between items-center">
                <h5 className="text-2xl font-bold text-[#ab1c1c]">
                  Performance for {selectedMonthDetails.month}
                </h5>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 text-2xl border-2 px-3 py-1 rounded border-[#ab1c1c]"
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <h6 className="text-[#ab1c1c] font-medium text-xl mb-2">
                    Long-Term Goal
                  </h6>
                  <p className="text-gray-700">{selectedMonthDetails.target}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <h6 className="text-[#ab1c1c] font-medium text-xl mb-2">
                    Short-Term Goals and Performances
                  </h6>
                  {selectedMonthDetails.goals &&
                  selectedMonthDetails.performance &&
                  selectedMonthDetails.goals.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMonthDetails.goals.map((goal, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 shadow-sm"
                        >
                          <p className="text-gray-700 text-lg">
                            <span className="text-[#ab1c1c] font-medium">
                              {index + 1}.{" "}
                            </span>{" "}
                            {goal}
                          </p>
                          <p className="text-gray-600 mt-2">
                            Performance:{" "}
                            {selectedMonthDetails.performance[index] ? (
                              <span className="bg-purple-500 text-white px-2 py-1 rounded-full">
                                {selectedMonthDetails.performance[index]}%
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                Performance not given
                              </span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No goals or performance data available.
                    </p>
                  )}
                </div>

                {selectedMonthDetails.childVideo?.videoUrl && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h6 className="text-blue-600 font-medium text-xl mb-3">Session Video</h6>
            <div className="p-3 border border-gray-200 rounded-lg bg-white">
              <div className="flex flex-col space-y-4">
                {/* Video Player */}
                <div className="w-full">
                  <video
                    controls
                    className="w-full h-auto rounded-lg border border-gray-300"
                  >
                    <source 
                      src={`/api/doctors/getIEPVideo/${encodeURIComponent(selectedMonthDetails.childVideo.videoUrl)}`} 
                      type="video/mp4" 
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Video Details */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Uploaded on: </span>
                    {new Date(selectedMonthDetails.childVideo.videoUploadDate).toLocaleDateString()}
                  </p>
                  {selectedMonthDetails.childVideo.videoDescription && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Description: </span>
                      {selectedMonthDetails.childVideo.videoDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">Therapist Feedback</h6>
                  <p className="text-gray-700">{selectedMonthDetails.therapistFeedback || 'No feedback available'}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">Feedback</h6>
                  <input
                    type="text"
                    className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                    value={doctorFeedback}
                    onChange={handleDoctorFeedback}
                    placeholder="Enter feedback based on the child performance"
                    required
                  />
                </div>
              </div>
              <div className="p-6 border-t border-red-200">
                <button
                  type="button"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                  onClick={handleFeedback}
                >
                  Submit Feedback
                </button>
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
