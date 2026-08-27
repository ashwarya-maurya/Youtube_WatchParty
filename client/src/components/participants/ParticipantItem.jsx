const ROLE_LABELS = {
  host: "HOST",
  moderator: "MODERATOR",
  participant: "PARTICIPANT",
};

const ParticipantItem = ({ participant }) => {
  const roleLabel = ROLE_LABELS[participant.role] || "PARTICIPANT";

  return (
    <li>
      <span>{participant.username}</span>
      <span>{roleLabel}</span>
    </li>
  );
};

export default ParticipantItem;