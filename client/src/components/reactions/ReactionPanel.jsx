const allowedEmojis = ["❤️", "😂", "😮", "🔥", "👏"];

const ReactionPanel = ({
  reactions,
  onSendReaction,
  reactionError,
  isConnected,
}) => {
  return (
    <section>
      <h2>Reactions</h2>

      <div>
        {allowedEmojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSendReaction(emoji)}
            disabled={!isConnected}
          >
            {emoji}
          </button>
        ))}
      </div>

      {reactionError && <p>{reactionError}</p>}

      <div>
        {reactions.map((reaction) => (
          <span key={reaction.id}>
            {reaction.emoji} {reaction.username}
          </span>
        ))}
      </div>
    </section>
  );
};

export default ReactionPanel;
