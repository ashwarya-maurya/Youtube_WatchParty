const ROLE_LABELS = {
  host: "HOST",
  moderator: "MODERATOR",
  participant: "PARTICIPANT",
};

const ParticipantItem = ({
  participant,
  isHost,
  localSocketId,
  onAssignRole,
  onRemoveParticipant,
}) => {
  const roleLabel = ROLE_LABELS[participant.role] || "PARTICIPANT";
  const isSelf = participant.socketId === localSocketId;

  const canPromote = isHost && participant.role === "participant";
  const canRemove =
    isHost &&
    !isSelf &&
    (participant.role === "participant" || participant.role === "moderator");

  return (
    <li className="participant-item">
      <span className="participant-name">{participant.username}</span>
      <span className="role-badge">{roleLabel}</span>

      {(canPromote || canRemove) && (
        <div className="participant-actions">
          {canPromote && (
            <button
              type="button"
              onClick={() => onAssignRole(participant.socketId)}
            >
              Make Moderator
            </button>
          )}

          {canRemove && (
            <button
              type="button"
              onClick={() => onRemoveParticipant(participant.socketId)}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </li>
  );
};

export default ParticipantItem;
