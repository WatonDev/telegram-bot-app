require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const redisClient = require("./redisClient");
const pointsRoutes = require("./routes/points");
const friendsRoutes = require("./routes/friends");
const tasksRoutes = require("./routes/tasks");
const farmingRoutes = require("./routes/farming");
const usersRoutes = require("./routes/users");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is missing in environment variables.");
  process.exit(1);
}

// Middleware
app.use(bodyParser.json());
app.use("/api/points", pointsRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/farming", farmingRoutes);
app.use("/api/users", usersRoutes);

// Redis health check
app.get("/health/redis", async (req, res) => {
  try {
    await redisClient.ping();
    res.status(200).json({ status: "Redis is operational" });
  } catch (err) {
    console.error("Redis health check failed:", err);
    res.status(500).json({ status: "Redis is down" });
  }
});

// Webhook for Telegram Bot
app.post("/api/webhook", async (req, res) => {
  const message = req.body.message;

  if (!message) return res.sendStatus(200);

  const chatId = message.chat?.id;
  const text = message.text;

  if (text === "/start" && chatId) {
    try {
      const username = message.chat?.username || "User";

      // Insert or update user in the database
      await db.query(
        `INSERT INTO users (telegram_id, username, first_time, registered_at, last_interaction, seen_welcome, photo_url, points)
         VALUES ($1, $2, $3, NOW(), NOW(), FALSE, NULL, 0)
         ON CONFLICT (telegram_id) DO UPDATE SET last_interaction = NOW()`,
        [chatId, username, true]
      );

      // Respond with welcome message and buttons
      const replyMarkup = {
        inline_keyboard: [
          [{ text: "Launch App", web_app: { url: `https://app.watoncoin.com?telegram_id=${chatId}` } }],
          [{ text: "Join Community", url: "https://t.me/waton_en" }],
          [{ text: "Join Channel", url: "https://t.me/waton_tg" }],
          [{ text: "Follow on X", url: "https://x.com/waton_tg" }],
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
