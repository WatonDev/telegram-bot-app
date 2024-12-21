import React, { useEffect, useState } from "react";
import MenuBar from "../components/MenuBar";
import { fetchUserPoints } from "../utils/api";

const Home = ({ user }) => {
  const [points, setPoints] = useState(null);

  useEffect(() => {
  fetchUserPoints()
    .then((points) => {
      setPoints(points);
    })
    .catch((err) => {
      console.error("Error fetching user points:", err);
      setPoints(0);
    });
}, []);

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
