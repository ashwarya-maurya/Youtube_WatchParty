const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const validateUsername = (usernameValue) => {
  if (typeof usernameValue !== "string") {
    return {
      isValid: false,
      error: "Username is required.",
    };
  }

  const username = usernameValue.trim();

  if (!username) {
    return {
      isValid: false,
      error: "Username is invalid.",
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      error: "Username must be 30 characters or less.",
    };
  }

  return {
    isValid: true,
    username,
  };
};

const validateRoomId = (roomIdValue) => {
  if (typeof roomIdValue !== "string") {
    return {
      isValid: false,
      error: "Room ID is required.",
    };
  }

  const roomId = roomIdValue.trim().toUpperCase();

  if (roomId.length !== ROOM_CODE_LENGTH) {
    return {
      isValid: false,
      error: "Room ID must be 6 characters.",
    };
  }

  const hasOnlyAllowedCharacters = roomId
    .split("")
    .every((character) => ROOM_CODE_CHARACTERS.includes(character));

  if (!hasOnlyAllowedCharacters) {
    return {
      isValid: false,
      error: "Room ID contains invalid characters.",
    };
  }

  return {
    isValid: true,
    roomId,
  };
};

const validateCreateRoomPayload = (payload) => {
  if (!payload) {
    return {
      isValid: false,
      error: "Username is required.",
    };
  }

  const usernameValidation = validateUsername(payload.username);

  if (!usernameValidation.isValid) {
    return {
      isValid: false,
      error: usernameValidation.error,
    };
  }

  return {
    isValid: true,
    value: {
      username: usernameValidation.username,
    },
  };
};

const validateJoinRoomPayload = (payload) => {
  if (!payload) {
    return {
      isValid: false,
      error: "Room ID and username are required.",
    };
  }

  const roomIdValidation = validateRoomId(payload.roomId);

  if (!roomIdValidation.isValid) {
    return {
      isValid: false,
      error: roomIdValidation.error,
    };
  }

  const usernameValidation = validateUsername(payload.username);

  if (!usernameValidation.isValid) {
    return {
      isValid: false,
      error: usernameValidation.error,
    };
  }

  return {
    isValid: true,
    value: {
      roomId: roomIdValidation.roomId,
      username: usernameValidation.username,
    },
  };
};

module.exports = {
  validateCreateRoomPayload,
  validateJoinRoomPayload,
};
