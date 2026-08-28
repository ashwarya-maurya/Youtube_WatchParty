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
    <section>
      <h2>Chat</h2>

      {chatError && <p>{chatError}</p>}
      {validationError && <p>{validationError}</p>}

      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li key={message.id}>
              <p>{message.username}</p>
              <p>{message.text}</p>
              <time dateTime={message.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="chat-message">Message</label>

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
      </form>
    </section>
  );
};

export default ChatPanel;