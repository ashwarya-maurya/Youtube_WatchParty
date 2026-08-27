const rooms = new Map();

const createRoom = (roomId) => {
  const room = {
    roomId,
    participants: [],
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    updatedAt: Date.now(),
  };

  rooms.set(roomId, room);
  return room;
};

const getRoom = (roomId) => {
  return rooms.get(roomId);
};

const roomExists = (roomId) => {
  return rooms.has(roomId);
};

const deleteRoom = (roomId) => {
  return rooms.delete(roomId);
};

const addParticipant = (roomId, participant) => {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  const participantAlreadyExists = room.participants.some(
    (currentParticipant) => currentParticipant.socketId === participant.socketId
  );

  if (participantAlreadyExists) {
    return null;
  }

  room.participants.push(participant);
  return participant;
};

const findParticipantBySocketId = (roomId, socketId) => {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  return room.participants.find((participant) => participant.socketId === socketId) || null;
};

const removeParticipantBySocketId = (roomId, socketId) => {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  const participantIndex = room.participants.findIndex(
    (participant) => participant.socketId === socketId
  );

  if (participantIndex === -1) {
    return null;
  }

  const [removedParticipant] = room.participants.splice(participantIndex, 1);
  return removedParticipant;
};

const getParticipants = (roomId) => {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  return room.participants;
};

const updatePlaybackState = (roomId, playbackState) => {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  room.videoId = playbackState.videoId ?? room.videoId;
  room.isPlaying = playbackState.isPlaying ?? room.isPlaying;
  room.currentTime = playbackState.currentTime ?? room.currentTime;
  room.updatedAt = Date.now();

  return room;
};

const findRoomBySocketId = (socketId) => {
  for (const room of rooms.values()) {
    const participant = room.participants.find(
      (currentParticipant) => currentParticipant.socketId === socketId
    );

    if (participant) {
      return room;
    }
  }

  return null;
};

const updateParticipantRole = (roomId, targetSocketId, newRole) => {
  const participant = findParticipantBySocketId(roomId, targetSocketId);

  if (!participant) {
    return null;
  }

  participant.role = newRole;
  return participant;
};

module.exports = {
  createRoom,
  getRoom,
  roomExists,
  deleteRoom,
  addParticipant,
  findParticipantBySocketId,
  removeParticipantBySocketId,
  getParticipants,
  updatePlaybackState,
  findRoomBySocketId,
  updateParticipantRole,
};
