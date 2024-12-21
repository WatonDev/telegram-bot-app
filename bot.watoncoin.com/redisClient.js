const redis = require("redis");

// Utwórz klient Redis
const redisClient = redis.createClient({
  host: "127.0.0.1", // Adres serwera Redis
  port: 6379,        // Domyślny port Redis
  password: process.env.REDIS_PASSWORD, // Hasło ustawione w redis.conf
});

// Obsługa błędów
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Połączenie z Redis
redisClient.connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Could not connect to Redis:", err));

module.exports = redisClient;
