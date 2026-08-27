const roomStore = require("../store/roomStore");

const validateTargetSocketPayload = (payload) => {
  if (!payload || typeof payload.targetSocketId !== "string") {
    return {
      isValid: false,
      error: "Target socket ID is required.",
    };
  }

  const targetSocketId = payload.targetSocketId.trim();

  if (!targetSocketId) {
    return {
      isValid: false,
      error: "Target socket ID is invalid.",
    };
  }

  return {
    isValid: true,
    value: {
      targetSocketId,
    },
  };
};

const validateHostAndTargetInSameRoom = (socketId, payload) => {
  const payloadValidation = validateTargetSocketPayload(payload);

  if (!payloadValidation.isValid) {
    return payloadValidation;
  }

  const room = roomStore.findRoomBySocketId(socketId);

  if (!room) {
    return {
      isValid: false,
      error: "Socket is not in a room.",
    };
  }

  const requester = roomStore.findParticipantBySocketId(room.roomId, socketId);

  if (!requester) {
    return {
      isValid: false,
      error: "Requester not found in room.",
    };
  }

  if (requester.role !== "host") {
    return {
      isValid: false,
      error: "Only the host can perform this action.",
    };
  }

  const targetParticipant = roomStore.findParticipantBySocketId(
    room.roomId,
    payloadValidation.value.targetSocketId
  );

  if (!targetParticipant) {
    return {
      isValid: false,
      error: "Target participant not found in this room.",
    };
  }

  return {
    isValid: true,
    value: {
      roomId: room.roomId,
      requester,
      targetParticipant,
    },
  };
};

module.exports = {
  validateHostAndTargetInSameRoom,
};