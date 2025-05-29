import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
const GameReports = () => {
  const [params] = useSearchParams();
  const childId = params.get("childId");

  const [gameReports, setGameReports] = useState([]);

  useEffect(() => {
    const fetchGameReports = async () => {
      try {
        const response = await axios.get(`/api/data/gameReports/${childId}`);
        setGameReports(response.data);
      } catch (error) {
        console.error("Error fetching game reports:", error);
      }
    };

    fetchGameReports();
  }, [childId]);

  return (
    <div
      className="p-6 "
    >
      <h1 className="text-2xl font-bold text-center text-[#ab1c1c] mb-6">Game Reports</h1>
      {gameReports.length === 0 ? (
        <div className="text-[#ab1c1c] text-lg">No game reports found</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full bg-red-100">
            <thead>
              <tr className="bg-red-200 text-[#ab1c1c]">
                {/* <th className="px-6 py-3 border-b-2 border-red-300 text-left text-sm font-semibold uppercase">Game ID</th> */}
                <th className="px-6 py-3 border-b-2 border-red-300 text-left text-sm font-semibold uppercase">
                  Game
                </th>
                <th className="px-6 py-3 border-b-2 border-red-300 text-left text-sm font-semibold uppercase">
                  Tries
                </th>
                <th className="px-6 py-3 border-b-2 border-red-300 text-left text-sm font-semibold uppercase">
                  Timer
                </th>
                <th className="px-6 py-3 border-b-2 border-red-300 text-left text-sm font-semibold uppercase">
                  Status
                </th>
                <th className="px-6 py-3 border-b-2 border-red-300 text-left text-sm font-semibold uppercase">
                  Date Played
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-red-200">
              {gameReports.map((report) => (
                <tr
                  key={report._id}
                  className="hover:bg-red-50 transition-colors"
                >
                  {/* <td className="px-6 py-4 text-sm text-[#ab1c1c]">{report.gameId}</td> */}
                  <td className="px-6 py-4 text-sm text-[#ab1c1c]">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#ab1c1c]">
                    {report.tries}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#ab1c1c]">
                    {report.timer.toFixed(2)} seconds
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
        ${
          report.status === "completed"
            ? "bg-green-200 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#ab1c1c]">
                    {new Date(report.datePlayed).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GameReports;
