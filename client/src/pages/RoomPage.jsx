import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ParticipantList from "../components/participants/ParticipantList";
import socket from "../services/socketService";
import SOCKET_EVENTS from "../constants/socketEvents";
import YouTubePlayer from "../components/video/YoutubePlayer";
import VideoUrlForm from "../components/video/VideoUrlForm";
import ChatPanel from "../components/chat/ChatPanel";
import ReactionPanel from "../components/reactions/ReactionPanel";
const getPlaybackTimestamp = () => Date.now();

const RoomPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const youtubePlayerRef = useRef(null);
  const remotePlaybackActionRef = useRef(null);
  const isVideoChangePendingRef = useRef(false);
  const suppressSeekDetectionUntilRef = useRef(0);
  const hasAppliedInitialSyncRef = useRef(false);
  const isPlayerPlayingRef = useRef(false);
  const reactionRemovalTimersRef = useRef({});
  const isLeavingRef = useRef(false);

  const handlePlayerReady = (player) => {
    youtubePlayerRef.current = player;

    if (hasAppliedInitialSyncRef.current) {
      return;
    }

    if (!initialSyncState?.videoId) {
      return;
    }

    hasAppliedInitialSyncRef.current = true;
    suppressSeekDetectionUntilRef.current = getPlaybackTimestamp() + 1500;

    player.seekTo(initialSyncState.currentTime || 0, true);

    if (initialSyncState.isPlaying) {
      remotePlaybackActionRef.current = "play";
      player.playVideo();
    } else {
      remotePlaybackActionRef.current = "pause";
      player.pauseVideo();
    }
  };

  const handlePlayerStateChange = (event) => {
    const player = youtubePlayerRef.current;

    if (!player) {
      return;
    }

    const playerAction =
      event.data === 1 ? "play" : event.data === 2 ? "pause" : null;

    if (!playerAction) {
      return;
    }

    const remoteAction = remotePlaybackActionRef.current;

    if (remoteAction) {
      if (playerAction === remoteAction) {
        remotePlaybackActionRef.current = null;
        isVideoChangePendingRef.current = false;
        isPlayerPlayingRef.current = remoteAction === "play";
        return;
      }

      if (remoteAction === "play") {
        player.playVideo();
      } else {
        player.pauseVideo();
      }

      return;
    }

    isVideoChangePendingRef.current = false;

    const isPlaying = playerAction === "play";

    if (isPlayerPlayingRef.current === isPlaying) {
      return;
    }

    isPlayerPlayingRef.current = isPlaying;

    if (!canControlPlayback) {
      return;
    }

    if (!socket.connected) {
      setVideoError("Socket is not connected. Please refresh and try again.");
      return;
    }

    const currentTime = player.getCurrentTime();
    const socketEvent =
      playerAction === "play" ? SOCKET_EVENTS.PLAY : SOCKET_EVENTS.PAUSE;
    const fallbackError =
      playerAction === "play"
        ? "Failed to play video."
        : "Failed to pause video.";

    socket.emit(socketEvent, { currentTime }, (response) => {
      if (!response?.success) {
        setVideoError(response?.error || fallbackError);
      }
    });
  };

  const navigationState = location.state;
  const initialSyncState = navigationState?.syncState || null;
  const initialParticipant = navigationState?.participant;

  const initialParticipants =
    navigationState?.participants ||
    (initialParticipant ? [initialParticipant] : []);

  const [participants, setParticipants] = useState(initialParticipants);
  const [connectionStatus, setConnectionStatus] = useState(
    socket.connected ? "Connected" : "Disconnected",
  );

  const [videoError, setVideoError] = useState("");
  const [participantActionError, setParticipantActionError] = useState("");

  const [messages, setMessages] = useState([]);
  const [chatError, setChatError] = useState("");

  const [reactions, setReactions] = useState([]);
  const [reactionError, setReactionError] = useState("");

  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  useEffect(() => {
    if (connectionStatus !== "Connected") {
      return;
    }

    if (!initialParticipant) {
      navigate("/", {
        replace: true,
        state: {
          prefilledRoomId: roomId,
          message: `Enter a username to join room ${roomId}.`,
        },
      });
      return;
    }

    const hasCurrentRoomSession = initialParticipant.socketId === socket.id;

    if (hasCurrentRoomSession) {
      return;
    }

    navigate("/not-found", {
      replace: true,
      state: {
        message: "This room no longer exists or is unavailable.",
      },
    });
  }, [connectionStatus, initialParticipant, navigate, roomId]);

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
  const isHost = localParticipant?.role === "host";

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

  const handleAssignRole = (targetSocketId) => {
    if (!socket.connected) {
      setParticipantActionError(
        "Socket is not connected. Please refresh and try again.",
      );
      return;
    }

    socket.emit(SOCKET_EVENTS.ASSIGN_ROLE, { targetSocketId }, (response) => {
      if (!response?.success) {
        setParticipantActionError(
          response?.error || "Failed to make participant a moderator.",
        );
      }
    });
  };

  const handleRemoveParticipant = (targetSocketId) => {
    if (!socket.connected) {
      setParticipantActionError(
        "Socket is not connected. Please refresh and try again.",
      );
      return;
    }

    socket.emit(
      SOCKET_EVENTS.REMOVE_PARTICIPANT,
      { targetSocketId },
      (response) => {
        if (!response?.success) {
          setParticipantActionError(
            response?.error || "Failed to remove participant.",
          );
        }
      },
    );
  };

  const handleLeaveRoom = () => {
    if (!socket.connected) {
      setLeaveError("Socket is not connected. Please refresh and try again.");
      return;
    }

    setLeaveError("");
    setIsLeaving(true);
    isLeavingRef.current = true;

    socket.emit(SOCKET_EVENTS.LEAVE_ROOM, (response) => {
      if (!response?.success) {
        isLeavingRef.current = false;
        setIsLeaving(false);
        setLeaveError(response?.error || "Failed to leave the room.");
        return;
      }

      navigate("/", {
        replace: true,
        state: {
          message: response.roomClosed
            ? "You left the room. The room was closed."
            : "You left the room.",
        },
      });
    });
  };

  const handleSendMessage = (text) => {
    if (!socket.connected) {
      setChatError("Socket is not connected. Please refresh and try again.");
      return;
    }

    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { text }, (response) => {
      if (!response?.success) {
        setChatError(response?.error || "Failed to send message.");
      }
    });
  };

  const handleSendReaction = (emoji) => {
    if (!socket.connected) {
      setReactionError(
        "Socket is not connected. Please refresh and try again.",
      );
      return;
    }

    socket.emit(SOCKET_EVENTS.SEND_REACTION, { emoji }, (response) => {
      if (!response?.success) {
        setReactionError(response?.error || "Failed to send reaction.");
      }
    });
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
      isVideoChangePendingRef.current = true;
      isPlayerPlayingRef.current = false;
      suppressSeekDetectionUntilRef.current = getPlaybackTimestamp() + 1500;

      setVideoId(playbackState.videoId);
      setVideoError("");
    };

    socket.on(SOCKET_EVENTS.VIDEO_CHANGED, handleVideoChanged);

    return () => {
      socket.off(SOCKET_EVENTS.VIDEO_CHANGED, handleVideoChanged);
    };
  }, []);

  useEffect(() => {
    const handlePlaybackUpdated = ({ action, playbackState }) => {
      const player = youtubePlayerRef.current;

      if (!player || !playbackState?.videoId) {
        return;
      }

      setVideoId(playbackState.videoId);
      setVideoError("");

      if (action === "play") {
        remotePlaybackActionRef.current = "play";
        suppressSeekDetectionUntilRef.current = getPlaybackTimestamp() + 1500;

        player.seekTo(playbackState.currentTime, true);
        player.playVideo();
        return;
      }

      if (action === "pause") {
        remotePlaybackActionRef.current = "pause";
        suppressSeekDetectionUntilRef.current = getPlaybackTimestamp() + 1500;

        player.seekTo(playbackState.currentTime, true);
        player.pauseVideo();
        return;
      }

      if (action === "seek") {
        suppressSeekDetectionUntilRef.current = getPlaybackTimestamp() + 1500;

        player.seekTo(playbackState.currentTime, true);
      }
    };

    socket.on(SOCKET_EVENTS.PLAYBACK_UPDATED, handlePlaybackUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.PLAYBACK_UPDATED, handlePlaybackUpdated);
    };
  }, []);

  useEffect(() => {
    if (!canControlPlayback) {
      return;
    }

    let previousTime = null;
    let previousObservedAt = null;

    const intervalId = setInterval(() => {
      const player = youtubePlayerRef.current;

      if (!player) {
        return;
      }

      if (!socket.connected) {
        previousTime = null;
        previousObservedAt = null;
        return;
      }

      const now = getPlaybackTimestamp();
      const currentTime = player.getCurrentTime();

      if (previousTime === null || previousObservedAt === null) {
        previousTime = currentTime;
        previousObservedAt = now;
        return;
      }

      const elapsedSeconds = (now - previousObservedAt) / 1000;
      const expectedTime = isPlayerPlayingRef.current
        ? previousTime + elapsedSeconds
        : previousTime;
      const timeDifference = Math.abs(currentTime - expectedTime);

      previousTime = currentTime;
      previousObservedAt = now;

      if (now < suppressSeekDetectionUntilRef.current) {
        return;
      }

      if (timeDifference <= 2) {
        return;
      }

      socket.emit(SOCKET_EVENTS.SEEK, { currentTime }, (response) => {
        if (!response?.success) {
          setVideoError(response?.error || "Failed to seek video.");
        }
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [canControlPlayback]);

  useEffect(() => {
    const handleRemovedFromRoom = ({ message }) => {
      const removalMessage = message || "You were removed from the room.";

      navigate("/", {
        replace: true,
        state: { message: removalMessage },
      });
    };

    socket.on(SOCKET_EVENTS.REMOVED_FROM_ROOM, handleRemovedFromRoom);

    return () => {
      socket.off(SOCKET_EVENTS.REMOVED_FROM_ROOM, handleRemovedFromRoom);
    };
  }, [navigate]);

  useEffect(() => {
    const handleChatMessage = (message) => {
      setMessages((currentMessages) => [...currentMessages, message]);
      setChatError("");
    };

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
    };
  }, []);

  useEffect(() => {
    const handleReactionReceived = (reaction) => {
      setReactions((currentReactions) => [...currentReactions, reaction]);
      setReactionError("");

      const timerId = setTimeout(() => {
        setReactions((currentReactions) =>
          currentReactions.filter(
            (currentReaction) => currentReaction.id !== reaction.id,
          ),
        );

        delete reactionRemovalTimersRef.current[reaction.id];
      }, 3000);

      reactionRemovalTimersRef.current[reaction.id] = timerId;
    };

    socket.on(SOCKET_EVENTS.REACTION_RECEIVED, handleReactionReceived);

    return () => {
      socket.off(SOCKET_EVENTS.REACTION_RECEIVED, handleReactionReceived);

      Object.values(reactionRemovalTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });

      reactionRemovalTimersRef.current = {};
    };
  }, []);

  useEffect(() => {
    const handleRoomClosed = ({ message }) => {
      if (isLeavingRef.current) {
        return;
      }

      const roomClosedMessage =
        message || "The host left. This room has been closed.";

      navigate("/", {
        replace: true,
        state: { message: roomClosedMessage },
      });
    };

    socket.on(SOCKET_EVENTS.ROOM_CLOSED, handleRoomClosed);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CLOSED, handleRoomClosed);
    };
  }, [navigate]);

  return (
    <main className="room-page">
      <header className="room-header">
        <div className="room-title-row">
          <div>
            <p className="eyebrow">WATCH PARTY ROOM</p>
          </div>

          {localParticipant && (
            <p className="room-user-summary">
              <span>Signed in as : {localParticipant.username}</span>
            </p>
          )}
        </div>

        <div className="room-details">
          <label className="room-meta room-copy-control room-code-control">
            <span className="room-meta-label">Room code</span>
            <input
              className="room-copy-field"
              type="text"
              value={roomId}
              readOnly
              aria-label="Room code"
            />
          </label>

          <label className="room-meta room-copy-control room-share-control">
            <span className="room-meta-label">Share link</span>
            <input
              className="room-copy-field"
              type="text"
              value={roomUrl}
              readOnly
              aria-label="Room share link"
            />
          </label>

          {localParticipant && (
            <button
              className="leave-room-button"
              type="button"
              onClick={handleLeaveRoom}
              disabled={isLeaving}
            >
              {isLeaving ? "Leaving..." : "Leave Room"}
            </button>
          )}
        </div>

        {leaveError && (
          <p className="error-message" role="alert">
            {leaveError}
          </p>
        )}

        {!localParticipant && (
          <p className="status-message room-direct-access-message">
            You opened this room page directly. Create or join a room from the
            home page first.
          </p>
        )}
      </header>

      <div className="room-layout">
        <section className="video-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SHARED PLAYER</p>
              <h2>Video</h2>
            </div>
          </div>

          {canControlPlayback ? (
            <VideoUrlForm onVideoSelected={handleVideoSelected} />
          ) : (
            <p className="status-message" role="status">
              Only the Host or a Moderator can change the video.
            </p>
          )}

          {videoError && (
            <p className="error-message" role="alert">
              {videoError}
            </p>
          )}

          <YouTubePlayer
            videoId={videoId}
            onPlayerReady={handlePlayerReady}
            onPlayerStateChange={handlePlayerStateChange}
            canControlPlayback={canControlPlayback}
          />

          <div className="video-reactions">
            <ReactionPanel
              reactions={reactions}
              onSendReaction={handleSendReaction}
              reactionError={reactionError}
              isConnected={socket.connected}
            />
          </div>
        </section>

        <aside className="sidebar">
          <ParticipantList
            participants={participants}
            isHost={isHost}
            localSocketId={socket.id}
            onAssignRole={handleAssignRole}
            onRemoveParticipant={handleRemoveParticipant}
          />

          {participantActionError && (
            <p className="error-message" role="alert">
              {participantActionError}
            </p>
          )}

          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            chatError={chatError}
            isConnected={socket.connected}
          />
        </aside>
      </div>
    </main>
  );
};

export default RoomPage;
