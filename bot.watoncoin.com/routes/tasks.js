const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyJWT = require("../middlewares/verifyJWT");

// Pobierz dostępne zadania
router.get("/", verifyJWT, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tasks");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Oznacz zadanie jako wykonane
router.post("/:taskId/complete", verifyJWT, async (req, res) => {
  const { telegramId } = req.user;
  const { taskId } = req.params;

  try {
    // Pobierz szczegóły zadania
    const taskResult = await db.query("SELECT points FROM tasks WHERE id = $1", [taskId]);
    if (taskResult.rowCount === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    const taskPoints = taskResult.rows[0].points;

    // Zaktualizuj punkty użytkownika
    await db.query(
      "UPDATE users SET points = points + $1 WHERE telegram_id = $2",
      [taskPoints, telegramId]
    );

    res.status(200).json({ success: true, pointsEarned: taskPoints });
  } catch (error) {
    console.error("Error completing task:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = router;
