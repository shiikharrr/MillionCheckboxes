const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const {
  redisClient,
  publisher,
  subscriber,
} = require("./redis");
const checkRateLimit = require("./rateLimiter");

const app = express();
const PORT = 3000;

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store checkbox states
// const checkboxStates = {};

subscriber.subscribe("checkbox-updates", (message) => {
  const data = JSON.parse(message);

  // Broadcast to all websocket clients
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

// WebSocket connection
wss.on("connection", async (ws) => {
  console.log("🟢 Client connected");

  // Load all checkbox states from Redis
  const states = await redisClient.hGetAll("checkboxes");

  // Send current states to user
  ws.send(
    JSON.stringify({
      type: "initial-state",
      states,
    })
  );

  // Listen for checkbox updates
  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    const indentifier = `user-${ws._socket.remoteAddress}`;

    const allowed = await checkRateLimit(indentifier);

    if (!allowed) {
      ws.send(
        JSON.stringify({
          type: "rate-limit",
          message: "Too many actions. Please wait.",
        })
      );
    
    return;
    }

    if (data.type === "toggle") {

      // Save checkbox state in Redis
      await redisClient.hSet(
        "checkboxes",
        data.id,
        data.checked
      );

      // Broadcast update to all users
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

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});