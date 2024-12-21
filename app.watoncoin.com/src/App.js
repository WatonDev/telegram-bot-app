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
import { registerUser } from "./utils/api"; // Import funkcji rejestracji
import "./index.css";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
  const initApp = async () => {
    try {
      const initData = window.Telegram.WebApp.initData;
      if (!initData) {
        throw new Error("Telegram initData is missing");
      }

      console.log("Telegram initData:", initData);

      const user = await registerUser(initData);
      console.log("User registered successfully:", user);

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error during app initialization:", error.message);
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
        setUser((prev) => ({
          ...prev,
          seen_welcome: true,
          points: 1000, // Aktualizuj punkty lokalnie
        }));
      }
    } catch (error) {
      console.error("Error completing Welcome:", error.response?.data || error.message);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

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
