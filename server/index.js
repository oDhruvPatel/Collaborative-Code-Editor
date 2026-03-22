const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");
const cors = require('cors');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
const getAllConnectedClients = async (roomId) => {
  const sockets = await io.in(roomId).fetchSockets();
  return sockets.map((socket) => {
    return {
      socketId: socket.id,
      username: userSocketMap[socket.id],
    };
  });
};

io.on("connection", (socket) => {
  // console.log('Socket connected', socket.id);
  socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
    console.log(`User ${username} joining room ${roomId}`);
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    
    // Tiny delay to ensure join is registered in adapter
    setTimeout(async () => {
      const clients = await getAllConnectedClients(roomId);
      console.log(`Current clients in ${roomId}:`, clients);
      
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      });
    }, 50);
  });

  // sync the code
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });
  // when new user join the room all the code which are there are also shows on that persons editor
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // leave room
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    // leave all the room
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });

  // Execute code
  socket.on(ACTIONS.EXECUTE_CODE, ({ code, roomId }) => {
    try {
      // Execute the code
      const result = eval(code);

      // Emit the output to the client
      io.to(roomId).emit(ACTIONS.CODE_EXECUTED, { output: result });
    } catch (error) {
      console.error("Error executing code:", error);
      io.to(socket.id).emit(ACTIONS.CODE_EXECUTED, { output: `Error: ${error.message}` });
    }
  });
});

// Database connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected Successfully..."))
  .catch((err) => console.log("Database not connected...", err));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use('/', require('./routes/authRoutes'));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port number ${PORT}`));
