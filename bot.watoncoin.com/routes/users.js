const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/register", async (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ error: "Invalid initData" });
  }

  try {
    // Rozpakowanie danych Telegrama
    const telegramData = JSON.parse(Buffer.from(initData, "base64").toString("utf8"));
    const telegramId = telegramData.id;
    const username = telegramData.username || null;
    const photoUrl = telegramData.photo_url || null;

    // Domyślne punkty na start
    const defaultPoints = parseInt(process.env.DEFAULT_POINTS_REGISTRATION, 10) || 1000;

    // Rejestracja lub aktualizacja użytkownika
    const result = await db.query(
      `INSERT INTO users (telegram_id, username, photo_url, first_time, registered_at, last_interaction, seen_welcome, points)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, $6)
       ON CONFLICT (telegram_id) DO UPDATE SET last_interaction = NOW()
       RETURNING *`,
      [telegramId, username, photoUrl, true, false, defaultPoints]
    );

    const user = result.rows[0];

    // Zwrócenie danych użytkownika
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in /api/register:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
