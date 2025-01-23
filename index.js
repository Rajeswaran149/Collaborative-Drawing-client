// Define base URL for your server (you can set it based on environment or deployment)
// const base_url = 'https://collaborative-drawing-server.vercel.app'; 
const base_url = 'http://localhost:5000'; 

// Initialize Socket.IO connection
let socket = io(base_url, {
  transports: ['websocket'],
  reconnectionAttempts: 5,  
  reconnectionDelay: 1000,  
  reconnectionDelayMax: 5000,  
  timeout: 20000, 
});

const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSizeSlider = document.getElementById("brushSize");
const userNotifications = document.getElementById("userNotifications");

let isDrawing = false;
let brushColor = localStorage.getItem("brushColor") || colorPicker.value;
let brushSize = localStorage.getItem("brushSize") || brushSizeSlider.value;
let username = "User" + Math.floor(Math.random() * 1000);

// Set initial preferences from localStorage
colorPicker.value = brushColor;
brushSizeSlider.value = brushSize;

// Update preferences on change
colorPicker.addEventListener("input", (e) => {
  brushColor = e.target.value;
  localStorage.setItem("brushColor", brushColor);
});

brushSizeSlider.addEventListener("input", (e) => {
  brushSize = e.target.value;
  localStorage.setItem("brushSize", brushSize);
});

// Handle drawing on the canvas
canvas.addEventListener("mousedown", (e) => startDrawing(e));
canvas.addEventListener("mousemove", (e) => draw(e));
canvas.addEventListener("mouseup", () => stopDrawing());
canvas.addEventListener("mouseout", () => stopDrawing());

// Start drawing
function startDrawing(event) {
  isDrawing = true;
  draw(event);
}

// Stop drawing
function stopDrawing() {
  isDrawing = false;
  ctx.beginPath();
}

// Draw on the canvas and send the coordinates to the Socket.IO server
function draw(event) {
  if (!isDrawing) return;

  const x = event.offsetX;
  const y = event.offsetY;

  // Draw on the canvas
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = brushColor;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);

  // Send drawing data to the server via Socket.IO
  socket.emit('message', JSON.stringify({
    type: "draw",
    x: x,
    y: y,
    brushColor: brushColor,
    brushSize: brushSize,
  }));
}

// Reset the canvas
function resetCanvas() {
  socket.emit('message', JSON.stringify({ type: "reset_canvas" }));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Handle incoming Socket.IO messages
socket.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    processMessage(message);
  } catch (error) {
    console.error("Error parsing message:", error);
  }
});

function processMessage(message) {
  switch (message.type) {
    case "draw":
      drawReceivedData(message);
      break;
    case "user_connected":
      notifyUser(message.username + " has joined");
      break;
    case "user_disconnected":
      notifyUser(message.username + " has left");
      break;
    case "reset_canvas":
      resetCanvasReceived();
      break;
  }
}

// Handle drawing data received from another user
function drawReceivedData(data) {
  ctx.lineWidth = data.brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = data.brushColor;
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(data.x, data.y);
}

// Notify all users when a user joins or leaves
function notifyUser(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  userNotifications.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Handle canvas reset received from server
function resetCanvasReceived() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Notify server when a new user connects
socket.on('connect', () => {
  socket.emit('message', JSON.stringify({
    type: "user_connected",
    username: username,
  }));
});

// Handle disconnections and attempt reconnection
socket.on('disconnect', () => {
  userNotifications.innerHTML = '<div style="color: red;">Reconnecting...</div>';
  setTimeout(() => {
    socket.connect();
  }, 3000);
});

// Handle reconnect attempts and notify the user
socket.on('reconnect_attempt', (attemptNumber) => {
  userNotifications.innerHTML = `<div>Reconnecting... Attempt ${attemptNumber}</div>`;
});

// Handle successful reconnection
socket.on('reconnect', () => {
  userNotifications.innerHTML = '<div style="color: green;">Reconnected successfully!</div>';
  // Notify server again about the connection
  socket.emit('message', JSON.stringify({
    type: "user_connected",
    username: username,
  }));
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error("Connection error:", error);
  userNotifications.innerHTML = '<div style="color: red;">Connection Error!</div>';
});
