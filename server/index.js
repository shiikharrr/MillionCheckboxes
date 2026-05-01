const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const redisClient = require("./redis");

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
const checkboxStates = {};

// WebSocket connection
wss.on("connection", (ws) => {
  console.log("🟢 New client connected");

  // Send existing states to new user
  ws.send(
    JSON.stringify({
      type: "initial-state",
      states: checkboxStates,
    })
  );

  // Listen for messages
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // Checkbox update event
    if (data.type === "toggle") {
      checkboxStates[data.id] = data.checked;

      // Broadcast to ALL users
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