const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyJWT = require("../middlewares/verifyJWT");

// Rozpocznij farming
router.post("/start", verifyJWT, async (req, res) => {
  const { telegramId } = req.user;

  try {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000); // 8 godzin

    await db.query(
      "INSERT INTO farming_sessions (user_id, start_time, end_time) VALUES ($1, $2, $3)",
      [telegramId, startTime, endTime]
    );

    res.status(200).json({ success: true, endTime });
  } catch (error) {
    console.error("Error starting farming session:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Odbierz punkty za zakończoną sesję
router.post("/:sessionId/claim", verifyJWT, async (req, res) => {
  const { telegramId } = req.user;
  const { sessionId } = req.params;

  try {
    const sessionResult = await db.query(
      "SELECT * FROM farming_sessions WHERE id = $1 AND user_id = $2",
      [sessionId, telegramId]
    );

    if (sessionResult.rowCount === 0) {
      return res.status(404).json({ error: "Farming session not found." });
    }

    const session = sessionResult.rows[0];
    const now = new Date();

    if (now < new Date(session.end_time)) {
      return res.status(400).json({ error: "Farming session is not yet completed." });
    }

    if (session.status === "claimed") {
      return res.status(400).json({ error: "Farming session already claimed." });
    }

    const points = 200; // Konfigurowalna liczba punktów za farming
    await db.query(
      "UPDATE farming_sessions SET status = 'claimed', points_awarded = $1 WHERE id = $2",
      [points, sessionId]
    );
    await db.query(
      "UPDATE users SET points = points + $1 WHERE telegram_id = $2",
      [points, telegramId]
    );

    res.status(200).json({ success: true, points });
  } catch (error) {
    console.error("Error claiming farming points:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = router;
