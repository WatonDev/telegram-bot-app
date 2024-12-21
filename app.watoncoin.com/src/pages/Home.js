import React, { useEffect, useState } from "react";
import MenuBar from "../components/MenuBar";
import { fetchUserPoints } from "../utils/api";

const Home = ({ user }) => {
  const [points, setPoints] = useState(null);

  useEffect(() => {
  if (!user?.points) {
    fetchUserPoints()
      .then((points) => {
        console.log("Points fetched in Home (sync):", points);
        setPoints(points);
      })
      .catch((err) => {
        console.error("Error fetching user points in Home:", err);
        setPoints(0);
      });
  } else {
    setPoints(user.points); // Użyj danych z `user`, jeśli są dostępne
  }
}, [user]);

  const photoUrl = user?.photo_url
    ? decodeURIComponent(user.photo_url)
    : "default-avatar.png";

  return (
    <div className="page-container">
      <div className="card">
        <img
          src={photoUrl}
          alt="Avatar"
          style={{ width: "80px", borderRadius: "50%", marginBottom: "10px" }}
        />
        <h2>{user?.username || "User"}</h2>
        <p>Points: {points !== null ? points : "Loading..."}</p>
      </div>
      <MenuBar />
    </div>
  );
};

export default Home;
