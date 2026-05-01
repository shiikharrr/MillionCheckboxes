const express = require("express");

const path = require("path");

const http = require("http");

const WebSocket = require("ws");

const authRoutes = require("./auth");

const {
  redisClient,
  publisher,
  subscriber,
} = require("./redis");

const checkRateLimit = require("./rateLimiter");

const app = express();

const PORT = 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({
  server,
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

// Auth routes
app.use("/auth", authRoutes);

// =======================
// REDIS PUB/SUB
// =======================

subscriber.subscribe("checkbox-updates", (message) => {
  const data = JSON.parse(message);

  // Broadcast update to all websocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "update",
          id: data.id,
          checked: data.checked,
        })
      );
    }
  });
});

// =======================
// WEBSOCKET CONNECTION
// =======================

wss.on("connection", async (ws) => {
  console.log("🟢 Client connected");

  // Load states from Redis
  const states = await redisClient.hGetAll(
    "checkboxes"
  );

  // Send current state to user
  ws.send(
    JSON.stringify({
      type: "initial-state",
      states,
    })
  );

  // Listen for messages
  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    // =======================
    // RATE LIMITING
    // =======================

    const identifier = ws._socket.remoteAddress;

    const allowed = await checkRateLimit(
      identifier
    );

    if (!allowed) {
      ws.send(
        JSON.stringify({
          type: "rate-limit",
          message:
            "Too many actions. Please slow down.",
        })
      );

      return;
    }

    // =======================
    // TOGGLE EVENT
    // =======================

    if (data.type === "toggle") {
      // Save checkbox state in Redis
      await redisClient.hSet(
        "checkboxes",
        data.id,
        data.checked
      );

      // Publish update
      await publisher.publish(
        "checkbox-updates",
        JSON.stringify({
          id: data.id,
          checked: data.checked,
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("🔴 Client disconnected");
  });
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../client/index.html")
  );
});

// Start server
server.listen(PORT, () => {
  console.log(
    `🚀 Server running at http://localhost:${PORT}`
  );
});