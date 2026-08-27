const SOCKET_EVENTS = require("../constants/socketEvents");
const { validateSendReactionPayload } = require("../validators/reactionValidator");
const reactionService = require("../services/reactionService");

const registerReactionHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.SEND_REACTION, (payload, acknowledgement) => {
    const validation = validateSendReactionPayload(payload);

    if (!validation.isValid) {
      acknowledgement({
        success: false,
        error: validation.error,
      });
      return;
    }

    const result = reactionService.createReaction({
      socketId: socket.id,
      emoji: validation.value.emoji,
    });

    if (!result.success) {
      acknowledgement({
        success: false,
        error: result.error,
      });
      return;
    }

    io.to(result.roomId).emit(SOCKET_EVENTS.REACTION_RECEIVED, result.reaction);

    acknowledgement({
      success: true,
      reaction: result.reaction,
    });
  });
};

module.exports = registerReactionHandlers;