import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../services/socketService";
import SOCKET_EVENTS from "../constants/socketEvents";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeMessage = location.state?.message;

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState(location.state?.prefilledRoomId || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <main className="home-page">
      <section className="home-card">
        <div className="home-intro">
          <p className="eyebrow">REAL-TIME WATCHING</p>
          <h1>YouTube Watch Party</h1>
          <p className="home-description">
            Create a room, invite your friends, and watch together in sync.
          </p>
        </div>

        {routeMessage && (
          <p className="status-message home-feedback" role="status">
            {routeMessage}
          </p>
        )}

        <section className="form-section">
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

        <section className="form-section action-section">
          <button
            className="primary-action"
            type="button"
            onClick={handleCreateRoom}
            disabled={isSubmitting}
          >
            Create Room
          </button>
        </section>

        <section className="join-section">
          <div className="join-section-heading">
            <span />
            <p>or join an existing room</p>
            <span />
          </div>

          <label htmlFor="roomId">Room Code</label>
          <input
            id="roomId"
            type="text"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            disabled={isSubmitting}
            placeholder="Enter room code"
          />

          <button
            className="secondary-action"
            type="button"
            onClick={handleJoinRoom}
            disabled={isSubmitting}
          >
            Join Room
          </button>
        </section>

        {error && (
          <p className="error-message home-feedback" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
};

export default HomePage;
