const roomStore = require("../store/roomStore");

const getSharedPlaybackState = (room) => {
  return {
    videoId: room.videoId,
    currentTime: room.currentTime,
    isPlaying: room.isPlaying,
    updatedAt: room.updatedAt,
  };
};

const changeVideo = ({ roomId, videoId }) => {
  const updatedRoom = roomStore.updatePlaybackState(roomId, {
    videoId,
    currentTime: 0,
    isPlaying: false,
  });

  if (!updatedRoom) {
    return {
      success: false,
      error: "Room not found.",
    };
  }

  return {
    success: true,
    playbackState: getSharedPlaybackState(updatedRoom),
  };
};

const updatePlaybackStatus = ({ roomId, currentTime, isPlaying }) => {
  const updatedRoom = roomStore.updatePlaybackState(roomId, {
    currentTime,
    isPlaying,
  });

  if (!updatedRoom) {
    return {
      success: false,
      error: "Room not found.",
    };
  }

  return {
    success: true,
    playbackState: getSharedPlaybackState(updatedRoom),
  };
};

const seekPlayback = ({ roomId, currentTime }) => {
  const updatedRoom = roomStore.updatePlaybackState(roomId, {
    currentTime,
  });

  if (!updatedRoom) {
    return {
      success: false,
      error: "Room not found.",
    };
  }

  return {
    success: true,
    playbackState: getSharedPlaybackState(updatedRoom),
  };
};

const getSyncStateForRoom = (roomId) => {
  const room = roomStore.getRoom(roomId);

  if (!room) {
    return {
      success: false,
      error: "Room not found.",
    };
  }

  let currentTime = room.currentTime;

  if (room.videoId && room.isPlaying) {
    currentTime = room.currentTime + (Date.now() - room.updatedAt) / 1000;
  }

  return {
    success: true,
    syncState: {
      videoId: room.videoId,
      isPlaying: room.isPlaying,
      currentTime,
      updatedAt: room.updatedAt,
    },
  };
};

module.exports = {
  changeVideo,
  updatePlaybackStatus,
  seekPlayback,
  getSyncStateForRoom,
};