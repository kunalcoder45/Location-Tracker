import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for 'send-location' event
  socket.on("send-location", (data) => {
    console.log("Received location:", data);
    // Emit the location to all clients, including the sender
    io.emit("recived-location", { id: socket.id, ...data });
  });

  // Listen for 'send-name' event
  socket.on("send-name", (name) => {
    console.log("User's Name:", name);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

// Set EJS as the view engine
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Route to render the main page
app.get("/", (req, res) => {
  res.render("index");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${server.address().port}`);
});
