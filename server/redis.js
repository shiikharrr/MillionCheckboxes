require("dotenv").config();

const { createClient } =
  require("redis");

const redisConfig = {
  url: process.env.REDIS_URL,

  socket: {
    tls: true,
    rejectUnauthorized: false
  }
};

const redisClient =
  createClient(redisConfig);

const publisher =
  createClient(redisConfig);

const subscriber =
  createClient(redisConfig);

redisClient.on("error", (err) => {
  console.log(
    "Redis Error:",
    err
  );
});

async function connectRedis() {

  await redisClient.connect();

  await publisher.connect();

  await subscriber.connect();

  console.log(
    "Redis clients connected"
  );
}

connectRedis();

module.exports = {
  redisClient,
  publisher,
  subscriber
};