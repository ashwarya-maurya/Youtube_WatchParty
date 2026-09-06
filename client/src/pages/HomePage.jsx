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
        <h1 className="home-brand">YouTube Watch Party</h1>

        {routeMessage && (
          <p className="status-message home-feedback" role="status">
            {routeMessage}
          </p>
        )}

        <div className="home-action-groups">
          <section className="home-action-group">
            <div className="home-action-heading">
              <h2>Create Room</h2>
            </div>

            <label htmlFor="create-username">Username</label>
            <input
              id="create-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isSubmitting}
              placeholder="Enter your name"
            />

            <button
              className="primary-action"
              type="button"
              onClick={handleCreateRoom}
              disabled={isSubmitting}
            >
              Create Room
            </button>
          </section>

          <section className="home-action-group">
            <div className="home-action-heading">
              <h2>Join Room</h2>
            </div>

            <label htmlFor="join-username">Username</label>
            <input
              id="join-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isSubmitting}
              placeholder="Enter your name"
            />

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
        </div>

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
