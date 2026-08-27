const SOCKET_EVENTS = require("../constants/socketEvents");
const { validateSendMessagePayload } = require("../validators/chatValidator");
const chatService = require("../services/chatService");

const registerChatHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.SEND_MESSAGE, (payload, acknowledgement) => {
    const validation = validateSendMessagePayload(payload);

    if (!validation.isValid) {
      acknowledgement({
        success: false,
        error: validation.error,
      });
      return;
    }

    const result = chatService.createChatMessage({
      socketId: socket.id,
      text: validation.value.text,
    });

    if (!result.success) {
      acknowledgement({
        success: false,
        error: result.error,
      });
      return;
    }

    io.to(result.roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, result.message);

    acknowledgement({
      success: true,
      message: result.message,
    });
  });
};

module.exports = registerChatHandlers;