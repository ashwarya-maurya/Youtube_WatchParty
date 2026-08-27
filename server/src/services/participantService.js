const roomStore = require("../store/roomStore");

const promoteParticipantToModerator = ({ roomId, requester, targetParticipant }) => {
  if (requester.socketId === targetParticipant.socketId) {
    return {
      success: false,
      error: "Host cannot promote themselves.",
    };
  }

  if (targetParticipant.role === "moderator") {
    return {
      success: false,
      error: "Participant is already a moderator.",
    };
  }

  if (targetParticipant.role !== "participant") {
    return {
      success: false,
      error: "Only participants can be promoted to moderator.",
    };
  }

  const updatedParticipant = roomStore.updateParticipantRole(
    roomId,
    targetParticipant.socketId,
    "moderator"
  );

  if (!updatedParticipant) {
    return {
      success: false,
      error: "Target participant not found.",
    };
  }

  return {
    success: true,
    updatedParticipant,
    participants: roomStore.getParticipants(roomId),
  };
};

const removeParticipant = ({ roomId, requester, targetParticipant }) => {
  if (requester.socketId === targetParticipant.socketId) {
    return {
      success: false,
      error: "Use leave room to remove yourself.",
    };
  }

  if (targetParticipant.role === "host") {
    return {
      success: false,
      error: "Host cannot be removed through this action.",
    };
  }

  if (
    targetParticipant.role !== "participant" &&
    targetParticipant.role !== "moderator"
  ) {
    return {
      success: false,
      error: "Only participants or moderators can be removed.",
    };
  }

  const removedParticipant = roomStore.removeParticipantBySocketId(
    roomId,
    targetParticipant.socketId
  );

  if (!removedParticipant) {
    return {
      success: false,
      error: "Target participant not found.",
    };
  }

  return {
    success: true,
    removedParticipant,
    participants: roomStore.getParticipants(roomId),
  };
};

module.exports = {
  promoteParticipantToModerator,
  removeParticipant,
};