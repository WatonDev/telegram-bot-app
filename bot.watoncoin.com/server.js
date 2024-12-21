require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;

if (!TELEGRAM_BOT_TOKEN || !JWT_SECRET) {
  console.error("TELEGRAM_BOT_TOKEN or JWT_SECRET is missing in environment variables.");
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error:", err));

app.use(bodyParser.json());

// Middleware for verifying JWT
function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authorization token is missing." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    req.user = decoded;
    next();
  });
}

app.post('/api/webhook', async (req, res) => {
  const message = req.body.message;

  if (!message) return res.sendStatus(200);

  const chatId = message.chat?.id;
  const text = message.text;

  if (text === '/start' && chatId) {
    try {
      const username = message.chat?.username || "User";

      const replyMarkup = {
        inline_keyboard: [
          [{ text: 'Launch App', web_app: { url: `https://app.watoncoin.com?telegram_id=${chatId}` } }],
          [{ text: 'Join Community', url: 'https://t.me/waton_en' }],
          [{ text: 'Join Channel', url: 'https://t.me/waton_tg' }],
          [{ text: 'Follow on X', url: 'https://x.com/waton_tg' }],
        ],
      };

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: `🎉 Welcome to WATON, @${username}!\n\nClick the buttons below to explore more:`,
        reply_markup: JSON.stringify(replyMarkup),
      });

      console.log(`Handled /start command for user ${chatId}`);
    } catch (error) {
      console.error("Error handling /start command:", error.response?.data || error.message);
    }
  }

  res.sendStatus(200);
});

app.post("/api/register", async (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ error: "Invalid initData" });
  }

  try {
    const telegramData = validateTelegramInitData(initData, TELEGRAM_BOT_TOKEN);

    const result = await pool.query(
      `INSERT INTO users (telegram_id, username, first_time, registered_at, last_interaction, seen_welcome, photo_url, points)
       VALUES ($1, $2, $3, NOW(), NOW(), FALSE, $4, $5)
       ON CONFLICT (telegram_id) DO UPDATE SET last_interaction = NOW()
       RETURNING *`,
      [
        telegramData.id,
        telegramData.username || null,
        true,
        telegramData.photo_url || null,
        0,
      ]
    );

    const user = result.rows[0];
    const token = jwt.sign({ telegramId: user.telegram_id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ success: true, user, token });
  } catch (error) {
    console.error("Error in /api/register:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users/points", verifyJWT, async (req, res) => {
  const { telegramId } = req.user;

  try {
    const result = await pool.query(
      "SELECT points FROM users WHERE telegram_id = $1",
      [telegramId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Points fetched for user:", result.rows[0].points);
    res.status(200).json({ points: result.rows[0].points });
  } catch (error) {
    console.error("Error in /users/points:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/update-points", verifyJWT, async (req, res) => {
  console.log("Incoming request body for /api/update-points:", req.body);
  console.log("Decoded JWT for /api/update-points:", req.user);

  const { telegramId } = req.user;
  const { points } = req.body;

  if (typeof points !== "number") {
    console.error("Invalid points value for /api/update-points:", points);
    return res.status(400).json({ error: "Invalid points value." });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET points = $1 WHERE telegram_id = $2 RETURNING points",
      [points, telegramId]
    );

    if (result.rowCount === 0) {
      console.error("User not found for /api/update-points:", telegramId);
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ success: true, points: result.rows[0].points });
  } catch (error) {
    console.error("Error in /api/update-points:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/leaderboard", verifyJWT, async (req, res) => {
  const { telegramId } = req.user;

  try {
    const result = await pool.query(
      "SELECT username, points FROM users ORDER BY points DESC LIMIT 10"
    );

    const leaderboard = result.rows.map((row, index) => ({
      username: row.username,
      points: row.points,
      isCurrentUser: row.username === telegramId, // Oznacz aktualnego użytkownika
    }));

    const userRankResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE points > (SELECT points FROM users WHERE telegram_id = $1)",
      [telegramId]
    );

    const userRank = parseInt(userRankResult.rows[0].count) + 1;

    console.log("Leaderboard data fetched:", leaderboard);

    res.status(200).json({ leaderboard, userRank });
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/seen-welcome", verifyJWT, async (req, res) => {
  console.log("Incoming request body for /api/seen-welcome:", req.body);
  console.log("Decoded JWT for /api/seen-welcome:", req.user);

  const { telegramId } = req.user;

  try {
    const result = await pool.query(
      "UPDATE users SET seen_welcome = TRUE WHERE telegram_id = $1 RETURNING seen_welcome",
      [telegramId]
    );

    if (result.rowCount === 0) {
      console.error("User not found for /api/seen-welcome:", telegramId);
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ success: true, seen_welcome: result.rows[0].seen_welcome });
  } catch (error) {
    console.error("Error in /api/seen-welcome:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function validateTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    throw new Error("Hash is missing in initData.");
  }

  const dataToCheck = Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataToCheck).digest("hex");

  if (computedHash !== hash) {
    throw new Error("Invalid hash for Telegram initData.");
  }

  return JSON.parse(params.get("user"));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
