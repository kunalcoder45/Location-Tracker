import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("send-location", (data) => {
    io.emit("recived-location", { id: socket.id, ...data });
    console.log("Received location", data);
  });

  socket.on('send-name', (name) => {
    console.log("User's Name:", name); // Log name to VS Code terminal
  });

  socket.on("disconnect", () => {
    io.emit("user-disconnected, socket.id");
    console.log("A user disconnected");
  });
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for the 'send-location' event
  socket.on("send-location", (data) => {
    console.log("Received location:", data); // Logging the received location
    // Broadcast the location to all other clients (except the sender)
    socket.broadcast.emit("recived-location", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(5000, () => {
  console.log(`Server is running on port ${server.address().port}`);
});
