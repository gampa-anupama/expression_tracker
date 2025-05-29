import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import Loader from "../../Components/Loader";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const JWLEnquiryDetails = () => {
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const { referenceId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const enquiryResponse = await axios.get(
          `/api/admins/get-jwl-enquiry/${referenceId}`,
          {
            headers: {
              Authorization: `${sessionStorage.getItem("token")}`,
            },
          }
        );
        setEnquiry(enquiryResponse.data);

        const questionsResponse = await axios.get(
          "/api/jwl/jwlenquirequestions",
          {
            headers: {
              Authorization: `${sessionStorage.getItem("token")}`,
            },
          }
        );
        setQuestions(questionsResponse.data);

        try {
          const videoResponse = await axios.get(
            `/api/admins/get-jwluser-video/${enquiryResponse.data.parentEmail}`,
            {
              headers: {
                Authorization: `${sessionStorage.getItem("token")}`,
              },
              responseType: "blob",
            }
          );

          const videoBlob = new Blob([videoResponse.data], {
            type: videoResponse.headers["content-type"],
          });
          const url = URL.createObjectURL(videoBlob);
          setVideoUrl(url);
        } catch (videoErr) {
          console.error("Failed to fetch video", videoErr);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [referenceId]);

  const getQuestionDetails = (questionKey) => {
    const questionNumber = parseInt(questionKey.replace("q", ""));
    return questions.find((q) => q.number === questionNumber);
  };

  const toggleQuestionnaire = () => {
    setShowQuestionnaire(!showQuestionnaire);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="flex justify-center items-center h-screen">
        Enquiry not found
      </div>
    );
  }

  return (
    <div className="mt-10 mb-16 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="bg-[#ab1c1c] p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-sm font-medium text-white hover:text-red-100 transition duration-150"
                >
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Enquiries
                </button>
                <h1 className="text-2xl font-bold mt-2">Enquiry Details</h1>
                <p className="text-red-100 mt-1">
                  Reference ID: {enquiry.referenceId}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  enquiry.isArchived
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {enquiry.isArchived ? "Archived" : "Active"}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Child Information */}
              <div className="bg-red-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-red-200">
                  Child Information
                </h2>
                <div className="space-y-3">
                  <InfoRow label="Name" value={enquiry.childName} />
                  <InfoRow label="Age" value={enquiry.childAge} />
                  <InfoRow label="Gender" value={enquiry.childGender} />
                </div>
              </div>

              {/* Parent Information */}
              <div className="bg-red-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-red-200">
                  Parent Information
                </h2>
                <div className="space-y-3">
                  <InfoRow label="Name" value={enquiry.parentName} />
                  <InfoRow label="Email" value={enquiry.parentEmail} />
                  <InfoRow label="Phone" value={enquiry.parentPhoneNo} />
                </div>
              </div>
            </div>

            {/* Enquiry Details */}
            <div className="bg-red-50 p-5 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-red-200">
                Other Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  label="Preferred Center"
                  value={enquiry.preferredCenter}
                />
                {/* <InfoRow
              label="Video Call Requested"
              value={enquiry.videoCall ? "Yes" : "No"}
            /> */}
                <InfoRow
                  label="Enquiry Date"
                  value={format(new Date(enquiry.enquiryDate), "dd MMM yyyy")}
                />
              </div>
            </div>

            {/* Questionnaire Section */}
            {enquiry.checklist && (
              <div className="mb-8">
                <button
                  onClick={toggleQuestionnaire}
                  className="flex items-center justify-between w-full bg-red-50 hover:bg-red-100 text-[#ab1c1c] font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  <span>View Questionnaire Responses</span>
                  {showQuestionnaire ? (
                    <FiChevronUp className="h-5 w-5" />
                  ) : (
                    <FiChevronDown className="h-5 w-5" />
                  )}
                </button>

                {showQuestionnaire && (
                  <div className="mt-4 bg-white border border-red-200 rounded-lg p-5 shadow-sm">
                    <div className="space-y-6">
                      {Object.entries(enquiry.checklist).map(([key, value]) => {
                        const questionDetails = getQuestionDetails(key);
                        return (
                          <div
                            key={key}
                            className="pb-4 border-b border-red-100 last:border-0"
                          >
                            {questionDetails ? (
                              <>
                                <h3 className="font-semibold text-gray-800">
                                  {questionDetails.question}
                                </h3>
                                {questionDetails.example && (
                                  <p className="text-gray-500 text-sm mt-1">
                                    <span className="font-medium">
                                      Example:
                                    </span>{" "}
                                    {questionDetails.example}
                                  </p>
                                )}
                                <p className="mt-2 text-gray-700">
                                  <span className="font-medium">Response:</span>{" "}
                                  <span className="text-[#ab1c1c]">
                                    {value.toString()}
                                  </span>
                                </p>
                              </>
                            ) : (
                              <>
                                <h3 className="font-semibold text-gray-800">
                                  {key}
                                </h3>
                                <p className="mt-2 text-gray-700">
                                  <span className="font-medium">Response:</span>{" "}
                                  <span className="text-[#ab1c1c]">
                                    {value.toString()}
                                  </span>
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Notes */}
            {enquiry.additionalNotes && (
              <div className="bg-red-50 p-5 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-red-200">
                  Additional Notes
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {enquiry.additionalNotes}
                </p>
              </div>
            )}

            {/* Video Submission */}
            {videoUrl && (
              <div className="bg-red-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-red-200">
                  Video Submission
                </h2>
                <div className="bg-black rounded-lg overflow-hidden">
                  <video controls className="w-full">
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const InfoRow = ({ label, value }) => (
  <div className="flex">
    <span className="text-gray-600 font-medium w-1/3">{label}:</span>
    <span className="text-gray-800 flex-1">{value}</span>
  </div>
);

export default JWLEnquiryDetails;
