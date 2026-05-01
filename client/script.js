const TOTAL_CHECKBOXES = 1000;
const CHUNK_SIZE = 200;

let renderedCount = 0;
let checkedCount = 0;

const checkboxes = {};
const checkboxStates = {};

let token = localStorage.getItem("token") || null;

const protocol =
  window.location.protocol === "https:"
    ? "wss:"
    : "ws:";

const socket = new WebSocket(
  `${protocol}//${window.location.host}`
);

const grid = document.getElementById("grid");
const checkedCountElement =
  document.getElementById("checked-count");

const connectionStatus =
  document.getElementById("connection-status");

const authStatus =
  document.getElementById("auth-status");

const usernameInput =
  document.getElementById("username");

const passwordInput =
  document.getElementById("password");

const registerButton =
  document.getElementById("register-btn");

const loginButton =
  document.getElementById("login-btn");

if (token) {
  authStatus.textContent = "Logged In";
} else {
  authStatus.textContent = "Guest Mode";
}

socket.addEventListener("open", () => {
  connectionStatus.textContent = "Connected";

  if (token) {
    socket.send(
      JSON.stringify({
        type: "auth",
        token
      })
    );
  }
});

socket.addEventListener("close", () => {
  connectionStatus.textContent =
    "Disconnected";
});

socket.addEventListener("error", () => {
  connectionStatus.textContent =
    "Connection Error";
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "init") {
    Object.assign(
      checkboxStates,
      data.checkboxes
    );

    checkedCount =
      Object.values(checkboxStates)
        .filter(Boolean).length;

    updateCheckedCount();

    renderCheckboxChunk();
  }

  if (data.type === "update") {
    checkboxStates[data.id] =
      data.checked;

    if (checkboxes[data.id]) {
      checkboxes[data.id].checked =
        data.checked;
    }

    checkedCount =
      Object.values(checkboxStates)
        .filter(Boolean).length;

    updateCheckedCount();
  }

  if (data.type === "auth-success") {
    authStatus.textContent =
      "Logged In";
  }

  if (data.type === "rate-limit") {
    alert(data.message);
  }

  if (data.type === "error") {
    alert(data.message);
  }
});

registerButton.addEventListener(
  "click",
  async () => {
    const username =
      usernameInput.value.trim();

    const password =
      passwordInput.value.trim();

    if (!username || !password) {
      alert(
        "Please enter username and password"
      );
      return;
    }

    try {
      const response = await fetch(
        "/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            username,
            password
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      token = data.token;

      localStorage.setItem(
        "token",
        token
      );

      authStatus.textContent =
        "Logged In";

      socket.send(
        JSON.stringify({
          type: "auth",
          token
        })
      );

      alert("Registered successfully");
    } catch (error) {
      alert("Registration failed");
    }
  }
);

loginButton.addEventListener(
  "click",
  async () => {
    const username =
      usernameInput.value.trim();

    const password =
      passwordInput.value.trim();

    if (!username || !password) {
      alert(
        "Please enter username and password"
      );
      return;
    }

    try {
      const response = await fetch(
        "/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            username,
            password
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      token = data.token;

      localStorage.setItem(
        "token",
        token
      );

      authStatus.textContent =
        "Logged In";

      socket.send(
        JSON.stringify({
          type: "auth",
          token
        })
      );

      alert("Logged in successfully");
    } catch (error) {
      alert("Login failed");
    }
  }
);

function renderCheckboxChunk() {
  const fragment =
    document.createDocumentFragment();

  const limit = Math.min(
    renderedCount + CHUNK_SIZE,
    TOTAL_CHECKBOXES
  );

  for (
    let i = renderedCount;
    i < limit;
    i++
  ) {
    const checkbox =
      document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.dataset.id = i;

    checkbox.checked =
      checkboxStates[i] || false;

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

        socket.send(
          JSON.stringify({
            type: "toggle",
            id: i,
            checked: checkbox.checked
          })
        );
      }
    );

    fragment.appendChild(checkbox);
  }

  grid.appendChild(fragment);

  renderedCount = limit;
}

function updateCheckedCount() {
  checkedCountElement.textContent =
    checkedCount;
}

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