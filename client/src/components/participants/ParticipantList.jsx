import ParticipantItem from "./ParticipantItem";

const ParticipantList = ({
  participants,
  isHost,
  localSocketId,
  onAssignRole,
  onRemoveParticipant,
}) => {
  return (
    <section className="participant-panel">
      <h2>Participants</h2>

      {participants.length === 0 ? (
        <p className="status-message" role="status">
          No participants loaded yet.
        </p>
      ) : (
        <ul className="participant-list">
          {participants.map((participant) => (
            <ParticipantItem
              key={participant.socketId}
              participant={participant}
              isHost={isHost}
              localSocketId={localSocketId}
              onAssignRole={onAssignRole}
              onRemoveParticipant={onRemoveParticipant}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default ParticipantList;
