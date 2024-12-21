import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Tasks from "./pages/Tasks";
import Stats from "./pages/Stats";
import Frens from "./pages/Frens";
import Premium from "./pages/Premium";
import "./index.css";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const initData = window.Telegram.WebApp.initData;

        const response = await axios.post("/api/register", { initData });
        const { user, token } = response.data;

        setUser(user);
        setToken(token);

        localStorage.setItem("jwtToken", token);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

const handleWelcomeComplete = async () => {
  try {
    const token = localStorage.getItem("jwtToken");

    // Aktualizacja punktów użytkownika
    await axios.post(
      "/api/update-points",
      { points: 1000 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Oznaczenie ekranu Welcome jako widzianego
    const response = await axios.post(
      "/api/seen-welcome",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      setUser((prev) => {
        console.log("Updating user state in Welcome:", {
          ...prev,
          seen_welcome: true,
          points: 1000,
        });
        return {
          ...prev,
          seen_welcome: true,
          points: 1000, // Aktualizuj punkty lokalnie
        };
      });
    }
  } catch (error) {
    console.error("Error completing Welcome:", error.response?.data || error.message);
  }
};

  return (
    <Router>
      <Routes>
        {!user?.seen_welcome ? (
          <Route path="*" element={<Welcome user={user} onComplete={handleWelcomeComplete} />} />
        ) : (
          <>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/stats" element={<Stats user={user} />} />
            <Route path="/frens" element={<Frens user={user} />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
