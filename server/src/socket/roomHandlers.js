const SOCKET_EVENTS = require("../constants/socketEvents");
const { validateCreateRoomPayload, validateJoinRoomPayload } = require("../validators/roomValidator");
const roomService = require("../services/roomService");
const playbackService = require("../services/playbackService");

const removeSocketsFromClosedRoom = (io, roomId) => {
  const socketRoom = io.sockets.adapter.rooms.get(roomId);

  if (!socketRoom) {
    return;
  }

  for (const socketId of socketRoom) {
    const roomSocket = io.sockets.sockets.get(socketId);

    if (roomSocket) {
      roomSocket.leave(roomId);
    }
  }
};

const handleRoomCleanup = (io, socket) => {
  const result = roomService.leaveRoom(socket.id);

  if (!result.success) {
    return result;
  }

  if (result.roomClosed) {
    io.to(result.roomId).emit(SOCKET_EVENTS.ROOM_CLOSED, {
      message: "The host left. This room has been closed.",
    });

    removeSocketsFromClosedRoom(io, result.roomId);

    return result;
  }

  socket.leave(result.roomId);

  io.to(result.roomId).emit(
    SOCKET_EVENTS.PARTICIPANTS_UPDATED,
    result.remainingParticipants
  );

  return result;
};

const registerRoomHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.CREATE_ROOM, (payload, acknowledgement) => {
    const validation = validateCreateRoomPayload(payload);

    if (!validation.isValid) {
      acknowledgement({
        success: false,
        error: validation.error,
      });
      return;
    }

    const result = roomService.createRoom(validation.value.username, socket.id);

    if (!result.success) {
      acknowledgement({
        success: false,
        error: result.error,
      });
      return;
    }

    socket.join(result.roomId);

    acknowledgement({
      success: true,
      roomId: result.roomId,
      participant: result.participant,
    });
  });

  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload, acknowledgement) => {
    const validation = validateJoinRoomPayload(payload);

    if (!validation.isValid) {
      acknowledgement({
        success: false,
        error: validation.error,
      });
      return;
    }

    const result = roomService.joinRoom(
      validation.value.roomId,
      validation.value.username,
      socket.id
    );

    if (!result.success) {
      acknowledgement({
        success: false,
        error: result.error,
      });
      return;
    }

    socket.join(result.roomId);

    const syncResult = playbackService.getSyncStateForRoom(result.roomId);

    if (syncResult.success) {
      socket.emit(SOCKET_EVENTS.SYNC_STATE, syncResult.syncState);
    }

    io.to(result.roomId).emit(
      SOCKET_EVENTS.PARTICIPANTS_UPDATED,
      result.participants
    );

    acknowledgement({
      success: true,
      roomId: result.roomId,
      participant: result.participant,
      participants: result.participants,
      syncState: syncResult.success ? syncResult.syncState : null,
    });
  });

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (acknowledgement) => {
    const result = handleRoomCleanup(io, socket);

    if (!result.success) {
      acknowledgement({
        success: false,
        error: result.error,
      });
      return;
    }

    acknowledgement({
      success: true,
      roomId: result.roomId,
      roomClosed: result.roomClosed,
      removedParticipant: result.removedParticipant,
      remainingParticipants: result.remainingParticipants,
    });
  });

  socket.on("disconnect", () => {
    handleRoomCleanup(io, socket);
  });
};

module.exports = registerRoomHandlers;