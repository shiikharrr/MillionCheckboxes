const { redisClient } = require("./redis");

const MAX_ACTIONS = 20;

const WINDOW_SIZE = 10; // seconds

async function checkRateLimit(identifier) {
  const key = `rate-limit:${identifier}`;

  // Current request count
  const current = await redisClient.incr(key);

  // Set expiry on first request
  if (current === 1) {
    await redisClient.expire(key, WINDOW_SIZE);
  }

  // Check limit exceeded
  if (current > MAX_ACTIONS) {
    return false;
  }

  return true;
}

module.exports = checkRateLimit;