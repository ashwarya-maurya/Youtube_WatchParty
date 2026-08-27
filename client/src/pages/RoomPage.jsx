import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import ParticipantList from "../components/participants/ParticipantList";
import socket from "../services/socketService";
import SOCKET_EVENTS from "../constants/socketEvents";
import YouTubePlayer from "../components/video/YoutubePlayer";
import VideoUrlForm from "../components/video/VideoUrlForm";

const RoomPage = () => {
  const { roomId } = useParams();
  const location = useLocation();

  const navigationState = location.state;
  const initialParticipant = navigationState?.participant;

  const initialParticipants =
    navigationState?.participants ||
    (initialParticipant ? [initialParticipant] : []);

  const [participants, setParticipants] = useState(initialParticipants);
  const [connectionStatus, setConnectionStatus] = useState(
    socket.connected ? "Connected" : "Disconnected",
  );

  const [videoError, setVideoError] = useState("");

  const localParticipant = useMemo(() => {
    if (!socket.id) {
      return initialParticipant || null;
    }

    return (
      participants.find((participant) => participant.socketId === socket.id) ||
      initialParticipant ||
      null
    );
  }, [participants, initialParticipant]);

  const canControlPlayback =
    localParticipant?.role === "host" || localParticipant?.role === "moderator";

  const roomUrl = window.location.href;

  const initialVideoId = location.state?.syncState?.videoId || "";
  const [videoId, setVideoId] = useState(initialVideoId);

  const handleVideoSelected = (selectedVideoId) => {
    if (!socket.connected) {
      setVideoError("Socket is not connected. Please refresh and try again.");
      return;
    }

    socket.emit(
      SOCKET_EVENTS.CHANGE_VIDEO,
      { videoId: selectedVideoId },
      (response) => {
        if (!response?.success) {
          setVideoError(response?.error || "Failed to change video.");
        }
      },
    );
  };

  useEffect(() => {
    const handleParticipantsUpdated = (updatedParticipants) => {
      setParticipants(updatedParticipants);
    };

    socket.on(SOCKET_EVENTS.PARTICIPANTS_UPDATED, handleParticipantsUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.PARTICIPANTS_UPDATED, handleParticipantsUpdated);
    };
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus("Connected");
    };

    const handleDisconnect = () => {
      setConnectionStatus("Disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleVideoChanged = (playbackState) => {
      setVideoId(playbackState.videoId);
      setVideoError("");
    };

    socket.on(SOCKET_EVENTS.VIDEO_CHANGED, handleVideoChanged);

    return () => {
      socket.off(SOCKET_EVENTS.VIDEO_CHANGED, handleVideoChanged);
    };
  }, []);

  return (
    <main>
      <header>
        <h1>Watch Party Room</h1>
        <p>Room code: {roomId}</p>
        <p>Connection: {connectionStatus}</p>
        <p>Share link: {roomUrl}</p>

        {localParticipant ? (
          <p>
            Signed in as {localParticipant.username} ({localParticipant.role})
          </p>
        ) : (
          <p>
            You opened this room page directly. Create or join a room from the
            home page first.
          </p>
        )}
      </header>

      <section>
        <h2>Video</h2>

        {canControlPlayback ? (
          <VideoUrlForm onVideoSelected={handleVideoSelected} />
        ) : (
          <p>Only the Host or a Moderator can change the video.</p>
        )}

        {videoError && <p>{videoError}</p>}

        <YouTubePlayer videoId={videoId} />
      </section>

      <aside>
        <ParticipantList participants={participants} />

        <section>
          <h2>Chat</h2>
          <p>Chat placeholder</p>
        </section>

        <section>
          <h2>Reactions</h2>
          <p>Reactions placeholder</p>
        </section>
      </aside>
    </main>
  );
};

export default RoomPage;
