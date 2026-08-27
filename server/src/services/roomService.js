const roomStore = require("../store/roomStore");
const generateRoomCode = require("../utils/generateRoomCode");

const MAX_ROOM_CODE_ATTEMPTS = 5;

const createRoom = (username, socketId) => {
  const existingRoom = roomStore.findRoomBySocketId(socketId);

  if (existingRoom) {
    return {
      success: false,
      error: "You are already in a room.",
    };
  }

  let roomId = null;

  for (let attempt = 0; attempt < MAX_ROOM_CODE_ATTEMPTS; attempt += 1) {
    const candidateCode = generateRoomCode();

    if (!roomStore.roomExists(candidateCode)) {
      roomId = candidateCode;
      break;
    }
  }

  if (!roomId) {
    return {
      success: false,
      error: "Unable to create room. Please try again.",
    };
  }

  roomStore.createRoom(roomId);

  const participant = {
    socketId,
    username,
    role: "host",
  };

  roomStore.addParticipant(roomId, participant);

  return {
    success: true,
    roomId,
    participant,
  };
};

const joinRoom = (roomId, username, socketId) => {
  if (!roomStore.roomExists(roomId)) {
    return {
      success: false,
      error: "Room not found. Please check the room code.",
    };
  }

  const existingRoom = roomStore.findRoomBySocketId(socketId);

  if (existingRoom) {
    return {
      success: false,
      error: "You are already in a room.",
    };
  }

  const participant = {
    socketId,
    username,
    role: "participant",
  };

  const addedParticipant = roomStore.addParticipant(roomId, participant);

  if (!addedParticipant) {
    return {
      success: false,
      error: "Unable to join room. Please try again.",
    };
  }

  return {
    success: true,
    roomId,
    participant: addedParticipant,
    participants: roomStore.getParticipants(roomId),
  };
};

const leaveRoom = (socketId) => {
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

  const removedParticipant = roomStore.removeParticipantBySocketId(
    room.roomId,
    socketId
  );

  if (!removedParticipant) {
    return {
      success: false,
      error: "Unable to remove participant from room.",
    };
  }

  const wasHost = removedParticipant.role === "host";
  const remainingParticipants = roomStore.getParticipants(room.roomId) || [];
  const shouldCloseRoom = wasHost || remainingParticipants.length === 0;

  if (shouldCloseRoom) {
    roomStore.deleteRoom(room.roomId);

    return {
      success: true,
      roomId: room.roomId,
      removedParticipant,
      roomClosed: true,
      remainingParticipants: [],
    };
  }

  return {
    success: true,
    roomId: room.roomId,
    removedParticipant,
    roomClosed: false,
    remainingParticipants,
  };
};

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
};