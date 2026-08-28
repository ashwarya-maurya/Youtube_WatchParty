import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../services/socketService";
import SOCKET_EVENTS from "../constants/socketEvents";

const HomePage = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const routeMessage = location.state?.message;

  const handleCreateRoom = () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter your name before creating a room.");
      return;
    }

    if (!socket.connected) {
      setError(
        "Connection is not ready yet. Please wait a moment and try again.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    socket.emit(
      SOCKET_EVENTS.CREATE_ROOM,
      { username: trimmedUsername },
      (acknowledgement) => {
        setIsSubmitting(false);

        if (!acknowledgement?.success) {
          setError(acknowledgement?.error || "Could not create the room.");
          return;
        }

        navigate(`/room/${acknowledgement.roomId}`, {
          state: {
            participant: acknowledgement.participant,
          },
        });
      },
    );
  };

  const handleJoinRoom = () => {
    const trimmedUsername = username.trim();
    const normalizedRoomId = roomId.trim().toUpperCase();

    if (!trimmedUsername || !normalizedRoomId) {
      setError("Please enter your name and a room code before joining.");
      return;
    }

    if (!socket.connected) {
      setError(
        "Connection is not ready yet. Please wait a moment and try again.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    socket.emit(
      SOCKET_EVENTS.JOIN_ROOM,
      {
        username: trimmedUsername,
        roomId: normalizedRoomId,
      },
      (acknowledgement) => {
        setIsSubmitting(false);

        if (!acknowledgement?.success) {
          setError(acknowledgement?.error || "Could not join the room.");
          return;
        }

        navigate(`/room/${acknowledgement.roomId}`, {
          state: {
            participant: acknowledgement.participant,
            participants: acknowledgement.participants,
            syncState: acknowledgement.syncState,
          },
        });
      },
    );
  };

  return (
    <main>
      <h1>YouTube Watch Party</h1>
      {routeMessage && (
        <p className="status-message" role="status">
          {routeMessage}
        </p>
      )}
      <p>Create or join a watch party here later.</p>

      <section>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={isSubmitting}
          placeholder="Enter your name"
        />
      </section>

      <section>
        <button
          type="button"
          onClick={handleCreateRoom}
          disabled={isSubmitting}
        >
          Create Room
        </button>
      </section>

      <section>
        <label htmlFor="roomId">Room Code</label>
        <input
          id="roomId"
          type="text"
          value={roomId}
          onChange={(event) => setRoomId(event.target.value)}
          disabled={isSubmitting}
          placeholder="Enter room code"
        />

        <button type="button" onClick={handleJoinRoom} disabled={isSubmitting}>
          Join Room
        </button>
      </section>

      {routeMessage && <p role="status">{routeMessage}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  );
};

export default HomePage;
