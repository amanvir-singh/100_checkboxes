const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const authRouter = require('./public/routes/auth');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");


app.use(express.static(path.join(__dirname, "public")));

const middleware = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
});


app.use(middleware);
app.use(passport.authenticate('session'));

app.use('/', authRouter);

io.use((socket, next) => {
  middleware(socket.request, {}, next);
});


io.use((socket, next) => {
  passport.initialize()(socket.request, {}, () => {
    passport.session()(socket.request, {}, next);
  });
});


io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('Unauthorized'));
  }
});

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

let checkboxStates = Array(100).fill(false);

io.on("connection", (socket) => {
  const user = socket.request.user;
  console.log(`New client connected`);

  socket.emit("initialState", checkboxStates);


  socket.on("checkboxChange", (data) => {
    checkboxStates[data.index] = data.checked;
    io.emit("checkboxUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});