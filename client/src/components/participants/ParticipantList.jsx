import ParticipantItem from "./ParticipantItem";

const ParticipantList = ({
  participants,
  isHost,
  localSocketId,
  onAssignRole,
  onRemoveParticipant,
}) => {
  return (
    <section>
      <h2>Participants</h2>

      {participants.length === 0 ? (
        <p>No participants loaded yet.</p>
      ) : (
        <ul>
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
