const ALLOWED_REACTIONS = ["❤️", "😂", "😮", "🔥", "👏"];

const validateSendReactionPayload = (payload) => {
  if (!payload || typeof payload.emoji !== "string") {
    return {
      isValid: false,
      error: "Reaction emoji is required.",
    };
  }

  if (!ALLOWED_REACTIONS.includes(payload.emoji)) {
    return {
      isValid: false,
      error: "Reaction emoji is not allowed.",
    };
  }

  return {
    isValid: true,
    value: {
      emoji: payload.emoji,
    },
  };
};

module.exports = {
  validateSendReactionPayload,
};