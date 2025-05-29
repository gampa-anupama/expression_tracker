import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalogo from "../../assets/totalsolutions.jpg";
export default function IEPTherapist() {
  const queryParams = new URLSearchParams(useLocation().search);
  const childId = queryParams.get("childId");
  const [responses, setResponses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentGoalData, setCurrentGoalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [performanceInputs, setPerformanceInputs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [doctorFeedback, setDoctorFeedback] = useState("");
  const [therapistFeedback, setTherapistFeedback] = useState("");
  const [iepId, setIepId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/doctors/childIEP/${childId}`, {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });
        setResponses(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data", { autoClose: 2000 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [childId]);
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg")); // Convert to base64
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleViewIEP = async (response) => {
    try {
      const doc = new jsPDF();

      // Initial setup
      let yOffset = 15;

      // Validate response
      if (!response || !response.monthlyGoals) {
        doc.setFontSize(14);
        doc.text("No IEP data available", doc.internal.pageSize.width / 2, 20, {
          align: "center",
        });
        doc.output("dataurlnewwindow");
        return;
      }

      // Helper function to calculate age
      const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      // Extract data safely with fallbacks
      const therapyName = response?.therapy || "N/A";
      const therapist = response?.therapistName || "N/A";
      const month =
        response?.startingMonth && response?.startingYear
          ? `${response.startingMonth} ${response.startingYear}`
          : "N/A";
      const doctorName = response?.doctorId?.name || "N/A";
      const childName = response?.childId?.name || "N/A";
      let childGender = response?.childId?.gender || "N/A";
      const childDOB = response?.childId?.dob.split("T")[0] || "N/A";
      const childAge = calculateAge(response?.childId?.dob) || "N/A";
      childGender = childGender.charAt(0).toUpperCase() + childGender.slice(1);

      // Add hospital logo
      try {
        const hospitalLogo = await loadImage(hospitallogo);
        doc.addImage(hospitalLogo, "PNG", 15, 10, 40, 20);
      } catch (e) {
        console.log("Failed to add logo:", e);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Hospital Logo", 15, 20);
      }

      // Hospital information
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        [
          `Total Solution - Barkatpura`,
          `3-4-495/B, 1st Floor, YMCA Near More Super Market, Hyderabad, Telangana 500027, IN`,
          "Phone: +91 88860 08697",
        ],
        15,
        35
      );

      // Header with styling
      doc.setFillColor(63, 81, 181); // Indigo color
      doc.rect(2, 50, doc.internal.pageSize.width - 4, 25, "F");

      // Title - center-aligned
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255); // White text
      doc.setFont("helvetica", "bold");
      doc.text(
        "Individualized Education Program (IEP)",
        doc.internal.pageSize.width / 2,
        65,
        { align: "center" }
      );

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Child info section
      const infoBoxY = 85;
      const infoBoxHeight = 65;
      doc.setFillColor(240, 240, 250); // Light indigo background
      doc.roundedRect(
        10,
        infoBoxY,
        doc.internal.pageSize.width - 20,
        infoBoxHeight,
        3,
        3,
        "F"
      );

      // Child name header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Child: ${childName}`,
        doc.internal.pageSize.width / 2,
        infoBoxY + 12,
        { align: "center" }
      );

      // Set up columns
      const colWidth = (doc.internal.pageSize.width - 40) / 2;
      const leftColX = 20;
      const rightColX = leftColX + colWidth + 10;
      const valueIndent = 25;

      // Draw table-like lines
      const lineY1 = infoBoxY + 18;
      doc.setDrawColor(200, 200, 220);
      doc.setLineWidth(0.2);
      doc.line(15, lineY1, doc.internal.pageSize.width - 15, lineY1);

      // First row
      let rowY = infoBoxY + 28;
      doc.setFont("helvetica", "bold");
      doc.text("Therapist:", leftColX, rowY);
      doc.setFont("helvetica", "normal");
      doc.text(therapist, leftColX + valueIndent, rowY);

      doc.setFont("helvetica", "bold");
      doc.text("Starting:", rightColX, rowY);
      doc.setFont("helvetica", "normal");
      doc.text(month, rightColX + valueIndent, rowY);

      // Second row
      rowY += 12;
      doc.setFont("helvetica", "bold");
      doc.text("Doctor:", leftColX, rowY);
      doc.setFont("helvetica", "normal");
      doc.text(doctorName, leftColX + valueIndent, rowY);

      doc.setFont("helvetica", "bold");
      doc.text("DOB:", rightColX, rowY);
      doc.setFont("helvetica", "normal");
      doc.text(
        childDOB + ` (${childAge} years)`,
        rightColX + valueIndent,
        rowY
      );

      // Third row
      rowY += 12;
      doc.setFont("helvetica", "bold");
      doc.text("Therapy:", leftColX, rowY);
      doc.setFont("helvetica", "normal");
      doc.text(therapyName, leftColX + valueIndent, rowY);

      doc.setFont("helvetica", "bold");
      doc.text("Gender:", rightColX, rowY);
      doc.setFont("helvetica", "normal");
      doc.text(`${childGender}`, rightColX + valueIndent, rowY);

      // Prepare table data
      const tableData = [];

      if (
        Array.isArray(response.monthlyGoals) &&
        response.monthlyGoals.length > 0
      ) {
        response.monthlyGoals.forEach((goalData) => {
          const numberedGoals = Array.isArray(goalData.goals)
            ? goalData.goals
                .map((goal, index) => `${index + 1}) ${goal}`)
                .join("\n\n")
            : "N/A";

          const performanceText = Array.isArray(goalData.performance)
            ? goalData.performance
                .map((perf, index) => `${index + 1}) ${perf}`)
                .join("\n\n")
            : "N/A";

          tableData.push([
            goalData.month || "N/A",
            goalData.target || "N/A",
            numberedGoals,
            performanceText,
            goalData.therapistFeedback || "N/A",
            goalData.doctorFeedback || "N/A",
          ]);
        });
      }

      // Add table
      autoTable(doc, {
        head: [
          [
            "Month",
            "Long-Term Goals",
            "Short-Term Goals",
            "Performance",
            "Therapist Feedback",
            "Doctor Feedback",
          ],
        ],
        body: tableData,
        startY: infoBoxY + infoBoxHeight + 10,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineColor: [63, 81, 181],
          valign: "middle",
        },
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 250],
        },
        columnStyles: {
          0: { cellWidth: 20, halign: "center" },
          1: { cellWidth: 30, halign: "left" },
          2: { cellWidth: 35, halign: "left" },
          3: { cellWidth: 35, halign: "left" },
          4: { cellWidth: 35, halign: "left" },
          5: { cellWidth: 35, halign: "left" },
        },
        margin: { top: 10 },
      });

      // Add footer
      const today = new Date();
      const formattedDate = today.toLocaleDateString();
      const footerY = doc.internal.pageSize.height - 20;
      doc.setDrawColor(63, 81, 181);
      doc.setLineWidth(0.5);
      doc.line(10, footerY, doc.internal.pageSize.width - 10, footerY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Generated on: ${formattedDate}`,
        doc.internal.pageSize.width - 15,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
      doc.text(
        "Confidential Medical Document",
        15,
        doc.internal.pageSize.height - 10
      );

      // Display the PDF
      doc.output("dataurlnewwindow");
    } catch (error) {
      console.log("Error generating PDF:", error);
      alert("Failed to generate PDF");
    }
  };
  const handleViewUpdate = (goalData, responseIndex, monthIndex, currIepId) => {
    setCurrentGoalData({ ...goalData, responseIndex, monthIndex });
    setCurrentMonth(goalData.month);
    setPerformanceInputs(
      goalData.performance && goalData.performance.length
        ? [...goalData.performance]
        : goalData.goals.map(() => "")
    );
    setTherapistFeedback(
      responses[responseIndex].monthlyGoals[monthIndex].therapistFeedback || ""
    );
    setDoctorFeedback(
      responses[responseIndex].monthlyGoals[monthIndex].doctorFeedback || ""
    );
    setIepId(currIepId);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentGoalData(null);
    setPerformanceInputs([]);
  };

  const handlePerformanceChange = (goalIndex, value) => {
    setPerformanceInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[goalIndex] = value;
      return updatedInputs;
    });
  };

  const handleSavePerformance = async () => {
    if (!performanceInputs.length) return;

    try {
      await axios.put(
        `/api/doctors/updateperformance/${childId}`,
        {
          performance: performanceInputs,
          month: currentMonth,
          therapistFeedback: therapistFeedback,
          iepId: iepId,
        },
        {
          headers: { Authorization: `${sessionStorage.getItem("token")}` },
        }
      );

      setResponses((prevResponses) => {
        const updatedResponses = [...prevResponses];
        const { responseIndex, monthIndex } = currentGoalData;
        updatedResponses[responseIndex].monthlyGoals[monthIndex].performance = [
          ...performanceInputs,
        ];
        updatedResponses[responseIndex].monthlyGoals[
          monthIndex
        ].therapistFeedback = therapistFeedback;
        return updatedResponses;
      });

      toast.success("Performance updated successfully!", { autoClose: 2000 });
    } catch (error) {
      console.error("Error updating performance:", error);
      toast.error("Error updating performance", { autoClose: 2000 });
    } finally {
      handleModalClose();
    }
  };

  const handleTherapistFeedback = (event) => {
    setTherapistFeedback(event.target.value);
  };

  return (
    <div className="p-4 sm:p-6">
      <ToastContainer />
      <div
        className="max-w-7xl mx-auto 
          sm:mt-16 md:mt-20 lg:mt-24 xl:mt-28"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#ab1c1c]">
            Individual Education Plan (IEP) {">"}{" "}
            {sessionStorage.getItem("childName")}
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ab1c1c]"></div>
          </div>
        ) : responses.length === 0 ? (
          <h3 className="text-center text-gray-600">No IEPs assigned</h3>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
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
                            <span className="text-[#ab1c1c] font-semibold text-lg">
                              {month}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                className="bg-[#ab1c1c] hover:bg-[#8e1818] text-white font-bold py-1 px-2 rounded-lg shadow-md transition duration-300"
                                onClick={() =>
                                  handleViewUpdate(
                                    response.monthlyGoals[idx],
                                    index,
                                    idx,
                                    response._id
                                  )
                                }
                              >
                                View/Update
                              </button>
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="p-4">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                          onClick={() => handleViewIEP(response)}
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

        {showModal && currentGoalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-red-200 flex justify-between items-center">
                <h5 className="text-2xl font-bold text-[#ab1c1c]">
                  View/Update Performance - {currentGoalData.month}
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
                {/* Long-Term Goal Section */}
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">
                    Long-Term Goal
                  </h6>
                  <p className="text-gray-700 text-lg">
                    {currentGoalData.target}
                  </p>
                </div>

                {/* Short-Term Goals Section */}
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">
                    Short-Term Goals
                  </h6>
                  {currentGoalData.goals.map((goal, goalIndex) => (
                    <div key={goalIndex} className="mb-4">
                      <p className="text-gray-700 mb-2 mt-2 text-lg">
                        <span className="text-[#ab1c1c] font-medium">
                          {goalIndex + 1}.{" "}
                        </span>
                        {goal}
                      </p>
                      <input
                        type="number"
                        className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                        value={performanceInputs[goalIndex] || ""}
                        onChange={(e) =>
                          handlePerformanceChange(goalIndex, e.target.value)
                        }
                        placeholder="Enter performance (0-100 %)"
                      />
                    </div>
                  ))}
                </div>

                {/* Therapist Feedback Section */}
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">
                    Therapist Feedback
                  </h6>
                  <input
                    type="text"
                    className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ab1c1c]"
                    value={therapistFeedback}
                    onChange={handleTherapistFeedback}
                    placeholder="Enter feedback based on the child performance"
                  />
                </div>

                {/* Doctor's Feedback Section */}
                {doctorFeedback && (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h6 className="text-[#ab1c1c] font-medium mb-2 text-xl">
                      Doctor's Feedback
                    </h6>
                    <p className="text-gray-700 text-lg">{doctorFeedback}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-red-200">
                <button
                  type="button"
                  className="bg-[#ab1c1c] hover:bg-[#8e1818] text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                  onClick={handleSavePerformance}
                >
                  Save Performance
                </button>
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-2"
                  onClick={handleModalClose}
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
