const SOCKET_EVENTS = {
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  PARTICIPANTS_UPDATED: "participants_updated",
  ROOM_CLOSED: "room_closed",
  REMOVED_FROM_ROOM: "removed_from_room",
  CHANGE_VIDEO: "change_video",
  VIDEO_CHANGED: "video_changed",
  PLAY: "play",
  PAUSE: "pause",
  PLAYBACK_UPDATED: "playback_updated",
  SEEK: "seek",
  ASSIGN_ROLE: "assign_role",
  REMOVE_PARTICIPANT: "remove_participant",
  SEND_MESSAGE: "send_message",
  CHAT_MESSAGE: "chat_message",
  SEND_REACTION: "send_reaction",
  REACTION_RECEIVED: "reaction_received",
};

export default SOCKET_EVENTS;