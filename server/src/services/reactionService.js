const { randomUUID } = require("crypto");
const roomStore = require("../store/roomStore");

const createReaction = ({ socketId, emoji }) => {
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
    reaction: {
      id: randomUUID(),
      username: participant.username,
      emoji,
      timestamp: Date.now(),
    },
  };
};

module.exports = {
  createReaction,
};