require("dotenv").config();

const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

const {
  redisClient,
  publisher,
  subscriber
} = require("./redis");

const {
  register,
  login
} = require("./auth");

const rateLimiter =
  require("./rateLimiter");

const app = express();

app.use(express.json());

const server =
  http.createServer(app);

const wss =
  new WebSocket.Server({
    server
  });

const PORT =
  process.env.PORT || 3000;

const JWT_SECRET =
  process.env.JWT_SECRET || "secretkey";

app.use(
  express.static(
    path.join(__dirname, "../client")
  )
);

subscriber.subscribe(
  "checkbox-updates",
  (message) => {

    const data =
      JSON.parse(message);

    wss.clients.forEach((client) => {

      if (
        client.readyState ===
        WebSocket.OPEN
      ) {

        client.send(
          JSON.stringify({
            type: "update",
            id: data.id,
            checked: data.checked
          })
        );
      }
    });
  }
);

app.post(
  "/register",
  register
);

app.post(
  "/login",
  login
);

wss.on(
  "connection",
  async (ws) => {

    console.log(
      "Client connected"
    );

    ws.isAuthenticated = false;

    let savedCheckboxes =
      await redisClient.get(
        "checkboxes"
      );

    if (!savedCheckboxes) {

      savedCheckboxes = "{}";
    }

    ws.send(
      JSON.stringify({
        type: "init",
        checkboxes: JSON.parse(
          savedCheckboxes
        )
      })
    );

    ws.on(
      "message",
      async (message) => {

        const data =
          JSON.parse(message);

        if (
          data.type === "auth"
        ) {

          try {

            const decoded =
              jwt.verify(
                data.token,
                JWT_SECRET
              );

            ws.user = decoded;

            ws.isAuthenticated = true;

            ws.send(
              JSON.stringify({
                type:
                  "auth-success"
              })
            );

          } catch {

            ws.send(
              JSON.stringify({
                type: "error",
                message:
                  "Invalid token"
              })
            );
          }

          return;
        }

        if (
          data.type === "toggle"
        ) {

          if (
            !ws.isAuthenticated
          ) {

            ws.send(
              JSON.stringify({
                type: "error",
                message:
                  "Authentication required"
              })
            );

            return;
          }

          const allowed =
            await rateLimiter(
              ws.user.username
            );

          if (!allowed) {

            ws.send(
              JSON.stringify({
                type:
                  "rate-limit",
                message:
                  "Too many requests"
              })
            );

            return;
          }

          let currentCheckboxes =
            await redisClient.get(
              "checkboxes"
            );

          if (
            !currentCheckboxes
          ) {

            currentCheckboxes =
              "{}";
          }

          currentCheckboxes =
            JSON.parse(
              currentCheckboxes
            );

          currentCheckboxes[
            data.id
          ] = data.checked;

          await redisClient.set(
            "checkboxes",
            JSON.stringify(
              currentCheckboxes
            )
          );

          await publisher.publish(
            "checkbox-updates",
            JSON.stringify({
              id: data.id,
              checked:
                data.checked
            })
          );
        }
      }
    );

    ws.on(
      "close",
      () => {

        console.log(
          "Client disconnected"
        );
      }
    );
  }
);

server.listen(
  PORT,
  () => {

    console.log(
      `Server running at http://localhost:${PORT}`
    );
  }
);