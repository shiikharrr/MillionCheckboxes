const grid = document.getElementById("grid");

const checkedCountElement =
  document.getElementById("checked-count");

const connectionStatus =
  document.getElementById("connection-status");

// =======================
// AUTH ELEMENTS
// =======================

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
// AUTH STATE
// =======================

let token = localStorage.getItem("token");

if (token) {
  authStatus.textContent = "🟢 Logged In";
}

// =======================
// WEBSOCKET
// =======================

const socket = new WebSocket(
  `ws://${window.location.host}`
);

// =======================
// SOCKET EVENTS
// =======================

socket.onopen = () => {
  console.log("✅ WebSocket Connected");

  connectionStatus.textContent =
    "🟢 Connected";
};

socket.onerror = (error) => {
  console.log("❌ Socket Error", error);

  connectionStatus.textContent =
    "🔴 Error";
};

socket.onclose = () => {
  console.log("🔴 Socket Closed");

  connectionStatus.textContent =
    "🔴 Disconnected";
};

// =======================
// CHECKBOXES
// =======================

const TOTAL_CHECKBOXES = 1000;

const checkboxes = {};

// Create checkbox grid
for (let i = 0; i < TOTAL_CHECKBOXES; i++) {

  const checkbox =
    document.createElement("input");

  checkbox.type = "checkbox";

  checkbox.dataset.id = i;

  checkboxes[i] = checkbox;

  // Toggle checkbox
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
            checked: checkbox.checked,
          })
        );
      }

      updateCheckedCount();
    }
  );

  grid.appendChild(checkbox);
}

// =======================
// RECEIVE SOCKET EVENTS
// =======================

socket.onmessage = (event) => {

  const data =
    JSON.parse(event.data);

  // Rate limit
  if (data.type === "rate-limit") {

    alert(data.message);

    return;
  }

  // Initial state
  if (data.type === "initial-state") {

    Object.keys(data.states)
      .forEach((id) => {

        if (checkboxes[id]) {

          checkboxes[id].checked =
            data.states[id] === "true";
        }
      });

    updateCheckedCount();
  }

  // Live updates
  if (data.type === "update") {

    if (checkboxes[data.id]) {

      checkboxes[data.id].checked =
        data.checked;
    }

    updateCheckedCount();
  }
};

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
        "🟢 Logged In";

      alert("Login successful");

    } else {

      alert(data.message);
    }
  }
);