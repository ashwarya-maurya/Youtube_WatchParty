const roomStore = require("../store/roomStore");

const YOUTUBE_VIDEO_ID_LENGTH = 11;
const YOUTUBE_VIDEO_ID_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
const PLAYBACK_CONTROL_ROLES = ["host", "moderator"];


const isValidYouTubeVideoId = (videoId) => {
  if (videoId.length !== YOUTUBE_VIDEO_ID_LENGTH) {
    return false;
  }

  return videoId
    .split("")
    .every((character) => YOUTUBE_VIDEO_ID_CHARACTERS.includes(character));
};

const validateChangeVideoPayload = (payload) => {
  if (!payload || typeof payload.videoId !== "string") {
    return {
      isValid: false,
      error: "Video ID is required.",
    };
  }

  const videoId = payload.videoId.trim();

  if (!isValidYouTubeVideoId(videoId)) {
    return {
      isValid: false,
      error: "Invalid YouTube video ID.",
    };
  }

  return {
    isValid: true,
    value: {
      videoId,
    },
  };
};

const validatePlaybackPermission = (socketId) => {
  const room = roomStore.findRoomBySocketId(socketId);

  if (!room) {
    return {
      isValid: false,
      error: "Socket is not in a room.",
    };
  }

  const participant = roomStore.findParticipantBySocketId(room.roomId, socketId);

  if (!participant) {
    return {
      isValid: false,
      error: "Participant not found in room.",
    };
  }

  if (!PLAYBACK_CONTROL_ROLES.includes(participant.role)) {
    return {
      isValid: false,
      error: "You do not have permission to control playback.",
    };
  }

  return {
    isValid: true,
    room,
    participant,
  };
};

const validatePlaybackTimePayload = (payload) => {
  if (!payload || typeof payload.currentTime !== "number") {
    return {
      isValid: false,
      error: "Current time is required.",
    };
  }

  if (!Number.isFinite(payload.currentTime)) {
    return {
      isValid: false,
      error: "Current time must be a finite number.",
    };
  }

  if (payload.currentTime < 0) {
    return {
      isValid: false,
      error: "Current time cannot be negative.",
    };
  }

  return {
    isValid: true,
    value: {
      currentTime: payload.currentTime,
    },
  };
};

module.exports = {
  validateChangeVideoPayload,
  validatePlaybackTimePayload,
  validatePlaybackPermission,
};