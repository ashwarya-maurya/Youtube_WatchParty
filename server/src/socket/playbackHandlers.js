const SOCKET_EVENTS = require("../constants/socketEvents");
const { validateChangeVideoPayload, validatePlaybackTimePayload, validatePlaybackPermission } = require("../validators/playbackValidator");
const playbackService = require("../services/playbackService");

const sendFailureAcknowledgement = (acknowledgement, error) => {
  acknowledgement({
    success: false,
    error,
  });
};

const sendSuccessAcknowledgement = (acknowledgement, playbackState) => {
  acknowledgement({
    success: true,
    playbackState,
  });
};

const handlePlaybackStatusChange = ({
  socket,
  action,
  isPlaying,
  payload,
  acknowledgement,
}) => {
  const payloadValidation = validatePlaybackTimePayload(payload);

  if (!payloadValidation.isValid) {
    sendFailureAcknowledgement(acknowledgement, payloadValidation.error);
    return;
  }

  const permissionValidation = validatePlaybackPermission(socket.id);

  if (!permissionValidation.isValid) {
    sendFailureAcknowledgement(acknowledgement, permissionValidation.error);
    return;
  }

  const roomId = permissionValidation.room.roomId;

  const result = playbackService.updatePlaybackStatus({
    roomId,
    currentTime: payloadValidation.value.currentTime,
    isPlaying,
  });

  if (!result.success) {
    sendFailureAcknowledgement(acknowledgement, result.error);
    return;
  }

  socket.to(roomId).emit(SOCKET_EVENTS.PLAYBACK_UPDATED, {
    action,
    playbackState: result.playbackState,
  });

  sendSuccessAcknowledgement(acknowledgement, result.playbackState);
};

const handleSeek = ({ socket, payload, acknowledgement }) => {
  const payloadValidation = validatePlaybackTimePayload(payload);

  if (!payloadValidation.isValid) {
    sendFailureAcknowledgement(acknowledgement, payloadValidation.error);
    return;
  }

  const permissionValidation = validatePlaybackPermission(socket.id);

  if (!permissionValidation.isValid) {
    sendFailureAcknowledgement(acknowledgement, permissionValidation.error);
    return;
  }

  const roomId = permissionValidation.room.roomId;

  const result = playbackService.seekPlayback({
    roomId,
    currentTime: payloadValidation.value.currentTime,
  });

  if (!result.success) {
    sendFailureAcknowledgement(acknowledgement, result.error);
    return;
  }

  socket.to(roomId).emit(SOCKET_EVENTS.PLAYBACK_UPDATED, {
    action: "seek",
    playbackState: result.playbackState,
  });

  sendSuccessAcknowledgement(acknowledgement, result.playbackState);
};

const registerPlaybackHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.CHANGE_VIDEO, (payload, acknowledgement) => {
    const payloadValidation = validateChangeVideoPayload(payload);

    if (!payloadValidation.isValid) {
      sendFailureAcknowledgement(acknowledgement, payloadValidation.error);
      return;
    }

    const permissionValidation = validatePlaybackPermission(socket.id);

    if (!permissionValidation.isValid) {
      sendFailureAcknowledgement(acknowledgement, permissionValidation.error);
      return;
    }

    const roomId = permissionValidation.room.roomId;

    const result = playbackService.changeVideo({
      roomId,
      videoId: payloadValidation.value.videoId,
    });

    if (!result.success) {
      sendFailureAcknowledgement(acknowledgement, result.error);
      return;
    }

    io.to(roomId).emit(SOCKET_EVENTS.VIDEO_CHANGED, result.playbackState);

    sendSuccessAcknowledgement(acknowledgement, result.playbackState);
  });

  socket.on(SOCKET_EVENTS.PLAY, (payload, acknowledgement) => {
    handlePlaybackStatusChange({
      socket,
      action: "play",
      isPlaying: true,
      payload,
      acknowledgement,
    });
  });

  socket.on(SOCKET_EVENTS.PAUSE, (payload, acknowledgement) => {
    handlePlaybackStatusChange({
      socket,
      action: "pause",
      isPlaying: false,
      payload,
      acknowledgement,
    });
  });

  socket.on(SOCKET_EVENTS.SEEK, (payload, acknowledgement) => {
    handleSeek({
      socket,
      payload,
      acknowledgement,
    });
  });
};

module.exports = registerPlaybackHandlers;