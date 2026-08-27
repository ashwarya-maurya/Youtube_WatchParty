const SOCKET_EVENTS = require("../constants/socketEvents");
const { validateHostAndTargetInSameRoom } = require("../validators/participantValidator");
const participantService = require("../services/participantService");

const registerParticipantHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.ASSIGN_ROLE, (payload, acknowledgement) => {
    const validation = validateHostAndTargetInSameRoom(socket.id, payload);

    if (!validation.isValid) {
      acknowledgement({
        success: false,
        error: validation.error,
      });
      return;
    }

    const result = participantService.promoteParticipantToModerator({
      roomId: validation.value.roomId,
      requester: validation.value.requester,
      targetParticipant: validation.value.targetParticipant,
    });

    if (!result.success) {
      acknowledgement({
        success: false,
        error: result.error,
      });
      return;
    }

    io.to(validation.value.roomId).emit(
      SOCKET_EVENTS.PARTICIPANTS_UPDATED,
      result.participants
    );

    acknowledgement({
      success: true,
      updatedParticipant: result.updatedParticipant,
      participants: result.participants,
    });
  });

  socket.on(SOCKET_EVENTS.REMOVE_PARTICIPANT, (payload, acknowledgement) => {
    const validation = validateHostAndTargetInSameRoom(socket.id, payload);

    if (!validation.isValid) {
      acknowledgement({
        success: false,
        error: validation.error,
      });
      return;
    }

    const roomId = validation.value.roomId;
    const targetSocketId = validation.value.targetParticipant.socketId;

    const result = participantService.removeParticipant({
      roomId,
      requester: validation.value.requester,
      targetParticipant: validation.value.targetParticipant,
    });

    if (!result.success) {
      acknowledgement({
        success: false,
        error: result.error,
      });
      return;
    }

    const targetSocket = io.sockets.sockets.get(targetSocketId);

    if (targetSocket) {
      targetSocket.emit(SOCKET_EVENTS.REMOVED_FROM_ROOM, {
        message: "You were removed from the room by the host.",
      });

      targetSocket.leave(roomId);
    }

    io.to(roomId).emit(
      SOCKET_EVENTS.PARTICIPANTS_UPDATED,
      result.participants
    );

    acknowledgement({
      success: true,
      removedParticipant: result.removedParticipant,
      participants: result.participants,
    });
  });
};

module.exports = registerParticipantHandlers;