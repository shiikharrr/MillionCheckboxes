const grid = document.getElementById("grid");

const checkedCountElement =
  document.getElementById("checked-count");

const totalCountElement =
  document.getElementById("total-count");

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

// =======================
// AUTH
// =======================

let token =
  localStorage.getItem("token");

if (token) {
  authStatus.textContent =
    "Logged In";
}

// =======================
// WEBSOCKET
// =======================

let socket;

function connectWebSocket() {

  let socketUrl =
    `ws://${window.location.host}`;

  if (token) {
    socketUrl += `?token=${token}`;
  }

  socket =
    new WebSocket(socketUrl);

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

    // Rate limit
    if (
      data.type === "rate-limit"
    ) {

      alert(data.message);

      return;
    }

    // Unauthorized
    if (
      data.type === "unauthorized"
    ) {

      alert(data.message);

      return;
    }

    // Initial state
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

    // Live updates
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

// =======================
// CHECKBOXES
// =======================

const TOTAL_CHECKBOXES = 5000;

const CHUNK_SIZE = 100;

let renderedCount = 0;

const checkboxes = {};

totalCountElement.textContent =
  TOTAL_CHECKBOXES;

// =======================
// RENDER CHUNK
// =======================

function renderCheckboxChunk() {

  const fragment =
    document.createDocumentFragment();

  const end =
    Math.min(
      renderedCount + CHUNK_SIZE,
      TOTAL_CHECKBOXES
    );

  for (
    let i = renderedCount;
    i < end;
    i++
  ) {

    const checkbox =
      document.createElement(
        "input"
      );

    checkbox.type =
      "checkbox";

    checkbox.dataset.id = i;

    checkboxes[i] =
      checkbox;

    checkbox.addEventListener(
      "change",
      () => {

        // Require login
        if (!token) {

          alert(
            "Login required to toggle checkboxes"
          );

          checkbox.checked =
            !checkbox.checked;

          return;
        }

        // Send update
        if (
          socket.readyState ===
          WebSocket.OPEN
        ) {

          socket.send(
            JSON.stringify({
              type: "toggle",
              id: i,
              checked:
                checkbox.checked,
            })
          );
        }

        updateCheckedCount();
      }
    );

    fragment.appendChild(
      checkbox
    );
  }

  grid.appendChild(fragment);

  renderedCount = end;
}

// Initial render
renderCheckboxChunk();

// =======================
// LAZY LOADING
// =======================

const gridContainer =
  document.querySelector(
    ".grid-container"
  );

gridContainer.addEventListener(
  "scroll",
  () => {

    const nearBottom =

      gridContainer.scrollTop +
      gridContainer.clientHeight >=
      gridContainer.scrollHeight - 200;

    if (
      nearBottom &&
      renderedCount <
      TOTAL_CHECKBOXES
    ) {

      renderCheckboxChunk();
    }
  }
);

// =======================
// UPDATE COUNT
// =======================

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

// =======================
// REGISTER
// =======================

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

// =======================
// LOGIN
// =======================

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

      alert(
        "Login successful"
      );

    } else {

      alert(data.message);
    }
  }
);