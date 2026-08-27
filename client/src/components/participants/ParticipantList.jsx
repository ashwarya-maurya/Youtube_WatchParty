import ParticipantItem from "./ParticipantItem";

const ParticipantList = ({ participants }) => {
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
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default ParticipantList;