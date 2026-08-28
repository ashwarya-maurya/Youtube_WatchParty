import { useState } from "react";

const ChatPanel = ({ messages, onSendMessage, chatError, isConnected }) => {
  const [text, setText] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      setValidationError("Message cannot be empty.");
      return;
    }

    setValidationError("");
    onSendMessage(trimmedText);
    setText("");
  };

  return (
    <section className="chat-panel">
      <h2>Chat</h2>

      {chatError && (
        <p className="error-message" role="alert">
          {chatError}
        </p>
      )}

      {validationError && (
        <p className="error-message" role="alert">
          {validationError}
        </p>
      )}

      {messages.length === 0 ? (
        <p className="status-message" role="status">
          No messages yet.
        </p>
      ) : (
        <ul className="chat-message-list">
          {messages.map((message) => (
            <li className="chat-message" key={message.id}>
              <div className="chat-message-header">
                <span className="chat-message-author">{message.username}</span>
                <time dateTime={new Date(message.timestamp).toISOString()}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>

              <p className="chat-message-text">{message.text}</p>
            </li>
          ))}
        </ul>
      )}

      <form className="chat-form" onSubmit={handleSubmit}>
        <label htmlFor="chat-message">Message</label>

        <div className="chat-form-row">
          <input
            id="chat-message"
            type="text"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setValidationError("");
            }}
            placeholder="Type a message"
            disabled={!isConnected}
          />

          <button type="submit" disabled={!isConnected}>
            Send
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatPanel;
