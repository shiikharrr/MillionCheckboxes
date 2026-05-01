const grid = document.getElementById("grid");

const checkedCountElement = document.getElementById("checked-count");

const connectionStatus = document.getElementById("connection-status");

const TOTAL_CHECKBOXES = 1000;

const checkboxes = {};

// Create websocket connection
const socket = new WebSocket(`ws://${window.location.host}`);

// =======================
// SOCKET EVENTS
// =======================

socket.onopen = () => {
  console.log("✅ Connected");

  connectionStatus.textContent = "🟢 Connected";
};

socket.onerror = (error) => {
  console.log("❌ Socket Error", error);

  connectionStatus.textContent = "🔴 Error";
};

socket.onclose = () => {
  console.log("🔴 Disconnected");

  connectionStatus.textContent = "🔴 Disconnected";
};

// =======================
// CREATE CHECKBOXES
// =======================

for (let i = 0; i < TOTAL_CHECKBOXES; i++) {
  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";

  checkbox.dataset.id = i;

  checkboxes[i] = checkbox;

  checkbox.addEventListener("change", () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "toggle",
          id: i,
          checked: checkbox.checked,
        })
      );
    }

    updateCheckedCount();
  });

  grid.appendChild(checkbox);
}

// =======================
// RECEIVE MESSAGES
// =======================

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "initial-state") {
    Object.keys(data.states).forEach((id) => {
      if (checkboxes[id]) {
        checkboxes[id].checked = data.states[id];
      }
    });

    updateCheckedCount();
  }

  if (data.type === "update") {
    if (checkboxes[data.id]) {
      checkboxes[data.id].checked = data.checked;
    }

    updateCheckedCount();
  }
};

// =======================
// UPDATE COUNT
// =======================

function updateCheckedCount() {
  let checked = 0;

  Object.values(checkboxes).forEach((checkbox) => {
    if (checkbox.checked) {
      checked++;
    }
  });

  checkedCountElement.textContent = checked;
}