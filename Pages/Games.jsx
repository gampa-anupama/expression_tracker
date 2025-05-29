import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";

export default function Games() {
  const [gamesData, setGamesData] = useState([]); 
  const [icons, setIcons] = useState([]);
  const [groupId, setGroupId] = useState("1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIcons = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/data/allgames`, {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        });

        setGamesData(response.data);
        updateActiveGames(response.data, groupId);
      } catch (error) {
        console.error("Error fetching icons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIcons();
  }, [groupId]);

  const updateActiveGames = (data, groupId) => {
    const filteredGames = data.find(
      (group) => group.groupId === groupId
    )?.games || [];

    // Filter only active games
    const activeGames = filteredGames.filter(game => game.status === "active");

    Promise.all(
      activeGames.map(async (icon) => {
        const imageUrl = await import(`../assets/icons/${icon.img}.webp`);
        return { ...icon, url: imageUrl.default };
      })
    ).then(setIcons);
  };

  useEffect(() => {
    if (gamesData.length > 0) {
      updateActiveGames(gamesData, groupId);
    }
  }, [groupId, gamesData]);

  const handleGameClick = (id, route) => {
    window.open(`${route}?gameId=${id}`, "_blank");
  };

  const handleGroupChange = (e) => {
    setGroupId(e.target.value);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto sm:mt-8 md:mt-16 lg:mt-18 xl:mt-20">
        <div className="mb-8">
          <select
            onChange={handleGroupChange}
            value={groupId}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">SUCCESSIVE PROCESSING</option>
            <option value="2">SIMULTANEOUS PROCESSING</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {icons.length > 0 ? (
              icons.map((icon, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div
                    className="block cursor-pointer"
                    onClick={() => handleGameClick(icon.gameId, icon.route)}
                  >
                    <div className="p-6">
                      <img
                        src={icon.url}
                        alt={icon.name}
                        className="w-full h-48 object-contain"
                      />
                    </div>
                    <div className="p-6 bg-blue-500 text-white text-center">
                      <h3 className="text-xl font-semibold mb-2">{icon.name}</h3>
                      <p className="text-sm">{icon.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 text-lg">No active games available in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}