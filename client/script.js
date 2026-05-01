const grid = document.getElementById("grid");

const checkedCountElement =
  document.getElementById("checked-count");

const connectionStatus =
  document.getElementById("connection-status");

const registerBtn =
  document.getElementById("register-btn");

const loginBtn =
  document.getElementById("login-btn");

const usernameInput =
  document.getElementById("username");

const passwordInput =
  document.getElementById("password");

const authStatus =
  document.getElementById("auth-status");

let token = localStorage.getItem("token");

if (token) {
  authStatus.textContent = "Logged In";
}

let socket;

const TOTAL_CHECKBOXES = 1000;

const checkboxes = {};

function connectWebSocket() {

  let socketUrl =
    `ws://${window.location.host}`;

  if (token) {
    socketUrl += `?token=${token}`;
  }

  socket = new WebSocket(socketUrl);

  socket.onopen = () => {

    console.log(
      "WebSocket Connected"
    );

    connectionStatus.textContent =
      "Connected";
  };

  socket.onerror = (error) => {

    console.log(
      "Socket Error",
      error
    );

    connectionStatus.textContent =
      "Connection Error";
  };

  socket.onclose = () => {

    console.log(
      "Socket Closed"
    );

    connectionStatus.textContent =
      "Disconnected";
  };

  socket.onmessage = (event) => {

    const data =
      JSON.parse(event.data);

    if (
      data.type === "rate-limit"
    ) {

      alert(data.message);

      return;
    }

    if (
      data.type === "unauthorized"
    ) {

      alert(data.message);

      return;
    }

    if (
      data.type === "initial-state"
    ) {

      Object.keys(data.states)
        .forEach((id) => {

          if (
            checkboxes[id]
          ) {

            checkboxes[id].checked =
              data.states[id] ===
              "true";
          }
        });

      updateCheckedCount();
    }

    if (
      data.type === "update"
    ) {

      if (
        checkboxes[data.id]
      ) {

        checkboxes[data.id].checked =
          data.checked;
      }

      updateCheckedCount();
    }
  };
}

connectWebSocket();

for (
  let i = 0;
  i < TOTAL_CHECKBOXES;
  i++
) {

  const checkbox =
    document.createElement("input");

  checkbox.type = "checkbox";

  checkbox.dataset.id = i;

  checkboxes[i] = checkbox;

  checkbox.addEventListener(
    "change",
    () => {

      if (!token) {

        alert(
          "Login required to toggle checkboxes"
        );

        checkbox.checked =
          !checkbox.checked;

        return;
      }

      if (
        socket.readyState ===
        WebSocket.OPEN
      ) {

        socket.send(
          JSON.stringify({
            type: "toggle",
            id: i,
            checked: checkbox.checked,
          })
        );
      }

      updateCheckedCount();
    }
  );

  grid.appendChild(checkbox);
}

function updateCheckedCount() {

  let checked = 0;

  Object.values(checkboxes)
    .forEach((checkbox) => {

      if (checkbox.checked) {
        checked++;
      }
    });

  checkedCountElement.textContent =
    checked;
}

registerBtn.addEventListener(
  "click",
  async () => {

    const username =
      usernameInput.value;

    const password =
      passwordInput.value;

    const response =
      await fetch(
        "/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

    const data =
      await response.json();

    alert(data.message);
  }
);

loginBtn.addEventListener(
  "click",
  async () => {

    const username =
      usernameInput.value;

    const password =
      passwordInput.value;

    const response =
      await fetch(
        "/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

    const data =
      await response.json();

    if (data.token) {

      localStorage.setItem(
        "token",
        data.token
      );

      token = data.token;

      authStatus.textContent =
        "Logged In";

      socket.close();

      connectWebSocket();

      alert("Login successful");

    } else {

      alert(data.message);
    }
  }
);