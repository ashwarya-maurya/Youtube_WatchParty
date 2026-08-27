const MAX_MESSAGE_LENGTH = 500;

const validateSendMessagePayload = (payload) => {
  if (!payload || typeof payload.text !== "string") {
    return {
      isValid: false,
      error: "Message text is required.",
    };
  }

  const text = payload.text.trim();

  if (!text) {
    return {
      isValid: false,
      error: "Message cannot be empty.",
    };
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`,
    };
  }

  return {
    isValid: true,
    value: {
      text,
    },
  };
};

module.exports = {
  validateSendMessagePayload,
};