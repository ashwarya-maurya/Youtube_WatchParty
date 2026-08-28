const allowedEmojis = ["❤️", "😂", "😮", "🔥", "👏"];

const ReactionPanel = ({
  reactions,
  onSendReaction,
  reactionError,
  isConnected,
}) => {
  return (
    <section className="reactions-panel">
      <h2>Reactions</h2>

      <div className="reaction-buttons">
        {allowedEmojis.map((emoji) => (
          <button
            className="reaction-button"
            key={emoji}
            type="button"
            onClick={() => onSendReaction(emoji)}
            disabled={!isConnected}
          >
            {emoji}
          </button>
        ))}
      </div>

      {reactionError && (
        <p className="error-message" role="alert">
          {reactionError}
        </p>
      )}

      <div className="active-reactions">
        {reactions.map((reaction) => (
          <span className="reaction-pill" key={reaction.id}>
            {reaction.emoji} {reaction.username}
          </span>
        ))}
      </div>
    </section>
  );
};

export default ReactionPanel;
