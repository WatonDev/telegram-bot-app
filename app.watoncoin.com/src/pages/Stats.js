import React, { useEffect, useState } from "react";
import MenuBar from "../components/MenuBar";
import { fetchLeaderboard } from "../utils/api";

const Stats = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (user?.telegram_id) {
    const fetchData = async () => {
      try {
        const data = await fetchLeaderboard(user.telegram_id);
        console.log("Leaderboard fetched in Stats:", data);
        if (data && Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
          setUserRank(data.userRank);
        } else {
          setError("Leaderboard data is not in the expected format.");
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard in Stats:", err);
        setError("Could not load leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  } else {
    setError("User data is missing. Please refresh the page.");
    setLoading(false);
  }
}, [user]);

  if (!user) {
    return (
      <div className="page-container">
        <p className="error-message">User data is missing. Please refresh the page.</p>
        <MenuBar />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Leaderboard</h1>
      {loading ? (
        <p>Loading leaderboard...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={idx} className={entry.isCurrentUser ? "highlight" : ""}>
                    <td>{idx + 1}</td>
                    <td>{entry.username}</td>
                    <td>{entry.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="user-rank">
            <h3>Your Rank: {userRank}</h3>
          </div>
        </>
      )}
      <MenuBar />
    </div>
  );
};

export default Stats;
