const env = require("./config/env");

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const registerRoomHandlers = require("./socket/roomHandlers");
const registerPlaybackHandlers = require("./socket/playbackHandlers");
const registerParticipantHandlers = require("./socket/participantHandlers");
const registerChatHandlers = require("./socket/chatHandlers");
const registerReactionHandlers = require("./socket/reactionHandlers");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  
  registerRoomHandlers(io, socket);
  registerPlaybackHandlers(io, socket);
  registerParticipantHandlers(io, socket);
  registerChatHandlers(io, socket);
  registerReactionHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});