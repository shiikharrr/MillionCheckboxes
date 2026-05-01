require("dotenv").config();

const redis = require("redis");

// Main Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

// Publisher client
const publisher = redisClient.duplicate();

// Subscriber client
const subscriber = redisClient.duplicate();

// Connect all Redis clients
async function connectRedis() {
  await redisClient.connect();

  await publisher.connect();

  await subscriber.connect();

  console.log("🟢 Redis clients connected");
}

connectRedis();

// Error handling
redisClient.on("error", (err) => {
  console.log("🔴 Redis Error:", err);
});

publisher.on("error", (err) => {
  console.log("🔴 Publisher Error:", err);
});

subscriber.on("error", (err) => {
  console.log("🔴 Subscriber Error:", err);
});

module.exports = {
  redisClient,
  publisher,
  subscriber,
};