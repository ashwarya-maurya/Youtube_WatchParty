const { randomUUID } = require("crypto");
const roomStore = require("../store/roomStore");

const createChatMessage = ({ socketId, text }) => {
  const room = roomStore.findRoomBySocketId(socketId);

  if (!room) {
    return {
      success: false,
      error: "Socket is not in a room.",
    };
  }

  const participant = roomStore.findParticipantBySocketId(room.roomId, socketId);

  if (!participant) {
    return {
      success: false,
      error: "Participant not found in room.",
    };
  }

  return {
    success: true,
    roomId: room.roomId,
    message: {
      id: randomUUID(),
      username: participant.username,
      text,
      timestamp: Date.now(),
    },
  };
};

module.exports = {
  createChatMessage,
};