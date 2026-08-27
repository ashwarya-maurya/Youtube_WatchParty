const SOCKET_EVENTS = {
  CREATE_ROOM: "create_room",
  PARTICIPANTS_UPDATED: "participants_updated",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  ROOM_CLOSED: "room_closed",
  CHANGE_VIDEO: "change_video",
  VIDEO_CHANGED: "video_changed",
  SYNC_STATE: "sync_state",
  PLAY: "play",
  PAUSE: "pause",
  PLAYBACK_UPDATED: "playback_updated",
  SEEK: "seek",
  ASSIGN_ROLE: "assign_role",
  REMOVE_PARTICIPANT: "remove_participant",
  REMOVED_FROM_ROOM: "removed_from_room",
  SEND_MESSAGE: "send_message",
  CHAT_MESSAGE: "chat_message",
  SEND_REACTION: "send_reaction",
  REACTION_RECEIVED: "reaction_received",
};

module.exports = SOCKET_EVENTS;