const express = require("express");
const router = express.Router();
const redisClient = require("../redisClient");
const db = require("../db");

// Middleware do weryfikacji JWT
const verifyJWT = require("../middlewares/verifyJWT");

// Odczytaj punkty użytkownika
router.get("/", verifyJWT, async (req, res) => {
  const { telegramId } = req.user;

  try {
    // Spróbuj pobrać punkty z Redis
    const cachedPoints = await redisClient.get(`points:${telegramId}`);
    if (cachedPoints) {
      return res.status(200).json({ points: parseInt(cachedPoints, 10) });
    }

    // Jeśli brak w Redis, pobierz z bazy danych
    const result = await db.query("SELECT points FROM users WHERE telegram_id = $1", [telegramId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const points = result.rows[0].points;

    // Zapisz punkty w Redis na 5 minut
    await redisClient.setEx(`points:${telegramId}`, 300, points);

    res.status(200).json({ points });
  } catch (error) {
    console.error("Error fetching points:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Zaktualizuj punkty użytkownika
router.post("/", verifyJWT, async (req, res) => {
  const { telegramId } = req.user;
  const { points } = req.body;

  if (typeof points !== "number") {
    return res.status(400).json({ error: "Invalid points value." });
  }

  try {
    const result = await db.query(
      "UPDATE users SET points = points + $1 WHERE telegram_id = $2 RETURNING points",
      [points, telegramId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const updatedPoints = result.rows[0].points;

    // Zaktualizuj punkty w Redis
    await redisClient.setEx(`points:${telegramId}`, 300, updatedPoints);

    res.status(200).json({ points: updatedPoints });
  } catch (error) {
    console.error("Error updating points:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = router;
