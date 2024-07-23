const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");


app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.render("index");
});

let checkboxStates = Array(100).fill(false);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.emit("initialState", checkboxStates);


  socket.on("checkboxChange", (data) => {
    checkboxStates[data.index] = data.checked;
    io.emit("checkboxUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});