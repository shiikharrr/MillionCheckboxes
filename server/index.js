const express = require("express");

const path = require("path");

const http = require("http");

const WebSocket = require("ws");

const jwt = require("jsonwebtoken");

const authRoutes = require("./auth");

const {
  redisClient,
  publisher,
  subscriber,
} = require("./redis");

const checkRateLimit =
  require("./rateLimiter");

const app = express();

const PORT = 3000;

const JWT_SECRET =
  "super-secret-key";

const server =
  http.createServer(app);

const wss =
  new WebSocket.Server({
    server,
  });

app.use(
  express.static(
    path.join(
      __dirname,
      "../client"
    )
  )
);

app.use("/auth", authRoutes);

subscriber.subscribe(
  "checkbox-updates",
  (message) => {

    const data =
      JSON.parse(message);

    wss.clients.forEach(
      (client) => {

        if (
          client.readyState ===
          WebSocket.OPEN
        ) {

          client.send(
            JSON.stringify({
              type: "update",
              id: data.id,
              checked:
                data.checked,
            })
          );
        }
      }
    );
  }
);

wss.on(
  "connection",
  async (ws, req) => {

    console.log(
      "Client connected"
    );

    const url =
      new URL(
        req.url,
        `http://${req.headers.host}`
      );

    const token =
      url.searchParams.get(
        "token"
      );

    let authenticatedUser =
      null;

    if (token) {

      try {

        authenticatedUser =
          jwt.verify(
            token,
            JWT_SECRET
          );

        console.log(
          "Authenticated:",
          authenticatedUser.username
        );

      } catch (error) {

        console.log(
          "Invalid token"
        );
      }
    }

    const states =
      await redisClient.hGetAll(
        "checkboxes"
      );

    ws.send(
      JSON.stringify({
        type: "initial-state",
        states,
      })
    );

    ws.on(
      "message",
      async (message) => {

        const data =
          JSON.parse(message);

        const identifier =
          ws._socket.remoteAddress;

        const allowed =
          await checkRateLimit(
            identifier
          );

        if (!allowed) {

          ws.send(
            JSON.stringify({
              type:
                "rate-limit",

              message:
                "Too many actions. Please slow down.",
            })
          );

          return;
        }

        if (
          data.type === "toggle"
        ) {

          if (
            !authenticatedUser
          ) {

            ws.send(
              JSON.stringify({
                type:
                  "unauthorized",

                message:
                  "Login required",
              })
            );

            return;
          }

          await redisClient.hSet(
            "checkboxes",
            data.id,
            data.checked
          );

          await publisher.publish(
            "checkbox-updates",

            JSON.stringify({
              id: data.id,
              checked:
                data.checked,
            })
          );
        }
      }
    );

    ws.on("close", () => {

      console.log(
        "Client disconnected"
      );
    });
  }
);

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "../client/index.html"
    )
  );
});

server.listen(PORT, () => {

  console.log(
    `Server running at http://localhost:${PORT}`
  );
});