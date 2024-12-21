const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyJWT = require("../middlewares/verifyJWT");

// Pobierz listę znajomych
router.get("/", verifyJWT, async (req, res) => {
  const { telegramId } = req.user;

  try {
    const result = await db.query(
      "SELECT username FROM users WHERE referral_id = $1",
      [telegramId]
    );

    const friends = result.rows.map((row) => row.username);

    res.status(200).json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = router;
