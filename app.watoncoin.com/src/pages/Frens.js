import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MenuBar from "../components/MenuBar";
import { fetchFriends, generateReflink } from "../utils/api";

const Frens = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.telegram_id) {
        try {
          const data = await fetchFriends(user.telegram_id);
          setFriends(data || []);
        } catch (err) {
          console.error("Failed to fetch friends list:", err);
          setError("Could not load friends. Please try again later.");
          toast.error("Failed to load friends list.");
        }
      }
    };

    fetchData();
  }, [user]);

  const handleCopy = () => {
    if (user && user.telegram_id) {
      const link = generateReflink(user.telegram_id);
      navigator.clipboard.writeText(link);
      toast.success("Reflink copied!", {
        position: "top-center",
        autoClose: 3000,
      });
    } else {
      toast.error("Cannot generate referral link.");
    }
  };

  return (
    <div className="page-container">
      <h1>Invite Friends</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : friends.length > 0 ? (
        friends.map((friend, idx) => (
          <div key={idx} className="card">
            {friend.username}
          </div>
        ))
      ) : (
        <div className="card">No friends invited yet!</div>
      )}
      <button className="button-primary" onClick={handleCopy}>
        Copy Referral Link
      </button>
      <ToastContainer position="top-center" autoClose={3000} />
      <MenuBar />
    </div>
  );
};

export default Frens;
