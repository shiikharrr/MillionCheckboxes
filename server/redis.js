const redis = require("redis");

// Create Redis client
const redisClient = redis.createClient({
  url: "redis://localhost:6379",
});

// Connect Redis
redisClient.connect();

// Success log
redisClient.on("connect", () => {
  console.log("🟢 Redis connected");
});

// Error handling
redisClient.on("error", (err) => {
  console.log("🔴 Redis Error:", err);
});

module.exports = redisClient;