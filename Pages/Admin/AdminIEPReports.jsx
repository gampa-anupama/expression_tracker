import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../Components/Loader.jsx";
import generateIEPPDF from "../IEPReportPDF.js";

export default function AdminIEPReports() {
  const { childId } = useParams();
  const [iepData, setIepData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedIEPHistory, setSelectedIEPHistory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIEPData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/admins/iep/${childId}`, {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });
        setIepData(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log("Error fetching IEP data:", error);
      }
    };

    fetchIEPData();
  }, [childId]);

  const handleViewHistory = (iep) => {
    setSelectedIEPHistory(iep);
    setHistoryModalOpen(true);
  };

  const renderHistoryModal = () => {
    if (!selectedIEPHistory) return null;

    return (
      <div className="container mx-auto px-4 py-6 mt-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mb-4 flex justify-start">
          <button
            onClick={() => navigate(-1)} // Go back to previous page
            className="flex items-center text-[#ab1c1c] hover:text-[#8e1818] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <h1 className="text-2xl font-bold text-[#ab1c1c] text-center mb-6">
          IEP Reports
        </h1>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-red-200 flex justify-between items-center">
              <h5 className="text-2xl font-bold text-[#ab1c1c]">
                Version History for {selectedIEPHistory.therapy} IEP
              </h5>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 text-2xl border-2 px-3 py-1 rounded border-red-500"
                onClick={() => setHistoryModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {selectedIEPHistory.monthlyGoals.map((wrapper, monthIndex) => {
                // Sort all versions (including latest) by date to find the most recent
                const allVersions = wrapper.history;
                allVersions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                // The most recent version is now at index 0
                const mostRecentVersion = wrapper.latest;

                // Previous versions are all except the most recent
                const previousVersions = allVersions.slice(1);

                return (
                  <div key={monthIndex} className="mb-8">
                    <h6 className="text-xl font-semibold text-[#ab1c1c] mb-4">
                      {wrapper.latest.month} - History
                    </h6>

                    <div className="mb-6">
                      <h6 className="text-lg font-medium text-[#ab1c1c] mb-2">
                        Current Version
                      </h6>
                      <div className="bg-red-50 p-4 rounded-lg mb-4">
                        <p className="font-medium">
                          Target: {mostRecentVersion.target}
                        </p>
                        <div className="mt-2">
                          <p className="font-medium">Goals:</p>
                          <ul className="list-disc pl-5">
                            {mostRecentVersion.goals.map((goal, idx) => (
                              <li key={idx}>{goal}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2">
                          <p className="font-medium">Performance:</p>
                          {mostRecentVersion.performance?.length > 0 ? (
                            <ul className="list-disc pl-5">
                              {mostRecentVersion.performance.map((perf, idx) => (
                                <li key={idx}>{perf}%</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500">No performance data</p>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="font-medium">Therapist Feedback:</p>
                          <p>{mostRecentVersion.therapistFeedback || "No feedback"}</p>
                        </div>
                        <div className="mt-2">
                          <p className="font-medium">Doctor Feedback:</p>
                          <p>{mostRecentVersion.doctorFeedback || "No feedback"}</p>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Last Updated:{" "}
                          {new Date(mostRecentVersion.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {previousVersions.length > 0 ? (
                      <div>
                        <h6 className="text-lg font-medium text-[#ab1c1c] mb-2">
                          Previous Versions
                        </h6>
                        <div className="space-y-4">
                          {previousVersions.map((version, versionIndex) => (
                            <div
                              key={versionIndex}
                              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                            >
                              <p className="font-medium">
                                Target: {version.target}
                              </p>
                              <div className="mt-2">
                                <p className="font-medium">Goals:</p>
                                <ul className="list-disc pl-5">
                                  {version.goals.map((goal, idx) => (
                                    <li key={idx}>{goal}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="mt-2">
                                <p className="font-medium">Performance:</p>
                                {version.performance?.length > 0 ? (
                                  <ul className="list-disc pl-5">
                                    {version.performance.map((perf, idx) => (
                                      <li key={idx}>{perf}%</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500">
                                    No performance data
                                  </p>
                                )}
                              </div>
                              <div className="mt-2">
                                <p className="font-medium">Therapist Feedback:</p>
                                <p>{version.therapistFeedback || "No feedback"}</p>
                              </div>
                              <div className="mt-2">
                                <p className="font-medium">Doctor Feedback:</p>
                                <p>{version.doctorFeedback || "No feedback"}</p>
                              </div>
                              <p className="mt-2 text-sm text-gray-500">
                                Updated:{" "}
                                {new Date(version.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        No previous versions available
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t border-red-200">
              <button
                type="button"
                className="bg-[#ab1c1c] hover:bg-[#8e1818] text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                onClick={() => setHistoryModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-6 mt-4 flex flex-col items-center justify-center ">
      <h1 className="text-2xl font-bold text-[#ab1c1c] text-center mb-6">
        IEP Reports
      </h1>
      {iepData.length > 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-4xl">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-red-100">
                <th className="px-6 py-3 border-b-2 border-red-200 text-left text-sm font-semibold text-[#ab1c1c]">
                  Therapy
                </th>
                <th className="px-6 py-3 border-b-2 border-red-200 text-left text-sm font-semibold text-[#ab1c1c]">
                  Starting Month
                </th>
                <th className="px-6 py-3 border-b-2 border-red-200 text-left text-sm font-semibold text-[#ab1c1c]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {iepData.map((iep, index) => (
                <tr key={index} className="hover:bg-red-50 transition-colors">
                  <td className="px-6 py-4 border-b border-red-100 text-sm text-gray-700">
                    {iep.therapy}
                  </td>
                  <td className="px-6 py-4 border-b border-red-100 text-sm text-gray-700">
                    {iep.startingMonth} {iep.startingYear}
                  </td>
                  <td className="px-6 py-4 border-b border-red-100 text-sm space-x-2">
                    <button
                      onClick={() => generateIEPPDF(iep)}
                      className="bg-green-600 text-white px-3 py-2 text-sm rounded-md shadow hover:bg-green-700 transition"
                    >
                      Generate PDF
                    </button>
                    <button
                      onClick={() => handleViewHistory(iep)}
                      className="bg-[#ab1c1c] text-white px-3 py-2 text-sm rounded-md shadow hover:bg-[#8e1818] transition"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-red-100 rounded-lg shadow-sm p-6 max-w-2xl w-full text-center flex flex-col items-center justify-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
            <svg
              className="h-6 w-6 text-[#ab1c1c]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No IEP data available
          </h3>
          <p className="text-gray-600 mb-4">
            IEP has not been assigned to the child yet.
          </p>
        </div>
      )}

      {historyModalOpen && renderHistoryModal()}
    </div>
  );
}
