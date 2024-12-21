import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import axios from "axios";
import Confetti from "react-confetti";
import "./welcome.css";

const Welcome = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const isPremium = user?.points >= 4000;
  const targetPoints = isPremium ? 4000 : 1000;

  useEffect(() => {
    if (index === 1) {
      let current = 0;
      const interval = setInterval(() => {
        current += Math.ceil(targetPoints / 50);
        if (current >= targetPoints) {
          current = targetPoints;
          clearInterval(interval);
        }
        setPoints(current);
      }, 40);
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
      setPoints(0);
    }
  }, [index, targetPoints]);

  const slides = [
    {
      title: `Welcome, ${user?.username || "Guest"}!`,
      description: [
        "Waton is gathering the crew,",
        "and is happy you are here so early.",
        "You are now a true Waton OG, congratulations!",
      ],
      image: "https://i.imgur.com/46ztoK7.png",
    },
    {
      title: "Claim Your Rewards!",
      description: `Your Telegram Account: ${isPremium ? "PREMIUM" : "FREE"}`,
      points: targetPoints,
      button: "Claim Reward",
    },
  ];

  const handleNext = () => setIndex((prev) => Math.min(prev + 1, slides.length - 1));
  const handlePrev = () => setIndex((prev) => Math.max(prev - 1, 0));

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
  });

const handleFinish = async () => {
  try {
    const token = localStorage.getItem("jwtToken");

    const pointsResponse = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/api/update-points`,
      { points: 1000 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const welcomeResponse = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/api/seen-welcome`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (welcomeResponse.data.success) {
      onComplete();
      navigate("/");
    } else {
      alert("Failed to complete welcome flow. Please try again.");
    }
  } catch (error) {
    console.error("Error during handleFinish:", error.response?.data || error.message);
    alert("An error occurred while claiming your reward. Please try again.");
  }
};

  return (
    <Container {...handlers} className="welcome-container">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {/* Obszary kliknięcia */}
      <div
  className={`clickable-area left ${index === 0 ? "inactive" : ""}`}
  onClick={index > 0 ? handlePrev : null}
></div>
<div
  className={`clickable-area right ${index === slides.length - 1 ? "inactive" : ""}`}
  onClick={index < slides.length - 1 ? handleNext : null}
></div>

      <motion.div
        key={index}
        initial={{ opacity: 0, x: index === 0 ? 100 : -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="slide-content"
      >
        {index === 0 && (
          <>
            <Typography className="welcome-title">{slides[index].title}</Typography>
            <motion.img
              src={slides[index].image}
              alt="Logo"
              className="logo"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            />
            {slides[index].description.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.5, duration: 0.6 }}
              >
                <Typography className="slide-description">{line}</Typography>
              </motion.div>
            ))}
          </>
        )}

        {index === 1 && (
          <>
            <motion.div
              className="lightning-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              transition={{ duration: 0.8 }}
            >
              🧀
            </motion.div>
            <Typography className="points-highlight">🎉 You get {points} points!</Typography>
            <Button className="button-primary" onClick={handleFinish}>
              {slides[index].button}
            </Button>
          </>
        )}
      </motion.div>

      <Box className="pagination">
        {slides.map((_, idx) => (
          <span key={idx} className={`dot ${idx === index ? "active" : ""}`}></span>
        ))}
      </Box>

      <Typography className="tap-hint">
        {slides[index].button ? 'Click "Claim Reward" to continue' : "Tap right or swipe to continue"}
      </Typography>
    </Container>
  );
};

export default Welcome;
